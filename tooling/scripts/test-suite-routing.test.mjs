import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { globSync } from 'tinyglobby';

import {
  TEST_FAST_IGNORE_PATTERNS,
  TEST_FILE_PATTERNS,
  TEST_IGNORE_PATTERNS,
  TEST_SLOW_FILE_PATTERNS,
} from '../config/test-suites.mjs';

test('runner selects exact files, keeps lanes separate, and preserves JUnit and bail', (t) => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'plate-runner-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const runner = fileURLToPath(new URL('test-suite.mjs', import.meta.url));
  mkdirSync(path.join(cwd, 'tooling/scripts'), { recursive: true });
  writeFileSync(
    path.join(cwd, 'tooling/scripts/fast.test.mjs'),
    "import assert from 'node:assert/strict'; import test from 'node:test'; test('fast fixture', () => assert.equal(1, 1));"
  );
  writeFileSync(
    path.join(cwd, 'tooling/scripts/slow.slow.test.mjs'),
    "import test from 'node:test'; test('slow fixture', () => {});"
  );
  const run = (...args) =>
    spawnSync('bun', [runner, ...args], { cwd, encoding: 'utf-8' });
  const fast = run('fast', path.join(cwd, 'tooling/scripts/fast.test.mjs'));
  assert.equal(fast.status, 0, fast.stderr + fast.stdout);
  assert.match(fast.stdout, /fast fixture/);
  assert.doesNotMatch(fast.stdout, /slow fixture/);
  assert.equal(run('fast', 'tooling/scripts/slow.slow.test.mjs').status, 1);
  assert.equal(run('slow', 'tooling/scripts/slow.slow.test.mjs').status, 0);
  const junit = path.join(cwd, 'junit.xml');
  const reported = run(
    'fast',
    'tooling/scripts/fast.test.mjs',
    '--reporter=junit',
    '--reporter-outfile',
    junit
  );
  assert.equal(reported.status, 0, reported.stderr + reported.stdout);
  assert.match(readFileSync(junit, 'utf-8'), /fast fixture/);
  writeFileSync(
    path.join(cwd, 'tooling/scripts/failure.test.mjs'),
    "import { test, expect } from 'bun:test'; test('fails first', () => expect(1).toBe(2)); test('must not run', () => { throw new Error('BAIL_DID_NOT_STOP'); });"
  );
  const bailed = run('fast', '--bail', 'tooling/scripts/failure.test.mjs');
  assert.equal(bailed.status, 1);
  assert.doesNotMatch(bailed.stdout + bailed.stderr, /BAIL_DID_NOT_STOP/);
  writeFileSync(
    path.join(cwd, 'tooling/scripts/node-failure.test.mjs'),
    "import test from 'node:test'; test('node failure', () => { throw new Error('expected failure'); });"
  );
  mkdirSync(path.join(cwd, 'apps/example'), { recursive: true });
  writeFileSync(
    path.join(cwd, 'apps/example/pass.spec.ts'),
    "import { test } from 'bun:test'; test('Bun still runs after Node failure', () => {});"
  );
  const mixed = run(
    'fast',
    'tooling/scripts/node-failure.test.mjs',
    'apps/example/pass.spec.ts'
  );
  assert.equal(mixed.status, 1);
  assert.match(
    mixed.stdout + mixed.stderr,
    /Bun still runs after Node failure/
  );
});

test('module mocks stay isolated and their JUnit cases survive report merging', (t) => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'plate-runner-mocks-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const runner = fileURLToPath(new URL('test-suite.mjs', import.meta.url));
  mkdirSync(path.join(cwd, 'apps/example'), { recursive: true });
  writeFileSync(
    path.join(cwd, 'apps/example/value.ts'),
    'export const value = 1;'
  );
  writeFileSync(
    path.join(cwd, 'apps/example/mock.ts'),
    "import { mock } from 'bun:test'; mock.module('./value', () => ({ value: 2 }));"
  );
  writeFileSync(
    path.join(cwd, 'apps/example/mock.spec.ts'),
    "import './mock'; import { expect, test } from 'bun:test'; const { value } = await import('./value'); test('mocked value', () => expect(value).toBe(2));"
  );
  writeFileSync(
    path.join(cwd, 'apps/example/plain.spec.ts'),
    "import { expect, test } from 'bun:test'; import { value } from './value'; test('original value', () => expect(value).toBe(1));"
  );
  const junit = path.join(cwd, 'junit.xml');
  const result = spawnSync(
    'bun',
    [runner, 'fast', '--reporter=junit', '--reporter-outfile', junit],
    { cwd, encoding: 'utf-8' }
  );
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const report = readFileSync(junit, 'utf-8');
  assert.match(report, /mocked value/);
  assert.match(report, /original value/);
});

