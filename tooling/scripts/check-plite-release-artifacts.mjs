#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
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
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDirectory, '..', '..');
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

export const PLITE_RELEASE_PACKAGES = [
  {
    allowedPlateRuntime: [],
    directory: 'packages/plite',
    name: '@platejs/plite',
  },
  {
    allowedPlateRuntime: ['@platejs/plite'],
    directory: 'packages/plite-dom',
    name: '@platejs/plite-dom',
  },
  {
    allowedPlateRuntime: ['@platejs/plite'],
    directory: 'packages/plite-history',
    name: '@platejs/plite-history',
  },
  {
    allowedPlateRuntime: ['@platejs/plite'],
    directory: 'packages/plite-hyperscript',
    name: '@platejs/plite-hyperscript',
  },
  {
    allowedPlateRuntime: [
      '@platejs/plite',
      '@platejs/plite-dom',
      '@platejs/plite-history',
    ],
    directory: 'packages/plite-react',
    name: '@platejs/plite-react',
  },
  {
    allowedPlateRuntime: ['@platejs/plite', '@platejs/plite-react'],
    directory: 'packages/plite-layout',
    name: '@platejs/plite-layout',
  },
  {
    allowedPlateRuntime: [],
    directory: 'packages/browser',
    name: '@platejs/browser',
  },
  {
    allowedPlateRuntime: [],
    directory: 'packages/udecode/utils',
    name: '@udecode/utils',
  },
  {
    allowedPlateRuntime: [
      '@platejs/plite',
      '@platejs/plite-dom',
      '@platejs/plite-history',
      '@platejs/plite-hyperscript',
      '@platejs/plite-react',
    ],
    directory: 'packages/core',
    name: '@platejs/core',
  },
  {
    // @platejs/yjs deliberately publishes both the Plite collaboration
    // substrate and the Plate plugin adapter from separate public subpaths.
    allowedPlateRuntime: [
      '@platejs/core',
      '@platejs/plite',
      '@platejs/plite-react',
    ],
    directory: 'packages/yjs',
    name: '@platejs/yjs',
  },
];

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

export function filterTypeScriptConsumerDiagnostics(output, consumerDirectory) {
  const kept = [];
  let keepCurrent = false;

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
        keepCurrent =
          relativePath !== '..' &&
          !relativePath.startsWith(`..${sep}`) &&
          !relativePath.startsWith(sep);
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

  return [...names].sort();
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

  return [...imports].sort();
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

  if (packageJson.sideEffects !== false) {
    errors.push('package must declare sideEffects=false for the DCE contract');
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
      dependencyName.startsWith('@platejs/') &&
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

      typeImports.push(
        `import * as ${alias} from ${JSON.stringify(packageExport.specifier)};`,
        `void ${alias};`
      );
      runtimeImports.push(
        `import * as ${alias} from ${JSON.stringify(packageExport.specifier)};`,
        `void ${alias};`
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
        packageExport.specifier === '@platejs/plite' &&
        packageExport.subpath === '.'
    )
  );

  if (consumesPliteRoot) {
    typeImports.push(createPliteSchemaConsumerSource({ typed: true }));
    runtimeImports.push(createPliteSchemaConsumerSource({ typed: false }));
  }

  const consumesCoreRoot = packages.some((packedPackage) =>
    packedPackage.publicExports.some(
      (packageExport) =>
        packageExport.specifier === '@platejs/core' &&
        packageExport.subpath === '.'
    )
  );

  if (consumesCoreRoot) {
    typeImports.push(createPlateSchemaConsumerSource({ typed: true }));
    runtimeImports.push(createPlateSchemaConsumerSource({ typed: false }));
  }

  const sentinel = 'globalThis.__PLITE_RELEASE_ARTIFACT_SENTINEL__ = 1;';

  return {
    bare: [...bareImports, sentinel, ''].join('\n'),
    baseline: `${sentinel}\n`,
    named: [...namedImports, sentinel, ''].join('\n'),
    namedImportCount: namedImports.length,
    runtime: [...runtimeImports, ''].join('\n'),
    types: [...typeImports, ''].join('\n'),
  };
}

