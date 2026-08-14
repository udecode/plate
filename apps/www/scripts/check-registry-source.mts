import { readFileSync } from 'node:fs';
import { posix } from 'node:path';

import { parse } from '@babel/parser';
import { registrySchema } from 'shadcn/schema';

import registryShadcnData from '../registry-shadcn.json';
import { createPlateRegistry, registry } from '../src/registry/registry';
import {
  toPublicRegistryDependencySpecifier,
  toRegistryDependencySpecifier,
} from './registry-dependencies.mts';

const ABSOLUTE_URL_REGEX = /^https?:\/\//;
const JSON_SUFFIX_REGEX = /\.json$/;
const IMPORTABLE_SOURCE_FILE_REGEX = /\.[cm]?[jt]sx?$/;
const EDITOR_COMPONENT_PATH_SEGMENT = 'components/editor/';
const EDITOR_COMPONENT_TARGET_PREFIX = '@components/editor/';
const PLATE_PUBLIC_REGISTRY_BASE_URL = 'https://platejs.org/r';
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json'] as const;
const BASELINE_PACKAGES = new Set([
  'class-variance-authority',
  'clsx',
  'lucide-react',
  'next',
  'platejs',
  'react',
  'react-dom',
  'server-only',
  'tailwind-merge',
]);
const HOST_PROVIDED_ALIASES = new Set(['@/lib/utils']);

const sourceRegistry = createPlateRegistry('https://platejs.org');
const normalizedRegistry = registrySchema.parse({
  ...sourceRegistry,
  items: sourceRegistry.items.map((item) => ({
    ...item,
    registryDependencies: item.registryDependencies?.map(
      toRegistryDependencySpecifier
    ),
  })),
});
const publicRegistry = registrySchema.parse({
  ...sourceRegistry,
  items: sourceRegistry.items.map((item) => ({
    ...item,
    registryDependencies: item.registryDependencies?.map((dependency) =>
      toPublicRegistryDependencySpecifier(
        dependency,
        PLATE_PUBLIC_REGISTRY_BASE_URL
      )
    ),
  })),
});

const itemsByName = new Map(
  normalizedRegistry.items.map((item) => [item.name, item])
);
const publicItemsByName = new Map(
  publicRegistry.items.map((item) => [item.name, item])
);
const shadcnItemsByName = new Map(
  registryShadcnData.items.map((item) => [item.name, item])
);
const runtimeItemsByName = new Map(
  registry.items.map((item) => [item.name, item])
);
const unbackedBaseKitDependencies: string[] = [];
const liveKitBaseImports: string[] = [];

type RegistryDependencyTarget =
  | { kind: 'plate'; name: string }
  | { kind: 'shadcn'; name: string };

function getRegistryDependencyTarget(
  dependency: string
): RegistryDependencyTarget | null {
  const canonicalDependency = toRegistryDependencySpecifier(dependency);

  if (canonicalDependency.startsWith('@plate/')) {
    return {
      kind: 'plate',
      name: canonicalDependency.slice('@plate/'.length),
    };
  }
  if (!ABSOLUTE_URL_REGEX.test(canonicalDependency)) {
    return shadcnItemsByName.has(canonicalDependency)
      ? { kind: 'shadcn', name: canonicalDependency }
      : null;
  }

  const url = new URL(canonicalDependency);
  const name = url.pathname.split('/').at(-1)?.replace(JSON_SUFFIX_REGEX, '');

  if (!name) return null;

  const isPlateRegistry =
    url.hostname === 'platejs.org' ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1';

  if (isPlateRegistry && itemsByName.has(name)) {
    return { kind: 'plate', name };
  }
  if (url.hostname === 'ui.shadcn.com' && shadcnItemsByName.has(name)) {
    return { kind: 'shadcn', name };
  }

  return null;
}

