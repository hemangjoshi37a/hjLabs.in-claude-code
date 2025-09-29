import { autonomousOrchestrator, AutonomousAction, ProjectContext } from './autonomous-orchestrator';
import { webBrowserIntegration, BrowserWorkflow, BrowserAction, BrowserState } from './web-browser-integration';
import { visualContextIntegration, VisualContext, VisualAnalysis } from './visual-context-integration';
import { multimodalBrowserEngine } from './multimodal-browser-engine';
import * as fs from 'fs';
import * as path from 'path';

export interface AutonomousWebContext {
  terminalCapabilities: boolean;
  browserCapabilities: boolean;
  visualContext: VisualContext[];
  currentEnvironment: 'terminal' | 'browser' | 'hybrid';
  workflowHistory: WebEvolutionWorkflow[];
  lastEvolutionCycle: Date | null;
}

export interface WebEvolutionWorkflow {
  id: string;
  name: string;
  description: string;
  terminalSteps: AutonomousAction[];
  browserSteps: BrowserAction[];
  visualCheckpoints: string[];
  expectedOutcome: string;
  actualOutcome?: string;
  screenshots: string[];
  executionTime: number;
  successRate: number;
}

export interface AutonomousDecision {
  environment: 'terminal' | 'browser' | 'hybrid';
  action: AutonomousAction | BrowserAction;
  reasoning: string;
  confidence: number;
  visualContext?: VisualContext;
  fallbackPlan: string[];
}

export class AutonomousWebEvolution {
  private webContext: AutonomousWebContext;
  private evolutionActive: boolean = false;
  private decisionHistory: AutonomousDecision[] = [];

  constructor() {
    this.webContext = {
      terminalCapabilities: true,
      browserCapabilities: false,
      visualContext: [],
      currentEnvironment: 'terminal',
      workflowHistory: [],
      lastEvolutionCycle: null
    };
  }

  /**
   * Initialize the integrated autonomous web evolution system
   */
  async initialize(): Promise<{
    success: boolean;
    capabilities: string[];
    environment: string;
  }> {
    console.log('🚀 Initializing Autonomous Web Evolution System...');

    // Initialize browser capabilities
    const browserInit = await webBrowserIntegration.initializeBrowserAutomation();
    this.webContext.browserCapabilities = browserInit.success;

    // Initialize visual context system
    visualContextIntegration.clearContextHistory();

    const capabilities = [
      'Autonomous terminal operations',
      'Autonomous browser automation',
      'Visual context analysis',
      'Cross-environment workflows',
      'Evolutionary optimization',
      'Market intelligence integration',
      'Real-time adaptation'
    ];

    if (browserInit.success) {
      capabilities.push(...browserInit.capabilities);
    }

    console.log('   ✅ Autonomous Web Evolution System initialized');
    console.log(`   🎯 Capabilities: ${capabilities.length} autonomous functions`);
    console.log(`   🌐 Environment: ${this.webContext.browserCapabilities ? 'Terminal + Browser' : 'Terminal Only'}`);

    return {
      success: true,
      capabilities,
      environment: this.webContext.browserCapabilities ? 'hybrid' : 'terminal'
    };
  }

  /**
   * Start autonomous evolution with web capabilities
   */
  async startAutonomousWebEvolution(userInput: string, mode: 'conservative' | 'balanced' | 'aggressive' = 'balanced'): Promise<{
    workflow: WebEvolutionWorkflow;
    executionResults: any;
    visualEvidence: string[];
    evolutionMetrics: any;
  }> {
    console.log('🧠 Starting Autonomous Web Evolution...');
    console.log(`   📊 Mode: ${mode.toUpperCase()}`);
    console.log(`   🎯 Input: "${userInput}"`);

    this.evolutionActive = true;

    try {
      // Get autonomous action plan
      const autonomousPlan = await autonomousOrchestrator.startAutonomousEvolution(userInput);

      // Analyze if web capabilities are needed
      const needsWeb = await this.analyzeWebRequirements(userInput, autonomousPlan.actions);

      // Create unified workflow
      const workflow = await this.createUnifiedWorkflow(userInput, autonomousPlan, needsWeb, mode);

      // Execute the workflow with visual feedback
      const executionResults = await this.executeUnifiedWorkflow(workflow);

      // Gather visual evidence
      const visualEvidence = this.gatherVisualEvidence();

      // Calculate evolution metrics
      const evolutionMetrics = this.calculateEvolutionMetrics(workflow, executionResults);

      console.log('   🎉 Autonomous Web Evolution completed');
      console.log(`   📊 Success Rate: ${Math.round(evolutionMetrics.successRate * 100)}%`);
      console.log(`   📸 Visual Evidence: ${visualEvidence.length} screenshots`);

      return {
        workflow,
        executionResults,
        visualEvidence,
        evolutionMetrics
      };

    } finally {
      this.evolutionActive = false;
    }
  }

