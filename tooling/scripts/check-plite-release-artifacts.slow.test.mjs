import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runTypeScriptConsumer } from './check-plite-release-artifacts.mjs';

test('rejects a packed declaration that imports a missing Plate symbol', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'plite-release-types-'));
  const consumerDirectory = join(root, 'consumer');
  const plateDirectory = join(consumerDirectory, 'node_modules', 'platejs');
  const yjsDirectory = join(plateDirectory, 'yjs');

  t.after(() => {
    rmSync(root, { force: true, recursive: true });
  });
  mkdirSync(plateDirectory, { recursive: true });
  mkdirSync(yjsDirectory, { recursive: true });
  mkdirSync(join(consumerDirectory, 'node_modules'), { recursive: true });
  writeFileSync(
    join(plateDirectory, 'package.json'),
    JSON.stringify({
      exports: {
        '.': {
          default: './index.js',
          types: './index.d.ts',
        },
        './yjs': {
          default: './yjs/index.js',
          types: './yjs/index.d.ts',
        },
      },
      name: 'platejs',
      type: 'module',
    })
  );
  writeFileSync(
    join(plateDirectory, 'index.d.ts'),
    'export type Present = true;'
  );
  writeFileSync(join(plateDirectory, 'index.js'), 'export {};');
  writeFileSync(
    join(yjsDirectory, 'index.d.ts'),
    [
      "import type { MissingCoreSymbol } from 'platejs';",
      'export type Probe = MissingCoreSymbol;',
    ].join('\n')
  );
  writeFileSync(join(yjsDirectory, 'index.js'), 'export {};');
  writeFileSync(
    join(consumerDirectory, 'consumer.ts'),
    "import type { Probe } from 'platejs/yjs'; declare const probe: Probe; void probe;"
  );
  writeFileSync(
    join(consumerDirectory, 'package.json'),
    JSON.stringify({ name: 'consumer', type: 'module' })
  );
  writeFileSync(
    join(consumerDirectory, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        noEmit: true,
        strict: true,
        types: [],
      },
      files: ['./consumer.ts'],
    })
  );

  assert.throws(() => {
    runTypeScriptConsumer(consumerDirectory, 'tsconfig.json');
  }, /TS2305: Module .*platejs.*MissingCoreSymbol/);
});
