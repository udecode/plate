import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildRegistryChangelogEvents,
  buildRegistryChangelogEntryFileEvents,
  buildRegistryChangelogIndexes,
  extractRegistryItemNames,
  inferRegistryHints,
  parseComponentChangelog,
  parseRegistryChangelogEntryFiles,
  resolveReleaseForRow,
  validateArgs,
  writeRegistryChangelogEvents,
} from './generate-ui-changelog-entries.mjs';

test('extracts registry ids from markdown component labels', () => {
  assert.deepEqual(
    extractRegistryItemNames(
      '**`code-block-node`**, **`code-block-node-static`**'
    ),
    ['code-block-node', 'code-block-node-static']
  );
  assert.deepEqual(extractRegistryItemNames('**AIChat**'), []);
  assert.deepEqual(extractRegistryItemNames('api/ai/command/route.ts'), []);
});

test('parses dated source rows and multi-item entries', () => {
  const rows = parseComponentChangelog(`
## June 2026 #32

### June 3 #32.1
<!-- changelog: commit=a471d051d2b32c494a94e8218ce1a8462aa26463 -->
- **\`code-block-node\`**, **\`code-block-node-static\`**: Show the selected language label in read-only and static rendering. Set \`showLanguageLabel={false}\` on the component to hide it.
`);

  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].items, [
    'code-block-node',
    'code-block-node-static',
  ]);
  assert.equal(rows[0].date, '2026-06-03');
  assert.equal(rows[0].line, 6);
  assert.equal(
    rows[0].provenanceCommit,
    'a471d051d2b32c494a94e8218ce1a8462aa26463'
  );
  assert.equal(
    rows[0].sourceId,
    '2026-06-03-32-1-code-block-language-label-e8dfda31'
  );
  assert.equal(rows[0].release.section, 'June 2026 #32');
});

test('keeps source ids stable when rows are inserted above', () => {
  const originalRows = parseComponentChangelog(`
## June 2026 #32

### June 3 #32.1
- **\`code-block-node\`**, **\`code-block-node-static\`**: Show the selected language label in read-only and static rendering. Set \`showLanguageLabel={false}\` on the component to hide it.
- **\`column-node\`**: Attach column drop target ref.
`);
  const insertedRows = parseComponentChangelog(`
## June 2026 #32

### June 3 #32.1
- **\`editor-base-kit\`**: Install editor kit files through the configured components alias.
- **\`code-block-node\`**, **\`code-block-node-static\`**: Show the selected language label in read-only and static rendering. Set \`showLanguageLabel={false}\` on the component to hide it.
- **\`column-node\`**: Attach column drop target ref.
`);
  const originalCodeBlockRow = originalRows.find((row) =>
    row.items.includes('code-block-node')
  );
  const insertedCodeBlockRow = insertedRows.find((row) =>
    row.items.includes('code-block-node')
  );

  assert.equal(originalCodeBlockRow?.row, 1);
  assert.equal(insertedCodeBlockRow?.row, 2);
  assert.equal(originalCodeBlockRow?.sourceId, insertedCodeBlockRow?.sourceId);
});

