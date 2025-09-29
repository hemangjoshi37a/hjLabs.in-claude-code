#!/usr/bin/env node

/**
 * Setup script for Claude Code Enhanced
 * Runs after npm install to configure the enhanced environment
 */

import { execSync } from 'child_process';
import { existsSync, chmodSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

console.log('🛠️  Setting up Claude Code Enhanced...\n');

try {
  // Make the CLI executable
  const binPath = join(projectRoot, 'bin', 'claude-enhanced.js');
  if (existsSync(binPath)) {
    chmodSync(binPath, '755');
    console.log('✅ Made CLI executable');
  }

  // Check for required dependencies
  console.log('🔍 Checking dependencies...');

  try {
    execSync('uvx --version', { stdio: 'ignore' });
    console.log('✅ uvx available for Spec-Kit integration');
  } catch {
    console.log('⚠️  uvx not found - install uv for enhanced Spec-Kit capabilities');
    console.log('   curl -LsSf https://astral.sh/uv/install.sh | sh');
  }

  // Check original Claude Code installation
  try {
    const claudeVersion = execSync('claude --version', { encoding: 'utf8' });
    console.log(`✅ Original Claude Code found: ${claudeVersion.trim()}`);
  } catch {
    console.log('⚠️  Original Claude Code not found');
    console.log('   npm install -g @anthropic-ai/claude-code');
  }

  console.log('\n🎉 Claude Code Enhanced Setup Complete!');
  console.log('\n🚀 Usage:');
  console.log('   claude-enhanced  # Start enhanced Claude Code');
  console.log('   # or');
  console.log('   claude           # If installed globally, will use enhanced version');
  console.log('\n💡 To enable full autonomous capabilities in any project:');
  console.log('   cd your-project');
  console.log('   uvx --from git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit specify init --here --ai claude');
  console.log('\n🎯 Then try: /autonomous "Build something amazing"');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}