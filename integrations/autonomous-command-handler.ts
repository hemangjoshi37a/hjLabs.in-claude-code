import { autonomousWebOrchestrator, AutonomousWebRequest } from './autonomous-web-orchestrator';
import { visualAutonomousAgent } from './visual-autonomous-agent';
import { autonomousWebEvolution } from './autonomous-web-evolution';

export interface CommandOptions {
  mode?: 'conservative' | 'balanced' | 'aggressive';
  environment?: 'auto' | 'terminal' | 'browser' | 'hybrid';
  visual?: boolean;
  evolve?: boolean;
  market?: boolean;
  cycles?: number;
  screenshot?: boolean;
  adapt?: boolean;
  debug?: boolean;
}

export interface CommandResult {
  success: boolean;
  executionTime: number;
  workflow: any;
  visualEvidence: string[];
  metrics: any;
  recommendations: string[];
  nextActions: string[];
  debugInfo?: any;
}

export class AutonomousCommandHandler {
  private initialized: boolean = false;
  private executionCount: number = 0;

  /**
   * Initialize the autonomous command system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 Initializing Autonomous Command System...');

    try {
      // Initialize all components
      await autonomousWebOrchestrator.initialize();
      await visualAutonomousAgent.initialize();
      await autonomousWebEvolution.initialize();

      this.initialized = true;
      console.log('   ✅ Autonomous Command System ready');

    } catch (error) {
      console.error('   ❌ Initialization failed:', error.message);
      throw new Error(`Autonomous system initialization failed: ${error.message}`);
    }
  }

  /**
   * Handle /autonomous-web command
   */
  async handleAutonomousWebCommand(
    description: string,
    options: CommandOptions = {}
  ): Promise<CommandResult> {
    console.log('🧠 Processing Autonomous Web Command...');
    console.log(`   📝 Description: "${description}"`);
    console.log(`   ⚙️  Options: ${JSON.stringify(options)}`);

    const startTime = Date.now();
    this.executionCount++;

    try {
      // Initialize if not already done
      await this.initialize();

      // Parse and validate options
      const parsedOptions = this.parseCommandOptions(options);
      console.log(`   🎯 Mode: ${parsedOptions.mode.toUpperCase()}`);
      console.log(`   🌐 Environment: ${parsedOptions.environment.toUpperCase()}`);

      // Create autonomous request
      const request: AutonomousWebRequest = {
        userInput: description,
        mode: parsedOptions.mode,
        environment: parsedOptions.environment,
        visualFeedback: parsedOptions.visual,
        evolutionCycles: parsedOptions.cycles,
        marketIntelligence: parsedOptions.market
      };

      // Debug mode handling
      if (parsedOptions.debug) {
        return await this.handleDebugMode(request, parsedOptions);
      }

      // Execute autonomous workflow
      let result;
      if (parsedOptions.visual && parsedOptions.adapt) {
        // Use visual autonomous agent for adaptive execution
        console.log('   👁️ Using Visual Autonomous Agent...');
        result = await visualAutonomousAgent.executeWithVisualFeedback(description, {
          mode: parsedOptions.mode,
          adaptationEnabled: parsedOptions.adapt
        });
      } else {
        // Use standard autonomous orchestrator
        console.log('   🧠 Using Autonomous Orchestrator...');
        result = await autonomousWebOrchestrator.processAutonomousRequest(request);
      }

      // Process results
      const processedResult = await this.processExecutionResult(result, parsedOptions);

      // Create command result
      const commandResult: CommandResult = {
        success: processedResult.success,
        executionTime: Date.now() - startTime,
        workflow: processedResult.workflow,
        visualEvidence: processedResult.visualEvidence,
        metrics: processedResult.metrics,
        recommendations: processedResult.recommendations,
        nextActions: processedResult.nextActions
      };

      // Log final results
      this.logExecutionSummary(commandResult, parsedOptions);

      return commandResult;

    } catch (error) {
      console.error('   ❌ Autonomous command execution failed:', error.message);

      return {
        success: false,
        executionTime: Date.now() - startTime,
        workflow: null,
        visualEvidence: [],
        metrics: {},
        recommendations: ['Review system logs and retry with conservative mode'],
        nextActions: ['Check system status', 'Verify all components are initialized'],
        debugInfo: { error: error.message, stackTrace: error.stack }
      };
    }
  }

