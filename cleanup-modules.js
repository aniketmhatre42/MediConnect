const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const util = require('util');
const fsPromises = fs.promises;

const PATTERNS_TO_DELETE = [
  '**/.git',
  '**/.github',
  '**/test',
  '**/tests',
  '**/docs',
  '**/examples',
  '**/*.md',
  '**/*.map',
  '**/*.ts',
  '**/*.pack',
  '**/*.idx'
];

async function cleanup() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  console.log('Starting cleanup...');
  console.log(`Looking in ${nodeModulesPath}`);
  
  for (const pattern of PATTERNS_TO_DELETE) {
    try {
      console.log(`Finding files matching: ${pattern}`);
      const files = await glob(path.join(nodeModulesPath, pattern));
      
      console.log(`Found ${files.length} files/directories to delete`);
      
      for (const file of files) {
        try {
          const stat = await fsPromises.stat(file);
          if (stat.isDirectory()) {
            console.log(`Removing directory: ${file}`);
            await fsPromises.rm(file, { recursive: true, force: true });
          } else {
            console.log(`Removing file: ${file}`);
            await fsPromises.unlink(file);
          }
        } catch (err) {
          console.error(`Error deleting ${file}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`Error processing pattern ${pattern}:`, err.message);
    }
  }
  
  console.log('Cleanup complete!');
}

// Install required dependencies if they don't exist
async function ensureDependencies() {
  try {
    require('glob');
    console.log('Dependencies already installed, proceeding with cleanup...');
    await cleanup();
  } catch (err) {
    console.log('Installing required dependencies...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install glob --no-save', { stdio: 'inherit' });
      console.log('Dependencies installed, proceeding with cleanup...');
      // Re-require glob after installation
      const { glob } = require('glob');
      await cleanup();
    } catch (installErr) {
      console.error('Failed to install dependencies:', installErr.message);
    }
  }
}

ensureDependencies().catch(console.error);
