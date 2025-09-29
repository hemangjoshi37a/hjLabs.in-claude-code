# ShinkaEvolve Integration

Run evolutionary optimization on code using ShinkaEvolve's LLM-guided evolutionary algorithms.

## Command
`/evolve <code_file> [options]`

## Description
This command uses ShinkaEvolve to evolve and optimize existing code through evolutionary algorithms. The system maintains a population of program variants that evolve over generations, with LLMs acting as intelligent mutation operators.

ShinkaEvolve is particularly effective for:
- Scientific code optimization
- Algorithm improvement
- Performance optimization
- Creative problem solving

## Prerequisites
- ShinkaEvolve repository must be cloned and installed
- Python 3.11+ environment with required dependencies
- Evaluation criteria for your code

## Usage Examples

### Basic Evolution
```
/evolve my_algorithm.py --generations 10
```

### Evolution with Custom Evaluation
```
/evolve optimization_code.py --eval evaluate_performance.py --generations 15 --parallel 4
```

### Evolution with Spec-Kit Integration
```
/evolve implementation.py --spec-integration --generations 8
```

## Options

- `--generations <num>`: Number of evolution generations (default: 5)
- `--parallel <num>`: Number of parallel evaluation jobs (default: 2)
- `--eval <file>`: Custom evaluation script (default: auto-generated)
- `--models <models>`: Comma-separated list of LLM models to use
- `--spec-integration`: Integrate with Spec-Kit tasks if available
- `--results-dir <dir>`: Directory to save evolution results
- `--task-msg <message>`: Custom task description for evolution

## Setup Instructions

If ShinkaEvolve is not available, install it:

```bash
# Clone the repository
git clone https://github.com/SakanaAI/ShinkaEvolve /home/hemang/Documents/GitHub/hjLabs.in-ShinkaEvolve

# Install uv if needed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install ShinkaEvolve
cd /home/hemang/Documents/GitHub/hjLabs.in-ShinkaEvolve
uv venv --python 3.11
source .venv/bin/activate
uv pip install -e .
```

## How It Works

1. **Initial Population**: Starts with your provided code
2. **Mutation**: LLMs generate code variations based on the current population
3. **Evaluation**: Each variant is tested using your evaluation criteria
4. **Selection**: Best-performing variants survive to the next generation
5. **Archive**: Successful solutions are preserved for knowledge transfer
6. **Iteration**: Process repeats for the specified number of generations

## Integration with Spec-Kit

When used with Spec-Kit, ShinkaEvolve can:
- Use Spec-Kit task definitions as evaluation criteria
- Optimize implementations to better complete specified tasks
- Evolve code that meets project constitution requirements

## Output

Evolution results include:
- Best performing code variants
- Performance metrics over generations
- Evolution history and genealogy
- Detailed analysis of improvements

Results are saved in the specified results directory for later analysis.

## Example Workflow

1. Initialize Spec-Kit (optional):
   ```
   /setup-speckit
   /constitution ...
   /specify ...
   /plan ...
   /tasks
   ```

2. Create initial implementation:
   ```
   /implement
   ```

3. Evolve the implementation:
   ```
   /evolve generated_code.py --spec-integration --generations 10
   ```

## Auto-Detection

Claude Code automatically detects ShinkaEvolve availability and shows this command when the integration is ready.