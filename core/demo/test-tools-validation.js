/**
 * Quick validation script to test tool functionality
 */

const { ToolTester } = require('./src/lib/ToolTester.ts');

async function runQuickValidation() {
  console.log('🧪 Running Tool Validation Tests...\n');
  
  try {
    const tester = new ToolTester();
    const results = await tester.runAllTests();
    const summary = tester.getTestSummary(results);
    
    console.log('📊 Test Summary:');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.passedTests}`);
    console.log(`Failed: ${summary.failedTests}`);
    console.log(`Pass Rate: ${summary.passRate.toFixed(1)}%\n`);
    
    if (summary.failedSuites.length > 0) {
      console.log('❌ Failed Tools:', summary.failedSuites.join(', '));
      
      // Show details of failed tests
      results.forEach(suite => {
        if (!suite.overallPassed) {
          console.log(`\n🔍 ${suite.toolName} failures:`);
          suite.results.forEach(result => {
            if (!result.passed) {
              console.log(`  - ${result.testCase.name}: ${result.actualMessage}`);
            }
          });
        }
      });
    } else {
      console.log('✅ All tools passed their tests!');
    }
    
    return summary.passRate >= 90;
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    return false;
  }
}

if (require.main === module) {
  runQuickValidation().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runQuickValidation };
