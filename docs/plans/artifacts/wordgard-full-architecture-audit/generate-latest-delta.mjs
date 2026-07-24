import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const repository = join(artifactDirectory, '../../../../..', 'wordgard');
const gitDirectory = join(repository, '.git');
const baselineCommit = '1acb231df7067bf5f85e694aaf4646181441e9ab';
const latestCommit = '8fd8880d1a16bc6306b1e59f8649b1d9021e3d1e';
const baselineManifestPath = join(artifactDirectory, 'coverage-manifest.json');
const outputPath = join(artifactDirectory, 'latest-delta-manifest.json');
const baselineManifest = JSON.parse(readFileSync(baselineManifestPath, 'utf8'));
const baselineFiles = new Map(
  baselineManifest.files.map((file) => [file.path, file])
);

const runGit = (...args) =>
  execFileSync('git', [`--git-dir=${gitDirectory}`, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trimEnd();

const changedPaths = runGit('diff', '--name-only', baselineCommit, latestCommit)
  .split('\n')
  .filter(Boolean);
const nameStatus = new Map(
  runGit('diff', '--name-status', baselineCommit, latestCommit)
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [status, ...paths] = line.split('\t');

      return [paths.at(-1), status];
    })
);
const numstat = new Map(
  runGit('diff', '--numstat', baselineCommit, latestCommit)
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [added, deleted, path] = line.split('\t');

      return [
        path,
        {
          addedLines: added === '-' ? null : Number(added),
          deletedLines: deleted === '-' ? null : Number(deleted),
        },
      ];
    })
);

const clusterFor = (path) => {
  if (
    path === 'CHANGELOG.md' ||
    path === 'package.json' ||
    path.startsWith('bin/') ||
    path.startsWith('demo/')
  ) {
    return 'release-build-demo';
  }
  if (path.startsWith('src/collab/') || path === 'src/state/correction.ts') {
    return 'collaboration-corrections';
  }
  if (path.startsWith('src/doc/')) return 'document-model-change-codecs';
  if (path.startsWith('src/editor/')) return 'native-dom-editor-runtime';
  if (path.startsWith('src/history/')) return 'history-readonly';
  if (path.startsWith('src/schema/') || path.startsWith('src/command/')) {
    return 'product-readonly-actions';
  }
  if (path.startsWith('src/state/')) return 'state-selection-atomicity';
  if (path.startsWith('src/table/')) return 'table-readonly-corrections';
  if (path.startsWith('test/')) return 'proof';

  return 'unclassified';
};

const clusterSummaries = {
  'collaboration-corrections':
    'Adds correction-aware client/server transform, locked/open updates, and state-independent correction checks.',
  'document-model-change-codecs':
    'Adds compact validated change/slice JSON, pad/clip, content equality, selectable/config-aware atoms, and parser fixes.',
  'history-readonly':
    'Adds read-only command gating while retaining the same unversioned history architecture.',
  'native-dom-editor-runtime':
    'Tracks native DOM input deltas and unflushed DOM/model mappings, improves selection/atom rendering, and adds synchronous transaction listeners.',
  'product-readonly-actions':
    'Makes product commands and controls read-only aware and fixes small action/menu behavior without changing feature ownership.',
  proof:
    'Expands change, collaboration, composition, coordinate, content, command, serialization, and native DOM-delta proof.',
  'release-build-demo':
    'Moves 0.1.0 to 0.3.1, fixes declaration tree-shaking/build behavior, and replaces the diagnostic demo with the real editor demo.',
  'state-selection-atomicity':
    'Makes atomicity configuration-aware, strengthens selection behavior, and adds transaction listener support.',
  'table-readonly-corrections':
    'Removes state dependence from table correction and gates table UI/paste behavior under read-only state.',
};

const conceptOverrides = new Map([
  ['bin/release.ts', ['META-002']],
  [
    'test/webtest-dom-changes.ts',
    ['VIEW-004', 'VIEW-005', 'VIEW-006', 'VIEW-008', 'VIEW-010', 'VIEW-028'],
  ],
]);

const getSource = (commit, path) => {
  try {
    return runGit('show', `${commit}:${path}`);
  } catch {
    return null;
  }
};

