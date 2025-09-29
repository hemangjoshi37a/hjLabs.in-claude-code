import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface SpecKitConfig {
  specKitPath?: string;
  repoUrl?: string;
}

export class SpecKitIntegration {
  private specKitPath: string;
  private repoUrl: string;
  private isAvailable: boolean = false;
  private isInitialized: boolean = false;

  constructor(private config: SpecKitConfig = {}) {
    this.specKitPath = config.specKitPath || this.detectSpecKitPath();
    this.repoUrl = config.repoUrl || 'git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit';
    this.checkAvailability();
  }

  private detectSpecKitPath(): string {
    // Check common locations for spec-kit
    const possiblePaths = [
      '/home/hemang/Documents/GitHub/hjLabs.in-spec-kit',
      path.join(process.cwd(), '../hjLabs.in-spec-kit'),
      path.join(process.cwd(), '../spec-kit'),
    ];

    for (const testPath of possiblePaths) {
      if (fs.existsSync(path.join(testPath, 'pyproject.toml'))) {
        return testPath;
      }
    }

    return '';
  }

  private checkAvailability(): void {
    try {
      // Check if uvx is available (required for spec-kit)
      execSync('uvx --help', { encoding: 'utf8' });
      this.isAvailable = true;

      // Check if current directory has spec-kit initialized
      this.checkInitialization();
    } catch (error) {
      this.isAvailable = false;
    }
  }

  private checkInitialization(): void {
    // Check if current directory has been initialized with spec-kit
    const specifyDir = path.join(process.cwd(), '.specify');
    const claudeDir = path.join(process.cwd(), '.claude');

    this.isInitialized = fs.existsSync(specifyDir) &&
                        fs.existsSync(claudeDir) &&
                        fs.existsSync(path.join(claudeDir, 'commands'));
  }

  public isSpecKitAvailable(): boolean {
    return this.isAvailable;
  }

  public isSpecKitInitialized(): boolean {
    // Always re-check initialization status to handle directory changes
    this.checkInitialization();
    return this.isInitialized;
  }

  public getInstallationInstructions(): string {
    return `
To enable advanced task management capabilities with Spec-Kit:

1. Install uv (if not already installed):
   curl -LsSf https://astral.sh/uv/install.sh | sh

2. Initialize Spec-Kit in this project:
   uvx --from ${this.repoUrl} specify init --here --ai claude

   OR create a new project:
   uvx --from ${this.repoUrl} specify init my-awesome-project --ai claude
   cd my-awesome-project

Once initialized, you'll have access to these slash commands:
- /constitution: Create project governing principles
- /specify: Define requirements and user stories
- /clarify: Clarify underspecified areas
- /plan: Create technical implementation plans
- /tasks: Generate actionable task lists
- /analyze: Cross-artifact consistency analysis
- /implement: Execute tasks according to the plan
`;
  }

  public async initializeSpecKit(projectName?: string): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('uvx not available. Please install uv first.');
    }

    return new Promise((resolve, reject) => {
      const args = projectName
        ? ['--from', this.repoUrl, 'specify', 'init', projectName, '--ai', 'claude']
        : ['--from', this.repoUrl, 'specify', 'init', '--here', '--ai', 'claude'];

      const child = spawn('uvx', args, {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.checkInitialization(); // Update initialization status
          resolve(output);
        } else {
          reject(new Error(`Spec-Kit initialization failed: ${error}`));
        }
      });
    });
  }

  public getAvailableCommands(): string[] {
    // Always check current initialization status
    this.checkInitialization();

    if (!this.isInitialized) {
      return [];
    }

    // These commands become available after spec-kit initialization
    return [
      '/constitution',
      '/specify',
      '/clarify',
      '/plan',
      '/tasks',
      '/analyze',
      '/implement'
    ];
  }

  public getStatus(): {
    available: boolean;
    initialized: boolean;
    path: string;
    repoUrl: string;
    message: string;
    commands: string[];
  } {
    // Always refresh initialization status when getting status
    this.checkInitialization();

    let message = '';

    if (!this.isAvailable) {
      message = 'uvx not available - install uv to enable Spec-Kit integration';
    } else if (!this.isInitialized) {
      message = 'Spec-Kit available but not initialized in this project';
    } else {
      message = 'Spec-Kit integration ready - slash commands available';
    }

    return {
      available: this.isAvailable,
      initialized: this.isInitialized,
      path: this.specKitPath,
      repoUrl: this.repoUrl,
      message,
      commands: this.getAvailableCommands()
    };
  }
}

export const specKitIntegration = new SpecKitIntegration();