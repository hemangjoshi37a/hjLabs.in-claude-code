#!/usr/bin/env node

/**
 * Startup script for Claude Code integrations
 * This can be called from the main Claude Code application to initialize enhanced capabilities
 */

import { integrationManager } from './integration-manager';
import { specKitIntegration } from './spec-kit-integration';
import { shinkaEvolveIntegration } from './shinka-evolve-integration';

interface StartupOptions {
  silent?: boolean;
  checkOnly?: boolean;
}

export async function initializeEnhancedCapabilities(options: StartupOptions = {}): Promise<void> {
  const { silent = false, checkOnly = false } = options;

  if (!silent) {
    console.log('🚀 Claude Code Enhanced Edition');
    console.log('   Integrating advanced software engineering capabilities...\n');
  }

  // Get current status
  const status = integrationManager.getStatus();

  if (!silent) {
    console.log('📊 Integration Status:');
    console.log(`   Spec-Kit: ${status.specKit.message}`);
    console.log(`   ShinkaEvolve: ${status.shinkaEvolve.message}`);
    console.log(`   Enhanced Workflow: ${status.combined.message}\n`);
  }

  // Show available commands
  const commands = integrationManager.getAvailableCommands();
  const availableCommands = commands.filter(cmd => cmd.available);
  const unavailableCommands = commands.filter(cmd => !cmd.available);

  if (!silent && availableCommands.length > 0) {
    console.log('✅ Available Enhanced Commands:');
    availableCommands.forEach(cmd => {
      console.log(`   ${cmd.command}: ${cmd.description}`);
    });
    console.log('');
  }

  if (!silent && unavailableCommands.length > 0) {
    console.log('⚠️  Additional Capabilities (require setup):');
    unavailableCommands.forEach(cmd => {
      console.log(`   ${cmd.command}: ${cmd.description}`);
      if (cmd.requirements) {
        console.log(`      → ${cmd.requirements}`);
      }
    });
    console.log('');
  }

  // Only show installation instructions if not in silent mode and there are unavailable features
  if (!silent && !checkOnly && unavailableCommands.length > 0) {
    console.log('💡 To enable additional capabilities:');

    if (!status.specKit.initialized && status.specKit.available) {
      console.log('\n   🌱 Initialize Spec-Kit for structured development:');
      console.log('      uvx --from git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit specify init --here --ai claude');
    } else if (!status.specKit.available) {
      console.log('\n   🌱 Install uv for Spec-Kit support:');
      console.log('      curl -LsSf https://astral.sh/uv/install.sh | sh');
    }

    if (!status.shinkaEvolve.available || !status.shinkaEvolve.installed) {
      console.log('\n   🧬 Setup ShinkaEvolve for evolutionary code optimization:');
      if (!status.shinkaEvolve.available) {
        console.log('      git clone https://github.com/SakanaAI/ShinkaEvolve /home/hemang/Documents/GitHub/hjLabs.in-ShinkaEvolve');
      }
      if (!status.shinkaEvolve.installed) {
        console.log('      cd /home/hemang/Documents/GitHub/hjLabs.in-ShinkaEvolve');
        console.log('      uv venv --python 3.11');
        console.log('      source .venv/bin/activate');
        console.log('      uv pip install -e .');
      }
    }

    console.log('\n   🔄 Restart Claude Code after setup to access new capabilities\n');
  }

  if (!silent) {
    const readyFeatures = [
      status.specKit.initialized && 'Structured Development',
      status.shinkaEvolve.available && status.shinkaEvolve.installed && 'Evolutionary Optimization',
      'Advanced Code Generation'
    ].filter(Boolean);

    console.log(`🎯 Ready for ${readyFeatures.join(' + ')}\n`);
  }
}

export function getIntegrationSummary() {
  const status = integrationManager.getStatus();
  const commands = integrationManager.getAvailableCommands();

  return {
    status,
    availableCommands: commands.filter(cmd => cmd.available).map(cmd => cmd.command),
    unavailableCommands: commands.filter(cmd => !cmd.available).map(cmd => ({
      command: cmd.command,
      requirements: cmd.requirements
    })),
    setupInstructions: integrationManager.getInstallationInstructions()
  };
}

// Command-line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const silent = args.includes('--silent');
  const checkOnly = args.includes('--check-only');

  initializeEnhancedCapabilities({ silent, checkOnly })
    .then(() => {
      if (args.includes('--json')) {
        console.log(JSON.stringify(getIntegrationSummary(), null, 2));
      }
    })
    .catch(error => {
      console.error('Error initializing integrations:', error);
      process.exit(1);
    });
}