const declarationNames = (declaration) => {
  if (!declaration) return [];
  if (declaration.type === 'VariableDeclaration') {
    return declaration.declarations.flatMap(({ id }) =>
      id.type === 'Identifier' ? [id.name] : []
    );
  }
  if ('id' in declaration && declaration.id?.type === 'Identifier') {
    return [declaration.id.name];
  }

  return [];
};

const declarationKind = (declaration) => {
  if (!declaration) return 'declaration';

  return (
    {
      ClassDeclaration: 'class',
      FunctionDeclaration: 'function',
      TSDeclareFunction: 'declaration',
      TSEnumDeclaration: 'enum',
      TSInterfaceDeclaration: 'interface',
      TSModuleDeclaration: 'namespace',
      TSTypeAliasDeclaration: 'type',
      VariableDeclaration: 'variable',
    }[declaration.type] ?? 'declaration'
  );
};

const collectPublicItems = (source, path) => {
  if (source === null || !/\.[cm]?[jt]sx?$/.test(path)) return [];
  const ast = parse(source, {
    errorRecovery: false,
    plugins: ['typescript', 'jsx'],
    sourceType: 'module',
  });
  const items = [];
  const addDeclaration = (declaration, prefix = '') => {
    const kind = declarationKind(declaration);

    for (const name of declarationNames(declaration)) {
      items.push(`${kind}:${prefix}${name}`);
      if (declaration?.type === 'ClassDeclaration') {
        for (const member of declaration.body.body) {
          if (
            member.accessibility === 'private' ||
            member.accessibility === 'protected' ||
            member.type === 'StaticBlock'
          ) {
            continue;
          }
          const memberName =
            member.key?.type === 'Identifier'
              ? member.key.name
              : member.key?.type === 'StringLiteral'
                ? member.key.value
                : null;

          if (!memberName || memberName === 'constructor') continue;
          const memberKind =
            member.type === 'ClassMethod' ||
            member.type === 'ClassPrivateMethod' ||
            member.type === 'TSDeclareMethod'
              ? member.kind === 'get' || member.kind === 'set'
                ? member.kind
                : 'method'
              : 'property';

          items.push(`${memberKind}:${prefix}${name}.${memberName}`);
        }
      }
    }
    if (
      declaration?.type === 'TSModuleDeclaration' &&
      declaration.id.type === 'Identifier' &&
      declaration.body?.type === 'TSModuleBlock'
    ) {
      const namespacePrefix = `${prefix}${declaration.id.name}.`;

      for (const child of declaration.body.body) {
        if (child.type === 'ExportNamedDeclaration') {
          addDeclaration(child.declaration, namespacePrefix);
        } else {
          addDeclaration(child, namespacePrefix);
        }
      }
    }
  };

  for (const node of ast.program.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      items.push('default-export:default');
      continue;
    }
    if (node.type === 'ExportAllDeclaration') {
      items.push(`re-export:*:${node.source.value}`);
      continue;
    }
    if (node.type !== 'ExportNamedDeclaration') continue;
    if (node.declaration) addDeclaration(node.declaration);
    for (const specifier of node.specifiers) {
      const exported =
        specifier.exported.type === 'Identifier'
          ? specifier.exported.name
          : specifier.exported.value;

      items.push(
        `re-export:${exported}${node.source ? `:${node.source.value}` : ''}`
      );
    }
  }

  return items.sort();
};

const multisetDifference = (left, right) => {
  const counts = new Map();

  for (const item of right) counts.set(item, (counts.get(item) ?? 0) + 1);

  return left.filter((item) => {
    const count = counts.get(item) ?? 0;

    if (count === 0) return true;
    counts.set(item, count - 1);

    return false;
  });
};

const materialPaths = new Set([
  'demo/demo.ts',
  'src/collab/collab.ts',
  'src/doc/change.ts',
  'src/doc/node.ts',
  'src/doc/parse.ts',
  'src/doc/slice.ts',
  'src/editor/domobserver.ts',
  'src/editor/editor.ts',
  'src/editor/input.ts',
  'src/editor/tile.ts',
  'src/state/correction.ts',
  'src/state/state.ts',
  'src/state/transaction.ts',
  'test/test-collab.ts',
  'test/webtest-composition.ts',
  'test/webtest-dom-changes.ts',
]);

