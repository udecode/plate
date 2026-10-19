#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hydrateIssues } from './hydrate-issues.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const { refresh } = await hydrateIssues();
execFileSync(process.execPath, [path.join(root, 'build-closure-ledger.mjs')], {
  stdio: 'inherit',
});

process.stdout.write(
  `${JSON.stringify(
    {
      hydrated: refresh.inventory.hydratedIssueCount,
      raw: refresh.raw,
      refreshedAt: refresh.refreshedAt,
      unchecked: refresh.uncheckedIssueCount,
    },
    null,
    2
  )}\n`
);
