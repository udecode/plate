import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  blobOf,
  foldFindings,
  foldSource,
  foldText,
  homeFindings,
  pins,
  quote,
  resolve,
  write,
} from './compile.mjs';

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

const note = 'docs/solutions/logic-errors/selection.md';
const folded = foldText('# Selection\nKeep the native caret.\n', [
  'plate-notes',
]);
const foldedRows = (rows) => `path\tblob\n${rows.join('\n')}\n`;
const foldForms = (files, baseRows) =>
  foldFindings(tree(files), { base: baseRows }).map((finding) => [
    finding.form,
    finding.file,
  ]);
const row = `${note}\t${blobOf(folded)}`;

test('an unchanged folded file passes', () => {
  assert.deepEqual(
    foldForms(
      { [note]: folded, 'docs/research/folded.tsv': foldedRows([row]) },
      foldedRows([row])
    ),
    []
  );
});

test('a line appended to a folded file fails', () => {
  assert.deepEqual(
    foldForms(
      {
        [note]: `${folded}A new lesson.\n`,
        'docs/research/folded.tsv': foldedRows([row]),
      },
      foldedRows([row])
    ),
    [['changed', note]]
  );
});

test('a new file in a nested folder under a folded directory fails', () => {
  const rows = foldedRows(['docs/solutions/\t-', row]);
  assert.deepEqual(
    foldForms(
      {
        [note]: folded,
        'docs/solutions/new/topic/lesson.md': '# Lesson\n',
        'docs/research/folded.tsv': rows,
      },
      rows
    ),
    [['new-file', 'docs/solutions/new/topic/lesson.md']]
  );
});

test('a folded file edited together with its row fails', () => {
  const edited = `${folded}A new lesson.\n`;
  assert.deepEqual(
    foldForms(
      {
        [note]: edited,
        'docs/research/folded.tsv': foldedRows([`${note}\t${blobOf(edited)}`]),
      },
      foldedRows([row])
    ),
    [['row-changed', note]]
  );
});

test('a row removed while its file remains fails', () => {
  assert.deepEqual(
    foldForms(
      { [note]: folded, 'docs/research/folded.tsv': foldedRows([]) },
      foldedRows([row])
    ),
    [['row-removed', note]]
  );
});

test('folding puts the pointer line after the frontmatter', () => {
  assert.equal(
    foldText('---\ntitle: Selection\n---\n# Selection\n', [
      'plate-notes',
    ]).split('\n')[3],
    '> Folded into plate-notes. Edit the home, not this file.'
  );
});

const original = '# Selection\nKeep the native caret.\n';

test('folding refuses a file that changed after the compile read it', () => {
  assert.throws(
    () =>
      foldSource(note, `${original}A late edit.\n`, blobOf(original), [
        'plate-notes',
      ]),
    /changed after the compile read it/
  );
});

test('folding a file that is already folded keeps it', () => {
  assert.equal(
    foldSource(note, folded, blobOf(original), ['plate-notes']),
    folded
  );
});

const page = 'docs/research/sources/lexical/marks.md';
const marks =
  '# Marks\n\n## Store\n\nLexical keeps marks in a separate store, not in the text node.\n\n## Decorators\n\nDecorators render outside the text tree.\n';
const kept = [{ key: 'u1', span: 'Lexical keeps marks in a separate store' }];

test('kb write refuses a one-word change inside a kept span', () => {
  assert.throws(
    () =>
      write(
        page,
        marks,
        { op: 'replace', old: 'separate store', new: 'shared store' },
        { kept }
      ),
    /removes the kept span of u1/
  );
});

test('kb write refuses a rewrite of a line a kept span crosses', () => {
  assert.throws(
    () =>
      write(
        page,
        marks,
        {
          op: 'replace',
          old: 'not in the text node.',
          new: 'outside the text node.',
        },
        {
          kept: [{ key: 'u2', span: 'separate store, not in the text node' }],
        }
      ),
    /removes the kept span of u2/
  );
});

