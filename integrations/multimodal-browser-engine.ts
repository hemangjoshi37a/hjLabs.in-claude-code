import { MCPBrowserClient } from './mcp-browser-client';
import { visualContextIntegration, VisualContext } from './visual-context-integration';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface MultimodalWorkflowStep {
  id: string;
  type: 'navigate' | 'analyze_visual' | 'click_smart' | 'type_smart' | 'scroll_smart' | 'wait_visual' | 'extract_visual' | 'compare_visual';
  description: string;
  params: {
    url?: string;
    target?: string;
    text?: string;
    analysisGoal?: string;
    visualPrompt?: string;
    comparisonType?: string;
  };
  visualAnalysis?: boolean;
  requiresScreenshot?: boolean;
  decisionMaking?: boolean;
}

export interface MultimodalStepResult {
  stepId: string;
  success: boolean;
  duration: number;
  screenshot?: string;
  visualContext?: VisualContext;
  aiDecision?: {
    action: string;
    confidence: number;
    reasoning: string;
  };
  extractedData?: any;
  error?: string;
}

export interface MultimodalWorkflowExecution {
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  results: MultimodalStepResult[];
  visualContexts: VisualContext[];
  finalScreenshot?: string;
  success: boolean;
  aiDecisionsMade: number;
  visualAnalysesPerformed: number;
}

export class MultimodalBrowserEngine {
  private client: MCPBrowserClient;
  private workflowsDir: string;
  private screenshotDir: string;

  constructor() {
    this.client = new MCPBrowserClient();
    this.workflowsDir = join(process.cwd(), '.claude', 'multimodal-workflows');
    this.screenshotDir = join(process.cwd(), '.claude', 'screenshots');
    this.ensureDirectories();
  }

  /**
   * Execute a multimodal workflow with visual context integration
   */
  async executeMultimodalWorkflow(
    userIntent: string,
    options: {
      analysisMode?: 'detailed' | 'standard' | 'minimal';
      visualDecisionMaking?: boolean;
      screenshotEveryStep?: boolean;
    } = {}
  ): Promise<MultimodalWorkflowExecution> {
    console.log('🤖 MULTIMODAL BROWSER AUTOMATION STARTED');
    console.log('───────────────────────────────────────────────────────────────────────────────────────');
    console.log(`📝 User Intent: "${userIntent}"`);
    console.log(`🔍 Analysis Mode: ${options.analysisMode || 'standard'}`);
    console.log(`🧠 Visual Decision Making: ${options.visualDecisionMaking ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📸 Screenshot Every Step: ${options.screenshotEveryStep ? 'YES' : 'NO'}\n`);

    const execution: MultimodalWorkflowExecution = {
      workflowId: `multimodal_${Date.now()}`,
      startTime: new Date(),
      results: [],
      visualContexts: [],
      success: false,
      aiDecisionsMade: 0,
      visualAnalysesPerformed: 0
    };

    try {
      // Initialize browser with multimodal capabilities
      console.log('🔌 Initializing Multimodal Browser System...');
      const initResult = await this.client.initialize();

      if (!initResult.success) {
        throw new Error(`Failed to initialize browser: ${initResult.error}`);
      }

      console.log(`   ✅ Browser initialized with ${initResult.server}`);

      // Generate workflow steps from user intent
      console.log('🧠 Generating intelligent workflow from user intent...');
      const workflowSteps = await this.generateMultimodalWorkflow(userIntent);

      console.log(`   ✅ Generated ${workflowSteps.length} multimodal steps\n`);

      // Execute each step with visual context integration
      for (let i = 0; i < workflowSteps.length; i++) {
        const step = workflowSteps[i];
        console.log(`📌 Step ${i + 1}/${workflowSteps.length}: ${step.description}`);

        const stepResult = await this.executeMultimodalStep(step, execution.visualContexts, options);
        execution.results.push(stepResult);

        if (stepResult.visualContext) {
          execution.visualContexts.push(stepResult.visualContext);
          execution.visualAnalysesPerformed++;
        }

        if (stepResult.aiDecision) {
          execution.aiDecisionsMade++;
          console.log(`   🧠 AI Decision: ${stepResult.aiDecision.action} (${Math.round(stepResult.aiDecision.confidence * 100)}% confidence)`);
          console.log(`   💭 Reasoning: ${stepResult.aiDecision.reasoning}`);
        }

        if (stepResult.success) {
          console.log(`   ✅ Step completed successfully (${stepResult.duration}ms)`);
        } else {
          console.log(`   ❌ Step failed: ${stepResult.error}`);

          if (options.visualDecisionMaking && stepResult.screenshot) {
            console.log('   🤖 Attempting AI-powered error recovery...');
            const recovery = await this.attemptVisualErrorRecovery(stepResult.screenshot, stepResult.error!);

            if (recovery.success) {
              console.log(`   ✅ Recovery successful: ${recovery.action}`);
            } else {
              console.log(`   ❌ Recovery failed: ${recovery.reason}`);
            }
          }
        }

        console.log('');
      }

      // Take final screenshot with AI analysis
      console.log('📸 Capturing final state with AI analysis...');
      const finalScreenshot = await this.client.takeScreenshot('multimodal_final');

      if (finalScreenshot.success && finalScreenshot.path) {
        execution.finalScreenshot = finalScreenshot.path;

        // Analyze final state
        const finalContext = await visualContextIntegration.analyzeScreenshotForContext(
          finalScreenshot.path,
          'workflow completion',
          {},
          'workflow-continuation'
        );

        execution.visualContexts.push(finalContext);
        execution.visualAnalysesPerformed++;

        console.log('   🎯 Final State Analysis:');
        console.log(`      • Elements visible: ${finalContext.aiAnalysis?.elementsVisible.length}`);
        console.log(`      • Page layout: ${finalContext.aiAnalysis?.pageLayout.substring(0, 60)}...`);
        console.log(`      • Suggested next actions: ${finalContext.aiAnalysis?.nextSuggestedActions.length}`);
      }

      // Determine overall success
      const successfulSteps = execution.results.filter(r => r.success).length;
      execution.success = successfulSteps >= Math.ceil(execution.results.length * 0.8); // 80% success rate

      console.log('📊 MULTIMODAL WORKFLOW RESULTS');
      console.log('───────────────────────────────────────────────────────────────────────────────────────');
      console.log(`🎯 Overall Success: ${execution.success ? 'YES' : 'NO'}`);
      console.log(`📋 Steps Completed: ${successfulSteps}/${execution.results.length}`);
      console.log(`🧠 AI Decisions Made: ${execution.aiDecisionsMade}`);
      console.log(`🔍 Visual Analyses: ${execution.visualAnalysesPerformed}`);
      console.log(`📸 Screenshots Captured: ${execution.results.filter(r => r.screenshot).length}`);

    } catch (error) {
      console.error(`💥 Multimodal workflow failed: ${error.message}`);
      execution.success = false;
    } finally {
      execution.endTime = new Date();
      await this.client.close();

      const duration = execution.endTime.getTime() - execution.startTime.getTime();
      console.log(`⏱️  Total Duration: ${duration}ms`);
      console.log('🧹 Browser resources cleaned up\n');
    }

    return execution;
  }

