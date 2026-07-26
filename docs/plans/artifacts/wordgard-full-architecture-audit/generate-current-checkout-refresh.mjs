import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  readFileSync,
  readlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const repository = join(artifactDirectory, '../../../..');
const outputPath = join(artifactDirectory, 'current-checkout-refresh.json');
const auditPlan = 'docs/plans/2026-07-23-wordgard-full-architecture-audit.md';
const auditArtifactPrefix =
  'docs/plans/artifacts/wordgard-full-architecture-audit/';
const basicNodePathPattern = /basic-(nodes|blocks|marks)|heading|blockquote/i;
const codeBlockPathPattern = /code-block/i;
const linkPathPattern = /link/i;
const listPathPattern = /list-classic|[/.-]list(?:[/.-]|$)/i;
const mediaPathPattern = /caption|media/i;
const stylePathPattern = /basic-styles|align|font|color|indent|line-height/i;
const tablePathPattern = /table/i;
const writingDirectionPathPattern = /writing[-_]?direction/i;

const runGitBuffer = (...args) =>
  execFileSync('git', ['-C', repository, ...args], {
    encoding: 'buffer',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const runGit = (...args) =>
  runGitBuffer(...args)
    .toString()
    .trimEnd();
const nulList = (...args) =>
  runGitBuffer(...args)
    .toString()
    .split('\0')
    .filter(Boolean);

const staged = new Set(nulList('diff', '--cached', '--name-only', '-z'));
const unstaged = new Set(nulList('diff', '--name-only', '-z'));
const untracked = new Set(
  nulList('ls-files', '--others', '--exclude-standard', '-z')
);
const paths = [...new Set([...staged, ...unstaged, ...untracked])].sort();

const allProductConcepts = [
  'PRODUCT-001',
  'PRODUCT-002',
  'PRODUCT-003',
  'PRODUCT-004',
  'PRODUCT-005',
  'PRODUCT-006',
  'PRODUCT-008',
  'PRODUCT-010',
  'PRODUCT-011',
  'PRODUCT-014',
  'PRODUCT-015',
  'PRODUCT-016',
  'PRODUCT-017',
  'PRODUCT-018',
  'PRODUCT-019',
  'PRODUCT-021',
  'PRODUCT-022',
  'PRODUCT-023',
  'PRODUCT-024',
  'PRODUCT-025',
];
const tableConcepts = Array.from(
  { length: 31 },
  (_, index) => `TABLE-${String(index + 1).padStart(3, '0')}`
);

const result = (cluster, conceptIds, summary, exclusionReason) => ({
  cluster,
  conceptIds,
  ...(exclusionReason ? { exclusionReason } : {}),
  summary,
});

const classifyProductPath = (path) => {
  if (path.includes('/markdown') || path.includes('Markdown')) {
    return result(
      'plate-codec-and-markdown',
      [
        'DOC-013',
        'DOC-023',
        'DOC-026',
        'DOC-027',
        'DOC-028',
        'DOC-029',
        'DOC-030',
        'DOC-031',
        'DOC-032',
        'DOC-033',
        'DOC-034',
      ],
      'Document codecs, parser ownership, truthful Markdown projection, and proof.'
    );
  }
  if (mediaPathPattern.test(path)) {
    return result(
      'plate-media-direct-caption',
      ['PRODUCT-004', 'PRODUCT-011', 'PRODUCT-023', 'PRODUCT-024'],
      'Media insertion, direct caption children, node selection, host UI, and compatibility cleanup.'
    );
  }
  if (listPathPattern.test(path)) {
    return result(
      'plate-list-owners',
      [
        'PRODUCT-004',
        'PRODUCT-008',
        'PRODUCT-011',
        'PRODUCT-018',
        'PRODUCT-019',
      ],
      'Flat and structural list API publication, behavior colocation, adoption, and proof.'
    );
  }
  if (linkPathPattern.test(path)) {
    return result(
      'plate-link-owner',
      [
        'PRODUCT-004',
        'PRODUCT-011',
        'PRODUCT-018',
        'PRODUCT-021',
        'PRODUCT-022',
      ],
      'Link API, update, safety, shortcut, UI, and paste-policy adoption.'
    );
  }
  if (tablePathPattern.test(path)) {
    return result(
      'plate-table-owner',
      tableConcepts,
      'Table schema, grid, mutation, selection, flat HTML input, public API, and proof.'
    );
  }
  if (codeBlockPathPattern.test(path)) {
    return result(
      'plate-code-block-owner',
      ['PRODUCT-004', 'PRODUCT-006', 'PRODUCT-008', 'PRODUCT-018'],
      'Code-block feature updates, shortcuts, input behavior, adoption, and proof.'
    );
  }
  if (basicNodePathPattern.test(path)) {
    return result(
      'plate-basic-node-owners',
      [
        'PRODUCT-004',
        'PRODUCT-006',
        'PRODUCT-008',
        'PRODUCT-011',
        'PRODUCT-015',
        'PRODUCT-016',
        'PRODUCT-017',
        'PRODUCT-018',
      ],
      'Individual block and mark plugins, inferred updates, explicit kits, callers, and proof.'
    );
  }
  if (writingDirectionPathPattern.test(path)) {
    return result(
      'plate-writing-direction-rejection-cleanup',
      ['PRODUCT-020'],
      'Rejected C23 paths deleted from the worktree; staged-path accounting remains until an authorized index refresh.'
    );
  }
  if (stylePathPattern.test(path)) {
    return result(
      'plate-style-owners',
      [
        'PRODUCT-004',
        'PRODUCT-011',
        'PRODUCT-018',
        'PRODUCT-025',
        'PRODUCT-026',
      ],
      'Style schemas, inferred updates, app-owned controls, and adoption proof.'
    );
  }

  return result(
    'plate-feature-api-adoption',
    allProductConcepts,
    'Feature plugin APIs, transaction groups, shortcuts, explicit composition, app callers, docs, and proof.'
  );
};

const classify = (path) => {
  if (path === auditPlan || path.startsWith(auditArtifactPrefix)) {
    return result(
      'audit-generated',
      [],
      'Files produced by this audit iteration; excluded from the checkout input census.',
      'self-generated audit output'
    );
  }
  if (path === 'docs/analysis/best-api-review.md') {
    return result(
      'plate-api-doctrine',
      [
        'PRODUCT-001',
        'PRODUCT-004',
        'PRODUCT-005',
        'PRODUCT-011',
        'PRODUCT-018',
      ],
      'Current best-API review for inferred root namespaces, generic portals, and caller adoption.'
    );
  }
  if (path.startsWith('docs/editor-behavior/')) {
    return result(
      'editor-behavior-doctrine',
      [
        'DOC-013',
        'DOC-023',
        'PRODUCT-004',
        'PRODUCT-006',
        'PRODUCT-018',
        'VIEW-004',
        'VIEW-005',
        'VIEW-006',
        'VIEW-008',
        'VIEW-010',
      ],
      'Behavior and parity contracts for editing, Markdown, DOM reconciliation, and product entry points.'
    );
  }
  if (path.startsWith('docs/vision/')) {
    return result(
      'plate-plite-vision',
      [
        'DOC-009',
        'DOC-013',
        'STATE-012',
        'STATE-014',
        'PRODUCT-001',
        'PRODUCT-004',
        'PRODUCT-005',
        'PRODUCT-011',
        'PRODUCT-014',
        'PRODUCT-018',
        'HC-029',
      ],
      'Current Plate and Plite ownership, API, composition, and proof doctrine.'
    );
  }
  if (
    path === 'AGENTS.md' ||
    path.startsWith('.agents/') ||
    path.startsWith('.claude/')
  ) {
    return result(
      'agent-tooling',
      [],
      'Agent rules and skills are workflow inputs, not Plate or Plite runtime evidence.',
      'agent workflow source'
    );
  }
  if (path.startsWith('.changeset/')) {
    return result(
      'release-metadata',
      [],
      'Changesets corroborate migration intent but are not used as implementation truth.',
      'release metadata; source owners are mapped separately'
    );
  }
  if (
    path === 'pnpm-lock.yaml' ||
    path.startsWith('tooling/') ||
    path.startsWith('docs/plans/')
  ) {
    return result(
      'repository-tooling',
      [],
      'Repository tooling, lock state, and unrelated planning documents are outside the architecture source census.',
      'repository control or planning file'
    );
  }
  if (
    path.startsWith('docs/performance/') ||
    path.startsWith('docs/solutions/performance-issues/')
  ) {
    return result(
      'performance-proof',
      ['META-004', 'VIEW-013', 'VIEW-028'],
      'Performance workload, interpretation, and regression-proof guidance.'
    );
  }
  if (
    path.startsWith('docs/plite/research/') ||
    path.startsWith('docs/research/')
  ) {
    return result(
      'editor-behavior-research',
      [
        'META-004',
        'META-005',
        'DOC-013',
        'HC-032',
        'VIEW-003',
        'VIEW-004',
        'VIEW-005',
        'VIEW-006',
        'VIEW-008',
        'VIEW-009',
        'VIEW-010',
        'VIEW-012',
        'VIEW-013',
        'VIEW-028',
      ],
      'Current research evidence for editor input, selection, DOM, performance, and proof ownership.'
    );
  }
  if (path.startsWith('docs/solutions/logic-errors/')) {
    return classifyProductPath(path);
  }
  if (path.startsWith('docs/solutions/test-failures/')) {
    return result(
      'proof-infrastructure-guidance',
      ['META-002', 'META-004', 'META-005', 'VIEW-028'],
      'Current package, typecheck, and test-runner failure guidance.'
    );
  }
  if (path.startsWith('packages/plite-history/')) {
    return result(
      'plite-history',
      [
        'HC-001',
        'HC-002',
        'HC-003',
        'HC-004',
        'HC-005',
        'HC-006',
        'HC-007',
        'HC-008',
        'HC-009',
        'HC-010',
        'PRODUCT-010',
      ],
      'History state, codec truth, direct update API, persistence, and proof.'
    );
  }
  if (path.startsWith('packages/yjs/')) {
    return result(
      'plite-yjs-whole-document',
      [
        'HC-013',
        'HC-014',
        'HC-015',
        'HC-016',
        'HC-017',
        'HC-018',
        'HC-019',
        'HC-020',
        'HC-021',
        'HC-022',
        'HC-023',
        'HC-024',
        'HC-025',
        'HC-026',
        'HC-027',
        'HC-028',
        'HC-029',
        'HC-030',
        'HC-031',
        'HC-032',
      ],
      'Whole-document multi-root Yjs, schema identity, awareness, attributes, history, and proof.'
    );
  }
  if (path.startsWith('packages/plite-dom/')) {
    return result(
      'plite-dom-host-codecs',
      [
        'DOC-013',
        'DOC-026',
        'DOC-027',
        'DOC-028',
        'DOC-029',
        'DOC-030',
        'DOC-031',
        'DOC-032',
        'DOC-033',
        'DOC-034',
        'VIEW-004',
        'VIEW-005',
        'VIEW-006',
        'VIEW-009',
        'VIEW-022',
      ],
      'DOM host codecs, rooted slices, mapping, geometry, and browser-host boundaries.'
    );
  }
  if (path.startsWith('packages/plite-react/')) {
    return result(
      'plite-react-host-runtime',
      [
        'STATE-016',
        'STATE-017',
        'PRODUCT-004',
        'PRODUCT-011',
        'VIEW-004',
        'VIEW-005',
        'VIEW-006',
        'VIEW-008',
        'VIEW-010',
        'VIEW-022',
        'VIEW-023',
      ],
      'Mounted-root lifecycle, node selection, DOM phases, React bindings, and proof.'
    );
  }
  if (path.startsWith('packages/plite/')) {
    return result(
      'plite-schema-and-root-lifecycle',
      [
        'DOC-001',
        'DOC-002',
        'DOC-003',
        'DOC-004',
        'DOC-005',
        'DOC-006',
        'DOC-007',
        'DOC-008',
        'DOC-009',
        'DOC-010',
        'DOC-011',
        'DOC-012',
        'DOC-013',
        'DOC-014',
        'DOC-015',
        'DOC-016',
        'DOC-021',
        'DOC-023',
        'STATE-008',
        'STATE-012',
        'STATE-014',
        'STATE-016',
        'STATE-017',
        'PRODUCT-001',
        'PRODUCT-002',
        'PRODUCT-003',
        'PRODUCT-005',
      ],
      'Schema identity, content roots, slices, selection, extensions, generic commands, and proof.'
    );
  }
  if (path.startsWith('packages/core/')) {
    return result(
      'plate-plugin-runtime-and-api',
      [
        'DOC-026',
        'DOC-027',
        'DOC-028',
        'DOC-029',
        'DOC-030',
        'DOC-031',
        'DOC-032',
        'DOC-033',
        'DOC-034',
        'STATE-012',
        'STATE-014',
        ...allProductConcepts,
      ],
      'Plugin topology, inferred root API/update publication, generic portals, schemas, parsers, rendering, and proof.'
    );
  }
  if (
    path.startsWith('packages/markdown/') ||
    path.startsWith('packages/csv/') ||
    path.startsWith('packages/docx') ||
    path.startsWith('packages/juice/')
  ) {
    return classifyProductPath(path);
  }
  if (path.startsWith('packages/table/')) {
    return classifyProductPath(path);
  }
  if (path.startsWith('packages/')) {
    return classifyProductPath(path);
  }
  if (
    path.startsWith('apps/plite/') &&
    writingDirectionPathPattern.test(path)
  ) {
    return result(
      'plate-writing-direction-rejection-cleanup',
      ['PRODUCT-020'],
      'Rejected C23 paths deleted from the worktree; staged-path accounting remains until an authorized index refresh.'
    );
  }
  if (path.startsWith('apps/plite/')) {
    return result(
      'plite-release-proof-app',
      ['META-004', 'META-005', 'META-006', 'HC-029', 'VIEW-028'],
      'Consumer-owned browser and release proof for current Plite package surfaces.'
    );
  }
  if (path.startsWith('apps/www/') || path.startsWith('content/')) {
    return classifyProductPath(path);
  }
  if (path.startsWith('benchmarks/')) {
    return result(
      'performance-proof',
      ['META-004', 'VIEW-013', 'VIEW-028'],
      'Performance workload and regression proof.'
    );
  }

  return result(
    'unclassified',
    [],
    'No classification rule matched.',
    'unclassified'
  );
};

const hashPath = (path) => {
  const absolutePath = join(repository, path);

  if (!existsSync(absolutePath)) return null;
  const stat = lstatSync(absolutePath);
  const bytes = stat.isSymbolicLink()
    ? Buffer.from(readlinkSync(absolutePath))
    : readFileSync(absolutePath);

  return createHash('sha256').update(bytes).digest('hex');
};

const files = paths.map((path) => {
  const classification = classify(path);

  return {
    path,
    staged: staged.has(path),
    unstaged: unstaged.has(path),
    untracked: untracked.has(path),
    sha256: hashPath(path),
    ...classification,
  };
});

const unclassified = files.filter((file) => file.cluster === 'unclassified');
const unmappedSource = files.filter(
  (file) => !file.exclusionReason && file.conceptIds.length === 0
);

if (unclassified.length > 0 || unmappedSource.length > 0) {
  throw new Error(
    `Checkout refresh classification failed: ${unclassified.length} unclassified, ${unmappedSource.length} unmapped source.`
  );
}

const anchors = [
  {
    path: 'packages/core/src/lib/plugin/BasePlugin.ts',
    patterns: [
      'defineCodecs: DefinePluginCodecs<C>;',
      "type PluginAuthoringMethod = 'clone' | 'configure' | 'extend' | 'withComponent';",
      'UnifiedRuntimeBasePluginConfig<',
    ],
  },
  {
    path: 'packages/core/src/lib/plugin/pluginAuthoringContext.ts',
    patterns: [
      'export function createDefinePluginCodecs<',
      'function defineCodecs(',
      'const target = args.length === 2 ? args[0] : undefined;',
      '[pluginCodecMapDeclaration]: true',
    ],
  },
  {
    path: 'packages/core/src/internal/plugin/resolvePlugin.ts',
    patterns: [
      'const applyUnifiedExtension =',
      'codecs must be declared with the context-bound',
      '{ extension: () => api, isPluginSpecific: true }',
    ],
  },
  {
    path: 'packages/core/src/internal/plugin/resolvePlugins.ts',
    patterns: [
      'declared by both plugin API and editor API owners',
      'shortcutApiByPlugin',
      'collectPluginTxGroups',
    ],
  },
  {
    path: 'packages/core/src/lib/plugin/getEditorPlugin.spec.ts',
    patterns: [
      'splits plugin-owned API from the root editor API',
      'exposes plugin-owned updates without their key namespace',
      "typedEditor.plugin(plugin).update.setMode('edit');",
      "expect(context.api.pluginMethod()).toBe('plugin');",
    ],
  },
  {
    path: 'packages/core/src/internal/plugin/prepareHtmlRegistry.ts',
    patterns: [
      'Snapshot the flat whole-input HTML hooks',
      'plugin.parsers.html?.query',
      'plugin.parsers.html?.transformData',
      'plugin.parsers.html?.transformFragment',
    ],
  },
  {
    path: 'packages/basic-nodes/src/lib/BaseBoldPlugin.ts',
    patterns: [
      '.extend(({ defineCodecs, type }) => ({',
      'codecs: defineCodecs({',
      'update: ({ tx }) => ({',
    ],
  },
  {
    path: 'packages/basic-nodes/src/react/BasicNodesPlugins.spec.tsx',
    patterns: ['editor.update.h1.toggle()', 'editor.update.bold.toggle()'],
  },
  {
    path: 'packages/basic-styles/src/lib/BaseTextAlignPlugin.spec.ts',
    patterns: ["editor.update.textAlign.set('center')"],
  },
  {
    path: 'packages/list/src/lib/BaseListPlugin.tsx',
    patterns: [
      '.extend(({ defineCodecs, editor, plugin }) => {',
      'codecs: defineCodecs({',
      'update: ({ tx }) => ({',
    ],
  },
  {
    path: 'packages/link/src/lib/BaseLinkPlugin.ts',
    patterns: [
      '}).extend<{ api: BaseLinkApi }>(({ defineCodecs, getOptions }) => ({',
      'codecs: defineCodecs({',
      'BaseLinkPluginDefinition.extend<{',
      'extension: {',
    ],
  },
  {
    path: 'apps/www/src/registry/ui/mark-toolbar-button.tsx',
    patterns: ['plugin: MarkPlugin', 'editor.plugin(plugin).update.toggle()'],
  },
  {
    path: 'apps/www/src/registry/ui/link-toolbar.tsx',
    patterns: ['editor.plugin(LinkPlugin).api.getAttributes(element)'],
  },
  {
    path: 'apps/www/src/registry/ui/turn-into-toolbar-button.tsx',
    patterns: [
      'useSelectionFragmentProp({',
      'getProp: (node) => getBlockType(node as Element)',
      'setBlockType(editor, type);',
    ],
  },
];

const verifiedAnchors = anchors.map((anchor) => {
  const source = readFileSync(join(repository, anchor.path), 'utf8');
  const missingPatterns = anchor.patterns.filter(
    (pattern) => !source.includes(pattern)
  );

  if (missingPatterns.length > 0) {
    throw new Error(
      `${anchor.path} is missing checkout-refresh anchors: ${missingPatterns.join(', ')}`
    );
  }

  return {
    ...anchor,
    sha256: createHash('sha256').update(source).digest('hex'),
  };
});

const clusterMap = new Map();
for (const file of files) {
  const entry = clusterMap.get(file.cluster) ?? {
    cluster: file.cluster,
    conceptIds: new Set(),
    excluded: Boolean(file.exclusionReason),
    paths: [],
    summary: file.summary,
  };

  file.conceptIds.forEach((conceptId) => {
    entry.conceptIds.add(conceptId);
  });
  entry.paths.push(file.path);
  clusterMap.set(file.cluster, entry);
}

const clusters = [...clusterMap.values()]
  .map((cluster) => ({
    ...cluster,
    conceptIds: [...cluster.conceptIds].sort(),
    count: cluster.paths.length,
  }))
  .sort((left, right) => left.cluster.localeCompare(right.cluster));
const sourceFiles = files.filter((file) => !file.exclusionReason);
const excludedFiles = files.filter((file) => file.exclusionReason);

const manifest = {
  schemaVersion: 1,
  repository: relative(join(repository, '..'), repository),
  head: runGit('rev-parse', 'HEAD'),
  census: {
    changedPaths: files.length,
    stagedPaths: staged.size,
    unstagedPaths: unstaged.size,
    untrackedPaths: untracked.size,
    sourcePaths: sourceFiles.length,
    excludedPaths: excludedFiles.length,
    mappedSourcePaths: sourceFiles.filter((file) => file.conceptIds.length > 0)
      .length,
    unclassifiedPaths: unclassified.length,
    unmappedSourcePaths: unmappedSource.length,
  },
  conclusions: {
    pluginAuthoring:
      'Use one .extend() author contribution by default; declare codec maps with its context-bound defineCodecs helper.',
    htmlInput:
      'Keep whole-input query, transformData, and transformFragment hooks flat under parsers.html.',
    normalAppApi:
      'Use inferred editor.api.<pluginKey> and editor.update.<pluginKey> namespaces in user-app code whose editor type contains the plugin.',
    decoupledPortal:
      'Use editor.plugin(Plugin).api/update in decoupled registry and reusable package code that owns the descriptor but not the concrete editor type.',
    residualAdoption:
      'The public API migration is landed; remaining product work is bounded caller conversion, duplicate deletion, and proof.',
  },
  verifiedAnchors,
  clusters,
  files,
};

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);

process.stdout.write(
  `${JSON.stringify({
    output: relative(repository, outputPath),
    ...manifest.census,
    clusters: clusters.length,
    anchors: verifiedAnchors.length,
  })}\n`
);