test('routes tooling slow contracts exclusively through the slow suite', (t) => {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'plate-test-suites-'));
  const toolingRoot = path.join(fixtureRoot, 'tooling/scripts');
  const browserRoot = path.join(fixtureRoot, 'apps/www/tests/browser');
  const browserFixture = 'apps/www/tests/browser/fixture.spec.ts';
  const fastFixture = 'tooling/scripts/fixture.test.mjs';
  const slowFixture = 'tooling/scripts/fixture.slow.test.mjs';

  t.after(() => {
    rmSync(fixtureRoot, { force: true, recursive: true });
  });
  mkdirSync(toolingRoot, { recursive: true });
  mkdirSync(browserRoot, { recursive: true });
  writeFileSync(path.join(fixtureRoot, browserFixture), '');
  writeFileSync(path.join(fixtureRoot, fastFixture), '');
  writeFileSync(path.join(fixtureRoot, slowFixture), '');

  const fastFiles = new Set(
    globSync(TEST_FILE_PATTERNS, {
      cwd: fixtureRoot,
      ignore: TEST_FAST_IGNORE_PATTERNS,
      onlyFiles: true,
    })
  );
  const slowFiles = new Set(
    globSync(TEST_SLOW_FILE_PATTERNS, {
      cwd: fixtureRoot,
      ignore: TEST_IGNORE_PATTERNS,
      onlyFiles: true,
    })
  );

  assert.equal(fastFiles.has(fastFixture), true);
  assert.equal(fastFiles.has(browserFixture), false);
  assert.equal(fastFiles.has(slowFixture), false);
  assert.equal(slowFiles.has(fastFixture), false);
  assert.equal(slowFiles.has(slowFixture), true);
});

test('routes consolidated editor tests only through their package tasks', (t) => {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'plate-test-suites-'));
  const fixtures = [
    'apps/plite/scripts/runner.test.mjs',
    'benchmarks/editor/benchmarks/metric.test.ts',
    'packages/platejs/src/editor.spec.ts',
    'packages/plitejs/test/editor.test.ts',
  ];

  t.after(() => {
    rmSync(fixtureRoot, { force: true, recursive: true });
  });
  for (const fixture of fixtures) {
    const filename = path.join(fixtureRoot, fixture);

    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(filename, '');
  }

  const fastFiles = new Set(
    globSync(TEST_FILE_PATTERNS, {
      cwd: fixtureRoot,
      ignore: TEST_FAST_IGNORE_PATTERNS,
      onlyFiles: true,
    })
  );

  assert.equal(fastFiles.has(fixtures[0]), true);
  assert.equal(fastFiles.has(fixtures[1]), true);
  assert.equal(fastFiles.has(fixtures[2]), false);
  assert.equal(fastFiles.has(fixtures[3]), false);
});

test('discovers website and lint contracts across their authored extensions', (t) => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'plate-app-test-discovery-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const runner = fileURLToPath(new URL('test-suite.mjs', import.meta.url));
  const fixtures = [
    'apps/www/src/value.test.ts',
    'apps/www/src/component.test.tsx',
    'apps/www/scripts/build.test.mts',
    'tooling/oxlint/plugin.test.mjs',
  ];

  for (const fixture of fixtures) {
    const filename = path.join(cwd, fixture);
    mkdirSync(path.dirname(filename), { recursive: true });
    writeFileSync(
      filename,
      `import { test } from 'bun:test'; test(${JSON.stringify(fixture)}, () => {});`
    );
  }
  const result = spawnSync('bun', [runner, 'fast'], {
    cwd,
    encoding: 'utf-8',
  });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  for (const fixture of fixtures) {
    assert.ok((result.stdout + result.stderr).includes(fixture), fixture);
  }
});

