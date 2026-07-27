import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const repositoryRoot = path.resolve(import.meta.dirname, '../..');

test('keeps migrations in their opt-in barrel', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'plate-brl-'));

  t.after(() => rmSync(packageRoot, { force: true, recursive: true }));

  mkdirSync(path.join(packageRoot, 'src/lib'), { recursive: true });
  mkdirSync(path.join(packageRoot, 'src/migrations'), { recursive: true });
  writeFileSync(
    path.join(packageRoot, 'src/lib/CurrentPlugin.ts'),
    'export const CurrentPlugin = {};\n'
  );
  writeFileSync(
    path.join(packageRoot, 'src/migrations/V54MigrationPlugin.ts'),
    'export const V54MigrationPlugin = {};\n'
  );

  execFileSync('sh', [path.join(repositoryRoot, 'tooling/scripts/brl.sh')], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      INIT_CWD: packageRoot,
      PATH: `${path.join(repositoryRoot, 'node_modules/.bin')}:${process.env.PATH}`,
    },
  });

  const rootBarrel = readFileSync(
    path.join(packageRoot, 'src/index.ts'),
    'utf8'
  );
  const migrationBarrel = readFileSync(
    path.join(packageRoot, 'src/migrations/index.ts'),
    'utf8'
  );

  assert.match(rootBarrel, /export \* from '\.\/lib\/index';/);
  assert.doesNotMatch(rootBarrel, /migrations/);
  assert.match(migrationBarrel, /export \* from '\.\/V54MigrationPlugin';/);
});
