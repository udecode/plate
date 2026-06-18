import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as SlateHyperscript from '../src/index';

const packageReadmePath = fileURLToPath(
  new URL('../Readme.md', import.meta.url)
);
const expectedSlateHyperscriptRuntimeRootExports = [
  'createEditor',
  'createHyperscript',
  'createText',
  'jsx',
];

describe('slate-hyperscript package README contract', () => {
  it('keeps public root runtime values exact', () => {
    assert.deepEqual(
      Object.keys(SlateHyperscript).sort(),
      expectedSlateHyperscriptRuntimeRootExports
    );
  });

  it('names the root fixture factory exports in package docs', () => {
    const docs = readFileSync(packageReadmePath, 'utf8');

    for (const name of [
      'jsx',
      'createHyperscript',
      'createEditor',
      'createText',
      'HyperscriptCreators',
      'HyperscriptShorthands',
    ]) {
      assert.ok(docs.includes(name), `${name} should be named in docs`);
    }
  });
});
