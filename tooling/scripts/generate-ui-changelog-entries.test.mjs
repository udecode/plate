import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildRegistryChangelogEvents,
  buildRegistryChangelogIndexes,
  extractRegistryItemNames,
  inferRegistryHints,
  parseComponentChangelog,
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

test('current latest 14 source rows collapse to 7 change-unit events', () => {
  const content = fs.readFileSync(
    'tooling/data/plate-ui-changelog.mdx',
    'utf8'
  );
  const rows = parseComponentChangelog(content).slice(0, 14);
  const columnCommit = commit(
    '224b0d13083c199a8f4525b063ad04de2dcf2dbb',
    '2026-06-10',
    'fix(dnd): attach column drop target ref'
  );
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
  const discussionCommit = commit(
    '59e088318686e94c74f89390d9ab307b469767af',
    '2026-04-29',
    '[codex] Fix discussion and suggestion regressions'
  );
  const footnoteCommit = commit(
    '700286bf84ac987b9cc2296f9f69746f0f095936',
    '2026-04-23',
    'docs'
  );
  const provenanceBySourceId = new Map(
    rows.flatMap((row) => {
      if (row.date === '2026-06-15') {
        return [];
      }

      if (row.date === '2026-06-14') {
        return [];
      }

      if (row.date === '2026-06-10') {
        return [
          [
            row.sourceId,
            provenance(
              columnCommit,
              pr(5003, 'fix(dnd): attach column drop target ref', {
                mergedAt: '2026-06-10T10:46:04Z',
              }),
              ['No generated release-index entry found for PR 5003.']
            ),
          ],
        ];
      }

      if (row.sourceId?.startsWith('2026-06-03')) {
        return [
          [
            row.sourceId,
            provenance(
              codeCommit,
              pr(4989, 'Show code block language labels in read-only mode', {
                state: 'OPEN',
              }),
              ['Matched PR 4989, but it is OPEN.']
            ),
          ],
        ];
      }

      if (row.sourceId?.startsWith('2026-05-31')) {
        return [
          [
            row.sourceId,
            provenance(
              perfCommit,
              pr(4987, 'perf: improve large document editing', {
                mergedAt: '2026-06-02T19:26:44Z',
              })
            ),
          ],
        ];
      }

      if (row.sourceId?.startsWith('2026-04-29')) {
        return [
          [
            row.sourceId,
            provenance(
              discussionCommit,
              pr(4945, '[codex] Fix discussion and suggestion regressions', {
                mergedAt: '2026-04-29T09:59:13Z',
              })
            ),
          ],
        ];
      }

      return [
        [
          row.sourceId,
          provenance(
            footnoteCommit,
            pr(4941, 'fix: redesign blockquotes as container blocks', {
              mergedAt: '2026-04-23T11:41:41Z',
            })
          ),
        ],
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
        'Fix discussion and suggestion regressions ([#4945](https://github.com/udecode/plate/pull/4945))',
      date: '2026-04-29',
      packageTag: 'platejs@53.0.3',
      tag: 'v53.0.3',
      versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4954',
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
    isChangeAfterRelease: () => true,
    provenanceBySourceId,
    releases,
  });

  assert.equal(rows.length, 14);
  assert.equal(outputs.length, 7);
  assert.deepEqual(
    outputs.map((output) => path.basename(output.targetPath)),
    [
      '2026-06-15-editor-fix-preserved-space-wrapping.json',
      '2026-06-14-editor-install-kit-files-through.json',
      '2026-06-10-attach-column-drop-target-ref.json',
      '2026-06-03-show-code-block-language-labels-read-only-mode.json',
      '2026-06-02-improve-large-document-editing.json',
      '2026-04-29-codex-fix-discussion-suggestion-regressions.json',
      '2026-04-23-redesign-blockquotes-container-blocks.json',
    ]
  );
  assert.equal(outputs[0].entry.entries.length, 1);
  assert.equal(outputs[0].entry.release.status, 'unresolved');
  assert.equal(outputs[0].entry.change.type, 'source');
  assert.equal(outputs[1].entry.entries.length, 1);
  assert.equal(outputs[1].entry.release.status, 'unresolved');
  assert.equal(outputs[1].entry.change.type, 'source');
  assert.equal(outputs[2].entry.entries.length, 1);
  assert.equal(outputs[2].entry.release.status, 'latest');
  assert.equal(outputs[2].entry.release.source, 'post-release-no-changeset');
  assert.equal(outputs[2].entry.change.pullRequest.number, 5003);
  assert.equal(outputs[2].entry.change.pullRequest.state, 'MERGED');
  assert.equal(outputs[3].entry.entries.length, 1);
  assert.equal(outputs[3].entry.release.status, 'latest');
  assert.equal(outputs[3].entry.release.source, 'open-pull-request');
  assert.equal(outputs[3].entry.change.pullRequest.number, 4989);
  assert.equal(outputs[3].entry.change.pullRequest.state, 'OPEN');
  assert.equal(outputs[4].entry.entries.length, 2);
  assert.equal(outputs[4].entry.release.tag, 'v53.0.7');
  assert.equal(outputs[4].entry.change.pullRequest.number, 4987);
  assert.equal(outputs[5].entry.entries.length, 3);
  assert.equal(outputs[5].entry.release.tag, 'v53.0.3');
  assert.equal(outputs[5].entry.change.pullRequest.number, 4945);
  assert.equal(outputs[6].entry.entries.length, 5);
  assert.equal(outputs[6].entry.release.tag, 'v53.0.0');
  assert.equal(outputs[6].entry.change.pullRequest.number, 4941);

  const latestOutputs = buildRegistryChangelogEvents(rows, {
    hasPendingChangeset: true,
    isReleaseAncestor: () => false,
    provenanceBySourceId,
    releases,
  });

  assert.equal(latestOutputs[0].entry.release.status, 'unresolved');
  assert.equal(latestOutputs[1].entry.release.status, 'unresolved');
  assert.equal(latestOutputs[2].entry.release.status, 'latest');
  assert.equal(latestOutputs[2].entry.release.source, 'pending-changeset');

  const unprovenOutputs = buildRegistryChangelogEvents(rows, {
    isChangeAfterRelease: () => false,
    isReleaseAncestor: () => false,
    provenanceBySourceId,
    releases,
  });

  assert.equal(unprovenOutputs[0].entry.release.status, 'unresolved');

  const coveredLatestOutputs = buildRegistryChangelogEvents(rows, {
    isReleaseAncestor: (_changeUnit, release) => release.tag === 'v53.1.0',
    provenanceBySourceId,
    releases: [
      {
        date: '2026-06-10',
        packageTag: 'platejs@53.1.0',
        tag: 'v53.1.0',
        versionPackagePrUrl: 'https://github.com/udecode/plate/pull/4999',
      },
      ...releases,
    ],
  });

  assert.equal(coveredLatestOutputs[0].entry.release.status, 'unresolved');
  assert.equal(coveredLatestOutputs[1].entry.release.status, 'unresolved');
  assert.equal(coveredLatestOutputs[2].entry.release.status, 'released');
  assert.equal(coveredLatestOutputs[2].entry.release.tag, 'v53.1.0');
  assert.equal(
    coveredLatestOutputs[2].entry.release.source,
    'latest-release-no-changeset'
  );

  const previousReleaseAncestorOutputs = buildRegistryChangelogEvents(rows, {
    isChangeAfterRelease: () => false,
    isReleaseAncestor: () => true,
    provenanceBySourceId,
    releases,
  });

  assert.equal(
    previousReleaseAncestorOutputs[0].entry.release.status,
    'unresolved'
  );

  const releasedWithPendingChangesetOutputs = buildRegistryChangelogEvents(
    rows,
    {
      hasPendingChangeset: true,
      isReleaseAncestor: (_changeUnit, release) => release.tag === 'v53.0.7',
      provenanceBySourceId,
      releases,
    }
  );

  assert.equal(
    releasedWithPendingChangesetOutputs[0].entry.release.status,
    'unresolved'
  );
  assert.equal(
    releasedWithPendingChangesetOutputs[1].entry.release.status,
    'unresolved'
  );
  assert.equal(
    releasedWithPendingChangesetOutputs[2].entry.release.status,
    'released'
  );
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
      '2026-06-15-editor-fix-preserved-space-wrapping',
      '2026-06-14-editor-install-kit-files-through',
      '2026-06-10-attach-column-drop-target-ref',
      '2026-06-03-show-code-block-language-labels-read-only-mode',
      '2026-06-02-improve-large-document-editing',
      '2026-04-29-codex-fix-discussion-suggestion-regressions',
      '2026-04-23-redesign-blockquotes-container-blocks',
    ]
  );
  assert.deepEqual(
    index.events.map((event) => event.href),
    [
      '/registry/changelog/2026-06-15-editor-fix-preserved-space-wrapping.json',
      '/registry/changelog/2026-06-14-editor-install-kit-files-through.json',
      '/registry/changelog/2026-06-10-attach-column-drop-target-ref.json',
      '/registry/changelog/2026-06-03-show-code-block-language-labels-read-only-mode.json',
      '/registry/changelog/2026-06-02-improve-large-document-editing.json',
      '/registry/changelog/2026-04-29-codex-fix-discussion-suggestion-regressions.json',
      '/registry/changelog/2026-04-23-redesign-blockquotes-container-blocks.json',
    ]
  );
  assert.deepEqual(components.components['column-node'], [
    '2026-06-10-attach-column-drop-target-ref',
  ]);
  assert.deepEqual(components.components.editor, [
    '2026-06-15-editor-fix-preserved-space-wrapping',
  ]);
  assert.deepEqual(components.components['editor-static'], [
    '2026-06-15-editor-fix-preserved-space-wrapping',
  ]);
  assert.deepEqual(components.components['editor-base-kit'], [
    '2026-06-14-editor-install-kit-files-through',
    '2026-04-23-redesign-blockquotes-container-blocks',
  ]);
  assert.deepEqual(components.components['code-block-node'], [
    '2026-06-03-show-code-block-language-labels-read-only-mode',
  ]);
  assert.deepEqual(components.components['huge-document-demo'], [
    '2026-06-02-improve-large-document-editing',
  ]);
  assert.deepEqual(components.components['block-discussion'], [
    '2026-04-29-codex-fix-discussion-suggestion-regressions',
  ]);
  assert.deepEqual(components.components['footnote-kit'], [
    '2026-04-23-redesign-blockquotes-container-blocks',
  ]);
});
