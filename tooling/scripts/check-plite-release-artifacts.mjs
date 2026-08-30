#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { builtinModules } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

import {
  entrypointDags,
  getPublicEntrypointRuntimeRows,
  publicFeatureDependencies,
  publicFeatureReactEntrypoints,
  publicReactOnlyEntrypoints,
  resolvePublicEntrypoint,
} from '../entrypoints/entrypoint-dag.mjs';
import { createSsrRuntimeProofSource } from '../entrypoints/entrypoint-runtime.mjs';

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, '..', '..');
const plateEntrypointSizeBaselinePath = join(
  repoRoot,
  'tooling/entrypoints/platejs-entrypoint-sizes.json'
);
const temporaryRoot = join(repoRoot, '.tmp');
const localImportPattern =
  /\b(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const namedExportBlockPattern = /\bexport\s*\{([^}]*)\}/g;
const directNamedExportPattern =
  /\bexport\s+(?:async\s+)?(?:const|function|class|let|var)\s+([A-Za-z_$][\w$]*)/g;
const diagnosticStartPattern = /^(?:(.+?)\(\d+,\d+\): )?error TS\d+:/;
const identifierPattern = /^[A-Za-z_$][\w$]*$/;
const javascriptExtensionPattern = /\.(?:c|m)?js$/;
const leadingDotSlashPattern = /^\.\//;
const exportAliasPattern = /\s+as\s+/;
const builtins = new Set([
  ...builtinModules,
  ...builtinModules.map((name) => `node:${name}`),
]);
const isFile = (filePath) =>
  existsSync(filePath) && statSync(filePath).isFile();

export const PLITE_RELEASE_PACKAGES = [
  {
    allowedPlateRuntime: [],
    directory: 'packages/plitejs',
    name: 'plitejs',
  },
  {
    allowedPlateRuntime: ['platejs'],
    directory: 'packages/test',
    name: '@platejs/test',
  },
  {
    allowedPlateRuntime: ['platejs'],
    directory: 'packages/cli',
    name: '@platejs/cli',
  },
  {
    allowedPlateRuntime: ['plitejs'],
    directory: 'packages/platejs',
    name: 'platejs',
  },
];

const PLITE_PACKAGE_BOUNDARY_NAMES = new Set(['plitejs', 'platejs']);

export const getPlitePackageBoundaryContracts = () =>
  PLITE_RELEASE_PACKAGES.filter(({ name }) =>
    PLITE_PACKAGE_BOUNDARY_NAMES.has(name)
  );

export const getPlateEntrypointSizeSpecifiers = () => [
  'platejs',
  ...Object.keys(publicFeatureDependencies).map((name) => `platejs/${name}`),
  ...publicFeatureReactEntrypoints.map((name) => `platejs/${name}/react`),
  ...publicReactOnlyEntrypoints.map((name) => `platejs/${name}/react`),
];

export function assertPlateEntrypointSizes(actual, expected) {
  const actualSpecifiers = Object.keys(actual).sort(compareStrings);
  const expectedSpecifiers = Object.keys(expected).sort(compareStrings);

  if (JSON.stringify(actualSpecifiers) !== JSON.stringify(expectedSpecifiers)) {
    throw new Error(
      `Plate entrypoint size snapshot keys differ. Expected ${expectedSpecifiers.join(', ')}; received ${actualSpecifiers.join(', ')}.`
    );
  }

  const changes = actualSpecifiers
    .filter((specifier) => actual[specifier] !== expected[specifier])
    .map((specifier) => {
      const delta = actual[specifier] - expected[specifier];
      const sign = delta > 0 ? '+' : '';

      return `${specifier}: ${expected[specifier]} -> ${actual[specifier]} bytes (${sign}${delta})`;
    });

  if (changes.length > 0) {
    throw new Error(
      `Plate entrypoint bundle sizes changed:\n${changes.join('\n')}\nRun pnpm plite:entrypoint-sizes:update after reviewing the diff.`
    );
  }
}

export function getPublicExports(packageJson) {
  const packageExports = packageJson.exports;

  if (!packageExports || typeof packageExports !== 'object') return [];

  return Object.entries(packageExports).map(([subpath, value]) => ({
    importTarget: readConditionalTarget(value, ['import', 'default']),
    specifier:
      subpath === '.'
        ? packageJson.name
        : `${packageJson.name}/${subpath.replace(leadingDotSlashPattern, '')}`,
    subpath,
    typesTarget: readPublicTypesTarget(value),
  }));
}

const getEntrypointRuntimeMetadata = (specifier) => {
  const target = resolvePublicEntrypoint(specifier);

  if (!target) return null;

  const entrypoint =
    entrypointDags[target.packageName].entrypoints[target.entrypointName];

  return {
    runtime: entrypoint.runtime,
    runtimeProof: entrypoint.runtimeProof,
  };
};

