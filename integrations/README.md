# Claude Code Integrations

This directory contains integrations that enhance Claude Code with advanced capabilities from external repositories.

## Overview

The integration system allows Claude Code to optionally leverage:
- **Spec-Kit**: Structured specification-driven development workflows
- **ShinkaEvolve**: Evolutionary algorithms for code optimization

All integrations are designed to be **optional dependencies** - Claude Code works normally without them, but offers enhanced capabilities when they're available.

## Architecture

### Modular Design
- Each integration is self-contained with its own detection logic
- Graceful fallback when dependencies are not available
- Clear installation instructions when enhanced features are requested

### Integration Flow
```
ShinkaEvolve (evolutionary algorithms)
      ↓ drives optimization of
Spec-Kit (task management & workflows)
      ↓ enhances
Claude Code (CLI interface & software engineering)
```

## Available Integrations

### Spec-Kit Integration
- **Purpose**: Structured specification-driven development
- **Setup**: `uvx --from git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit specify init --here --ai claude`
- **Commands**: `/constitution`, `/specify`, `/clarify`, `/plan`, `/tasks`, `/analyze`, `/implement`
- **Detection**: Checks for `.specify/` and `.claude/commands/` directories

### ShinkaEvolve Integration
- **Purpose**: Evolutionary code optimization using LLMs
- **Setup**: Clone repository and install with uv/pip
- **Commands**: `/evolve`
- **Detection**: Checks for repository and installed commands

## Files

- `spec-kit-integration.ts`: Handles Spec-Kit detection and initialization
- `shinka-evolve-integration.ts`: Manages ShinkaEvolve availability and execution
- `integration-manager.ts`: Orchestrates all integrations and workflows
- `index.ts`: Main entry point for integration system

## Usage

### For Claude Code Core
```typescript
import { initializeIntegrations, getEnhancedCommands } from './integrations';

// During startup
initializeIntegrations();

// When displaying available commands
const enhancedCommands = getEnhancedCommands();
```

### For Individual Integrations
```typescript
import { specKitIntegration, shinkaEvolveIntegration } from './integrations';

// Check availability
if (specKitIntegration.isSpecKitAvailable()) {
  // Use Spec-Kit features
}

if (shinkaEvolveIntegration.isShinkaAvailable()) {
  // Use ShinkaEvolve features
}
```

## Command Detection

The system automatically detects available integrations and shows relevant commands:

- **No integrations**: Standard Claude Code commands only
- **Spec-Kit only**: Adds `/setup-speckit` command and spec workflow commands when initialized
- **ShinkaEvolve only**: Adds `/evolve` command
- **Both available**: Full enhanced workflow with `/setup-speckit` and `/evolve`

## Installation Guidance

When users try to use unavailable features, the system provides specific installation instructions:

1. Check if prerequisites (uv, Python) are installed
2. Provide exact commands to install missing integrations
3. Guide through initialization process
4. Confirm successful setup

## Error Handling

- Graceful degradation when integrations fail
- Clear error messages with actionable solutions
- Fallback to standard Claude Code functionality
- No impact on core Claude Code reliability

## Testing Integration Status

You can test the integration system by running:

```bash
node -e "require('./integrations').initializeIntegrations()"
```

This will display the current status of all integrations and installation instructions for any missing components.