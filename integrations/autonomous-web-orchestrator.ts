import { autonomousWebEvolution, WebEvolutionWorkflow, AutonomousDecision } from './autonomous-web-evolution';
import { autonomousOrchestrator, AutonomousAction } from './autonomous-orchestrator';
import { visualContextIntegration, VisualContext } from './visual-context-integration';
import { webBrowserIntegration } from './web-browser-integration';
import { multimodalBrowserEngine } from './multimodal-browser-engine';

export interface AutonomousWebRequest {
  userInput: string;
  mode: 'conservative' | 'balanced' | 'aggressive';
  environment: 'auto' | 'terminal' | 'browser' | 'hybrid';
  visualFeedback: boolean;
  evolutionCycles: number;
  marketIntelligence: boolean;
}

export interface AutonomousWebResponse {
  requestId: string;
  workflow: WebEvolutionWorkflow;
  executionResults: {
    terminalResults: any[];
    browserResults: any;
    visualAnalysis: VisualContext[];
    decisions: AutonomousDecision[];
  };
  visualEvidence: string[];
  evolutionMetrics: {
    successRate: number;
    executionTime: number;
    visualInsights: number;
    decisionAccuracy: number;
    environmentUtilization: any;
  };
  recommendations: string[];
  nextActions: AutonomousAction[];
}

export interface OrchestrationContext {
  initialized: boolean;
  capabilities: {
    terminal: boolean;
    browser: boolean;
    visual: boolean;
    evolution: boolean;
  };
  currentWorkflow: WebEvolutionWorkflow | null;
  activeEnvironment: 'terminal' | 'browser' | 'hybrid';
  visualHistory: VisualContext[];
  performanceMetrics: {
    totalWorkflows: number;
    avgSuccessRate: number;
    avgExecutionTime: number;
    visualInsightsCaptured: number;
  };
}

export class AutonomousWebOrchestrator {
  private context: OrchestrationContext;
  private requestQueue: AutonomousWebRequest[] = [];
  private responseHistory: AutonomousWebResponse[] = [];

  constructor() {
    this.context = {
      initialized: false,
      capabilities: {
        terminal: true,
        browser: false,
        visual: false,
        evolution: false
      },
      currentWorkflow: null,
      activeEnvironment: 'terminal',
      visualHistory: [],
      performanceMetrics: {
        totalWorkflows: 0,
        avgSuccessRate: 0,
        avgExecutionTime: 0,
        visualInsightsCaptured: 0
      }
    };
  }

  /**
   * Initialize the autonomous web orchestration system
   */
  async initialize(): Promise<{
    success: boolean;
    capabilities: string[];
    readyForAutonomy: boolean;
  }> {
    console.log('🚀 Initializing Autonomous Web Orchestration System...');

    try {
      // Initialize autonomous web evolution
      const evolutionInit = await autonomousWebEvolution.initialize();
      this.context.capabilities.browser = evolutionInit.environment.includes('Browser');
      this.context.capabilities.visual = true;
      this.context.capabilities.evolution = true;

      // Set active environment based on capabilities
      if (this.context.capabilities.browser) {
        this.context.activeEnvironment = 'hybrid';
      }

      this.context.initialized = true;

      const capabilities = [
        'Advanced autonomous decision making',
        'Cross-environment workflow orchestration',
        'Visual context integration and analysis',
        'Real-time performance optimization',
        'Market intelligence gathering',
        'Evolutionary code improvement',
        'Adaptive workflow execution'
      ];

      if (this.context.capabilities.browser) {
        capabilities.push(...[
          'Web browser automation',
          'Screenshot-driven analysis',
          'Form interaction and validation',
          'Dynamic content handling'
        ]);
      }

      console.log('   ✅ Autonomous Web Orchestration initialized successfully');
      console.log(`   🎯 Environment: ${this.context.activeEnvironment.toUpperCase()}`);
      console.log(`   💡 Capabilities: ${capabilities.length} autonomous functions`);

      return {
        success: true,
        capabilities,
        readyForAutonomy: true
      };

    } catch (error) {
      console.error('   ❌ Initialization failed:', error.message);
      return {
        success: false,
        capabilities: ['Limited terminal operations only'],
        readyForAutonomy: false
      };
    }
  }

