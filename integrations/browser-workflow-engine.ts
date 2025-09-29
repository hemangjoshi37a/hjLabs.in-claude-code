import { mcpBrowserClient, MCPBrowserClient } from './mcp-browser-client';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

export interface WorkflowStep {
  id: string;
  type: 'navigate' | 'click' | 'type' | 'scroll' | 'wait' | 'screenshot' | 'evaluate' | 'extract' | 'verify';
  description: string;
  params: {
    url?: string;
    selector?: string;
    text?: string;
    script?: string;
    timeout?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    amount?: number;
    extractType?: 'text' | 'html' | 'attribute' | 'url';
    attribute?: string;
    expected?: string;
  };
  screenshot?: boolean;
  onSuccess?: string; // Next step ID
  onFailure?: string; // Alternative step ID or 'abort'
}

export interface WorkflowResult {
  stepId: string;
  success: boolean;
  duration: number;
  screenshot?: string;
  extractedData?: any;
  error?: string;
  pageInfo?: {
    title: string;
    url: string;
  };
}

export interface BrowserWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: Date;
  lastRun?: Date;
  totalRuns: number;
  successRate: number;
}

export interface WorkflowExecution {
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  results: WorkflowResult[];
  finalScreenshot?: string;
  success: boolean;
  duration: number;
  screenshots: string[];
  extractedData: Record<string, any>;
}

export class BrowserWorkflowEngine {
  private client: MCPBrowserClient;
  private workflows: Map<string, BrowserWorkflow> = new Map();
  private executions: WorkflowExecution[] = [];
  private workflowsDir: string;
  private screenshotDir: string;

  constructor() {
    this.client = mcpBrowserClient;
    this.workflowsDir = join(process.cwd(), '.claude', 'browser-workflows');
    this.screenshotDir = join(process.cwd(), '.claude', 'screenshots');
    this.ensureDirectories();
    this.loadWorkflows();
  }

  /**
   * Create a new browser workflow from natural language description
   */
  async createWorkflowFromIntent(intent: string): Promise<BrowserWorkflow> {
    console.log('🧠 Creating workflow from intent...');
    console.log(`   📝 Intent: "${intent}"`);

    const workflow: BrowserWorkflow = {
      id: `workflow_${Date.now()}`,
      name: this.generateWorkflowName(intent),
      description: intent,
      steps: [],
      createdAt: new Date(),
      totalRuns: 0,
      successRate: 0
    };

    // Analyze intent and generate steps
    const steps = await this.analyzeIntentAndGenerateSteps(intent);
    workflow.steps = steps;

    // Save workflow
    this.workflows.set(workflow.id, workflow);
    this.saveWorkflow(workflow);

    console.log(`   ✅ Workflow created: ${workflow.name}`);
    console.log(`   📋 Steps: ${steps.length}`);

    return workflow;
  }

  /**
   * Execute a browser workflow
   */
  async executeWorkflow(workflowId: string, options: {
    headless?: boolean;
    screenshotEachStep?: boolean;
    continueOnError?: boolean;
  } = {}): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    console.log(`🚀 Executing Workflow: ${workflow.name}`);
    console.log(`   📋 Steps: ${workflow.steps.length}`);
    console.log(`   🎯 Goal: ${workflow.description}`);

    const execution: WorkflowExecution = {
      workflowId,
      startTime: new Date(),
      results: [],
      success: false,
      duration: 0,
      screenshots: [],
      extractedData: {}
    };

    // Initialize browser
    const initResult = await this.client.initialize();
    if (!initResult.success) {
      execution.success = false;
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      return execution;
    }

    let currentStepIndex = 0;

