import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('../../../..', import.meta.url).pathname);
const outDir = path.resolve(
  repoRoot,
  'docs/plans/artifacts/plate-slate-v2-migration'
);

const scanRoots = ['packages', 'apps/www/src', 'content/docs'];
const fileExtensions = new Set([
  '.cts',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mdx',
  '.mts',
  '.ts',
  '.tsx',
]);
const ignoredSegments = new Set([
  '.next',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'test-results',
]);
const ignoredFileNames = new Set(['CHANGELOG.md']);
const ignoredRelativePrefixes = [
  'apps/www/src/generated/',
  'content/docs/migration/',
];
const hitOverridePath = path.join(outDir, 'hit-overrides.json');
const slateSubstrateOwners = new Set([
  'packages/browser',
  'packages/slate',
  'packages/slate-dom',
  'packages/slate-history',
  'packages/slate-hyperscript',
  'packages/slate-layout',
  'packages/slate-react',
  'packages/yjs',
]);
const staleTypeNames = [
  'EditorApi',
  'EditorBeforeOptions',
  'EditorNodesOptions',
  'EditorPropOptions',
  'EditorSelection',
  'EditorTransforms',
  'InsertNodesOptions',
  'LegacyEditorMethods',
  'RemoveNodesOptions',
  'ReplaceNodesOptions',
  'SetNodesOptions',
  'TDescendant',
  'TEditor',
  'TElement',
  'TLocation',
  'TNode',
  'TNodeEntry',
  'TPath',
  'TPoint',
  'TRange',
  'TText',
  'UnwrapNodesOptions',
  'WrapNodesOptions',
  'combineMatchOptions',
  'getAt',
];
const staleTypeRegex = new RegExp(`\\b(?:${staleTypeNames.join('|')})\\b`, 'g');
const legacySourceRegex =
  /@platejs\/slate-legacy|slate-legacy|from\s+['"]platejs['"]|from\s+['"](?:slate|slate-[^'"]+|slate\/[^'"]+|slate-react|slate-dom|slate-history|slate-hyperscript|slate-yjs|slate-layout)['"]/;
const currentPlatejsPackageImportRegex =
  /(?:import|export)[^'"]*['"](@platejs\/(?:slate|slate-dom|slate-react|slate-history|slate-hyperscript|slate-layout|yjs|browser))(?:\/[^'"]*)?['"]|import\s*\(\s*['"](@platejs\/(?:slate|slate-dom|slate-react|slate-history|slate-hyperscript|slate-layout|yjs|browser))(?:\/[^'"]*)?['"]\s*\)/g;

const patterns = [
  {
    name: 'legacy-import',
    regex: /@platejs\/slate-legacy|slate-legacy/g,
  },
  {
    name: 'bare-slate-import',
    regex:
      /from\s+['"](?:slate|slate-[^'"]+|slate\/[^'"]+|slate-react|slate-dom|slate-history|slate-hyperscript|slate-yjs|slate-layout)['"]|import\s*\(\s*['"](?:slate|slate-[^'"]+|slate\/[^'"]+)['"]\s*\)/g,
  },
  {
    name: 'current-platejs-slate-import',
    regex: /@platejs\/(?:slate|slate-dom|slate-react|slate-history|slate-hyperscript|slate-layout|yjs|browser)(?:\/[^'"\s]*)?/g,
  },
];

const packageJsonByOwner = new Map();

function readHitOverrides() {
  if (!fs.existsSync(hitOverridePath)) return [];

  const parsed = JSON.parse(fs.readFileSync(hitOverridePath, 'utf8'));

  if (!Array.isArray(parsed)) {
    throw new TypeError(`${hitOverridePath} must contain an array`);
  }

  return parsed;
}

const hitOverrides = readHitOverrides();

function rel(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function shouldIgnore(filePath) {
  if (ignoredFileNames.has(path.basename(filePath))) return true;

  return filePath
    .split(path.sep)
    .some((segment) => ignoredSegments.has(segment));
}

function shouldIgnoreRelative(relativePath) {
  return ignoredRelativePrefixes.some((prefix) =>
    relativePath.startsWith(prefix)
  );
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir) || shouldIgnore(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (shouldIgnore(fullPath)) continue;

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (fileExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function ownerFor(relativePath) {
  const parts = relativePath.split('/');

  if (parts[0] === 'packages' && parts[1]) return `packages/${parts[1]}`;
  if (parts[0] === 'apps' && parts[1]) return `apps/${parts[1]}`;
  if (parts[0] === 'content') return 'content/docs';

  return parts[0] ?? 'unknown';
}

function hasStaleTypeName(line) {
  staleTypeRegex.lastIndex = 0;
  return staleTypeRegex.test(line);
}

function isDocsPath(relativePath) {
  return relativePath.startsWith('content/docs/');
}

function usesLegacyTypeSource(line) {
  if (!hasStaleTypeName(line)) return false;

  return legacySourceRegex.test(line);
}

function hasLegacyTypeImportBlock(text) {
  return /import\s+(?:type\s+)?\{[\s\S]*?\b(?:TDescendant|TEditor|TElement|TLocation|TNode|TNodeEntry|TPath|TPoint|TRange|TText)\b[\s\S]*?\}\s+from\s+['"]platejs['"]/.test(
    text
  );
}

function isStaleTypeHit(line, relativePath, staleTypeSourceFile) {
  if (!hasStaleTypeName(line)) return false;

  return isDocsPath(relativePath) || staleTypeSourceFile;
}

function getHitOverride({ file, kind, text }) {
  return hitOverrides.find(
    (override) =>
      override.file === file &&
      override.kind === kind &&
      (override.textIncludes ? text.includes(override.textIncludes) : true)
  );
}

function isActionableOverride(override) {
  return !override || override.decision === 'actionable';
}

function hasNonActionableOverride({ file, kind, textIncludes }) {
  return hitOverrides.some(
    (override) =>
      override.file === file &&
      override.kind === kind &&
      override.decision !== 'actionable' &&
      (!textIncludes || override.textIncludes === textIncludes)
  );
}

function defaultVerdict(kind) {
  if (kind === 'current-platejs-slate-import') return 'current';

  return 'actionable';
}

function readPackageJson(owner) {
  if (packageJsonByOwner.has(owner)) return packageJsonByOwner.get(owner);

  const packagePath = path.join(repoRoot, owner, 'package.json');
  if (!fs.existsSync(packagePath)) {
    packageJsonByOwner.set(owner, null);
    return null;
  }

  const parsed = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJsonByOwner.set(owner, parsed);
  return parsed;
}

function packageProof(owner) {
  if (owner === 'apps/www') {
    return 'pnpm turbo typecheck --filter=./apps/www && Browser proof on /blocks/playground';
  }

  const pkg = readPackageJson(owner);
  if (!pkg) return 'N/A';

  const commands = [];
  if (pkg.scripts?.typecheck) {
    commands.push(`pnpm turbo typecheck --filter=./${owner}`);
  }
  if (pkg.scripts?.test) {
    commands.push(`pnpm --filter ${pkg.name} test`);
  }
  if (pkg.scripts?.build) {
    commands.push(`pnpm --filter ${pkg.name} build`);
  }

  return commands.length ? commands.join(' && ') : `pnpm --filter ${pkg.name} lint`;
}

function dependencyState(owner) {
  const pkg = readPackageJson(owner);
  if (!pkg) return { allDeps: new Set(), legacyDep: false, currentSlateDeps: [] };

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };
  const currentSlateDeps = Object.keys(allDeps).filter((dep) =>
    /^@platejs\/(?:slate|slate-dom|slate-react|slate-history|slate-hyperscript|slate-layout|yjs|browser)$/.test(
      dep
    )
  );
  const packageFile = `${owner}/package.json`;
  const legacyDep = Boolean(allDeps['@platejs/slate-legacy']);
  const legacyDepQuarantined = hasNonActionableOverride({
    file: packageFile,
    kind: 'legacy-dependency',
    textIncludes: '@platejs/slate-legacy',
  });

  return {
    allDeps: new Set(Object.keys(allDeps)),
    currentSlateDeps,
    legacyDep: legacyDep && !legacyDepQuarantined,
  };
}

const files = scanRoots.flatMap((root) => walk(path.join(repoRoot, root)));
const ownerStats = new Map();
const hits = [];

for (const filePath of files) {
  const relativePath = rel(filePath);
  if (shouldIgnoreRelative(relativePath)) continue;

  const owner = ownerFor(relativePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const staleTypeSourceFile =
    hasLegacyTypeImportBlock(text) ||
    lines.some((line) => usesLegacyTypeSource(line));
  const ownerStat =
    ownerStats.get(owner) ??
    {
      actionableHitCount: 0,
      currentPlatejsSlateFiles: new Set(),
      currentPlatejsSlateImports: new Set(),
      files: new Set(),
      hitCount: 0,
      legacyFiles: new Set(),
      oldBareSlateFiles: new Set(),
      staleTypeFiles: new Set(),
    };

  ownerStat.files.add(relativePath);

  for (const [index, line] of lines.entries()) {
    if (owner.startsWith('packages/')) {
      currentPlatejsPackageImportRegex.lastIndex = 0;
      for (const match of line.matchAll(currentPlatejsPackageImportRegex)) {
        ownerStat.currentPlatejsSlateImports.add(match[1] ?? match[2]);
      }
    }

    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      if (!pattern.regex.test(line)) continue;

      const text = line.trim().slice(0, 240);
      const override = getHitOverride({
        file: relativePath,
        kind: pattern.name,
        text,
      });

      ownerStat.hitCount += 1;
      if (pattern.name === 'legacy-import' && isActionableOverride(override)) {
        ownerStat.actionableHitCount += 1;
        ownerStat.legacyFiles.add(relativePath);
      }
      if (
        pattern.name === 'bare-slate-import' &&
        isActionableOverride(override)
      ) {
        ownerStat.actionableHitCount += 1;
        ownerStat.oldBareSlateFiles.add(relativePath);
      }
      if (pattern.name === 'current-platejs-slate-import') {
        ownerStat.currentPlatejsSlateFiles.add(relativePath);
      }

      hits.push({
        file: relativePath,
        kind: pattern.name,
        line: index + 1,
        owner,
        reason: override?.reason ?? '',
        text,
        verdict: override?.decision ?? defaultVerdict(pattern.name),
      });
    }

    if (isStaleTypeHit(line, relativePath, staleTypeSourceFile)) {
      const text = line.trim().slice(0, 240);
      const override = getHitOverride({
        file: relativePath,
        kind: 'legacy-t-type-import',
        text,
      });

      if (isActionableOverride(override)) {
        ownerStat.actionableHitCount += 1;
        ownerStat.staleTypeFiles.add(relativePath);
      }
      ownerStat.hitCount += 1;

      hits.push({
        file: relativePath,
        kind: 'legacy-t-type-import',
        line: index + 1,
        owner,
        reason: override?.reason ?? '',
        text,
        verdict: override?.decision ?? 'actionable',
      });
    }
  }

  ownerStats.set(owner, ownerStat);
}

const ownerRows = [...ownerStats.entries()]
  .map(([owner, stat]) => {
    const pkg = readPackageJson(owner);
    const deps = dependencyState(owner);
    const legacyFileCount = stat.legacyFiles.size;
    const oldBareFileCount = stat.oldBareSlateFiles.size;
    const staleTypeFileCount = stat.staleTypeFiles.size;
    const currentFileCount = stat.currentPlatejsSlateFiles.size;
    const missingCurrentSlateDeps = slateSubstrateOwners.has(owner)
      ? []
      : [...stat.currentPlatejsSlateImports]
          .filter((dep) => !deps.allDeps.has(dep))
          .sort();
    const priorityScore =
      legacyFileCount * 100 +
      oldBareFileCount * 80 +
      staleTypeFileCount * 10 +
      (deps.legacyDep ? 50 : 0) +
      missingCurrentSlateDeps.length * 60;

    return {
      currentPlatejsSlateFiles: currentFileCount,
      currentSlateDeps: deps.currentSlateDeps.join(','),
      fileCount: stat.files.size,
      hitCount: stat.actionableHitCount,
      legacyDep: deps.legacyDep ? 'yes' : 'no',
      legacyFiles: legacyFileCount,
      oldBareSlateFiles: oldBareFileCount,
      owner,
      packageName: pkg?.name ?? '',
      priorityScore,
      proof: packageProof(owner),
      staleTypeFiles: staleTypeFileCount,
      missingCurrentSlateDeps: missingCurrentSlateDeps.join(','),
    };
  })
  .filter(
    (row) =>
      row.legacyFiles ||
      row.oldBareSlateFiles ||
      row.staleTypeFiles ||
      row.missingCurrentSlateDeps ||
      row.legacyDep === 'yes'
  )
  .sort((a, b) => b.priorityScore - a.priorityScore || a.owner.localeCompare(b.owner));

function tsvEscape(value) {
  return String(value ?? '').replaceAll('\t', ' ').replaceAll('\n', ' ');
}

function writeTsv(fileName, rows, columns) {
  const body = [
    columns.join('\t'),
    ...rows.map((row) => columns.map((column) => tsvEscape(row[column])).join('\t')),
  ].join('\n');
  fs.writeFileSync(path.join(outDir, fileName), `${body}\n`);
}

fs.mkdirSync(outDir, { recursive: true });

writeTsv('owner-inventory.tsv', ownerRows, [
  'owner',
  'packageName',
  'priorityScore',
  'legacyDep',
  'legacyFiles',
  'oldBareSlateFiles',
  'staleTypeFiles',
  'currentPlatejsSlateFiles',
  'currentSlateDeps',
  'missingCurrentSlateDeps',
  'fileCount',
  'hitCount',
  'proof',
]);

writeTsv('hit-ledger.tsv', hits, [
  'owner',
  'kind',
  'file',
  'line',
  'verdict',
  'reason',
  'text',
]);

const summary = [
  '# Plate Slate v2 Migration Inventory',
  '',
  `Generated from ${files.length} scanned files.`,
  '',
  '## Top Owners',
  '',
  '| Owner | Package | Score | Legacy files | Bare Slate files | T* files | Proof |',
  '| --- | --- | ---: | ---: | ---: | ---: | --- |',
  ...ownerRows.slice(0, 30).map(
    (row) =>
      `| \`${row.owner}\` | \`${row.packageName}\` | ${row.priorityScore} | ${row.legacyFiles} | ${row.oldBareSlateFiles} | ${row.staleTypeFiles} | \`${row.proof}\` |`
  ),
  '',
  '## Files',
  '',
  '- `owner-inventory.tsv`: package/app/doc owner summary and proof command candidates.',
  '- `hit-ledger.tsv`: exact hit rows for stale imports and migration-sensitive symbols, including classified non-actionable rows.',
  '- `hit-overrides.json`: source-backed classifications for intentional scaffolds, comparisons, or deferred owners.',
  '',
].join('\n');

fs.writeFileSync(path.join(outDir, 'summary.md'), summary);

console.log(`Scanned files: ${files.length}`);
console.log(`Owners with migration hits: ${ownerRows.length}`);
console.log(`Hits: ${hits.length}`);
console.log(
  `Missing direct current Slate deps: ${
    ownerRows.filter((row) => row.missingCurrentSlateDeps).length
  }`
);
console.log(`Top owner: ${ownerRows[0]?.owner ?? 'none'}`);
