#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const workspacePackageDirs = [
  path.join(repoRoot, 'packages'),
  path.join(repoRoot, 'packages', 'udecode'),
];
const offenders = [];

for (const workspacePackageDir of workspacePackageDirs) {
  const entries = await readdir(workspacePackageDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const packageJsonPath = path.join(
      workspacePackageDir,
      entry.name,
      'package.json'
    );

    let packageJson;

    try {
      packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    } catch {
      continue;
    }

    const platePeer = packageJson.peerDependencies?.platejs;

    if (!platePeer) continue;

    const plateDev = packageJson.devDependencies?.platejs;

    if (plateDev === 'workspace:^') continue;

    offenders.push(
      `${packageJson.name} (${path.relative(repoRoot, packageJsonPath)}): expected devDependencies.platejs=workspace:^ because peerDependencies.platejs=${platePeer}; found ${String(plateDev)}`
    );
  }
}

if (offenders.length > 0) {
  console.error(offenders.join('\n'));
  process.exit(1);
}

console.log(
  'Verified platejs peer packages carry devDependencies.platejs=workspace:^'
);