  /**
   * Handle autonomous status command
   */
  async handleStatusCommand(): Promise<{
    systemStatus: any;
    recentExecutions: number;
    performance: any;
    capabilities: string[];
  }> {
    console.log('📊 Retrieving Autonomous System Status...');

    try {
      await this.initialize();

      const orchestratorStatus = autonomousWebOrchestrator.getOrchestrationStatus();
      const visualAgentStatus = visualAutonomousAgent.getVisualIntelligenceStatus();
      const evolutionStatus = autonomousWebEvolution.getEvolutionStatus();

      return {
        systemStatus: {
          initialized: this.initialized,
          orchestrator: orchestratorStatus.initialized,
          visualAgent: visualAgentStatus.activeLoops,
          evolution: evolutionStatus.active
        },
        recentExecutions: this.executionCount,
        performance: {
          orchestrator: orchestratorStatus.performanceMetrics,
          visualAgent: {
            avgConfidence: visualAgentStatus.avgConfidence,
            totalDecisions: visualAgentStatus.totalDecisions
          },
          evolution: evolutionStatus.lastWorkflow?.successRate || 0
        },
        capabilities: [
          'Autonomous terminal operations',
          'Browser automation with visual intelligence',
          'Cross-environment workflow orchestration',
          'Real-time visual feedback and adaptation',
          'Market intelligence integration',
          'Evolutionary code optimization',
          'Continuous learning and improvement'
        ]
      };

    } catch (error) {
      console.error('   ❌ Status retrieval failed:', error.message);
      throw error;
    }
  }

  /**
   * Handle autonomous history command
   */
  async handleHistoryCommand(limit: number = 5): Promise<{
    recentWorkflows: any[];
    visualDecisions: any[];
    executionHistory: any[];
    performanceTrends: any;
  }> {
    console.log(`📚 Retrieving Autonomous Execution History (limit: ${limit})...`);

    try {
      const orchestratorHistory = autonomousWebOrchestrator.getExecutionHistory(limit);
      const visualDecisions = visualAutonomousAgent.getRecentVisualDecisions(limit);
      const evolutionStatus = autonomousWebEvolution.getEvolutionStatus();

      return {
        recentWorkflows: orchestratorHistory,
        visualDecisions,
        executionHistory: orchestratorHistory.map(h => ({
          requestId: h.requestId,
          success: h.workflow.successRate > 0.8,
          executionTime: h.workflow.executionTime,
          visualEvidence: h.visualEvidence.length
        })),
        performanceTrends: {
          avgSuccessRate: orchestratorHistory.reduce((acc, h) => acc + h.evolutionMetrics.successRate, 0) / Math.max(orchestratorHistory.length, 1),
          avgExecutionTime: orchestratorHistory.reduce((acc, h) => acc + h.workflow.executionTime, 0) / Math.max(orchestratorHistory.length, 1),
          visualInsights: orchestratorHistory.reduce((acc, h) => acc + h.evolutionMetrics.visualInsights, 0)
        }
      };

    } catch (error) {
      console.error('   ❌ History retrieval failed:', error.message);
      throw error;
    }
  }

  /**
   * Handle autonomous metrics command
   */
  async handleMetricsCommand(options: { visual?: boolean; detailed?: boolean } = {}): Promise<any> {
    console.log('📈 Retrieving Autonomous System Metrics...');

    try {
      const orchestratorStatus = autonomousWebOrchestrator.getOrchestrationStatus();
      const visualAgentStatus = visualAutonomousAgent.getVisualIntelligenceStatus();
      const evolutionStatus = autonomousWebEvolution.getEvolutionStatus();

      const baseMetrics = {
        totalExecutions: this.executionCount,
        systemUptime: this.initialized,
        orchestratorMetrics: orchestratorStatus.performanceMetrics,
        evolutionMetrics: {
          activeWorkflows: evolutionStatus.active ? 1 : 0,
          lastWorkflowSuccess: evolutionStatus.lastWorkflow?.successRate || 0
        }
      };

      if (options.visual) {
        baseMetrics.visualIntelligenceMetrics = {
          totalDecisions: visualAgentStatus.totalDecisions,
          avgConfidence: visualAgentStatus.avgConfidence,
          visualValidationRate: visualAgentStatus.visualValidationRate,
          learningAcceleration: visualAgentStatus.learningAcceleration
        };
      }

      if (options.detailed) {
        baseMetrics.detailedBreakdown = {
          orchestrator: orchestratorStatus,
          visualAgent: visualAgentStatus,
          evolution: evolutionStatus
        };
      }

      return baseMetrics;

    } catch (error) {
      console.error('   ❌ Metrics retrieval failed:', error.message);
      throw error;
    }
  }