test('parses stable per-entry MDX changelog sources', () => {
  const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-source-'));
  const entryPath = path.join(sourceDir, '2026-06-15-editor-wrap.mdx');

  fs.writeFileSync(
    entryPath,
    `---
id: 2026-06-15-editor-wrap
date: 2026-06-15
status: draft
kind: fix
summary: "Fix editor space wrapping"
change: {"type":"pull_request","date":"2026-06-15","commits":[],"pullRequest":{"number":5022,"url":"https://github.com/udecode/plate/pull/5022","state":"OPEN","title":"Fix editor preserved-space wrapping"}}
release: {"status":"unresolved"}
diagnostics: []
legacyRelease: {"date":"2026-06-15","entry":"32.4","section":"June 2026 #32"}
---
<!-- entry: {"id":"editor-wrap-row","kind":"fix","migrationNotes":[]} -->
- **\`editor\`**, **\`editor-static\`**: Fix preserved-space wrapping so inserted space runs stay inside editable and static editor widths.
<!-- entry: {"id":"editor-wrap-row-2","kind":"behavior","migrationNotes":["Use the stable entry id."]} -->
- **\`editor\`**: Keep the second row metadata stable.
`
  );

  const [source] = parseRegistryChangelogEntryFiles(sourceDir);

  assert.equal(source.id, '2026-06-15-editor-wrap');
  assert.equal(source.sourcePath.endsWith('2026-06-15-editor-wrap.mdx'), true);
  assert.deepEqual(source.rows[0].items, ['editor', 'editor-static']);
  assert.equal(source.rows[0].sourceId, 'editor-wrap-row');
  assert.equal(source.rows[1].sourceId, 'editor-wrap-row-2');
  assert.equal(source.rows[1].kind, 'behavior');
  assert.deepEqual(source.rows[1].migrationNotes, ['Use the stable entry id.']);

  const [output] = buildRegistryChangelogEntryFileEvents([source], {
    outDir: 'out',
    registryDefinitions: [
      {
        content: "export const ui = [{ name: 'editor' }];",
        path: 'apps/www/src/registry/registry-ui.ts',
      },
    ],
    registryFiles: [
      'apps/www/src/registry/ui/editor.tsx',
      'apps/www/src/registry/ui/editor-static.tsx',
    ],
  });

  assert.equal(output.entry.id, '2026-06-15-editor-wrap');
  assert.deepEqual(output.entry.source, {
    kind: 'entry-mdx',
    path: source.sourcePath,
  });
  assert.equal(output.entry.change.pullRequest.number, 5022);
  assert.equal(output.entry.summary, 'Fix editor space wrapping');
  assert.equal(output.entry.entries[0].id, 'editor-wrap-row');
  assert.equal(output.entry.entries[1].id, 'editor-wrap-row-2');
  assert.equal(output.entry.entries[0].source.line, 13);
  assert.equal(output.entry.entries[0].source.row, 1);
  assert.equal(output.entry.entries[1].source.line, 15);
  assert.equal(output.entry.entries[1].source.row, 2);
});

test('adding an entry file does not rewrite existing event output', () => {
  const sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-source-'));
  const firstEntry = `---
id: 2026-06-10-column-drop-target
date: 2026-06-10
status: draft
kind: fix
summary: "Attach column drop target ref"
change: {"type":"source","date":"2026-06-10","commits":[]}
release: {"status":"unresolved"}
diagnostics: []
---
- **\`column-node\`**: Attach column drop target ref.
`;
  const secondEntry = `---
id: 2026-06-15-editor-wrap
date: 2026-06-15
status: draft
kind: fix
summary: "Fix editor space wrapping"
change: {"type":"source","date":"2026-06-15","commits":[]}
release: {"status":"unresolved"}
diagnostics: []
---
- **\`editor\`**: Fix preserved-space wrapping.
`;

  fs.writeFileSync(path.join(sourceDir, '2026-06-10-column.mdx'), firstEntry);

  const before = buildRegistryChangelogEntryFileEvents(
    parseRegistryChangelogEntryFiles(sourceDir),
    { outDir: 'out' }
  ).find((output) => output.entry.id === '2026-06-10-column-drop-target');

  fs.writeFileSync(path.join(sourceDir, '2026-06-15-editor.mdx'), secondEntry);

  const after = buildRegistryChangelogEntryFileEvents(
    parseRegistryChangelogEntryFiles(sourceDir),
    { outDir: 'out' }
  ).find((output) => output.entry.id === '2026-06-10-column-drop-target');

  assert.deepEqual(after?.entry, before?.entry);
});