function createPliteSchemaConsumerSource({ typed }) {
  return [
    "import { deepStrictEqual as releaseAssertDeepEqual, equal as releaseAssertEqual } from 'node:assert/strict';",
    'import {',
    '  createEditorRuntime as createReleaseEditorRuntime,',
    '  defineEditorSchema as defineReleaseEditorSchema,',
    '  property as releaseProperty,',
    '  schema as releaseSchemaApi,',
    "} from '@platejs/plite';",
    ...(typed
      ? [
          "import type { SchemaElementFor as ReleaseSchemaElementFor } from '@platejs/plite';",
        ]
      : []),
    '',
    'const ReleaseArtifactSchema = defineReleaseEditorSchema({',
    '  elements: {',
    '    paragraph: {',
    "      content: releaseSchemaApi.content.text({ default: 'text', min: 1 }),",
    '      properties: {',
    "        tone: releaseProperty.string({ default: 'body' }),",
    '      },',
    '    },',
    '  },',
    "  id: 'release-consumer-schema',",
    '  root: {',
    "    content: releaseSchemaApi.content.type('paragraph', {",
    "      default: { type: 'paragraph' },",
    '      min: 1,',
    '    }),',
    '  },',
    "  unknown: 'reject',",
    '  version: 1,',
    '});',
    'const releaseRuntime = createReleaseEditorRuntime({',
    '  extensions: [ReleaseArtifactSchema],',
    '  initialValue: [',
    '    {',
    "      children: [{ text: 'installed tarball' }],",
    "      type: 'paragraph',",
    '    },',
    '  ],',
    '});',
    'const releaseIdentity = releaseRuntime.editor.read.schema.identity();',
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
    '  releaseRuntime.editor.read.schema.createAndFill(releaseParagraphHandle);',
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
    '  property as releasePlateProperty,',
    '  schema as releasePlateSchemaApi,',
    "} from '@platejs/plite';",
    'import {',
    '  createBaseEditor as createReleaseBaseEditor,',
    '  createBasePlugin as createReleaseBasePlugin,',
    "} from '@platejs/core';",
    '',
    'const ReleaseElementPlugin = createReleaseBasePlugin({',
    '  api: ({ store }) => ({',
    '    formatConfiguredLabel: () =>',
    "      store.get('prefix') + store.get('label'),",
    "    readConfiguredLabel: () => store.get('label'),",
    '  }),',
    '  initialState: {',
    "    label: 'draft',",
    "    prefix: 'draft:',",
    '  },',
    "  name: 'releaseArtifactElement',",
    '  schema: ({ initialState }) => ({',
    '    element: {',
    "      content: releasePlateSchemaApi.content.text({ default: 'text', min: 1 }),",
    '      properties: {',
    '        tone: releasePlateProperty.string({ default: initialState.label }),',
    '      },',
    '    },',
    '  }),',
    "  type: 'release-artifact-paragraph',",
    '});',
    'const ReleaseMarkPlugin = createReleaseBasePlugin({',
    "  name: 'releaseArtifactMark',",
    '  schema: {',
    '    mark: releasePlateProperty.boolean({',
    '      default: false,',
    '      omitDefault: true,',
    '    }),',
    '  },',
    "  type: 'release-artifact-strong',",
    '});',
    'const ReleaseParentPlugin = createReleaseBasePlugin({',
    '  dependencies: [ReleaseElementPlugin, ReleaseMarkPlugin],',
    "  name: 'releaseArtifactParent',",
    '});',
    ...(typed
      ? [
          "const releaseExactElementType: 'release-artifact-paragraph' = ReleaseElementPlugin.type;",
          "const releaseExactMarkType: 'release-artifact-strong' = ReleaseMarkPlugin.type;",
          "const releaseNestedElementName: 'releaseArtifactElement' =",
          '  ReleaseParentPlugin.dependencies[0].name;',
          "const releaseNestedMarkName: 'releaseArtifactMark' =",
          '  ReleaseParentPlugin.dependencies[1].name;',
          'const releaseConfiguredLabel: string = ReleaseElementPlugin.initialState.label;',
          'void releaseExactElementType;',
          'void releaseExactMarkType;',
          'void releaseNestedElementName;',
          'void releaseNestedMarkName;',
          'void releaseConfiguredLabel;',
        ]
      : []),
    'const releasePlateEditor = createReleaseBaseEditor({',
    '  nodeId: false,',
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
    '  releasePlateEditor.read.schema.createAndFill(ReleaseElementPlugin);',
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
    '  releasePlateEditor.read.schema.property(ReleaseMarkPlugin)?.key,',
    "  'release-artifact-strong'",
    ');',
    'releasePlateAssertEqual(',
    '  releasePlateEditor.read.schema.property(ReleaseMarkPlugin)?.placement,',
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
    '  releasePlateEditor.read.schema.createAndFill(ReleaseElementPlugin);',
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
    "releasePlateAssertEqual(releaseHeldPlugin.plugin.initialState.label, 'draft');",
    "releasePlateAssertEqual(releaseHeldPlugin.api.readConfiguredLabel(), 'published');",
    'releasePlateAssertEqual(',
    '  releaseHeldPlugin.api.formatConfiguredLabel(),',
    "  'published:published'",
    ');',
  ].join('\n');
}

