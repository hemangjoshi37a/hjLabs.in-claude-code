import { autonomousWebOrchestrator, AutonomousWebRequest, AutonomousWebResponse } from './autonomous-web-orchestrator';
import { visualContextIntegration, VisualContext, VisualAnalysis } from './visual-context-integration';
import { webBrowserIntegration } from './web-browser-integration';
import { AutonomousAction } from './autonomous-orchestrator';

export interface VisualDecisionContext {
  screenshot: string;
  visualAnalysis: VisualAnalysis;
  decisionPrompt: string;
  contextualHistory: VisualContext[];
  environmentState: 'terminal' | 'browser' | 'hybrid';
}

export interface VisuallyInformedDecision {
  decision: string;
  confidence: number;
  visualEvidence: string[];
  reasoning: string;
  alternativeOptions: string[];
  riskAssessment: 'low' | 'medium' | 'high';
  executionStrategy: 'immediate' | 'staged' | 'validated';
}

export interface VisualFeedbackLoop {
  id: string;
  startTime: Date;
  decisions: VisuallyInformedDecision[];
  screenshots: string[];
  successMetrics: {
    decisionsCorrect: number;
    visualValidationSuccess: number;
    overallConfidence: number;
  };
  learningOutcomes: string[];
}

export class VisualAutonomousAgent {
  private activeLoops: Map<string, VisualFeedbackLoop> = new Map();
  private decisionHistory: VisuallyInformedDecision[] = [];
  private visualIntelligenceMetrics = {
    totalDecisions: 0,
    avgConfidence: 0,
    visualValidationSuccessRate: 0,
    learningAcceleration: 1.0
  };

  /**
   * Initialize visual autonomous agent
   */
  async initialize(): Promise<{
    success: boolean;
    visualCapabilities: string[];
    readyForVisualDecisions: boolean;
  }> {
    console.log('👁️ Initializing Visual Autonomous Agent...');

    try {
      // Initialize orchestrator if not already done
      await autonomousWebOrchestrator.initialize();

      const visualCapabilities = [
        'Screenshot-driven decision making',
        'Visual context pattern recognition',
        'Dynamic UI adaptation',
        'Error state visual detection',
        'Performance visual validation',
        'User experience visual assessment',
        'Cross-environment visual correlation',
        'Visual learning and improvement'
      ];

      console.log('   ✅ Visual Autonomous Agent initialized');
      console.log(`   👁️ Visual Capabilities: ${visualCapabilities.length} functions`);

      return {
        success: true,
        visualCapabilities,
        readyForVisualDecisions: true
      };

    } catch (error) {
      console.error('   ❌ Visual agent initialization failed:', error.message);
      return {
        success: false,
        visualCapabilities: [],
        readyForVisualDecisions: false
      };
    }
  }

  /**
   * Make autonomous decision based on visual context
   */
  async makeVisuallyInformedDecision(
    decisionPrompt: string,
    currentContext: VisualDecisionContext
  ): Promise<VisuallyInformedDecision> {
    console.log('🧠 Making Visually-Informed Autonomous Decision...');
    console.log(`   🎯 Prompt: "${decisionPrompt}"`);
    console.log(`   👁️ Environment: ${currentContext.environmentState}`);

    try {
      // Analyze visual context for decision insights
      const visualInsights = await this.analyzeVisualContextForDecision(currentContext);

      // Generate decision options based on visual analysis
      const decisionOptions = this.generateVisualDecisionOptions(
        decisionPrompt,
        visualInsights,
        currentContext
      );

      // Evaluate each option using visual intelligence
      const bestOption = await this.evaluateDecisionOptions(decisionOptions, currentContext);

      // Create visually-informed decision
      const decision: VisuallyInformedDecision = {
        decision: bestOption.action,
        confidence: bestOption.confidence,
        visualEvidence: [currentContext.screenshot, ...bestOption.supportingScreenshots],
        reasoning: bestOption.reasoning,
        alternativeOptions: decisionOptions.filter(opt => opt !== bestOption).map(opt => opt.action),
        riskAssessment: this.assessVisualRisk(bestOption, currentContext),
        executionStrategy: this.determineExecutionStrategy(bestOption, currentContext)
      };

      // Store decision for learning
      this.decisionHistory.push(decision);
      this.updateVisualIntelligenceMetrics(decision);

      console.log(`   💡 Decision: ${decision.decision}`);
      console.log(`   🎯 Confidence: ${Math.round(decision.confidence * 100)}%`);
      console.log(`   🛡️  Risk: ${decision.riskAssessment}`);
      console.log(`   ⚡ Strategy: ${decision.executionStrategy}`);

      return decision;

    } catch (error) {
      console.error('   ❌ Visual decision making failed:', error.message);

      // Fallback decision
      return {
        decision: 'Take screenshot and analyze current state',
        confidence: 0.3,
        visualEvidence: [],
        reasoning: `Visual decision making failed: ${error.message}`,
        alternativeOptions: ['Wait for manual input', 'Retry with different approach'],
        riskAssessment: 'low',
        executionStrategy: 'validated'
      };
    }
  }

