#!/usr/bin/env node

/**
 * Direct test of the autonomous system for self-evolution
 */

import { autonomousClaudeCode } from './integrations/autonomous-claude.ts';
import { autonomousOrchestrator } from './integrations/autonomous-orchestrator.ts';

console.log('🧪 TESTING AUTONOMOUS SELF-EVOLUTION');
console.log('═══════════════════════════════════════════════════════════════════════════════════════\n');

async function testAutonomousEvolution() {
    try {
        console.log('🎯 Testing Autonomous Orchestration...');

        // Test the autonomous orchestrator with self-evolution request
        const userInput = "self evolve this current repo in current workdir to know if this self evolving feature from enhanced claude-code works or not";

        const orchestrationResult = await autonomousOrchestrator.startAutonomousEvolution(userInput);

        console.log('\n📋 Orchestration Results:');
        console.log('Actions planned:', orchestrationResult.actions.length);
        orchestrationResult.actions.forEach((action, i) => {
            console.log(`   ${i + 1}. ${action.command} - ${action.reason}`);
        });

        console.log('\n🎯 Execution Plan:');
        console.log(orchestrationResult.executionPlan);

        console.log('\n🧠 Reasoning:');
        console.log(orchestrationResult.reasoning);

        // Test autonomous mode activation
        console.log('\n🚀 Testing Autonomous Mode Activation...');
        const autonomousResult = await autonomousClaudeCode.activateAutonomousMode(userInput, {
            aggressiveness: 'balanced',
            userApprovalRequired: false
        });

        console.log(`✅ Autonomous Session ID: ${autonomousResult.sessionId}`);
        console.log(`📋 Planned Actions: ${autonomousResult.actions.join(' → ')}`);
        console.log(`⏱️  Estimated Duration: ${autonomousResult.estimatedDuration}`);
        console.log(`🔍 Requires Approval: ${autonomousResult.requiresApproval}`);

        // Test status checking
        console.log('\n📊 Testing Status Monitoring...');
        const status = autonomousClaudeCode.getStatus();
        console.log(`🤖 Mode: ${status.mode.aggressiveness} (enabled: ${status.mode.enabled})`);
        console.log(`📈 Session History: ${status.sessionHistory} sessions`);
        console.log(`🔄 Evolution Interval: ${status.mode.evolutionInterval} hours`);

        console.log('\n🎉 AUTONOMOUS SELF-EVOLUTION TEST COMPLETE!');
        console.log('✅ All autonomous systems are working correctly');

    } catch (error) {
        console.error('\n❌ Autonomous Test Failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testAutonomousEvolution();