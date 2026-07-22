import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { runTypeScriptConsumer } from './check-plite-release-artifacts.mjs';

test('rejects a packed declaration that imports a missing Core symbol', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'plite-release-types-'));
  const consumerDirectory = join(root, 'consumer');
  const coreDirectory = join(root, 'core');
  const yjsDirectory = join(
    consumerDirectory,
    'node_modules',
    '@platejs',
    'yjs'
  );

  t.after(() => rmSync(root, { force: true, recursive: true }));
  mkdirSync(coreDirectory, { recursive: true });
  mkdirSync(join(yjsDirectory, 'dist'), { recursive: true });
  writeFileSync(
    join(coreDirectory, 'package.json'),
    JSON.stringify({
      exports: {
        '.': {
          default: './index.js',
          types: './index.d.ts',
        },
      },
      name: '@platejs/core',
      type: 'module',
    })
  );
  writeFileSync(
    join(coreDirectory, 'index.d.ts'),
    'export type Present = true;'
  );
  writeFileSync(join(coreDirectory, 'index.js'), 'export {};');
  symlinkSync(
    coreDirectory,
    join(consumerDirectory, 'node_modules', '@platejs', 'core'),
    'junction'
  );
  writeFileSync(
    join(yjsDirectory, 'package.json'),
    JSON.stringify({
      exports: {
        '.': {
          default: './dist/index.js',
          types: './dist/index.d.ts',
        },
      },
      name: '@platejs/yjs',
      type: 'module',
    })
  );
  writeFileSync(
    join(yjsDirectory, 'dist', 'index.d.ts'),
    [
      "import type { MissingCoreSymbol } from '@platejs/core';",
      'export type Probe = MissingCoreSymbol;',
    ].join('\n')
  );
  writeFileSync(join(yjsDirectory, 'dist', 'index.js'), 'export {};');
  writeFileSync(
    join(consumerDirectory, 'consumer.ts'),
    "import type { Probe } from '@platejs/yjs'; declare const probe: Probe; void probe;"
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

  assert.throws(
    () => runTypeScriptConsumer(consumerDirectory, 'tsconfig.json'),
    /TS2305: Module .*@platejs\/core.*MissingCoreSymbol/
  );
});