test('kb write refuses a removal with no verdict', () => {
  assert.throws(
    () =>
      write(
        page,
        marks,
        {
          op: 'remove',
          span: 'Lexical keeps marks in a separate store',
          unit: 'u1',
        },
        { kept }
      ),
    /needs an obsolescence, withdrawal or move verdict/
  );
});

test('kb write removes a kept span under its obsolescence verdict', () => {
  assert.equal(
    write(
      page,
      marks,
      {
        op: 'remove',
        span: 'Lexical keeps marks in a separate store, not in the text node.',
        unit: 'u1',
        verdict: 'obsolete',
      },
      { kept }
    ).includes('separate store'),
    false
  );
});

test('kb write replaces a string that touches no kept span', () => {
  assert.match(
    write(
      page,
      marks,
      {
        op: 'replace',
        old: 'Decorators render',
        new: 'Decorator nodes render',
      },
      { kept }
    ),
    /Decorator nodes render outside/
  );
});

test('kb write creates a new page', () => {
  assert.equal(
    write(
      'docs/research/sources/lexical/history.md',
      undefined,
      { op: 'create', text: '# History\n' },
      {}
    ),
    '# History\n'
  );
});

test('kb write appends under the named subsection', () => {
  const law =
    '## Table\n\n### Cell Navigation\n\n- `EDIT-TABLE-TAB-001` `locked`: moves to the next cell\n\n### Rectangular Paste\n\n- `EDIT-TABLE-PASTE-001` `locked`: pastes a grid\n';
  const next = write(
    'docs/editor-behavior/markdown-editing-spec.md',
    law,
    {
      op: 'append',
      section: '### Cell Navigation',
      text: '- `EDIT-TABLE-TAB-002` `proposed`: Tab in the last cell adds a row\n',
    },
    {}
  );
  assert.ok(
    next.indexOf('EDIT-TABLE-TAB-002') < next.indexOf('### Rectangular Paste')
  );
});

test('kb write appends after fenced examples and leaves them unchanged', () => {
  const law =
    '## Heading\n\n- `EDIT-H-ENTER-001` `locked`: splits the heading\n\n```text\n# abc|def\n```\n\nnote: the caret moves.\n\n## Lists\n';
  const next = write(
    'docs/editor-behavior/markdown-editing-spec.md',
    law,
    {
      op: 'append',
      section: '## Heading',
      text: '- `EDIT-H-BS-001` `proposed`: Backspace at start lifts the heading\n',
    },
    {}
  );
  assert.ok(
    next.includes('```text\n# abc|def\n```\n\nnote: the caret moves.\n') &&
      next.indexOf('EDIT-H-BS-001') < next.indexOf('## Lists')
  );
});

test('kb write refuses a law rule whose ID the law already has', () => {
  const law =
    '## Table\n\n- `EDIT-TABLE-TAB-001` `locked`: moves to the next cell\n';
  assert.throws(
    () =>
      write(
        'docs/editor-behavior/markdown-editing-spec.md',
        law,
        {
          op: 'append',
          section: '## Table',
          text: '- `EDIT-TABLE-TAB-001` `proposed`: again\n',
        },
        {}
      ),
    /already defines EDIT-TABLE-TAB-001/
  );
});

const lexicalNote = {
  path: 'docs/research/lexical-marks.md',
  text: '# Marks\n\nLexical keeps marks apart.\n\nDecorators render outside.\n',
  homes: ['lexical'],
};
lexicalNote.blob = blobOf(lexicalNote.text);
const matrix = {
  path: 'docs/editor-behavior/table-matrix.md',
  text: '| case | result |\n| --- | --- |\n| tab | next cell |\n',
  homes: ['plite'],
};
matrix.blob = blobOf(matrix.text);
const unit = (key, source, lines, extra = {}) => ({
  key,
  source,
  lines,
  disposition: 'dropped',
  reason: 'heading',
  ...extra,
});
const accept = (...keys) => keys.map((key) => ({ key, verdict: 'accepted' }));
const noteUnits = [
  unit('n1', lexicalNote.path, [1, 1]),
  unit('n2', lexicalNote.path, [3, 3], {
    disposition: 'added',
    target: 'docs/research/sources/lexical/marks.md',
    text: 'Lexical keeps marks apart.',
  }),
  unit('n3', lexicalNote.path, [5, 5], {
    disposition: 'covered',
    target: 'docs/research/sources/lexical/marks.md',
    span: 'Decorators render outside',
  }),
];
const batch = (extra = {}) => ({
  batch: 'b1',
  sources: [lexicalNote],
  units: noteUnits,
  verdicts: accept('n1', 'n2', 'n3'),
  seed: 's',
  ...extra,
});

