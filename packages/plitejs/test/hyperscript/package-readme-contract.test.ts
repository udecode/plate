import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as PliteHyperscript from '../../src/hyperscript/index';

const packageReadmePath = fileURLToPath(
  new URL(
    '../../../../content/docs/plite/libraries/plite-hyperscript.mdx',
    import.meta.url
  )
);
const expectedPliteHyperscriptRuntimeRootExports = [
  'createEditor',
  'createEditorFixture',
  'createHyperscript',
  'createText',
  'jsx',
];

describe('plite-hyperscript package README contract', () => {
  it('keeps public root runtime values exact', () => {
    assert.deepEqual(
      Object.keys(PliteHyperscript).sort(),
      expectedPliteHyperscriptRuntimeRootExports
    );
  });

  it('names the root fixture factory exports in package docs', () => {
    const docs = readFileSync(packageReadmePath, 'utf-8');

    for (const name of [
      'jsx',
      'createHyperscript',
      'createEditor',
      'createEditorFixture',
      'createText',
      'HyperscriptCreators',
      'HyperscriptShorthands',
    ]) {
      assert.ok(docs.includes(name), `${name} should be named in docs`);
    }
  });
});