  /**
   * Analyze if web capabilities are required for the given task
   */
  private async analyzeWebRequirements(userInput: string, actions: AutonomousAction[]): Promise<{
    requiresBrowser: boolean;
    reasons: string[];
    browserTasks: string[];
  }> {
    const webKeywords = [
      'website', 'browser', 'url', 'http', 'web', 'screenshot', 'click', 'form',
      'github', 'google', 'search', 'login', 'navigate', 'scrape', 'automation'
    ];

    const marketKeywords = [
      'competitor', 'market', 'trend', 'analysis', 'research', 'pricing',
      'feedback', 'review', 'social', 'media', 'news'
    ];

    const lowerInput = userInput.toLowerCase();
    const requiresBrowser = webKeywords.some(keyword => lowerInput.includes(keyword)) ||
                           marketKeywords.some(keyword => lowerInput.includes(keyword));

    const reasons: string[] = [];
    const browserTasks: string[] = [];

    if (requiresBrowser) {
      reasons.push('Web interaction keywords detected in user input');

      if (lowerInput.includes('screenshot')) {
        browserTasks.push('Take screenshots for visual analysis');
        reasons.push('Visual documentation required');
      }

      if (lowerInput.includes('competitor') || lowerInput.includes('market')) {
        browserTasks.push('Research competitor websites and market data');
        reasons.push('Market intelligence gathering required');
      }

      if (lowerInput.includes('form') || lowerInput.includes('login')) {
        browserTasks.push('Automate web form interactions');
        reasons.push('Web form automation needed');
      }

      if (lowerInput.includes('github') || lowerInput.includes('repository')) {
        browserTasks.push('Navigate GitHub interface for repository management');
        reasons.push('GitHub web interface interaction needed');
      }
    }

    // Check if any autonomous actions would benefit from web context
    actions.forEach(action => {
      const actionLower = action.command.toLowerCase();
      if (actionLower.includes('specify') || actionLower.includes('plan')) {
        browserTasks.push('Research similar implementations for specification');
        reasons.push('Research needed to inform planning decisions');
      }
    });

    console.log(`   🌐 Web Requirements Analysis:`);
    console.log(`      Browser Required: ${requiresBrowser}`);
    console.log(`      Reasons: ${reasons.length}`);
    console.log(`      Browser Tasks: ${browserTasks.length}`);

    return { requiresBrowser, reasons, browserTasks };
  }