test('resolve records each source with the blob it read', () => {
  assert.deepEqual(resolve(batch()).sources, [
    {
      path: lexicalNote.path,
      blob: blobOf(lexicalNote.text),
      homes: ['lexical'],
    },
  ]);
});

test('resolve fails when a listed source has no unit', () => {
  assert.throws(
    () => resolve(batch({ sources: [lexicalNote, matrix] })),
    /table-matrix\.md has no unit/
  );
});

test('resolve fails on a non-blank line no unit covers', () => {
  assert.throws(
    () =>
      resolve(
        batch({ units: noteUnits.slice(0, 2), verdicts: accept('n1', 'n2') })
      ),
    /line 5 of docs\/research\/lexical-marks\.md belongs to no unit/
  );
});

test('resolve fails on a unit with no accepted verdict', () => {
  assert.throws(
    () =>
      resolve(
        batch({
          verdicts: [...accept('n1', 'n2'), { key: 'n3', verdict: 'rejected' }],
        })
      ),
    /n3 has no accepted verdict/
  );
});

const lawUnit = (key, line, id) =>
  unit(key, matrix.path, [line, line], {
    disposition: 'added',
    kind: 'law',
    id,
    target: 'docs/editor-behavior/markdown-editing-spec.md',
    text: `- \`${id}\` \`proposed\`: rule`,
  });

test('resolve fails when two law units share one new ID', () => {
  const units = [
    lawUnit('m1', 1, 'EDIT-TABLE-TAB-002'),
    unit('m2', matrix.path, [2, 2]),
    lawUnit('m3', 3, 'EDIT-TABLE-TAB-002'),
  ];
  assert.throws(
    () =>
      resolve({
        batch: 'b2',
        sources: [matrix],
        units,
        verdicts: accept('m1', 'm2', 'm3'),
        seed: 's',
      }),
    /EDIT-TABLE-TAB-002 is the ID of m1 and m3/
  );
});

test('resolve fails on a wildcard law ID', () => {
  const units = [
    lawUnit('m1', 1, 'EDIT-TABLE-*'),
    unit('m2', matrix.path, [2, 3]),
  ];
  assert.throws(
    () =>
      resolve({
        batch: 'b2',
        sources: [matrix],
        units,
        verdicts: accept('m1', 'm2'),
        seed: 's',
      }),
    /m1's ID EDIT-TABLE-\* is not one rule/
  );
});

test('resolve accepts units that cite the spec as covered without an ID', () => {
  const covered = (key, line) =>
    unit(key, matrix.path, [line, line], {
      disposition: 'covered',
      target: 'docs/editor-behavior/markdown-editing-spec.md',
      span: 'rule',
    });
  const result = resolve({
    batch: 'b2',
    sources: [matrix],
    units: [covered('m1', 1), covered('m2', 2), unit('m3', matrix.path, [3, 3])],
    verdicts: accept('m1', 'm2', 'm3'),
    seed: 's',
  });
  assert.equal(result.units.length, 3);
});

const linkBatch = (path, has = () => false) =>
  resolve({
    batch: 'b3',
    sources: [
      { path, text: 'state\n', blob: blobOf('state\n'), homes: ['wordgard'] },
    ],
    units: [unit('l1', path, [1, 1], { disposition: 'link' })],
    verdicts: accept('l1'),
    seed: 's',
    has,
  });