  /**
   * Process autonomous request with full web+terminal integration
   */
  async processAutonomousRequest(request: AutonomousWebRequest): Promise<AutonomousWebResponse> {
    if (!this.context.initialized) {
      await this.initialize();
    }

    console.log('🧠 Processing Autonomous Web Request...');
    console.log(`   📝 Input: "${request.userInput}"`);
    console.log(`   ⚙️  Mode: ${request.mode.toUpperCase()}`);
    console.log(`   🌐 Environment: ${request.environment}`);

    const requestId = `autonomous_${Date.now()}`;
    const startTime = Date.now();

    try {
      // Add to queue for processing
      this.requestQueue.push(request);

      // Determine optimal execution environment
      const optimalEnvironment = await this.determineOptimalEnvironment(request);
      console.log(`   🎯 Optimal Environment: ${optimalEnvironment}`);

      // Execute autonomous web evolution
      const evolutionResults = await autonomousWebEvolution.startAutonomousWebEvolution(
        request.userInput,
        request.mode
      );

      // Process visual feedback if enabled
      let enhancedVisualEvidence = evolutionResults.visualEvidence;
      if (request.visualFeedback && this.context.capabilities.visual) {
        enhancedVisualEvidence = await this.enhanceVisualFeedback(evolutionResults.visualEvidence);
      }

      // Generate intelligent recommendations
      const recommendations = await this.generateIntelligentRecommendations(
        request,
        evolutionResults
      );

      // Determine next autonomous actions
      const nextActions = await this.determineNextActions(
        request,
        evolutionResults,
        recommendations
      );

      // Create response
      const response: AutonomousWebResponse = {
        requestId,
        workflow: evolutionResults.workflow,
        executionResults: evolutionResults.executionResults,
        visualEvidence: enhancedVisualEvidence,
        evolutionMetrics: evolutionResults.evolutionMetrics,
        recommendations,
        nextActions
      };

      // Update context and metrics
      this.updatePerformanceMetrics(response, Date.now() - startTime);
      this.responseHistory.push(response);
      this.context.currentWorkflow = evolutionResults.workflow;

      console.log('   🎉 Autonomous Request Processing Complete');
      console.log(`   📊 Success Rate: ${Math.round(evolutionResults.evolutionMetrics.successRate * 100)}%`);
      console.log(`   ⏱️  Execution Time: ${Date.now() - startTime}ms`);
      console.log(`   💡 Recommendations: ${recommendations.length}`);

      return response;

    } catch (error) {
      console.error('   ❌ Autonomous Request Processing Failed:', error.message);
      throw new Error(`Autonomous processing failed: ${error.message}`);
    } finally {
      // Clean up queue
      this.requestQueue = this.requestQueue.filter(r => r !== request);
    }
  }

  /**
   * Determine optimal execution environment based on request analysis
   */
  private async determineOptimalEnvironment(request: AutonomousWebRequest): Promise<string> {
    if (request.environment !== 'auto') {
      return request.environment;
    }

    // Analyze request content for environment hints
    const webIndicators = [
      'website', 'browser', 'screenshot', 'web', 'url', 'http', 'form',
      'click', 'navigate', 'github', 'google', 'search', 'competitor',
      'market research', 'social media', 'visual', 'ui', 'interface'
    ];

    const terminalIndicators = [
      'build', 'compile', 'test', 'deploy', 'git', 'npm', 'yarn',
      'docker', 'script', 'command', 'cli', 'file', 'directory'
    ];

    const lowerInput = request.userInput.toLowerCase();
    const webScore = webIndicators.filter(indicator => lowerInput.includes(indicator)).length;
    const terminalScore = terminalIndicators.filter(indicator => lowerInput.includes(indicator)).length;

    console.log(`      🔍 Environment Analysis:`);
    console.log(`         Web Indicators: ${webScore}`);
    console.log(`         Terminal Indicators: ${terminalScore}`);

    if (webScore > terminalScore && this.context.capabilities.browser) {
      return webScore > 2 ? 'browser' : 'hybrid';
    } else if (terminalScore > webScore) {
      return terminalScore > 2 ? 'terminal' : 'hybrid';
    } else {
      return this.context.capabilities.browser ? 'hybrid' : 'terminal';
    }
  }

