import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';

import { findPackageKitExports } from './check-package-kit-exports.mjs';

const temporaryRoots = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

const createPackage = (files) => {
  const root = mkdtempSync(join(tmpdir(), 'package-kit-exports-'));

  temporaryRoots.push(root);
  for (const [path, source] of Object.entries(files)) {
    const file = join(root, 'packages/example/src', path);

    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, source);
  }

  return root;
};

test('rejects a package that exports a plugin-array kit by declaration or alias', () => {
  const root = createPackage({
    'basic.ts': 'export const BasicKit = [ParagraphPlugin] as const;',
    'index.ts': "export { ListPlugins as ListKit } from './list';",
  });

  assert.deepEqual(findPackageKitExports(root), [
    'packages/example/src/basic.ts: BasicKit',
    'packages/example/src/index.ts: ListKit',
  ]);
});

test('accepts kit types, test fixtures and generated app source in strings', () => {
  const root = createPackage({
    'cli.ts':
      'export const template = `export const EditorKit = [ParagraphPlugin];`;',
    'editor.spec.ts': 'export const EditorKit = [ParagraphPlugin];',
    'types.ts': 'export type EditorKit = readonly unknown[];',
  });

  assert.deepEqual(findPackageKitExports(root), []);
});
