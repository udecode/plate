import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  acquirePliteBuildLock,
  getPliteDeclarationEntries,
  withPliteBuildLock,
} from './build-plite-package.mjs';

const packageDirectories = [
  'browser',
  'core',
  'plite',
  'plite-dom',
  'plite-history',
  'plite-hyperscript',
  'plite-layout',
  'plite-react',
  'yjs',
];

const createLockFixture = (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'plite-build-lock-'));
  const lockPath = path.join(packageRoot, '.tmp/plite-build.lock');

  mkdirSync(path.dirname(lockPath), { recursive: true });

  t.after(() => rmSync(packageRoot, { force: true, recursive: true }));

  return { lockPath, packageRoot };
};

const readLockOwner = (lockPath) =>
  JSON.parse(
    readFileSync(path.join(lockPath, readdirSync(lockPath)[0]), 'utf8')
  );

const writeLockOwner = (lockPath, owner) => {
  mkdirSync(lockPath);
  writeFileSync(
    path.join(lockPath, `${owner.token}.json`),
    `${JSON.stringify(owner)}\n`
  );
};

test('maps every public declaration export into the staging graph', () => {
  assert.deepEqual(
    getPliteDeclarationEntries({
      exports: {
        '.': {
          import: './dist/index.js',
          types: './dist/index.d.ts',
        },
        './internal': {
          import: './dist/internal/index.js',
          types: './dist/internal/index.d.ts',
        },
        './package.json': './package.json',
      },
    }),
    {
      index: '.plite-types/index.d.ts',
      'internal/index': '.plite-types/internal/index.d.ts',
    }
  );
});

test('maps generated string exports to adjacent declarations', () => {
  assert.deepEqual(
    getPliteDeclarationEntries({
      exports: {
        '.': './dist/index.js',
        './package.json': './package.json',
        './react': './dist/react/index.js',
        './static': './dist/static/index.js',
      },
    }),
    {
      index: '.plite-types/index.d.ts',
      'react/index': '.plite-types/react/index.d.ts',
      'static/index': '.plite-types/static/index.d.ts',
    }
  );
});

test('rejects declaration entries outside the published dist owner', () => {
  assert.throws(
    () =>
      getPliteDeclarationEntries({
        exports: {
          '.': {
            types: './src/index.ts',
          },
        },
      }),
    /must live in \.\/dist/
  );
});

test('all release packages and dependencies use the shared declaration bundler', async () => {
  for (const packageDirectory of packageDirectories) {
    const packageJson = JSON.parse(
      await readFile(
        new URL(
          `../../packages/${packageDirectory}/package.json`,
          import.meta.url
        ),
        'utf8'
      )
    );

    assert.equal(
      packageJson.scripts.build,
      'node ../../tooling/scripts/build-plite-package.mjs',
      packageDirectory
    );
    assert.ok(
      Object.keys(getPliteDeclarationEntries(packageJson)).length > 0,
      packageDirectory
    );
  }
});

test('serializes concurrent builds with a bounded wait', (t) => {
  const { lockPath, packageRoot } = createLockFixture(t);

  writeLockOwner(lockPath, { pid: process.pid, token: 'active-owner' });

  const startedAt = performance.now();

  assert.throws(
    () => acquirePliteBuildLock({ packageRoot, timeoutMs: 25 }),
    /Timed out after 25ms waiting for/u
  );
  assert.ok(performance.now() - startedAt < 1000);
  assert.equal(readLockOwner(lockPath).token, 'active-owner');
});

test('recovers a build lock whose owner process exited', (t) => {
  const { lockPath, packageRoot } = createLockFixture(t);

  writeLockOwner(lockPath, {
    pid: 2_147_483_647,
    token: 'dead-owner',
  });

  const release = acquirePliteBuildLock({ packageRoot, timeoutMs: 100 });
  const owner = readLockOwner(lockPath);

  assert.equal(owner.pid, process.pid);
  assert.notEqual(owner.token, 'dead-owner');

  release();
  assert.equal(existsSync(lockPath), false);
});

test('releases the build lock after success and failure', (t) => {
  const { lockPath, packageRoot } = createLockFixture(t);

  withPliteBuildLock(() => assert.equal(existsSync(lockPath), true), {
    packageRoot,
    timeoutMs: 100,
  });
  assert.equal(existsSync(lockPath), false);

  assert.throws(
    () =>
      withPliteBuildLock(
        () => {
          throw new Error('fixture failure');
        },
        { packageRoot, timeoutMs: 100 }
      ),
    /fixture failure/u
  );
  assert.equal(existsSync(lockPath), false);
});

test('releases the build lock when its process exits', (t) => {
  const { lockPath, packageRoot } = createLockFixture(t);
  const moduleUrl = new URL('./build-plite-package.mjs', import.meta.url).href;
  const source = `import { acquirePliteBuildLock } from ${JSON.stringify(moduleUrl)}; acquirePliteBuildLock({ packageRoot: ${JSON.stringify(packageRoot)}, timeoutMs: 100 }); process.exit(0);`;
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', source],
    { encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(lockPath), false);
});
