import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import {
  closeSync,
  existsSync,
  fsyncSync,
  linkSync,
  mkdtempSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type {
  EditorSchemaContract,
  EditorSchemaContractContentProgram,
  SchemaPropertyKey,
} from '@platejs/plite';
import { failInvariant } from '@platejs/plite/internal';
import { build } from 'esbuild';

import {
  artifactStateRoot,
  canonicalPath,
  compilerDirectoryPrefix,
  findProjectRoot,
  pathFingerprint,
} from './state';
import {
  discoverEditorConfigFiles,
  editorSourceImportCandidates,
  findEditorConfig,
  NativeTypeScriptSession,
  resolveEditorSourceImport,
  type EditorTsconfigCache,
  type NativeTypeProperties,
} from './typescript';

export type GenerateEditorOptions = Readonly<{
  check?: boolean;
  cwd?: string;
}>;

type EditorArtifacts = Readonly<{
  entryPath: string;
  schema: EditorSchemaContract;
  schemaPath: string;
  sourceFiles: readonly string[];
  typesPath: string;
}>;

export type GeneratedEditorArtifacts = EditorArtifacts &
  Readonly<{ status: 'generated' | 'upToDate' }>;

export type CompiledEditorArtifacts = EditorArtifacts &
  Readonly<{
    schemaSource: string;
    typesSource: string;
  }>;

type ElementBinding = Readonly<{
  name: string;
  type: string;
  typeName: string;
}>;

type CompiledPluginBinding = Readonly<{
  authoredToggle?: true;
  key?: string;
  name: string;
  type?: string;
}>;

type CompiledApplicationProperty = Readonly<{
  key: SchemaPropertyKey;
  localId: string;
}>;

type CompiledEditor = Readonly<{
  applicationName: string;
  applicationProperties: readonly CompiledApplicationProperty[];
  bindings: readonly CompiledPluginBinding[];
  pluginExportName: string;
  schema: EditorSchemaContract;
}>;

type TypeProperties = NativeTypeProperties;

type ContractPropertyDescriptor =
  EditorSchemaContract['properties']['byId'][number]['descriptor'];

type MaterializedProperties = Readonly<{
  byPropertyId: Readonly<
    Record<string, Readonly<{ optional: boolean; type: string }>>
  >;
  sourceFiles: readonly string[];
}>;

const ANY_PATH_PATTERN = /.*/;
const CAMEL_BOUNDARY_PATTERN = /([a-z\d])([A-Z])/g;
const CSS_PATH_PATTERN = /\.css$/;
const EDITOR_ENTRY_PATTERN = /^plate:editor$/;
const LEADING_DIGIT_PATTERN = /^\d/;
const NON_IDENTIFIER_PATTERN = /[^A-Z_a-z\d]+/;
const NODE_MODULES_PATH_PATTERN = /(^|[\\/])node_modules([\\/]|$)/;
const PROPERTY_NAME_PATTERN = /^[$A-Z_a-z][$\w]*$/;
const PORTABLE_SHELL_PATH_PATTERN = /^[./A-Z_a-z\d-]+$/;
const SHELL_EXPANSION_PATTERN = /["$`%!\r\n]/;
const REACT_LITE_YOUTUBE_EMBED_PATTERN = /^react-lite-youtube-embed$/;
const UNRESOLVED_IMPORT_PATTERN = /Could not resolve "([^"]+)"/;
const SOURCE_EXTENSION_PATTERN = /\.[cm]?[jt]sx?$/;
const TYPE_ONLY_IMPORT_PATTERNS = [
  /\b(?:export|import)\s+type\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/gu,
  /\b(?:export|import)\s*\{[^}]*\btype\b[^}]*\}\s*from\s*['"]([^'"]+)['"]/gu,
  /\bimport\s+(?!type\b)(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]/gu,
  /\bimport\s+(?:type\s+)?[$\w]+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/gu,
  /\bexport\s*(?:\*|\{[^}]*\})\s*from\s*['"]([^'"]+)['"]/gu,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/gu,
  /<reference\s+path\s*=\s*['"]([^'"]+)['"]/gu,
] as const;
const SOURCE_RESOLUTION_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const bundleEditor = async (
  entryPath: string,
  dependencies: Set<string>,
  silent = false,
  attemptedDependencies = dependencies
) => {
  const configPath = findEditorConfig(entryPath);

  return build({
    banner: {
      js: `import { createRequire as __plateCreateRequire } from 'node:module'; const __plateEntryUrl = ${JSON.stringify(pathToFileURL(entryPath).href)}; const require = __plateCreateRequire(__plateEntryUrl); const __plateImportMetaResolve = (specifier) => import.meta.resolve(specifier, __plateEntryUrl);`,
    },
    bundle: true,
    conditions: ['production'],
    define: {
      'import.meta.dirname': JSON.stringify(dirname(entryPath)),
      'import.meta.filename': JSON.stringify(entryPath),
      'import.meta.resolve': '__plateImportMetaResolve',
      'import.meta.url': JSON.stringify(pathToFileURL(entryPath).href),
    },
    format: 'esm',
    jsx: 'automatic',
    logLevel: silent ? 'silent' : 'info',
    logOverride: { 'ignored-bare-import': 'silent' },
    platform: 'node',
    plugins: [
      {
        name: 'plate-editor-entry',
        setup(context) {
          context.onResolve({ filter: EDITOR_ENTRY_PATTERN }, () => ({
            path: entryPath,
          }));
        },
      },
      {
        name: 'plate-codegen-dependencies',
        setup(context) {
          context.onResolve({ filter: ANY_PATH_PATTERN }, (args) => {
            if (
              args.resolveDir &&
              (args.path.startsWith('.') || args.path.startsWith('/'))
            ) {
              const candidate = resolve(args.resolveDir, args.path);

              attemptedDependencies.add(candidate);
              if (!extname(candidate)) {
                SOURCE_RESOLUTION_EXTENSIONS.forEach((extension) => {
                  attemptedDependencies.add(`${candidate}${extension}`);
                  attemptedDependencies.add(
                    join(candidate, `index${extension}`)
                  );
                });
              }
            }
          });
          context.onLoad(
            { filter: ANY_PATH_PATTERN, namespace: 'file' },
            (args) => {
              dependencies.add(args.path);
            }
          );
        },
      },
      {
        name: 'plate-empty-styles',
        setup(context) {
          context.onResolve({ filter: CSS_PATH_PATTERN }, ({ path }) => ({
            namespace: 'plate-empty-style',
            path,
          }));
          context.onLoad(
            { filter: ANY_PATH_PATTERN, namespace: 'plate-empty-style' },
            () => ({ contents: 'export default {};', loader: 'js' })
          );
        },
      },
      {
        name: 'plate-codegen-runtime-stubs',
        setup(context) {
          context.onResolve(
            { filter: REACT_LITE_YOUTUBE_EMBED_PATTERN },
            ({ path }) => ({ namespace: 'plate-codegen-runtime-stub', path })
          );
          context.onLoad(
            {
              filter: ANY_PATH_PATTERN,
              namespace: 'plate-codegen-runtime-stub',
            },
            () => ({
              contents:
                'export default function PlateCodegenRuntimeStub() { return null; }',
              loader: 'js',
            })
          );
        },
      },
    ],
    sourcemap: false,
    stdin: {
      contents: `import * as editorModule from 'plate:editor';
import { createBaseEditor } from '@platejs/core';
import {
  getPlateRuntime,
  isNominalPluginDescriptor,
} from '@platejs/core/internal';
import { createEditorSchemaContract } from '@platejs/plite';
import { getCompiledEditorSchema } from '@platejs/plite/internal';

const entryLabel = ${JSON.stringify(`Plate editor entry "${entryPath}"`)};
const exports = Object.entries(editorModule);
const formatCandidates = (candidates) =>
  candidates.length === 0
    ? ''
    : ' candidates (' + candidates.map(([name]) => name).join(', ') + ')';
const pluginCandidates = exports.filter(([, value]) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(isNominalPluginDescriptor)
);

if (pluginCandidates.length !== 1) {
  throw new TypeError(
    entryLabel +
      ' must export exactly one Plate plugin tuple; found ' +
      pluginCandidates.length +
      formatCandidates(pluginCandidates) +
      '.'
  );
}
const [pluginExportName, plugins] = pluginCandidates[0];
const baseEditor = createBaseEditor({ plugins, skipInitialization: true });
const baseRuntime = getPlateRuntime(baseEditor);
const schemaFields = new Set(['id', 'overrides', 'properties', 'root', 'version']);
const isRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const looksLikeApplicationSchema = (value) => {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value);

  if (
    keys.length === 0 ||
    keys.some((key) => !schemaFields.has(key)) ||
    ((value.id === undefined) !== (value.version === undefined)) ||
    (value.id !== undefined &&
      (typeof value.id !== 'string' ||
        value.id.length === 0 ||
        typeof value.version !== 'number')) ||
    (value.overrides !== undefined && !Array.isArray(value.overrides)) ||
    (value.properties !== undefined &&
      (!isRecord(value.properties) ||
        Object.values(value.properties).some(
          (property) => !isRecord(property)
        )))
  ) {
    return false;
  }

  return true;
};
const schemaCandidates = exports
  .filter(([, value]) => looksLikeApplicationSchema(value))
  .map(([name, value]) => {
    const candidateEditor = createBaseEditor({
      plugins,
      schema: value,
      skipInitialization: true,
    });

    return [name, value, candidateEditor];
  });

if (schemaCandidates.length > 1) {
  throw new TypeError(
    entryLabel +
      ' must export at most one Plate application schema; found ' +
      schemaCandidates.length +
      formatCandidates(schemaCandidates) +
      '.'
  );
}
const applicationSchema = schemaCandidates[0]?.[1];
const editor = schemaCandidates[0]?.[2] ?? baseEditor;
const runtime = applicationSchema ? getPlateRuntime(editor) : baseRuntime;
const schema = createEditorSchemaContract(getCompiledEditorSchema(editor));

export default {
  applicationName: applicationSchema?.id ?? 'editor',
  applicationProperties: Object.entries(applicationSchema?.properties ?? {}).map(
    ([localId, property]) => ({
      key: property.key ?? localId,
      localId,
    })
  ),
  bindings: runtime.model.bindings.map((binding) => ({
    ...(runtime.updateMethods[binding.name]?.includes('toggle')
      ? { authoredToggle: true }
      : {}),
    ...(binding.propertyKey ? { key: binding.propertyKey } : {}),
    name: binding.name,
    ...(binding.elementType ? { type: binding.elementType } : {}),
  })),
  pluginExportName,
  schema,
};
`,
      loader: 'ts',
      resolveDir: dirname(entryPath),
      sourcefile: 'plate-codegen-entry.ts',
    },
    tsconfig: configPath,
    write: false,
  });
};

