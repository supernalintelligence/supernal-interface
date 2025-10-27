#!/usr/bin/env node

/**
 * Debug script to check package-lock.json sync issues
 * This mimics what GitHub Actions does but with better error reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking package-lock.json sync...');
console.log(`Node.js version: ${process.version}`);
console.log(`npm version: ${execSync('npm --version', { encoding: 'utf8' }).trim()}`);

// Change to core directory
process.chdir(path.join(__dirname, '../core'));

try {
  // Clear npm cache
  console.log('\n🧹 Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Run npm ci --dry-run
  console.log('\n🔍 Running npm ci --dry-run...');
  const output = execSync('npm ci --dry-run', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ package-lock.json is in sync!');
  console.log('\nOutput:', output);
} catch (error) {
  console.log('❌ package-lock.json is out of sync!');
  console.log('\n📋 Full error output:');
  console.log(error.stdout);
  console.log(error.stderr);
  
  console.log('\n📊 Package.json analysis:');
  const pkg = require('./package.json');
  
  console.log('\nDependencies:');
  console.log(JSON.stringify(pkg.dependencies || {}, null, 2));
  
  console.log('\nDevDependencies:');
  console.log(JSON.stringify(pkg.devDependencies || {}, null, 2));
  
  process.exit(1);
}
