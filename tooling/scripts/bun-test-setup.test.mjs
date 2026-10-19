import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('DOM setup supports stream parsers captured by the first imported module', (t) => {
  const fixture = mkdtempSync(join(tmpdir(), 'plate-test-streams-'));
  t.after(() => rmSync(fixture, { force: true, recursive: true }));
  const file = join(fixture, 'streams.test.ts');
  writeFileSync(
    file,
    `import { expect, test } from 'bun:test';
import { ReadableStream as NativeReadableStream } from 'node:stream/web';

class ImportedParser extends TransformStream {
  constructor() {
    super({ transform(chunk, controller) { controller.enqueue(chunk); } });
  }
}

test('native response streams pass through import-time parsers', async () => {
  const source = new NativeReadableStream({
    start(controller) { controller.enqueue('streamed'); controller.close(); },
  });
  const reader = source.pipeThrough(new ImportedParser()).getReader();
  expect(await reader.read()).toEqual({ done: false, value: 'streamed' });
  expect(await reader.read()).toEqual({ done: true, value: undefined });
});
`
  );
  const result = spawnSync(
    'bun',
    [
      'test',
      '--preload',
      fileURLToPath(new URL('../config/bunTestSetup.ts', import.meta.url)),
      file,
    ],
    { cwd: fixture, encoding: 'utf-8', timeout: 15_000 }
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

const runSpecs = (t, specs) => {
  const fixture = mkdtempSync(join(tmpdir(), 'plate-test-mocks-'));
  t.after(() => rmSync(fixture, { force: true, recursive: true }));
  writeFileSync(
    join(fixture, 'engine.mjs'),
    "export const render = 'real';\nexport default 'real';\n"
  );
  writeFileSync(
    join(fixture, 'engine.cjs'),
    "module.exports = { render: 'real' };\n"
  );
  const files = specs.map(([name, mockCall, check = '']) => {
    writeFileSync(
      join(fixture, name),
      `import { expect, jest, test, vi } from 'bun:test';
import { runInNewContext } from 'node:vm';
${mockCall}
test('${name}', async () => {
  const engine = await import('./engine.mjs');
  ${check}
});
`
    );
    return join(fixture, name);
  });
  return spawnSync(
    'bun',
    [
      'test',
      '--preload',
      fileURLToPath(new URL('../config/bunTestSetup.ts', import.meta.url)),
      ...files,
    ],
    { cwd: fixture, encoding: 'utf-8', timeout: 15_000 }
  );
};

const refusal =
  /The mock of '\.\/engine\.mjs' in second\.test\.ts adds default, but the mock in first\.test\.ts already set the exports of engine\.mjs in this Bun process/;

for (const [label, secondMock] of [
  [
    'mock.module with a factory',
    "mock.module('./engine.mjs', () => ({ default: 'mocked', render: 'mocked' }));",
  ],
  [
    'jest.mock with a factory',
    "jest.mock('./engine.mjs', () => ({ default: 'mocked', render: 'mocked' }));",
  ],
  [
    'vi.mock with a factory',
    "vi.mock('./engine.mjs', () => ({ default: 'mocked', render: 'mocked' }));",
  ],
  [
    'mock.module with an async factory',
    "mock.module('./engine.mjs', async () => ({ default: 'mocked', render: 'mocked' }));",
  ],
  [
    'mock.module with a promise from another realm',
    `mock.module('./engine.mjs', () => runInNewContext("Promise.resolve({ default: 'mocked', render: 'mocked' })"));`,
  ],
  [
    'mock.module with a function result',
    "mock.module('./engine.mjs', () => Object.assign(function engine() {}, { default: 'mocked', render: 'mocked' }));",
  ],
]) {
  test(`${label} that adds exports an earlier mock left out fails the run`, (t) => {
    const result = runSpecs(t, [
      [
        'first.test.ts',
        "mock.module('./engine.mjs', () => ({ render: 'mocked' }));",
      ],
      ['second.test.ts', secondMock],
    ]);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, refusal);
  });
}

test("a later module mock that keeps to an async first mock's exports passes", (t) => {
  const result = runSpecs(t, [
    [
      'first.test.ts',
      "mock.module('./engine.mjs', async () => ({ default: 'mocked', render: 'mocked' }));",
    ],
    [
      'second.test.ts',
      "mock.module('./engine.mjs', () => ({ render: 'second' }));",
      "expect(engine.render).toBe('second');",
    ],
  ]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('a module mock that adds an export after a real import fails the run', (t) => {
  const result = runSpecs(t, [
    ['first.test.ts', ''],
    [
      'second.test.ts',
      "mock.module('./engine.mjs', () => ({ extra: 'mocked', render: 'mocked' }));",
    ],
  ]);
  assert.notEqual(result.status, 0);
  assert.match(
    result.stdout + result.stderr,
    /The mock of '\.\/engine\.mjs' in second\.test\.ts adds extra, but a real import already set the exports of engine\.mjs in this Bun process/
  );
});

test("a module mock that names a loaded CommonJS module's default passes", (t) => {
  const result = runSpecs(t, [
    ['first.test.ts', '', "await import('./engine.cjs');"],
    [
      'second.test.ts',
      "mock.module('./engine.cjs', () => ({ default: { render: 'second' }, render: 'second' }));",
      "expect((await import('./engine.cjs')).render).toBe('second');",
    ],
  ]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('a module mock that patches an export the real module already loaded passes', (t) => {
  const result = runSpecs(t, [
    ['first.test.ts', ''],
    [
      'second.test.ts',
      "mock.module('./engine.mjs', () => ({ render: 'mocked' }));",
    ],
    [
      'third.test.ts',
      "mock.module('./engine.mjs', () => ({ default: 'third', render: 'third' }));",
      "expect(engine.default).toBe('third');",
    ],
  ]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