    try {
      while (currentStepIndex < workflow.steps.length) {
        const step = workflow.steps[currentStepIndex];
        console.log(`   📌 Step ${currentStepIndex + 1}/${workflow.steps.length}: ${step.description}`);

        const stepStartTime = Date.now();
        const result = await this.executeStep(step, options.screenshotEachStep || step.screenshot);
        const stepDuration = Date.now() - stepStartTime;

        result.duration = stepDuration;
        execution.results.push(result);

        if (result.screenshot) {
          execution.screenshots.push(result.screenshot);
        }

        if (result.extractedData) {
          execution.extractedData[step.id] = result.extractedData;
        }

        if (result.success) {
          console.log(`      ✅ ${step.description} completed (${stepDuration}ms)`);

          // Move to next step or follow success path
          if (step.onSuccess) {
            const nextStepIndex = workflow.steps.findIndex(s => s.id === step.onSuccess);
            currentStepIndex = nextStepIndex >= 0 ? nextStepIndex : currentStepIndex + 1;
          } else {
            currentStepIndex++;
          }
        } else {
          console.log(`      ❌ ${step.description} failed: ${result.error}`);

          if (options.continueOnError) {
            currentStepIndex++;
            continue;
          }

          // Handle failure path
          if (step.onFailure === 'abort') {
            console.log('      🛑 Workflow aborted due to step failure');
            break;
          } else if (step.onFailure) {
            const nextStepIndex = workflow.steps.findIndex(s => s.id === step.onFailure);
            currentStepIndex = nextStepIndex >= 0 ? nextStepIndex : currentStepIndex + 1;
          } else {
            break; // Default: stop on failure
          }
        }
      }

      // Take final screenshot
      const finalScreenshot = await this.client.takeScreenshot('workflow_final');
      if (finalScreenshot.success && finalScreenshot.path) {
        execution.finalScreenshot = finalScreenshot.path;
        execution.screenshots.push(finalScreenshot.path);
      }

      // Determine overall success
      const successfulSteps = execution.results.filter(r => r.success).length;
      execution.success = successfulSteps === workflow.steps.length;

      console.log(`   📊 Results: ${successfulSteps}/${workflow.steps.length} steps successful`);

    } catch (error) {
      console.error(`   💥 Workflow execution error: ${error.message}`);
      execution.success = false;
    } finally {
      // Update workflow statistics
      workflow.totalRuns++;
      workflow.lastRun = new Date();
      const previousRate = workflow.successRate;
      workflow.successRate = ((previousRate * (workflow.totalRuns - 1)) + (execution.success ? 100 : 0)) / workflow.totalRuns;

      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

      this.executions.push(execution);
      this.saveWorkflow(workflow);

      // Cleanup browser
      await this.client.close();

      console.log(`   🏁 Workflow completed in ${execution.duration}ms`);
      console.log(`   📸 Screenshots: ${execution.screenshots.length}`);
      console.log(`   💾 Data extracted: ${Object.keys(execution.extractedData).length} items`);
    }