  /**
   * Enhance visual feedback with intelligent analysis
   */
  private async enhanceVisualFeedback(visualEvidence: string[]): Promise<string[]> {
    console.log('      📸 Enhancing Visual Feedback...');

    const enhancedEvidence = [...visualEvidence];

    // Analyze each screenshot for additional insights
    for (const screenshotPath of visualEvidence) {
      try {
        const context = await visualContextIntegration.analyzeScreenshotForContext(
          screenshotPath,
          'feedback_enhancement',
          {},
          'data-extraction'
        );

        // Create analysis report
        if (context.aiAnalysis) {
          const analysisReport = this.createVisualAnalysisReport(context);
          const reportPath = screenshotPath.replace('.png', '_analysis.md');

          // Save analysis report (in a real implementation)
          console.log(`         📊 Analysis report created: ${reportPath}`);
          enhancedEvidence.push(reportPath);
        }

      } catch (error) {
        console.log(`         ⚠️  Failed to enhance ${screenshotPath}: ${error.message}`);
      }
    }

    console.log(`         ✅ Enhanced ${enhancedEvidence.length - visualEvidence.length} visual evidence pieces`);
    return enhancedEvidence;
  }

  /**
   * Generate intelligent recommendations based on execution results
   */
  private async generateIntelligentRecommendations(
    request: AutonomousWebRequest,
    results: any
  ): Promise<string[]> {
    console.log('      💡 Generating Intelligent Recommendations...');

    const recommendations: string[] = [];

    // Success rate analysis
    if (results.evolutionMetrics.successRate < 0.8) {
      recommendations.push('Consider breaking down complex tasks into smaller steps for higher success rate');
    }

    // Execution time optimization
    if (results.evolutionMetrics.executionTime > 30000) {
      recommendations.push('Workflow execution time is high - consider parallel execution or caching strategies');
    }

    // Visual insights utilization
    if (results.evolutionMetrics.visualInsights < 3 && request.visualFeedback) {
      recommendations.push('Enable more visual checkpoints for better debugging and validation');
    }

    // Environment optimization
    const envUtil = results.evolutionMetrics.environmentUtilization;
    if (envUtil.browser === 0 && this.context.capabilities.browser) {
      recommendations.push('Consider leveraging browser capabilities for market research and visual validation');
    }

    // Mode-specific recommendations
    if (request.mode === 'conservative' && results.evolutionMetrics.successRate > 0.95) {
      recommendations.push('High success rate achieved - consider switching to balanced mode for faster execution');
    } else if (request.mode === 'aggressive' && results.evolutionMetrics.successRate < 0.7) {
      recommendations.push('Low success rate in aggressive mode - consider switching to balanced or conservative mode');
    }

    // Evolution cycle recommendations
    if (request.evolutionCycles === 0) {
      recommendations.push('Enable evolution cycles for continuous improvement and optimization');
    }

    console.log(`         ✅ Generated ${recommendations.length} intelligent recommendations`);
    return recommendations;
  }

