import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { parse } from '@babel/parser';

const root = process.cwd();
const output = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const manifest = JSON.parse(
  readFileSync(`${output}/local-architecture-manifest.json`, 'utf8')
);
const packages = JSON.parse(
  readFileSync(`${output}/package-contract-inventory.json`, 'utf8')
);
const owners = new Map(manifest.units.map((unit) => [unit.path, unit.lane]));
const cache = new Map();
const unresolved = [];
const resolveFile = (file) => {
  const base = file.replace(/\.[cm]?jsx?$/, '');
  return [
    file,
    ...['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs'].map(
      (ext) => `${base}${ext}`
    ),
    ...['/index.ts', '/index.tsx', '/index.js'].map((ext) => `${base}${ext}`),
  ].find(
    (candidate) => existsSync(candidate) && /\.[cm]?[jt]sx?$/.test(candidate)
  );
};
const entrySource = (pkg, entrypoint) => {
  const target = pkg.exports[entrypoint];
  if (entrypoint === './package.json') return resolve(pkg.path);
  const value =
    typeof target === 'string' ? target : (target.import ?? target.default);
  if (value?.endsWith('.css')) return resolve(dirname(pkg.path), value);
  return (
    value &&
    resolveFile(resolve(dirname(pkg.path), value.replace('/dist/', '/src/')))
  );
};
const publicEntries = packages.flatMap((pkg) =>
  Object.keys(pkg.exports).map((entrypoint) => ({
    package: pkg.name,
    entrypoint,
    source: entrySource(pkg, entrypoint),
  }))
);
const resolveImport = (importer, specifier) => {
  if (specifier.startsWith('.'))
    return resolveFile(resolve(dirname(importer), specifier));
  for (const pkg of packages) {
    if (specifier === pkg.name || specifier.startsWith(`${pkg.name}/`)) {
      return entrySource(
        pkg,
        specifier === pkg.name ? '.' : `.${specifier.slice(pkg.name.length)}`
      );
    }
  }
  return null;
};
const readModule = (absolute) => {
  if (cache.has(absolute)) return cache.get(absolute);
  const file = relative(root, absolute);
  const source = readFileSync(absolute, 'utf8');
  const ast = parse(source, {
    sourceType: 'unambiguous',
    plugins: [
      'typescript',
      ...(absolute.endsWith('x') ? ['jsx'] : []),
      'decorators-legacy',
    ],
  });
  const result = {
    file,
    lane: owners.get(file) ?? null,
    sha256: createHash('sha256').update(source).digest('hex'),
    exports: [],
    imports: [],
    actionSites: [],
    lifecycleSites: [],
  };
  cache.set(absolute, result);
  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration')
      result.imports.push({
        line: node.loc.start.line,
        specifier: node.source.value,
        typeOnly: node.importKind === 'type',
        localNames: node.specifiers.map((item) => item.local.name),
      });
    if (node.type.startsWith('Export'))
      result.exports.push({
        line: node.loc.start.line,
        kind: node.type,
        typeOnly: node.exportKind === 'type',
        source: node.source?.value ?? null,
        names:
          node.specifiers?.map(
            (item) => item.exported?.name ?? item.exported?.value ?? '*'
          ) ??
          (node.declaration?.id
            ? [node.declaration.id.name]
            : (node.declaration?.declarations?.flatMap((item) =>
                item.id.name ? [item.id.name] : ['<destructured>']
              ) ?? ['default'])),
      });
  }
  const lines = source.split('\n');
  lines.forEach((line, index) => {
    if (
      /\b(?:editor|tx)\.(?:api|commands|update|selection|insert|remove|history|block|text|marks|nodes)\b|\b(?:api|update|shortcuts|onKeyDown|onPointerDown|onClick|onSelect)\s*[:=(]/.test(
        line
      )
    )
      result.actionSites.push({ line: index + 1, text: line.trim() });
    if (
      /\b(?:dispose|destroy|cleanup|unsubscribe|abort|removeEventListener|WeakMap|WeakSet|useEffect|useLayoutEffect|subscribe|onCommit|reconfigure)\b/.test(
        line
      )
    )
      result.lifecycleSites.push({ line: index + 1, text: line.trim() });
  });
  return result;
};
const visitExports = (absolute, visited = new Set()) => {
  if (!absolute || /\.(?:json|css)$/.test(absolute) || visited.has(absolute))
    return visited;
  visited.add(absolute);
  const unit = readModule(absolute);
  for (const edge of unit.exports.filter((edge) => edge.source)) {
    const target = resolveImport(absolute, edge.source);
    if (target) visitExports(target, visited);
    else if (edge.source.startsWith('.'))
      unresolved.push({
        file: unit.file,
        line: edge.line,
        specifier: edge.source,
      });
  }
  return visited;
};
const entries = publicEntries.map((entry) => {
  if (!entry.source)
    throw new Error(
      `Missing public source for ${entry.package}${entry.entrypoint}`
    );
  const files = [...visitExports(entry.source)].map((file) =>
    relative(root, file)
  );
  return {
    ...entry,
    source: relative(root, entry.source),
    reexportFiles: files,
    owners: [...new Set(files.map((file) => owners.get(file)).filter(Boolean))],
    status:
      'source reexport reachability; import graph, runtime side effects and packed output are separate proof facets',
  };
});
for (const unit of manifest.units) {
  if (
    /\.[cm]?[jt]sx?$/.test(unit.path) &&
    ['implementation', 'consumer'].includes(unit.role) &&
    !/\.d\.[cm]?ts$/.test(unit.path)
  )
    readModule(resolve(unit.path));
}
const modules = [...cache.values()];
const result = {
  capturedAt: new Date().toISOString(),
  method:
    'AST public export graph plus literal action and lifecycle source index. Action sites are candidates for semantic operation classification, not independent human operations. External dependencies remain named edges. No packed/runtime proof is inferred.',
  entryCount: entries.length,
  moduleCount: modules.length,
  unresolvedLocalReexports: unresolved,
  entries,
  modules,
};
writeFileSync(
  `${output}/public-contract-traces.json`,
  `${JSON.stringify(result, null, 2)}\n`
);
console.log(
  JSON.stringify({
    entries: entries.length,
    modules: modules.length,
    unresolved: unresolved.length,
    actionSites: modules.reduce(
      (count, module) => count + module.actionSites.length,
      0
    ),
    lifecycleSites: modules.reduce(
      (count, module) => count + module.lifecycleSites.length,
      0
    ),
  })
);
if (unresolved.length) process.exitCode = 1;