    return execution;
  }

  /**
   * Execute individual workflow step
   */
  private async executeStep(step: WorkflowStep, takeScreenshot: boolean = false): Promise<WorkflowResult> {
    const result: WorkflowResult = {
      stepId: step.id,
      success: false,
      duration: 0
    };

    try {
      let stepResult: any;

      switch (step.type) {
        case 'navigate':
          stepResult = await this.client.navigate(step.params.url!);
          result.success = stepResult.success;
          result.error = stepResult.error;

          // Get page info after navigation
          const pageInfo = await this.client.getPageInfo();
          if (pageInfo.success) {
            result.pageInfo = { title: pageInfo.title!, url: pageInfo.url! };
          }
          break;

        case 'click':
          if (step.params.selector) {
            stepResult = await this.client.click(step.params.selector);
          } else {
            // Try to find element by description
            stepResult = await this.client.clickByDescription(step.description);
          }
          result.success = stepResult.success;
          result.error = stepResult.error;
          break;

        case 'type':
          if (step.params.selector) {
            stepResult = await this.client.type(step.params.selector, step.params.text!);
          } else {
            stepResult = await this.client.typeByDescription(step.description, step.params.text!);
          }
          result.success = stepResult.success;
          result.error = stepResult.error;
          break;

        case 'scroll':
          stepResult = await this.client.scroll(
            step.params.direction || 'down',
            step.params.amount || 500
          );
          result.success = stepResult.success;
          result.error = stepResult.error;
          break;

        case 'wait':
          await new Promise(resolve => setTimeout(resolve, step.params.timeout || 1000));
          result.success = true;
          break;

        case 'screenshot':
          stepResult = await this.client.takeScreenshot(`step_${step.id}`);
          result.success = stepResult.success;
          result.screenshot = stepResult.path;
          result.error = stepResult.error;
          break;

        case 'evaluate':
          stepResult = await this.client.evaluate(step.params.script!);
          result.success = stepResult.success;
          result.extractedData = stepResult.result;
          result.error = stepResult.error;
          break;

        case 'extract':
          stepResult = await this.extractData(step);
          result.success = stepResult.success;
          result.extractedData = stepResult.data;
          result.error = stepResult.error;
          break;

        case 'verify':
          stepResult = await this.verifyCondition(step);
          result.success = stepResult.success;
          result.error = stepResult.error;
          break;

        default:
          result.error = `Unknown step type: ${step.type}`;
      }

      // Take screenshot if requested
      if (takeScreenshot && step.type !== 'screenshot') {
        const screenshot = await this.client.takeScreenshot(`step_${step.id}`);
        if (screenshot.success && screenshot.path) {
          result.screenshot = screenshot.path;
        }
      }

    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Extract data from page based on step configuration
   */
  private async extractData(step: WorkflowStep): Promise<{ success: boolean; data?: any; error?: string }> {
    const { selector, extractType, attribute } = step.params;

    try {
      let script: string;

      switch (extractType) {
        case 'text':
          script = `document.querySelector('${selector}')?.textContent?.trim()`;
          break;
        case 'html':
          script = `document.querySelector('${selector}')?.innerHTML`;
          break;
        case 'attribute':
          script = `document.querySelector('${selector}')?.getAttribute('${attribute}')`;
          break;
        case 'url':
          script = `window.location.href`;
          break;
        default:
          script = `document.querySelector('${selector}')?.textContent?.trim()`;
      }

      const result = await this.client.evaluate(script);

      if (result.success) {
        return { success: true, data: result.result };
      } else {
        return { success: false, error: result.error };
      }

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify page condition
   */
  private async verifyCondition(step: WorkflowStep): Promise<{ success: boolean; error?: string }> {
    const { selector, expected, extractType } = step.params;

    try {
      const extractResult = await this.extractData(step);

      if (!extractResult.success) {
        return { success: false, error: `Failed to extract data for verification: ${extractResult.error}` };
      }

      const actualValue = String(extractResult.data || '').trim();
      const expectedValue = String(expected || '').trim();

      const matches = actualValue.includes(expectedValue) || actualValue === expectedValue;

      if (!matches) {
        return {
          success: false,
          error: `Verification failed. Expected: "${expectedValue}", Got: "${actualValue}"`
        };
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze natural language intent and generate workflow steps
   */
  private async analyzeIntentAndGenerateSteps(intent: string): Promise<WorkflowStep[]> {
    const steps: WorkflowStep[] = [];
    const lowerIntent = intent.toLowerCase();

    // Extract URLs
    const urlMatch = intent.match(/(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
    const url = urlMatch ? (urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`) : null;

    // Navigation step
    if (url) {
      steps.push({
        id: `nav_${Date.now()}`,
        type: 'navigate',
        description: `Navigate to ${url}`,
        params: { url },
        screenshot: true
      });
    }

    // Common interaction patterns
    if (lowerIntent.includes('click') || lowerIntent.includes('press')) {
      const clickTarget = this.extractTarget(intent, ['click', 'press']);
      steps.push({
        id: `click_${Date.now()}`,
        type: 'click',
        description: `Click ${clickTarget}`,
        params: { selector: clickTarget },
        screenshot: true
      });
    }

    if (lowerIntent.includes('type') || lowerIntent.includes('enter') || lowerIntent.includes('fill')) {
      const textMatch = intent.match(/(?:type|enter|fill)[\s"']*([^"'\n]+)["']?\s*(?:into|in)\s*["']?([^"'\n]+)["']?/i);
      if (textMatch) {
        steps.push({
          id: `type_${Date.now()}`,
          type: 'type',
          description: `Type "${textMatch[1].trim()}" into ${textMatch[2].trim()}`,
          params: { text: textMatch[1].trim(), selector: textMatch[2].trim() },
          screenshot: true
        });
      }
    }

    if (lowerIntent.includes('screenshot') || lowerIntent.includes('capture')) {
      steps.push({
        id: `screenshot_${Date.now()}`,
        type: 'screenshot',
        description: 'Take screenshot of current page',
        params: {}
      });
    }

    if (lowerIntent.includes('scroll')) {
      const direction = lowerIntent.includes('up') ? 'up' : 'down';
      steps.push({
        id: `scroll_${Date.now()}`,
        type: 'scroll',
        description: `Scroll ${direction}`,
        params: { direction, amount: 500 },
        screenshot: true
      });
    }

    // Extract data patterns
    if (lowerIntent.includes('extract') || lowerIntent.includes('get') || lowerIntent.includes('find')) {
      const extractTarget = this.extractTarget(intent, ['extract', 'get', 'find']);
      steps.push({
        id: `extract_${Date.now()}`,
        type: 'extract',
        description: `Extract ${extractTarget}`,
        params: { selector: extractTarget, extractType: 'text' },
        screenshot: true
      });
    }

    // Default steps if none identified
    if (steps.length === 0) {
      if (url) {
        steps.push({
          id: `default_screenshot_${Date.now()}`,
          type: 'screenshot',
          description: 'Take screenshot after navigation',
          params: {}
        });
      } else {
        steps.push({
          id: `default_nav_${Date.now()}`,
          type: 'navigate',
          description: 'Navigate to example page',
          params: { url: 'https://example.com' },
          screenshot: true
        });
      }
    }

    return steps;
  }

  /**
   * Extract target element from natural language
   */
  private extractTarget(text: string, actionWords: string[]): string {
    for (const word of actionWords) {
      const regex = new RegExp(`${word}\\s+(?:on\\s+)?["']?([^"'\\n]+)["']?`, 'i');
      const match = text.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return 'button'; // default fallback
  }

  /**
   * Generate workflow name from intent
   */
  private generateWorkflowName(intent: string): string {
    const words = intent.split(' ').slice(0, 5);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(id: string): BrowserWorkflow | undefined {
    return this.workflows.get(id);
  }

  /**
   * List all workflows
   */
  listWorkflows(): BrowserWorkflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get execution history
   */
  getExecutionHistory(workflowId?: string): WorkflowExecution[] {
    if (workflowId) {
      return this.executions.filter(e => e.workflowId === workflowId);
    }
    return this.executions;
  }

  /**
   * Save workflow to disk
   */
  private saveWorkflow(workflow: BrowserWorkflow): void {
    const filePath = join(this.workflowsDir, `${workflow.id}.json`);
    writeFileSync(filePath, JSON.stringify(workflow, null, 2));
  }

  /**
   * Load workflows from disk
   */
  private loadWorkflows(): void {
    if (!existsSync(this.workflowsDir)) return;

    try {
      const files = require('fs').readdirSync(this.workflowsDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = join(this.workflowsDir, file);
          const workflow = JSON.parse(readFileSync(filePath, 'utf8')) as BrowserWorkflow;
          this.workflows.set(workflow.id, workflow);
        }
      }
      console.log(`📚 Loaded ${this.workflows.size} browser workflows`);
    } catch (error) {
      console.log(`⚠️ Error loading workflows: ${error.message}`);
    }
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectories(): void {
    [this.workflowsDir, this.screenshotDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }
}

export const browserWorkflowEngine = new BrowserWorkflowEngine();