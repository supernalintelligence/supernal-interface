#!/usr/bin/env node
/**
 * Test runner for @supernal-interface widget-tool integration
 * 
 * This script validates that all tools and widgets are properly connected.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Starting @supernal-interface Widget-Tool Integration Tests');
console.log('=' .repeat(60));

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log('📋 Step 1: Building the demo application...');
    await runCommand('npm', ['run', 'build']);
    console.log('✅ Build completed successfully');
    
    console.log('\n📋 Step 2: Installing Playwright browsers...');
    await runCommand('npx', ['playwright', 'install']);
    console.log('✅ Playwright browsers installed');
    
    console.log('\n📋 Step 3: Running Playwright tests...');
    await runCommand('npx', ['playwright', 'test', '--reporter=list']);
    console.log('✅ All tests passed!');
    
    console.log('\n🎉 Widget-Tool Integration Tests Completed Successfully!');
    console.log('=' .repeat(60));
    console.log('✅ All 8 tools are properly connected to their widgets');
    console.log('✅ State synchronization is working correctly');
    console.log('✅ AI chat integration is functional');
    console.log('✅ Available tool methods are exposed and testable');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    console.log('\n🔧 To debug issues:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3011');
    console.log('3. Test widgets manually');
    console.log('4. Check browser console for errors');
    process.exit(1);
  }
}

main();
