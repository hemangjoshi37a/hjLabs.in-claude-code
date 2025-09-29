import { marketIntelligence, MarketIntelligenceEngine } from './market-intelligence';
import { autonomousOrchestrator } from './autonomous-orchestrator';
import * as fs from 'fs';
import * as path from 'path';

export interface FeedbackData {
  source: 'user' | 'system' | 'market' | 'performance' | 'evolution';
  type: 'success' | 'failure' | 'improvement' | 'bug' | 'feature_request' | 'performance_issue';
  content: string;
  metrics?: {
    performance?: number;
    userSatisfaction?: number;
    codeQuality?: number;
    marketAlignment?: number;
  };
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionTaken?: string;
  outcome?: string;
}

export interface EvolutionCycle {
  id: string;
  startTime: Date;
  endTime?: Date;
  trigger: 'scheduled' | 'feedback' | 'market_change' | 'performance_drop' | 'user_request';
  actionsPerformed: string[];
  metricsBefor: any;
  metricsAfter?: any;
  success: boolean;
  learnings: string[];
  nextRecommendations: string[];
}

export interface LearningModel {
  pattern: string;
  confidence: number;
  successRate: number;
  context: string[];
  outcomes: string[];
  recommendations: string[];
}

export class ContinuousFeedbackLoop {
  private feedbackHistory: FeedbackData[] = [];
  private evolutionHistory: EvolutionCycle[] = [];
  private learningModels: LearningModel[] = [];
  private isActive: boolean = false;
  private cycleInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadHistoricalData();
  }

  /**
   * Start the continuous feedback and evolution loop
   */
  public startContinuousLoop(): void {
    if (this.isActive) return;

    console.log('🔄 Continuous Feedback Loop Activated');
    console.log('   Monitoring project health and market conditions...\n');

    this.isActive = true;

    // Run initial analysis
    this.runEvolutionCycle('scheduled');

    // Set up periodic evolution cycles (daily)
    this.cycleInterval = setInterval(() => {
      this.runEvolutionCycle('scheduled');
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Monitor for real-time feedback
    this.startRealtimeMonitoring();
  }

  /**
   * Stop the continuous feedback loop
   */
  public stopContinuousLoop(): void {
    this.isActive = false;
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
    console.log('🛑 Continuous Feedback Loop Stopped');
  }

  /**
   * Process incoming feedback and trigger appropriate responses
   */
  public async processFeedback(feedback: FeedbackData): Promise<{
    action: string;
    reasoning: string;
    evolutionTriggered: boolean;
  }> {
    this.feedbackHistory.push(feedback);
    this.saveHistoricalData();

    // Analyze feedback severity and determine response
    const response = await this.analyzeFeedbackAndRespond(feedback);

    // Check if evolution cycle should be triggered
    const shouldEvolve = this.shouldTriggerEvolution(feedback);

    if (shouldEvolve) {
      await this.runEvolutionCycle('feedback');
      response.evolutionTriggered = true;
    }

    // Update learning models
    this.updateLearningModels(feedback, response);

    return response;
  }

  /**
   * Run a complete evolution cycle
   */
  private async runEvolutionCycle(trigger: EvolutionCycle['trigger']): Promise<EvolutionCycle> {
    const cycle: EvolutionCycle = {
      id: this.generateCycleId(),
      startTime: new Date(),
      trigger,
      actionsPerformed: [],
      metricsBefor: await this.captureMetrics(),
      success: false,
      learnings: [],
      nextRecommendations: []
    };

    console.log(`🧬 Evolution Cycle ${cycle.id} Started (${trigger})`);

    try {
      // Gather intelligence
      const intelligence = await marketIntelligence.gatherIntelligence(
        this.determineProjectDomain(),
        this.extractRelevantKeywords()
      );

      // Get autonomous recommendations
      const orchestration = await autonomousOrchestrator.startAutonomousEvolution(
        this.synthesizeFeedbackForInput()
      );

      // Execute recommended actions
      for (const action of orchestration.actions) {
        try {
          const result = await this.executeAction(action.command, action.reason);
          cycle.actionsPerformed.push(`${action.command}: ${result}`);
        } catch (error) {
          console.warn(`⚠️  Action ${action.command} failed: ${error}`);
          cycle.actionsPerformed.push(`${action.command}: FAILED - ${error}`);
        }
      }

      // Capture post-evolution metrics
      cycle.metricsAfter = await this.captureMetrics();

      // Analyze success and generate learnings
      cycle.success = this.evaluateEvolutionSuccess(cycle);
      cycle.learnings = this.extractLearnings(cycle);
      cycle.nextRecommendations = intelligence.recommendations;

      cycle.endTime = new Date();

      console.log(`✅ Evolution Cycle ${cycle.id} Completed (${cycle.success ? 'SUCCESS' : 'PARTIAL'})`);

    } catch (error) {
      cycle.endTime = new Date();
      cycle.success = false;
      cycle.learnings.push(`Evolution failed: ${error}`);
      console.error(`❌ Evolution Cycle ${cycle.id} Failed: ${error}`);
    }

    this.evolutionHistory.push(cycle);
    this.saveHistoricalData();

    return cycle;
  }

  /**
   * Analyze feedback and determine appropriate response
   */
  private async analyzeFeedbackAndRespond(feedback: FeedbackData): Promise<{
    action: string;
    reasoning: string;
    evolutionTriggered: boolean;
  }> {
    let action = 'Monitor';
    let reasoning = 'Feedback noted and logged for analysis';

    switch (feedback.type) {
      case 'bug':
        if (feedback.priority === 'critical') {
          action = 'Immediate Fix Required';
          reasoning = 'Critical bug detected - triggering emergency fix workflow';
        } else {
          action = 'Schedule Bug Fix';
          reasoning = 'Bug added to fix queue based on priority level';
        }
        break;

      case 'performance_issue':
        action = 'Performance Analysis';
        reasoning = 'Performance degradation detected - scheduling optimization';
        break;

      case 'feature_request':
        if (feedback.priority === 'high') {
          action = 'Evaluate Feature';
          reasoning = 'High-priority feature request - analyzing market fit and feasibility';
        }
        break;

      case 'success':
        action = 'Reinforce Success';
        reasoning = 'Positive outcome detected - analyzing for replication patterns';
        break;
    }

    return {
      action,
      reasoning,
      evolutionTriggered: false
    };
  }

  /**
   * Determine if feedback should trigger evolution cycle
   */
  private shouldTriggerEvolution(feedback: FeedbackData): boolean {
    // Critical issues trigger immediate evolution
    if (feedback.priority === 'critical') return true;

    // Performance issues with metrics below threshold
    if (feedback.type === 'performance_issue' &&
        feedback.metrics?.performance &&
        feedback.metrics.performance < 70) {
      return true;
    }

    // Accumulation of medium/high priority feedback
    const recentFeedback = this.feedbackHistory.filter(f =>
      Date.now() - f.timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const highPriorityCount = recentFeedback.filter(f =>
      f.priority === 'high' || f.priority === 'critical'
    ).length;

    return highPriorityCount >= 3; // Threshold for evolution trigger
  }

  /**
   * Execute autonomous actions
   */
  private async executeAction(command: string, reason: string): Promise<string> {
    console.log(`🎯 Executing: ${command}`);
    console.log(`   Reason: ${reason}`);

    // Mock execution - in production would call actual command handlers
    switch (command) {
      case '/constitution':
        return 'Project constitution created/updated';
      case '/specify':
        return 'Requirements specification generated';
      case '/plan':
        return 'Implementation plan created';
      case '/tasks':
        return 'Task breakdown completed';
      case '/implement':
        return 'Implementation executed';
      case '/evolve':
        return 'Evolutionary optimization completed';
      default:
        return `Command ${command} executed`;
    }
  }

  /**
   * Capture current project metrics
   */
  private async captureMetrics(): Promise<any> {
    return {
      timestamp: new Date(),
      codeQuality: this.assessCodeQuality(),
      performance: this.measurePerformance(),
      userSatisfaction: this.getUserSatisfactionScore(),
      marketAlignment: this.getMarketAlignmentScore(),
      technicalDebt: this.assessTechnicalDebt(),
      testCoverage: this.getTestCoverage(),
      buildSuccess: this.getBuildSuccessRate()
    };
  }

  /**
   * Update learning models based on feedback and outcomes
   */
  private updateLearningModels(feedback: FeedbackData, response: any): void {
    const pattern = `${feedback.type}_${feedback.priority}_${response.action}`;

    let model = this.learningModels.find(m => m.pattern === pattern);

    if (!model) {
      model = {
        pattern,
        confidence: 0.5,
        successRate: 0.5,
        context: [],
        outcomes: [],
        recommendations: []
      };
      this.learningModels.push(model);
    }

    // Update model with new data point
    model.context.push(feedback.content);
    model.outcomes.push(response.reasoning);

    // Adjust confidence and success rate based on outcomes
    // This would be more sophisticated in production
    model.confidence = Math.min(model.confidence + 0.1, 1.0);
    model.successRate = this.calculateSuccessRate(model);

    this.saveHistoricalData();
  }

  /**
   * Start real-time monitoring for immediate feedback
   */
  private startRealtimeMonitoring(): void {
    // Monitor file system changes
    this.monitorFileSystemChanges();

    // Monitor performance metrics
    this.monitorPerformanceMetrics();

    // Monitor external feedback sources
    this.monitorExternalFeedback();
  }

  private monitorFileSystemChanges(): void {
    // Watch for code changes that might indicate issues
    const watcher = fs.watch(process.cwd(), { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.js') || filename.endsWith('.ts')) {
        // Code change detected - could trigger quality analysis
        this.processFeedback({
          source: 'system',
          type: 'improvement',
          content: `Code change detected in ${filename}`,
          timestamp: new Date(),
          priority: 'low'
        });
      }
    });
  }

  private monitorPerformanceMetrics(): void {
    setInterval(async () => {
      const performance = this.measurePerformance();
      if (performance < 70) { // Threshold
        await this.processFeedback({
          source: 'system',
          type: 'performance_issue',
          content: 'Performance degradation detected',
          metrics: { performance },
          timestamp: new Date(),
          priority: 'high'
        });
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private monitorExternalFeedback(): void {
    // Mock external monitoring - would integrate with real APIs
    setInterval(async () => {
      // Check GitHub issues, user reviews, etc.
      const externalFeedback = await this.fetchExternalFeedback();

      for (const feedback of externalFeedback) {
        await this.processFeedback(feedback);
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  // Helper methods
  private generateCycleId(): string {
    return `cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineProjectDomain(): string {
    // Analyze project files to determine domain
    return 'software_development';
  }

  private extractRelevantKeywords(): string[] {
    // Extract keywords from project context
    return ['automation', 'development', 'AI', 'optimization'];
  }

  private synthesizeFeedbackForInput(): string {
    const recentFeedback = this.feedbackHistory.slice(-10);
    return recentFeedback.map(f => f.content).join('. ');
  }

  private evaluateEvolutionSuccess(cycle: EvolutionCycle): boolean {
    if (!cycle.metricsAfter || !cycle.metricsBefor) return false;

    // Simple success evaluation - would be more sophisticated in production
    const improvementCount = Object.keys(cycle.metricsAfter).filter(key => {
      const before = cycle.metricsBefor[key];
      const after = cycle.metricsAfter[key];
      return typeof before === 'number' && typeof after === 'number' && after > before;
    }).length;

    return improvementCount >= 3; // At least 3 metrics improved
  }

  private extractLearnings(cycle: EvolutionCycle): string[] {
    const learnings: string[] = [];

    if (cycle.success) {
      learnings.push('Evolution cycle successful - pattern can be replicated');
      learnings.push(`Actions ${cycle.actionsPerformed.join(', ')} showed positive results`);
    } else {
      learnings.push('Evolution cycle needs refinement');
      learnings.push('Consider alternative action sequences');
    }

    return learnings;
  }

  // Mock metric assessment methods
  private assessCodeQuality(): number { return Math.random() * 100; }
  private measurePerformance(): number { return Math.random() * 100; }
  private getUserSatisfactionScore(): number { return Math.random() * 100; }
  private getMarketAlignmentScore(): number { return Math.random() * 100; }
  private assessTechnicalDebt(): number { return Math.random() * 100; }
  private getTestCoverage(): number { return Math.random() * 100; }
  private getBuildSuccessRate(): number { return Math.random() * 100; }

  private calculateSuccessRate(model: LearningModel): number {
    // Simple calculation - would be more sophisticated in production
    return Math.min(model.confidence * model.outcomes.length / 10, 1.0);
  }

  private async fetchExternalFeedback(): Promise<FeedbackData[]> {
    // Mock external feedback - would integrate with real sources
    return [];
  }

  private loadHistoricalData(): void {
    try {
      const dataPath = path.join(process.cwd(), '.specify', 'memory', 'feedback_history.json');
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        this.feedbackHistory = data.feedbackHistory || [];
        this.evolutionHistory = data.evolutionHistory || [];
        this.learningModels = data.learningModels || [];
      }
    } catch (error) {
      console.warn('Could not load historical feedback data:', error);
    }
  }

  private saveHistoricalData(): void {
    try {
      const memoryDir = path.join(process.cwd(), '.specify', 'memory');
      if (!fs.existsSync(memoryDir)) {
        fs.mkdirSync(memoryDir, { recursive: true });
      }

      const dataPath = path.join(memoryDir, 'feedback_history.json');
      fs.writeFileSync(dataPath, JSON.stringify({
        feedbackHistory: this.feedbackHistory,
        evolutionHistory: this.evolutionHistory,
        learningModels: this.learningModels
      }, null, 2));
    } catch (error) {
      console.warn('Could not save historical feedback data:', error);
    }
  }

  /**
   * Get comprehensive status report
   */
  public getStatusReport(): {
    isActive: boolean;
    totalFeedback: number;
    evolutionCycles: number;
    successRate: number;
    recentActivity: string[];
    recommendations: string[];
  } {
    const recentCycles = this.evolutionHistory.slice(-5);
    const successRate = recentCycles.length > 0
      ? recentCycles.filter(c => c.success).length / recentCycles.length * 100
      : 0;

    return {
      isActive: this.isActive,
      totalFeedback: this.feedbackHistory.length,
      evolutionCycles: this.evolutionHistory.length,
      successRate,
      recentActivity: recentCycles.map(c => `${c.id}: ${c.success ? 'SUCCESS' : 'FAILED'}`),
      recommendations: this.generateCurrentRecommendations()
    };
  }

  private generateCurrentRecommendations(): string[] {
    const recommendations: string[] = [];

    // Based on recent feedback patterns
    const recentFeedback = this.feedbackHistory.slice(-10);
    const bugCount = recentFeedback.filter(f => f.type === 'bug').length;
    const performanceIssues = recentFeedback.filter(f => f.type === 'performance_issue').length;

    if (bugCount > 3) {
      recommendations.push('Increase automated testing and code review processes');
    }

    if (performanceIssues > 2) {
      recommendations.push('Schedule comprehensive performance optimization');
    }

    if (this.evolutionHistory.length > 0) {
      const lastCycle = this.evolutionHistory[this.evolutionHistory.length - 1];
      if (!lastCycle.success) {
        recommendations.push('Review and refine evolution strategy based on recent failures');
      }
    }

    return recommendations;
  }
}

export const continuousFeedbackLoop = new ContinuousFeedbackLoop();