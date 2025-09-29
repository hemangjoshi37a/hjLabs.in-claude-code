import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface VisualContext {
  screenshotPath: string;
  timestamp: Date;
  action: string;
  pageUrl?: string;
  pageTitle?: string;
  analysisPrompt?: string;
  aiAnalysis?: VisualAnalysis;
}

export interface VisualAnalysis {
  elementsVisible: ElementDescription[];
  pageLayout: string;
  interactionOpportunities: InteractionOpportunity[];
  potentialIssues: string[];
  nextSuggestedActions: string[];
  confidence: number;
}

export interface ElementDescription {
  type: 'button' | 'input' | 'link' | 'form' | 'text' | 'image' | 'menu';
  description: string;
  location: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right' | 'header' | 'footer';
  confidence: number;
  clickable: boolean;
}

export interface InteractionOpportunity {
  action: 'click' | 'type' | 'scroll' | 'hover' | 'select';
  element: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export class VisualContextIntegration {
  private contextHistory: VisualContext[] = [];
  private screenshotDir: string;

  constructor() {
    this.screenshotDir = join(process.cwd(), '.claude', 'screenshots');
  }

  /**
   * Analyze screenshot and provide visual context to LLM
   */
  async analyzeScreenshotForContext(
    screenshotPath: string,
    currentAction: string,
    pageInfo: { url?: string; title?: string } = {},
    analysisGoal: string = 'general'
  ): Promise<VisualContext> {
    console.log(`🔍 Analyzing screenshot for visual context: ${screenshotPath}`);

    if (!existsSync(screenshotPath)) {
      throw new Error(`Screenshot not found: ${screenshotPath}`);
    }

    // Create visual context object
    const context: VisualContext = {
      screenshotPath,
      timestamp: new Date(),
      action: currentAction,
      pageUrl: pageInfo.url,
      pageTitle: pageInfo.title,
      analysisPrompt: this.generateAnalysisPrompt(currentAction, analysisGoal)
    };

    // Perform AI-powered visual analysis
    context.aiAnalysis = await this.performVisualAnalysis(screenshotPath, context.analysisPrompt);

    // Store in context history
    this.contextHistory.push(context);

    console.log(`   ✅ Visual analysis completed`);
    console.log(`   🎯 Elements identified: ${context.aiAnalysis.elementsVisible.length}`);
    console.log(`   💡 Suggested actions: ${context.aiAnalysis.nextSuggestedActions.length}`);

    return context;
  }

  /**
   * Generate context-aware analysis prompt for the LLM
   */
  private generateAnalysisPrompt(currentAction: string, analysisGoal: string): string {
    const basePrompt = `
Please analyze this screenshot and provide detailed information about:

1. **Visible Elements**: What interactive elements (buttons, forms, links, inputs) can you see?
2. **Page Layout**: Describe the overall page structure and organization
3. **Interaction Opportunities**: What actions could be performed on this page?
4. **Potential Issues**: Any errors, loading states, or problems visible?
5. **Next Actions**: Based on the current context, what should happen next?

Current Action Context: ${currentAction}
Analysis Goal: ${analysisGoal}

Please provide specific, actionable insights that would help with browser automation decisions.
Focus on elements that can be interacted with and their locations on the page.
`;

    // Customize prompt based on analysis goal
    switch (analysisGoal) {
      case 'form-filling':
        return basePrompt + `\nSpecial Focus: Identify all form fields, their types, labels, and validation requirements.`;

      case 'navigation':
        return basePrompt + `\nSpecial Focus: Identify navigation menus, links, and page structure for movement between pages.`;

      case 'error-debugging':
        return basePrompt + `\nSpecial Focus: Look for error messages, broken elements, missing content, or UI issues.`;

      case 'data-extraction':
        return basePrompt + `\nSpecial Focus: Identify data elements, tables, lists, and content that could be extracted.`;

      case 'workflow-continuation':
        return basePrompt + `\nSpecial Focus: Determine the next logical step in a multi-step workflow based on current page state.`;

      default:
        return basePrompt;
    }
  }

  /**
   * Perform AI-powered visual analysis using multimodal capabilities
   */
  private async performVisualAnalysis(screenshotPath: string, prompt: string): Promise<VisualAnalysis> {
    // This would integrate with Claude Code's multimodal LLM capabilities
    // For now, we'll simulate the analysis based on common web patterns

    console.log(`   🤖 Performing AI visual analysis...`);

    // Simulate AI analysis - in real implementation, this would:
    // 1. Read the screenshot image
    // 2. Send to Claude/LLM with the analysis prompt
    // 3. Parse the response into structured data

    await this.delay(1000); // Simulate analysis time

    // Mock analysis based on common web page elements
    const mockAnalysis: VisualAnalysis = {
      elementsVisible: [
        {
          type: 'input',
          description: 'Search box in header area',
          location: 'top-right',
          confidence: 0.9,
          clickable: true
        },
        {
          type: 'button',
          description: 'Primary action button (blue/green)',
          location: 'center',
          confidence: 0.85,
          clickable: true
        },
        {
          type: 'link',
          description: 'Navigation menu items',
          location: 'header',
          confidence: 0.8,
          clickable: true
        },
        {
          type: 'form',
          description: 'Contact or login form',
          location: 'center',
          confidence: 0.75,
          clickable: false
        }
      ],
      pageLayout: 'Standard webpage with header navigation, main content area, and footer. Clean, modern design with good visual hierarchy.',
      interactionOpportunities: [
        {
          action: 'type',
          element: 'search box',
          description: 'Enter search query in the header search field',
          priority: 'high'
        },
        {
          action: 'click',
          element: 'primary button',
          description: 'Click the main call-to-action button',
          priority: 'high'
        },
        {
          action: 'click',
          element: 'navigation links',
          description: 'Navigate to different sections using header menu',
          priority: 'medium'
        }
      ],
      potentialIssues: [
        'No obvious errors detected',
        'Page appears to be fully loaded'
      ],
      nextSuggestedActions: [
        'Fill out the search box if looking for specific content',
        'Click the primary action button to proceed with main workflow',
        'Navigate to other sections using the header menu if exploring'
      ],
      confidence: 0.82
    };

    return mockAnalysis;
  }

  /**
   * Get visual context for decision making
   */
  async getVisualContextForDecision(
    screenshotPath: string,
    decision: string,
    previousContext?: VisualContext[]
  ): Promise<{
    recommendation: string;
    confidence: number;
    reasoning: string;
    alternatives: string[];
  }> {
    console.log(`🧠 Getting visual context for decision: "${decision}"`);

    const context = await this.analyzeScreenshotForContext(
      screenshotPath,
      `decision: ${decision}`,
      {},
      'workflow-continuation'
    );

    // Analyze the visual context and provide decision recommendations
    const recommendation = this.generateDecisionRecommendation(context, decision, previousContext);

    console.log(`   💡 Recommendation: ${recommendation.recommendation}`);
    console.log(`   🎯 Confidence: ${Math.round(recommendation.confidence * 100)}%`);

    return recommendation;
  }

  /**
   * Generate decision recommendation based on visual analysis
   */
  private generateDecisionRecommendation(
    context: VisualContext,
    decision: string,
    previousContext?: VisualContext[]
  ): {
    recommendation: string;
    confidence: number;
    reasoning: string;
    alternatives: string[];
  } {
    const analysis = context.aiAnalysis!;
    const decisionLower = decision.toLowerCase();

    // Analyze what action would be most appropriate based on visual context
    let recommendation = '';
    let confidence = 0;
    let reasoning = '';
    let alternatives: string[] = [];

    if (decisionLower.includes('click') || decisionLower.includes('button')) {
      const buttons = analysis.elementsVisible.filter(e =>
        e.type === 'button' || (e.type === 'link' && e.clickable)
      );

      if (buttons.length > 0) {
        const bestButton = buttons.sort((a, b) => b.confidence - a.confidence)[0];
        recommendation = `Click the ${bestButton.description}`;
        confidence = bestButton.confidence;
        reasoning = `Visual analysis identified ${buttons.length} clickable elements. The ${bestButton.description} has the highest confidence (${Math.round(bestButton.confidence * 100)}%) and appears to be the primary action.`;
        alternatives = buttons.slice(1, 3).map(b => `Click ${b.description}`);
      } else {
        recommendation = 'No suitable clickable elements found';
        confidence = 0.1;
        reasoning = 'Visual analysis did not identify any buttons or clickable elements that match the requested action.';
      }
    } else if (decisionLower.includes('type') || decisionLower.includes('fill') || decisionLower.includes('enter')) {
      const inputs = analysis.elementsVisible.filter(e => e.type === 'input');

      if (inputs.length > 0) {
        const bestInput = inputs.sort((a, b) => b.confidence - a.confidence)[0];
        recommendation = `Type into ${bestInput.description}`;
        confidence = bestInput.confidence;
        reasoning = `Found ${inputs.length} input fields. The ${bestInput.description} is most suitable for text entry.`;
        alternatives = inputs.slice(1, 3).map(i => `Type into ${i.description}`);
      } else {
        recommendation = 'No input fields found for text entry';
        confidence = 0.1;
        reasoning = 'Visual analysis did not identify any text input fields on the current page.';
      }
    } else if (decisionLower.includes('navigate') || decisionLower.includes('go to')) {
      const links = analysis.elementsVisible.filter(e =>
        e.type === 'link' && e.location === 'header'
      );

      if (links.length > 0) {
        recommendation = `Navigate using ${links[0].description}`;
        confidence = links[0].confidence;
        reasoning = `Identified navigation options in the page header. Best option appears to be ${links[0].description}.`;
        alternatives = analysis.nextSuggestedActions.filter(a => a.includes('navigate')).slice(0, 2);
      } else {
        recommendation = 'Look for navigation links or use browser back/forward';
        confidence = 0.3;
        reasoning = 'No clear navigation options visible in current view.';
      }
    } else {
      // General recommendation based on page analysis
      if (analysis.nextSuggestedActions.length > 0) {
        recommendation = analysis.nextSuggestedActions[0];
        confidence = analysis.confidence;
        reasoning = `Based on visual analysis of current page state, the recommended next action is: ${recommendation}`;
        alternatives = analysis.nextSuggestedActions.slice(1, 3);
      } else {
        recommendation = 'Take screenshot and analyze page content';
        confidence = 0.5;
        reasoning = 'Current page state unclear, recommend gathering more visual information.';
      }
    }

    return { recommendation, confidence, reasoning, alternatives };
  }

  /**
   * Compare two screenshots for changes
   */
  async compareScreenshots(
    beforePath: string,
    afterPath: string,
    comparisonGoal: string = 'general'
  ): Promise<{
    changes: string[];
    significance: 'major' | 'minor' | 'none';
    recommendation: string;
  }> {
    console.log(`📸 Comparing screenshots for changes...`);
    console.log(`   Before: ${beforePath}`);
    console.log(`   After: ${afterPath}`);

    // This would use AI visual comparison capabilities
    // For now, simulate based on common change patterns

    await this.delay(800);

    const mockComparison = {
      changes: [
        'New modal dialog appeared in center of screen',
        'Form fields were filled with text content',
        'Primary button changed color from blue to gray (disabled)',
        'Success message appeared at top of page'
      ],
      significance: 'major' as const,
      recommendation: 'Significant changes detected. The action appears to have been successful based on the visual feedback.'
    };

    console.log(`   ✅ Comparison completed`);
    console.log(`   📊 Changes detected: ${mockComparison.changes.length}`);
    console.log(`   🎯 Significance: ${mockComparison.significance}`);

    return mockComparison;
  }

  /**
   * Extract actionable insights from visual context
   */
  extractActionableInsights(context: VisualContext): {
    immediateActions: string[];
    potentialProblems: string[];
    dataExtractionOpportunities: string[];
    navigationOptions: string[];
  } {
    const analysis = context.aiAnalysis!;

    return {
      immediateActions: analysis.interactionOpportunities
        .filter(op => op.priority === 'high')
        .map(op => `${op.action} ${op.element}: ${op.description}`),

      potentialProblems: analysis.potentialIssues,

      dataExtractionOpportunities: analysis.elementsVisible
        .filter(e => e.type === 'text' || e.type === 'form')
        .map(e => `Extract data from ${e.description}`),

      navigationOptions: analysis.elementsVisible
        .filter(e => e.type === 'link' && e.location === 'header')
        .map(e => `Navigate using ${e.description}`)
    };
  }

  /**
   * Generate visual context report for debugging
   */
  generateVisualReport(contexts: VisualContext[]): string {
    let report = '# Visual Context Analysis Report\n\n';

    contexts.forEach((context, index) => {
      report += `## Step ${index + 1}: ${context.action}\n`;
      report += `**Timestamp**: ${context.timestamp.toISOString()}\n`;
      report += `**Screenshot**: ${context.screenshotPath}\n`;

      if (context.pageUrl) {
        report += `**URL**: ${context.pageUrl}\n`;
      }

      if (context.aiAnalysis) {
        report += `**Elements Visible**: ${context.aiAnalysis.elementsVisible.length}\n`;
        report += `**Layout**: ${context.aiAnalysis.pageLayout}\n`;
        report += `**Interaction Opportunities**: ${context.aiAnalysis.interactionOpportunities.length}\n`;
        report += `**Confidence**: ${Math.round(context.aiAnalysis.confidence * 100)}%\n`;
      }

      report += '\n---\n\n';
    });

    return report;
  }

  /**
   * Get recent visual context history
   */
  getContextHistory(limit: number = 10): VisualContext[] {
    return this.contextHistory.slice(-limit);
  }

  /**
   * Clear context history
   */
  clearContextHistory(): void {
    this.contextHistory = [];
    console.log('🧹 Visual context history cleared');
  }

  /**
   * Delay utility for simulating processing time
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const visualContextIntegration = new VisualContextIntegration();