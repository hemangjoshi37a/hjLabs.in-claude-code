import { specKitIntegration, SpecKitIntegration } from './spec-kit-integration';
import { shinkaEvolveIntegration, ShinkaEvolveIntegration, EvolutionConfig } from './shinka-evolve-integration';

export interface IntegrationStatus {
  specKit: {
    available: boolean;
    path: string;
    message: string;
  };
  shinkaEvolve: {
    available: boolean;
    installed: boolean;
    path: string;
    message: string;
  };
  combined: {
    canUseWorkflow: boolean;
    message: string;
  };
}

export class IntegrationManager {
  private specKit: SpecKitIntegration;
  private shinkaEvolve: ShinkaEvolveIntegration;

  constructor() {
    this.specKit = specKitIntegration;
    this.shinkaEvolve = shinkaEvolveIntegration;
  }

  public getStatus(): IntegrationStatus {
    const specKitStatus = this.specKit.getStatus();
    const shinkaStatus = this.shinkaEvolve.getStatus();

    const canUseWorkflow = specKitStatus.available && shinkaStatus.available;

    let combinedMessage = '';
    if (canUseWorkflow) {
      combinedMessage = 'Full workflow available: Spec-Kit → ShinkaEvolve → Claude Code';
    } else if (specKitStatus.available) {
      combinedMessage = 'Partial workflow: Spec-Kit → Claude Code (ShinkaEvolve unavailable)';
    } else if (shinkaStatus.available) {
      combinedMessage = 'Limited workflow: ShinkaEvolve available (Spec-Kit unavailable)';
    } else {
      combinedMessage = 'Enhanced workflows unavailable - using base Claude Code functionality';
    }

    return {
      specKit: specKitStatus,
      shinkaEvolve: shinkaStatus,
      combined: {
        canUseWorkflow,
        message: combinedMessage
      }
    };
  }

  public getInstallationInstructions(): string {
    const status = this.getStatus();
    let instructions = '';

    if (!status.specKit.available) {
      instructions += this.specKit.getInstallationInstructions();
      instructions += '\n\n';
    }

    if (!status.shinkaEvolve.available || !status.shinkaEvolve.installed) {
      instructions += this.shinkaEvolve.getInstallationInstructions();
      instructions += '\n\n';
    }

    if (status.combined.canUseWorkflow) {
      instructions = 'All integrations are ready! You can use the full enhanced workflow.';
    } else if (instructions) {
      instructions = 'Enhanced capabilities available after installation:\n\n' + instructions;
    }

    return instructions.trim();
  }

  /**
   * Run the complete workflow: ShinkaEvolve drives Spec-Kit for task generation
   */
  public async runEnhancedWorkflow(
    projectDescription: string,
    technicalRequirements: string,
    evolutionConfig: Partial<EvolutionConfig> = {}
  ): Promise<{
    constitution: string;
    specification: string;
    plan: string;
    tasks: string;
    evolutionResults?: string;
    implementation?: string;
  }> {
    const status = this.getStatus();

    if (!status.specKit.available) {
      throw new Error('Enhanced workflow requires Spec-Kit. ' + this.specKit.getInstallationInstructions());
    }

    try {
      // Step 1: Create project constitution
      console.log('🏗️  Creating project constitution...');
      const constitution = await this.specKit.runConstitution(
        'Create principles focused on code quality, testing standards, user experience consistency, and performance requirements'
      );

      // Step 2: Generate specification
      console.log('📋 Generating project specification...');
      const specification = await this.specKit.runSpecify(projectDescription);

      // Step 3: Create technical plan
      console.log('🔧 Creating technical implementation plan...');
      const plan = await this.specKit.runPlan(technicalRequirements);

      // Step 4: Generate tasks
      console.log('📝 Generating actionable task list...');
      const tasks = await this.specKit.runTasks();

      let evolutionResults: string | undefined;
      let implementation: string | undefined;

      // Step 5: Optional evolutionary optimization
      if (status.shinkaEvolve.available && status.shinkaEvolve.installed) {
        console.log('🧬 Running evolutionary optimization...');
        try {
          evolutionResults = await this.shinkaEvolve.runEvolutionWithSpecKit(
            process.cwd(),
            evolutionConfig
          );
        } catch (error) {
          console.warn('⚠️  Evolutionary optimization failed, continuing with standard implementation');
          console.warn(error);
        }
      }

      // Step 6: Run implementation
      console.log('⚙️  Executing implementation...');
      implementation = await this.specKit.runImplement();

      return {
        constitution,
        specification,
        plan,
        tasks,
        evolutionResults,
        implementation
      };

    } catch (error) {
      throw new Error(`Enhanced workflow failed: ${error}`);
    }
  }

