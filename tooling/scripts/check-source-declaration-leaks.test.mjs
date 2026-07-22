import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';

import {
  findSourceDeclarationLeaks,
  resolveSourceDeclarationRepoRoot,
} from './check-source-declaration-leaks.mjs';

const temporaryRoots = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

const createFixture = () => {
  const root = mkdtempSync(join(tmpdir(), 'source-declaration-leaks-'));

  temporaryRoots.push(root);
  mkdirSync(join(root, 'packages', 'example', 'dist'), { recursive: true });
  mkdirSync(join(root, 'packages', 'example', 'src'), { recursive: true });
  mkdirSync(join(root, 'packages', 'example', 'type-tests'), {
    recursive: true,
  });

  return root;
};

test('rejects generated declarations beside package source and type tests', () => {
  const root = createFixture();

  writeFileSync(join(root, 'packages/example/src/generated.ts'), 'export {};');
  writeFileSync(
    join(root, 'packages/example/src/generated.d.ts'),
    'export {};'
  );
  writeFileSync(
    join(root, 'packages/example/type-tests/contract.d.ts'),
    'export {};'
  );
  writeFileSync(join(root, 'packages/example/dist/index.d.ts'), 'export {};');

  assert.deepEqual(findSourceDeclarationLeaks(root), [
    'packages/example/src/generated.d.ts',
    'packages/example/type-tests/contract.d.ts',
  ]);
});

test('allows standalone authored source declarations', () => {
  const root = createFixture();
  const declaration = 'packages/example/src/authored.d.ts';

  writeFileSync(join(root, declaration), 'export {};');

  assert.deepEqual(findSourceDeclarationLeaks(root), []);
});

test('resolves the repository independently of the working directory', () => {
  assert.equal(
    resolveSourceDeclarationRepoRoot(),
    join(import.meta.dirname, '../..')
  );
});