test("resolve refuses a link-only unit in a harvest's report", () => {
  assert.throws(
    () => linkBatch('docs/editor-test-harvester/wordgard/report.md'),
    /l1 is link-only, but report\.md is not on the link-only list/
  );
});

test('resolve refuses a link-only unit in the open issues ledger', () => {
  assert.throws(
    () => linkBatch('docs/plite-issues/open-issues-ledger.md'),
    /not on the link-only list/
  );
});

test('resolve accepts a link-only unit in a live decision input', () => {
  assert.equal(
    linkBatch('docs/editor-issue-harvester/wordgard/full/issue-decisions.mjs')
      .units[0].verdict,
    'accepted'
  );
});

test('resolve accepts a link-only unit in a ledger its generator writes', () => {
  const ledger =
    'docs/editor-issue-harvester/lexical/full/issue-closure-ledger.md';
  assert.equal(
    linkBatch(
      ledger,
      (path) =>
        path ===
        'docs/editor-issue-harvester/lexical/full/build-closure-ledger.mjs'
    ).units[0].verdict,
    'accepted'
  );
});

test('resolve refuses a link-only unit in a hand-written ledger table', () => {
  assert.throws(
    () =>
      linkBatch(
        'docs/editor-issue-harvester/slate/full/issue-closure-ledger.md'
      ),
    /not on the link-only list/
  );
});

test('the recall sample draws only dropped units', () => {
  const kinds = new Map(noteUnits.map((item) => [item.key, item.disposition]));
  assert.deepEqual(
    resolve(batch()).sample.map((key) => kinds.get(key)),
    ['dropped']
  );
});

const kept1 = {
  key: 'n2',
  disposition: 'added',
  verdict: 'accepted',
  target: 'docs/research/sources/lexical/marks.md',
  span: 'Lexical keeps marks apart.',
};
const lostFiles = {
  'docs/research/sources/lexical/marks.md':
    '# Marks\n\nLexical stores marks elsewhere.\n',
};
const lostOf = (resolutions) =>
  quote({
    resolved: [{ batch: 'b1', units: [kept1] }],
    read: (path) => lostFiles[path],
    resolutions,
  }).lost.map((item) => item.key);

test('the quote check fails on a kept unit whose span left its home', () => {
  assert.deepEqual(lostOf([]), ['n2']);
});

test('the quote check passes once the unit resolves at a span that stands', () => {
  assert.deepEqual(
    lostOf([
      {
        unit: 'b1#n2',
        verdict: 'covered',
        target: 'docs/research/sources/lexical/marks.md',
        span: 'Lexical stores marks elsewhere.',
      },
    ]),
    []
  );
});

test('the quote check refuses a claimed move whose span stands nowhere', () => {
  assert.deepEqual(
    lostOf([
      {
        unit: 'b1#n2',
        verdict: 'covered',
        target: 'docs/research/sources/lexical/marks.md',
        span: 'Lexical keeps marks apart in a store.',
      },
    ]),
    ['n2']
  );
});

test('kb pins reads the three pinned citation forms', () => {
  assert.deepEqual(
    pins(
      'See facebook/lexical@1a2b3c4d:packages/lexical/src/LexicalNode.ts, prosemirror-view@5e6f7a8b:src/input.ts and 9c0d1e2f3a4b:docs/old/matrix.md.'
    ),
    [
      {
        repo: 'facebook/lexical',
        commit: '1a2b3c4d',
        path: 'packages/lexical/src/LexicalNode.ts',
      },
      { repo: 'prosemirror-view', commit: '5e6f7a8b', path: 'src/input.ts' },
      { repo: '.', commit: '9c0d1e2f3a4b', path: 'docs/old/matrix.md' },
    ]
  );
});

test('a directory row removed while files under it remain fails', () => {
  const rows = foldedRows(['docs/solutions/\t-', row]);
  assert.deepEqual(
    foldForms(
      { [note]: folded, 'docs/research/folded.tsv': foldedRows([row]) },
      rows
    ),
    [['row-removed', 'docs/solutions/']]
  );
});

