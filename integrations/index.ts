// Main integration entry point for claude-code enhancements
export { SpecKitIntegration, specKitIntegration } from './spec-kit-integration';
export { ShinkaEvolveIntegration, shinkaEvolveIntegration } from './shinka-evolve-integration';
export { IntegrationManager, integrationManager } from './integration-manager';

import { integrationManager } from './integration-manager';

/**
 * Initialize integrations and display status
 * Call this during claude-code startup
 */
export function initializeIntegrations(): void {
  console.log('\n🔧 Checking Enhanced Capabilities...');
  integrationManager.checkAndSuggestInstallation();
}

/**
 * Get available enhanced commands
 */
export function getEnhancedCommands() {
  return integrationManager.getAvailableCommands();
}

/**
 * Check if specific integrations are available
 */
export function getIntegrationStatus() {
  return integrationManager.getStatus();
}

// Auto-initialize when imported
if (require.main === module) {
  initializeIntegrations();
}