function getImportSources(source: string) {
  const program = parse(source, {
    plugins: ['jsx', 'typescript'],
    sourceType: 'unambiguous',
  }).program;
  const imports = new Set<string>();

  for (const statement of program.body) {
    if (
      (statement.type === 'ImportDeclaration' ||
        statement.type === 'ExportAllDeclaration' ||
        statement.type === 'ExportNamedDeclaration') &&
      statement.source
    )
      imports.add(statement.source.value);
  }

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const child of value) visit(child);

      return;
    }
    if (!value || typeof value !== 'object') return;

    const node = value as Record<string, unknown>;

    if (node.type === 'CallExpression') {
      const callee = node.callee as Record<string, unknown> | undefined;
      const [argument] = (node.arguments as unknown[] | undefined) ?? [];

      if (argument && typeof argument === 'object') {
        const source = argument as Record<string, unknown>;

        if (
          source.type === 'StringLiteral' &&
          typeof source.value === 'string' &&
          (callee?.type === 'Import' ||
            (callee?.type === 'Identifier' && callee.name === 'require'))
        ) {
          imports.add(source.value);
        }
      }
    }
    if (node.type === 'TSExternalModuleReference') {
      const expression = node.expression as Record<string, unknown> | undefined;

      if (
        expression?.type === 'StringLiteral' &&
        typeof expression.value === 'string'
      ) {
        imports.add(expression.value);
      }
    }
    if (node.type === 'ImportExpression') {
      const source = node.source as Record<string, unknown> | undefined;

      if (
        source?.type === 'StringLiteral' &&
        typeof source.value === 'string'
      ) {
        imports.add(source.value);
      }
    }

    for (const child of Object.values(node)) visit(child);
  };

  visit(program.body);

  return [...imports];
}

function getRegistryFileImportSources(filePath: string) {
  if (!IMPORTABLE_SOURCE_FILE_REGEX.test(filePath)) return [];

  return getImportSources(
    readFileSync(
      new URL(`../src/registry/${filePath}`, import.meta.url),
      'utf8'
    )
  );
}

function getDependencyPackageName(dependency: string) {
  if (dependency.startsWith('@')) {
    const packageEnd = dependency.indexOf('@', dependency.indexOf('/') + 1);

    return packageEnd === -1 ? dependency : dependency.slice(0, packageEnd);
  }

  return dependency.split('@')[0];
}

function getImportPackageName(specifier: string) {
  if (
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('@/') ||
    specifier.startsWith('node:')
  ) {
    return null;
  }

  if (specifier.startsWith('@')) {
    return specifier.split('/').slice(0, 2).join('/');
  }

  return specifier.split('/')[0];
}

