import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  enforceBaseline,
  lineIdentity,
  groupFindings,
} from '../scripts/finding-baseline.mjs';
import plugin, { baselineFile, reportAllEnv } from './plate-plugin.mjs';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const rules = Object.entries(plugin.rules)
  .filter(([, rule]) => rule.baselined)
  .map(([name]) => `plate/${name}`);

const lint = spawnSync(
  'pnpm',
  ['exec', 'oxlint', '-c', 'oxlint.config.ts', '--format', 'json', '.'],
  {
    cwd: repoRoot,
    encoding: 'utf-8',
    env: { ...process.env, ...reportAllEnv },
    maxBuffer: 1024 * 1024 * 256,
  }
);
const sources = new Map();
const sourceOf = (file) => {
  if (!sources.has(file)) {
    sources.set(file, readFileSync(path.join(repoRoot, file), 'utf-8'));
  }
  return sources.get(file);
};
const findings = JSON.parse(lint.stdout).diagnostics.flatMap((diagnostic) => {
  const match = /^plate\((.+)\)$/u.exec(diagnostic.code ?? '');
  const rule = match && `plate/${match[1]}`;
  if (!rules.includes(rule)) return [];
  const file = diagnostic.filename;
  const identity = lineIdentity(sourceOf(file), diagnostic.labels[0].span.line);
  return [{ file, identity, rule }];
});
const found = {
  ...Object.fromEntries(rules.map((rule) => [rule, {}])),
  ...groupFindings(findings),
};

process.exitCode = enforceBaseline({
  file: baselineFile,
  found,
  lowerCommand: 'pnpm lint:baseline',
  mode: process.argv.includes('--check')
    ? 'check'
    : process.argv.includes('--init')
      ? 'init'
      : 'lower',
  newFindingsHelp:
    'New plate/* instances. Fix them, or put an exception on the line: `// oxlint-disable-next-line plate/<rule> -- <reason>; expires <YYYY-MM-DD>; approved <name>`. The baseline never grows.',
  rules,
});
