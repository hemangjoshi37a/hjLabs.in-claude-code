import { execSync, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface ShinkaEvolveConfig {
  shinkaPath?: string;
  pythonPath?: string;
  uvPath?: string;
}

export interface EvolutionConfig {
  task_sys_msg?: string;
  num_generations?: number;
  max_parallel_jobs?: number;
  llm_models?: string[];
  language?: string;
  init_program_path?: string;
  eval_program_path?: string;
  results_dir?: string;
}

export class ShinkaEvolveIntegration {
  private shinkaPath: string;
  private pythonPath: string;
  private uvPath: string;
  private isAvailable: boolean = false;
  private isInstalled: boolean = false;

  constructor(private config: ShinkaEvolveConfig = {}) {
    this.shinkaPath = config.shinkaPath || this.detectShinkaPath();
    this.pythonPath = config.pythonPath || 'python3';
    this.uvPath = config.uvPath || 'uv';
    this.checkAvailability();
  }

  private detectShinkaPath(): string {
    const possiblePaths = [
      '/home/hemang/Documents/GitHub/hjLabs.in-ShinkaEvolve',
      path.join(process.cwd(), '../hjLabs.in-ShinkaEvolve'),
      path.join(process.cwd(), '../ShinkaEvolve'),
    ];

    for (const testPath of possiblePaths) {
      if (fs.existsSync(path.join(testPath, 'pyproject.toml')) &&
          fs.existsSync(path.join(testPath, 'shinka'))) {
        return testPath;
      }
    }

    return '';
  }

  private checkAvailability(): void {
    try {
      // First check if shinka commands are available in PATH
      try {
        execSync('shinka_launch --help', { encoding: 'utf8' });
        this.isAvailable = true;
        this.isInstalled = true;
        return;
      } catch {
        // Not in PATH, continue checking
      }

      // Check if we have the source and can potentially install it
      if (this.shinkaPath && fs.existsSync(path.join(this.shinkaPath, 'pyproject.toml'))) {
        this.isAvailable = true;
        this.isInstalled = false;
      } else {
        this.isAvailable = false;
        this.isInstalled = false;
      }
    } catch (error) {
      this.isAvailable = false;
      this.isInstalled = false;
    }
  }

  public isShinkaAvailable(): boolean {
    return this.isAvailable;
  }

  public isShinkaInstalled(): boolean {
    return this.isInstalled;
  }

  public getInstallationInstructions(): string {
    if (this.shinkaPath) {
      return `
ShinkaEvolve is available but not installed. To enable evolutionary algorithm capabilities:

1. Install uv (if not already installed):
   curl -LsSf https://astral.sh/uv/install.sh | sh

2. Install ShinkaEvolve:
   cd ${this.shinkaPath}
   uv venv --python 3.11
   source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
   uv pip install -e .

3. Restart claude-code to detect the new installation.

ShinkaEvolve provides evolutionary algorithm capabilities for:
- Automated code optimization and improvement
- Scientific discovery through program evolution
- Multi-objective optimization with LLM-guided mutations
- Parallel evaluation and evolutionary islands
`;
    } else {
      return `
ShinkaEvolve repository not found. To enable evolutionary algorithm capabilities:

1. Clone ShinkaEvolve repository:
   git clone https://github.com/SakanaAI/ShinkaEvolve /home/hemang/Documents/GitHub/hjLabs.in-ShinkaEvolve

2. Install uv (if not already installed):
   curl -LsSf https://astral.sh/uv/install.sh | sh

3. Install ShinkaEvolve:
   cd /home/hemang/Documents/GitHub/hjLabs.in-ShinkaEvolve
   uv venv --python 3.11
   source .venv/bin/activate
   uv pip install -e .

4. Restart claude-code to detect the new installation.
`;
    }
  }

  public async runEvolution(config: EvolutionConfig): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('ShinkaEvolve not available. ' + this.getInstallationInstructions());
    }

    if (!this.isInstalled) {
      throw new Error('ShinkaEvolve not installed. ' + this.getInstallationInstructions());
    }

    return this.executeShinkaCommand(config);
  }

  public async runEvolutionWithSpecKit(
    specKitTasksDir: string,
    evolutionConfig: Partial<EvolutionConfig> = {}
  ): Promise<string> {
    if (!this.isAvailable) {
      throw new Error('ShinkaEvolve not available. ' + this.getInstallationInstructions());
    }

    // Create evaluation script that integrates with spec-kit tasks
    const evalScript = this.generateSpecKitEvaluationScript(specKitTasksDir);
    const evalPath = path.join(process.cwd(), 'evaluate_spec_tasks.py');
    fs.writeFileSync(evalPath, evalScript);

    const config: EvolutionConfig = {
      eval_program_path: evalPath,
      task_sys_msg: 'Optimize implementation to complete spec-kit tasks efficiently',
      num_generations: evolutionConfig.num_generations || 5,
      max_parallel_jobs: evolutionConfig.max_parallel_jobs || 2,
      llm_models: evolutionConfig.llm_models || ['azure-gpt-4.1-mini'],
      language: evolutionConfig.language || 'python',
      results_dir: evolutionConfig.results_dir || './shinka_results',
      ...evolutionConfig
    };

    return this.runEvolution(config);
  }

  private generateSpecKitEvaluationScript(tasksDir: string): string {
    return `
import sys
import os
import subprocess
import json
from pathlib import Path

def main(program_path: str, results_dir: str):
    """Evaluate a program by running it against spec-kit tasks"""

    # Read tasks from spec-kit directory
    tasks_file = Path("${tasksDir}") / "tasks.md"
    if not tasks_file.exists():
        return {"combined_score": 0.0, "text_feedback": "No tasks.md found"}

    try:
        # Run the program and capture results
        result = subprocess.run([
            sys.executable, program_path
        ], capture_output=True, text=True, timeout=60)

        # Score based on successful execution and output quality
        score = 0.0
        feedback = ""

        if result.returncode == 0:
            score += 50.0  # Base score for successful execution
            output_quality = evaluate_output_quality(result.stdout)
            score += output_quality
            feedback = f"Program executed successfully. Output quality: {output_quality}/50"
        else:
            feedback = f"Program failed: {result.stderr[:200]}"

        return {
            "combined_score": float(score),
            "public": {"execution_success": result.returncode == 0},
            "private": {"stdout": result.stdout, "stderr": result.stderr},
            "text_feedback": feedback
        }

    except subprocess.TimeoutExpired:
        return {
            "combined_score": 0.0,
            "text_feedback": "Program execution timed out"
        }
    except Exception as e:
        return {
            "combined_score": 0.0,
            "text_feedback": f"Evaluation error: {str(e)}"
        }

def evaluate_output_quality(output: str) -> float:
    """Simple heuristic to evaluate output quality"""
    if not output.strip():
        return 0.0

    score = 0.0

    # Length bonus (up to 20 points)
    score += min(len(output.strip()) / 100, 20.0)

    # Structure bonus (up to 15 points)
    if "\\n" in output:
        score += 10.0
    if any(keyword in output.lower() for keyword in ["error", "warning", "info"]):
        score += 5.0

    # Content quality bonus (up to 15 points)
    lines = output.strip().split("\\n")
    if len(lines) > 1:
        score += 10.0
    if len([line for line in lines if len(line.strip()) > 10]) > 0:
        score += 5.0

    return min(score, 50.0)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("program_path", help="Path to program to evaluate")
    parser.add_argument("results_dir", help="Directory to store results")
    args = parser.parse_args()

    result = main(args.program_path, args.results_dir)

    # Save results
    os.makedirs(args.results_dir, exist_ok=True)
    with open(os.path.join(args.results_dir, "metrics.json"), "w") as f:
        json.dump(result, f, indent=2)

    print(f"Score: {result['combined_score']}")
    print(f"Feedback: {result['text_feedback']}")
`;
  }

  private async executeShinkaCommand(config: EvolutionConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      // Build command arguments
      const args = ['shinka_launch'];

      if (config.eval_program_path) {
        args.push(`cluster.eval_program_path=${config.eval_program_path}`);
      }

      if (config.init_program_path) {
        args.push(`evolution.init_program_path=${config.init_program_path}`);
      }

      if (config.num_generations) {
        args.push(`evolution.num_generations=${config.num_generations}`);
      }

      if (config.max_parallel_jobs) {
        args.push(`evolution.max_parallel_jobs=${config.max_parallel_jobs}`);
      }

      if (config.llm_models) {
        args.push(`evolution.llm_models=[${config.llm_models.map(m => `"${m}"`).join(',')}]`);
      }

      if (config.results_dir) {
        args.push(`evolution.results_dir=${config.results_dir}`);
      }

      const child = spawn('bash', ['-c', args.join(' ')], {
        cwd: this.shinkaPath,
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
          resolve(output);
        } else {
          reject(new Error(`ShinkaEvolve command failed: ${error}`));
        }
      });
    });
  }

  public getStatus(): { available: boolean; installed: boolean; path: string; message: string } {
    let message = '';

    if (!this.isAvailable) {
      message = 'ShinkaEvolve not found - evolutionary algorithms unavailable';
    } else if (!this.isInstalled) {
      message = 'ShinkaEvolve found but not installed - run installation';
    } else {
      message = 'ShinkaEvolve integration ready';
    }

    return {
      available: this.isAvailable,
      installed: this.isInstalled,
      path: this.shinkaPath,
      message
    };
  }
}

export const shinkaEvolveIntegration = new ShinkaEvolveIntegration();