const evaluationWorkerPath = fileURLToPath(
  new URL(
    import.meta.url.endsWith('.ts')
      ? './evaluation-worker.ts'
      : './evaluation-worker.js',
    import.meta.url
  )
);

const evaluateEditor = (bundlePath: string, resultPath: string, cwd: string) =>
  new Promise<void>((resolvePromise, reject) => {
    execFile(
      process.execPath,
      [
        '--experimental-import-meta-resolve',
        evaluationWorkerPath,
        bundlePath,
        resultPath,
      ],
      { cwd, maxBuffer: 16 * 1024 * 1024 },
      (error, _stdout, stderr) => {
        if (!error) {
          resolvePromise();
          return;
        }
        reject(
          new Error(
            stderr.trim() ||
              `Plate could not evaluate the bundled editor entry: ${error.message}`
          )
        );
      }
    );
  });

const readEditor = async (
  entryPath: string,
  cwd: string
): Promise<
  Readonly<{ editor: CompiledEditor; sourceFiles: readonly string[] }>
> => {
  const dependencies = new Set<string>();
  const result = await bundleEditor(
    entryPath,
    dependencies,
    false,
    new Set<string>()
  );
  const output = result.outputFiles?.[0];

  if (!output) throw new Error(`Plate could not bundle "${entryPath}".`);
  const outputDirectory = mkdtempSync(compilerDirectoryPrefix(entryPath));
  const outputPath = join(outputDirectory, 'editor.mjs');
  const resultPath = join(outputDirectory, 'editor.json');
  let imported: unknown;

  try {
    writeDurableFile(outputPath, output.text);
    await evaluateEditor(outputPath, resultPath, cwd);
    imported = JSON.parse(readFileSync(resultPath, 'utf-8'));
  } finally {
    rmSync(outputDirectory, { force: true, recursive: true });
  }

  if (
    !isRecord(imported) ||
    typeof imported.applicationName !== 'string' ||
    imported.applicationName.length === 0 ||
    !Array.isArray(imported.bindings) ||
    !Array.isArray(imported.applicationProperties) ||
    typeof imported.pluginExportName !== 'string' ||
    imported.pluginExportName.length === 0 ||
    !isRecord(imported.schema)
  ) {
    throw new Error(
      `Plate editor entry "${entryPath}" did not produce a valid compiled editor contract.`
    );
  }

  return Object.freeze({
    editor: imported as CompiledEditor,
    sourceFiles: Object.freeze(
      [...dependencies].filter((path) => !NODE_MODULES_PATH_PATTERN.test(path))
    ),
  });
};

const discoverTypeOnlySourceFiles = (
  roots: readonly string[],
  missingDependencies?: Set<string>,
  projectConfigPath?: string,
  configCache: EditorTsconfigCache = new Map(),
  dependencyCache = new Map<
    string,
    Readonly<{
      dependencies: readonly string[];
      missingCandidates: readonly string[];
    }>
  >()
) => {
  const sources = new Set(
    roots
      .map((path) => resolve(path))
      .filter(
        (path) =>
          !NODE_MODULES_PATH_PATTERN.test(path) &&
          existsSync(path) &&
          statSync(path).isFile()
      )
  );
  const pending = [...sources];

  while (pending.length > 0) {
    const path = pending.pop() ?? failInvariant('Expected value to be defined');

    if (!SOURCE_EXTENSION_PATTERN.test(path) || !existsSync(path)) continue;
    const dependencyKey = `${projectConfigPath ?? ''}\0${path}`;
    let discovered = dependencyCache.get(dependencyKey);

    if (!discovered) {
      const source = readFileSync(path, 'utf-8');
      const specifiers = new Set<string>();

      TYPE_ONLY_IMPORT_PATTERNS.forEach((pattern) => {
        for (const match of source.matchAll(pattern)) {
          specifiers.add(match[1]);
        }
      });
      const dependencies: string[] = [];
      const missingCandidates: string[] = [];

      specifiers.forEach((specifier) => {
        const dependency = resolveEditorSourceImport(
          path,
          specifier,
          configCache,
          projectConfigPath
        );

        if (dependency) dependencies.push(dependency);
        else {
          missingCandidates.push(
            ...editorSourceImportCandidates(
              path,
              specifier,
              configCache,
              projectConfigPath
            )
          );
        }
      });
      discovered = Object.freeze({
        dependencies: Object.freeze(dependencies),
        missingCandidates: Object.freeze(missingCandidates),
      });
      dependencyCache.set(dependencyKey, discovered);
    }
    discovered.missingCandidates.forEach((candidate) => {
      sources.add(candidate);
      missingDependencies?.add(candidate);
    });
    discovered.dependencies.forEach((dependency) => {
      if (sources.has(dependency)) return;
      sources.add(dependency);
      pending.push(dependency);
    });
  }

  return [...sources];
};

/**
 * Discover attempted source dependencies even when generation fails.
 *
 * @internal
 */
export const discoverEditorSourceFiles = (
  entry: string,
  options: Pick<GenerateEditorOptions, 'cwd'> = {}
) => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPath = resolve(cwd, entry);

  return Object.freeze(
    [entryPath, ...discoverEditorConfigFiles(entryPath)].filter(
      (fileName, index, files) => files.indexOf(fileName) === index
    )
  );
};

/**
 * Include esbuild-only and unresolved local dependencies for watch mode.
 *
 * @internal
 */