test('folding refuses a non-Markdown source that changed after the compile read it', () => {
  const script = 'docs/editor-issue-harvester/wordgard/full/refresh-report.mjs';
  assert.throws(
    () =>
      foldSource(
        script,
        'export const a = 2;\n',
        blobOf('export const a = 1;\n'),
        ['wordgard']
      ),
    /changed after the compile read it/
  );
});

test('the quote check does not take another key in Open work for the unit', () => {
  const owned = { key: 'u1', disposition: 'added', verdict: 'owner' };
  assert.deepEqual(
    quote({
      resolved: [{ batch: 'b1', units: [owned] }],
      read: () => undefined,
      openWork: '- b1#u12 waits on the owner.',
    }).lost.map((item) => item.key),
    ['u1']
  );
});

test('resolve refuses a source that changed after its readers read it', () => {
  const edited = {
    ...lexicalNote,
    text: lexicalNote.text.replace('apart', 'apart and indexed'),
  };
  assert.throws(
    () => resolve(batch({ sources: [edited] })),
    /lexical-marks\.md changed after its readers read it/
  );
});

test('resolve refuses two units with one key', () => {
  const units = [noteUnits[0], noteUnits[1], { ...noteUnits[2], key: 'n2' }];
  assert.throws(
    () => resolve(batch({ units, verdicts: accept('n1', 'n2') })),
    /n2 names more than one unit/
  );
});

test('resolve refuses a disposition it does not know', () => {
  const units = [
    noteUnits[0],
    noteUnits[1],
    { ...noteUnits[2], disposition: 'addded' },
  ];
  assert.throws(() => resolve(batch({ units })), /n3 has no known disposition/);
});

test('resolve refuses a record disposition on a text source', () => {
  const units = [
    noteUnits[0],
    noteUnits[1],
    { ...noteUnits[2], disposition: 'record' },
  ];
  assert.throws(
    () => resolve(batch({ units })),
    /n3 is a record, but lexical-marks\.md is text/
  );
});

test('resolve holds a unit that targets the law to one rule ID', () => {
  const units = [
    unit('m1', matrix.path, [1, 1], {
      disposition: 'added',
      id: 'EDIT-TABLE-*',
      target: 'docs/editor-behavior/markdown-editing-spec.md',
      text: '- rule',
    }),
    unit('m2', matrix.path, [2, 3]),
  ];
  assert.throws(
    () =>
      resolve({
        batch: 'b2',
        sources: [matrix],
        units,
        verdicts: accept('m1', 'm2'),
        seed: 's',
      }),
    /m1's ID EDIT-TABLE-\* is not one rule/
  );
});

test('a resolution settles only the unit of its own batch', () => {
  const gone = { ...kept1, key: 'r2' };
  assert.deepEqual(
    quote({
      resolved: [
        { batch: 'b1', units: [gone] },
        { batch: 'b2', units: [gone] },
      ],
      read: () => '',
      resolutions: [
        { unit: 'b1#r2', verdict: 'obsolete', reason: 'the code changed' },
      ],
    }).lost.map((item) => `${item.batch}#${item.key}`),
    ['b2#r2']
  );
});

test('the quote check counts a unit of unknown disposition as lost', () => {
  assert.deepEqual(
    quote({
      resolved: [{ batch: 'b1', units: [{ ...kept1, disposition: 'gap' }] }],
      read: () => '',
    }).lost.map((item) => item.key),
    ['n2']
  );
});

test('a new file added with its own row under a directory folded at base fails', () => {
  const base = foldedRows(['docs/solutions/\t-', row]);
  const sibling = 'docs/solutions/logic-errors/focus.md';
  assert.deepEqual(
    foldForms(
      {
        [note]: folded,
        [sibling]: '# Focus\n',
        'docs/research/folded.tsv': foldedRows([
          'docs/solutions/\t-',
          row,
          `${sibling}\t${blobOf('# Focus\n')}`,
        ]),
      },
      base
    ),
    [['new-file', sibling]]
  );
});

const png = 'docs/solutions/logic-errors/shot.png';
const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x01]);