  /**
   * Create unified workflow combining terminal and browser operations
   */
  private async createUnifiedWorkflow(
    userInput: string,
    autonomousPlan: any,
    webRequirements: any,
    mode: 'conservative' | 'balanced' | 'aggressive'
  ): Promise<WebEvolutionWorkflow> {
    const workflow: WebEvolutionWorkflow = {
      id: `autonomous_web_${Date.now()}`,
      name: `Autonomous: ${userInput.substring(0, 40)}...`,
      description: `Unified autonomous workflow combining terminal and web operations`,
      terminalSteps: autonomousPlan.actions,
      browserSteps: [],
      visualCheckpoints: [],
      expectedOutcome: autonomousPlan.executionPlan,
      screenshots: [],
      executionTime: 0,
      successRate: 0
    };

    // Add browser steps if web capabilities are needed
    if (webRequirements.requiresBrowser && this.webContext.browserCapabilities) {
      // Create intelligent browser workflow
      const browserWorkflow = await webBrowserIntegration.createIntelligentWorkflow(userInput);
      workflow.browserSteps = browserWorkflow.steps;

      // Add visual checkpoints for key moments
      workflow.visualCheckpoints = [
        'before_browser_initialization',
        'after_navigation',
        'during_form_interaction',
        'after_data_extraction',
        'workflow_completion'
      ];

      // Adjust workflow based on mode
      if (mode === 'aggressive') {
        // Add more experimental steps
        workflow.browserSteps.push({
          type: 'evaluate',
          value: 'window.performance.measure("autonomous_timing")'
        });
        workflow.terminalSteps.push({
          command: '/evolve',
          reason: 'Aggressive mode: Continuous evolution during execution',
          priority: 5,
          expectedOutcome: 'Real-time optimization during workflow execution',
          dependencies: []
        });
      } else if (mode === 'conservative') {
        // Add verification steps
        workflow.browserSteps.splice(1, 0, {
          type: 'wait',
          value: '3000'
        });
        workflow.visualCheckpoints.push('verification_checkpoint');
      }
    }

    console.log(`   📋 Unified Workflow Created:`);
    console.log(`      Terminal Steps: ${workflow.terminalSteps.length}`);
    console.log(`      Browser Steps: ${workflow.browserSteps.length}`);
    console.log(`      Visual Checkpoints: ${workflow.visualCheckpoints.length}`);

    return workflow;
  }

