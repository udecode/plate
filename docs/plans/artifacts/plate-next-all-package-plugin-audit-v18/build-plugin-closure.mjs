import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactDirectory, '../../../..');
const sourceExtensions = ['.ts', '.tsx', '.mts', '.cts'];
const testPathPattern =
  /(?:^|\/)(?:__tests__|test|tests)(?:\/|$)|\.(?:slow|spec|test)\.[^.]+$/;

const escapeCell = (value) =>
  String(value ?? '')
    .replaceAll('\t', ' ')
    .replaceAll('\r', ' ')
    .replaceAll('\n', ' ');

const writeTsv = (path, headers, rows) => {
  const lines = [
    headers.join('\t'),
    ...rows.map((row) =>
      headers.map((header) => escapeCell(row[header])).join('\t')
    ),
  ];

  writeFileSync(path, `${lines.join('\n')}\n`);
};

const readTsv = (path) => {
  const [headerLine, ...lines] = readFileSync(path, 'utf8').trim().split('\n');
  const headers = headerLine.split('\t');

  return lines.map((line) =>
    Object.fromEntries(
      line.split('\t').map((value, index) => [headers[index], value])
    )
  );
};

const resolveRelativeSource = (fromPath, specifier) => {
  const base = resolve(root, dirname(fromPath), specifier);
  const candidates = sourceExtensions.includes(extname(base))
    ? [base]
    : [
        ...sourceExtensions.map((extension) => `${base}${extension}`),
        ...sourceExtensions.map((extension) => join(base, `index${extension}`)),
      ];

  return candidates.find((candidate) => existsSync(candidate));
};

const manifestRows = [
  ...readTsv(join(artifactDirectory, 'plugin-manifest.tsv')),
  ...readTsv(join(artifactDirectory, 'plugin-adaptation-manifest.tsv')),
].filter((row) => row.scope === 'production');
const rootPaths = new Map();

for (const row of manifestRows) {
  const roots = rootPaths.get(row.path) ?? new Set();
  roots.add(row.owner);
  rootPaths.set(row.path, roots);
}

const importCache = new Map();
const getRelativeDependencies = (path) => {
  if (importCache.has(path)) return importCache.get(path);

  const absolutePath = resolve(root, path);
  const sourceText = readFileSync(absolutePath, 'utf8');
  const sourceFile = parse(sourceText, {
    errorRecovery: true,
    plugins: [
      'decorators-legacy',
      'explicitResourceManagement',
      ...(path.endsWith('.tsx') ? ['jsx'] : []),
      'typescript',
    ],
    sourceFilename: path,
    sourceType: 'unambiguous',
  });
  const dependencies = [];

  for (const statement of sourceFile.program.body) {
    if (
      ![
        'ExportAllDeclaration',
        'ExportNamedDeclaration',
        'ImportDeclaration',
      ].includes(statement.type)
    ) {
      continue;
    }

    const specifier = statement.source?.value;
    if (typeof specifier !== 'string' || !specifier.startsWith('.')) continue;

    const dependency = resolveRelativeSource(path, specifier);
    if (!dependency) {
      dependencies.push({
        line: statement.loc.start.line,
        path: '',
        specifier,
      });
      continue;
    }

    const dependencyPath = relative(root, dependency);
    if (testPathPattern.test(dependencyPath)) continue;

    dependencies.push({
      line: statement.loc.start.line,
      path: dependencyPath,
      specifier,
    });
  }

  importCache.set(path, dependencies);

  return dependencies;
};

const closure = new Map();
const unresolvedRows = [];
const queue = [...rootPaths].map(([path, owners]) => ({
  depth: 0,
  importedBy: '<root>',
  owners,
  path,
}));

while (queue.length > 0) {
  const current = queue.shift();
  const prior = closure.get(current.path);

  if (prior && prior.depth <= current.depth) {
    for (const owner of current.owners) prior.owners.add(owner);
    prior.importedBy.add(current.importedBy);
    continue;
  }

  const entry = prior ?? {
    depth: current.depth,
    importedBy: new Set(),
    owners: new Set(),
    path: current.path,
  };
  entry.depth = Math.min(entry.depth, current.depth);
  entry.importedBy.add(current.importedBy);
  for (const owner of current.owners) entry.owners.add(owner);
  closure.set(current.path, entry);

  for (const dependency of getRelativeDependencies(current.path)) {
    if (!dependency.path) {
      unresolvedRows.push({
        importer: current.path,
        line: dependency.line,
        specifier: dependency.specifier,
      });
      continue;
    }

    queue.push({
      depth: current.depth + 1,
      importedBy: current.path,
      owners: current.owners,
      path: dependency.path,
    });
  }
}

const closureRows = [...closure.values()]
  .map((entry) => ({
    depth: entry.depth,
    imported_by: [...entry.importedBy].sort().join(','),
    owners: [...entry.owners].sort().join(','),
    package: entry.path.split('/')[1],
    path: entry.path,
  }))
  .sort((left, right) => left.path.localeCompare(right.path));

writeTsv(
  join(artifactDirectory, 'plugin-source-closure.tsv'),
  ['package', 'path', 'depth', 'owners', 'imported_by'],
  closureRows
);
writeTsv(
  join(artifactDirectory, 'plugin-source-closure-unresolved.tsv'),
  ['importer', 'line', 'specifier'],
  unresolvedRows
);

process.stdout.write(
  `${JSON.stringify(
    {
      closureFiles: closureRows.length,
      ownerFiles: rootPaths.size,
      unresolvedRelativeImports: unresolvedRows.length,
    },
    null,
    2
  )}\n`
);
