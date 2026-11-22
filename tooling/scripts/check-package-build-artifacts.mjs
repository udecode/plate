#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

import { assertNoPrivatePlateDeclarationBrands } from './check-package-declaration-brands.mjs';

const runtimeExtensionPattern = /\.(?:c|m)?js$/;
const rolldownRuntimeImportPattern =
  /import\s*\{([^}]*)\}\s*from\s*["'][^"']*\/_rolldown\/runtime\.js["']/gu;
const namespaceHelpers = new Set(['__exportAll', '__reExport']);
const namespaceMemberPattern = /\b\w+_exports\.(\w+)/gu;
const anyPluginDeclarationPattern =
  /\bdeclare\s+const\s+[A-Za-z_$][\w$]*Plugin\s*:\s*any\s*;/gu;
const incompleteReadonlyAliasPattern =
  /\btype\s+[A-Za-z_$][\w$]*(?:<[^;]+>)?\s*=\s*Readonly\s*;/gu;
const reactRuntimePackages = [
  'plitejs/react',
  'react',
  'react-compiler-runtime',
  'react-dom',
];

export function getPackageBuildArtifacts(packageJson) {
  const artifacts = new Set();
  const addArtifact = (target) => {
    if (!target || target === './package.json') return;
    if (!target.startsWith('./dist/')) {
      throw new Error(`Public build target must live in ./dist: ${target}`);
    }

    artifacts.add(target.slice(2));
  };

  for (const value of Object.values(packageJson.exports ?? {})) {
    const runtimeTargets = readRuntimeTargets(value);
    const explicitTypesTargets = readTypesTargets(value);
    const typesTargets =
      explicitTypesTargets.length > 0
        ? explicitTypesTargets
        : runtimeTargets.map(toTypesTarget);

    for (const target of [...runtimeTargets, ...typesTargets]) {
      addArtifact(target);
    }
  }

  const binTargets =
    typeof packageJson.bin === 'string'
      ? [packageJson.bin]
      : Object.values(packageJson.bin ?? {});

  binTargets.forEach(addArtifact);

  if (artifacts.size === 0) {
    throw new Error('Package has no public build artifacts.');
  }

  return [...artifacts];
}

export function assertPackageBuildArtifacts(
  packageRoot = process.cwd(),
  { knownImportCycles = [], runtimeImportBoundaries = [] } = {}
) {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, 'package.json'), 'utf-8')
  );
  const artifacts = getPackageBuildArtifacts(packageJson);
  const missing = artifacts.filter(
    (artifact) => !existsSync(join(packageRoot, artifact))
  );

  if (missing.length > 0) {
    throw new Error(`Missing public build artifacts: ${missing.join(', ')}`);
  }

  const erasedPlugins = artifacts
    .filter((artifact) => artifact.endsWith('.d.ts'))
    .flatMap((artifact) => {
      const source = readFileSync(join(packageRoot, artifact), 'utf-8');

      return [...source.matchAll(anyPluginDeclarationPattern)].map(
        (match) => `${artifact}: ${match[0]}`
      );
    });

  if (erasedPlugins.length > 0) {
    throw new Error(
      `Public plugin declarations collapsed to any:\n${erasedPlugins
        .map((entry) => `- ${entry}`)
        .join('\n')}`
    );
  }

  const incompleteReadonlyAliases = artifacts
    .filter((artifact) => artifact.endsWith('.d.ts'))
    .flatMap((artifact) => {
      const source = readFileSync(join(packageRoot, artifact), 'utf-8');

      return [...source.matchAll(incompleteReadonlyAliasPattern)].map(
        (match) => `${artifact}: ${match[0]}`
      );
    });

  if (incompleteReadonlyAliases.length > 0) {
    throw new Error(
      `Public declaration aliases lost their Readonly type arguments:\n${incompleteReadonlyAliases
        .map((entry) => `- ${entry}`)
        .join('\n')}`
    );
  }

  assertRuntimeImportBoundaries(
    packageRoot,
    packageJson,
    runtimeImportBoundaries
  );
  assertNoSynthesizedNamespaces(packageRoot);
  assertNoRuntimeImportCycles(packageRoot, knownImportCycles);

  assertNoPrivatePlateDeclarationBrands(packageRoot);
}

export function assertPackageRuntimeImportBoundaries(
  packageRoot = process.cwd(),
  { runtimeImportBoundaries = [] } = {}
) {
  const packageJson = JSON.parse(
    readFileSync(join(packageRoot, 'package.json'), 'utf-8')
  );

  assertRuntimeImportBoundaries(
    packageRoot,
    packageJson,
    runtimeImportBoundaries
  );
  assertNoSynthesizedNamespaces(packageRoot);
}

