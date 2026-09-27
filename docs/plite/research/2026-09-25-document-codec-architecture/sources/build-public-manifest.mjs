import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../../../..');
const output = join(dirname(import.meta.dirname), 'api-manifest.tsv');
const require = createRequire(import.meta.url);
const pnpmRoot = join(root, 'node_modules/.pnpm');
const compilerPackage = readdirSync(pnpmRoot).find((name) =>
  existsSync(join(pnpmRoot, name, 'node_modules/typescript/lib/typescript.js'))
);
if (!compilerPackage) throw new Error('TypeScript compiler API not found');
const ts = require(
  join(pnpmRoot, compilerPackage, 'node_modules/typescript/lib/typescript.js')
);
const namePattern =
  /codec|serializ|deserializ|\bimport|\bexport|parse|stringify|decode|encode|assert|validate|\bfit|migrat|\bread|\bwrite/i;

const configPath = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
if (!configPath) throw new Error('tsconfig.json not found');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  dirname(configPath),
  { noEmit: true },
  configPath
);
const sourceCandidate = (packageRoot, typesPath) => {
  const stem = typesPath
    .replace(/^\.\/dist\//, '')
    .replace(/\.d\.[cm]?ts$/, '')
    .replace(/\.d\.tsx$/, '');
  const base = join(packageRoot, 'src', stem);
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.mts`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
  ];
  return candidates.find(existsSync) ?? null;
};

const entrypoints = [];
for (const packageName of ['plitejs', 'platejs']) {
  const packageRoot = join(root, 'packages', packageName);
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
  for (const [subpath, definition] of Object.entries(manifest.exports)) {
    if (subpath === './package.json' || typeof definition === 'string') continue;
    const source = sourceCandidate(packageRoot, definition.types);
    if (!source) {
      if (/\.css\.d\.[cm]?ts$/.test(definition.types)) continue;
      throw new Error(`${packageName}${subpath}: source entry not found for ${definition.types}`);
    }
    entrypoints.push({ entrypoint: `${packageName}${subpath === '.' ? '' : subpath.slice(1)}`, source });
  }
}

const program = ts.createProgram(
  entrypoints.map(({ source }) => source),
  {
    ...parsed.options,
    noEmit: true,
    skipLibCheck: true,
  }
);
const checker = program.getTypeChecker();

const declarationLocation = (symbol) => {
  const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  const declaration = target.declarations?.[0] ?? symbol.declarations?.[0];
  if (!declaration) return { file: 'unknown', line: 0, target };
  const sourceFile = declaration.getSourceFile();
  return {
    file: relative(root, sourceFile.fileName),
    line: sourceFile.getLineAndCharacterOfPosition(declaration.getStart()).line + 1,
    target,
  };
};

const rows = [];
for (const { entrypoint, source } of entrypoints) {
  const sourceFile = program.getSourceFile(source);
  if (!sourceFile) throw new Error(`${entrypoint}: ${source} missing from program`);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) throw new Error(`${entrypoint}: module symbol missing`);
  for (const exported of checker.getExportsOfModule(moduleSymbol)) {
    const name = exported.getName();
    const { file, line, target } = declarationLocation(exported);
    if (namePattern.test(name)) {
      rows.push({ entrypoint, file, kind: 'export', line, member: '', name });
    }
    let type;
    try {
      type = checker.getDeclaredTypeOfSymbol(target);
    } catch {
      continue;
    }
    for (const property of checker.getPropertiesOfType(type)) {
      const member = property.getName();
      if (!namePattern.test(member)) continue;
      const location = declarationLocation(property);
      rows.push({
        entrypoint,
        file: location.file === 'unknown' ? file : location.file,
        kind: 'member',
        line: location.line || line,
        member,
        name,
      });
    }
  }
}

const unique = new Map();
for (const row of rows) {
  unique.set(
    [row.entrypoint, row.name, row.member, row.file, row.line].join('\0'),
    row
  );
}
const sorted = [...unique.values()].sort((left, right) =>
  [left.entrypoint, left.name, left.member, left.file, left.line]
    .join('\0')
    .localeCompare(
      [right.entrypoint, right.name, right.member, right.file, right.line].join('\0')
    )
);
const escape = (value) => String(value).replaceAll('\t', ' ').replaceAll('\n', ' ');
const header = ['entrypoint', 'symbol', 'member', 'kind', 'source', 'line'];
writeFileSync(
  output,
  `${header.join('\t')}\n${sorted
    .map((row) =>
      [row.entrypoint, row.name, row.member, row.kind, row.file, row.line]
        .map(escape)
        .join('\t')
    )
    .join('\n')}\n`
);
console.log(JSON.stringify({ entrypoints: entrypoints.length, output: relative(root, output), rows: sorted.length }));