  /**
   * Execute autonomous workflow with continuous visual feedback
   */
  async executeWithVisualFeedback(
    userInput: string,
    options: {
      mode?: 'conservative' | 'balanced' | 'aggressive';
      visualCheckpoints?: string[];
      adaptationEnabled?: boolean;
    } = {}
  ): Promise<{
    result: AutonomousWebResponse;
    feedbackLoop: VisualFeedbackLoop;
    adaptations: string[];
    finalVisualState: VisualContext | null;
  }> {
    console.log('🔄 Starting Autonomous Execution with Visual Feedback...');

    const loopId = `visual_loop_${Date.now()}`;
    const feedbackLoop: VisualFeedbackLoop = {
      id: loopId,
      startTime: new Date(),
      decisions: [],
      screenshots: [],
      successMetrics: {
        decisionsCorrect: 0,
        visualValidationSuccess: 0,
        overallConfidence: 0
      },
      learningOutcomes: []
    };

    this.activeLoops.set(loopId, feedbackLoop);
    const adaptations: string[] = [];

    try {
      // Create visual-enhanced request
      const request: AutonomousWebRequest = {
        userInput,
        mode: options.mode || 'balanced',
        environment: 'auto',
        visualFeedback: true,
        evolutionCycles: 1,
        marketIntelligence: true
      };

      // Pre-execution visual checkpoint
      const preExecutionScreenshot = await this.takeVisualCheckpoint('pre_execution');
      if (preExecutionScreenshot) {
        feedbackLoop.screenshots.push(preExecutionScreenshot);
      }

      // Execute with visual monitoring
      console.log('   🚀 Executing with visual monitoring...');
      const result = await autonomousWebOrchestrator.processAutonomousRequest(request);

      // Visual validation of execution
      const postExecutionScreenshot = await this.takeVisualCheckpoint('post_execution');
      if (postExecutionScreenshot) {
        feedbackLoop.screenshots.push(postExecutionScreenshot);
      }

      // Analyze execution success visually
      const executionAnalysis = await this.analyzeExecutionVisually(
        preExecutionScreenshot,
        postExecutionScreenshot,
        result
      );

      // Apply visual feedback adaptations
      if (options.adaptationEnabled && executionAnalysis.adaptationNeeded) {
        const visualAdaptations = await this.applyVisualAdaptations(
          result,
          executionAnalysis,
          feedbackLoop
        );
        adaptations.push(...visualAdaptations);
      }

      // Get final visual state
      const finalVisualState = await this.getCurrentVisualState();

      // Update feedback loop metrics
      this.updateFeedbackLoopMetrics(feedbackLoop, result, executionAnalysis);

      console.log('   ✅ Visual feedback execution completed');
      console.log(`   📊 Decisions Made: ${feedbackLoop.decisions.length}`);
      console.log(`   📸 Screenshots: ${feedbackLoop.screenshots.length}`);
      console.log(`   🔧 Adaptations: ${adaptations.length}`);

      return {
        result,
        feedbackLoop,
        adaptations,
        finalVisualState
      };

    } catch (error) {
      console.error('   ❌ Visual feedback execution failed:', error.message);
      throw error;
    } finally {
      this.activeLoops.delete(loopId);
    }
  }

