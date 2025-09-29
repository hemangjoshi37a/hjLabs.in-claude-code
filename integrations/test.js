// Simple test script to verify integration detection
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Testing Claude Code Integration System\n');

// Test uvx availability (for Spec-Kit)
console.log('1. Testing uvx availability (Spec-Kit prerequisite):');
try {
  execSync('uvx --help', { stdio: 'ignore' });
  console.log('   ✅ uvx is available');
} catch {
  console.log('   ❌ uvx not found - install uv for Spec-Kit support');
}

// Test Spec-Kit repository detection
console.log('\n2. Testing Spec-Kit repository detection:');
const specKitPath = '/home/hemang/Documents/GitHub/hjLabs.in-spec-kit';
if (fs.existsSync(path.join(specKitPath, 'pyproject.toml'))) {
  console.log(`   ✅ Spec-Kit repository found at: ${specKitPath}`);
} else {
  console.log('   ❌ Spec-Kit repository not found');
}

// Test Spec-Kit initialization in current project
console.log('\n3. Testing Spec-Kit initialization in current project:');
const specifyDir = path.join(process.cwd(), '.specify');
const claudeDir = path.join(process.cwd(), '.claude');
if (fs.existsSync(specifyDir) && fs.existsSync(claudeDir)) {
  console.log('   ✅ Spec-Kit appears to be initialized');

  // Check for command files
  const commandsDir = path.join(claudeDir, 'commands');
  if (fs.existsSync(commandsDir)) {
    const commands = fs.readdirSync(commandsDir);
    console.log(`   📋 Available commands: ${commands.join(', ')}`);
  }
} else {
  console.log('   ❌ Spec-Kit not initialized in this project');
  console.log('   💡 Run: uvx --from git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit specify init --here --ai claude');
}

// Test ShinkaEvolve repository detection
console.log('\n4. Testing ShinkaEvolve repository detection:');
const shinkaPath = '/home/hemang/Documents/GitHub/hjLabs.in-ShinkaEvolve';
if (fs.existsSync(path.join(shinkaPath, 'pyproject.toml'))) {
  console.log(`   ✅ ShinkaEvolve repository found at: ${shinkaPath}`);

  // Test if installed
  try {
    execSync('shinka_launch --help', { stdio: 'ignore' });
    console.log('   ✅ ShinkaEvolve is installed');
  } catch {
    console.log('   ⚠️  ShinkaEvolve repository found but not installed');
    console.log('   💡 Install: cd ' + shinkaPath + ' && uv pip install -e .');
  }
} else {
  console.log('   ❌ ShinkaEvolve repository not found');
  console.log('   💡 Clone: git clone https://github.com/SakanaAI/ShinkaEvolve ' + shinkaPath);
}

// Summary
console.log('\n📊 Integration Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Determine available workflows
const uvxAvailable = (() => {
  try { execSync('uvx --help', { stdio: 'ignore' }); return true; } catch { return false; }
})();

const specKitRepo = fs.existsSync(path.join(specKitPath, 'pyproject.toml'));
const specKitInit = fs.existsSync(specifyDir) && fs.existsSync(claudeDir);

const shinkaRepo = fs.existsSync(path.join(shinkaPath, 'pyproject.toml'));
const shinkaInstalled = (() => {
  try { execSync('shinka_launch --help', { stdio: 'ignore' }); return true; } catch { return false; }
})();

if (specKitInit && shinkaRepo && shinkaInstalled) {
  console.log('🚀 FULL ENHANCED WORKFLOW AVAILABLE');
  console.log('   Claude Code + Spec-Kit + ShinkaEvolve integration ready');
} else if (specKitInit) {
  console.log('🌱 SPEC-KIT WORKFLOW AVAILABLE');
  console.log('   Structured development workflow ready');
} else if (uvxAvailable && specKitRepo) {
  console.log('💫 SPEC-KIT SETUP READY');
  console.log('   Run setup command to initialize');
} else {
  console.log('⚙️  BASE CLAUDE CODE FUNCTIONALITY');
  console.log('   Enhanced features available after setup');
}

console.log('\n🎯 Next Steps:');
if (!uvxAvailable) {
  console.log('   1. Install uv: curl -LsSf https://astral.sh/uv/install.sh | sh');
}
if (!specKitInit && uvxAvailable) {
  console.log('   2. Initialize Spec-Kit: uvx --from git+https://github.com/hemangjoshi37a/hjLabs.in-spec-kit specify init --here --ai claude');
}
if (!shinkaRepo) {
  console.log('   3. Clone ShinkaEvolve: git clone https://github.com/SakanaAI/ShinkaEvolve ' + shinkaPath);
}
if (shinkaRepo && !shinkaInstalled) {
  console.log('   4. Install ShinkaEvolve: cd ' + shinkaPath + ' && uv pip install -e .');
}

console.log('\n✨ Integration test complete!\n');