function assertNoSynthesizedNamespaces(packageRoot) {
  const distRoot = join(packageRoot, 'dist');
  if (!existsSync(distRoot)) return;

  const sources = readdirSync(distRoot, { recursive: true })
    .map((file) => file.split(sep).join('/'))
    .filter((file) => runtimeExtensionPattern.test(file))
    .map((file) => [file, readFileSync(join(distRoot, file), 'utf-8')]);
  const builders = sources.filter(([, source]) =>
    [...source.matchAll(rolldownRuntimeImportPattern)].some((match) =>
      match[1].split(',').some((name) => namespaceHelpers.has(name.trim()))
    )
  );

  if (builders.length === 0) return;

  const files = builders.map(([file]) => `dist/${file}`).join(', ');
  const reached = [
    ...new Set(
      sources.flatMap(([, source]) =>
        [...source.matchAll(namespaceMemberPattern)].map((match) => match[1])
      )
    ),
  ].sort((a, b) => a.localeCompare(b));

  throw new Error(
    `Runtime modules build namespace objects that defeat consumer tree shaking: ${files}.\nRe-export by name each value an importer reaches through \`export * from\` an external package: ${reached.join(', ')}`
  );
}

// Turbopack's scope hoisting merges modules into groups that register their
// ids one by one, so a cycle that re-enters a group through a later id runs the
// group again and splits every module-level registry in it.
function assertNoRuntimeImportCycles(packageRoot, knownImportCycles) {
  const distRoot = join(packageRoot, 'dist');
  if (!existsSync(distRoot)) return;

  const imports = new Map(
    readdirSync(distRoot, { recursive: true })
      .map((file) => file.split(sep).join('/'))
      .filter((file) => runtimeExtensionPattern.test(file))
      .map((file) => [file, getStaticLocalImports(distRoot, file)])
  );
  const cycles = findImportCycles(imports).map((files) =>
    files.map((file) => `dist/${file}`).join(', ')
  );
  const known = new Set(
    knownImportCycles.map((files) =>
      [...files].sort((a, b) => a.localeCompare(b)).join(', ')
    )
  );
  const unknown = cycles.filter((cycle) => !known.has(cycle));
  const gone = [...known].filter((cycle) => !cycles.includes(cycle));

  if (unknown.length > 0) {
    throw new Error(
      `Runtime modules import each other in a cycle, and a bundler that merges modules, such as Turbopack with scope hoisting, can then evaluate a module twice:\n${unknown
        .map((cycle) => `- ${cycle}`)
        .join(
          '\n'
        )}\nBreak each cycle, or build the package bundled, without unbundle, so each cycle stays inside one module.`
    );
  }

  if (gone.length > 0) {
    throw new Error(
      `These known import cycles are no longer in dist, so drop them from knownImportCycles:\n${gone
        .map((cycle) => `- ${cycle}`)
        .join('\n')}`
    );
  }
}

function getStaticLocalImports(distRoot, file) {
  const ast = parseRuntimeModule(
    readFileSync(join(distRoot, file), 'utf-8'),
    `dist/${file}`
  );

  return ast.program.body
    .filter(
      (node) =>
        node.type === 'ImportDeclaration' ||
        node.type === 'ExportAllDeclaration' ||
        (node.type === 'ExportNamedDeclaration' && node.source)
    )
    .map((node) => node.source.value)
    .filter((specifier) => specifier.startsWith('.'))
    .map((specifier) =>
      relative(distRoot, resolve(distRoot, dirname(file), specifier))
        .split(sep)
        .join('/')
    );
}

function findImportCycles(imports) {
  const order = new Map();
  const low = new Map();
  const stack = [];
  const onStack = new Set();
  const cycles = [];

  const visit = (file) => {
    order.set(file, order.size);
    low.set(file, order.get(file));
    stack.push(file);
    onStack.add(file);

    for (const imported of imports.get(file)) {
      if (!imports.has(imported)) continue;
      if (!order.has(imported)) {
        visit(imported);
        low.set(file, Math.min(low.get(file), low.get(imported)));
      } else if (onStack.has(imported)) {
        low.set(file, Math.min(low.get(file), order.get(imported)));
      }
    }

    if (low.get(file) !== order.get(file)) return;

    const component = [];
    let member;
    do {
      member = stack.pop();
      onStack.delete(member);
      component.push(member);
    } while (member !== file);

    if (component.length > 1 || imports.get(file).includes(file)) {
      cycles.push(component.sort((a, b) => a.localeCompare(b)));
    }
  };

  for (const file of imports.keys()) {
    if (!order.has(file)) visit(file);
  }

  return cycles;
}

export function getPackageRuntimeImportBoundaries(packageJson) {
  const packageExports = packageJson?.exports;

  if (
    !packageExports ||
    typeof packageExports !== 'object' ||
    Array.isArray(packageExports) ||
    !Object.hasOwn(packageExports, '.') ||
    !Object.hasOwn(packageExports, './react')
  ) {
    return [];
  }

  return [...new Set(readRuntimeTargets(packageExports['.']))]
    .filter((target) => runtimeExtensionPattern.test(target))
    .map((target) => ({
      entry: target.startsWith('./') ? target.slice(2) : target,
      forbiddenPackages: [...reactRuntimePackages],
    }));
}