test('write prunes stale generated changelog event files', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'registry-changelog-'));
  const stalePath = path.join(outDir, 'stale-event.json');
  const keptPath = path.join(outDir, 'kept-event.json');

  fs.writeFileSync(stalePath, '{}\n');
  writeRegistryChangelogEvents(
    [
      {
        entry: { id: 'kept-event', schemaVersion: 1 },
        targetPath: keptPath,
      },
    ],
    { pruneOutDir: outDir }
  );

  assert.equal(fs.existsSync(stalePath), false);
  assert.equal(fs.existsSync(keptPath), true);
});

test('rejects limited writes before pruning generated artifacts', () => {
  assert.throws(
    () => validateArgs({ limit: 1, write: true }),
    /--write cannot be combined with --limit/
  );
  assert.doesNotThrow(() => validateArgs({ limit: 1, write: false }));
  assert.doesNotThrow(() => validateArgs({ limit: null, write: true }));
});

function commit(oid, date, subject) {
  return {
    oid,
    shortOid: oid.slice(0, 7),
    date,
    committedAt: `${date}T11:20:44Z`,
    subject,
    author: {
      email: 'zbeyens@udecode.dev',
      name: 'zbeyens',
    },
  };
}

function pr(number, title, { mergedAt = null, state = 'MERGED' } = {}) {
  return {
    number,
    title,
    state,
    mergedAt,
    mergeCommit: null,
    url: `https://github.com/udecode/plate/pull/${number}`,
  };
}

function provenance(commitValue, prValue, warnings = []) {
  return {
    commit: commitValue,
    pr: prValue,
    source: prValue ? 'git-blame+github-pr-search' : 'git-blame',
    warnings,
  };
}

