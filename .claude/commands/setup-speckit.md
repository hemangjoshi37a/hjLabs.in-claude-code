# Spec-Kit Integration Setup

Initialize Spec-Kit in the current project to enable advanced structured development workflows.

## Command
`/setup-speckit [project-name]`

## Description
This command initializes Spec-Kit in your current project (or creates a new project), which provides structured specification-driven development capabilities with native Claude Code integration.

After initialization, you'll have access to powerful workflow commands:
- `/constitution`: Create project governing principles and development guidelines
- `/specify`: Define requirements and user stories
- `/clarify`: Clarify underspecified areas before planning
- `/plan`: Create technical implementation plans
- `/tasks`: Generate actionable task lists
- `/analyze`: Cross-artifact consistency analysis
- `/implement`: Execute tasks according to the plan

## Prerequisites
- `uv` package manager must be installed

## Usage Examples

### Initialize in Current Project
```
/setup-speckit
```
This runs: `uvx --from git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit specify init --here --ai claude`

### Create New Project
```
/setup-speckit my-awesome-project
```
This runs: `uvx --from git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit specify init my-awesome-project --ai claude`

## What Gets Created
After running the setup, your project will have:
- `.specify/` directory with templates and scripts
- `.claude/commands/` directory with slash command definitions
- Project structure optimized for specification-driven development

## Complete Workflow Example
After setup, you can run a complete development workflow:

1. **Create Constitution**
   ```
   /constitution Create principles focused on code quality, testing standards, and user experience
   ```

2. **Define Specification**
   ```
   /specify Build a photo album organizer with drag-and-drop functionality for organizing photos by date
   ```

3. **Clarify Requirements**
   ```
   /clarify
   ```

4. **Create Technical Plan**
   ```
   /plan Use React with TypeScript, minimal dependencies, local storage for metadata
   ```

5. **Generate Tasks**
   ```
   /tasks
   ```

6. **Analyze Consistency**
   ```
   /analyze
   ```

7. **Implement**
   ```
   /implement
   ```

## Integration with ShinkaEvolve
If you also have ShinkaEvolve available, you can add evolutionary optimization to your workflow after Spec-Kit generates tasks.

## Auto-Detection
Claude Code automatically detects if Spec-Kit is initialized in your project and will show available commands accordingly.