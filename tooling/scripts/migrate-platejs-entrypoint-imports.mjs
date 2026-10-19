#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { parse } from '@babel/parser';

import {
  publicFeatureDependencies,
  publicFeatureReactEntrypoints,
  publicReactOnlyEntrypoints,
} from '../entrypoints/entrypoint-dag.mjs';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const write = process.argv.includes('--write');
const sourceExtensions = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);
const documentationExtensions = new Set(['.md', '.mdx']);

const resolveLocalModule = (filename, specifier) => {
  const target = path.resolve(path.dirname(filename), specifier);
  const candidates = [
    target,
    ...[...sourceExtensions].map((extension) => `${target}${extension}`),
    ...[...sourceExtensions].map((extension) =>
      path.join(target, `index${extension}`)
    ),
  ];

  return candidates.find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()
  );
};

const declarationNames = (declaration) => {
  if (!declaration) return [];
  if (declaration.type === 'VariableDeclaration') {
    return declaration.declarations.flatMap(({ id }) =>
      id.type === 'Identifier' ? [id.name] : []
    );
  }

  return declaration.id?.type === 'Identifier' ? [declaration.id.name] : [];
};

const exportName = (node) =>
  node?.type === 'Identifier' || node?.type === 'StringLiteral'
    ? (node.name ?? node.value)
    : undefined;

const exportCache = new Map();
const collectExports = (filename, stack = new Set()) => {
  if (exportCache.has(filename)) return exportCache.get(filename);
  if (stack.has(filename)) return new Set();

  const nextStack = new Set(stack).add(filename);
  const source = fs.readFileSync(filename, 'utf-8');
  const { program } = parse(source, {
    plugins: ['jsx', 'typescript'],
    sourceType: 'module',
  });
  const names = new Set();

  for (const statement of program.body) {
    if (statement.type === 'ExportAllDeclaration') {
      if (!statement.source.value.startsWith('.')) continue;

      const target = resolveLocalModule(filename, statement.source.value);
      if (!target) {
        throw new Error(
          `Cannot resolve ${statement.source.value} from ${filename}`
        );
      }
      for (const name of collectExports(target, nextStack)) names.add(name);
      continue;
    }
    if (statement.type !== 'ExportNamedDeclaration') continue;

    for (const name of declarationNames(statement.declaration)) names.add(name);
    for (const specifier of statement.specifiers) {
      const name = exportName(specifier.exported);
      if (name) names.add(name);
    }
  }

  exportCache.set(filename, names);
  return names;
};

const entrypointIndex = (kind, name) =>
  path.join(
    repoRoot,
    'packages/platejs/src',
    kind === 'headless' ? 'features' : 'react/features',
    name,
    'index.ts'
  );

const addOwner = (owners, symbol, specifier) => {
  const previous = owners.get(symbol);
  if (previous && previous !== specifier) {
    throw new Error(
      `Public symbol ${symbol} is owned by both ${previous} and ${specifier}`
    );
  }
  owners.set(symbol, specifier);
};

const headlessOwners = new Map();
for (const name of Object.keys(publicFeatureDependencies)) {
  for (const symbol of collectExports(entrypointIndex('headless', name))) {
    addOwner(headlessOwners, symbol, `platejs/${name}`);
  }
}

const reactOwners = new Map(headlessOwners);
for (const name of [
  ...publicFeatureReactEntrypoints,
  ...publicReactOnlyEntrypoints,
]) {
  for (const symbol of collectExports(entrypointIndex('react', name))) {
    addOwner(reactOwners, symbol, `platejs/${name}/react`);
  }
}

const assertRootDoesNotOwnFeatureSymbols = ({
  filename,
  owners,
  specifier,
}) => {
  const rootExports = collectExports(filename);
  const duplicates = [...owners]
    .filter(([symbol]) => rootExports.has(symbol))
    .map(([symbol, owner]) => `${symbol} (${owner})`)
    .sort((left, right) => left.localeCompare(right));

  if (duplicates.length > 0) {
    throw new Error(
      `${specifier} duplicates feature-owned exports:\n${duplicates.join('\n')}`
    );
  }
};