test('an unchanged folded binary file passes', () => {
  const files = {
    [png]: pngBytes,
    'docs/research/folded.tsv': foldedRows([`${png}\t${blobOf(pngBytes)}`]),
  };
  const bytesTree = {
    ...tree(files),
    read: (path) => String(files[path]),
    bytes: (path) => Buffer.from(files[path]),
  };
  assert.deepEqual(
    foldFindings(bytesTree, {
      base: foldedRows([`${png}\t${blobOf(pngBytes)}`]),
    }),
    []
  );
});

test('kb write refuses a move that removes its own destination', () => {
  assert.throws(
    () =>
      write(
        page,
        marks,
        {
          op: 'remove',
          span: 'Lexical keeps marks in a separate store',
          unit: 'u1',
          verdict: 'move',
          to: { home: page, span: 'Lexical keeps marks in a separate store' },
        },
        { kept, stands: () => true }
      ),
    /new span stands in no home/
  );
});

test('kb write rewrites a kept span under its move verdict when the new span lands', () => {
  assert.match(
    write(
      page,
      marks,
      {
        op: 'replace',
        old: 'Lexical keeps marks in a separate store',
        new: 'Lexical keeps marks in a mark store',
        unit: 'u1',
        verdict: 'move',
        to: { home: page, span: 'Lexical keeps marks in a mark store' },
      },
      { kept }
    ),
    /a mark store/
  );
});

test('kb write refuses an append to a section that has subsections', () => {
  const law =
    '## Table\n\n### Cell Navigation\n\n- `EDIT-TABLE-TAB-001` `locked`: moves\n';
  assert.throws(
    () =>
      write(
        'docs/editor-behavior/markdown-editing-spec.md',
        law,
        {
          op: 'append',
          section: '## Table',
          text: '- `EDIT-TABLE-TAB-002` `proposed`: adds a row\n',
        },
        {}
      ),
    /## Table has subsections; name the one/
  );
});

test('kb write replaces a rule line that keeps its own ID', () => {
  const law =
    '## Table\n\n- `EDIT-TABLE-TAB-001` `locked`: moves to the next cell\n';
  assert.match(
    write(
      'docs/editor-behavior/markdown-editing-spec.md',
      law,
      {
        op: 'replace',
        old: '- `EDIT-TABLE-TAB-001` `locked`: moves to the next cell',
        new: '- `EDIT-TABLE-TAB-001` `locked`: moves to the next cell, wrapping rows',
      },
      {}
    ),
    /wrapping rows/
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

test('a link-only unit is lost until its home links the source', () => {
  const linked = {
    key: 'l1',
    disposition: 'link',
    verdict: 'accepted',
    source: 'docs/maintainer/queue.md',
    target: 'docs/research/sources/plite/README.md',
  };
  const lostWith = (readme) =>
    quote({
      resolved: [{ batch: 'b1', units: [linked] }],
      read: () => readme,
    }).lost.map((item) => item.key);
  assert.deepEqual(
    [
      lostWith('# Plite\n'),
      lostWith('- [Queue](../../../maintainer/queue.md)\n'),
    ],
    [['l1'], []]
  );
});

test('resolve refuses a key that is not a plain name', () => {
  const units = [noteUnits[0], noteUnits[1], { ...noteUnits[2], key: 'n..3' }];
  assert.throws(
    () => resolve(batch({ units, verdicts: accept('n1', 'n2', 'n..3') })),
    /n\.\.3 is not a plain key/
  );
});

test('a new parent row cannot hide a new file under a child folded at base', () => {
  const child = 'docs/solutions/logic-errors/';
  const base = foldedRows([`${child}\t-`, row]);
  const sibling = 'docs/solutions/logic-errors/focus.md';
  assert.deepEqual(
    foldForms(
      {
        [note]: folded,
        [sibling]: '# Focus\n',
        'docs/research/folded.tsv': foldedRows([
          'docs/solutions/\t-',
          `${child}\t-`,
          row,
          `${sibling}\t${blobOf('# Focus\n')}`,
        ]),
      },
      base
    ),
    [['new-file', sibling]]
  );
});