export async function checkPliteReleaseArtifacts({ keep = false } = {}) {
  ensureDirectory(temporaryRoot);

  const workDirectory = mkdtempSync(
    join(temporaryRoot, 'plite-release-artifacts-')
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

    const packedPackages = PLITE_RELEASE_PACKAGES.map((packageContract) =>
      packAndInstallPackage({
        consumerDirectory,
        packageContract,
        tarballDirectory,
      })
    );
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
    writeTypeScriptConfigs(consumerDirectory);

    captureProof(errors, 'NodeNext declaration consumer', () =>
      runTypeScriptConsumer(consumerDirectory, 'tsconfig.nodenext.json')
    );
    captureProof(errors, 'Bundler declaration consumer', () =>
      runTypeScriptConsumer(consumerDirectory, 'tsconfig.bundler.json')
    );
    captureProof(errors, 'Node runtime consumer', () =>
      runCommand(process.execPath, ['runtime.mjs'], { cwd: consumerDirectory })
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

    if (errors.length > 0) {
      throw new Error(errors.join('\n\n'));
    }

    console.log(
      `Verified ${packedPackages.length} packed release packages, ${packedPackages.reduce((count, item) => count + item.publicExports.length, 0)} public subpaths, NodeNext/Bundler declarations, package direction, and bare/named DCE.`
    );
  } finally {
    if (keep) {
      console.log(`Kept release artifact fixture at ${workDirectory}`);
    } else {
      rmSync(workDirectory, { force: true, recursive: true });
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
      packageExport.subpath === './package.json'
    ) {
      return { ...packageExport, runtimeExportNames: [] };
    }

    const targetPath = resolvePackageTarget(
      packageDirectory,
      packageExport.importTarget
    );

    return {
      ...packageExport,
      runtimeExportNames: parseRuntimeExportNames(
        readFileSync(targetPath, 'utf8')
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
        ? readFileSync(absolutePath, 'utf8')
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

  return [...imports].sort();
}

function auditDeclarationImports(files) {
  const packedFiles = new Set(files.map(normalizePackedPath));
  const errors = [];

  for (const file of files) {
    if (!file.path.endsWith('.d.ts')) continue;

    for (const specifier of collectImportSpecifiers(file.source)) {
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
        readFileSync(file, 'utf8')
      )) {
        if (!packedPackageNames.has(getDependencyName(specifier))) {
          externals.add(specifier);
        }
      }
    }
  }

  return [...externals].sort();
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

export function runTypeScriptConsumer(consumerDirectory, configName) {
  const command = join(repoRoot, 'node_modules', '.bin', 'tsc');
  const args = ['-p', configName, '--pretty', 'false', '--noErrorTruncation'];
  const result = spawnSync(command, args, {
    cwd: consumerDirectory,
    encoding: 'utf8',
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
    consumerDirectory
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

  return readFileSync(outputs[0], 'utf8');
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
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runCommand(command, args, { cwd }) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
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
    errors.push(`${label}:\n${error instanceof Error ? error.message : error}`);
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
  checkPliteReleaseArtifacts({ keep: process.argv.includes('--keep') }).catch(
    (error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }
  );
}