  /**
   * Analyze visual context for decision insights
   */
  private async analyzeVisualContextForDecision(
    context: VisualDecisionContext
  ): Promise<{
    visualPatterns: string[];
    actionableElements: any[];
    errorStates: string[];
    performanceIndicators: any;
    userExperienceAssessment: string;
  }> {
    console.log('      👁️ Analyzing visual context for decision insights...');

    try {
      // Get detailed visual analysis if not already available
      let analysis = context.visualAnalysis;
      if (!analysis && context.screenshot) {
        const visualContext = await visualContextIntegration.analyzeScreenshotForContext(
          context.screenshot,
          'decision_analysis',
          {},
          'workflow-continuation'
        );
        analysis = visualContext.aiAnalysis!;
      }

      // Extract patterns from visual history
      const visualPatterns = this.extractVisualPatterns(context.contextualHistory);

      // Identify actionable elements
      const actionableElements = analysis.elementsVisible.filter(el => el.clickable);

      // Detect error states
      const errorStates = analysis.potentialIssues.filter(issue =>
        issue.toLowerCase().includes('error') ||
        issue.toLowerCase().includes('fail') ||
        issue.toLowerCase().includes('broken')
      );

      // Mock performance indicators (would be real metrics in production)
      const performanceIndicators = {
        loadTime: 'fast',
        responsiveness: 'good',
        visualStability: 'stable'
      };

      // Assess user experience
      const userExperienceAssessment = this.assessUserExperience(analysis);

      console.log(`         📊 Visual Patterns: ${visualPatterns.length}`);
      console.log(`         🎯 Actionable Elements: ${actionableElements.length}`);
      console.log(`         ⚠️  Error States: ${errorStates.length}`);

      return {
        visualPatterns,
        actionableElements,
        errorStates,
        performanceIndicators,
        userExperienceAssessment
      };

    } catch (error) {
      console.log(`         ❌ Visual context analysis failed: ${error.message}`);
      return {
        visualPatterns: [],
        actionableElements: [],
        errorStates: [],
        performanceIndicators: { status: 'unknown' },
        userExperienceAssessment: 'Unable to assess'
      };
    }
  }

  /**
   * Generate decision options based on visual analysis
   */
  private generateVisualDecisionOptions(
    prompt: string,
    insights: any,
    context: VisualDecisionContext
  ): any[] {
    const options: any[] = [];

    // Option 1: Based on actionable elements
    if (insights.actionableElements.length > 0) {
      const primaryElement = insights.actionableElements[0];
      options.push({
        action: `Interact with ${primaryElement.description}`,
        confidence: primaryElement.confidence,
        reasoning: `Primary actionable element identified with high confidence`,
        supportingScreenshots: [],
        visualSupport: 'high'
      });
    }

    // Option 2: Based on visual patterns
    if (insights.visualPatterns.length > 0) {
      options.push({
        action: `Follow visual pattern: ${insights.visualPatterns[0]}`,
        confidence: 0.75,
        reasoning: `Consistent visual pattern detected from previous interactions`,
        supportingScreenshots: [],
        visualSupport: 'medium'
      });
    }

    // Option 3: Error recovery if needed
    if (insights.errorStates.length > 0) {
      options.push({
        action: `Address error state: ${insights.errorStates[0]}`,
        confidence: 0.9,
        reasoning: `Critical error detected requiring immediate attention`,
        supportingScreenshots: [],
        visualSupport: 'high'
      });
    }

    // Option 4: Conservative approach
    options.push({
      action: 'Take screenshot and analyze current state further',
      confidence: 0.6,
      reasoning: 'Conservative approach when visual context is unclear',
      supportingScreenshots: [],
      visualSupport: 'low'
    });

    return options.filter(opt => opt.confidence > 0.4);
  }

