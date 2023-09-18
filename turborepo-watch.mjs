/* eslint-disable no-console */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** SETUP */
const projectRootDirectory = process.cwd();
const packagesDirectory = path.join(projectRootDirectory, 'packages');

// Only watch changes under src/ to stop infinite loops.
const srcDirectoryRegex = /^[^/]+\/src\/.*\.(?:js|ts|tsx|jsx)$/;

function runBuildPackage(packageName) {
  const commandToRun = `turbo run build --filter=./packages/${packageName}`;
  const command = spawn(commandToRun, [], {
    shell: true,
    stdio: 'inherit',
  });
  command.on('error', (err) => {
    console.error(`Error running command: ${err}`);
  });
}

/** SCRIPT START */
console.log(
  '👀 Watching packages/<package-name>/src/*.(js|ts|tsx|jsx) files to rebuild.'
);

fs.watch(packagesDirectory, { recursive: true }, (eventType, filename) => {
  if (
    (eventType === 'change' || eventType === 'rename') &&
    filename &&
    srcDirectoryRegex.test(filename)
  ) {
    const parts = filename.split('/');
    if (parts.length >= 2) {
      const packageName = parts[0]; // Extract package name from the path
      console.log(
        `Detected ${eventType} in ${filename}. Running command for package ${packageName}:`
      );
      runBuildPackage(packageName);
    }
  }
});
