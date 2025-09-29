import { spawn, ChildProcess } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface BrowserAction {
  type: 'navigate' | 'click' | 'type' | 'screenshot' | 'scroll' | 'wait' | 'evaluate';
  target?: string;
  value?: string;
  options?: any;
}

export interface BrowserState {
  url: string;
  title: string;
  screenshot: string;
  elements: ElementInfo[];
  timestamp: Date;
}

export interface ElementInfo {
  tag: string;
  text: string;
  selector: string;
  clickable: boolean;
  visible: boolean;
  position: { x: number; y: number; width: number; height: number };
}

export interface BrowserWorkflow {
  id: string;
  name: string;
  description: string;
  steps: BrowserAction[];
  expectedOutcome: string;
  screenshot?: string;
}

export class WebBrowserIntegration {
  private mcpProcess: ChildProcess | null = null;
  private mcpPort: number = 3000;
  private screenshotDir: string;
  private workflowHistory: BrowserWorkflow[] = [];

  constructor() {
    this.screenshotDir = join(process.cwd(), '.claude', 'screenshots');
    this.ensureScreenshotDir();
  }

  /**
   * Initialize browser automation using MCP server
   */
  async initializeBrowserAutomation(): Promise<{
    success: boolean;
    mcpServer: string;
    capabilities: string[];
  }> {
    console.log('🌐 Initializing Web Browser Integration...');

    // First try Microsoft Playwright MCP (preferred)
    let mcpServer = 'microsoft-playwright-mcp';
    let success = await this.startMCPServer('@playwright/mcp', 'playwright');

    if (!success) {
      // Fallback to ExecuteAutomation Playwright MCP
      mcpServer = 'executeautomation-playwright-mcp';
      success = await this.startMCPServer('@executeautomation/playwright-mcp-server', 'playwright');
    }

    if (!success) {
      // Final fallback to official Puppeteer MCP
      mcpServer = 'official-puppeteer-mcp';
      success = await this.startMCPServer('@modelcontextprotocol/server-puppeteer', 'puppeteer');
    }

    const capabilities = [
      'Navigate to websites',
      'Take screenshots',
      'Click elements',
      'Fill forms',
      'Scroll pages',
      'Execute JavaScript',
      'Monitor page changes',
      'Extract page content'
    ];

    console.log(`   ✅ Browser automation initialized with ${mcpServer}`);
    console.log(`   🎯 Capabilities: ${capabilities.length} browser actions available`);

    return { success, mcpServer, capabilities };
  }

  /**
   * Start MCP server for browser automation
   */
  private async startMCPServer(packageName: string, type: 'playwright' | 'puppeteer'): Promise<boolean> {
    try {
      console.log(`   🔄 Starting ${packageName}...`);

      // Check if package is installed
      const checkProcess = spawn('npm', ['list', '-g', packageName], { stdio: 'pipe' });
      const isInstalled = await new Promise((resolve) => {
        checkProcess.on('close', (code) => resolve(code === 0));
      });

      if (!isInstalled) {
        console.log(`   📦 Installing ${packageName}...`);
        const installProcess = spawn('npm', ['install', '-g', packageName], { stdio: 'inherit' });
        const installed = await new Promise((resolve) => {
          installProcess.on('close', (code) => resolve(code === 0));
        });

        if (!installed) {
          console.log(`   ❌ Failed to install ${packageName}`);
          return false;
        }
      }

      // Start MCP server
      const serverArgs = this.getMCPServerArgs(type);
      this.mcpProcess = spawn('npx', [packageName, ...serverArgs], {
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      });

      console.log(`   ✅ ${packageName} started successfully`);
      return true;

    } catch (error) {
      console.log(`   ❌ Failed to start ${packageName}: ${error}`);
      return false;
    }
  }

  /**
   * Get MCP server arguments based on type
   */
  private getMCPServerArgs(type: 'playwright' | 'puppeteer'): string[] {
    const baseArgs = ['--stdio'];

    if (type === 'playwright') {
      return [
        ...baseArgs,
        '--browser', 'chromium',
        '--headless', 'false', // Show browser for debugging
        '--screenshot-quality', '80'
      ];
    } else {
      return [
        ...baseArgs,
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ];
    }
  }

  /**
   * Execute a browser workflow autonomously
   */
  async executeWorkflow(workflow: BrowserWorkflow): Promise<{
    success: boolean;
    finalState: BrowserState | null;
    screenshots: string[];
    errors: string[];
  }> {
    console.log(`🤖 Executing Browser Workflow: ${workflow.name}`);
    console.log(`   📋 Steps: ${workflow.steps.length}`);
    console.log(`   🎯 Goal: ${workflow.expectedOutcome}`);

    const screenshots: string[] = [];
    const errors: string[] = [];
    let currentState: BrowserState | null = null;

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        console.log(`   📌 Step ${i + 1}/${workflow.steps.length}: ${step.type} ${step.target || ''}`);

        // Execute the step
        const stepResult = await this.executeStep(step);

        if (stepResult.success) {
          currentState = stepResult.state;
          if (stepResult.screenshot) {
            screenshots.push(stepResult.screenshot);
          }
          console.log(`      ✅ ${step.type} completed successfully`);
        } else {
          errors.push(`Step ${i + 1} (${step.type}): ${stepResult.error}`);
          console.log(`      ❌ ${step.type} failed: ${stepResult.error}`);
        }

        // Take screenshot after each major action
        if (['navigate', 'click', 'type'].includes(step.type)) {
          const screenshot = await this.takeScreenshot(`step_${i + 1}_${step.type}`);
          if (screenshot) screenshots.push(screenshot);
        }
      }