export const discoverEditorWatchFiles = async (
  entry: string,
  options: Pick<GenerateEditorOptions, 'cwd'> = {}
) => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPath = resolve(cwd, entry);
  const dependencies = new Set(discoverEditorSourceFiles(entry, options));
  const missingDependencies = new Set<string>();

  try {
    await bundleEditor(entryPath, dependencies, true);
  } catch (error) {
    if (isRecord(error) && Array.isArray(error.errors)) {
      error.errors.forEach((item) => {
        if (!isRecord(item) || typeof item.text !== 'string') return;
        const specifier = item.text.match(UNRESOLVED_IMPORT_PATTERN)?.[1];
        const location = isRecord(item.location) ? item.location : undefined;
        const importer =
          location && typeof location.file === 'string'
            ? resolve(cwd, location.file)
            : entryPath;

        if (specifier?.startsWith('.')) {
          // Keep the unresolved extensionless candidate. Watch mode targets
          // its parent directory, then an unmatched add retries every entry.
          missingDependencies.add(resolve(dirname(importer), specifier));
        }
      });
    }
  }
  discoverTypeOnlySourceFiles(
    [...dependencies],
    missingDependencies,
    findEditorConfig(entryPath)
  ).forEach((path) => {
    dependencies.add(path);
  });
  const generatedPaths = new Set(Object.values(outputPaths(entryPath)));

  return Object.freeze(
    [...dependencies].filter(
      (path) =>
        !NODE_MODULES_PATH_PATTERN.test(path) &&
        !generatedPaths.has(path) &&
        (existsSync(path) || missingDependencies.has(path))
    )
  );
};

const propertyName = (name: string) =>
  PROPERTY_NAME_PATTERN.test(name) ? name : JSON.stringify(name);
type MaterializationRequest = Readonly<{
  entryPath: string;
  bindings: readonly ElementBinding[];
  owners: readonly string[];
  generatedPaths: ReadonlySet<string>;
  pluginExportName: string;
  schema: EditorSchemaContract;
}>;

type MaterializationGroup = Readonly<{
  aliasName: string;
  properties: ReadonlyArray<
    Readonly<{
      key: string;
      propertyId: string;
    }>
  >;
  source: string;
}>;

const materializePropertyGroups = async (
  requests: readonly MaterializationRequest[],
  cwd: string,
  existingSession?: NativeTypeScriptSession
): Promise<readonly MaterializedProperties[]> => {
  const session = existingSession ?? new NativeTypeScriptSession(cwd);
  const ownsSession = !existingSession;
  const helperPaths: string[] = [];
  let prepared: ReadonlyArray<
    Readonly<{
      generatedPaths: ReadonlySet<string>;
      groups: readonly MaterializationGroup[];
      helper: string;
      helperPath: string;
      nativeAliases: ReadonlyArray<
        Readonly<{
          name: string;
          position: number;
          propertyNames: readonly string[];
        }>
      >;
    }>
  >;

  try {
    prepared = requests.map(
      ({
        bindings,
        entryPath,
        generatedPaths,
        owners,
        pluginExportName,
        schema,
      }) => {
        const helperPath = session.helperPath(entryPath);

        helperPaths.push(helperPath);
        const relativeEntry = relative(
          dirname(helperPath),
          entryPath.slice(0, -extname(entryPath).length)
        ).replaceAll('\\', '/');
        const entryImport = relativeEntry.startsWith('.')
          ? relativeEntry
          : `./${relativeEntry}`;
        const bindingByType = new Map(
          bindings.map((binding) => [binding.type, binding])
        );
        const groupMap = new Map<
          string,
          {
            aliasName: string;
            properties: Array<{ key: string; propertyId: string }>;
            source: string;
          }
        >();

        schema.properties.byId.forEach((property) => {
          if (
            typeof property.key !== 'string' ||
            property.descriptor.kind !== 'json'
          ) {
            return;
          }
          let groupKey = 'text';
          let aliasName = '__PlateText';
          let source = 'InternalEditorDefinitionTextProperties<__PlatePlugins>';

          if (property.placement === 'element') {
            const hasIdentityCollision = schema.properties.byId.some(
              (candidate) =>
                candidate.id !== property.id &&
                candidate.owner === property.owner &&
                candidate.key === property.key
            );
            const element = hasIdentityCollision
              ? schema.elements.byType.find(({ propertyIds }) =>
                  propertyIds.includes(property.id)
                )
              : undefined;
            const binding = element
              ? bindingByType.get(element.type)
              : undefined;

            if (binding) {
              const bindingIndex = bindings.indexOf(binding);

              groupKey = `element:${binding.name}`;
              aliasName = `__PlateElement${bindingIndex}`;
              source = `InternalEditorDefinitionElementProperties<__PlatePlugins, ${JSON.stringify(binding.name)}>`;
            } else {
              groupKey = `owner:${property.owner}`;
              aliasName = `__PlateOwner${owners.indexOf(property.owner)}`;
              source = `InternalEditorDefinitionOwnedElementProperties<__PlatePlugins, ${JSON.stringify(property.owner)}>`;
            }
          }
          const group = groupMap.get(groupKey) ?? {
            aliasName,
            properties: [],
            source,
          };

          group.properties.push({ key: property.key, propertyId: property.id });
          groupMap.set(groupKey, group);
        });
        const groups: MaterializationGroup[] = [...groupMap.values()];
        const aliases = bindings
          .map(
            (binding, index) =>
              `type __PlateElement${index} = InternalEditorDefinitionElementProperties<__PlatePlugins, ${JSON.stringify(binding.name)}>;`
          )
          .join('\n');
        const ownerAliases = owners
          .map(
            (owner, index) =>
              `type __PlateOwner${index} = InternalEditorDefinitionOwnedElementProperties<__PlatePlugins, ${JSON.stringify(owner)}>;`
          )
          .join('\n');
        const aliasSource = `type __PlatePlugins = (typeof EditorModule)[${JSON.stringify(pluginExportName)}];\n${aliases}\n${ownerAliases}\ntype __PlateText = InternalEditorDefinitionTextProperties<__PlatePlugins>;`;
        const helper = `import type * as EditorModule from ${JSON.stringify(entryImport)};\nimport type { InternalEditorDefinitionElementProperties, InternalEditorDefinitionOwnedElementProperties, InternalEditorDefinitionTextProperties } from '@platejs/core/internal';\n${aliasSource}\n`;
        const propertyNamesByAlias = new Map(
          groups.map((group) => [
            group.aliasName,
            group.properties.map(({ key }) => key),
          ])
        );
        const nativeAliases = [
          ...bindings.map((_binding, index) => `__PlateElement${index}`),
          ...owners.map((_owner, index) => `__PlateOwner${index}`),
          '__PlateText',
        ].map((name) => ({
          name,
          position: helper.indexOf(`type ${name}`) + 5,
          propertyNames: propertyNamesByAlias.get(name) ?? [],
        }));

        return {
          generatedPaths,
          groups,
          helper,
          helperPath,
          nativeAliases,
        };
      }
    );
  } catch (error) {
    session.discardHelpers(helperPaths);
    if (ownsSession) await session.close();
    throw error;
  }

  try {
    const materialized = await session.materialize(
      prepared.map(({ generatedPaths, helper, helperPath, nativeAliases }) => ({
        aliases: nativeAliases,
        generatedPaths,
        path: helperPath,
        source: helper,
      }))
    );

    return materialized.map(({ properties, sourceFiles }, index) => {
      const request = prepared[index];

      return Object.freeze({
        byPropertyId: Object.freeze(
          Object.fromEntries(
            request.groups.flatMap((group) =>
              group.properties.map(({ key, propertyId }) => [
                propertyId,
                properties[group.aliasName][key],
              ])
            )
          )
        ),
        sourceFiles,
      });
    });
  } finally {
    if (ownsSession) await session.close();
  }
};

const toPascalCase = (value: string) => {
  const result = value
    .replace(CAMEL_BOUNDARY_PATTERN, '$1 $2')
    .split(NON_IDENTIFIER_PATTERN)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('');

  return LEADING_DIGIT_PATTERN.test(result)
    ? `Node${result}`
    : result || 'Node';
};

