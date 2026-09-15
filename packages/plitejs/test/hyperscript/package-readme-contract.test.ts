import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as HyperscriptAPI from '../../src/hyperscript/index';

const packageReadmePath = fileURLToPath(
  new URL('../../../../content/docs/(guides)/unit-testing.mdx', import.meta.url)
);
const expectedHyperscriptRuntimeRootExports = [
  'createEditor',
  'createEditorFixture',
  'createHyperscript',
  'createText',
  'jsx',
];

describe('hyperscript documentation contract', () => {
  it('keeps public root runtime values exact', () => {
    assert.deepEqual(
      Object.keys(HyperscriptAPI).sort(),
      expectedHyperscriptRuntimeRootExports
    );
  });

  it('documents the custom fixture factory through Plate entrypoints', () => {
    const docs = readFileSync(packageReadmePath, 'utf-8');

    assert.match(
      docs,
      /import \{ createHyperscript \} from ['"]platejs\/hyperscript['"]/
    );
    assert.match(docs, /const h = createHyperscript\(\{/);
    assert.match(docs, /from ['"]@platejs\/test['"]/);

    for (const tag of [
      'fragment',
      'element',
      'text',
      'cursor',
      'anchor',
      'focus',
      'selection',
    ]) {
      assert.ok(docs.includes(`\`${tag}\``), `${tag} should be named in docs`);
    }
  });
});