function getSourcePathCandidates(sourcePath: string) {
  if (SOURCE_EXTENSIONS.some((extension) => sourcePath.endsWith(extension))) {
    return [sourcePath];
  }

  return [
    sourcePath,
    ...SOURCE_EXTENSIONS.map((extension) => `${sourcePath}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => `${sourcePath}/index${extension}`),
  ];
}

function importsRegistryItem(importSources: string[], itemName: string) {
  return importSources.some(
    (specifier) => specifier.split('/').at(-1) === itemName
  );
}

for (const item of sourceRegistry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    assert(
      !dependency.startsWith('@shadcn/'),
      `Expected source item ${item.name} to use bare shadcn dependency ${dependency.slice('@shadcn/'.length)} instead of ${dependency}`
    );
  }

  const files = (item.files ?? []).map((file) => ({
    imports: getRegistryFileImportSources(file.path),
    path: file.path,
  }));

  for (const dependency of item.registryDependencies ?? []) {
    if (!dependency.endsWith('-base-kit')) continue;

    const dependencyName = dependency.slice('@plate/'.length);

    if (
      !files.some((file) => importsRegistryItem(file.imports, dependencyName))
    ) {
      unbackedBaseKitDependencies.push(`${item.name} -> ${dependency}`);
    }
  }

  if (!item.name.endsWith('-kit') || item.name.endsWith('-base-kit')) {
    continue;
  }

  for (const file of files) {
    if (
      file.imports.some((specifier) =>
        specifier.split('/').at(-1)?.endsWith('-base-kit')
      )
    ) {
      liveKitBaseImports.push(`${item.name}:${file.path}`);
    }
  }
}

assert(
  unbackedBaseKitDependencies.length === 0 && liveKitBaseImports.length === 0,
  [
    'Expected base-kit registry dependencies to be source-backed and live kits to stay independent from base presets.',
    ...unbackedBaseKitDependencies,
    ...liveKitBaseImports,
  ].join('\n')
);

const sourceFileOwners = new Map<string, Set<string>>();
const installedTargetOwners = new Map<string, Set<string>>();

function addOwner(
  owners: Map<string, Set<string>>,
  path: string,
  owner: string
) {
  const currentOwners = owners.get(path) ?? new Set<string>();
  currentOwners.add(owner);
  owners.set(path, currentOwners);
}

for (const item of normalizedRegistry.items) {
  for (const file of item.files ?? []) {
    addOwner(sourceFileOwners, file.path, item.name);
    addOwner(installedTargetOwners, file.target ?? file.path, item.name);

    if (file.target?.startsWith('@components/')) {
      addOwner(installedTargetOwners, file.target.slice(1), item.name);
      addOwner(
        installedTargetOwners,
        `@/components/${file.target.slice('@components/'.length)}`,
        item.name
      );
    }
  }
}

function findOwners(owners: Map<string, Set<string>>, path: string) {
  for (const candidate of getSourcePathCandidates(path)) {
    const pathOwners = owners.get(candidate);

    if (pathOwners) return pathOwners;
  }

  return null;
}

function resolveSourceOwners(
  file: { path: string; target?: string },
  specifier: string
) {
  let sourcePath: string | null = null;

  if (specifier.startsWith('@/registry/')) {
    sourcePath = specifier.slice('@/registry/'.length);
  } else if (specifier.startsWith('.')) {
    sourcePath = posix.normalize(
      posix.join(posix.dirname(file.path), specifier)
    );
  } else if (specifier.startsWith('@/')) {
    const installedOwners = findOwners(installedTargetOwners, specifier);

    if (installedOwners) return installedOwners;

    sourcePath = specifier.slice('@/'.length);
  }

  if (!sourcePath) return null;

  return findOwners(sourceFileOwners, sourcePath);
}

function resolveInstalledRelativeOwners(
  file: { path: string; target?: string },
  specifier: string
) {
  if (!specifier.startsWith('.')) return null;

  const installedPath = file.target ?? file.path;
  const importedPath = posix.normalize(
    posix.join(posix.dirname(installedPath), specifier)
  );

  return findOwners(installedTargetOwners, importedPath);
}

function intersectOwners(
  sourceOwners: Set<string> | null,
  installedOwners: Set<string> | null
) {
  if (!sourceOwners || !installedOwners) return null;

  const owners = new Set(
    [...sourceOwners].filter((owner) => installedOwners.has(owner))
  );

  return owners.size > 0 ? owners : null;
}

function getInstalledPackages(itemName: string) {
  const packages = new Set(BASELINE_PACKAGES);
  const visitedPlateItems = new Set<string>();
  const visitedShadcnItems = new Set<string>();

  const visitShadcnItem = (dependencyName: string) => {
    if (visitedShadcnItems.has(dependencyName)) return;
    visitedShadcnItems.add(dependencyName);

    const item = shadcnItemsByName.get(dependencyName);
    if (!item) return;

    for (const dependency of item.dependencies ?? []) {
      packages.add(getDependencyPackageName(dependency));
    }

    if ('registryDependencies' in item) {
      for (const dependency of item.registryDependencies ?? []) {
        const target = getRegistryDependencyTarget(dependency);

        if (target?.kind === 'plate') visitPlateItem(target.name);
        if (target?.kind === 'shadcn') visitShadcnItem(target.name);
      }
    }
  };

  const visitPlateItem = (dependencyName: string) => {
    if (visitedPlateItems.has(dependencyName)) return;
    visitedPlateItems.add(dependencyName);

    const item = itemsByName.get(dependencyName);
    if (!item) return;

    for (const dependency of item.dependencies ?? []) {
      packages.add(getDependencyPackageName(dependency));
    }

    for (const dependency of item.registryDependencies ?? []) {
      const target = getRegistryDependencyTarget(dependency);

      if (target?.kind === 'plate') visitPlateItem(target.name);
      if (target?.kind === 'shadcn') visitShadcnItem(target.name);
    }
  };

  visitPlateItem(itemName);

  return packages;
}

const duplicateDependencies: string[] = [];
const missingDirectRegistryDependencies: string[] = [];
const missingPackageDependencies: string[] = [];
const unresolvedCopiedImports: string[] = [];

for (const item of normalizedRegistry.items) {
  const dependencies = item.dependencies ?? [];
  const registryDependencies = item.registryDependencies ?? [];

  if (new Set(dependencies).size !== dependencies.length) {
    duplicateDependencies.push(`${item.name}: dependencies`);
  }
  if (new Set(registryDependencies).size !== registryDependencies.length) {
    duplicateDependencies.push(`${item.name}: registryDependencies`);
  }

  if (runtimeItemsByName.get(item.name)?.meta?.registry === false) continue;

  const registryDependencyTargets = registryDependencies
    .map(getRegistryDependencyTarget)
    .filter((target): target is RegistryDependencyTarget => target !== null);
  const directPlateDependencies = new Set(
    registryDependencyTargets
      .filter((target) => target.kind === 'plate')
      .map((target) => target.name)
  );
  const directShadcnDependencies = new Set(
    registryDependencyTargets
      .filter((target) => target.kind === 'shadcn')
      .map((target) => target.name)
  );
  const installedPackages = getInstalledPackages(item.name);

  for (const file of item.files ?? []) {
    const imports = getRegistryFileImportSources(file.path);

    for (const specifier of imports) {
      if (specifier.startsWith('@/components/ui/')) {
        const dependencyName = specifier.slice('@/components/ui/'.length);

        if (!directShadcnDependencies.has(dependencyName)) {
          missingDirectRegistryDependencies.push(
            `${item.name}:${file.path} -> ${dependencyName}`
          );
        }
        continue;
      }

      if (HOST_PROVIDED_ALIASES.has(specifier)) continue;

      const sourceOwners = resolveSourceOwners(file, specifier);
      const installedRelativeOwners = resolveInstalledRelativeOwners(
        file,
        specifier
      );
      const copiedOwners = specifier.startsWith('.')
        ? intersectOwners(sourceOwners, installedRelativeOwners)
        : sourceOwners;

      if (
        !copiedOwners &&
        (specifier.startsWith('.') || specifier.startsWith('@/'))
      ) {
        unresolvedCopiedImports.push(
          `${item.name}:${file.path} -> ${specifier}`
        );
        continue;
      }

      if (
        copiedOwners &&
        !copiedOwners.has(item.name) &&
        ![...copiedOwners].some((owner) => directPlateDependencies.has(owner))
      ) {
        missingDirectRegistryDependencies.push(
          `${item.name}:${file.path} -> ${[...copiedOwners].map((owner) => `@plate/${owner}`).join(' or ')}`
        );
        continue;
      }

      const packageName = getImportPackageName(specifier);

      if (packageName && !installedPackages.has(packageName)) {
        missingPackageDependencies.push(
          `${item.name}:${file.path} -> ${packageName}`
        );
      }
    }
  }
}

assert(
  duplicateDependencies.length === 0 &&
    missingDirectRegistryDependencies.length === 0 &&
    missingPackageDependencies.length === 0 &&
    unresolvedCopiedImports.length === 0,
  [
    'Expected every published registry source import to have direct copied-file ownership and installable package closure.',
    ...duplicateDependencies,
    ...missingDirectRegistryDependencies,
    ...missingPackageDependencies,
    ...unresolvedCopiedImports,
  ].join('\n')
);

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function toEditorComponentTarget(filePath: string) {
  const segmentIndex = filePath.indexOf(EDITOR_COMPONENT_PATH_SEGMENT);

  assert(
    segmentIndex !== -1,
    `Expected ${filePath} to include ${EDITOR_COMPONENT_PATH_SEGMENT}`
  );

  return `${EDITOR_COMPONENT_TARGET_PREFIX}${filePath.slice(segmentIndex + EDITOR_COMPONENT_PATH_SEGMENT.length)}`;
}

assert(itemsByName.has('plate-ui'), 'Expected plate-ui registry item');
assert(itemsByName.has('editor-basic'), 'Expected editor-basic registry item');

const editorBasic = itemsByName.get('editor-basic');
assert(
  editorBasic?.registryDependencies?.includes('@plate/plate-ui'),
  'Expected editor-basic to depend on namespaced plate-ui registry item after normalization'
);

const publicEditorBasic = publicItemsByName.get('editor-basic');
assert(
  publicEditorBasic?.registryDependencies?.includes(
    'https://platejs.org/r/plate-ui.json'
  ),
  'Expected public editor-basic to keep direct URL installs on the same Plate registry base'
);
assert(
  !publicEditorBasic?.registryDependencies?.some((dependency) =>
    dependency.startsWith('@plate/')
  ),
  'Expected public editor-basic to avoid @plate self-dependencies'
);

const runtimeEditorBasic = runtimeItemsByName.get('editor-basic');
assert(
  runtimeEditorBasic?.registryDependencies?.includes('@plate/plate-ui'),
  'Expected runtime editor-basic to depend on namespaced plate-ui'
);

for (const item of normalizedRegistry.items) {
  for (const file of item.files ?? []) {
    if (!file.path.includes(EDITOR_COMPONENT_PATH_SEGMENT)) {
      continue;
    }

    assert(
      file.target === toEditorComponentTarget(file.path),
      `Expected ${item.name} file ${file.path} to install under the configured components alias for relative editor imports`
    );
  }
}

const editorBaseKit = itemsByName.get('editor-base-kit');
const editorBaseKitFile = editorBaseKit?.files?.[0];
assert(
  editorBaseKitFile?.target === '@components/editor/editor-base-kit.tsx',
  'Expected editor-base-kit to install in the configured components editor directory so its relative plugin imports resolve'
);

for (const dependency of editorBaseKit?.registryDependencies ?? []) {
  if (!dependency.startsWith('@plate/') || !dependency.endsWith('-kit')) {
    continue;
  }

  const dependencyName = dependency.slice('@plate/'.length);
  const dependencyItem = itemsByName.get(dependencyName);
  const dependencyFile = dependencyItem?.files?.[0];

  assert(
    dependencyFile?.path &&
      dependencyFile.target === toEditorComponentTarget(dependencyFile.path) &&
      dependencyFile.target.startsWith('@components/editor/plugins/'),
    `Expected editor-base-kit dependency ${dependency} to install under the configured components editor plugins directory`
  );
}

const editorAi = itemsByName.get('editor-ai');
assert(
  editorAi?.files?.some(
    (file) =>
      file.path === 'blocks/editor-ai/components/editor/plate-editor.tsx' &&
      file.target === '@components/editor/plate-editor.tsx'
  ),
  'Expected editor-ai plate-editor to install under the configured components editor directory'
);
assert(
  editorBasic?.files?.some(
    (file) =>
      file.path === 'blocks/editor-basic/components/editor/plate-editor.tsx' &&
      file.target === '@components/editor/plate-editor.tsx'
  ),
  'Expected editor-basic plate-editor to install under the configured components editor directory'
);

const excalidrawNode = itemsByName.get('excalidraw-node');
assert(
  excalidrawNode?.meta?.examples?.includes('excalidraw-demo'),
  'Expected excalidraw-node to expose its existing registry demo'
);

for (const item of normalizedRegistry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    assert(
      !dependency.startsWith('@shadcn/'),
      `Expected ${item.name} to use bare shadcn dependency ${dependency.slice('@shadcn/'.length)} instead of ${dependency}`
    );

    const target = getRegistryDependencyTarget(dependency);

    if (target?.kind === 'plate') {
      assert(
        itemsByName.has(target.name),
        `Expected ${item.name} Plate dependency ${dependency} to reference a registry item`
      );

      continue;
    }

    if (target?.kind === 'shadcn') continue;

    if (
      dependency.startsWith('@') ||
      dependency.startsWith('/') ||
      dependency.startsWith('./') ||
      dependency.startsWith('../') ||
      ABSOLUTE_URL_REGEX.test(dependency)
    ) {
      continue;
    }

    assert(
      shadcnItemsByName.has(dependency),
      `Expected bare dependency ${dependency} in ${item.name} to be a shadcn registry item`
    );
  }
}

for (const item of publicRegistry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    assert(
      !dependency.startsWith('@shadcn/'),
      `Expected public ${item.name} to use bare shadcn dependency ${dependency.slice('@shadcn/'.length)} instead of ${dependency}`
    );

    assert(
      !dependency.startsWith('@plate/'),
      `Expected public ${item.name} to use same-base URL dependency instead of ${dependency}`
    );

    if (dependency.startsWith(`${PLATE_PUBLIC_REGISTRY_BASE_URL}/`)) {
      const itemName = dependency
        .slice(`${PLATE_PUBLIC_REGISTRY_BASE_URL}/`.length)
        .replace(/\.json$/, '');

      assert(
        publicItemsByName.has(itemName),
        `Expected public ${item.name} Plate dependency ${dependency} to reference a registry item`
      );

      continue;
    }

    if (
      dependency.startsWith('@') ||
      dependency.startsWith('/') ||
      dependency.startsWith('./') ||
      dependency.startsWith('../') ||
      ABSOLUTE_URL_REGEX.test(dependency)
    ) {
      continue;
    }

    assert(
      shadcnItemsByName.has(dependency),
      `Expected public bare dependency ${dependency} in ${item.name} to be a shadcn registry item`
    );
  }
}

console.info('Registry source check passed.');
