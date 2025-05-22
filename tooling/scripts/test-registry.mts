#!/usr/bin/env node

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const testRegistry = async (name: string) => {
  // Get target directory path
  const targetDir = path.resolve(process.cwd(), '..', '..', '..', 'test', name);

  // Create target directory if it doesn't exist
  fs.mkdirSync(targetDir, { recursive: true });

  try {
    // Step 1: Create Next.js app
    console.log(`Creating Next.js app in ${targetDir}...`);
    execSync(
      `npx create-next-app@latest ${name} --tailwind --eslint --typescript --app --no-src-dir --use-pnpm --turbopack --import-alias`,
      {
        cwd: path.resolve(process.cwd(), '..', '..', '..', 'test'),
        stdio: 'inherit',
      }
    );

    // Step 2: Initialize shadcn
    console.log('Initializing shadcn...');
    execSync('npx shadcn@latest init --base-color neutral -y', {
      cwd: targetDir,
      stdio: 'inherit',
    });

    // Step 3: Install registry item
    console.log(`Installing registry item ${name}...`);
    execSync(`npx shadcn add http://localhost:3000/rd/${name} -y`, {
      cwd: targetDir,
      stdio: 'inherit',
    });

    // Step 4: Run TypeScript check
    console.log('Running TypeScript check...');
    execSync('pnpm tsc --noEmit', {
      cwd: targetDir,
      stdio: 'inherit',
    });

    console.log('✅ All tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Get the item name from command line arguments
const itemName = process.argv[2];

if (!itemName) {
  console.error('Please provide an item name as an argument');
  process.exit(1);
}

testRegistry(itemName);