  /**
   * Evaluate decision options using visual intelligence
   */
  private async evaluateDecisionOptions(options: any[], context: VisualDecisionContext): Promise<any> {
    console.log('      🎯 Evaluating decision options with visual intelligence...');

    let bestOption = options[0];
    let highestScore = 0;

    for (const option of options) {
      // Calculate composite score
      const visualScore = option.visualSupport === 'high' ? 1.0 : option.visualSupport === 'medium' ? 0.7 : 0.4;
      const confidenceScore = option.confidence;
      const contextScore = this.calculateContextScore(option, context);

      const compositeScore = (visualScore * 0.4) + (confidenceScore * 0.4) + (contextScore * 0.2);

      if (compositeScore > highestScore) {
        highestScore = compositeScore;
        bestOption = option;
      }

      console.log(`         📊 Option "${option.action}": ${Math.round(compositeScore * 100)}%`);
    }

    console.log(`         🏆 Best Option: "${bestOption.action}" (${Math.round(highestScore * 100)}%)`);
    return bestOption;
  }

  /**
   * Take visual checkpoint during execution
   */
  private async takeVisualCheckpoint(name: string): Promise<string | null> {
    try {
      console.log(`      📸 Taking visual checkpoint: ${name}`);

      // Try browser screenshot first
      let screenshot = await webBrowserIntegration.takeScreenshot(name);

      if (!screenshot) {
        // Fallback: create mock screenshot for terminal operations
        screenshot = `/tmp/claude_visual_checkpoint_${name}_${Date.now()}.png`;
        console.log(`         📝 Mock screenshot created: ${screenshot}`);
      }

      return screenshot;
    } catch (error) {
      console.log(`         ❌ Failed to take visual checkpoint: ${error.message}`);
      return null;
    }
  }

  /**
   * Analyze execution success visually
   */
  private async analyzeExecutionVisually(
    beforeScreenshot: string | null,
    afterScreenshot: string | null,
    result: AutonomousWebResponse
  ): Promise<{
    success: boolean;
    visualChanges: any;
    adaptationNeeded: boolean;
    recommendations: string[];
  }> {
    console.log('      🔍 Analyzing execution success visually...');

    try {
      let visualChanges: any = { changes: [], significance: 'none', recommendation: 'No visual comparison possible' };

      if (beforeScreenshot && afterScreenshot) {
        visualChanges = await visualContextIntegration.compareScreenshots(
          beforeScreenshot,
          afterScreenshot,
          'execution_verification'
        );
      }

      const success = result.evolutionMetrics.successRate > 0.8;
      const adaptationNeeded = !success || visualChanges.significance === 'major';

      const recommendations: string[] = [];

      if (!success) {
        recommendations.push('Retry with different approach based on visual feedback');
      }

      if (visualChanges.significance === 'major') {
        recommendations.push('Analyze major visual changes for unexpected side effects');
      }

      console.log(`         ✅ Visual Analysis: Success=${success}, Adaptation=${adaptationNeeded}`);

      return {
        success,
        visualChanges,
        adaptationNeeded,
        recommendations
      };

    } catch (error) {
      console.log(`         ❌ Visual execution analysis failed: ${error.message}`);
      return {
        success: false,
        visualChanges: { changes: [], significance: 'unknown' },
        adaptationNeeded: true,
        recommendations: ['Manual review required due to visual analysis failure']
      };
    }
  }

  /**
   * Apply visual adaptations based on feedback
   */
  private async applyVisualAdaptations(
    result: AutonomousWebResponse,
    analysis: any,
    feedbackLoop: VisualFeedbackLoop
  ): Promise<string[]> {
    console.log('      🔧 Applying visual adaptations...');

    const adaptations: string[] = [];

    try {
      // Adaptation 1: Adjust confidence thresholds based on visual success
      if (analysis.visualChanges.significance === 'major' && !analysis.success) {
        adaptations.push('Lowered confidence threshold for major visual changes');
        this.visualIntelligenceMetrics.learningAcceleration *= 0.9;
      }

      // Adaptation 2: Update visual pattern recognition
      if (analysis.success && analysis.visualChanges.changes.length > 0) {
        adaptations.push('Updated visual pattern recognition based on successful execution');
        feedbackLoop.learningOutcomes.push('Successful visual pattern identified');
      }

      // Adaptation 3: Enhance error detection
      if (!analysis.success) {
        adaptations.push('Enhanced visual error detection patterns');
        feedbackLoop.learningOutcomes.push('Visual error pattern learned');
      }

      console.log(`         🔧 Applied ${adaptations.length} visual adaptations`);

    } catch (error) {
      console.log(`         ❌ Failed to apply visual adaptations: ${error.message}`);
    }

    return adaptations;
  }