test('runs application tests from their workspace with root preloads and merged reports', (t) => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'plate-workspace-tests-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  writeFileSync(
    path.join(cwd, 'bunfig.toml'),
    '[test]\npreload = ["./setup.ts"]\n'
  );
  writeFileSync(path.join(cwd, 'setup.ts'), 'globalThis.rootPreload = 42;');

  for (const name of ['first', 'second']) {
    const directory = path.join(cwd, 'apps', name);
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, 'package.json'), '{"private":true}');
    writeFileSync(
      path.join(directory, 'workspace.test.ts'),
      `import { expect, test } from 'bun:test'; test(${JSON.stringify(name)}, () => {
        expect(process.cwd()).toBe(${JSON.stringify(realpathSync(directory))});
        expect(globalThis.rootPreload).toBe(42);
      });`
    );
  }

  const runner = fileURLToPath(new URL('test-suite.mjs', import.meta.url));
  const result = spawnSync(
    'bun',
    [runner, 'fast', '--reporter=junit', '--reporter-outfile', 'results.xml'],
    { cwd, encoding: 'utf-8' }
  );
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const report = readFileSync(path.join(cwd, 'results.xml'), 'utf-8');
  assert.match(report, /first/);
  assert.match(report, /second/);
});

test('runs editor slow contracts without pulling package fast contracts into the root suite', (t) => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'plate-slow-routing-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const runner = fileURLToPath(new URL('test-suite.mjs', import.meta.url));

  for (const name of ['platejs', 'plitejs']) {
    const directory = path.join(cwd, 'packages', name, 'src');
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      path.join(directory, 'behavior.slow.ts'),
      `import { test } from 'bun:test'; test('${name} slow behavior', () => {});`
    );
    writeFileSync(
      path.join(directory, 'behavior.spec.ts'),
      "throw new Error('PACKAGE_FAST_CONTRACT_MUST_STAY_IN_ITS_PARTITION');"
    );
  }

  const result = spawnSync('bun', [runner, 'slow', 'packages'], {
    cwd,
    encoding: 'utf-8',
  });
  const output = result.stdout + result.stderr;
  assert.equal(result.status, 0, output);
  assert.match(output, /platejs slow behavior/);
  assert.match(output, /plitejs slow behavior/);
  assert.doesNotMatch(output, /PACKAGE_FAST_CONTRACT_MUST_STAY/);
});

test(
  'watches each application and stops the remaining watcher when one exits',
  { timeout: 10_000 },
  async (t) => {
    const cwd = mkdtempSync(path.join(tmpdir(), 'plate-watch-tests-'));
    const runner = fileURLToPath(new URL('test-suite.mjs', import.meta.url));
    const children = [];
    let output = '';

    for (const name of ['first', 'second']) {
      const directory = path.join(cwd, 'apps', name);
      mkdirSync(directory, { recursive: true });
      writeFileSync(path.join(directory, 'package.json'), '{"private":true}');
      writeFileSync(
        path.join(directory, 'watch.test.ts'),
        `import { test } from 'bun:test'; test('${name}', () => {
        console.log('WATCHER ${name}', process.pid);
      });`
      );
    }

    const watcher = spawn('bun', [runner, 'fast', '--watch'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    t.after(() => {
      watcher.kill('SIGKILL');
      for (const pid of children) {
        try {
          process.kill(pid, 'SIGKILL');
        } catch (error) {
          if (error.code !== 'ESRCH') throw error;
        }
      }
      rmSync(cwd, { recursive: true, force: true });
    });
    watcher.stdout.on('data', (data) => {
      output += data;
    });
    watcher.stderr.on('data', (data) => {
      output += data;
    });

    const waitFor = async (predicate) => {
      const deadline = Date.now() + 3000;
      while (!predicate() && Date.now() < deadline) await delay(20);
      assert.ok(predicate(), output);
    };

    await waitFor(
      () =>
        /WATCHER first \d+/.test(output) && /WATCHER second \d+/.test(output)
    );
    children.push(
      ...[...output.matchAll(/WATCHER \w+ (\d+)/g)].map((match) =>
        Number(match[1])
      )
    );
    assert.equal(new Set(children).size, 2);

    writeFileSync(
      path.join(cwd, 'apps/second/watch.test.ts'),
      "import { test } from 'bun:test'; test('updated', () => { console.log('WATCH_UPDATED'); });"
    );
    await waitFor(() => output.includes('WATCH_UPDATED'));
    process.kill(children[0], 'SIGTERM');
    await waitFor(
      () => watcher.exitCode !== null || watcher.signalCode !== null
    );
    for (const pid of children) {
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    }
  }
);