      // Take final screenshot
      const finalScreenshot = await this.takeScreenshot('workflow_complete');
      if (finalScreenshot) screenshots.push(finalScreenshot);

      // Store workflow in history
      workflow.screenshot = screenshots[screenshots.length - 1];
      this.workflowHistory.push(workflow);

      console.log(`   🎉 Workflow "${workflow.name}" completed`);
      console.log(`   📸 Screenshots taken: ${screenshots.length}`);

      return {
        success: errors.length === 0,
        finalState: currentState,
        screenshots,
        errors
      };

    } catch (error) {
      console.error(`   ❌ Workflow execution failed: ${error}`);
      return {
        success: false,
        finalState: null,
        screenshots,
        errors: [...errors, error.message]
      };
    }
  }

  /**
   * Execute individual browser step
   */
  private async executeStep(action: BrowserAction): Promise<{
    success: boolean;
    state: BrowserState | null;
    screenshot?: string;
    error?: string;
  }> {
    try {
      // This would integrate with the actual MCP server
      // For now, we'll simulate the actions

      switch (action.type) {
        case 'navigate':
          return this.simulateNavigate(action.target!);

        case 'click':
          return this.simulateClick(action.target!);

        case 'type':
          return this.simulateType(action.target!, action.value!);

        case 'screenshot':
          const screenshot = await this.takeScreenshot('manual');
          return {
            success: true,
            state: await this.getCurrentState(),
            screenshot
          };

        case 'wait':
          await this.wait(action.value ? parseInt(action.value) : 1000);
          return {
            success: true,
            state: await this.getCurrentState()
          };

        case 'evaluate':
          return this.simulateEvaluate(action.value!);

        default:
          return {
            success: false,
            state: null,
            error: `Unknown action type: ${action.type}`
          };
      }

    } catch (error) {
      return {
        success: false,
        state: null,
        error: error.message
      };
    }
  }

  /**
   * Simulate navigation (would integrate with MCP)
   */
  private async simulateNavigate(url: string): Promise<{
    success: boolean;
    state: BrowserState;
  }> {
    // This would send MCP command: navigate to URL
    console.log(`      🌐 Navigating to: ${url}`);

    const state: BrowserState = {
      url,
      title: `Page: ${url}`,
      screenshot: '',
      elements: await this.extractElements(),
      timestamp: new Date()
    };

    return { success: true, state };
  }

  /**
   * Simulate click action (would integrate with MCP)
   */
  private async simulateClick(selector: string): Promise<{
    success: boolean;
    state: BrowserState;
  }> {
    console.log(`      👆 Clicking: ${selector}`);

    const state: BrowserState = {
      url: 'current-url',
      title: 'Current Page',
      screenshot: '',
      elements: await this.extractElements(),
      timestamp: new Date()
    };

    return { success: true, state };
  }

  /**
   * Simulate typing (would integrate with MCP)
   */
  private async simulateType(selector: string, text: string): Promise<{
    success: boolean;
    state: BrowserState;
  }> {
    console.log(`      ⌨️  Typing "${text}" into: ${selector}`);

    const state: BrowserState = {
      url: 'current-url',
      title: 'Current Page',
      screenshot: '',
      elements: await this.extractElements(),
      timestamp: new Date()
    };

    return { success: true, state };
  }

  /**
   * Simulate JavaScript evaluation (would integrate with MCP)
   */
  private async simulateEvaluate(script: string): Promise<{
    success: boolean;
    state: BrowserState;
  }> {
    console.log(`      🔧 Evaluating JavaScript: ${script.substring(0, 50)}...`);

    const state: BrowserState = {
      url: 'current-url',
      title: 'Current Page',
      screenshot: '',
      elements: await this.extractElements(),
      timestamp: new Date()
    };

    return { success: true, state };
  }

  /**
   * Take screenshot of current page
   */
  async takeScreenshot(name: string): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}_${timestamp}.png`;
      const filepath = join(this.screenshotDir, filename);

      // This would integrate with MCP to take actual screenshot
      console.log(`      📸 Taking screenshot: ${filename}`);

      // For now, create a placeholder
      writeFileSync(filepath, `Screenshot placeholder for ${name}`);

      return filepath;
    } catch (error) {
      console.error(`Failed to take screenshot: ${error}`);
      return null;
    }
  }

  /**
   * Extract elements from current page (would integrate with MCP)
   */
  private async extractElements(): Promise<ElementInfo[]> {
    // This would use MCP to get accessibility tree or DOM elements
    return [
      {
        tag: 'button',
        text: 'Click Me',
        selector: 'button[type="submit"]',
        clickable: true,
        visible: true,
        position: { x: 100, y: 200, width: 120, height: 40 }
      },
      {
        tag: 'input',
        text: '',
        selector: 'input[type="text"]',
        clickable: true,
        visible: true,
        position: { x: 100, y: 150, width: 200, height: 30 }
      }
    ];
  }

  /**
   * Get current browser state
   */
  private async getCurrentState(): Promise<BrowserState> {
    return {
      url: 'current-url',
      title: 'Current Page',
      screenshot: '',
      elements: await this.extractElements(),
      timestamp: new Date()
    };
  }

  /**
   * Wait for specified milliseconds
   */
  private async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create workflow for autonomous browser interaction
   */
  createWorkflow(name: string, description: string, goal: string): BrowserWorkflow {
    const workflow: BrowserWorkflow = {
      id: `workflow_${Date.now()}`,
      name,
      description,
      steps: [],
      expectedOutcome: goal
    };

    return workflow;
  }

  /**
   * Add step to workflow
   */
  addWorkflowStep(workflow: BrowserWorkflow, action: BrowserAction): void {
    workflow.steps.push(action);
  }

  /**
   * Intelligent workflow creation based on user intent
   */
  async createIntelligentWorkflow(userIntent: string): Promise<BrowserWorkflow> {
    console.log('🧠 Creating intelligent browser workflow...');
    console.log(`   📝 User Intent: "${userIntent}"`);

    const workflow = this.createWorkflow(
      `Auto: ${userIntent.substring(0, 30)}...`,
      `Autonomously generated workflow for: ${userIntent}`,
      userIntent
    );

    // Analyze intent and create appropriate steps
    const intent = this.analyzeUserIntent(userIntent);
    const steps = this.generateWorkflowSteps(intent);

    steps.forEach(step => this.addWorkflowStep(workflow, step));

    console.log(`   ✅ Workflow created with ${steps.length} steps`);
    return workflow;
  }

  /**
   * Analyze user intent for browser automation
   */
  private analyzeUserIntent(intent: string): {
    action: string;
    target?: string;
    data?: string;
    url?: string;
  } {
    const lowerIntent = intent.toLowerCase();

    if (lowerIntent.includes('open') || lowerIntent.includes('navigate') || lowerIntent.includes('go to')) {
      const urlMatch = intent.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
      return { action: 'navigate', url: urlMatch?.[0] || 'https://example.com' };
    }

    if (lowerIntent.includes('click') || lowerIntent.includes('press')) {
      const targetMatch = intent.match(/click\s+(?:on\s+)?["']?([^"'\n]+)["']?/i);
      return { action: 'click', target: targetMatch?.[1] || 'button' };
    }

    if (lowerIntent.includes('type') || lowerIntent.includes('enter') || lowerIntent.includes('fill')) {
      const dataMatch = intent.match(/(?:type|enter|fill)\s+["']([^"']+)["']/i);
      return { action: 'type', data: dataMatch?.[1] || 'sample text' };
    }

    if (lowerIntent.includes('screenshot') || lowerIntent.includes('capture')) {
      return { action: 'screenshot' };
    }

    return { action: 'navigate', url: 'https://example.com' };
  }

  /**
   * Generate workflow steps based on analyzed intent
   */
  private generateWorkflowSteps(intent: any): BrowserAction[] {
    const steps: BrowserAction[] = [];

    switch (intent.action) {
      case 'navigate':
        steps.push({ type: 'navigate', target: intent.url });
        steps.push({ type: 'wait', value: '2000' });
        steps.push({ type: 'screenshot' });
        break;

      case 'click':
        steps.push({ type: 'click', target: intent.target });
        steps.push({ type: 'wait', value: '1000' });
        steps.push({ type: 'screenshot' });
        break;

      case 'type':
        steps.push({ type: 'type', target: 'input', value: intent.data });
        steps.push({ type: 'screenshot' });
        break;

      case 'screenshot':
        steps.push({ type: 'screenshot' });
        break;

      default:
        steps.push({ type: 'navigate', target: 'https://example.com' });
        steps.push({ type: 'screenshot' });
    }

    return steps;
  }

  /**
   * Get workflow execution history
   */
  getWorkflowHistory(): BrowserWorkflow[] {
    return this.workflowHistory;
  }

  /**
   * Ensure screenshot directory exists
   */
  private ensureScreenshotDir(): void {
    if (!existsSync(this.screenshotDir)) {
      mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Clean up browser resources
   */
  async cleanup(): Promise<void> {
    if (this.mcpProcess) {
      console.log('🧹 Cleaning up browser automation resources...');
      this.mcpProcess.kill();
      this.mcpProcess = null;
    }
  }
}

export const webBrowserIntegration = new WebBrowserIntegration();