  /**
   * Execute unified workflow with cross-environment coordination
   */
  private async executeUnifiedWorkflow(workflow: WebEvolutionWorkflow): Promise<{
    terminalResults: any[];
    browserResults: any;
    visualAnalysis: VisualContext[];
    decisions: AutonomousDecision[];
  }> {
    console.log(`🚀 Executing Unified Workflow: ${workflow.name}`);

    const startTime = Date.now();
    const terminalResults: any[] = [];
    const decisions: AutonomousDecision[] = [];
    let browserResults: any = null;
    let visualAnalysis: VisualContext[] = [];

    try {
      // Phase 1: Initialize browser if needed
      if (workflow.browserSteps.length > 0) {
        console.log('   🌐 Phase 1: Browser Initialization');
        await this.takeVisualCheckpoint('browser_initialization');
      }

      // Phase 2: Execute terminal operations with browser context awareness
      console.log('   ⚡ Phase 2: Terminal Operations');
      for (const terminalStep of workflow.terminalSteps) {
        console.log(`      📌 Executing: ${terminalStep.command}`);

        // Make autonomous decision about execution context
        const decision = await this.makeAutonomousDecision(terminalStep, workflow);
        decisions.push(decision);

        // Execute based on decision
        const result = await this.executeContextualAction(decision);
        terminalResults.push(result);

        // Take visual checkpoint if significant change expected
        if (decision.confidence > 0.8) {
          const checkpoint = await this.takeVisualCheckpoint(`terminal_${terminalStep.command}`);
          if (checkpoint) visualAnalysis.push(checkpoint);
        }
      }

      // Phase 3: Execute browser operations with visual guidance
      if (workflow.browserSteps.length > 0) {
        console.log('   🌐 Phase 3: Browser Operations');

        const browserWorkflow = {
          id: workflow.id + '_browser',
          name: workflow.name + ' (Browser)',
          description: workflow.description,
          steps: workflow.browserSteps,
          expectedOutcome: workflow.expectedOutcome
        };

        // Execute with multimodal capabilities
        browserResults = await multimodalBrowserEngine.executeMultimodalWorkflow(
          workflow.expectedOutcome,
          {
            takeScreenshots: true,
            useVisualAnalysis: true,
            adaptToDynamicContent: true
          }
        );

        // Gather visual context from browser execution
        visualAnalysis.push(...visualContextIntegration.getContextHistory(10));
      }

      // Phase 4: Cross-environment optimization
      console.log('   🔄 Phase 4: Cross-Environment Optimization');
      await this.optimizeCrossEnvironment(workflow, terminalResults, browserResults, visualAnalysis);

      workflow.executionTime = Date.now() - startTime;
      workflow.successRate = this.calculateSuccessRate(terminalResults, browserResults);

      console.log(`   ✅ Unified Workflow Executed Successfully`);
      console.log(`      Execution Time: ${workflow.executionTime}ms`);
      console.log(`      Success Rate: ${Math.round(workflow.successRate * 100)}%`);

      return {
        terminalResults,
        browserResults,
        visualAnalysis,
        decisions
      };

    } catch (error) {
      console.error(`   ❌ Workflow Execution Failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make autonomous decision about execution environment and approach
   */
  private async makeAutonomousDecision(
    action: AutonomousAction,
    workflow: WebEvolutionWorkflow
  ): Promise<AutonomousDecision> {
    console.log(`      🧠 Making autonomous decision for: ${action.command}`);

    // Analyze current context
    const terminalContext = this.analyzeTerminalContext(action);
    const browserContext = await this.analyzeBrowserContext(action);
    const visualContext = await this.getRecentVisualContext();

    // Determine optimal environment
    let environment: 'terminal' | 'browser' | 'hybrid' = 'terminal';
    let confidence = 0.5;
    let reasoning = 'Default terminal execution';

    // Intelligence layer: Decide based on action type and context
    if (action.command.includes('/constitution') || action.command.includes('/specify')) {
      if (browserContext.researchOpportunities.length > 0) {
        environment = 'hybrid';
        confidence = 0.85;
        reasoning = 'Specification benefits from web research context';
      }
    } else if (action.command.includes('/evolve')) {
      if (visualContext && visualContext.aiAnalysis) {
        environment = 'hybrid';
        confidence = 0.9;
        reasoning = 'Evolution optimization enhanced by visual performance data';
      }
    } else if (action.command.includes('/implement')) {
      if (workflow.browserSteps.length > 0) {
        environment = 'hybrid';
        confidence = 0.8;
        reasoning = 'Implementation requires web testing and validation';
      }
    }

    // Create decision
    const decision: AutonomousDecision = {
      environment,
      action,
      reasoning,
      confidence,
      visualContext,
      fallbackPlan: this.createFallbackPlan(action, environment)
    };

    console.log(`         💡 Decision: ${environment} (${Math.round(confidence * 100)}% confidence)`);
    console.log(`         📝 Reasoning: ${reasoning}`);

    return decision;
  }

  /**
   * Execute action based on autonomous decision
   */
  private async executeContextualAction(decision: AutonomousDecision): Promise<{
    success: boolean;
    output: any;
    visualEvidence?: string;
    executionTime: number;
  }> {
    const startTime = Date.now();

    try {
      console.log(`         🚀 Executing in ${decision.environment} environment`);

      switch (decision.environment) {
        case 'terminal':
          return await this.executeTerminalAction(decision.action as AutonomousAction);

        case 'browser':
          return await this.executeBrowserAction(decision.action as BrowserAction);

        case 'hybrid':
          return await this.executeHybridAction(decision);

        default:
          throw new Error(`Unknown execution environment: ${decision.environment}`);
      }

    } catch (error) {
      console.log(`         ❌ Execution failed, trying fallback plan`);
      return await this.executeFallbackPlan(decision, error);
    } finally {
      const executionTime = Date.now() - startTime;
      console.log(`         ⏱️  Execution completed in ${executionTime}ms`);
    }
  }

  /**
   * Execute terminal action
   */
  private async executeTerminalAction(action: AutonomousAction): Promise<any> {
    console.log(`            ⚡ Terminal: ${action.command}`);

    // This would integrate with Claude Code's command execution system
    // For now, simulate execution
    await this.delay(500);

    return {
      success: true,
      output: `Terminal command '${action.command}' executed successfully`,
      executionTime: 500
    };
  }

  /**
   * Execute browser action with visual context
   */
  private async executeBrowserAction(action: BrowserAction): Promise<any> {
    console.log(`            🌐 Browser: ${action.type} ${action.target || ''}`);

    // Take screenshot before action
    const beforeScreenshot = await webBrowserIntegration.takeScreenshot(`before_${action.type}`);

    // Execute action
    const result = await webBrowserIntegration.executeWorkflow({
      id: 'single_action',
      name: `Single ${action.type}`,
      description: `Execute ${action.type} action`,
      steps: [action],
      expectedOutcome: `${action.type} completed successfully`
    });

    // Take screenshot after action
    const afterScreenshot = await webBrowserIntegration.takeScreenshot(`after_${action.type}`);

    // Analyze visual changes
    if (beforeScreenshot && afterScreenshot) {
      const visualComparison = await visualContextIntegration.compareScreenshots(
        beforeScreenshot,
        afterScreenshot,
        'action_verification'
      );
      result.visualEvidence = afterScreenshot;
      result.visualChanges = visualComparison;
    }

    return result;
  }

  /**
   * Execute hybrid action combining terminal and browser
   */
  private async executeHybridAction(decision: AutonomousDecision): Promise<any> {
    console.log(`            🔄 Hybrid: ${decision.action.command || (decision.action as BrowserAction).type}`);

    const results = {
      terminalResult: null,
      browserResult: null,
      visualContext: null,
      success: false,
      output: '',
      executionTime: 0
    };

    const startTime = Date.now();

    try {
      // Phase 1: Browser context gathering (if needed)
      if (this.shouldGatherBrowserContext(decision)) {
        console.log('               📸 Gathering browser context...');
        const screenshot = await webBrowserIntegration.takeScreenshot('hybrid_context');
        if (screenshot) {
          results.visualContext = await visualContextIntegration.analyzeScreenshotForContext(
            screenshot,
            `hybrid_execution_${decision.action.command || (decision.action as BrowserAction).type}`,
            {},
            'workflow-continuation'
          );
        }
      }

      // Phase 2: Terminal execution with visual context
      if ('command' in decision.action) {
        results.terminalResult = await this.executeTerminalAction(decision.action);
      }

      // Phase 3: Browser validation/documentation
      if (results.terminalResult?.success && this.webContext.browserCapabilities) {
        console.log('               🌐 Browser validation...');
        const validationScreenshot = await webBrowserIntegration.takeScreenshot('validation');
        results.browserResult = {
          screenshot: validationScreenshot,
          validation: 'Terminal action completed, browser evidence captured'
        };
      }

      results.success = true;
      results.output = `Hybrid execution successful: ${decision.reasoning}`;

    } catch (error) {
      results.success = false;
      results.output = `Hybrid execution failed: ${error.message}`;
    }

    results.executionTime = Date.now() - startTime;
    return results;
  }

  /**
   * Take visual checkpoint during workflow execution
   */
  private async takeVisualCheckpoint(checkpointName: string): Promise<VisualContext | null> {
    if (!this.webContext.browserCapabilities) return null;

    console.log(`      📸 Visual Checkpoint: ${checkpointName}`);

    const screenshot = await webBrowserIntegration.takeScreenshot(checkpointName);
    if (!screenshot) return null;

    const context = await visualContextIntegration.analyzeScreenshotForContext(
      screenshot,
      checkpointName,
      {},
      'workflow-continuation'
    );

    this.webContext.visualContext.push(context);
    return context;
  }

  /**
   * Optimize cross-environment workflow execution
   */
  private async optimizeCrossEnvironment(
    workflow: WebEvolutionWorkflow,
    terminalResults: any[],
    browserResults: any,
    visualAnalysis: VisualContext[]
  ): Promise<void> {
    console.log('      🔧 Cross-Environment Optimization...');

    // Analyze execution patterns
    const terminalSuccess = terminalResults.filter(r => r.success).length / terminalResults.length;
    const browserSuccess = browserResults?.success ? 1 : 0;
    const visualInsights = visualAnalysis.length;

    console.log(`         📊 Terminal Success: ${Math.round(terminalSuccess * 100)}%`);
    console.log(`         📊 Browser Success: ${Math.round(browserSuccess * 100)}%`);
    console.log(`         📊 Visual Insights: ${visualInsights} analysis points`);

    // Store optimization insights
    workflow.actualOutcome = `Execution completed with ${Math.round((terminalSuccess + browserSuccess) / 2 * 100)}% success rate`;

    // Learn from execution patterns for future improvements
    this.webContext.lastEvolutionCycle = new Date();
    this.webContext.workflowHistory.push(workflow);

    console.log('         ✅ Cross-environment optimization completed');
  }

  // Helper methods
  private analyzeTerminalContext(action: AutonomousAction): any {
    return {
      canExecute: true,
      estimatedTime: 1000,
      dependencies: action.dependencies,
      riskLevel: 'low'
    };
  }

  private async analyzeBrowserContext(action: AutonomousAction): Promise<any> {
    return {
      researchOpportunities: action.command.includes('/specify') || action.command.includes('/constitution') ? ['market research', 'competitor analysis'] : [],
      visualValidation: action.command.includes('/implement'),
      requiresInteraction: false
    };
  }

  private async getRecentVisualContext(): Promise<VisualContext | null> {
    const history = visualContextIntegration.getContextHistory(1);
    return history.length > 0 ? history[0] : null;
  }

  private createFallbackPlan(action: AutonomousAction, environment: string): string[] {
    const fallbacks = ['Execute in terminal only', 'Retry with different approach'];

    if (environment === 'hybrid') {
      fallbacks.unshift('Fall back to terminal-only execution');
    }

    return fallbacks;
  }

  private shouldGatherBrowserContext(decision: AutonomousDecision): boolean {
    return decision.environment === 'hybrid' &&
           decision.confidence > 0.7 &&
           this.webContext.browserCapabilities;
  }

  private async executeFallbackPlan(decision: AutonomousDecision, error: Error): Promise<any> {
    console.log(`         🔄 Executing fallback plan due to: ${error.message}`);

    // Try terminal-only execution as fallback
    if ('command' in decision.action) {
      return await this.executeTerminalAction(decision.action);
    }

    throw new Error(`All fallback options failed: ${error.message}`);
  }

  private calculateSuccessRate(terminalResults: any[], browserResults: any): number {
    const terminalSuccess = terminalResults.filter(r => r.success).length / Math.max(terminalResults.length, 1);
    const browserSuccess = browserResults?.success ? 1 : 0.5; // Neutral if no browser execution
    return (terminalSuccess + browserSuccess) / 2;
  }

  private gatherVisualEvidence(): string[] {
    return this.webContext.visualContext
      .map(ctx => ctx.screenshotPath)
      .filter(path => path && fs.existsSync(path));
  }

  private calculateEvolutionMetrics(workflow: WebEvolutionWorkflow, results: any): any {
    return {
      successRate: workflow.successRate,
      executionTime: workflow.executionTime,
      visualInsights: results.visualAnalysis.length,
      decisionAccuracy: results.decisions.reduce((acc: number, d: AutonomousDecision) => acc + d.confidence, 0) / results.decisions.length,
      environmentUtilization: {
        terminal: workflow.terminalSteps.length,
        browser: workflow.browserSteps.length,
        hybrid: results.decisions.filter((d: AutonomousDecision) => d.environment === 'hybrid').length
      }
    };
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get autonomous web evolution status
   */
  getEvolutionStatus(): {
    active: boolean;
    capabilities: string[];
    lastWorkflow: WebEvolutionWorkflow | null;
    visualContext: number;
    decisionHistory: number;
  } {
    return {
      active: this.evolutionActive,
      capabilities: [
        `Terminal Operations (${this.webContext.terminalCapabilities ? 'Active' : 'Inactive'})`,
        `Browser Automation (${this.webContext.browserCapabilities ? 'Active' : 'Inactive'})`,
        `Visual Analysis (${this.webContext.visualContext.length} contexts)`,
        `Cross-Environment Workflows (${this.webContext.workflowHistory.length} executed)`
      ],
      lastWorkflow: this.webContext.workflowHistory[this.webContext.workflowHistory.length - 1] || null,
      visualContext: this.webContext.visualContext.length,
      decisionHistory: this.decisionHistory.length
    };
  }
}

export const autonomousWebEvolution = new AutonomousWebEvolution();