import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactDirectory, '../../../..');
const packagesDirectory = join(root, 'packages');
const sourceExtensionPattern = /\.(?:cts|mts|ts|tsx)$/;
const testPathPattern =
  /(?:^|\/)(?:__tests__|test|tests)(?:\/|$)|\.(?:slow|spec|test)\.[^.]+$/;

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        if (['dist', 'node_modules'].includes(entry.name)) return [];

        return walk(path);
      }

      return entry.isFile() ? [path] : [];
    });

const readTsv = (path) => {
  const [headerLine, ...lines] = readFileSync(path, 'utf8').trim().split('\n');
  const headers = headerLine.split('\t');

  return lines.map((line) =>
    Object.fromEntries(
      line.split('\t').map((value, index) => [headers[index], value])
    )
  );
};

const packageDirectories = walk(packagesDirectory)
  .filter((path) => path.endsWith('/package.json'))
  .map((path) => dirname(path))
  .sort();
const sourceFiles = packageDirectories.flatMap((packageDirectory) => {
  const sourceDirectory = join(packageDirectory, 'src');

  return existsSync(sourceDirectory)
    ? walk(sourceDirectory).filter((path) => sourceExtensionPattern.test(path))
    : [];
});
const constructorRows = readTsv(join(artifactDirectory, 'plugin-manifest.tsv'));
const adaptationRows = readTsv(
  join(artifactDirectory, 'plugin-adaptation-manifest.tsv')
);
const allRows = [...constructorRows, ...adaptationRows];
const coveredOwners = new Set(allRows.map((row) => `${row.path}:${row.owner}`));
const exportedPluginSymbols = [];

for (const absolutePath of sourceFiles) {
  const path = relative(root, absolutePath);
  if (testPathPattern.test(path)) continue;

  const sourceFile = parse(readFileSync(absolutePath, 'utf8'), {
    errorRecovery: true,
    plugins: [
      'decorators-legacy',
      'explicitResourceManagement',
      ...(absolutePath.endsWith('.tsx') ? ['jsx'] : []),
      'typescript',
    ],
    sourceFilename: path,
    sourceType: 'unambiguous',
  });

  for (const statement of sourceFile.program.body) {
    if (
      statement.type !== 'ExportNamedDeclaration' ||
      statement.declaration?.type !== 'VariableDeclaration'
    ) {
      continue;
    }

    for (const declaration of statement.declaration.declarations) {
      if (
        declaration.id.type !== 'Identifier' ||
        !/^[A-Z].*Plugin(?:Base)?$/.test(declaration.id.name)
      ) {
        continue;
      }

      exportedPluginSymbols.push({
        covered: coveredOwners.has(`${path}:${declaration.id.name}`),
        line: declaration.loc.start.line,
        owner: declaration.id.name,
        path,
      });
    }
  }
}

const ids = allRows.map((row) => row.id);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const closureUnresolved = readTsv(
  join(artifactDirectory, 'plugin-source-closure-unresolved.tsv')
);
const result = {
  adaptationRows: adaptationRows.length,
  constructorRows: constructorRows.length,
  duplicateIds: [...new Set(duplicateIds)],
  exportedPluginSymbols: exportedPluginSymbols.length,
  exportedPluginSymbolsCovered: exportedPluginSymbols.filter(
    (row) => row.covered
  ).length,
  missingExportedPluginSymbols: exportedPluginSymbols.filter(
    (row) => !row.covered
  ),
  packageCount: packageDirectories.length,
  productionAdaptationRows: adaptationRows.filter(
    (row) => row.scope === 'production'
  ).length,
  productionConstructorRows: constructorRows.filter(
    (row) => row.scope === 'production'
  ).length,
  sourceFiles: sourceFiles.length,
  unresolvedClosureImports: closureUnresolved.length,
};

writeFileSync(
  join(artifactDirectory, 'manifest-verification.json'),
  `${JSON.stringify(result, null, 2)}\n`
);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

if (
  result.duplicateIds.length > 0 ||
  result.missingExportedPluginSymbols.length > 0 ||
  result.unresolvedClosureImports > 0
) {
  process.exitCode = 1;
}