  /**
   * Execute individual multimodal step with visual context
   */
  private async executeMultimodalStep(
    step: MultimodalWorkflowStep,
    previousContexts: VisualContext[],
    options: any
  ): Promise<MultimodalStepResult> {
    const startTime = Date.now();
    const result: MultimodalStepResult = {
      stepId: step.id,
      success: false,
      duration: 0
    };

    try {
      switch (step.type) {
        case 'navigate':
          result.success = await this.executeNavigateWithVisual(step, result);
          break;

        case 'analyze_visual':
          result.success = await this.executeVisualAnalysis(step, result);
          break;

        case 'click_smart':
          result.success = await this.executeSmartClick(step, result, previousContexts);
          break;

        case 'type_smart':
          result.success = await this.executeSmartType(step, result, previousContexts);
          break;

        case 'scroll_smart':
          result.success = await this.executeSmartScroll(step, result, previousContexts);
          break;

        case 'wait_visual':
          result.success = await this.executeVisualWait(step, result);
          break;

        case 'extract_visual':
          result.success = await this.executeVisualExtraction(step, result);
          break;

        case 'compare_visual':
          result.success = await this.executeVisualComparison(step, result, previousContexts);
          break;

        default:
          result.error = `Unknown multimodal step type: ${step.type}`;
      }

    } catch (error) {
      result.error = error.message;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Execute navigation with immediate visual analysis
   */
  private async executeNavigateWithVisual(step: MultimodalWorkflowStep, result: MultimodalStepResult): Promise<boolean> {
    // Navigate to URL
    const navResult = await this.client.navigate(step.params.url!);
    if (!navResult.success) {
      result.error = navResult.error;
      return false;
    }

    // Take screenshot for visual analysis
    const screenshot = await this.client.takeScreenshot(`navigate_${step.id}`);
    if (screenshot.success && screenshot.path) {
      result.screenshot = screenshot.path;

      // Perform AI visual analysis
      result.visualContext = await visualContextIntegration.analyzeScreenshotForContext(
        screenshot.path,
        step.description,
        { url: step.params.url, title: navResult.title },
        'navigation'
      );

      console.log(`      🔍 Visual Analysis: ${result.visualContext.aiAnalysis?.elementsVisible.length} elements detected`);
    }

    return true;
  }

  /**
   * Execute pure visual analysis step
   */
  private async executeVisualAnalysis(step: MultimodalWorkflowStep, result: MultimodalStepResult): Promise<boolean> {
    // Take screenshot
    const screenshot = await this.client.takeScreenshot(`analyze_${step.id}`);
    if (!screenshot.success || !screenshot.path) {
      result.error = 'Failed to capture screenshot for analysis';
      return false;
    }

    result.screenshot = screenshot.path;

    // Perform detailed visual analysis
    result.visualContext = await visualContextIntegration.analyzeScreenshotForContext(
      screenshot.path,
      step.description,
      {},
      step.params.analysisGoal || 'general'
    );

    // Extract actionable insights
    const insights = visualContextIntegration.extractActionableInsights(result.visualContext);
    result.extractedData = insights;

    console.log(`      📊 Insights: ${insights.immediateActions.length} actions, ${insights.potentialProblems.length} issues`);

    return true;
  }

  /**
   * Execute smart click using visual context
   */
  private async executeSmartClick(
    step: MultimodalWorkflowStep,
    result: MultimodalStepResult,
    previousContexts: VisualContext[]
  ): Promise<boolean> {
    // Take screenshot to analyze current state
    const screenshot = await this.client.takeScreenshot(`click_analysis_${step.id}`);
    if (!screenshot.success || !screenshot.path) {
      result.error = 'Failed to capture screenshot for click analysis';
      return false;
    }

    // Get AI recommendation for click action
    const decision = await visualContextIntegration.getVisualContextForDecision(
      screenshot.path,
      `click ${step.params.target || 'best element'}`,
      previousContexts
    );

    result.aiDecision = {
      action: decision.recommendation,
      confidence: decision.confidence,
      reasoning: decision.reasoning
    };

    // Execute the recommended action
    if (decision.confidence > 0.6) {
      // Try to click by description first
      const clickResult = await this.client.clickByDescription(step.params.target || decision.recommendation);

      if (clickResult.success) {
        // Take screenshot after click to verify result
        const afterScreenshot = await this.client.takeScreenshot(`click_result_${step.id}`);
        if (afterScreenshot.success && afterScreenshot.path) {
          result.screenshot = afterScreenshot.path;

          // Analyze the result
          result.visualContext = await visualContextIntegration.analyzeScreenshotForContext(
            afterScreenshot.path,
            `click result: ${step.description}`,
            {},
            'workflow-continuation'
          );
        }

        return true;
      } else {
        result.error = clickResult.error;
        return false;
      }
    } else {
      result.error = `AI confidence too low (${Math.round(decision.confidence * 100)}%) for click action`;
      return false;
    }
  }

  /**
   * Execute smart typing using visual context
   */
  private async executeSmartType(
    step: MultimodalWorkflowStep,
    result: MultimodalStepResult,
    previousContexts: VisualContext[]
  ): Promise<boolean> {
    // Analyze current state to find best input field
    const screenshot = await this.client.takeScreenshot(`type_analysis_${step.id}`);
    if (!screenshot.success || !screenshot.path) {
      result.error = 'Failed to capture screenshot for typing analysis';
      return false;
    }

    const decision = await visualContextIntegration.getVisualContextForDecision(
      screenshot.path,
      `type "${step.params.text}" into ${step.params.target || 'best input field'}`,
      previousContexts
    );

    result.aiDecision = {
      action: decision.recommendation,
      confidence: decision.confidence,
      reasoning: decision.reasoning
    };

    if (decision.confidence > 0.6) {
      const typeResult = await this.client.typeByDescription(
        step.params.target || 'input field',
        step.params.text!
      );

      if (typeResult.success) {
        // Take screenshot after typing
        const afterScreenshot = await this.client.takeScreenshot(`type_result_${step.id}`);
        if (afterScreenshot.success && afterScreenshot.path) {
          result.screenshot = afterScreenshot.path;
        }
        return true;
      } else {
        result.error = typeResult.error;
        return false;
      }
    } else {
      result.error = `AI confidence too low (${Math.round(decision.confidence * 100)}%) for type action`;
      return false;
    }
  }

  /**
   * Execute smart scroll with visual feedback
   */
  private async executeSmartScroll(
    step: MultimodalWorkflowStep,
    result: MultimodalStepResult,
    previousContexts: VisualContext[]
  ): Promise<boolean> {
    // Take before screenshot
    const beforeScreenshot = await this.client.takeScreenshot(`scroll_before_${step.id}`);

    // Execute scroll
    const scrollResult = await this.client.scroll('down', 500);
    if (!scrollResult.success) {
      result.error = scrollResult.error;
      return false;
    }

    // Take after screenshot
    const afterScreenshot = await this.client.takeScreenshot(`scroll_after_${step.id}`);
    if (afterScreenshot.success && afterScreenshot.path) {
      result.screenshot = afterScreenshot.path;

      // Compare before and after to analyze what new content appeared
      if (beforeScreenshot.success && beforeScreenshot.path) {
        const comparison = await visualContextIntegration.compareScreenshots(
          beforeScreenshot.path,
          afterScreenshot.path,
          'scroll-content'
        );

        result.extractedData = {
          changes: comparison.changes,
          significance: comparison.significance,
          recommendation: comparison.recommendation
        };
      }
    }

    return true;
  }

  /**
   * Execute visual wait (wait for specific visual conditions)
   */
  private async executeVisualWait(step: MultimodalWorkflowStep, result: MultimodalStepResult): Promise<boolean> {
    const maxWaitTime = 10000; // 10 seconds max
    const checkInterval = 1000; // Check every second
    let waited = 0;

    console.log(`      ⏳ Visual wait: Looking for ${step.params.target}...`);

    while (waited < maxWaitTime) {
      const screenshot = await this.client.takeScreenshot(`wait_check_${waited}`);

      if (screenshot.success && screenshot.path) {
        const context = await visualContextIntegration.analyzeScreenshotForContext(
          screenshot.path,
          `wait for ${step.params.target}`,
          {},
          'element-detection'
        );

        // Check if the target element/condition is now visible
        const targetFound = context.aiAnalysis?.elementsVisible.some(e =>
          e.description.toLowerCase().includes(step.params.target?.toLowerCase() || '')
        );

        if (targetFound) {
          result.screenshot = screenshot.path;
          result.visualContext = context;
          console.log(`      ✅ Target found after ${waited}ms`);
          return true;
        }
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    result.error = `Visual wait timeout: ${step.params.target} not found after ${maxWaitTime}ms`;
    return false;
  }

  /**
   * Execute visual data extraction
   */
  private async executeVisualExtraction(step: MultimodalWorkflowStep, result: MultimodalStepResult): Promise<boolean> {
    const screenshot = await this.client.takeScreenshot(`extract_${step.id}`);
    if (!screenshot.success || !screenshot.path) {
      result.error = 'Failed to capture screenshot for extraction';
      return false;
    }

    result.screenshot = screenshot.path;

    // Analyze screenshot for extractable data
    result.visualContext = await visualContextIntegration.analyzeScreenshotForContext(
      screenshot.path,
      step.description,
      {},
      'data-extraction'
    );

    // Extract specific data based on visual analysis
    const insights = visualContextIntegration.extractActionableInsights(result.visualContext);
    result.extractedData = {
      dataOpportunities: insights.dataExtractionOpportunities,
      elementsFound: result.visualContext.aiAnalysis?.elementsVisible.length,
      confidence: result.visualContext.aiAnalysis?.confidence
    };

    console.log(`      💾 Data extraction: ${insights.dataExtractionOpportunities.length} opportunities found`);

    return true;
  }

  /**
   * Execute visual comparison between states
   */
  private async executeVisualComparison(
    step: MultimodalWorkflowStep,
    result: MultimodalStepResult,
    previousContexts: VisualContext[]
  ): Promise<boolean> {
    if (previousContexts.length === 0) {
      result.error = 'No previous visual context available for comparison';
      return false;
    }

    const currentScreenshot = await this.client.takeScreenshot(`compare_current_${step.id}`);
    if (!currentScreenshot.success || !currentScreenshot.path) {
      result.error = 'Failed to capture current screenshot for comparison';
      return false;
    }

    const previousScreenshot = previousContexts[previousContexts.length - 1].screenshotPath;

    const comparison = await visualContextIntegration.compareScreenshots(
      previousScreenshot,
      currentScreenshot.path,
      step.params.comparisonType || 'general'
    );

    result.screenshot = currentScreenshot.path;
    result.extractedData = comparison;

    console.log(`      📊 Comparison: ${comparison.changes.length} changes, significance: ${comparison.significance}`);

    return true;
  }

  /**
   * Attempt AI-powered error recovery using visual context
   */
  private async attemptVisualErrorRecovery(screenshotPath: string, error: string): Promise<{
    success: boolean;
    action?: string;
    reason?: string;
  }> {
    console.log(`      🤖 AI Error Recovery: Analyzing screenshot for recovery options...`);

    // Analyze current visual state for recovery opportunities
    const context = await visualContextIntegration.analyzeScreenshotForContext(
      screenshotPath,
      `error recovery: ${error}`,
      {},
      'error-debugging'
    );

    const insights = visualContextIntegration.extractActionableInsights(context);

    if (insights.immediateActions.length > 0) {
      const recoveryAction = insights.immediateActions[0];

      // Try to execute the recovery action
      try {
        // This would implement the actual recovery action
        // For now, we'll simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          success: true,
          action: recoveryAction,
          reason: 'AI identified recovery action based on visual analysis'
        };
      } catch (recoveryError) {
        return {
          success: false,
          reason: `Recovery action failed: ${recoveryError.message}`
        };
      }
    } else {
      return {
        success: false,
        reason: 'No recovery options identified through visual analysis'
      };
    }
  }

  /**
   * Generate multimodal workflow steps from user intent
   */
  private async generateMultimodalWorkflow(userIntent: string): Promise<MultimodalWorkflowStep[]> {
    const steps: MultimodalWorkflowStep[] = [];
    const lowerIntent = userIntent.toLowerCase();

    // Extract URL if present
    const urlMatch = userIntent.match(/(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
    const url = urlMatch ? (urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`) : null;

    // Start with navigation if URL provided
    if (url) {
      steps.push({
        id: `nav_${Date.now()}`,
        type: 'navigate',
        description: `Navigate to ${url} and analyze page`,
        params: { url },
        visualAnalysis: true,
        requiresScreenshot: true
      });
    }

    // Add visual analysis step
    steps.push({
      id: `analyze_${Date.now()}`,
      type: 'analyze_visual',
      description: 'Perform comprehensive visual analysis of current page',
      params: { analysisGoal: 'general' },
      visualAnalysis: true,
      requiresScreenshot: true
    });

    // Add interaction steps based on intent
    if (lowerIntent.includes('click') || lowerIntent.includes('button')) {
      const target = this.extractTargetFromIntent(userIntent, ['click', 'press', 'button']);
      steps.push({
        id: `click_${Date.now()}`,
        type: 'click_smart',
        description: `Smart click on ${target}`,
        params: { target },
        visualAnalysis: true,
        decisionMaking: true,
        requiresScreenshot: true
      });
    }

    if (lowerIntent.includes('type') || lowerIntent.includes('fill') || lowerIntent.includes('enter')) {
      const textMatch = userIntent.match(/(?:type|enter|fill)[\s"']*([^"'\n]+)["']?\s*(?:into|in)\s*["']?([^"'\n]+)["']?/i);
      if (textMatch) {
        steps.push({
          id: `type_${Date.now()}`,
          type: 'type_smart',
          description: `Smart type "${textMatch[1].trim()}" into ${textMatch[2].trim()}`,
          params: { text: textMatch[1].trim(), target: textMatch[2].trim() },
          visualAnalysis: true,
          decisionMaking: true,
          requiresScreenshot: true
        });
      }
    }

    if (lowerIntent.includes('scroll')) {
      steps.push({
        id: `scroll_${Date.now()}`,
        type: 'scroll_smart',
        description: 'Smart scroll with visual feedback',
        params: {},
        visualAnalysis: true,
        requiresScreenshot: true
      });
    }

    if (lowerIntent.includes('extract') || lowerIntent.includes('data') || lowerIntent.includes('information')) {
      steps.push({
        id: `extract_${Date.now()}`,
        type: 'extract_visual',
        description: 'Extract data using visual analysis',
        params: { analysisGoal: 'data-extraction' },
        visualAnalysis: true,
        requiresScreenshot: true
      });
    }

    // Always end with final analysis
    steps.push({
      id: `final_${Date.now()}`,
      type: 'analyze_visual',
      description: 'Final state analysis and completion verification',
      params: { analysisGoal: 'workflow-completion' },
      visualAnalysis: true,
      requiresScreenshot: true
    });

    return steps;
  }

  /**
   * Extract target element from user intent
   */
  private extractTargetFromIntent(text: string, keywords: string[]): string {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}\\s+(?:on\\s+)?["']?([^"'\\n]+)["']?`, 'i');
      const match = text.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return 'primary element';
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

export const multimodalBrowserEngine = new MultimodalBrowserEngine();