test('builds one registry event per change unit with row entries', () => {
  const rows = parseComponentChangelog(`
## June 2026 #32

### June 3 #32.1
- **\`code-block-node\`**, **\`code-block-node-static\`**: Show the selected language label in read-only and static rendering. Set \`showLanguageLabel={false}\` on the component to hide it.
`);
  const commitValue = commit(
    'a471d051d2b32c494a94e8218ce1a8462aa26463',
    '2026-06-03',
    'fix code block language labels'
  );
  const prValue = pr(
    4989,
    'Show code block language labels in read-only mode',
    {
      state: 'OPEN',
    }
  );
  const outputs = buildRegistryChangelogEvents(rows, {
    outDir: 'out',
    provenanceBySourceId: new Map([
      [
        rows[0].sourceId,
        provenance(commitValue, prValue, ['Matched PR 4989, but it is OPEN.']),
      ],
    ]),
    registryDefinitions: [
      {
        content: "export const ui = [{ name: 'code-block-node' }];",
        path: 'apps/www/src/registry/registry-ui.ts',
      },
    ],
    registryFiles: [
      'apps/www/src/registry/ui/code-block-node.tsx',
      'apps/www/src/registry/ui/code-block-node.spec.tsx',
      'apps/www/src/registry/ui/code-block-node-static.tsx',
    ],
    releases: [
      {
        changelogUrl: 'https://github.com/udecode/plate/blob/main/x.md',
        content:
          '- Show code block language labels ([#4989](https://github.com/udecode/plate/pull/4989))',
        date: '2026-06-03',
        packageTag: 'platejs@53.0.7',
        tag: 'v53.0.7',
        url: 'https://github.com/udecode/plate/pull/4986',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4986',
      },
    ],
  });
  const [output] = outputs;

  assert.equal(outputs.length, 1);
  assert.equal(
    output.targetPath,
    path.join(
      'out',
      '2026-06-03-show-code-block-language-labels-read-only-mode.json'
    )
  );
  assert.equal(
    output.entry.id,
    '2026-06-03-show-code-block-language-labels-read-only-mode'
  );
  assert.equal(output.entry.schemaVersion, 1);
  assert.equal('pr' in output.entry, false);
  assert.equal('commit' in output.entry, false);
  assert.equal('provenance' in output.entry, false);
  assert.equal('warnings' in output.entry, false);
  assert.deepEqual(output.entry.source, {
    kind: 'legacy-mdx',
    path: 'tooling/data/plate-ui-changelog.mdx',
  });
  assert.equal(output.entry.change.type, 'pull_request');
  assert.equal(output.entry.change.date, '2026-06-03');
  assert.deepEqual(output.entry.change.pullRequest, {
    number: 4989,
    state: 'OPEN',
    title: 'Show code block language labels in read-only mode',
    url: 'https://github.com/udecode/plate/pull/4989',
  });
  assert.deepEqual(output.entry.change.commits, [
    {
      committedAt: '2026-06-03T11:20:44Z',
      date: '2026-06-03',
      sha: 'a471d051d2b32c494a94e8218ce1a8462aa26463',
      shortSha: 'a471d05',
      subject: 'fix code block language labels',
      url: 'https://github.com/udecode/plate/commit/a471d051d2b32c494a94e8218ce1a8462aa26463',
    },
  ]);
  assert.equal(
    output.entry.change.commits[0].url,
    'https://github.com/udecode/plate/commit/a471d051d2b32c494a94e8218ce1a8462aa26463'
  );
  assert.equal(output.entry.status, 'draft');
  assert.equal(output.entry.kind, 'behavior');
  assert.equal(
    output.entry.summary,
    'Show code block language labels in read-only mode'
  );
  assert.deepEqual(output.entry.release, {
    changelogUrl: 'https://github.com/udecode/plate/blob/main/x.md',
    packageTag: 'platejs@53.0.7',
    requiresPlate: '>=53.0.7',
    source: 'release-index-pr-match',
    status: 'released',
    tag: 'v53.0.7',
    url: 'https://github.com/udecode/plate/pull/4986',
    versionPackagePullRequest: {
      number: 4986,
      url: 'https://github.com/udecode/plate/pull/4986',
    },
  });
  assert.equal(output.entry.entries.length, 1);
  assert.deepEqual(output.entry.entries[0].migrationNotes, [
    'Set `showLanguageLabel={false}` on the component to hide it.',
  ]);
  assert.deepEqual(output.entry.entries[0].targets, [
    'code-block-node',
    'code-block-node-static',
  ]);
  assert.deepEqual(output.entry.targets, [
    {
      definitionFiles: ['apps/www/src/registry/registry-ui.ts'],
      diagnostics: [],
      files: ['apps/www/src/registry/ui/code-block-node.tsx'],
      name: 'code-block-node',
    },
    {
      definitionFiles: [],
      diagnostics: [],
      files: ['apps/www/src/registry/ui/code-block-node-static.tsx'],
      name: 'code-block-node-static',
    },
  ]);
  assert.deepEqual(
    output.entry.diagnostics.map((diagnostic) => diagnostic.code),
    ['pull-request-not-merged']
  );
});

test('preserves code text that looks like a markdown link', () => {
  const rows = parseComponentChangelog(`
## April 2026 #30

### April 8 #30.2
- **\`autoformat-kit\`**: Add link automd so \`[text](url)\` closing on \`)\` resolves to a structured link.
`);
  const outputs = buildRegistryChangelogEvents(rows);

  assert.equal(
    outputs[0].entry.entries[0].summary,
    'Add link automd so `[text](url)` closing on `)` resolves to a structured link.'
  );
});