const createBindings = (
  compiledBindings: readonly CompiledPluginBinding[],
  schema: EditorSchemaContract
) => {
  const names = new Map(
    compiledBindings.flatMap(({ name, type }) =>
      type ? [[type, name] as const] : []
    )
  );
  const used = new Map<string, number>([['EditorElement', 1]]);

  return schema.elements.byType.map(({ type }) => {
    const name = names.get(type);

    if (!name) {
      throw new Error(
        `Compiled element type "${type}" has no Plate plugin owner.`
      );
    }
    const base = `${toPascalCase(name)}Element`;
    const count = used.get(base) ?? 0;

    used.set(base, count + 1);

    return Object.freeze({
      name,
      type,
      typeName: count === 0 ? base : `${base}${count + 1}`,
    });
  });
};

const renderProperties = (properties: TypeProperties, indent: string) =>
  Object.entries(properties)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(
      ([name, value]) =>
        `${indent}readonly ${propertyName(name)}${value.optional ? '?' : ''}: ${value.type};`
    )
    .join('\n');

const renderExactReadonlyRecord = (fields: string, closingIndent = '') =>
  fields
    ? `Readonly<{\n${fields}\n${closingIndent}}>`
    : 'Readonly<Record<PropertyKey, never>>';

const propertyTypeFromContract = (
  descriptor: ContractPropertyDescriptor
): Readonly<{ optional: boolean; type: string }> => {
  let type: string;

  switch (descriptor.kind) {
    case 'boolean': {
      type = 'boolean';
      break;
    }
    case 'enum': {
      type =
        descriptor.values?.map((value) => JSON.stringify(value)).join(' | ') ||
        'string';
      break;
    }
    case 'number': {
      type = 'number';
      break;
    }
    case 'set': {
      type = `readonly (${descriptor.item ? propertyTypeFromContract(descriptor.item).type : 'unknown'})[]`;
      break;
    }
    case 'string': {
      type = 'string';
      break;
    }
    default: {
      type = 'unknown';
    }
  }

  return Object.freeze({ optional: !descriptor.required, type });
};

const childUnion = (
  program: EditorSchemaContractContentProgram,
  bindingByType: ReadonlyMap<string, ElementBinding>,
  textName: string
) => {
  const children = program.allowedElementTypes.map((type) => {
    const binding = bindingByType.get(type);

    return binding?.typeName ?? 'Element';
  });

  if (program.allowsUnknownElements) children.push('Element');
  if (program.allowsText) children.push(textName);

  return [...new Set(children)].join(' | ') || 'never';
};

const childrenType = (
  program: EditorSchemaContractContentProgram | null,
  bindingByType: ReadonlyMap<string, ElementBinding>,
  textName: string
) => {
  if (!program) return 'readonly []';
  const child = childUnion(program, bindingByType, textName);

  if (program.max === 1 && program.min === 1) return `readonly [${child}]`;
  if (program.max === 1 && program.min === 0) {
    return `readonly [] | readonly [${child}]`;
  }

  return `readonly (${child})[]`;
};

const relativeImport = (fromPath: string, toPath: string) => {
  const value = relative(dirname(fromPath), toPath)
    .replaceAll('\\', '/')
    .replace(SOURCE_EXTENSION_PATTERN, '');

  return value.startsWith('.') ? value : `./${value}`;
};

const portableShellArgument = (value: string) => {
  if (SHELL_EXPANSION_PATTERN.test(value)) return undefined;

  return PORTABLE_SHELL_PATH_PATTERN.test(value) ? value : `"${value}"`;
};

const generatedHeader = (entryPath: string) => {
  const packageRoot = findProjectRoot(entryPath);
  const configPath = findEditorConfig(entryPath);
  const sourceRoot = existsSync(join(packageRoot, 'package.json'))
    ? packageRoot
    : configPath
      ? dirname(configPath)
      : dirname(entryPath);
  const source = relative(sourceRoot, entryPath).replaceAll('\\', '/');
  const commentSource = JSON.stringify(source)
    .slice(1, -1)
    .replaceAll('*/', '*\\/');
  const argument = portableShellArgument(source);
  const command =
    source === 'src/editor.ts'
      ? 'pnpm exec plate generate'
      : argument
        ? `pnpm exec plate generate -- ${argument}`
        : undefined;

  return `/* Generated by @platejs/cli from ${commentSource}.\n * ${command ? `Regenerate with: ${command}` : 'Regenerate with @platejs/cli using the source path above.'}\n * Do not edit.\n */`;
};

