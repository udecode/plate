import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

import { parse } from '@babel/parser';

import {
  createPlateRegistry,
  type PlateRegistryBase,
  PLATE_REGISTRY_BASES,
} from '../../../../apps/www/src/registry/registry';

const REPO_ROOT = path.resolve(import.meta.dir, '../../../..');
const APP_ROOT = path.join(REPO_ROOT, 'apps/www');
const REGISTRY_ROOT = path.join(APP_ROOT, 'src/registry');
const OUTPUT_ROOT = import.meta.dir;
const BASES = PLATE_REGISTRY_BASES satisfies readonly PlateRegistryBase[];

const BASE_PRIMITIVE_PATTERNS = [
  /^@base-ui\//,
  /^@radix-ui\//,
  /^react-aria-components$/,
];
const THIRD_PARTY_PRIMITIVE_PATTERNS = [/^@ariakit\//, /^ariakit(?:\/|$)/];
const SHADCN_UI_PATTERNS = [
  /^@\/components\/ui(?:\/|$)/,
  /^@components\/ui(?:\/|$)/,
];

type RegistryItem = ReturnType<typeof createPlateRegistry>['items'][number];

interface ParsedSource {
  asChildCount: number;
  basePrimitiveImports: string[];
  dynamicImports: string[];
  imports: string[];
  nativeButtonCount: number;
  renderPropCount: number;
  shadcnUiImports: string[];
  thirdPartyPrimitiveImports: string[];
}

function unique(values: Iterable<string>) {
  return [...new Set(values)].sort();
}

function isMatch(value: string, patterns: readonly RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function parseSource(filePath: string, embeddedContent?: string): ParsedSource {
  if (embeddedContent === undefined && !existsSync(filePath)) {
    return {
      asChildCount: 0,
      basePrimitiveImports: [],
      dynamicImports: [],
      imports: [],
      nativeButtonCount: 0,
      renderPropCount: 0,
      shadcnUiImports: [],
      thirdPartyPrimitiveImports: [],
    };
  }

  const source = embeddedContent ?? readFileSync(filePath, 'utf8');
  const imports: string[] = [];
  const dynamicImports: string[] = [];

  if (!/\.[cm]?[jt]sx?$/.test(filePath)) {
    for (const match of source.matchAll(
      /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g
    )) {
      imports.push(match[1]);
    }

    const allImports = unique(imports);

    return {
      asChildCount: source.match(/\basChild\b/g)?.length ?? 0,
      basePrimitiveImports: allImports.filter((value) =>
        isMatch(value, BASE_PRIMITIVE_PATTERNS)
      ),
      dynamicImports: [],
      imports: allImports,
      nativeButtonCount: source.match(/\bnativeButton\b/g)?.length ?? 0,
      renderPropCount: source.match(/\brender\s*=/g)?.length ?? 0,
      shadcnUiImports: allImports.filter((value) =>
        isMatch(value, SHADCN_UI_PATTERNS)
      ),
      thirdPartyPrimitiveImports: allImports.filter((value) =>
        isMatch(value, THIRD_PARTY_PRIMITIVE_PATTERNS)
      ),
    };
  }

  const sourceFile = parse(source, {
    plugins: ['typescript', 'jsx', 'dynamicImport'],
    sourceType: 'unambiguous',
  });

  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;

    const record = node as Record<string, unknown>;
    const nodeType = record.type;
    const sourceNode = record.source as
      | { type?: string; value?: unknown }
      | undefined;

    if (
      (nodeType === 'ImportDeclaration' ||
        nodeType === 'ExportNamedDeclaration' ||
        nodeType === 'ExportAllDeclaration') &&
      sourceNode?.type === 'StringLiteral' &&
      typeof sourceNode.value === 'string'
    ) {
      imports.push(sourceNode.value);
    }

    if (nodeType === 'CallExpression') {
      const callee = record.callee as
        | { name?: unknown; type?: unknown }
        | undefined;
      const args = record.arguments as
        | Array<{ type?: unknown; value?: unknown }>
        | undefined;
      const firstArgument = args?.[0];

      if (
        args?.length === 1 &&
        firstArgument?.type === 'StringLiteral' &&
        typeof firstArgument.value === 'string'
      ) {
        if (callee?.type === 'Import') {
          dynamicImports.push(firstArgument.value);
        } else if (callee?.type === 'Identifier' && callee.name === 'require') {
          imports.push(firstArgument.value);
        }
      }
    }

    for (const [key, value] of Object.entries(record)) {
      if (key === 'loc' || key === 'start' || key === 'end') continue;
      if (Array.isArray(value)) {
        for (const child of value) visit(child);
      } else {
        visit(value);
      }
    }
  };

  visit(sourceFile);

  const allImports = unique([...imports, ...dynamicImports]);

  return {
    asChildCount: source.match(/\basChild\b/g)?.length ?? 0,
    basePrimitiveImports: allImports.filter((value) =>
      isMatch(value, BASE_PRIMITIVE_PATTERNS)
    ),
    dynamicImports: unique(dynamicImports),
    imports: allImports,
    nativeButtonCount: source.match(/\bnativeButton\b/g)?.length ?? 0,
    renderPropCount: source.match(/\brender\s*=/g)?.length ?? 0,
    shadcnUiImports: allImports.filter((value) =>
      isMatch(value, SHADCN_UI_PATTERNS)
    ),
    thirdPartyPrimitiveImports: allImports.filter((value) =>
      isMatch(value, THIRD_PARTY_PRIMITIVE_PATTERNS)
    ),
  };
}

function resolveItemFile(
  file: NonNullable<RegistryItem['files']>[number],
  sourceKind: 'docs' | 'plate'
) {
  if (sourceKind === 'plate') {
    return {
      absolutePath: path.join(REGISTRY_ROOT, file.path),
      manifestPath: file.path,
    };
  }

  const absolutePath = path.resolve(APP_ROOT, file.path);

  if (file.path.startsWith('src/registry/')) {
    return {
      absolutePath,
      manifestPath: file.path.slice('src/registry/'.length),
    };
  }

  return {
    absolutePath,
    manifestPath: `external:${path.relative(REPO_ROOT, absolutePath)}`,
  };
}

function normalizePlateDependency(dependency: string) {
  if (dependency.startsWith('@plate/')) return dependency.slice('@plate/'.length);

  const match = dependency.match(
    /^https?:\/\/(?:www\.)?platejs\.org\/r(?:\/[^/]+)?\/([^/]+)\.json$/
  );

  return match?.[1] ?? null;
}

function isBareShadcnDependency(dependency: string) {
  return (
    !dependency.startsWith('@') &&
    !dependency.startsWith('http://') &&
    !dependency.startsWith('https://') &&
    !dependency.startsWith('./') &&
    !dependency.endsWith('.json')
  );
}

function walkFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);

    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

