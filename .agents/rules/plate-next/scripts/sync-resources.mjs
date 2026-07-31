#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = resolve(dirname(scriptPath), '../../../..');
const resourcePairs = [
  [
    '.agents/rules/plate-plugin-creator/references/plugin-authoring-audit.md',
    '.agents/skills/plate-plugin-creator/references/plugin-authoring-audit.md',
  ],
  [
    '.agents/rules/plate-plugin-creator/rules/creation-flow.md',
    '.agents/skills/plate-plugin-creator/rules/creation-flow.md',
  ],
  [
    '.agents/rules/plate-plugin-creator/rules/typing.md',
    '.agents/skills/plate-plugin-creator/rules/typing.md',
  ],
  [
    '.agents/rules/plate-ui/rules/component-shape.md',
    '.agents/skills/plate-ui/rules/component-shape.md',
  ],
];
const check = process.argv.slice(2).includes('--check');
const stale = [];

for (const [sourcePath, generatedPath] of resourcePairs) {
  const source = join(root, sourcePath);
  const generated = join(root, generatedPath);
  const matches =
    existsSync(source) &&
    existsSync(generated) &&
    readFileSync(source).equals(readFileSync(generated));

  if (matches) continue;
  if (check) {
    stale.push(generatedPath);

    continue;
  }

  mkdirSync(dirname(generated), { recursive: true });
  copyFileSync(source, generated);
}

if (stale.length > 0) {
  throw new Error(`Stale generated skill resources: ${stale.join(', ')}`);
}

console.log(
  check
    ? 'Required skill resources: exact.'
    : 'Required skill resources: synced.'
);