const renderGeneratedTypes = (
  entryPath: string,
  typesPath: string,
  pluginExportName: string,
  schema: EditorSchemaContract,
  bindings: readonly ElementBinding[],
  properties: MaterializedProperties,
  compiledBindings: readonly CompiledPluginBinding[],
  applicationProperties: readonly CompiledApplicationProperty[],
  applicationName: string
) => {
  const bindingByType = new Map(
    bindings.map((binding) => [binding.type, binding])
  );
  const elementByType = new Map(
    schema.elements.byType.map((element) => [element.type, element])
  );
  const compiledBindingByName = new Map(
    compiledBindings.map((binding) => [binding.name, binding])
  );
  const propertyById = new Map(
    schema.properties.byId.map((property) => [property.id, property])
  );
  const getProperty = (propertyId: string) => {
    const property = propertyById.get(propertyId);

    if (!property) {
      throw new Error(
        `Generated property binding "${propertyId}" does not exist in the compiled schema.`
      );
    }

    return property;
  };
  const renderPropertyKeyType = (key: SchemaPropertyKey) =>
    typeof key === 'string'
      ? JSON.stringify(key)
      : `Readonly<{ readonly kind: 'prefix'; readonly prefix: ${JSON.stringify(key.prefix)} }>`;
  const renderPropertyKeyValue = (key: SchemaPropertyKey) =>
    typeof key === 'string'
      ? JSON.stringify(key)
      : `Object.freeze({ kind: 'prefix' as const, prefix: ${JSON.stringify(key.prefix)} })`;
  const renderPropertyHandleType = (propertyId: string) => {
    const property = getProperty(propertyId);

    return `SchemaPropertyHandle<${renderPropertyKeyType(property.key)}, ${propertyTypeFromContract(property.descriptor).type}, ${JSON.stringify(property.placement)}>`;
  };
  const renderPropertyHandleValue = (propertyId: string) => {
    const property = getProperty(propertyId);

    return `Object.freeze({ id: ${JSON.stringify(property.id)}, key: ${renderPropertyKeyValue(property.key)}, kind: 'schema-property' as const, placement: ${JSON.stringify(property.placement)} })`;
  };
  const applicationOwner = `schema:application:${applicationName}`;
  const resolvedApplicationProperties = applicationProperties.map(
    ({ key, localId }) => {
      const matches = schema.properties.byId.filter(
        (property) =>
          property.owner === applicationOwner &&
          (typeof property.key === 'string'
            ? property.key === key
            : typeof key !== 'string' && property.key.prefix === key.prefix)
      );

      if (matches.length !== 1) {
        throw new Error(
          `Application property "${localId}" must resolve to exactly one compiled property; found ${matches.length}.`
        );
      }

      return Object.freeze({ localId, property: matches[0] });
    }
  );
  const schemaPluginBindings = compiledBindings.filter(
    (binding) => binding.type || binding.key
  );
  const schemaPluginTypeFields = schemaPluginBindings
    .map((binding) => {
      const identity = [
        binding.type ? `readonly type: ${JSON.stringify(binding.type)};` : '',
        binding.key ? `readonly key: ${JSON.stringify(binding.key)};` : '',
      ]
        .filter(Boolean)
        .join(' ');

      return `    readonly ${propertyName(binding.name)}: Readonly<{ ${identity} }>;`;
    })
    .join('\n');
  const schemaApplicationTypeFields = resolvedApplicationProperties
    .map(
      ({ localId, property }) =>
        `    readonly ${propertyName(localId)}: ${renderPropertyHandleType(property.id)};`
    )
    .join('\n');
  const schemaPluginValueFields = schemaPluginBindings
    .map((binding) => {
      const identity = [
        binding.type ? `type: ${JSON.stringify(binding.type)}` : '',
        binding.key ? `key: ${JSON.stringify(binding.key)}` : '',
      ]
        .filter(Boolean)
        .join(', ');

      return `    ${propertyName(binding.name)}: Object.freeze({ ${identity} }),`;
    })
    .join('\n');
  const schemaApplicationValueFields = resolvedApplicationProperties
    .map(
      ({ localId, property }) =>
        `    ${propertyName(localId)}: ${renderPropertyHandleValue(property.id)},`
    )
    .join('\n');
  const resolveElementProperties = (binding: ElementBinding) => {
    const element =
      elementByType.get(binding.type) ??
      failInvariant('Expected value to be defined');
    const persisted: Record<
      string,
      Readonly<{ optional: boolean; type: string }>
    > = {};
    const construction: Record<
      string,
      Readonly<{ optional: boolean; type: string }>
    > = {};
    const materializedPropertyIds = new Set(
      element.construction.materializedPropertyIds
    );

    element.propertyIds.forEach((propertyId) => {
      const property = propertyById.get(propertyId);

      if (!property || typeof property.key !== 'string') return;
      const fallback = propertyTypeFromContract(property.descriptor);
      const type =
        property.descriptor.kind === 'json'
          ? (properties.byPropertyId[propertyId]?.type ?? fallback.type)
          : fallback.type;

      persisted[property.key] = Object.freeze({
        optional:
          !property.descriptor.required &&
          (!materializedPropertyIds.has(propertyId) ||
            property.descriptor.omitDefault),
        type,
      });
      construction[property.key] = Object.freeze({
        optional: !property.descriptor.required,
        type,
      });
    });

    return Object.freeze({ construction, persisted });
  };
  const resolvedProperties = new Map(
    bindings.map((binding) => [binding.name, resolveElementProperties(binding)])
  );
  const resolvedTextProperties = Object.freeze(
    Object.fromEntries(
      schema.properties.byId.flatMap((property) =>
        property.placement === 'text' && typeof property.key === 'string'
          ? [
              [
                property.key,
                properties.byPropertyId[property.id] ??
                  propertyTypeFromContract(property.descriptor),
              ] as const,
            ]
          : []
      )
    )
  );
  const elementDeclarations = bindings
    .map((binding) => {
      const element =
        elementByType.get(binding.type) ??
        failInvariant('Expected value to be defined');
      const fields = renderProperties(
        (
          resolvedProperties.get(binding.name) ??
          failInvariant('Expected value to be defined')
        ).persisted,
        '  '
      );
      const childRoots =
        element.contentRoots.length > 0
          ? `\n  readonly childRoots: Readonly<{ ${element.contentRoots
              .map(([slot]) => `${propertyName(slot)}: string;`)
              .join(' ')} }>;`
          : '';

      return `export interface ${binding.typeName} extends Element {\n  readonly children: ${childrenType(
        element.content,
        bindingByType,
        'EditorText'
      )};${childRoots}\n  readonly type: ${JSON.stringify(binding.type)};${fields ? `\n${fields}` : ''}\n}`;
    })
    .join('\n\n');
  const allowedElementTypeSet = new Set(
    schema.primaryRoot.content.allowedElementTypes
  );
  const mutationDeclarations = bindings
    .map((binding) => {
      const element =
        elementByType.get(binding.type) ??
        failInvariant('Expected value to be defined');
      const mutation =
        resolvedProperties.get(binding.name) ??
        failInvariant('Expected value to be defined');
      const construction = renderProperties(mutation.construction, '      ');
      const persisted = renderProperties(mutation.persisted, '      ');
      const toggle =
        element.groups.includes('textBlock') &&
        allowedElementTypeSet.has(binding.type) &&
        Object.values(mutation.construction).every(
          (property) => property.optional
        ) &&
        compiledBindingByName.get(binding.name)?.authoredToggle !== true
          ? '\n    readonly toggle: true;'
          : '';

      return `  readonly ${propertyName(binding.name)}: Readonly<{\n    readonly construction: ${renderExactReadonlyRecord(construction, '    ')};\n    readonly properties: ${renderExactReadonlyRecord(persisted, '    ')};${toggle}\n    readonly type: ${JSON.stringify(binding.type)};\n  }>;`;
    })
    .join('\n');
  const textFields = renderProperties(resolvedTextProperties, '  ');
  const rootType = childrenType(
    schema.primaryRoot.content,
    bindingByType,
    'EditorText'
  );
  const elementUnion =
    bindings.map(({ typeName }) => typeName).join(' | ') || 'Element';
  const editorImport = relativeImport(typesPath, entryPath);
  const coreTypeImports = [
    'Element',
    'GeneratedEditorTypeProvider',
    // Plugin bindings emit only invariant type/key identities. Application
    // properties are the sole generated SchemaPropertyHandle surface.
    ...(schemaApplicationTypeFields ? ['SchemaPropertyHandle'] : []),
    'Text',
  ].join(', ');

  return `${generatedHeader(entryPath)}\nimport type { ${coreTypeImports} } from 'platejs';\nimport type { PlateEditor } from 'platejs/react';\n\nimport type * as EditorModule from ${JSON.stringify(editorImport)};\n\nexport interface EditorText extends Text {\n  readonly text: string;${textFields ? `\n${textFields}` : ''}\n}\n\n${elementDeclarations}\n\nexport type EditorElement = ${elementUnion};\nexport type Value = ${rootType};\nexport type Schema = Readonly<{\n  readonly plugins: ${renderExactReadonlyRecord(schemaPluginTypeFields, '  ')};\n  readonly properties: ${renderExactReadonlyRecord(schemaApplicationTypeFields, '  ')};\n}>;\nexport type Mutations = ${renderExactReadonlyRecord(mutationDeclarations)};\ntype Types = Readonly<{\n  element: EditorElement;\n  mutations: Mutations;\n  schema: Schema;\n  text: EditorText;\n  value: Value;\n}>;\n\nexport const schema = Object.freeze({\n  plugins: Object.freeze({${schemaPluginValueFields ? `\n${schemaPluginValueFields}\n  ` : ''}}),\n  properties: Object.freeze({${schemaApplicationValueFields ? `\n${schemaApplicationValueFields}\n  ` : ''}}),\n}) satisfies Schema;\n\nexport const fingerprint = ${JSON.stringify(schema.fingerprint)};\n\ntype EditorPlugins = (typeof EditorModule)[${JSON.stringify(pluginExportName)}] & GeneratedEditorTypeProvider<Types>;\n\nexport type Editor = PlateEditor<EditorPlugins>;\n`;
};

const outputPaths = (entryPath: string) => {
  const extension = extname(entryPath);
  const base = basename(entryPath, extension);
  const directory = dirname(entryPath);

  return {
    schemaPath: join(directory, `${base}.schema.json`),
    typesPath: join(directory, `${base}.generated.ts`),
  };
};

/**
 * Generated artifact paths owned by one editor module.
 *
 * @internal
 */
export const editorArtifactPaths = (entryPath: string) =>
  Object.freeze(Object.values(outputPaths(resolve(entryPath))));