const files = changedPaths.map((path) => {
  const baseline = baselineFiles.get(path);
  const before = getSource(baselineCommit, path);
  const after = getSource(latestCommit, path);
  const baselineConceptIds = baseline?.conceptIds ?? [];
  const conceptIds = [
    ...new Set([...baselineConceptIds, ...(conceptOverrides.get(path) ?? [])]),
  ].sort();
  const oldPublicItems = collectPublicItems(before, path);
  const newPublicItems = collectPublicItems(after, path);
  const cluster = clusterFor(path);

  return {
    path,
    status: nameStatus.get(path),
    ...numstat.get(path),
    cluster,
    clusterSummary: clusterSummaries[cluster],
    review:
      path === 'CHANGELOG.md'
        ? 'excluded-release-history'
        : materialPaths.has(path)
          ? 'material-architecture-delta'
          : 'reviewed-no-target-change',
    conceptIds,
    baselineConceptIds,
    publicApi: {
      added: multisetDifference(newPublicItems, oldPublicItems),
      removed: multisetDifference(oldPublicItems, newPublicItems),
      beforeCount: oldPublicItems.length,
      afterCount: newPublicItems.length,
    },
    latest: {
      bytes: after === null ? null : Buffer.byteLength(after),
      lines: after === null ? null : after.split('\n').length,
      sha256:
        after === null
          ? null
          : createHash('sha256').update(after).digest('hex'),
    },
  };
});

const commits = runGit(
  'rev-list',
  '--reverse',
  `${baselineCommit}..${latestCommit}`
)
  .split('\n')
  .filter(Boolean);
const totals = files.reduce(
  (summary, file) => {
    summary.addedLines += file.addedLines ?? 0;
    summary.deletedLines += file.deletedLines ?? 0;
    summary.publicItemsAdded += file.publicApi.added.length;
    summary.publicItemsRemoved += file.publicApi.removed.length;
    summary.reviewCounts[file.review] =
      (summary.reviewCounts[file.review] ?? 0) + 1;

    return summary;
  },
  {
    addedLines: 0,
    deletedLines: 0,
    publicItemsAdded: 0,
    publicItemsRemoved: 0,
    reviewCounts: {},
  }
);
const manifest = {
  schemaVersion: 1,
  kind: 'wordgard-latest-delta-manifest',
  generatedAt: new Date().toISOString(),
  authority: {
    baselineCheckout: '/Users/zbeyens/git/wordgard-v0',
    baselineCommit,
    baselineManifest:
      'docs/plans/artifacts/wordgard-full-architecture-audit/coverage-manifest.json',
    latestCheckout: '/Users/zbeyens/git/wordgard',
    latestCommit,
    range: `${baselineCommit}..${latestCommit}`,
  },
  summary: {
    commits: commits.length,
    changedFiles: files.length,
    addedFiles: files.filter((file) => file.status === 'A').length,
    removedFiles: files.filter((file) => file.status === 'D').length,
    modifiedFiles: files.filter((file) => file.status === 'M').length,
    ...totals,
    uniqueConceptIds: new Set(files.flatMap((file) => file.conceptIds)).size,
  },
  validation: {
    allChangedFilesClassified: files.every(
      (file) => file.cluster !== 'unclassified'
    ),
    allNonExcludedFilesMapped: files.every(
      (file) =>
        file.review === 'excluded-release-history' || file.conceptIds.length > 0
    ),
    baselineCheckoutMatchesCommit:
      runGit(
        '--work-tree=/Users/zbeyens/git/wordgard-v0',
        'diff',
        '--quiet',
        baselineCommit
      ) === '',
    exactRangeCommitCount: commits.length === 76,
    exactRangeFileCount: files.length === 52,
    unclassifiedFiles: files
      .filter((file) => file.cluster === 'unclassified')
      .map((file) => file.path),
    unmappedFiles: files
      .filter(
        (file) =>
          file.review !== 'excluded-release-history' &&
          file.conceptIds.length === 0
      )
      .map((file) => file.path),
  },
  clusters: Object.fromEntries(
    Object.entries(clusterSummaries).map(([cluster, summary]) => [
      cluster,
      {
        summary,
        files: files
          .filter((file) => file.cluster === cluster)
          .map((file) => file.path),
      },
    ])
  ),
  files,
};

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      outputPath,
      summary: manifest.summary,
      validation: manifest.validation,
    },
    null,
    2
  )
);
