import assert from 'node:assert/strict';
import { test } from 'node:test';

import { homeFindings } from './homes.mjs';

function tree(files) {
  return {
    repo: process.cwd(),
    ref: 'fixture',
    list: () => Object.keys(files),
    has: (path) => path in files,
    read: (path) => files[path],
  };
}

const failing = (files, options) =>
  homeFindings(tree(files), options)
    .filter((finding) => !finding.listed)
    .map((finding) => [finding.form, finding.file]);

const run = 'docs/plite/research/2026-01-01-cursor';

test('a research run with no homes row has no home', () => {
  assert.deepEqual(
    failing({
      [`${run}/README.md`]: '# Cursor\n',
      [`${run}/shards/lexical.md`]: 'Lexical keeps the caret.\n',
    }),
    [['no-home', run]]
  );
});

test('a run another workflow added after the inventory is listed, not failed', () => {
  assert.deepEqual(
    failing(
      { [`${run}/README.md`]: '# Cursor\n' },
      { manifest: new Set(['docs/research/log.md']) }
    ),
    []
  );
});

test('a source folder with no README fails', () => {
  assert.deepEqual(
    failing({ 'docs/research/sources/plite/selection.md': '# Selection\n' }),
    [['no-readme', 'docs/research/sources/plite']]
  );
});

test('a README that does not link a page in its folder fails', () => {
  assert.deepEqual(
    failing({
      'docs/research/sources/plite/README.md': '# Plite\n',
      'docs/research/sources/plite/selection.md': '# Selection\n',
    }),
    [['unlinked', 'docs/research/sources/plite/selection.md']]
  );
});

test("an editor README that does not link its editor's ledger fails", () => {
  assert.deepEqual(
    failing({
      'docs/research/sources/lexical/README.md': '# Lexical\n',
      'docs/editor-issue-harvester/lexical/full/issue-closure-ledger.md':
        '| issue |\n',
    }),
    [['no-ledger-link', 'docs/research/sources/lexical/README.md']]
  );
});

test('a page homes.tsv homes to an editor fails until that README links it', () => {
  assert.deepEqual(
    failing({
      'docs/research/sources/editor-architecture/README.md':
        '- [Lexical marks](lexical-marks.md)\n',
      'docs/research/sources/editor-architecture/lexical-marks.md': '# Marks\n',
      'docs/research/sources/lexical/README.md': '# Lexical\n',
      'docs/research/homes.tsv':
        'path\thomes\treason\ndocs/research/sources/editor-architecture/lexical-marks.md\tlexical\tabout Lexical marks\n',
    }),
    [['unlinked', 'docs/research/sources/editor-architecture/lexical-marks.md']]
  );
});

test('a homes row for a path that no longer exists fails', () => {
  assert.deepEqual(
    failing({
      'docs/research/homes.tsv': `path\thomes\treason\n${run}\tplite\tPlite caret\n`,
    }),
    [['stale-row', run]]
  );
});

test('a run with its row and its README link passes', () => {
  assert.deepEqual(
    failing({
      'docs/research/homes.tsv': `path\thomes\treason\n${run}\tplite\tPlite caret\n`,
      [`${run}/README.md`]: '# Cursor\n',
      'docs/research/sources/plite/README.md': `- [Cursor run](../../../plite/research/2026-01-01-cursor/README.md)\n`,
    }),
    []
  );
});

test('a README link written as a root path counts', () => {
  assert.deepEqual(
    failing({
      'docs/research/sources/plite/README.md':
        '- [Selection](docs/research/sources/plite/selection.md)\n',
      'docs/research/sources/plite/selection.md': '# Selection\n',
    }),
    []
  );
});

test('an editor with only a ledger needs a README', () => {
  assert.deepEqual(
    failing({
      'docs/editor-issue-harvester/prosekit/full/issue-closure-ledger.md':
        '| issue |\n',
    }),
    [['no-readme', 'docs/research/sources/prosekit']]
  );
});
