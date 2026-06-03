import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  buildRegistryChangelogEvents,
  buildRegistryChangelogIndexes,
  extractRegistryItemNames,
  inferRegistryHints,
  parseComponentChangelog,
  resolveReleaseForRow,
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
  assert.equal(rows[0].sourceId, '2026-06-03-32-1-001');
  assert.equal(rows[0].release.section, 'June 2026 #32');
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
        '2026-06-03-32-1-001',
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

test('current latest 10 source rows collapse to 3 change-unit events', () => {
  const content = fs.readFileSync(
    'tooling/data/plate-ui-changelog.mdx',
    'utf8'
  );
  const rows = parseComponentChangelog(content).slice(0, 10);
  const codeCommit = commit(
    'a471d051d2b32c494a94e8218ce1a8462aa26463',
    '2026-06-03',
    'fix code block language labels'
  );
  const perfCommit = commit(
    '68560ccc9e1d525f29e8a49b0c673723837639d8',
    '2026-06-02',
    'perf: improve large document editing'
  );
  const footnoteCommit = commit(
    '700286bf84ac987b9cc2296f9f69746f0f095936',
    '2026-04-23',
    'docs'
  );
  const provenanceBySourceId = new Map(
    rows.map((row) => {
      if (row.sourceId === '2026-06-03-32-1-001') {
        return [
          row.sourceId,
          provenance(
            codeCommit,
            pr(4989, 'Show code block language labels in read-only mode', {
              state: 'OPEN',
            }),
            ['Matched PR 4989, but it is OPEN.']
          ),
        ];
      }

      if (row.sourceId?.startsWith('2026-05-31')) {
        return [
          row.sourceId,
          provenance(
            perfCommit,
            pr(4987, 'perf: improve large document editing', {
              mergedAt: '2026-06-02T19:26:44Z',
            })
          ),
        ];
      }

      return [
        row.sourceId,
        provenance(
          footnoteCommit,
          pr(4941, 'fix: redesign blockquotes as container blocks', {
            mergedAt: '2026-04-23T11:41:41Z',
          })
        ),
      ];
    })
  );
  const releases = [
    {
      content:
        'Improve large document editing ([#4987](https://github.com/udecode/plate/pull/4987))',
      date: '2026-06-03',
      packageTag: 'platejs@53.0.7',
      tag: 'v53.0.7',
      versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4986',
    },
    {
      content:
        'Add footnotes ([#4941](https://github.com/udecode/plate/pull/4941))',
      date: '2026-04-23',
      packageTag: 'platejs@53.0.0',
      tag: 'v53.0.0',
      versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4948',
    },
  ];
  const outputs = buildRegistryChangelogEvents(rows, {
    provenanceBySourceId,
    releases,
  });

  assert.equal(rows.length, 10);
  assert.equal(outputs.length, 3);
  assert.deepEqual(
    outputs.map((output) => path.basename(output.targetPath)),
    [
      '2026-06-03-show-code-block-language-labels-read-only-mode.json',
      '2026-06-02-improve-large-document-editing.json',
      '2026-04-23-redesign-blockquotes-container-blocks.json',
    ]
  );
  assert.equal(outputs[0].entry.entries.length, 1);
  assert.equal(outputs[0].entry.release.status, 'unreleased');
  assert.equal(outputs[0].entry.change.pullRequest.number, 4989);
  assert.equal(outputs[0].entry.change.pullRequest.state, 'OPEN');
  assert.equal(outputs[1].entry.entries.length, 2);
  assert.equal(outputs[1].entry.release.tag, 'v53.0.7');
  assert.equal(outputs[1].entry.change.pullRequest.number, 4987);
  assert.equal(outputs[2].entry.entries.length, 7);
  assert.equal(outputs[2].entry.release.tag, 'v53.0.0');
  assert.equal(outputs[2].entry.change.pullRequest.number, 4941);
  for (const output of outputs) {
    assert.equal('pr' in output.entry, false);
    assert.equal('commit' in output.entry, false);
    assert.equal('provenance' in output.entry, false);
    assert.equal('warnings' in output.entry, false);
  }

  const { components, index } = buildRegistryChangelogIndexes(outputs);

  assert.deepEqual(
    index.events.map((event) => event.id),
    [
      '2026-06-03-show-code-block-language-labels-read-only-mode',
      '2026-06-02-improve-large-document-editing',
      '2026-04-23-redesign-blockquotes-container-blocks',
    ]
  );
  assert.deepEqual(
    index.events.map((event) => event.href),
    [
      '/registry/changelog/2026-06-03-show-code-block-language-labels-read-only-mode.json',
      '/registry/changelog/2026-06-02-improve-large-document-editing.json',
      '/registry/changelog/2026-04-23-redesign-blockquotes-container-blocks.json',
    ]
  );
  assert.deepEqual(components.components['code-block-node'], [
    '2026-06-03-show-code-block-language-labels-read-only-mode',
  ]);
  assert.deepEqual(components.components['huge-document-demo'], [
    '2026-06-02-improve-large-document-editing',
  ]);
  assert.deepEqual(components.components['footnote-kit'], [
    '2026-04-23-redesign-blockquotes-container-blocks',
  ]);
});