  /**
   * Run spec-kit workflow without evolutionary optimization
   */
  public async runSpecKitWorkflow(
    projectDescription: string,
    technicalRequirements: string
  ): Promise<{
    constitution: string;
    specification: string;
    plan: string;
    tasks: string;
    implementation: string;
  }> {
    if (!this.specKit.isSpecKitAvailable()) {
      throw new Error('Spec-Kit workflow requires Spec-Kit installation. ' + this.specKit.getInstallationInstructions());
    }

    const constitution = await this.specKit.runConstitution(
      'Create principles focused on code quality, testing standards, user experience consistency, and performance requirements'
    );

    const specification = await this.specKit.runSpecify(projectDescription);
    const plan = await this.specKit.runPlan(technicalRequirements);
    const tasks = await this.specKit.runTasks();
    const implementation = await this.specKit.runImplement();

    return {
      constitution,
      specification,
      plan,
      tasks,
      implementation
    };
  }

  /**
   * Run evolutionary optimization on existing code
   */
  public async runEvolutionOnly(
    initialCodePath: string,
    evaluationScript: string,
    evolutionConfig: Partial<EvolutionConfig> = {}
  ): Promise<string> {
    if (!this.shinkaEvolve.isShinkaAvailable()) {
      throw new Error('Evolution requires ShinkaEvolve installation. ' + this.shinkaEvolve.getInstallationInstructions());
    }

    const config: EvolutionConfig = {
      init_program_path: initialCodePath,
      eval_program_path: evaluationScript,
      num_generations: evolutionConfig.num_generations || 5,
      max_parallel_jobs: evolutionConfig.max_parallel_jobs || 2,
      ...evolutionConfig
    };

    return await this.shinkaEvolve.runEvolution(config);
  }

  /**
   * Check if enhanced features are available and suggest installation if not
   */
  public checkAndSuggestInstallation(): void {
    const status = this.getStatus();

    console.log('\n🔍 Integration Status:');
    console.log(`   Spec-Kit: ${status.specKit.message}`);
    console.log(`   ShinkaEvolve: ${status.shinkaEvolve.message}`);
    console.log(`   Combined: ${status.combined.message}\n`);

    if (!status.combined.canUseWorkflow) {
      console.log('💡 Enhanced capabilities available after installation:\n');
      console.log(this.getInstallationInstructions());
    }
  }

  /**
   * Get available commands based on installed integrations
   */
  public getAvailableCommands(): {
    command: string;
    description: string;
    available: boolean;
    requirements?: string;
  }[] {
    const status = this.getStatus();

    return [
      {
        command: '/constitution',
        description: 'Create project governing principles',
        available: status.specKit.available,
        requirements: status.specKit.available ? undefined : 'Requires Spec-Kit installation'
      },
      {
        command: '/specify',
        description: 'Define requirements and user stories',
        available: status.specKit.available,
        requirements: status.specKit.available ? undefined : 'Requires Spec-Kit installation'
      },
      {
        command: '/plan',
        description: 'Create technical implementation plans',
        available: status.specKit.available,
        requirements: status.specKit.available ? undefined : 'Requires Spec-Kit installation'
      },
      {
        command: '/tasks',
        description: 'Generate actionable task lists',
        available: status.specKit.available,
        requirements: status.specKit.available ? undefined : 'Requires Spec-Kit installation'
      },
      {
        command: '/implement',
        description: 'Execute tasks according to the plan',
        available: status.specKit.available,
        requirements: status.specKit.available ? undefined : 'Requires Spec-Kit installation'
      },
      {
        command: '/evolve',
        description: 'Run evolutionary optimization on code',
        available: status.shinkaEvolve.available && status.shinkaEvolve.installed,
        requirements: !status.shinkaEvolve.available ? 'Requires ShinkaEvolve repository' :
                     !status.shinkaEvolve.installed ? 'Requires ShinkaEvolve installation' : undefined
      },
      {
        command: '/enhanced-workflow',
        description: 'Run full Spec-Kit + ShinkaEvolve workflow',
        available: status.combined.canUseWorkflow,
        requirements: status.combined.canUseWorkflow ? undefined : 'Requires both Spec-Kit and ShinkaEvolve'
      }
    ];
  }
}

export const integrationManager = new IntegrationManager();