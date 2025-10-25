#!/usr/bin/env node

/**
 * Universal Generator CLI
 */

import { Command } from 'commander';
import { UniversalGenerator } from '../generators/UniversalGenerator';
import { ToolRegistry } from '../registry/ToolRegistry';
import { createConfig } from '../config/UniversalInterfaceConfig';

const program = new Command();

program
  .name('supernal-interface')
  .description('Universal AI Interface and Testing Tools Generator')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate AI interfaces and test simulations')
  .option('-s, --scan <path>', 'Scan directory for @Tool decorated files', '.')
  .option('-o, --output <path>', 'Output directory for generated files', './generated')
  .action(async (options) => {
    console.log('🚀 Supernal Interface Generator');
    console.log(`📁 Scanning: ${options.scan}`);
    console.log(`📤 Output: ${options.output}`);
    
    // Check initial registry state
    const initialTools = Array.from(ToolRegistry.getAllTools().values());
    console.log(`📊 Initial registry: ${initialTools.length} tools`);
    
    if (initialTools.length === 0) {
      console.log('⚠️  No tools in registry. CLI cannot auto-load TypeScript decorators.');
      console.log('💡 To generate code:');
      console.log('   1. Import and instantiate your @Tool decorated classes');
      console.log('   2. Then call the generator programmatically');
      console.log('   3. Or use the examples in examples/complete-system/');
      return;
    }
    
    const config = createConfig('react', {
      outputDir: options.output,
      overwriteExisting: true
    });
    
    const generator = new UniversalGenerator(config);
    const result = await generator.generateAll(initialTools);
    
    if (result.errors.length > 0) {
      console.log('❌ Errors:', result.errors);
    } else {
      console.log(`✅ Generated ${result.filesWritten.length} files`);
      result.filesWritten.forEach(file => console.log(`   📄 ${file}`));
    }
  });

// Execute CLI when run directly
if (require.main === module) {
  program.parse();
}

export { program };