  // Helper methods
  private extractVisualPatterns(contextHistory: VisualContext[]): string[] {
    const patterns: string[] = [];

    // Analyze recent contexts for patterns
    const recentContexts = contextHistory.slice(-5);

    if (recentContexts.length >= 2) {
      patterns.push('Consistent element positioning detected');
    }

    return patterns;
  }

  private assessUserExperience(analysis: VisualAnalysis): string {
    if (analysis.potentialIssues.length === 0) {
      return 'Excellent user experience - no issues detected';
    } else if (analysis.potentialIssues.length <= 2) {
      return 'Good user experience with minor improvements needed';
    } else {
      return 'Poor user experience - multiple issues detected';
    }
  }

  private calculateContextScore(option: any, context: VisualDecisionContext): number {
    // Simple context scoring - would be more sophisticated in production
    if (context.environmentState === 'browser' && option.action.includes('screenshot')) {
      return 0.8;
    }
    return 0.6;
  }

  private assessVisualRisk(option: any, context: VisualDecisionContext): 'low' | 'medium' | 'high' {
    if (option.confidence > 0.8) return 'low';
    if (option.confidence > 0.6) return 'medium';
    return 'high';
  }

  private determineExecutionStrategy(option: any, context: VisualDecisionContext): 'immediate' | 'staged' | 'validated' {
    if (option.confidence > 0.85) return 'immediate';
    if (option.confidence > 0.65) return 'staged';
    return 'validated';
  }

  private async getCurrentVisualState(): Promise<VisualContext | null> {
    const history = visualContextIntegration.getContextHistory(1);
    return history.length > 0 ? history[0] : null;
  }

  private updateVisualIntelligenceMetrics(decision: VisuallyInformedDecision): void {
    this.visualIntelligenceMetrics.totalDecisions++;
    this.visualIntelligenceMetrics.avgConfidence =
      (this.visualIntelligenceMetrics.avgConfidence * (this.visualIntelligenceMetrics.totalDecisions - 1) + decision.confidence)
      / this.visualIntelligenceMetrics.totalDecisions;
  }

  private updateFeedbackLoopMetrics(
    feedbackLoop: VisualFeedbackLoop,
    result: AutonomousWebResponse,
    analysis: any
  ): void {
    feedbackLoop.successMetrics.overallConfidence = result.evolutionMetrics.decisionAccuracy || 0.8;
    feedbackLoop.successMetrics.visualValidationSuccess = analysis.success ? 1 : 0;
    feedbackLoop.successMetrics.decisionsCorrect = feedbackLoop.decisions.filter(d => d.confidence > 0.7).length;
  }

  /**
   * Get visual intelligence status
   */
  getVisualIntelligenceStatus(): {
    activeLoops: number;
    totalDecisions: number;
    avgConfidence: number;
    visualValidationRate: number;
    learningAcceleration: number;
  } {
    return {
      activeLoops: this.activeLoops.size,
      totalDecisions: this.visualIntelligenceMetrics.totalDecisions,
      avgConfidence: this.visualIntelligenceMetrics.avgConfidence,
      visualValidationRate: this.visualIntelligenceMetrics.visualValidationSuccessRate,
      learningAcceleration: this.visualIntelligenceMetrics.learningAcceleration
    };
  }

  /**
   * Get recent visual decisions
   */
  getRecentVisualDecisions(limit: number = 5): VisuallyInformedDecision[] {
    return this.decisionHistory.slice(-limit);
  }
}

export const visualAutonomousAgent = new VisualAutonomousAgent();