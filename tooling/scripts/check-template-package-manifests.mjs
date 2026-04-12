#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const templateDirs = [
  path.join(repoRoot, 'templates', 'plate-template'),
  path.join(repoRoot, 'templates', 'plate-playground-template'),
];
const offenderPattern = 'template-local-packages';
const offenders = [];

for (const templateDir of templateDirs) {
  for (const fileName of ['package.json', 'bun.lock']) {
    const filePath = path.join(templateDir, fileName);
    const content = await readFile(filePath, 'utf8');

    if (!content.includes(offenderPattern)) continue;

    offenders.push(path.relative(repoRoot, filePath));
  }
}

if (offenders.length > 0) {
  console.error(
    [
      'Committed templates must not reference local template tarballs.',
      'Run `git restore templates` or rerun template sync from a clean state.',
      '',
      ...offenders.map((offender) => `- ${offender}`),
    ].join('\n')
  );
  process.exit(1);
}

console.log('Verified committed templates do not reference local tarballs.');