assertRootDoesNotOwnFeatureSymbols({
  filename: path.join(repoRoot, 'packages/platejs/src/root.tsx'),
  owners: headlessOwners,
  specifier: 'platejs',
});
assertRootDoesNotOwnFeatureSymbols({
  filename: path.join(repoRoot, 'packages/platejs/src/react/index.tsx'),
  owners: reactOwners,
  specifier: 'platejs/react',
});

if (process.argv.includes('--update-api-config')) {
  const configPath = path.join(repoRoot, 'apps/www/api-reference.config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const platePackage = config.packages.find(({ name }) => name === 'platejs');
  const rootDecision = platePackage?.entrypoints?.['.'];

  if (!rootDecision) {
    throw new Error(
      'Plate API reference config must define the root entrypoint.'
    );
  }

  const decisions = new Map(
    Object.keys(publicFeatureDependencies).map((name) => [
      `./${name}`,
      {
        exclude: [],
        excludeReason: rootDecision.excludeReason,
        include: {},
      },
    ])
  );
  rootDecision.exclude = rootDecision.exclude.filter((symbol) => {
    const owner = headlessOwners.get(symbol);
    if (!owner) return true;

    decisions.get(`./${owner.slice('platejs/'.length)}`).exclude.push(symbol);
    return false;
  });
  for (const [symbol, route] of Object.entries(rootDecision.include)) {
    const owner = headlessOwners.get(symbol);
    if (!owner) continue;

    decisions.get(`./${owner.slice('platejs/'.length)}`).include[symbol] =
      route;
    delete rootDecision.include[symbol];
  }
  for (const decision of decisions.values()) {
    decision.exclude.sort((left, right) => left.localeCompare(right));
    decision.include = Object.fromEntries(
      Object.entries(decision.include).sort(([left], [right]) =>
        left.localeCompare(right)
      )
    );
  }

  platePackage.entrypoints = Object.fromEntries([
    ['.', rootDecision],
    ...[...decisions].sort(([left], [right]) => left.localeCompare(right)),
  ]);
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log('Moved Plate API decisions to canonical feature entrypoints.');
  process.exit(0);
}

const renderImport = (node, specifiers, moduleSpecifier, source) => {
  const typePrefix = node.importKind === 'type' ? ' type' : '';
  const defaultSpecifier = specifiers.find(
    ({ type }) => type === 'ImportDefaultSpecifier'
  );
  const namespaceSpecifier = specifiers.find(
    ({ type }) => type === 'ImportNamespaceSpecifier'
  );
  const namedSpecifiers = specifiers.filter(
    ({ type }) => type === 'ImportSpecifier'
  );
  const parts = [];

  if (defaultSpecifier) {
    parts.push(source.slice(defaultSpecifier.start, defaultSpecifier.end));
  }
  if (namespaceSpecifier) {
    parts.push(source.slice(namespaceSpecifier.start, namespaceSpecifier.end));
  }
  if (namedSpecifiers.length > 0) {
    parts.push(
      `{ ${namedSpecifiers.map((item) => source.slice(item.start, item.end)).join(', ')} }`
    );
  }

  return `import${typePrefix} ${parts.join(', ')} from '${moduleSpecifier}';`;
};

const renderExport = (node, specifiers, moduleSpecifier, source) => {
  const typePrefix = node.exportKind === 'type' ? ' type' : '';
  return `export${typePrefix} { ${specifiers
    .map((item) => source.slice(item.start, item.end))
    .join(', ')} } from '${moduleSpecifier}';`;
};

const rewriteModuleDeclaration = (node, source) => {
  const moduleSpecifier = node.source?.value;
  if (!['platejs', 'platejs/react'].includes(moduleSpecifier)) return null;

  const owners = moduleSpecifier === 'platejs' ? headlessOwners : reactOwners;
  const namedType =
    node.type === 'ImportDeclaration' ? 'ImportSpecifier' : 'ExportSpecifier';
  const movable = node.specifiers.filter(({ type }) => type === namedType);
  const groups = new Map();
  const remaining = node.specifiers.filter(({ type }) => type !== namedType);

  for (const specifier of movable) {
    const imported = exportName(
      node.type === 'ImportDeclaration' ? specifier.imported : specifier.local
    );
    const owner = owners.get(imported);

    if (!owner) {
      remaining.push(specifier);
      continue;
    }
    const group = groups.get(owner) ?? [];
    group.push(specifier);
    groups.set(owner, group);
  }

  if (groups.size === 0) return null;

  const render =
    node.type === 'ImportDeclaration' ? renderImport : renderExport;
  const statements = [];
  if (remaining.length > 0) {
    statements.push(render(node, remaining, moduleSpecifier, source));
  }
  for (const [owner, specifiers] of [...groups].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    statements.push(render(node, specifiers, owner, source));
  }

  return statements.join('\n');
};

const listResult = spawnSync(
  'rg',
  [
    '--files',
    '-g',
    '*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}',
    '-g',
    '*.{md,mdx}',
    '-g',
    '!**/node_modules/**',
    '-g',
    '!**/dist/**',
    '-g',
    '!**/.next/**',
    '-g',
    '!**/.turbo/**',
    '-g',
    '!apps/www/public/r/**',
    '-g',
    '!templates/**',
    'apps',
    'content',
    'packages',
    'tooling',
  ],
  { cwd: repoRoot, encoding: 'utf-8' }
);
if (listResult.status !== 0 && listResult.status !== 1) {
  throw new Error(listResult.stderr);
}

const changed = [];
for (const relativeFilename of listResult.stdout
  .trim()
  .split('\n')
  .filter(Boolean)) {
  const filename = path.join(repoRoot, relativeFilename);
  const extension = path.extname(filename);
  if (
    !sourceExtensions.has(extension) &&
    !documentationExtensions.has(extension)
  ) {
    continue;
  }

  const source = fs.readFileSync(filename, 'utf-8');
  if (!source.includes("from 'platejs") && !source.includes('from "platejs')) {
    continue;
  }
  if (documentationExtensions.has(extension)) {
    const importPattern =
      /(?:import|export)\s+(?:type\s+)?(?:[$\w]+\s*,\s*)?\{[^}]*\}\s+from\s+(['"])platejs(?:\/react)?\1\s*;?/gu;
    const replacements = [...source.matchAll(importPattern)]
      .map((match) => {
        const statement = parse(match[0], {
          plugins: ['jsx', 'typescript'],
          sourceType: 'module',
        }).program.body[0];
        const replacement = rewriteModuleDeclaration(statement, match[0]);

        return replacement === null
          ? null
          : {
              end: match.index + match[0].length,
              replacement,
              start: match.index,
            };
      })
      .filter(Boolean)
      .sort((left, right) => right.start - left.start);
    if (replacements.length === 0) continue;

    let next = source;
    for (const { end, replacement, start } of replacements) {
      next = `${next.slice(0, start)}${replacement}${next.slice(end)}`;
    }
    changed.push(relativeFilename);
    if (write) fs.writeFileSync(filename, next);
    continue;
  }

  let program;
  try {
    ({ program } = parse(source, {
      errorRecovery: false,
      plugins: ['jsx', 'typescript'],
      sourceType: 'unambiguous',
    }));
  } catch (error) {
    throw new Error(`Cannot parse ${relativeFilename}: ${error.message}`, {
      cause: error,
    });
  }

  const replacements = program.body
    .filter(
      (node) =>
        node.type === 'ImportDeclaration' ||
        (node.type === 'ExportNamedDeclaration' && node.source)
    )
    .map((node) => ({
      node,
      replacement: rewriteModuleDeclaration(node, source),
    }))
    .filter(({ replacement }) => replacement !== null)
    .sort((left, right) => right.node.start - left.node.start);
  if (replacements.length === 0) continue;

  let next = source;
  for (const { node, replacement } of replacements) {
    next = `${next.slice(0, node.start)}${replacement}${next.slice(node.end)}`;
  }
  changed.push(relativeFilename);
  if (write) fs.writeFileSync(filename, next);
}

if (!write && changed.length > 0) {
  console.error(changed.join('\n'));
  console.error(
    `${changed.length} files import moved Plate symbols from a root entrypoint.`
  );
  process.exit(1);
}

console.log(
  write
    ? `Migrated ${changed.length} files to canonical Plate feature entrypoints.`
    : 'Plate root imports use canonical entrypoint owners.'
);