function isProductionRegistrySource(relativePath: string) {
  if (relativePath.startsWith('changelog/')) return false;
  if (/\.(?:spec|test|slow)\.[cm]?[jt]sx?$/.test(relativePath)) return false;

  return /\.[cm]?[jt]sx?$/.test(relativePath);
}

const registries = Object.fromEntries(
  BASES.map((base) => [base, createPlateRegistry('https://platejs.org', { base })])
) as Record<PlateRegistryBase, ReturnType<typeof createPlateRegistry>>;
const registry = registries.radix;
const previousCwd = process.cwd();
process.chdir(APP_ROOT);
const { createDocsRegistry } = await import(
  '../../../../apps/www/scripts/build-docs-registry.mts'
);
const docsRegistry = await createDocsRegistry();
process.chdir(previousCwd);

const allItems = [
  ...registry.items.map((item) => ({ item, sourceKind: 'plate' as const })),
  ...docsRegistry.items.map((item) => ({ item, sourceKind: 'docs' as const })),
];
const itemNames = new Set(allItems.map(({ item }) => item.name));
const fileOwners = new Map<string, string[]>();

for (const { item, sourceKind } of allItems) {
  for (const file of item.files ?? []) {
    const { manifestPath } = resolveItemFile(file, sourceKind);
    const owners = fileOwners.get(manifestPath) ?? [];
    owners.push(item.name);
    fileOwners.set(manifestPath, owners);
  }
}