export function assertPackedRuntimeCoverage(packedPackages) {
  const expected = getPublicEntrypointRuntimeRows().map(
    ({ specifier }) => specifier
  );
  const actual = packedPackages
    .flatMap(({ publicExports }) =>
      publicExports
        .filter(({ runtime }) => runtime !== undefined)
        .map(({ specifier }) => specifier)
    )
    .sort(compareStrings);

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Packed runtime entrypoints differ from the canonical DAG. Expected ${expected.join(', ')}; received ${actual.join(', ')}.`
    );
  }
}

export function collectPublicExportOptionalPeers({
  kinds = ['runtime', 'types'],
  packageExport,
  packedPackage,
  packedPackages,
}) {
  const packedByName = new Map(
    packedPackages.map((item) => [item.packageJson.name, item])
  );
  const requiredPeers = new Set();
  const seen = new Set();
  const queue = [];

  const enqueueTarget = (owner, target, kind) => {
    if (!target) return;

    queue.push({
      filePath: resolvePackageTarget(owner.packageDirectory, target),
      kind,
      owner,
    });
  };

  if (kinds.includes('runtime')) {
    enqueueTarget(packedPackage, packageExport.importTarget, 'runtime');
  }
  if (kinds.includes('types')) {
    enqueueTarget(packedPackage, packageExport.typesTarget, 'types');
  }

  while (queue.length > 0) {
    const current = queue.shift();
    const seenKey = `${current.owner.packageJson.name}:${current.kind}:${current.filePath}`;

    if (seen.has(seenKey)) continue;
    seen.add(seenKey);

    const source = readFileSync(current.filePath, 'utf-8');
    const specifiers =
      current.kind === 'types'
        ? collectDeclarationImportSpecifiers(source)
        : collectImportSpecifiers(source);

    for (const specifier of specifiers) {
      if (specifier.startsWith('.')) {
        const absoluteTarget = resolve(dirname(current.filePath), specifier);
        const declarationTarget = absoluteTarget.replace(
          javascriptExtensionPattern,
          '.d.ts'
        );
        const candidates =
          current.kind === 'types'
            ? [
                declarationTarget,
                `${absoluteTarget}.d.ts`,
                join(absoluteTarget, 'index.d.ts'),
              ]
            : [
                absoluteTarget,
                `${absoluteTarget}.js`,
                join(absoluteTarget, 'index.js'),
              ];
        const target = candidates.find(isFile);

        if (target) {
          queue.push({ ...current, filePath: target });
        }
        continue;
      }
      if (specifier.startsWith('/') || specifier.includes(':')) continue;

      const dependencyName = getDependencyName(specifier);
      const packedDependency = packedByName.get(dependencyName);

      if (packedDependency) {
        const dependencyExport = packedDependency.publicExports.find(
          (item) => item.specifier === specifier
        );

        if (!dependencyExport) {
          throw new Error(
            `${current.owner.packageJson.name} imports unexported packed entrypoint ${specifier}.`
          );
        }

        enqueueTarget(
          packedDependency,
          current.kind === 'types'
            ? dependencyExport.typesTarget
            : dependencyExport.importTarget,
          current.kind
        );
        continue;
      }

      const optionalPeers = new Set(
        Object.entries(current.owner.packageJson.peerDependenciesMeta ?? {})
          .filter(([, metadata]) => metadata?.optional === true)
          .map(([name]) => name)
      );

      if (optionalPeers.has(dependencyName)) {
        requiredPeers.add(dependencyName);
      }

      const typePackage = dependencyName.startsWith('@')
        ? `@types/${dependencyName.slice(1).replace('/', '__')}`
        : `@types/${dependencyName}`;

      if (optionalPeers.has(typePackage)) {
        requiredPeers.add(typePackage);
      }
    }
  }

  return [...requiredPeers].sort(compareStrings);
}

export function createPackedPublicExportPeerProofs(packedPackages) {
  const allOptionalPeers = new Set(
    packedPackages.flatMap(({ packageJson }) =>
      Object.entries(packageJson.peerDependenciesMeta ?? {})
        .filter(([, metadata]) => metadata?.optional === true)
        .map(([name]) => name)
    )
  );
  const declarationPackageNames = packedPackages.map(
    ({ packageJson }) => packageJson.name
  );
  const groups = new Map();

  for (const packedPackage of packedPackages) {
    for (const packageExport of packedPackage.publicExports) {
      if (
        packageExport.subpath === './package.json' ||
        !javascriptExtensionPattern.test(packageExport.importTarget ?? '')
      ) {
        continue;
      }

      const requiredOptionalPackages = collectPublicExportOptionalPeers({
        packageExport,
        packedPackage,
        packedPackages,
      });
      const key = `${packedPackage.packageJson.name}:${packageExport.runtime}:${requiredOptionalPackages.join(',')}`;
      const existing = groups.get(key);

      if (existing) {
        existing.specifiers.push(packageExport.specifier);
        continue;
      }

      const requiredOptional = new Set(requiredOptionalPackages);
      const typePackages = ['@types/node'];

      if (requiredOptional.has('react')) typePackages.push('@types/react');
      if (requiredOptional.has('react-dom')) {
        typePackages.push('@types/react-dom');
      }

      groups.set(key, {
        declarationPackageNames,
        forbiddenPackages: [...allOptionalPeers]
          .filter((name) => !requiredOptional.has(name))
          .sort(compareStrings),
        packageNames: [packedPackage.packageJson.name],
        requiredOptionalPackages,
        runtime: packageExport.runtime,
        specifiers: [packageExport.specifier],
        typePackages,
      });
    }
  }

  return [...groups.values()].sort((left, right) =>
    compareStrings(left.specifiers[0], right.specifiers[0])
  );
}

export function createPackedHeadlessRuntimeProofs(packedPackages) {
  const allOptionalPeers = new Set(
    packedPackages.flatMap(({ packageJson }) =>
      Object.entries(packageJson.peerDependenciesMeta ?? {})
        .filter(([, metadata]) => metadata?.optional === true)
        .map(([name]) => name)
    )
  );
  const declarationPackageNames = packedPackages.map(
    ({ packageJson }) => packageJson.name
  );
  const groups = new Map();

  for (const packedPackage of packedPackages) {
    for (const packageExport of packedPackage.publicExports) {
      if (
        packageExport.runtime !== 'headless' ||
        !javascriptExtensionPattern.test(packageExport.importTarget ?? '')
      ) {
        continue;
      }

      const requiredOptionalPackages = collectPublicExportOptionalPeers({
        kinds: ['runtime'],
        packageExport,
        packedPackage,
        packedPackages,
      });
      const key = `${packedPackage.packageJson.name}:${requiredOptionalPackages.join(',')}`;
      const existing = groups.get(key);

      if (existing) {
        existing.specifiers.push(packageExport.specifier);
        existing.runtimeProofs.push(packageExport.runtimeProof ?? null);
        continue;
      }

      const requiredOptional = new Set(requiredOptionalPackages);

      groups.set(key, {
        declarationPackageNames,
        forbiddenPackages: [...allOptionalPeers]
          .filter((name) => !requiredOptional.has(name))
          .sort(compareStrings),
        packageNames: [packedPackage.packageJson.name],
        requiredOptionalPackages,
        runtime: 'headless',
        runtimeProofs: [packageExport.runtimeProof ?? null],
        specifiers: [packageExport.specifier],
        typecheck: false,
        typePackages: [],
      });
    }
  }

  return [...groups.values()].sort((left, right) =>
    compareStrings(left.specifiers[0], right.specifiers[0])
  );
}

export function filterTypeScriptConsumerDiagnostics(
  output,
  consumerDirectory,
  packageNames
) {
  const kept = [];
  let keepCurrent = false;
  const packagePaths = packageNames?.map((packageName) =>
    join('node_modules', ...packageName.split('/'))
  );

  for (const line of output.split('\n')) {
    const match = line.match(diagnosticStartPattern);

    if (match) {
      const filePath = match[1];

      if (!filePath) {
        keepCurrent = true;
      } else {
        const relativePath = relative(
          consumerDirectory,
          resolve(consumerDirectory, filePath)
        );
        const isConsumerPath =
          relativePath !== '..' &&
          !relativePath.startsWith(`..${sep}`) &&
          !relativePath.startsWith(sep);
        keepCurrent =
          isConsumerPath &&
          (!packagePaths ||
            relativePath === 'consumer.ts' ||
            packagePaths.some(
              (packagePath) =>
                relativePath === packagePath ||
                relativePath.startsWith(`${packagePath}${sep}`)
            ));
      }
    }

    if (keepCurrent) kept.push(line);
  }

  return kept.join('\n').trim();
}

export function parseRuntimeExportNames(source) {
  const names = new Set();

  for (const match of source.matchAll(namedExportBlockPattern)) {
    for (const item of match[1].split(',')) {
      const tokens = item.trim().split(exportAliasPattern);
      const name = tokens.at(-1)?.trim();

      if (name && name !== 'default' && identifierPattern.test(name)) {
        names.add(name);
      }
    }
  }

  for (const match of source.matchAll(directNamedExportPattern)) {
    names.add(match[1]);
  }

  return [...names].sort(compareStrings);
}

export function collectExternalImports(source) {
  return collectImportSpecifiers(source).filter(
    (specifier) =>
      !specifier.startsWith('.') &&
      !specifier.startsWith('/') &&
      !specifier.includes(':')
  );
}

export function collectImportSpecifiers(source) {
  const imports = new Set();

  for (const match of source.matchAll(localImportPattern)) {
    const specifier = match[1] ?? match[2];

    if (specifier) imports.add(specifier);
  }

  return [...imports].sort(compareStrings);
}

function collectDeclarationImportSpecifiers(source) {
  const root = parse(source, {
    plugins: ['typescript'],
    sourceType: 'module',
  });
  const imports = new Set();

  const visit = (node) => {
    if (!node || typeof node !== 'object') return;

    if (
      (node.type === 'ImportDeclaration' ||
        node.type === 'ExportNamedDeclaration' ||
        node.type === 'ExportAllDeclaration') &&
      node.source?.type === 'StringLiteral'
    ) {
      imports.add(node.source.value);
    } else if (
      node.type === 'TSImportType' &&
      node.argument?.type === 'StringLiteral'
    ) {
      imports.add(node.argument.value);
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else visit(value);
    }
  };

  visit(root);
  return [...imports].sort(compareStrings);
}

export function auditPackedPackage({
  allowedPlateRuntime,
  files,
  packageJson,
}) {
  const errors = [];
  const packedFiles = new Set(files.map(normalizePackedPath));
  const publicExports = getPublicExports(packageJson);

  if (packageJson.type !== 'module') {
    errors.push('package must declare type=module');
  }

  const validSideEffects =
    packageJson.sideEffects === false ||
    (Array.isArray(packageJson.sideEffects) &&
      packageJson.sideEffects.length > 0 &&
      packageJson.sideEffects.every(
        (entry) => typeof entry === 'string' && entry.endsWith('.css')
      ));

  if (!validSideEffects) {
    errors.push(
      'package sideEffects must be false or contain only explicit CSS assets'
    );
  }

  if (publicExports.length === 0) {
    errors.push('package must declare explicit exports');
  }

  for (const packageExport of publicExports) {
    if (packageExport.subpath.includes('*')) {
      errors.push(
        `${packageExport.subpath}: wildcard exports cannot be exhaustively consumed`
      );
      continue;
    }

    const isMetadata = packageExport.subpath === './package.json';

    if (!packageExport.importTarget) {
      errors.push(`${packageExport.subpath}: missing import/default target`);
    } else {
      auditPackedTarget({
        errors,
        label: `${packageExport.subpath} import`,
        packedFiles,
        target: packageExport.importTarget,
      });
    }

    if (!isMetadata && !packageExport.typesTarget) {
      errors.push(`${packageExport.subpath}: missing types target`);
    } else if (packageExport.typesTarget) {
      auditPackedTarget({
        errors,
        label: `${packageExport.subpath} types`,
        packedFiles,
        target: packageExport.typesTarget,
      });
    }
  }

  const rootExport = publicExports.find(({ subpath }) => subpath === '.');

  if (rootExport) {
    for (const field of ['main', 'module']) {
      if (packageJson[field] !== rootExport.importTarget) {
        errors.push(`${field} must match the root import target`);
      }
    }

    if (packageJson.types !== rootExport.typesTarget) {
      errors.push('types must match the root types target');
    }
  }

  const runtimeDeclarations = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.optionalDependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ]);
  const allowedPlatePackages = new Set(allowedPlateRuntime);

  for (const specifier of collectPackedExternalImports(files, packageJson)) {
    const dependencyName = getDependencyName(specifier);

    if (builtins.has(specifier) || builtins.has(dependencyName)) continue;

    if (!runtimeDeclarations.has(dependencyName)) {
      errors.push(
        `${specifier}: built runtime import is absent from dependencies/peerDependencies`
      );
    }

    if (
      (dependencyName === 'plitejs' ||
        dependencyName === 'platejs' ||
        dependencyName.startsWith('@platejs/')) &&
      dependencyName !== packageJson.name &&
      !allowedPlatePackages.has(dependencyName)
    ) {
      errors.push(
        `${specifier}: violates the ${packageJson.name} package direction`
      );
    }
  }

  errors.push(...auditDeclarationImports(files));

  return errors;
}

export function createConsumerSources(packages) {
  const typeImports = [];
  const runtimeImports = [];
  const bareImports = [];
  const namedImports = [];
  let importIndex = 0;

  for (const packedPackage of packages) {
    for (const packageExport of packedPackage.publicExports) {
      const alias = `packageExport${importIndex}`;

      if (packageExport.subpath === './package.json') {
        const jsonImport = `import ${alias} from ${JSON.stringify(packageExport.specifier)} with { type: 'json' };`;
        typeImports.push(jsonImport, `void ${alias}.name;`);
        runtimeImports.push(jsonImport, `void ${alias}.name;`);
        importIndex += 1;
        continue;
      }

      if (!javascriptExtensionPattern.test(packageExport.importTarget ?? '')) {
        typeImports.push(
          `import * as ${alias} from ${JSON.stringify(packageExport.specifier)};`,
          `void ${alias};`
        );
        importIndex += 1;
        continue;
      }

      typeImports.push(
        `import * as ${alias} from ${JSON.stringify(packageExport.specifier)};`,
        `void ${alias};`
      );
      packageExport.runtimeExportNames.forEach((name, runtimeIndex) => {
        const runtimeAlias = `${alias}Runtime${runtimeIndex}`;

        typeImports.push(
          `import { ${name} as ${runtimeAlias} } from ${JSON.stringify(packageExport.specifier)};`,
          `void ${runtimeAlias};`
        );
      });
      runtimeImports.push(
        `import * as ${alias} from ${JSON.stringify(packageExport.specifier)};`,
        `Object.values(${alias}).forEach((value) => void value);`
      );
      bareImports.push(`import ${JSON.stringify(packageExport.specifier)};`);

      const namedExport = packageExport.runtimeExportNames[0];

      if (namedExport) {
        namedImports.push(
          `import { ${namedExport} as unused${importIndex} } from ${JSON.stringify(packageExport.specifier)};`
        );
      }

      importIndex += 1;
    }
  }

  const consumesPliteRoot = packages.some((packedPackage) =>
    packedPackage.publicExports.some(
      (packageExport) =>
        packageExport.specifier === 'plitejs' && packageExport.subpath === '.'
    )
  );

  if (consumesPliteRoot) {
    typeImports.push(createPliteSchemaConsumerSource({ typed: true }));
    runtimeImports.push(createPliteSchemaConsumerSource({ typed: false }));
    runtimeImports.push(createPliteRuntimeIdentityConsumerSource());
  }

  const consumesPlateRoot = packages.some((packedPackage) =>
    packedPackage.publicExports.some(
      (packageExport) =>
        packageExport.specifier === 'platejs' && packageExport.subpath === '.'
    )
  );

  if (consumesPlateRoot) {
    typeImports.push(createPlateSchemaConsumerSource({ typed: true }));
    runtimeImports.push(createPlateSchemaConsumerSource({ typed: false }));
    runtimeImports.push(createPlateRuntimeIdentityConsumerSource());
  }

  const runtimeRows = packages.flatMap((packedPackage) =>
    packedPackage.publicExports
      .filter((packageExport) => packageExport.runtime !== undefined)
      .map(({ runtime, runtimeProof, specifier }) => ({
        runtime,
        runtimeProof,
        specifier,
      }))
  );

  const sentinel = 'globalThis.__PLITE_RELEASE_ARTIFACT_SENTINEL__ = 1;';

  return {
    bare: [...bareImports, sentinel, ''].join('\n'),
    baseline: `${sentinel}\n`,
    named: [...namedImports, sentinel, ''].join('\n'),
    namedImportCount: namedImports.length,
    runtime: [...runtimeImports, ''].join('\n'),
    runtimeRows,
    ssr: createSsrRuntimeProofSource(runtimeRows),
    types: [...typeImports, ''].join('\n'),
  };
}

function createPliteRuntimeIdentityConsumerSource() {
  return [
    "import { strictEqual as releaseIdentityEqual } from 'node:assert/strict';",
    "import * as releaseRoot from 'plitejs';",
    "import { dom as createReleaseDOMExtension } from 'plitejs/dom';",
    "import * as releaseLayout from 'plitejs/page-layout';",
    "import * as releaseLayoutReact from 'plitejs/page-layout/react';",
    "import * as releaseReact from 'plitejs/react';",
    '',
    'releaseIdentityEqual(releaseRoot.defineExtension, releaseReact.defineExtension);',
    'releaseIdentityEqual(releaseRoot.schema, releaseReact.schema);',
    'releaseIdentityEqual(',
    '  releaseLayout.createPlitePageLayout,',
    '  releaseLayoutReact.createPlitePageLayout',
    ');',
    'const releaseDOMExtension = createReleaseDOMExtension();',
    'const releaseReactExtension = releaseReact.react({',
    '  dom: releaseDOMExtension,',
    '});',
    'releaseIdentityEqual(',
    '  releaseReactExtension.dependencies[0],',
    '  releaseDOMExtension',
    ');',
  ].join('\n');
}

function createPlateRuntimeIdentityConsumerSource() {
  return [
    "import { deepStrictEqual as releasePlateDeepEqual, strictEqual as releasePlateIdentityEqual } from 'node:assert/strict';",
    "import * as releasePliteRoot from 'plitejs';",
    "import * as releasePliteDiff from 'plitejs/diff';",
    "import * as releasePliteDOM from 'plitejs/dom';",
    "import * as releasePliteHistory from 'plitejs/history';",
    "import * as releasePliteHyperscript from 'plitejs/hyperscript';",
    "import * as releasePliteLayout from 'plitejs/page-layout';",
    "import * as releasePliteLayoutReact from 'plitejs/page-layout/react';",
    "import * as releasePliteReact from 'plitejs/react';",
    "import * as releasePlateRoot from 'platejs';",
    "import * as releasePlateDiff from 'platejs/diff';",
    "import * as releasePlateDOM from 'platejs/dom';",
    "import * as releasePlateHistory from 'platejs/history';",
    "import * as releasePlateHyperscript from 'platejs/hyperscript';",
    "import * as releasePlateLayout from 'platejs/page-layout';",
    "import * as releasePlateLayoutReact from 'platejs/page-layout/react';",
    "import * as releasePlateReact from 'platejs/react';",
    '',
    'const releaseFacadeDiff = (substrate, facade) => ({',
    '  identityExceptions: Object.keys(substrate)',
    '    .filter((name) => name in facade && substrate[name] !== facade[name])',
    '    .sort(),',
    '  omitted: Object.keys(substrate)',
    '    .filter((name) => !(name in facade))',
    '    .sort(),',
    '});',
    'releasePlateDeepEqual(releaseFacadeDiff(releasePliteRoot, releasePlateRoot), {',
    "  identityExceptions: ['createEditor'],",
    '  omitted: [],',
    '});',
    'releasePlateDeepEqual(releaseFacadeDiff(releasePliteReact, releasePlateReact), {',
    '  identityExceptions: [',
    "    'createEditor',",
    "    'useEditor',",
    "    'useEditorSelection',",
    "    'useEditorSelector',",
    "    'useEditorState',",
    "    'useElement',",
    "    'useOptionalElement',",
    '  ],',
    '  omitted: [',
    "    'Editable',",
    "    'Plite',",
    "    'PliteElement',",
    "    'PliteLeaf',",
    "    'PlitePlaceholder',",
    "    'PliteText',",
    "    'useEditorContext',",
    "    'useOptionalEditorContext',",
    '  ],',
    '});',
    'for (const [substrate, facade] of [',
    '  [releasePliteDiff, releasePlateDiff],',
    '  [releasePliteDOM, releasePlateDOM],',
    '  [releasePliteHistory, releasePlateHistory],',
    '  [releasePliteHyperscript, releasePlateHyperscript],',
    '  [releasePliteLayout, releasePlateLayout],',
    '  [releasePliteLayoutReact, releasePlateLayoutReact],',
    ']) {',
    '  releasePlateDeepEqual(releaseFacadeDiff(substrate, facade), {',
    '    identityExceptions: [],',
    '    omitted: [],',
    '  });',
    '}',
    'releasePlateIdentityEqual(releasePlateRoot.defineExtension, releasePliteRoot.defineExtension);',
    'releasePlateIdentityEqual(releasePlateRoot.schema, releasePliteRoot.schema);',
    'releasePlateIdentityEqual(releasePlateReact.defineExtension, releasePliteReact.defineExtension);',
    'releasePlateIdentityEqual(releasePlateRoot.defineBasePlugin, releasePlateReact.defineBasePlugin);',
    'releasePlateIdentityEqual(releasePlateDOM.dom, releasePliteDOM.dom);',
    'releasePlateIdentityEqual(releasePlateHistory.history, releasePliteHistory.history);',
    'releasePlateIdentityEqual(',
    '  releasePlateLayout.createPlitePageLayout,',
    '  releasePliteLayout.createPlitePageLayout',
    ');',
  ].join('\n');
}

function createPliteSchemaConsumerSource({ typed }) {
  return [
    "import { deepStrictEqual as releaseAssertDeepEqual, equal as releaseAssertEqual } from 'node:assert/strict';",
    'import {',
    '  createEditor as createReleaseEditor,',
    '  defineEditorSchema as defineReleaseEditorSchema,',
    '  property as releaseProperty,',
    '  schema as releaseSchemaApi,',
    "} from 'plitejs';",
    ...(typed
      ? [
          "import type { SchemaElementFor as ReleaseSchemaElementFor } from 'plitejs';",
        ]
      : []),
    '',
    "const ReleaseArtifactSchema = defineReleaseEditorSchema('schema:release-consumer', {",
    '  elements: {',
    '    paragraph: {',
    "      content: releaseSchemaApi.content.text({ default: 'text', min: 1 }),",
    '      properties: {',
    "        tone: releaseProperty.string({ default: 'body' }),",
    '      },',
    '    },',
    '  },',
    "  id: 'release-consumer-schema',",
    "  root: releaseSchemaApi.content.type('paragraph', {",
    "      default: { type: 'paragraph' },",
    '      min: 1,',
    '    }),',
    "  unknown: 'reject',",
    '  version: 1,',
    '});',
    'const releaseEditor = createReleaseEditor({',
    '  extensions: [ReleaseArtifactSchema],',
    '  initialValue: [',
    '    {',
    "      children: [{ text: 'installed tarball' }],",
    "      tone: 'body',",
    "      type: 'paragraph',",
    '    },',
    '  ],',
    '});',
    'const releaseIdentity = releaseEditor.read.schema.identity();',
    "if (releaseIdentity?.kind !== 'named') {",
    "  throw new Error('Expected a named release schema identity.');",
    '}',
    "releaseAssertEqual(releaseIdentity?.id, 'release-consumer-schema');",
    'releaseAssertEqual(releaseIdentity?.version, 1);',
    'const releaseParagraphHandle = releaseSchemaApi.handle.element(',
    '  ReleaseArtifactSchema,',
    "  'paragraph'",
    ');',
    'const releaseCanonicalParagraph =',
    '  releaseEditor.read.schema.create(releaseParagraphHandle);',
    typed
      ? "const releaseTypedParagraph: ReleaseSchemaElementFor<typeof ReleaseArtifactSchema, 'paragraph'> = releaseCanonicalParagraph;"
      : 'const releaseTypedParagraph = releaseCanonicalParagraph;',
    'releaseAssertDeepEqual(releaseTypedParagraph, {',
    "  tone: 'body',",
    "  children: [{ text: '' }],",
    "  type: 'paragraph',",
    '});',
  ].join('\n');
}

function createPlateSchemaConsumerSource({ typed }) {
  return [
    "import { deepStrictEqual as releasePlateAssertDeepEqual, equal as releasePlateAssertEqual } from 'node:assert/strict';",
    'import {',
    '  createEditor as createReleaseBaseEditor,',
    '  defineBasePlugin as defineReleaseBasePlugin,',
    '  property as releasePlateProperty,',
    '  schema as releasePlateSchemaApi,',
    "} from 'platejs';",
    '',
    "const ReleaseElementPlugin = defineReleaseBasePlugin('releaseArtifactElement', {",
    '  api: ({ store }) => ({',
    '    formatConfiguredLabel: () =>',
    "      store.get('prefix') + store.get('label'),",
    "    readConfiguredLabel: () => store.get('label'),",
    '  }),',
    '  initialState: {',
    "    label: 'draft',",
    "    prefix: 'draft:',",
    '  },',
    '  schema: {',
    '    element: {',
    "      content: releasePlateSchemaApi.content.text({ default: 'text', min: 1 }),",
    '      properties: {',
    "        tone: releasePlateProperty.string({ default: 'draft' }),",
    '      },',
    "      type: 'release-artifact-paragraph',",
    '    },',
    '  },',
    '});',
    "const ReleaseMarkPlugin = defineReleaseBasePlugin('releaseArtifactMark', {",
    '  schema: {',
    '    mark: {',
    "      key: 'release-artifact-strong',",
    '      property: releasePlateProperty.boolean({',
    '        default: false,',
    '        omitDefault: true,',
    '      }),',
    '    },',
    '  },',
    '});',
    "const ReleaseParentPlugin = defineReleaseBasePlugin('releaseArtifactParent', {",
    '  dependencies: [ReleaseElementPlugin, ReleaseMarkPlugin],',
    '});',
    ...(typed
      ? [
          "const releaseNestedElementName: 'releaseArtifactElement' =",
          '  ReleaseParentPlugin.dependencies[0].name;',
          "const releaseNestedMarkName: 'releaseArtifactMark' =",
          '  ReleaseParentPlugin.dependencies[1].name;',
          'const releaseConfiguredLabel: string = ReleaseElementPlugin.initialState.label;',
          'void releaseNestedElementName;',
          'void releaseNestedMarkName;',
          'void releaseConfiguredLabel;',
        ]
      : []),
    'const releasePlateEditor = createReleaseBaseEditor({',
    '  plugins: [ReleaseParentPlugin],',
    '  schema: {',
    "    id: 'release-consumer-plate-schema',",
    '    version: 1,',
    '  },',
    '  initialValue: [',
    '    {',
    "      children: [{ text: 'packed core' }],",
    "      tone: 'draft',",
    "      type: 'release-artifact-paragraph',",
    '    },',
    '  ],',
    '});',
    'const releaseHeldPlugin = releasePlateEditor.plugin(ReleaseElementPlugin);',
    'const releasePlateIdentityBefore =',
    '  releasePlateEditor.read.schema.identity();',
    "if (releasePlateIdentityBefore?.kind !== 'named') {",
    "  throw new Error('Expected a named Plate schema identity.');",
    '}',
    'const releasePlateElementBefore =',
    '  releasePlateEditor.read.schema.create(ReleaseElementPlugin);',
    ...(typed
      ? [
          "const releaseCreatedElementType: 'release-artifact-paragraph' = releasePlateElementBefore.type;",
          'const releaseCreatedElementTone: string | undefined =',
          '  releasePlateElementBefore.tone;',
          'void releaseCreatedElementType;',
          'void releaseCreatedElementTone;',
        ]
      : []),
    'releasePlateAssertDeepEqual(releasePlateElementBefore, {',
    "  children: [{ text: '' }],",
    "  tone: 'draft',",
    "  type: 'release-artifact-paragraph',",
    '});',
    'releasePlateAssertEqual(',
    '  releasePlateEditor.read.schema.property({',
    "    key: 'release-artifact-strong',",
    "    placement: 'text',",
    '  })?.key,',
    "  'release-artifact-strong'",
    ');',
    'releasePlateAssertEqual(',
    '  releasePlateEditor.read.schema.property({',
    "    key: 'release-artifact-strong',",
    "    placement: 'text',",
    '  })?.placement,',
    "  'text'",
    ');',
    'releasePlateAssertEqual(releaseHeldPlugin.api.readConfiguredLabel(), "draft");',
    'releasePlateAssertEqual(',
    '  releaseHeldPlugin.api.formatConfiguredLabel(),',
    "  'draft:draft'",
    ');',
    'releaseHeldPlugin.store.set({',
    "    label: 'published',",
    "    prefix: 'published:',",
    '});',
    'const releasePlateIdentityAfter = releasePlateEditor.read.schema.identity();',
    "if (releasePlateIdentityAfter?.kind !== 'named') {",
    "  throw new Error('Expected a named Plate schema identity.');",
    '}',
    'const releasePlateElementAfter =',
    '  releasePlateEditor.read.schema.create(ReleaseElementPlugin);',
    'releasePlateAssertDeepEqual(releasePlateElementAfter, {',
    "  children: [{ text: '' }],",
    "  tone: 'draft',",
    "  type: 'release-artifact-paragraph',",
    '});',
    'releasePlateAssertEqual(releasePlateIdentityAfter?.id, releasePlateIdentityBefore?.id);',
    'releasePlateAssertEqual(',
    '  releasePlateIdentityAfter?.fingerprint ===',
    '    releasePlateIdentityBefore?.fingerprint,',
    '  true',
    ');',
    "releasePlateAssertEqual(ReleaseElementPlugin.initialState.label, 'draft');",
    "releasePlateAssertEqual(releaseHeldPlugin.api.readConfiguredLabel(), 'published');",
    'releasePlateAssertEqual(',
    '  releaseHeldPlugin.api.formatConfiguredLabel(),',
    "  'published:published'",
    ');',
  ].join('\n');
}

export function checkPliteReleaseArtifacts({
  keep = false,
  packageBoundariesOnly = false,
  updateEntrypointSizes = false,
} = {}) {
  ensureDirectory(temporaryRoot);

  const workDirectory = mkdtempSync(
    join(temporaryRoot, 'plite-release-artifacts-')
  );
  const isolatedConsumerRoot = mkdtempSync(
    join(tmpdir(), 'plite-release-consumers-')
  );

  try {
    const consumerDirectory = join(workDirectory, 'consumer');
    const tarballDirectory = join(workDirectory, 'tarballs');

    ensureDirectory(consumerDirectory);
    ensureDirectory(tarballDirectory);
    ensureDirectory(join(consumerDirectory, 'node_modules'));
    writeJson(join(consumerDirectory, 'package.json'), {
      name: 'plite-release-artifact-consumer',
      private: true,
      type: 'module',
    });

    const packageContracts = packageBoundariesOnly
      ? getPlitePackageBoundaryContracts()
      : PLITE_RELEASE_PACKAGES;
    const packedPackages = packageContracts.map((packageContract) =>
      packAndInstallPackage({
        consumerDirectory,
        packageContract,
        tarballDirectory,
      })
    );
    if (!packageBoundariesOnly) {
      assertPackedRuntimeCoverage(packedPackages);
    }
    const peerProofs = createPackedPublicExportPeerProofs(packedPackages);
    const provenHeadlessSpecifiers = new Set();
    const headlessRuntimeIsolationSpecifiers = new Set();
    const transitivePeerOverlaps = new Set();

    for (const [index, proof] of peerProofs.entries()) {
      const result = verifyIsolatedPackedConsumer({
        ...proof,
        directory: join(isolatedConsumerRoot, `public-export-${index}`),
        packedPackages,
      });

      result.transitivePeerOverlaps.forEach((name) =>
        transitivePeerOverlaps.add(name)
      );
      if (proof.runtime === 'headless') {
        const target = ['react', 'react-dom'].some(
          (name) =>
            proof.requiredOptionalPackages.includes(name) ||
            result.transitivePeerOverlaps.includes(name)
        )
          ? headlessRuntimeIsolationSpecifiers
          : provenHeadlessSpecifiers;

        proof.specifiers.forEach((specifier) => target.add(specifier));
      }
    }

    if (packageBoundariesOnly) {
      console.log(
        `Verified ${peerProofs.length} exact direct optional-peer closures across every packed Plite and Plate JavaScript export.`
      );
      printTransitivePeerOverlaps(transitivePeerOverlaps);
      return;
    }

    const headlessProofs = createPackedHeadlessRuntimeProofs(
      packedPackages
    ).filter(({ specifiers }) =>
      specifiers.some((specifier) =>
        headlessRuntimeIsolationSpecifiers.has(specifier)
      )
    );
    const expectedHeadlessSpecifiers = getPublicEntrypointRuntimeRows()
      .filter(({ runtime }) => runtime === 'headless')
      .map(({ specifier }) => specifier);
    for (const [index, proof] of headlessProofs.entries()) {
      const result = verifyIsolatedPackedConsumer({
        ...proof,
        directory: join(isolatedConsumerRoot, `headless-${index}`),
        packedPackages,
      });

      if (
        ['react', 'react-dom'].some(
          (name) =>
            proof.requiredOptionalPackages.includes(name) ||
            result.transitivePeerOverlaps.includes(name)
        )
      ) {
        throw new Error(
          `${proof.specifiers.join(', ')} is classified headless but loads React.`
        );
      }
      proof.specifiers.forEach((specifier) =>
        provenHeadlessSpecifiers.add(specifier)
      );
    }

    const provenHeadless = [...provenHeadlessSpecifiers].sort(compareStrings);

    if (
      JSON.stringify(provenHeadless) !==
      JSON.stringify(expectedHeadlessSpecifiers)
    ) {
      throw new Error(
        `Headless packed proof differs from the canonical DAG. Expected ${expectedHeadlessSpecifiers.join(', ')}; received ${provenHeadless.join(', ')}.`
      );
    }

    linkConsumerDependencies({ consumerDirectory, packedPackages });
    const errors = [];

    for (const packedPackage of packedPackages) {
      errors.push(
        ...auditInstalledPackage({
          packageContract: packedPackage.packageContract,
          packageDirectory: packedPackage.packageDirectory,
          packageJson: packedPackage.packageJson,
        }).map((error) => `${packedPackage.packageJson.name}: ${error}`)
      );
    }

    const sources = createConsumerSources(packedPackages);
    const bundleExternals = getConsumerBundleExternals(packedPackages);

    if (sources.namedImportCount === 0) {
      errors.push('No runtime named exports were found in packed artifacts.');
    }

    writeFileSync(join(consumerDirectory, 'consumer.ts'), sources.types);
    writeFileSync(join(consumerDirectory, 'baseline.mjs'), sources.baseline);
    writeFileSync(join(consumerDirectory, 'bare.mjs'), sources.bare);
    writeFileSync(join(consumerDirectory, 'named.mjs'), sources.named);
    writeFileSync(join(consumerDirectory, 'runtime.mjs'), sources.runtime);
    writeFileSync(join(consumerDirectory, 'ssr.mjs'), sources.ssr);
    writeTypeScriptConfigs(consumerDirectory);

    captureProof(errors, 'NodeNext declaration consumer', () => {
      runTypeScriptConsumer(consumerDirectory, 'tsconfig.nodenext.json');
    });
    captureProof(errors, 'Bundler declaration consumer', () => {
      runTypeScriptConsumer(consumerDirectory, 'tsconfig.bundler.json');
    });
    captureProof(errors, 'Node import consumer', () =>
      runCommand(process.execPath, ['runtime.mjs'], { cwd: consumerDirectory })
    );
    captureProof(errors, 'SSR runtime consumer', () =>
      runCommand(process.execPath, ['ssr.mjs'], { cwd: consumerDirectory })
    );
    captureProof(errors, 'bare and named DCE', () => {
      const baseline = bundleConsumerEntry(
        consumerDirectory,
        'baseline.mjs',
        bundleExternals
      );
      const bare = bundleConsumerEntry(
        consumerDirectory,
        'bare.mjs',
        bundleExternals
      );
      const named = bundleConsumerEntry(
        consumerDirectory,
        'named.mjs',
        bundleExternals
      );

      if (normalizeBundle(bare) !== normalizeBundle(baseline)) {
        throw new Error(
          'Unused bare imports did not collapse to the baseline bundle.'
        );
      }

      if (normalizeBundle(named) !== normalizeBundle(baseline)) {
        throw new Error(
          'Unused named imports did not collapse to the baseline bundle.'
        );
      }
    });
    captureProof(errors, 'Plate entrypoint bundle sizes', () => {
      const sizes = Object.fromEntries(
        getPlateEntrypointSizeSpecifiers().map((specifier, index) => {
          const filename = `entrypoint-size-${index}.mjs`;

          writeFileSync(
            join(consumerDirectory, filename),
            `import * as entrypoint from ${JSON.stringify(specifier)};\nglobalThis.__plateEntrypoint = entrypoint;\n`
          );

          return [
            specifier,
            Buffer.byteLength(
              normalizeBundle(
                bundleConsumerEntry(
                  consumerDirectory,
                  filename,
                  bundleExternals
                )
              )
            ),
          ];
        })
      );

      if (updateEntrypointSizes) {
        writeJson(plateEntrypointSizeBaselinePath, {
          sizes,
          version: 1,
        });
        console.log(
          `Updated ${relative(repoRoot, plateEntrypointSizeBaselinePath)}.`
        );
        return;
      }

      if (!existsSync(plateEntrypointSizeBaselinePath)) {
        throw new Error(
          'Plate entrypoint size snapshot is missing. Run pnpm plite:entrypoint-sizes:update.'
        );
      }

      const baseline = readJson(plateEntrypointSizeBaselinePath);
      if (baseline.version !== 1 || !baseline.sizes) {
        throw new Error(
          'Plate entrypoint size snapshot has an unsupported shape.'
        );
      }
      assertPlateEntrypointSizes(sizes, baseline.sizes);
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n\n'));
    }

    console.log(
      `Verified ${packedPackages.length} packed release packages, ${packedPackages.reduce((count, item) => count + item.publicExports.length, 0)} public subpaths, runtime/declaration export parity, NodeNext/Bundler declarations, package direction, and bare/named DCE.`
    );
    const runtimeCounts = Object.fromEntries(
      ['headless', 'ssr', 'client'].map((runtime) => [
        runtime,
        sources.runtimeRows.filter((row) => row.runtime === runtime).length,
      ])
    );
    console.log(
      `Verified Node import for ${sources.runtimeRows.length} runtime entrypoints, React-free headless execution for ${runtimeCounts.headless}, and DOM-free SSR rendering for ${runtimeCounts.ssr}.`
    );
    console.log(
      `Verified ${peerProofs.length} exact direct optional-peer closures across every packed JavaScript export.`
    );
    printTransitivePeerOverlaps(transitivePeerOverlaps);
  } finally {
    if (keep) {
      console.log(`Kept release artifact fixture at ${workDirectory}`);
    } else {
      rmSync(workDirectory, { force: true, recursive: true });
    }
    rmSync(isolatedConsumerRoot, { force: true, recursive: true });
  }
}

function verifyIsolatedPackedConsumer({
  declarationPackageNames,
  directory,
  forbiddenPackages,
  omittedPackages,
  packageNames,
  packedPackages,
  requiredOptionalPackages,
  runtime,
  runtimeProofs = [],
  specifiers,
  typecheck = true,
  typePackages,
}) {
  ensureDirectory(join(directory, 'node_modules'));
  writeJson(join(directory, 'package.json'), {
    name: 'plite-isolated-release-consumer',
    private: true,
    type: 'module',
  });

  const packedByName = new Map(
    packedPackages.map((packedPackage) => [
      packedPackage.packageJson.name,
      packedPackage,
    ])
  );
  const requiredOptional = new Set(requiredOptionalPackages);
  const queue = [...packageNames];
  const installed = new Set();
  const dependencyRequests = typePackages.map((name) => ({
    fromDirectory: repoRoot,
    name,
  }));

  while (queue.length > 0) {
    const packageName = queue.shift();

    if (installed.has(packageName)) continue;

    const packedPackage = packedByName.get(packageName);

    if (!packedPackage) {
      throw new Error(`Missing packed package ${packageName}.`);
    }

    const destination = join(
      directory,
      'node_modules',
      ...packageName.split('/')
    );
    ensureDirectory(dirname(destination));
    cpSync(packedPackage.packageDirectory, destination, { recursive: true });
    installed.add(packageName);

    const optionalPeers = new Set(
      Object.entries(packedPackage.packageJson.peerDependenciesMeta ?? {})
        .filter(([, metadata]) => metadata?.optional === true)
        .map(([name]) => name)
    );
    const requiredDependencies = new Set([
      ...Object.keys(packedPackage.packageJson.dependencies ?? {}),
      ...Object.keys(packedPackage.packageJson.peerDependencies ?? {}).filter(
        (name) => !optionalPeers.has(name) || requiredOptional.has(name)
      ),
    ]);

    for (const dependencyName of requiredDependencies) {
      if (packedByName.has(dependencyName)) {
        queue.push(dependencyName);
        continue;
      }

      dependencyRequests.push({
        allowForbiddenTransitives:
          optionalPeers.has(dependencyName) &&
          requiredOptional.has(dependencyName),
        fromDirectory: join(repoRoot, packedPackage.packageContract.directory),
        name: dependencyName,
      });
    }
  }

  const dependencyClosure = materializeResolvedDependencyClosure({
    destinationNodeModules: join(directory, 'node_modules'),
    forbiddenPackages,
    omittedPackages,
    requests: dependencyRequests,
    requiredOptionalPackages,
  });

  const source = [
    ...(runtime === 'headless'
      ? [
          "import { equal as runtimeEqual } from 'node:assert/strict';",
          ...(runtimeProofs.includes('plate-plugin')
            ? [
                "import { createEditor as createPlateProofEditor, isNominalPluginDescriptor as isPlateProofPlugin } from 'platejs';",
              ]
            : []),
          "runtimeEqual(typeof globalThis.document, 'undefined');",
          "runtimeEqual(typeof globalThis.window, 'undefined');",
        ]
      : []),
    ...specifiers.flatMap((specifier, index) => [
      `import * as packageExport${index} from ${JSON.stringify(specifier)};`,
      `Object.values(packageExport${index}).forEach((value) => void value);`,
      ...(runtimeProofs[index] === 'plate-plugin'
        ? [
            `const platePlugins${index} = Object.values(packageExport${index}).filter(isPlateProofPlugin);`,
            `runtimeEqual(platePlugins${index}.length > 0, true);`,
            `createPlateProofEditor({ plugins: platePlugins${index}, skipInitialization: true });`,
          ]
        : []),
    ]),
  ].join('\n');

  writeFileSync(join(directory, 'consumer.ts'), `${source}\n`);
  writeFileSync(join(directory, 'runtime.mjs'), `${source}\n`);
  writeTypeScriptConfigs(directory);
  if (typecheck) {
    runTypeScriptConsumer(directory, 'tsconfig.nodenext.json', {
      packageNames: declarationPackageNames,
    });
    runTypeScriptConsumer(directory, 'tsconfig.bundler.json', {
      packageNames: declarationPackageNames,
    });
  }
  runCommand(process.execPath, ['runtime.mjs'], { cwd: directory });

  return dependencyClosure;
}

export function materializeResolvedDependencyClosure({
  destinationNodeModules,
  forbiddenPackages,
  omittedPackages = [],
  requests,
  requiredOptionalPackages = [],
}) {
  const forbidden = new Set(forbiddenPackages);
  const allowedForbiddenTransitives = new Set();
  const omitted = new Set(omittedPackages);
  const packageNodes = new Map();
  const requiredOptional = new Set(requiredOptionalPackages);
  const rootSources = new Map();
  const queue = requests.map((request) => ({
    ...request,
    root: true,
    via: [request.name],
  }));
  const copyResolvedPackage = (source, destination) => {
    cpSync(source, destination, {
      dereference: true,
      filter: (sourcePath) => {
        const sourceRelativePath = relative(source, sourcePath);

        return (
          sourceRelativePath === '' ||
          !sourceRelativePath.split(sep).includes('node_modules')
        );
      },
      recursive: true,
    });
  };

  while (queue.length > 0) {
    const request = queue.shift();

    if (omitted.has(request.name)) continue;

    const source = resolveInstalledDependencyDirectory(
      request.name,
      request.fromDirectory
    );

    if (!source) {
      if (request.optional) continue;

      throw new Error(
        `${request.name} is unavailable for isolated dependency proof.`
      );
    }

    if (forbidden.has(request.name)) {
      if (!request.allowForbiddenTransitives) {
        throw new Error(
          `${request.name} is reachable through the isolated dependency closure via ${request.via.join(' -> ')}.`
        );
      }

      allowedForbiddenTransitives.add(request.name);
    }

    if (request.root) {
      const existingSource = rootSources.get(request.name);

      if (existingSource && existingSource !== source) {
        throw new Error(
          `${request.name} resolves to multiple versions in the isolated dependency closure.`
        );
      }

      rootSources.set(request.name, source);
    }

    if (request.parentSource) {
      packageNodes
        .get(request.parentSource)
        .dependencies.set(request.name, source);
    }

    if (packageNodes.has(source)) continue;

    const packageJson = readJson(join(source, 'package.json'));
    const optionalPeers = new Set(
      Object.entries(packageJson.peerDependenciesMeta ?? {})
        .filter(([, metadata]) => metadata?.optional === true)
        .map(([name]) => name)
    );
    packageNodes.set(source, {
      dependencies: new Map(),
      source,
    });

    for (const name of new Set([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}).filter(
        (peerName) =>
          !optionalPeers.has(peerName) || requiredOptional.has(peerName)
      ),
    ])) {
      queue.push({
        allowForbiddenTransitives: request.allowForbiddenTransitives,
        fromDirectory: source,
        name,
        parentSource: source,
        via: [...request.via, name],
      });
    }

    for (const name of Object.keys(packageJson.optionalDependencies ?? {})) {
      queue.push({
        allowForbiddenTransitives: request.allowForbiddenTransitives,
        fromDirectory: source,
        name,
        optional: true,
        parentSource: source,
        via: [...request.via, name],
      });
    }
  }

  for (const [name, source] of rootSources) {
    const destination = join(destinationNodeModules, ...name.split('/'));
    ensureDirectory(dirname(destination));
    copyResolvedPackage(source, destination);
  }

  const installNestedOverrides = (source, destination, availableSources) => {
    const packageNode = packageNodes.get(source);

    if (!packageNode) return;

    for (const [name, dependencySource] of packageNode.dependencies) {
      if (availableSources.get(name) === dependencySource) continue;

      const dependencyDestination = join(
        destination,
        'node_modules',
        ...name.split('/')
      );
      ensureDirectory(dirname(dependencyDestination));
      copyResolvedPackage(dependencySource, dependencyDestination);

      const nestedSources = new Map(availableSources);
      nestedSources.set(name, dependencySource);
      installNestedOverrides(
        dependencySource,
        dependencyDestination,
        nestedSources
      );
    }
  };

  for (const [name, source] of rootSources) {
    installNestedOverrides(
      source,
      join(destinationNodeModules, ...name.split('/')),
      rootSources
    );
  }

  assertPhysicalDependencyTree(
    destinationNodeModules,
    new Set(
      [...forbidden].filter(
        (packageName) => !allowedForbiddenTransitives.has(packageName)
      )
    )
  );

  return {
    transitivePeerOverlaps: [...allowedForbiddenTransitives].sort(
      compareStrings
    ),
  };
}

function printTransitivePeerOverlaps(overlaps) {
  if (overlaps.size === 0) return;

  console.log(
    `Required optional peers bring these sibling peers transitively: ${[...overlaps].sort(compareStrings).join(', ')}.`
  );
}

function resolveInstalledDependencyDirectory(packageName, fromDirectory) {
  let directory = resolve(fromDirectory);

  while (true) {
    const candidate = join(
      directory,
      'node_modules',
      ...packageName.split('/')
    );

    if (existsSync(candidate)) return realpathSync(candidate);

    const parent = dirname(directory);

    if (parent === directory) return undefined;

    directory = parent;
  }
}

function assertPhysicalDependencyTree(directory, forbiddenPackages) {
  const queue = [directory];

  while (queue.length > 0) {
    const current = queue.shift();

    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolutePath = join(current, entry.name);

      if (entry.isSymbolicLink()) {
        throw new Error(
          `${relative(directory, absolutePath)} links outside the isolated dependency tree.`
        );
      }

      if (entry.isDirectory()) {
        queue.push(absolutePath);
        continue;
      }

      if (!entry.isFile() || entry.name !== 'package.json') continue;

      const packageName = readJson(absolutePath).name;

      if (forbiddenPackages.has(packageName)) {
        throw new Error(
          `${packageName} is present in the isolated dependency tree.`
        );
      }
    }
  }
}

function packAndInstallPackage({
  consumerDirectory,
  packageContract,
  tarballDirectory,
}) {
  const packageSourceDirectory = join(repoRoot, packageContract.directory);
  const packResult = runCommand(
    'pnpm',
    ['pack', '--json', '--pack-destination', tarballDirectory],
    { cwd: packageSourceDirectory }
  );
  const packMetadata = JSON.parse(packResult.stdout.trim());
  const packageDirectory = join(
    consumerDirectory,
    'node_modules',
    ...packageContract.name.split('/')
  );

  ensureDirectory(packageDirectory);
  runCommand(
    'tar',
    [
      '-xzf',
      packMetadata.filename,
      '-C',
      packageDirectory,
      '--strip-components=1',
    ],
    { cwd: repoRoot }
  );

  const packageJson = readJson(join(packageDirectory, 'package.json'));

  if (packageJson.name !== packageContract.name) {
    throw new Error(
      `${packageContract.directory}: expected ${packageContract.name}, found ${String(packageJson.name)}`
    );
  }

  const publicExports = getPublicExports(packageJson).map((packageExport) => {
    if (
      !packageExport.importTarget ||
      packageExport.subpath === './package.json' ||
      !javascriptExtensionPattern.test(packageExport.importTarget)
    ) {
      return { ...packageExport, runtimeExportNames: [] };
    }

    const runtimeMetadata = getEntrypointRuntimeMetadata(
      packageExport.specifier
    );

    if (!runtimeMetadata && packageContract.name in entrypointDags) {
      throw new Error(
        `${packageExport.specifier} is absent from the canonical entrypoint runtime DAG.`
      );
    }

    const targetPath = resolvePackageTarget(
      packageDirectory,
      packageExport.importTarget
    );

    return {
      ...packageExport,
      ...runtimeMetadata,
      runtimeExportNames: parseRuntimeExportNames(
        readFileSync(targetPath, 'utf-8')
      ),
    };
  });

  return {
    packageContract,
    packageDirectory,
    packageJson,
    publicExports,
  };
}

function auditInstalledPackage({
  packageContract,
  packageDirectory,
  packageJson,
}) {
  const files = walkFiles(packageDirectory).map((absolutePath) => ({
    path: relative(packageDirectory, absolutePath).split(sep).join('/'),
    source:
      absolutePath.endsWith('.js') || absolutePath.endsWith('.d.ts')
        ? readFileSync(absolutePath, 'utf-8')
        : '',
  }));

  return auditPackedPackage({
    allowedPlateRuntime: packageContract.allowedPlateRuntime,
    files,
    packageJson,
  });
}

function collectPackedExternalImports(files) {
  const imports = new Set();

  for (const file of files) {
    if (!file.path.endsWith('.js')) continue;

    for (const specifier of collectExternalImports(file.source)) {
      imports.add(specifier);
    }
  }

  return [...imports].sort(compareStrings);
}

function auditDeclarationImports(files) {
  const packedFiles = new Set(files.map(normalizePackedPath));
  const errors = [];

  for (const file of files) {
    if (!file.path.endsWith('.d.ts')) continue;

    for (const specifier of collectDeclarationImportSpecifiers(file.source)) {
      if (!specifier.startsWith('.')) continue;

      if (
        !javascriptExtensionPattern.test(specifier) &&
        !specifier.endsWith('.json')
      ) {
        errors.push(
          `${file.path}: relative declaration import ${specifier} needs an explicit runtime extension`
        );
        continue;
      }

      const declarationTarget = normalizePackedPath(
        join(
          dirname(file.path),
          specifier.replace(javascriptExtensionPattern, '.d.ts')
        )
      );
      const runtimeTarget = normalizePackedPath(
        join(dirname(file.path), specifier)
      );

      if (
        !packedFiles.has(declarationTarget) &&
        !packedFiles.has(runtimeTarget)
      ) {
        errors.push(
          `${file.path}: relative declaration import ${specifier} has no packed target`
        );
      }
    }
  }

  if (errors.length <= 12) return errors;

  return [
    ...errors.slice(0, 12),
    `${errors.length - 12} more invalid relative declaration imports`,
  ];
}

function linkConsumerDependencies({ consumerDirectory, packedPackages }) {
  const installedPackageNames = new Set(
    packedPackages.map(({ packageJson }) => packageJson.name)
  );

  for (const packedPackage of packedPackages) {
    const dependencies = new Set([
      ...Object.keys(packedPackage.packageJson.dependencies ?? {}),
      ...Object.keys(packedPackage.packageJson.optionalDependencies ?? {}),
      ...Object.keys(packedPackage.packageJson.peerDependencies ?? {}),
    ]);

    for (const dependencyName of dependencies) {
      if (installedPackageNames.has(dependencyName)) continue;

      const sourcePackageDirectory = join(
        repoRoot,
        packedPackage.packageContract.directory
      );
      const candidates = [
        join(
          sourcePackageDirectory,
          'node_modules',
          ...dependencyName.split('/')
        ),
        join(repoRoot, 'node_modules', ...dependencyName.split('/')),
      ];
      const source = candidates.find(existsSync);

      if (!source) continue;

      const destination = join(
        consumerDirectory,
        'node_modules',
        ...dependencyName.split('/')
      );

      if (existsSync(destination)) continue;

      ensureDirectory(dirname(destination));
      symlinkSync(realpathSync(source), destination, 'junction');
    }
  }
}

function getConsumerBundleExternals(packedPackages) {
  const packedPackageNames = new Set(
    packedPackages.map(({ packageJson }) => packageJson.name)
  );
  const externals = new Set();

  for (const packedPackage of packedPackages) {
    for (const file of walkFiles(packedPackage.packageDirectory)) {
      if (!file.endsWith('.js')) continue;

      for (const specifier of collectExternalImports(
        readFileSync(file, 'utf-8')
      )) {
        if (!packedPackageNames.has(getDependencyName(specifier))) {
          externals.add(specifier);
        }
      }
    }
  }

  return [...externals].sort(compareStrings);
}

function auditPackedTarget({ errors, label, packedFiles, target }) {
  if (!target.startsWith('./') || target.includes('..')) {
    errors.push(`${label}: target must stay inside the package`);
    return;
  }

  const packedPath = normalizePackedPath(target);

  if (!packedFiles.has(packedPath)) {
    errors.push(`${label}: missing packed file ${packedPath}`);
  }
}

function readConditionalTarget(value, conditions) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;

  for (const condition of conditions) {
    const target = readConditionalTarget(value[condition], conditions);

    if (target) return target;
  }

  return null;
}

function readPublicTypesTarget(value) {
  if (typeof value === 'string') {
    if (javascriptExtensionPattern.test(value)) {
      return value.replace(javascriptExtensionPattern, '.d.ts');
    }

    return value.endsWith('.json') ? value : null;
  }

  return readConditionalTarget(value, ['types']);
}

function getDependencyName(specifier) {
  const parts = specifier.split('/');

  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function normalizePackedPath(value) {
  const path = typeof value === 'string' ? value : value.path;

  return path.replace(leadingDotSlashPattern, '').split(sep).join('/');
}

function resolvePackageTarget(packageDirectory, target) {
  const absolutePath = resolve(packageDirectory, target);

  if (!absolutePath.startsWith(`${packageDirectory}${sep}`)) {
    throw new Error(`${target}: package export escapes its package`);
  }

  return absolutePath;
}

function writeTypeScriptConfigs(consumerDirectory) {
  const common = {
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      jsx: 'react-jsx',
      lib: ['ESNext', 'DOM', 'DOM.Iterable'],
      noEmit: true,
      resolveJsonModule: true,
      skipLibCheck: false,
      strict: true,
      target: 'ES2022',
      types: ['node'],
    },
    files: ['./consumer.ts'],
  };

  writeJson(join(consumerDirectory, 'tsconfig.nodenext.json'), {
    ...common,
    compilerOptions: {
      ...common.compilerOptions,
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
    },
  });
  writeJson(join(consumerDirectory, 'tsconfig.bundler.json'), {
    ...common,
    compilerOptions: {
      ...common.compilerOptions,
      module: 'ESNext',
      moduleResolution: 'Bundler',
    },
  });
}

export function runTypeScriptConsumer(
  consumerDirectory,
  configName,
  { packageNames } = {}
) {
  const command = join(repoRoot, 'node_modules', '.bin', 'tsc');
  const args = ['-p', configName, '--pretty', 'false', '--noErrorTruncation'];
  const result = spawnSync(command, args, {
    cwd: consumerDirectory,
    encoding: 'utf-8',
    env: {
      ...process.env,
      CI: 'true',
    },
    stdio: 'pipe',
  });

  if (result.error) throw result.error;
  if (result.status === 0) return;

  const output = [result.stdout.trim(), result.stderr.trim()]
    .filter(Boolean)
    .join('\n');
  const ownedDiagnostics = filterTypeScriptConsumerDiagnostics(
    output,
    consumerDirectory,
    packageNames
  );

  if (!ownedDiagnostics) return;

  throw new Error(
    `${command} ${args.join(' ')} exited with ${result.status}\n${truncateOutput(ownedDiagnostics)}`
  );
}

function bundleConsumerEntry(consumerDirectory, entryName, externals) {
  const outputDirectory = join(
    consumerDirectory,
    `bundle-${entryName.replace(/\W+/g, '-')}`
  );

  const externalArguments = externals.flatMap((specifier) => [
    '--external',
    specifier,
  ]);

  runCommand(
    join(repoRoot, 'node_modules', '.bin', 'tsdown'),
    [
      entryName,
      '--no-config',
      '--format',
      'esm',
      '--platform',
      'node',
      '--out-dir',
      outputDirectory,
      '--tsconfig',
      'tsconfig.bundler.json',
      '--minify',
      '--logLevel',
      'error',
      ...externalArguments,
    ],
    { cwd: consumerDirectory }
  );

  const outputs = walkFiles(outputDirectory).filter((file) =>
    javascriptExtensionPattern.test(file)
  );

  if (outputs.length !== 1) {
    throw new Error(
      `${entryName}: expected one bundled JavaScript output, found ${outputs.length}`
    );
  }

  return readFileSync(outputs[0], 'utf-8');
}

function normalizeBundle(source) {
  return source.replace(/\/\/# sourceMappingURL=.*$/gm, '').trim();
}

function walkFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      walkFiles(absolutePath, files);
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function ensureDirectory(directory) {
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  if (!statSync(directory).isDirectory()) {
    throw new Error(`${directory} is not a directory`);
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runCommand(command, args, { cwd }) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf-8',
    env: {
      ...process.env,
      CI: 'true',
    },
    stdio: 'pipe',
  });

  if (result.error) throw result.error;

  if (result.status !== 0) {
    const output = [result.stdout.trim(), result.stderr.trim()]
      .filter(Boolean)
      .join('\n');

    throw new Error(
      [
        `${command} ${args.join(' ')} exited with ${result.status}`,
        truncateOutput(output),
      ]
        .filter(Boolean)
        .join('\n')
    );
  }

  return result;
}

function captureProof(errors, label, proof) {
  try {
    proof();
    console.log(`Verified ${label}.`);
  } catch (error) {
    errors.push(
      `${label}:\n${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function truncateOutput(output, maxLength = 6000) {
  if (output.length <= maxLength) return output;

  const half = Math.floor(maxLength / 2);

  return `${output.slice(0, half)}\n... ${output.length - maxLength} characters omitted ...\n${output.slice(-half)}`;
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return !!entrypoint && resolve(entrypoint) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  try {
    checkPliteReleaseArtifacts({
      keep: process.argv.includes('--keep'),
      packageBoundariesOnly: process.argv.includes('--package-boundaries-only'),
      updateEntrypointSizes: process.argv.includes('--update-entrypoint-sizes'),
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