const writeDurableFile = (path: string, content: string) => {
  mkdirSync(dirname(path), { recursive: true });
  const descriptor = openSync(path, 'w');

  try {
    writeFileSync(descriptor, content);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
};

type ArtifactJournal = Readonly<{
  artifacts: ReadonlyArray<
    Readonly<{
      backup: string;
      existed: boolean;
      path: string;
      temporary: string;
    }>
  >;
  phase: 'installed' | 'installing';
  version: 1;
}>;

type ArtifactJournalReference = Readonly<{
  journalPath: string;
  version: 1;
}>;

type ArtifactLock = Readonly<{
  path: string;
}>;

type ArtifactLockOwner = Readonly<{
  pid: number;
  processToken: string;
  token: string;
  version: 1;
}>;

type WatchArtifactOwner = Readonly<{
  entryPath: string;
  pid: number;
  processToken: string;
  token: string;
  version: 1;
}>;

const ARTIFACT_PROCESS_TOKEN = randomUUID();

class SimulatedArtifactProcessInterruptionError extends Error {
  override name = 'SimulatedArtifactProcessInterruptionError';

  constructor() {
    super('simulated process interruption');
  }
}

const artifactBatchFingerprint = (paths: readonly string[]) =>
  createHash('sha256')
    .update(paths.map(canonicalPath).sort().join('\0'))
    .digest('hex')
    .slice(0, 32);

const artifactJournalPath = (paths: readonly string[]) => {
  const sorted = [...paths].sort();

  return join(
    artifactStateRoot(sorted[0]),
    'transactions',
    `${artifactBatchFingerprint(sorted)}.json`
  );
};

const artifactJournalReferencePath = (artifactPath: string) =>
  join(
    artifactStateRoot(artifactPath),
    'artifacts',
    `${pathFingerprint(artifactPath)}.json`
  );

const artifactLockPath = (artifactPath: string) =>
  join(
    artifactStateRoot(artifactPath),
    'locks',
    `artifact-${pathFingerprint(artifactPath)}`
  );

const artifactBatchLockPath = (paths: readonly string[]) => {
  const sorted = [...paths].sort();

  return join(
    artifactStateRoot(sorted[0]),
    'locks',
    `transaction-${artifactBatchFingerprint(sorted)}`
  );
};

const isProcessAlive = (pid: number) => {
  try {
    process.kill(pid, 0);

    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
};

const watchArtifactOwnerPath = (artifactPath: string) =>
  join(
    artifactStateRoot(artifactPath),
    'watch',
    `${pathFingerprint(artifactPath)}.json`
  );

/**
 * Private ownership records for one watched editor.
 *
 * @internal
 */
export const editorWatchOwnershipPaths = (entryPath: string) =>
  Object.freeze(editorArtifactPaths(entryPath).map(watchArtifactOwnerPath));

/**
 * Private state roots excluded from editor source watches.
 *
 * @internal
 */
export const editorPrivateStateRoots = (entryPaths: readonly string[]) =>
  Object.freeze([
    ...new Set(
      entryPaths.flatMap((entryPath) =>
        editorArtifactPaths(entryPath).map(artifactStateRoot)
      )
    ),
  ]);

const readActiveWatchArtifactOwner = (
  path: string
): WatchArtifactOwner | undefined => {
  if (!existsSync(path)) return undefined;
  const owner = JSON.parse(readFileSync(path, 'utf-8')) as WatchArtifactOwner;

  if (
    owner.version !== 1 ||
    typeof owner.entryPath !== 'string' ||
    typeof owner.pid !== 'number' ||
    typeof owner.processToken !== 'string' ||
    typeof owner.token !== 'string'
  ) {
    throw new Error(`Invalid Plate watch artifact owner: ${path}`);
  }
  if (
    (owner.pid === process.pid &&
      owner.processToken !== ARTIFACT_PROCESS_TOKEN) ||
    !isProcessAlive(owner.pid)
  ) {
    rmSync(path, { force: true });

    return undefined;
  }

  return owner;
};

const assertNoForeignWatchArtifactOwner = (
  artifactPaths: readonly string[]
) => {
  artifactPaths.forEach((artifactPath) => {
    const owner = readActiveWatchArtifactOwner(
      watchArtifactOwnerPath(artifactPath)
    );

    if (owner && owner.processToken !== ARTIFACT_PROCESS_TOKEN) {
      throw new Error(
        `Another Plate watcher owns generated artifact ${artifactPath} from ${owner.entryPath}.`
      );
    }
  });
};

/**
 * Hold exclusive generated-artifact ownership for a watch lifetime.
 *
 * @internal
 */
export const acquireEditorWatchOwnership = (entryPaths: readonly string[]) => {
  const owned: Array<{ path: string; token: string }> = [];
  const entryByArtifactPath = new Map(
    entryPaths.flatMap((entryPath) =>
      editorArtifactPaths(entryPath).map((artifactPath) => [
        artifactPath,
        entryPath,
      ])
    )
  );
  const artifactPaths = [...new Set(entryByArtifactPath.keys())].sort();
  const gates = acquireArtifactPublicationGates(artifactPaths);

  try {
    artifactPaths.forEach((artifactPath) => {
      const entryPath =
        entryByArtifactPath.get(artifactPath) ??
        failInvariant('Expected value to be defined');
      const path = watchArtifactOwnerPath(artifactPath);
      const token = randomUUID();
      const owner = `${JSON.stringify({
        entryPath,
        pid: process.pid,
        processToken: ARTIFACT_PROCESS_TOKEN,
        token,
        version: 1,
      } satisfies WatchArtifactOwner)}\n`;

      mkdirSync(dirname(path), { recursive: true });
      while (true) {
        const temporary = `${path}.${token}.tmp`;

        try {
          writeFileSync(temporary, owner);
          linkSync(temporary, path);
          owned.push({ path, token });
          break;
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw error;
          }
          const active = readActiveWatchArtifactOwner(path);

          if (active) {
            throw new Error(
              `Another Plate watcher owns generated artifact ${artifactPath} from ${active.entryPath}.`,
              { cause: error }
            );
          }
        } finally {
          rmSync(temporary, { force: true });
        }
      }
    });
  } catch (error) {
    owned.forEach(({ path }) => {
      rmSync(path, { force: true });
    });
    throw error;
  } finally {
    releaseArtifactPublicationGates(gates);
  }
  let released = false;

  return Object.freeze({
    release: () => {
      if (released) return;
      released = true;
      owned.forEach(({ path, token }) => {
        const owner = readActiveWatchArtifactOwner(path);

        if (
          owner?.processToken === ARTIFACT_PROCESS_TOKEN &&
          owner.token === token
        ) {
          rmSync(path, { force: true });
        }
      });
    },
  });
};

const acquireArtifactLock = (lockPath: string): ArtifactLock => {
  const directory = dirname(lockPath);
  const prefix = `${basename(lockPath)}.`;
  const token = randomUUID();
  const path = join(directory, `${prefix}${process.pid}-${token}.json`);

  const temporary = `${path}.tmp`;

  mkdirSync(directory, { recursive: true });
  try {
    writeFileSync(
      temporary,
      `${JSON.stringify({ pid: process.pid, processToken: ARTIFACT_PROCESS_TOKEN, token, version: 1 } satisfies ArtifactLockOwner)}\n`
    );
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
  try {
    for (const name of readdirSync(directory)) {
      if (!name.startsWith(prefix)) continue;
      const candidate = join(directory, name);

      if (candidate === path) continue;
      const owner = JSON.parse(
        readFileSync(candidate, 'utf-8')
      ) as ArtifactLockOwner;

      if (
        owner.version !== 1 ||
        typeof owner.pid !== 'number' ||
        typeof owner.processToken !== 'string' ||
        typeof owner.token !== 'string'
      ) {
        throw new Error(`Invalid Plate artifact lock: ${path}`);
      }
      if (
        owner.processToken === ARTIFACT_PROCESS_TOKEN ||
        (owner.pid !== process.pid && isProcessAlive(owner.pid))
      ) {
        throw new Error(
          'Another process is already replacing these generated artifacts.'
        );
      }
      rmSync(candidate, { force: true });
    }

    return { path };
  } catch (error) {
    rmSync(path, { force: true });
    throw error;
  }
};

const releaseArtifactLock = ({ path }: ArtifactLock) => {
  rmSync(path, { force: true });
};

const acquireArtifactPublicationGates = (artifactPaths: readonly string[]) => {
  const locks: ArtifactLock[] = [];

  try {
    [...artifactPaths].sort().forEach((artifactPath) => {
      locks.push(acquireArtifactLock(artifactLockPath(artifactPath)));
    });
  } catch (error) {
    locks.reverse().forEach(releaseArtifactLock);
    throw error;
  }

  return locks;
};

const releaseArtifactPublicationGates = (locks: readonly ArtifactLock[]) => {
  [...locks].reverse().forEach(releaseArtifactLock);
};

const writeArtifactJournal = (path: string, journal: ArtifactJournal) => {
  const temporary = `${path}.${process.pid}-${randomUUID()}.tmp`;

  try {
    writeDurableFile(temporary, `${JSON.stringify(journal)}\n`);
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
};

const writeArtifactJournalReference = (
  artifactPath: string,
  journalPath: string
) => {
  const path = artifactJournalReferencePath(artifactPath);
  const temporary = `${path}.${process.pid}-${randomUUID()}.tmp`;

  try {
    writeDurableFile(
      temporary,
      `${JSON.stringify({ journalPath, version: 1 } satisfies ArtifactJournalReference)}\n`
    );
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
};

const readArtifactJournalReference = (artifactPath: string) => {
  const path = artifactJournalReferencePath(artifactPath);

  if (!existsSync(path)) return undefined;
  const reference = JSON.parse(
    readFileSync(path, 'utf-8')
  ) as ArtifactJournalReference;

  if (
    reference.version !== 1 ||
    typeof reference.journalPath !== 'string' ||
    !isAbsolute(reference.journalPath)
  ) {
    throw new Error(`Invalid Plate artifact journal reference: ${path}`);
  }

  return reference;
};

const readArtifactJournal = (
  path: string,
  expectedPaths?: readonly string[]
): ArtifactJournal | undefined => {
  if (!existsSync(path)) return undefined;
  const journal = JSON.parse(readFileSync(path, 'utf-8')) as ArtifactJournal;
  const actual = journal.artifacts.map((artifact) => artifact.path).sort();
  const expected = expectedPaths ? new Set(expectedPaths) : undefined;

  if (
    journal.version !== 1 ||
    (journal.phase !== 'installed' && journal.phase !== 'installing') ||
    actual.length === 0 ||
    new Set(actual).size !== actual.length ||
    (expected && actual.some((value) => !expected.has(value)))
  ) {
    throw new Error(`Invalid Plate artifact journal: ${path}`);
  }

  return journal;
};

const recoverArtifactJournal = (
  path: string,
  expectedPaths: readonly string[]
) => {
  const journal = readArtifactJournal(path, expectedPaths);

  if (!journal) return;
  if (journal.phase === 'installed') {
    journal.artifacts.forEach(({ backup, temporary }) => {
      rmSync(backup, { force: true });
      rmSync(temporary, { force: true });
    });
  } else {
    journal.artifacts.forEach(
      ({ backup, existed, path: innerPath, temporary }) => {
        rmSync(temporary, { force: true });
        if (existsSync(backup)) {
          rmSync(innerPath, { force: true });
          renameSync(backup, innerPath);
        } else if (!existed) {
          rmSync(innerPath, { force: true });
        } else if (!existsSync(innerPath)) {
          throw new Error(
            `Cannot recover Plate artifact transaction because both the artifact and backup are missing: ${innerPath}`
          );
        }
      }
    );
  }
  new Set(journal.artifacts.map(({ backup }) => dirname(backup))).forEach(
    (directory) => {
      rmSync(directory, { force: true, recursive: true });
    }
  );
  journal.artifacts.forEach(({ path: innerPath2 }) => {
    rmSync(artifactJournalReferencePath(innerPath2), { force: true });
  });
  rmSync(path, { force: true });
};

const acquireArtifactRecoveryGates = (artifactPaths: readonly string[]) => {
  let paths = [...new Set(artifactPaths.map((path) => resolve(path)))].sort();

  while (true) {
    const gates = acquireArtifactPublicationGates(paths);

    try {
      const journalPaths = new Set<string>();

      paths.forEach((path) => {
        const reference = readArtifactJournalReference(path);

        if (!reference) return;
        // Publication holds this artifact's gate. A missing referenced journal
        // can therefore only belong to a process that died before it made the
        // batch recoverable or changed any artifact.
        if (!existsSync(reference.journalPath)) {
          rmSync(artifactJournalReferencePath(path), { force: true });

          return;
        }
        journalPaths.add(reference.journalPath);
      });
      const recoveredPaths = [...journalPaths].flatMap((journalPath) => {
        const journal = readArtifactJournal(journalPath);

        return journal?.artifacts.map(({ path }) => path) ?? [];
      });
      const nextPaths = [...new Set([...paths, ...recoveredPaths])].sort();

      if (
        nextPaths.length === paths.length &&
        nextPaths.every((path, index) => path === paths[index])
      ) {
        return { gates, journalPaths, paths };
      }
      releaseArtifactPublicationGates(gates);
      paths = nextPaths;
    } catch (error) {
      releaseArtifactPublicationGates(gates);
      throw error;
    }
  }
};

const recoverReferencedArtifactJournals = (
  journalPaths: ReadonlySet<string>
) => {
  journalPaths.forEach((journalPath) => {
    const journal = readArtifactJournal(journalPath);

    if (journal) {
      recoverArtifactJournal(
        journalPath,
        journal.artifacts.map(({ path }) => path)
      );
    }
  });
};

const isCurrent = (path: string, content: string) =>
  existsSync(path) && readFileSync(path, 'utf-8') === content;

const replaceArtifactsWithResult = (
  artifacts: ReadonlyArray<Readonly<{ content: string; path: string }>>,
  {
    afterInstall,
    interruptAfterInstall,
    interruptAfterReference,
    removeBackup = (path) => {
      rmSync(path, { force: true });
    },
  }: Readonly<{
    afterInstall?: (path: string, index: number) => void;
    /** Test-only process interruption point. */
    interruptAfterInstall?: number;
    /** Test-only interruption before artifacts can be modified. */
    interruptAfterReference?: number;
    removeBackup?: (path: string, index: number) => void;
  }> = {}
) => {
  if (artifacts.length === 0) return Object.freeze([] as string[]);
  const paths = artifacts.map(({ path }) => resolve(path));

  if (new Set(paths).size !== paths.length) {
    throw new Error('Plate cannot replace the same generated artifact twice.');
  }
  const journalPath = artifactJournalPath(paths);

  mkdirSync(dirname(journalPath), { recursive: true });
  const recovery = acquireArtifactRecoveryGates(paths);
  let lock: ArtifactLock | undefined;

  try {
    lock =
      paths.length === 1
        ? undefined
        : acquireArtifactLock(artifactBatchLockPath(paths));
    recoverReferencedArtifactJournals(recovery.journalPaths);
    if (!recovery.journalPaths.has(journalPath)) {
      recoverArtifactJournal(journalPath, paths);
    }
    // Decide a no-op only while holding every artifact gate. This keeps an
    // unchanged generation serialized with concurrent publishers without
    // applying foreign-watcher rejection to a read-only result.
    if (
      artifacts.every(({ content }, index) => isCurrent(paths[index], content))
    ) {
      return Object.freeze([] as string[]);
    }
    const token = `${process.pid}-${randomUUID()}`;
    const prepared = artifacts.flatMap((artifact, index) => {
      const path = paths[index];
      const stagingDirectory = join(artifactStateRoot(path), 'staging', token);
      const artifactFingerprint = pathFingerprint(path);

      return existsSync(path) &&
        readFileSync(path, 'utf-8') === artifact.content
        ? []
        : [
            {
              ...artifact,
              backup: join(stagingDirectory, `${artifactFingerprint}.backup`),
              existed: existsSync(path),
              path,
              temporary: join(
                stagingDirectory,
                `${artifactFingerprint}.generated`
              ),
            },
          ];
    });

    if (prepared.length === 0) return Object.freeze([] as string[]);
    assertNoForeignWatchArtifactOwner(prepared.map(({ path }) => path));

    const journal = {
      artifacts: prepared.map(({ backup, existed, path, temporary }) => ({
        backup,
        existed,
        path,
        temporary,
      })),
      phase: 'installing',
      version: 1,
    } satisfies ArtifactJournal;

    // References are harmless until the journal exists. Once it does, every
    // artifact can discover the whole batch before staged bytes or artifacts
    // are modified.
    prepared.forEach(({ path }, index) => {
      writeArtifactJournalReference(path, journalPath);
      if (interruptAfterReference === index) {
        throw new SimulatedArtifactProcessInterruptionError();
      }
    });
    writeArtifactJournal(journalPath, journal);

    try {
      prepared.forEach(({ content, path, temporary }) => {
        mkdirSync(dirname(path), { recursive: true });
        writeDurableFile(temporary, content);
      });
    } catch (error) {
      recoverArtifactJournal(journalPath, paths);
      throw error;
    }

    try {
      prepared.forEach(({ backup, existed, path }) => {
        if (existed) renameSync(path, backup);
      });
      prepared.forEach(({ path, temporary }, index) => {
        renameSync(temporary, path);
        if (interruptAfterInstall === index) {
          throw new SimulatedArtifactProcessInterruptionError();
        }
        afterInstall?.(path, index);
      });
      writeArtifactJournal(journalPath, { ...journal, phase: 'installed' });
    } catch (error) {
      if (error instanceof SimulatedArtifactProcessInterruptionError) {
        throw error;
      }
      recoverArtifactJournal(journalPath, paths);

      throw error;
    }
    const cleanupErrors: string[] = [];

    prepared.forEach(({ backup }, index) => {
      try {
        removeBackup(backup, index);
      } catch (error) {
        cleanupErrors.push(
          error instanceof Error ? error.message : String(error)
        );
      }
    });
    if (cleanupErrors.length > 0) {
      process.stderr.write(
        `Generated artifacts were committed, but backup cleanup failed: ${cleanupErrors.join('; ')}\n`
      );
    } else {
      new Set(prepared.map(({ backup }) => dirname(backup))).forEach(
        (directory) => {
          rmSync(directory, { force: true, recursive: true });
        }
      );
      prepared.forEach(({ path }) => {
        rmSync(artifactJournalReferencePath(path), { force: true });
      });
      rmSync(journalPath, { force: true });
    }
    return Object.freeze(prepared.map(({ path }) => path));
  } finally {
    if (lock) releaseArtifactLock(lock);
    releaseArtifactPublicationGates(recovery.gates);
  }
};

/**
 * Exported only for atomic rollback proof.
 *
 * @internal
 */
export const replaceArtifacts = (
  ...args: Parameters<typeof replaceArtifactsWithResult>
) => replaceArtifactsWithResult(...args).length > 0;

/**
 * Resolve entries and reject overlapping artifact ownership.
 *
 * @internal
 */
export const resolveEditorEntryPaths = (
  entries: readonly string[],
  cwd = process.cwd()
) => {
  const entryPaths = [
    ...new Set(entries.map((entry) => canonicalPath(resolve(cwd, entry)))),
  ];

  if (entryPaths.length === 0) {
    throw new Error('Plate requires at least one editor module.');
  }
  entryPaths.forEach((entryPath) => {
    if (!existsSync(entryPath) || !statSync(entryPath).isFile()) {
      throw new Error(`Plate editor entry does not exist: ${entryPath}`);
    }
  });
  const outputOwners = new Map<string, string>();

  entryPaths.forEach((entryPath) => {
    Object.values(outputPaths(entryPath)).forEach((outputPath) => {
      const owner = outputOwners.get(outputPath);

      if (owner) {
        throw new Error(
          `Plate editor modules produce the same generated artifact: ${owner} and ${entryPath} -> ${outputPath}`
        );
      }
      outputOwners.set(outputPath, entryPath);
    });
  });

  return Object.freeze(entryPaths);
};

/**
 * Compile editors without mutating generated artifacts.
 *
 * @internal
 */
export const compileEditors = async (
  entries: readonly string[],
  options: Pick<GenerateEditorOptions, 'cwd'> = {},
  session?: NativeTypeScriptSession
): Promise<readonly CompiledEditorArtifacts[]> => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPaths = resolveEditorEntryPaths(entries, cwd);
  const editors = await Promise.all(
    entryPaths.map((entryPath) => readEditor(entryPath, cwd))
  );
  const prepared = editors.map(
    ({ editor, sourceFiles: bundleSourceFiles }, index) => {
      const entryPath = entryPaths[index];
      const { schema } = editor;
      const bindings = createBindings(editor.bindings, schema);
      const owners = [
        ...new Set(schema.properties.byId.map(({ owner }) => owner)),
      ].sort();
      const { schemaPath, typesPath } = outputPaths(entryPath);

      return {
        bindings,
        bundleSourceFiles,
        editor,
        entryPath,
        owners,
        schema,
        schemaPath,
        typesPath,
      };
    }
  );
  const materialized = await materializePropertyGroups(
    prepared.map(
      ({
        bindings,
        editor,
        entryPath,
        owners,
        schema,
        schemaPath,
        typesPath,
      }) => ({
        bindings,
        entryPath,
        generatedPaths: new Set([schemaPath, typesPath]),
        owners,
        pluginExportName: editor.pluginExportName,
        schema,
      })
    ),
    cwd,
    session
  );
  const configCache: EditorTsconfigCache = new Map();
  const dependencyCache = new Map();
  const sourceFileClosures = prepared.map(({ bundleSourceFiles, entryPath }) =>
    discoverTypeOnlySourceFiles(
      bundleSourceFiles,
      undefined,
      findEditorConfig(entryPath),
      configCache,
      dependencyCache
    )
  );

  return Object.freeze(
    prepared.map((current, index) => {
      const properties = materialized[index];
      const schemaSource = `${JSON.stringify(current.schema, null, 2)}\n`;
      const typesSource = renderGeneratedTypes(
        current.entryPath,
        current.typesPath,
        current.editor.pluginExportName,
        current.schema,
        current.bindings,
        properties,
        current.editor.bindings,
        current.editor.applicationProperties,
        current.editor.applicationName
      );

      return Object.freeze({
        entryPath: current.entryPath,
        schema: current.schema,
        schemaPath: current.schemaPath,
        schemaSource,
        sourceFiles: Object.freeze(
          [...properties.sourceFiles, ...sourceFileClosures[index]].filter(
            (path, pathIndex, paths) =>
              path !== current.schemaPath &&
              path !== current.typesPath &&
              paths.indexOf(path) === pathIndex
          )
        ),
        typesPath: current.typesPath,
        typesSource,
      });
    })
  );
};

/**
 * Compile one editor without mutating generated artifacts.
 *
 * @internal
 */
export const compileEditor = async (
  entry: string,
  options: Pick<GenerateEditorOptions, 'cwd'> = {}
): Promise<CompiledEditorArtifacts> => {
  const editors = await compileEditors([entry], options);

  return editors[0];
};

export const generateEditors = async (
  entries: readonly string[],
  options: GenerateEditorOptions = {},
  session?: NativeTypeScriptSession
): Promise<readonly GeneratedEditorArtifacts[]> => {
  const compiled = await compileEditors(entries, options, session);
  const artifacts = compiled.flatMap(
    ({ schemaPath, schemaSource, typesPath, typesSource }) => [
      { content: typesSource, path: typesPath },
      { content: schemaSource, path: schemaPath },
    ]
  );
  let publishedPaths = new Set<string>();

  if (options.check) {
    const recovery = acquireArtifactRecoveryGates(
      artifacts.map(({ path }) => path)
    );
    let stale: string[];

    try {
      recoverReferencedArtifactJournals(recovery.journalPaths);
      stale = artifacts.flatMap(({ content, path }) =>
        isCurrent(path, content) ? [] : [path]
      );
    } finally {
      releaseArtifactPublicationGates(recovery.gates);
    }

    if (stale.length > 0) {
      throw new Error(
        `Generated Plate artifacts are stale:\n${stale
          .map((path) => `- ${path}`)
          .join('\n')}`
      );
    }
  } else {
    publishedPaths = new Set(replaceArtifactsWithResult(artifacts));
  }

  return Object.freeze(
    compiled.map((current) => {
      const {
        schemaSource: _schemaSource,
        typesSource: _typesSource,
        ...innerArtifacts
      } = current;

      return Object.freeze({
        ...innerArtifacts,
        status:
          publishedPaths.has(current.typesPath) ||
          publishedPaths.has(current.schemaPath)
            ? 'generated'
            : 'upToDate',
      });
    })
  );
};

export const generateEditor = async (
  entry: string,
  options: GenerateEditorOptions = {},
  session?: NativeTypeScriptSession
): Promise<GeneratedEditorArtifacts> => {
  const editors = await generateEditors([entry], options, session);

  return editors[0];
};