const itemRows = allItems.map(({ item, sourceKind }) => {
  const files = (item.files ?? []).map((file) => {
    const { absolutePath, manifestPath } = resolveItemFile(file, sourceKind);

    return {
      exists: existsSync(absolutePath),
      path: manifestPath,
      source: parseSource(absolutePath, file.content),
      target: file.target ?? null,
      type: file.type,
    };
  });
  const dependencyPrimitivePackages = unique(
    (item.dependencies ?? []).filter(
      (dependency) =>
        isMatch(dependency, BASE_PRIMITIVE_PATTERNS) ||
        isMatch(dependency, THIRD_PARTY_PRIMITIVE_PATTERNS)
    )
  );
  const basePrimitiveImports = unique(
    files.flatMap((file) => file.source.basePrimitiveImports)
  );
  const thirdPartyPrimitiveImports = unique(
    files.flatMap((file) => file.source.thirdPartyPrimitiveImports)
  );
  const shadcnUiImports = unique(
    files.flatMap((file) => file.source.shadcnUiImports)
  );
  const plateDependencies = unique(
    (item.registryDependencies ?? [])
      .map(normalizePlateDependency)
      .filter((dependency): dependency is string => Boolean(dependency))
  );
  const missingPlateDependencies = plateDependencies.filter(
    (dependency) => !itemNames.has(dependency)
  );
  const shadcnRegistryDependencies = unique(
    (item.registryDependencies ?? []).filter(isBareShadcnDependency)
  );
  const hasBasePrimitive =
    basePrimitiveImports.length > 0 ||
    dependencyPrimitivePackages.some((dependency) =>
      isMatch(dependency, BASE_PRIMITIVE_PATTERNS)
    );
  const hasThirdPartyPrimitive =
    thirdPartyPrimitiveImports.length > 0 ||
    dependencyPrimitivePackages.some((dependency) =>
      isMatch(dependency, THIRD_PARTY_PRIMITIVE_PATTERNS)
    );
  const hasShadcnUi =
    shadcnUiImports.length > 0 || shadcnRegistryDependencies.length > 0;

  return {
    asChildCount: files.reduce(
      (count, file) => count + file.source.asChildCount,
      0
    ),
    basePrimitiveImports,
    classification: item.type === 'registry:style'
      ? 'style-only'
      : hasBasePrimitive
        ? 'base-primitive-direct'
        : hasThirdPartyPrimitive
          ? 'third-party-primitive-direct'
          : hasShadcnUi
            ? 'shadcn-ui-direct'
            : 'primitive-agnostic',
    dependencies: unique(item.dependencies ?? []),
    dependencyPrimitivePackages,
    fileCount: files.length,
    files,
    missingPlateDependencies,
    name: item.name,
    nativeButtonCount: files.reduce(
      (count, file) => count + file.source.nativeButtonCount,
      0
    ),
    plateDependencies,
    registryDependencies: unique(item.registryDependencies ?? []),
    renderPropCount: files.reduce(
      (count, file) => count + file.source.renderPropCount,
      0
    ),
    shadcnRegistryDependencies,
    shadcnUiImports,
    sourceKind,
    thirdPartyPrimitiveImports,
    type: item.type,
  };
});

const coupledRoots = new Map<string, Set<string>>();

for (const item of itemRows) {
  if (
    item.classification === 'base-primitive-direct' ||
    item.classification === 'third-party-primitive-direct' ||
    item.classification === 'shadcn-ui-direct'
  ) {
    coupledRoots.set(item.name, new Set([item.name]));
  }
}

let changed = true;
while (changed) {
  changed = false;

  for (const item of itemRows) {
    const roots = coupledRoots.get(item.name) ?? new Set<string>();
    const before = roots.size;

    for (const dependency of item.plateDependencies) {
      for (const root of coupledRoots.get(dependency) ?? []) roots.add(root);
    }

    if (roots.size > 0) coupledRoots.set(item.name, roots);
    if (roots.size !== before) changed = true;
  }
}

const items = itemRows.map((item) => ({
  ...item,
  couplingRoots: unique(coupledRoots.get(item.name) ?? []),
  effectiveClassification:
    item.classification === 'primitive-agnostic' &&
    (coupledRoots.get(item.name)?.size ?? 0) > 0
      ? 'primitive-transitive'
      : item.classification,
}));

const allRegistryFiles = walkFiles(REGISTRY_ROOT)
  .map((absolutePath) => ({
    absolutePath,
    path: path.relative(REGISTRY_ROOT, absolutePath),
  }))
  .filter(({ path: relativePath }) => isProductionRegistrySource(relativePath));

const sourceFiles = allRegistryFiles.map(({ absolutePath, path: relativePath }) => {
  const source = parseSource(absolutePath);
  const owners = unique(fileOwners.get(relativePath) ?? []);
  const isVariant = relativePath.startsWith('bases/');

  return {
    ...source,
    classification: source.basePrimitiveImports.length > 0
      ? 'base-primitive-direct'
      : source.thirdPartyPrimitiveImports.length > 0
        ? 'third-party-primitive-direct'
        : source.shadcnUiImports.length > 0
          ? 'shadcn-ui-direct'
          : 'primitive-agnostic',
    isMetadata: /^registry(?:-[^/]+)?\.ts$/.test(relativePath),
    isPublished: owners.length > 0 || isVariant,
    isVariant,
    owners,
    path: relativePath,
  };
});

const baseComparisons = BASES.filter((base) => base !== 'radix').map((base) => {
  const otherItems = new Map(
    registries[base].items.map((item) => [item.name, item])
  );
  const changedItems = registry.items
    .filter(
      (item) => JSON.stringify(item) !== JSON.stringify(otherItems.get(item.name))
    )
    .map((item) => item.name)
    .sort();

  return { base, changedItems };
});

const targetOwners = new Map<string, string[]>();
for (const { item, sourceKind } of allItems) {
  for (const file of item.files ?? []) {
    if (!file.target) continue;
    const { manifestPath } = resolveItemFile(file, sourceKind);
    const owners = targetOwners.get(file.target) ?? [];
    owners.push(`${item.name}:${manifestPath}`);
    targetOwners.set(file.target, owners);
  }
}