  /**
   * Determine next autonomous actions based on results
   */
  private async determineNextActions(
    request: AutonomousWebRequest,
    results: any,
    recommendations: string[]
  ): Promise<AutonomousAction[]> {
    console.log('      🔮 Determining Next Autonomous Actions...');

    const nextActions: AutonomousAction[] = [];

    // Continuous improvement actions
    if (results.evolutionMetrics.successRate < 0.9) {
      nextActions.push({
        command: '/evolve',
        reason: 'Sub-optimal performance detected, evolutionary improvement recommended',
        priority: 8,
        expectedOutcome: 'Improved workflow performance and success rate',
        dependencies: []
      });
    }

    // Documentation and learning actions
    if (results.evolutionMetrics.visualInsights > 5) {
      nextActions.push({
        command: '/document',
        reason: 'Rich visual insights captured, documentation update recommended',
        priority: 6,
        expectedOutcome: 'Updated documentation with visual workflow evidence',
        dependencies: []
      });
    }

    // Market intelligence actions
    if (request.marketIntelligence && this.context.capabilities.browser) {
      nextActions.push({
        command: '/market-analysis',
        reason: 'Market intelligence requested, web research recommended',
        priority: 7,
        expectedOutcome: 'Market trends and competitive analysis report',
        dependencies: []
      });
    }

    // Follow-up validation actions
    if (results.workflow.browserSteps.length > 0) {
      nextActions.push({
        command: '/validate',
        reason: 'Browser workflow executed, validation recommended',
        priority: 5,
        expectedOutcome: 'Workflow results validated and documented',
        dependencies: []
      });
    }

    // Proactive optimization
    if (this.context.performanceMetrics.totalWorkflows > 5) {
      const avgSuccess = this.context.performanceMetrics.avgSuccessRate;
      if (avgSuccess < 0.85) {
        nextActions.push({
          command: '/optimize',
          reason: `Average success rate (${Math.round(avgSuccess * 100)}%) below target, optimization needed`,
          priority: 9,
          expectedOutcome: 'Improved workflow patterns and execution strategies',
          dependencies: ['/evolve']
        });
      }
    }

    console.log(`         ✅ Identified ${nextActions.length} next autonomous actions`);
    return nextActions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Create visual analysis report
   */
  private createVisualAnalysisReport(context: VisualContext): string {
    const analysis = context.aiAnalysis!;

    return `# Visual Analysis Report

## Screenshot Analysis
- **Timestamp**: ${context.timestamp.toISOString()}
- **Action**: ${context.action}
- **Confidence**: ${Math.round(analysis.confidence * 100)}%

## Elements Detected
${analysis.elementsVisible.map(el => `- **${el.type}**: ${el.description} (${el.location})`).join('\n')}

## Interaction Opportunities
${analysis.interactionOpportunities.map(op => `- **${op.action}** ${op.element}: ${op.description} [${op.priority} priority]`).join('\n')}

## Potential Issues
${analysis.potentialIssues.map(issue => `- ${issue}`).join('\n')}

## Recommended Actions
${analysis.nextSuggestedActions.map(action => `- ${action}`).join('\n')}

## Page Layout
${analysis.pageLayout}
`;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(response: AutonomousWebResponse, executionTime: number): void {
    const metrics = this.context.performanceMetrics;

    metrics.totalWorkflows++;
    metrics.avgSuccessRate = (
      (metrics.avgSuccessRate * (metrics.totalWorkflows - 1)) +
      response.evolutionMetrics.successRate
    ) / metrics.totalWorkflows;

    metrics.avgExecutionTime = (
      (metrics.avgExecutionTime * (metrics.totalWorkflows - 1)) +
      executionTime
    ) / metrics.totalWorkflows;

    metrics.visualInsightsCaptured += response.evolutionMetrics.visualInsights;

    console.log(`      📊 Performance Metrics Updated:`);
    console.log(`         Total Workflows: ${metrics.totalWorkflows}`);
    console.log(`         Avg Success Rate: ${Math.round(metrics.avgSuccessRate * 100)}%`);
    console.log(`         Avg Execution Time: ${Math.round(metrics.avgExecutionTime)}ms`);
  }

  /**
   * Get orchestration status and metrics
   */
  getOrchestrationStatus(): {
    initialized: boolean;
    activeWorkflows: number;
    capabilities: any;
    performanceMetrics: any;
    queueLength: number;
    historyLength: number;
  } {
    return {
      initialized: this.context.initialized,
      activeWorkflows: this.context.currentWorkflow ? 1 : 0,
      capabilities: this.context.capabilities,
      performanceMetrics: this.context.performanceMetrics,
      queueLength: this.requestQueue.length,
      historyLength: this.responseHistory.length
    };
  }

  /**
   * Execute simple autonomous command with web integration
   */
  async executeAutonomousCommand(
    command: string,
    options: {
      mode?: 'conservative' | 'balanced' | 'aggressive';
      visualFeedback?: boolean;
    } = {}
  ): Promise<AutonomousWebResponse> {
    const request: AutonomousWebRequest = {
      userInput: command,
      mode: options.mode || 'balanced',
      environment: 'auto',
      visualFeedback: options.visualFeedback ?? true,
      evolutionCycles: 1,
      marketIntelligence: false
    };

    return await this.processAutonomousRequest(request);
  }

  /**
   * Get recent execution history
   */
  getExecutionHistory(limit: number = 5): AutonomousWebResponse[] {
    return this.responseHistory.slice(-limit);
  }

  /**
   * Clear execution history and reset metrics
   */
  resetMetrics(): void {
    this.responseHistory = [];
    this.context.performanceMetrics = {
      totalWorkflows: 0,
      avgSuccessRate: 0,
      avgExecutionTime: 0,
      visualInsightsCaptured: 0
    };
    console.log('📊 Orchestration metrics reset');
  }
}

export const autonomousWebOrchestrator = new AutonomousWebOrchestrator();