test('infers exact registry files and definitions only', () => {
  const hints = inferRegistryHints('code-block-node', {
    registryDefinitions: [
      {
        content: "name: 'code-block-node'",
        path: 'apps/www/src/registry/registry-ui.ts',
      },
      {
        content: "name: 'code-block-kit'",
        path: 'apps/www/src/registry/registry-kits.ts',
      },
    ],
    registryFiles: [
      'apps/www/src/registry/ui/code-block-node.tsx',
      'apps/www/src/registry/ui/code-block-node-static.tsx',
      'apps/www/src/registry/ui/code-block-node.test.tsx',
      'apps/www/src/registry/components/editor/plugins/code-block-kit.tsx',
    ],
  });

  assert.deepEqual(hints.files, [
    'apps/www/src/registry/ui/code-block-node.tsx',
  ]);
  assert.deepEqual(hints.definitionFiles, [
    'apps/www/src/registry/registry-ui.ts',
  ]);
});

test('does not guess release dependencies for ambiguous dates', () => {
  const rows = parseComponentChangelog(`
## April 2026 #30

### April 25 #30.1
- **\`media-node\`**: Fix video embeds.
`);
  const result = resolveReleaseForRow(rows[0], [
    { date: '2026-04-25', tag: 'v53.0.1' },
    { date: '2026-04-25', tag: 'v53.0.2' },
  ]);

  assert.equal(result.release, null);
  assert.match(result.warnings[0], /Multiple generated release-index entries/);
});

test('does not guess release dependencies for source-only change units', () => {
  const rows = parseComponentChangelog(`
## June 2026 #32

### June 14 #32.3
- **\`editor-base-kit\`**, **\`editor-kit\`**: Install editor kit files through the configured components alias so relative \`./plugins/*\` imports resolve after shadcn CLI adds.
`);
  const [output] = buildRegistryChangelogEvents(rows, {
    isChangeAfterRelease: () => true,
    releases: [
      {
        content: 'Release list package',
        date: '2026-06-14',
        packageTag: '@platejs/list@53.1.3',
        tag: 'v53.1.3',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/5012',
      },
    ],
  });

  assert.equal(output.entry.change.type, 'source');
  assert.deepEqual(output.entry.release, { status: 'unresolved' });
  assert.deepEqual(
    output.entry.diagnostics.map((diagnostic) => diagnostic.code),
    ['release-missing', 'provenance-missing']
  );
});

test('current entry files generate registry changelog indexes', () => {
  const sources = parseRegistryChangelogEntryFiles(
    'apps/www/src/registry/changelog/entries'
  );
  const outputs = buildRegistryChangelogEntryFileEvents(sources, {
    outDir: 'apps/www/src/registry/changelog',
    registryDefinitions: [
      {
        content:
          "export const ui = [{ name: 'editor' }, { name: 'column-node' }, { name: 'editor-base-kit' }];",
        path: 'apps/www/src/registry/registry-ui.ts',
      },
    ],
    registryFiles: [
      'apps/www/src/registry/ui/editor.tsx',
      'apps/www/src/registry/ui/column-node.tsx',
      'apps/www/src/registry/components/editor/plugins/editor-base-kit.tsx',
    ],
  });
  const { components, index } = buildRegistryChangelogIndexes(outputs);

  assert.equal(sources.length, 20);
  assert.equal(outputs.length, 20);
  assert.deepEqual(
    index.events.slice(0, 3).map((event) => event.id),
    [
      '2026-06-14-fix-shadcn-editor-kit-install-paths',
      '2026-06-13-show-code-block-language-labels-read-only-mode',
      '2026-06-10-attach-column-drop-target-ref',
    ]
  );
  assert.equal(
    index.events[0].href,
    '/registry/changelog/2026-06-14-fix-shadcn-editor-kit-install-paths.json'
  );
  assert.deepEqual(components.components['column-node'], [
    '2026-06-10-attach-column-drop-target-ref',
    '2026-01-20-add-docx-file-import-word-export-support',
    '2025-11-20-biome-ultracite',
    '2025-10-17-fix-react-decouple',
  ]);
  assert.deepEqual(components.components['editor-base-kit'], [
    '2026-06-14-fix-shadcn-editor-kit-install-paths',
    '2026-04-23-redesign-blockquotes-container-blocks',
  ]);
});