const targetCollisions = [...targetOwners]
  .filter(([, owners]) => owners.length > 1)
  .map(([target, owners]) => ({ target, owners: unique(owners) }))
  .sort((a, b) => a.target.localeCompare(b.target));

const itemClassificationCounts = Object.fromEntries(
  [...new Set(items.map((item) => item.effectiveClassification))]
    .sort()
    .map((classification) => [
      classification,
      items.filter((item) => item.effectiveClassification === classification)
        .length,
    ])
);
const fileClassificationCounts = Object.fromEntries(
  [...new Set(sourceFiles.map((file) => file.classification))]
    .sort()
    .map((classification) => [
      classification,
      sourceFiles.filter((file) => file.classification === classification)
        .length,
    ])
);

const manifest = {
  baseComparisons,
  boundaries: {
    activeItems: allItems.length,
    allProductionSourceFiles: sourceFiles.length,
    docsItems: docsRegistry.items.length,
    plateItems: registry.items.length,
    publishedSourceFiles: sourceFiles.filter((file) => file.isPublished).length,
    registryRoot: path.relative(REPO_ROOT, REGISTRY_ROOT),
    uniqueActiveItemFilePaths: fileOwners.size,
  },
  fileClassificationCounts,
  itemClassificationCounts,
  items,
  sourceFiles,
  targetCollisions,
};

mkdirSync(OUTPUT_ROOT, { recursive: true });
writeFileSync(
  path.join(OUTPUT_ROOT, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`
);

const itemHeader = [
  'name',
  'type',
  'classification',
  'effectiveClassification',
  'fileCount',
  'basePrimitiveImports',
  'thirdPartyPrimitiveImports',
  'shadcnUiImports',
  'shadcnRegistryDependencies',
  'plateDependencies',
  'couplingRoots',
  'asChildCount',
  'renderPropCount',
].join('\t');
const itemLines = items.map((item) =>
  [
    item.name,
    item.type,
    item.classification,
    item.effectiveClassification,
    String(item.fileCount),
    item.basePrimitiveImports.join(','),
    item.thirdPartyPrimitiveImports.join(','),
    item.shadcnUiImports.join(','),
    item.shadcnRegistryDependencies.join(','),
    item.plateDependencies.join(','),
    item.couplingRoots.join(','),
    String(item.asChildCount),
    String(item.renderPropCount),
  ].join('\t')
);
writeFileSync(
  path.join(OUTPUT_ROOT, 'items.tsv'),
  `${[itemHeader, ...itemLines].join('\n')}\n`
);

const fileHeader = [
  'path',
  'published',
  'variant',
  'metadata',
  'classification',
  'owners',
  'basePrimitiveImports',
  'thirdPartyPrimitiveImports',
  'shadcnUiImports',
  'asChildCount',
  'renderPropCount',
].join('\t');
const fileLines = sourceFiles.map((file) =>
  [
    file.path,
    String(file.isPublished),
    String(file.isVariant),
    String(file.isMetadata),
    file.classification,
    file.owners.join(','),
    file.basePrimitiveImports.join(','),
    file.thirdPartyPrimitiveImports.join(','),
    file.shadcnUiImports.join(','),
    String(file.asChildCount),
    String(file.renderPropCount),
  ].join('\t')
);
writeFileSync(
  path.join(OUTPUT_ROOT, 'files.tsv'),
  `${[fileHeader, ...fileLines].join('\n')}\n`
);

const summary = [
  '# Registry primitive audit manifest',
  '',
  `- Active registry items: ${manifest.boundaries.activeItems}`,
  `- Plate source items: ${manifest.boundaries.plateItems}`,
  `- Docs source items: ${manifest.boundaries.docsItems}`,
  `- Unique active item file paths: ${manifest.boundaries.uniqueActiveItemFilePaths}`,
  `- Production registry source files: ${manifest.boundaries.allProductionSourceFiles}`,
  `- Published or variant source files: ${manifest.boundaries.publishedSourceFiles}`,
  `- Item classifications: ${JSON.stringify(itemClassificationCounts)}`,
  `- File classifications: ${JSON.stringify(fileClassificationCounts)}`,
  `- Installed target collisions: ${targetCollisions.length}`,
  `- Base comparisons: ${baseComparisons.map((row) => `${row.base}=[${row.changedItems.join(',')}]`).join('; ')}`,
  '',
  'Generated by `bun docs/plans/artifacts/registry-primitive-variants/audit.mts`.',
  '',
].join('\n');
writeFileSync(path.join(OUTPUT_ROOT, 'summary.md'), summary);

console.log(summary);