function assertRuntimeImportBoundaries(
  packageRoot,
  packageJson,
  runtimeImportBoundaries
) {
  for (const boundary of [
    ...getPackageRuntimeImportBoundaries(packageJson),
    ...runtimeImportBoundaries,
  ]) {
    assertRuntimeImportBoundary(packageRoot, boundary);
  }
}

function assertRuntimeImportBoundary(
  packageRoot,
  { entry, forbiddenPackages }
) {
  const entryPath = resolve(packageRoot, entry);
  const entryRelativePath = toPackagePath(packageRoot, entryPath);
  const visited = new Set();

  if (isOutsidePackage(entryRelativePath)) {
    throw new Error(`Runtime import boundary entry escapes package: ${entry}`);
  }

  const visit = (filePath, trace) => {
    if (visited.has(filePath)) return;
    visited.add(filePath);

    if (!existsSync(filePath)) {
      throw new Error(
        `Runtime import boundary missing local import from ${entryRelativePath}: ${trace.join(' -> ')}`
      );
    }

    const source = readFileSync(filePath, 'utf-8');

    for (const specifier of getRuntimeImportSpecifiers(source, trace.at(-1))) {
      if (
        forbiddenPackages.some(
          (packageName) =>
            specifier === packageName || specifier.startsWith(`${packageName}/`)
        )
      ) {
        throw new Error(
          `Runtime import boundary violation from ${entryRelativePath}: ${[...trace, specifier].join(' -> ')}`
        );
      }
      if (!specifier.startsWith('.')) continue;

      const importedPath = resolve(dirname(filePath), specifier);
      const importedRelativePath = toPackagePath(packageRoot, importedPath);

      if (isOutsidePackage(importedRelativePath)) {
        throw new Error(
          `Runtime import boundary local import escapes package from ${entryRelativePath}: ${[...trace, specifier].join(' -> ')}`
        );
      }

      visit(importedPath, [...trace, importedRelativePath]);
    }
  };

  visit(entryPath, [entryRelativePath]);
}

function parseRuntimeModule(source, filePath) {
  try {
    return parse(source, {
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      errorRecovery: false,
      plugins: ['explicitResourceManagement', 'importAttributes'],
      sourceType: 'unambiguous',
    });
  } catch (error) {
    throw new Error(
      `Could not parse runtime module ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
}

function getRuntimeImportSpecifiers(source, filePath) {
  const ast = parseRuntimeModule(source, filePath);
  const specifiers = new Set();
  const addSpecifier = (node) => {
    if (node?.type === 'StringLiteral') {
      specifiers.add(node.value);
    } else if (
      node?.type === 'TemplateLiteral' &&
      node.expressions.length === 0
    ) {
      specifiers.add(node.quasis[0].value.cooked ?? node.quasis[0].value.raw);
    }
  };
  const visitNode = (node) => {
    switch (node.type) {
      case 'ExportAllDeclaration':
      case 'ExportNamedDeclaration':
      case 'ImportDeclaration': {
        addSpecifier(node.source);
        break;
      }
      case 'ImportExpression': {
        addSpecifier(node.source);
        break;
      }
      case 'CallExpression': {
        if (
          node.callee.type === 'Import' ||
          (node.callee.type === 'Identifier' && node.callee.name === 'require')
        ) {
          addSpecifier(node.arguments[0]);
        }
        break;
      }
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value) {
          if (child && typeof child.type === 'string') visitNode(child);
        }
      } else if (value && typeof value.type === 'string') {
        visitNode(value);
      }
    }
  };

  visitNode(ast);

  return specifiers;
}

const toPackagePath = (packageRoot, filePath) =>
  relative(packageRoot, filePath).split(sep).join('/');

const isOutsidePackage = (filePath) =>
  filePath === '..' || filePath.startsWith('../') || isAbsolute(filePath);

function readRuntimeTargets(value) {
  if (typeof value === 'string') {
    return runtimeExtensionPattern.test(value) || value.endsWith('.css')
      ? [value]
      : [];
  }
  if (!value || typeof value !== 'object') return [];

  return Object.values(value).flatMap(readRuntimeTargets);
}

function readTypesTargets(value) {
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    key === 'types' && typeof nestedValue === 'string'
      ? [nestedValue]
      : readTypesTargets(nestedValue)
  );
}

const toTypesTarget = (runtimeTarget) =>
  runtimeExtensionPattern.test(runtimeTarget)
    ? runtimeTarget.replace(runtimeExtensionPattern, '.d.ts')
    : null;

function isMainModule() {
  const entrypoint = process.argv[1];

  return !!entrypoint && resolve(entrypoint) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    assertPackageBuildArtifacts(resolve(process.argv[2] ?? '.'));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