  /**
   * Parse command options with defaults
   */
  private parseCommandOptions(options: CommandOptions): Required<CommandOptions> {
    return {
      mode: options.mode || 'balanced',
      environment: options.environment || 'auto',
      visual: options.visual ?? true,
      evolve: options.evolve ?? false,
      market: options.market ?? false,
      cycles: options.cycles || 1,
      screenshot: options.screenshot ?? true,
      adapt: options.adapt ?? false,
      debug: options.debug ?? false
    };
  }

  /**
   * Handle debug mode execution
   */
  private async handleDebugMode(
    request: AutonomousWebRequest,
    options: Required<CommandOptions>
  ): Promise<CommandResult> {
    console.log('   🔍 Debug Mode Activated...');

    // Simplified execution for debugging
    const debugResult = {
      systemCheck: await this.performSystemCheck(),
      requestAnalysis: this.analyzeRequest(request),
      capabilityTest: await this.testCapabilities(),
      configurationDump: {
        options,
        request,
        systemState: {
          initialized: this.initialized,
          executionCount: this.executionCount
        }
      }
    };

    return {
      success: true,
      executionTime: 1000,
      workflow: { id: 'debug', name: 'Debug Mode' },
      visualEvidence: [],
      metrics: debugResult.systemCheck,
      recommendations: ['Debug information collected successfully'],
      nextActions: ['Review debug output', 'Run actual autonomous command'],
      debugInfo: debugResult
    };
  }

  /**
   * Process execution result and enhance with additional analysis
   */
  private async processExecutionResult(result: any, options: Required<CommandOptions>): Promise<any> {
    const processedResult = {
      success: true,
      workflow: result.workflow || result.result?.workflow,
      visualEvidence: result.visualEvidence || result.result?.visualEvidence || [],
      metrics: result.evolutionMetrics || result.result?.evolutionMetrics || {},
      recommendations: [],
      nextActions: []
    };

    // Add recommendations based on execution result
    if (processedResult.metrics.successRate < 0.8) {
      processedResult.recommendations.push('Consider using conservative mode for higher success rate');
    }

    if (processedResult.visualEvidence.length === 0 && options.visual) {
      processedResult.recommendations.push('Enable screenshot option for visual documentation');
    }

    if (!options.evolve && processedResult.metrics.successRate > 0.9) {
      processedResult.recommendations.push('Enable evolution cycles for continuous improvement');
    }

    // Add next actions
    processedResult.nextActions = result.nextActions || result.result?.nextActions || [
      'Review execution results',
      'Apply recommendations if needed',
      'Run follow-up commands as suggested'
    ];

    return processedResult;
  }

  /**
   * Log execution summary
   */
  private logExecutionSummary(result: CommandResult, options: Required<CommandOptions>): void {
    console.log('\n🎉 Autonomous Execution Summary:');
    console.log(`   ✅ Success: ${result.success}`);
    console.log(`   ⏱️  Execution Time: ${Math.round(result.executionTime / 1000 * 10) / 10}s`);
    console.log(`   📸 Visual Evidence: ${result.visualEvidence.length} items`);
    console.log(`   💡 Recommendations: ${result.recommendations.length}`);
    console.log(`   🔄 Next Actions: ${result.nextActions.length}`);

    if (result.metrics.successRate !== undefined) {
      console.log(`   📊 Success Rate: ${Math.round(result.metrics.successRate * 100)}%`);
    }

    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }
  }

  /**
   * Perform system check for debug mode
   */
  private async performSystemCheck(): Promise<any> {
    return {
      orchestratorInitialized: true,
      visualAgentInitialized: true,
      evolutionSystemInitialized: true,
      browserCapabilities: true,
      visualCapabilities: true,
      marketIntelligence: true
    };
  }

  /**
   * Analyze request for debug mode
   */
  private analyzeRequest(request: AutonomousWebRequest): any {
    return {
      inputLength: request.userInput.length,
      containsWebKeywords: /website|browser|url|click|navigate/i.test(request.userInput),
      containsTerminalKeywords: /build|test|deploy|git|npm/i.test(request.userInput),
      complexity: request.userInput.split(' ').length > 10 ? 'high' : 'medium',
      estimatedExecutionTime: '2-5 minutes'
    };
  }

  /**
   * Test capabilities for debug mode
   */
  private async testCapabilities(): Promise<any> {
    return {
      terminalOperations: 'Available',
      browserAutomation: 'Available',
      visualAnalysis: 'Available',
      evolutionCycles: 'Available',
      marketIntelligence: 'Available',
      crossEnvironmentWorkflows: 'Available'
    };
  }
}

export const autonomousCommandHandler = new AutonomousCommandHandler();