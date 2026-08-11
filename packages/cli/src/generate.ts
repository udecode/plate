import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type {
  EditorSchemaContract,
  EditorSchemaContractContentProgram,
  SchemaPropertyKey,
} from '@platejs/plite';
import { build } from 'esbuild';
import ts from 'typescript';

export type GenerateEditorOptions = Readonly<{
  check?: boolean;
  cwd?: string;
}>;

export type GeneratedEditorArtifacts = Readonly<{
  entryPath: string;
  schema: EditorSchemaContract;
  schemaPath: string;
  sourceFiles: readonly string[];
  typesPath: string;
}>;

export type CompiledEditorArtifacts = GeneratedEditorArtifacts &
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
  key?: string;
  name: string;
  type?: string;
}>;

type CompiledApplicationProperty = Readonly<{
  key: SchemaPropertyKey;
  localId: string;
}>;

type CompiledDefinition = Readonly<{
  applicationProperties: readonly CompiledApplicationProperty[];
  bindings: readonly CompiledPluginBinding[];
  name: string;
  schema: EditorSchemaContract;
}>;

type TypeProperties = Readonly<
  Record<
    string,
    Readonly<{
      optional: boolean;
      type: string;
    }>
  >
>;

type ContractPropertyDescriptor =
  EditorSchemaContract['properties']['byId'][number]['descriptor'];

type MaterializedProperties = Readonly<{
  elements: Readonly<Record<string, TypeProperties>>;
  owners: Readonly<Record<string, TypeProperties>>;
  sourceFiles: readonly string[];
  text: TypeProperties;
}>;

const ANY_PATH_PATTERN = /.*/;
const CAMEL_BOUNDARY_PATTERN = /([a-z\d])([A-Z])/g;
const CSS_PATH_PATTERN = /\.css$/;
const DEFINITION_SUFFIX_PATTERN = /(?:[.-]definition)$/;
const LEADING_DIGIT_PATTERN = /^\d/;
const NON_IDENTIFIER_PATTERN = /[^A-Z_a-z\d]+/;
const NODE_MODULES_PATH_PATTERN = /(^|[\\/])node_modules([\\/]|$)/;
const PROPERTY_NAME_PATTERN = /^[$A-Z_a-z][$\w]*$/;
const REACT_LITE_YOUTUBE_EMBED_PATTERN = /^react-lite-youtube-embed$/;
const SOURCE_EXTENSION_PATTERN = /\.[cm]?[jt]sx?$/;
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

const bundleDefinition = async (
  entryPath: string,
  dependencies: Set<string>,
  silent = false,
  attemptedDependencies = dependencies
) =>
  build({
    banner: {
      js: `import { createRequire as __plateCreateRequire } from 'node:module'; const require = __plateCreateRequire(import.meta.url);`,
    },
    bundle: true,
    conditions: ['production'],
    format: 'esm',
    jsx: 'automatic',
    logLevel: silent ? 'silent' : 'info',
    logOverride: { 'ignored-bare-import': 'silent' },
    platform: 'node',
    plugins: [
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
      contents: `import definition from ${JSON.stringify(`./${basename(entryPath)}`)};
import { createBaseEditor } from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';
import { createEditorSchemaContract } from '@platejs/plite';
import { getCompiledEditorSchema } from '@platejs/plite/internal';

const editor = createBaseEditor({
  plugins: definition.plugins,
  schemaIdentity: definition.schemaIdentity,
  skipInitialization: true,
});
const runtime = getPlateRuntime(editor);
const schema = createEditorSchemaContract(getCompiledEditorSchema(editor));

export default {
  applicationProperties: Object.entries(definition.schema?.properties ?? {}).map(
    ([localId, property]) => ({
      key: property.key ?? localId,
      localId,
    })
  ),
  bindings: runtime.model.bindings.map((binding) => ({
    ...(binding.propertyKey ? { key: binding.propertyKey } : {}),
    name: binding.name,
    ...(binding.elementType ? { type: binding.elementType } : {}),
  })),
  name: definition.name,
  schema,
};
`,
      loader: 'ts',
      resolveDir: dirname(entryPath),
      sourcefile: 'plate-codegen-entry.ts',
    },
    tsconfig: findTsconfig(entryPath),
    write: false,
  });

const readDefinition = async (
  entryPath: string
): Promise<
  Readonly<{ definition: CompiledDefinition; sourceFiles: readonly string[] }>
> => {
  const outputPath = join(
    dirname(entryPath),
    `.plate-codegen-${process.pid}-${randomUUID()}.mjs`
  );
  const dependencies = new Set<string>();
  const result = await bundleDefinition(
    entryPath,
    dependencies,
    false,
    new Set<string>()
  );
  const output = result.outputFiles?.[0];

  if (!output) throw new Error(`Plate could not bundle "${entryPath}".`);
  writeDurableFile(outputPath, output.text);
  let imported: unknown;

  try {
    imported = (
      await import(`${pathToFileURL(outputPath).href}?${randomUUID()}`)
    ).default;
  } finally {
    rmSync(outputPath, { force: true });
  }

  if (
    !isRecord(imported) ||
    typeof imported.name !== 'string' ||
    imported.name.length === 0 ||
    !Array.isArray(imported.bindings) ||
    !Array.isArray(imported.applicationProperties) ||
    !isRecord(imported.schema)
  ) {
    throw new Error(
      `Plate editor entry "${entryPath}" must default-export defineEditor(name, { plugins }).`
    );
  }

  return Object.freeze({
    definition: imported as CompiledDefinition,
    sourceFiles: Object.freeze(
      [...dependencies].filter((path) => !NODE_MODULES_PATH_PATTERN.test(path))
    ),
  });
};

const findTsconfig = (entryPath: string) =>
  ts.findConfigFile(dirname(entryPath), ts.sys.fileExists, 'tsconfig.json');

const resolveProjectConfig = (path: string) =>
  existsSync(path) && statSync(path).isFile()
    ? path
    : join(path, 'tsconfig.json');

class EditorConfigReadError extends Error {
  readonly configFiles: readonly string[];

  constructor(error: unknown, configFiles: readonly string[]) {
    super(error instanceof Error ? error.message : String(error));
    this.configFiles = Object.freeze([...configFiles]);
  }
}

const readEditorConfig = (
  entryPath: string,
  cwd: string
): Readonly<{
  configFiles: readonly string[];
  parsed: ts.ParsedCommandLine;
}> => {
  const configPath = findTsconfig(entryPath);

  if (!configPath) {
    return {
      configFiles: [],
      parsed: ts.parseJsonConfigFileContent({}, ts.sys, dirname(entryPath), {
        noEmit: true,
      }),
    };
  }
  const configFiles = new Set<string>();
  const visited = new Set<string>();

  const parse = (path: string): ts.ParsedCommandLine => {
    const resolvedPath = resolve(path);

    if (visited.has(resolvedPath)) {
      return ts.parseJsonConfigFileContent(
        {},
        ts.sys,
        dirname(resolvedPath),
        { noEmit: true },
        resolvedPath
      );
    }
    visited.add(resolvedPath);
    configFiles.add(resolvedPath);
    const config = ts.readConfigFile(resolvedPath, ts.sys.readFile);

    if (config.error) throw new Error(formatDiagnostics([config.error], cwd));
    const extendedConfigCache = new Map<string, ts.ExtendedConfigCacheEntry>();
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      dirname(resolvedPath),
      { noEmit: true },
      resolvedPath,
      undefined,
      undefined,
      extendedConfigCache
    );

    extendedConfigCache.forEach((entry) => {
      configFiles.add(resolve(entry.extendedResult.fileName));
    });
    if (parsed.errors.length > 0) {
      throw new Error(formatDiagnostics(parsed.errors, cwd));
    }
    parsed.projectReferences?.forEach((reference) => {
      const referenceConfig = resolveProjectConfig(reference.path);

      if (existsSync(referenceConfig)) parse(referenceConfig);
    });

    return parsed;
  };

  let parsed: ts.ParsedCommandLine;

  try {
    parsed = parse(configPath);
  } catch (error) {
    throw new EditorConfigReadError(error, [...configFiles]);
  }

  return {
    configFiles: Object.freeze([...configFiles]),
    parsed,
  };
};

/** @internal Discover attempted source dependencies even when generation fails. */
export const discoverEditorSourceFiles = (
  entry: string,
  options: Pick<GenerateEditorOptions, 'cwd'> = {}
) => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPath = resolve(cwd, entry);
  let editorConfig: ReturnType<typeof readEditorConfig>;

  try {
    editorConfig = readEditorConfig(entryPath, cwd);
  } catch (error) {
    const configPath = findTsconfig(entryPath);
    const configFiles =
      error instanceof EditorConfigReadError ? error.configFiles : [];

    return Object.freeze(
      [entryPath, ...(configPath ? [configPath] : []), ...configFiles].filter(
        (fileName, index, files) => files.indexOf(fileName) === index
      )
    );
  }
  const { configFiles, parsed } = editorConfig;
  const generatedPaths = new Set(Object.values(outputPaths(entryPath)));
  const program = ts.createProgram({
    options: parsed.options,
    projectReferences: parsed.projectReferences,
    rootNames: [...new Set([...parsed.fileNames, entryPath])],
  });

  return Object.freeze(
    [
      ...configFiles,
      ...program
        .getSourceFiles()
        .map(({ fileName }) => fileName)
        .filter(
          (fileName) =>
            !NODE_MODULES_PATH_PATTERN.test(fileName) &&
            !generatedPaths.has(fileName)
        ),
    ].filter((fileName, index, files) => files.indexOf(fileName) === index)
  );
};

/** @internal Include esbuild-only and unresolved local dependencies for watch mode. */
export const discoverEditorWatchFiles = async (
  entry: string,
  options: Pick<GenerateEditorOptions, 'cwd'> = {}
) => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPath = resolve(cwd, entry);
  const dependencies = new Set(discoverEditorSourceFiles(entry, options));

  try {
    await bundleDefinition(entryPath, dependencies, true);
  } catch {
    // Resolution hooks still collect loaded files and local missing candidates.
  }
  const generatedPaths = new Set(Object.values(outputPaths(entryPath)));

  return Object.freeze(
    [...dependencies].filter(
      (path) =>
        !NODE_MODULES_PATH_PATTERN.test(path) && !generatedPaths.has(path)
    )
  );
};

const formatDiagnostics = (
  diagnostics: readonly ts.Diagnostic[],
  cwd: string
) =>
  diagnostics
    .map((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      );

      if (!diagnostic.file || diagnostic.start === undefined) return message;
      const location = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );

      return `${relative(cwd, diagnostic.file.fileName)}:${location.line + 1}:${location.character + 1} ${message}`;
    })
    .join('\n');

const propertyName = (name: string) =>
  PROPERTY_NAME_PATTERN.test(name) ? name : JSON.stringify(name);

const literalType = (type: ts.Type) => {
  if (type.flags & ts.TypeFlags.StringLiteral) {
    return JSON.stringify((type as ts.StringLiteralType).value);
  }
  if (type.flags & ts.TypeFlags.NumberLiteral) {
    return String((type as ts.NumberLiteralType).value);
  }
  if (type.flags & ts.TypeFlags.BooleanLiteral) {
    return (type as { intrinsicName?: string }).intrinsicName === 'true'
      ? 'true'
      : 'false';
  }
};

const isExternalNamedType = (type: ts.Type) => {
  const symbol = type.aliasSymbol ?? type.getSymbol();

  return symbol?.declarations?.some((declaration) =>
    NODE_MODULES_PATH_PATTERN.test(declaration.getSourceFile().fileName)
  );
};

const escapeTemplateLiteralText = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${');

const printPropertyType = (
  checker: ts.TypeChecker,
  type: ts.Type,
  seen = new Set<ts.Type>(),
  excludeUndefined = false
): string => {
  const literal = literalType(type);

  if (literal) return literal;
  if (type.flags & ts.TypeFlags.Any) return 'unknown';
  if (type.flags & ts.TypeFlags.Never) {
    throw new Error('Generated editor property types cannot contain `never`.');
  }
  if (type.flags & ts.TypeFlags.Unknown) return 'unknown';
  if (type.flags & ts.TypeFlags.TemplateLiteral) {
    const template = type as ts.TemplateLiteralType;
    const templateSeen = new Set(seen).add(type);

    return `\`${template.texts
      .map((text, index) => {
        const nested = template.types[index];

        return `${escapeTemplateLiteralText(text)}${nested ? `\${${printPropertyType(checker, nested, templateSeen)}}` : ''}`;
      })
      .join('')}\``;
  }
  if (type.flags & ts.TypeFlags.StringLike) return 'string';
  if (type.flags & ts.TypeFlags.NumberLike) return 'number';
  if (type.flags & ts.TypeFlags.BigIntLike) return 'bigint';
  if (type.flags & ts.TypeFlags.BooleanLike) return 'boolean';
  if (type.flags & ts.TypeFlags.ESSymbolLike) return 'symbol';
  if (type.flags & ts.TypeFlags.Null) return 'null';
  if (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)) {
    return 'undefined';
  }
  if (seen.has(type)) return 'unknown';
  const nextSeen = new Set(seen).add(type);
  if (type.isUnion()) {
    const values = [
      ...new Set(
        type.types
          .filter(
            (item) =>
              !excludeUndefined ||
              !(item.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void))
          )
          .map((item) => printPropertyType(checker, item, nextSeen))
      ),
    ];

    if (values.includes('unknown')) return 'unknown';
    if (values.includes('false') && values.includes('true')) {
      values.splice(values.indexOf('false'), 1);
      values.splice(values.indexOf('true'), 1);
      values.push('boolean');
    }

    return values.sort().join(' | ') || 'undefined';
  }
  if (type.isIntersection()) {
    const values = [
      ...new Set(
        type.types
          .map((item) => {
            const printed = printPropertyType(checker, item, nextSeen);

            return item.isUnion() ? `(${printed})` : printed;
          })
          .filter((item) => item !== 'unknown')
      ),
    ];

    return values.join(' & ') || 'unknown';
  }
  if (checker.isTupleType(type)) {
    const tuple = type as ts.TupleTypeReference;
    const items = checker.getTypeArguments(tuple);

    return `readonly [${items
      .map((item, index) => {
        const flag =
          tuple.target.elementFlags[index] ?? ts.ElementFlags.Required;
        const printed = printPropertyType(
          checker,
          item,
          nextSeen,
          Boolean(flag & ts.ElementFlags.Optional)
        );

        if (flag & (ts.ElementFlags.Rest | ts.ElementFlags.Variadic)) {
          return `...${item.isUnion() ? `(${printed})` : printed}[]`;
        }

        return flag & ts.ElementFlags.Optional ? `${printed}?` : printed;
      })
      .join(', ')}]`;
  }
  if (checker.isArrayType(type)) {
    const item = checker.getIndexTypeOfType(type, ts.IndexKind.Number);

    return `readonly (${item ? printPropertyType(checker, item, nextSeen) : 'unknown'})[]`;
  }
  if (type.flags & ts.TypeFlags.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type);

    return constraint
      ? printPropertyType(checker, constraint, nextSeen)
      : 'unknown';
  }
  if (isExternalNamedType(type)) return 'unknown';
  if (!(type.flags & ts.TypeFlags.Object)) {
    throw new Error(
      `Cannot materialize editor property type "${checker.typeToString(type)}".`
    );
  }
  const calls = checker.getSignaturesOfType(type, ts.SignatureKind.Call);

  if (calls.length > 0) return 'unknown';

  const fields = type.getProperties().map((symbol) => {
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    const value = checker.getTypeOfSymbolAtLocation(
      symbol,
      declaration ?? (type.symbol?.valueDeclaration as ts.Node)
    );
    const optional = (symbol.flags & ts.SymbolFlags.Optional) !== 0;
    const printed = printPropertyType(checker, value, nextSeen, optional);

    return `readonly ${propertyName(symbol.getName())}${optional ? '?' : ''}: ${printed};`;
  });
  const indexes = checker.getIndexInfosOfType(type).map((index) => {
    const key =
      index.keyType.flags & ts.TypeFlags.NumberLike ? 'number' : 'string';

    return `readonly [key: ${key}]: ${printPropertyType(checker, index.type, nextSeen)};`;
  });

  return `{ ${[...fields, ...indexes].join(' ')} }`;
};

const readTypeProperties = (
  checker: ts.TypeChecker,
  declaration: ts.TypeAliasDeclaration
): TypeProperties => {
  const type = checker.getTypeFromTypeNode(declaration.type);

  return Object.freeze(
    Object.fromEntries(
      type.getProperties().map((symbol) => {
        const location =
          symbol.valueDeclaration ?? symbol.declarations?.[0] ?? declaration;
        const optional = (symbol.flags & ts.SymbolFlags.Optional) !== 0;
        const value = checker.getTypeOfSymbolAtLocation(symbol, location);
        let printed: string;

        try {
          printed = printPropertyType(
            checker,
            value,
            new Set<ts.Type>(),
            optional
          );
        } catch (error) {
          throw new Error(
            `Cannot materialize schema property "${symbol.getName()}": ${error instanceof Error ? error.message : String(error)}`
          );
        }

        return [
          symbol.getName(),
          Object.freeze({
            optional,
            type: printed || 'never',
          }),
        ];
      })
    )
  );
};

const materializeProperties = (
  entryPath: string,
  bindings: readonly ElementBinding[],
  owners: readonly string[],
  cwd: string,
  generatedPaths: ReadonlySet<string>
): MaterializedProperties => {
  const helperPath = join(
    dirname(entryPath),
    `.plate-codegen-${process.pid}-${randomUUID()}.ts`
  );
  const entryImport = `./${basename(entryPath, extname(entryPath))}`;
  const aliases = bindings
    .map(
      (binding, index) =>
        `type __PlateElement${index} = InternalEditorDefinitionElementProperties<typeof definition.plugins, ${JSON.stringify(binding.name)}>;`
    )
    .join('\n');
  const ownerAliases = owners
    .map(
      (owner, index) =>
        `type __PlateOwner${index} = InternalEditorDefinitionOwnedElementProperties<typeof definition.plugins, ${JSON.stringify(owner)}>;`
    )
    .join('\n');
  const helper = `import definition from ${JSON.stringify(entryImport)};\nimport type { InternalEditorDefinitionElementProperties, InternalEditorDefinitionOwnedElementProperties, InternalEditorDefinitionTextProperties } from '@platejs/core/internal';\n${aliases}\n${ownerAliases}\ntype __PlateText = InternalEditorDefinitionTextProperties<typeof definition.plugins>;\n`;

  writeFileSync(helperPath, helper);
  try {
    const { configFiles, parsed } = readEditorConfig(entryPath, cwd);
    const program = ts.createProgram({
      options: parsed.options,
      projectReferences: parsed.projectReferences,
      rootNames: [...new Set([...parsed.fileNames, helperPath])],
    });
    const source = program.getSourceFile(helperPath);

    if (!source) throw new Error('Plate codegen type helper was not loaded.');
    const diagnostics = [
      ...program.getOptionsDiagnostics(),
      ...program.getSyntacticDiagnostics(source),
      ...program.getSemanticDiagnostics(source),
    ];

    if (diagnostics.length > 0) {
      throw new Error(formatDiagnostics(diagnostics, cwd));
    }
    const declarations = new Map(
      source.statements.flatMap((statement) =>
        ts.isTypeAliasDeclaration(statement)
          ? [[statement.name.text, statement] as const]
          : []
      )
    );
    const checker = program.getTypeChecker();
    const elementProperties = Object.fromEntries(
      bindings.map((binding, index) => {
        const declaration = declarations.get(`__PlateElement${index}`);

        if (!declaration) {
          throw new Error(
            `Missing generated type helper for "${binding.name}".`
          );
        }

        try {
          return [binding.name, readTypeProperties(checker, declaration)];
        } catch (error) {
          throw new Error(
            `Cannot materialize element plugin "${binding.name}": ${error instanceof Error ? error.message : String(error)}`
          );
        }
      })
    );
    const ownerProperties = Object.fromEntries(
      owners.map((owner, index) => {
        const declaration = declarations.get(`__PlateOwner${index}`);

        if (!declaration) {
          throw new Error(`Missing generated property owner "${owner}".`);
        }

        try {
          return [owner, readTypeProperties(checker, declaration)];
        } catch (error) {
          throw new Error(
            `Cannot materialize property owner "${owner}": ${error instanceof Error ? error.message : String(error)}`
          );
        }
      })
    );
    const textDeclaration = declarations.get('__PlateText');

    if (!textDeclaration)
      throw new Error('Missing generated text type helper.');

    return Object.freeze({
      elements: Object.freeze(elementProperties),
      owners: Object.freeze(ownerProperties),
      sourceFiles: Object.freeze(
        [
          ...configFiles,
          ...program
            .getSourceFiles()
            .map(({ fileName }) => fileName)
            .filter(
              (fileName) =>
                !NODE_MODULES_PATH_PATTERN.test(fileName) &&
                fileName !== helperPath &&
                !generatedPaths.has(fileName)
            ),
        ].filter((fileName, index, files) => files.indexOf(fileName) === index)
      ),
      text: readTypeProperties(checker, textDeclaration),
    });
  } finally {
    rmSync(helperPath, { force: true });
  }
};

const toPascalCase = (value: string) => {
  const result = value
    .replace(CAMEL_BOUNDARY_PATTERN, '$1 $2')
    .split(NON_IDENTIFIER_PATTERN)
    .filter(Boolean)
    .map((part) => `${part[0]!.toUpperCase()}${part.slice(1)}`)
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

const renderGeneratedTypes = (
  entryPath: string,
  typesPath: string,
  schemaPath: string,
  schema: EditorSchemaContract,
  bindings: readonly ElementBinding[],
  properties: MaterializedProperties,
  compiledBindings: readonly CompiledPluginBinding[],
  applicationProperties: readonly CompiledApplicationProperty[],
  definitionName: string
) => {
  const bindingByType = new Map(
    bindings.map((binding) => [binding.type, binding])
  );
  const elementByType = new Map(
    schema.elements.byType.map((element) => [element.type, element])
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
  const applicationOwner = `schema:application:${definitionName}`;
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

      return Object.freeze({ localId, property: matches[0]! });
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
    const element = elementByType.get(binding.type)!;
    const persisted: Record<
      string,
      Readonly<{ optional: boolean; type: string }>
    > = {
      ...(properties.elements[binding.name] ?? {}),
    };
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
      const owned = properties.owners[property.owner]?.[property.key];
      const current = persisted[property.key];
      const fallback = propertyTypeFromContract(property.descriptor);
      const type = current?.type ?? owned?.type ?? fallback.type;

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
  const elementDeclarations = bindings
    .map((binding) => {
      const element = elementByType.get(binding.type)!;
      const fields = renderProperties(
        resolvedProperties.get(binding.name)!.persisted,
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
  const mutationDeclarations = bindings
    .map((binding) => {
      const mutation = resolvedProperties.get(binding.name)!;
      const construction = renderProperties(mutation.construction, '      ');
      const persisted = renderProperties(mutation.persisted, '      ');

      return `  readonly ${propertyName(binding.name)}: Readonly<{\n    readonly construction: Readonly<{${construction ? `\n${construction}\n    ` : ''}}>;\n    readonly properties: Readonly<{${persisted ? `\n${persisted}\n    ` : ''}}>;\n    readonly type: ${JSON.stringify(binding.type)};\n  }>;`;
    })
    .join('\n');
  const textFields = renderProperties(properties.text, '  ');
  const rootType = childrenType(
    schema.primaryRoot.content,
    bindingByType,
    'EditorText'
  );
  const elementUnion =
    bindings.map(({ typeName }) => typeName).join(' | ') || 'Element';
  const definitionImport = relativeImport(typesPath, entryPath);
  const schemaImport = relativeImport(typesPath, schemaPath);

  return `/* Generated by @platejs/cli. Do not edit. */\nimport type { EditorSchemaContract, Element, SchemaPropertyHandle, Text } from 'platejs';\nimport { bindGeneratedEditor, type GeneratedEditorContract, type GeneratedEditorTypes } from 'platejs';\nimport type { PlateEditor } from 'platejs/react';\n\nimport definition from ${JSON.stringify(definitionImport)};\nimport schemaContract from ${JSON.stringify(schemaImport)};\n\nexport interface EditorText extends Text {\n  readonly text: string;${textFields ? `\n${textFields}` : ''}\n}\n\n${elementDeclarations}\n\nexport type EditorElement = ${elementUnion};\nexport type Value = ${rootType};\nexport type Schema = Readonly<{\n  readonly plugins: Readonly<{${schemaPluginTypeFields ? `\n${schemaPluginTypeFields}\n  ` : ''}}>;\n  readonly properties: Readonly<{${schemaApplicationTypeFields ? `\n${schemaApplicationTypeFields}\n  ` : ''}}>;\n}>;\nexport type Mutations = Readonly<{\n${mutationDeclarations}\n}>;\ntype Types = GeneratedEditorTypes<Value, EditorElement, EditorText, Schema, Mutations>;\n\nconst schemaBindings = Object.freeze({\n  plugins: Object.freeze({${schemaPluginValueFields ? `\n${schemaPluginValueFields}\n  ` : ''}}),\n  properties: Object.freeze({${schemaApplicationValueFields ? `\n${schemaApplicationValueFields}\n  ` : ''}}),\n}) satisfies Schema;\n\nconst contract = {\n  bindings: schemaBindings,\n  fingerprint: ${JSON.stringify(schema.fingerprint)},\n  schema: schemaContract as unknown as EditorSchemaContract,\n  types: undefined as unknown as Types,\n} satisfies GeneratedEditorContract<Types>;\n\nexport const EditorKit = bindGeneratedEditor(definition, contract);\nexport type Editor = PlateEditor<typeof EditorKit>;\n`;
};

const outputPaths = (entryPath: string) => {
  const extension = extname(entryPath);
  const base = basename(entryPath, extension);
  const stem = base.replace(DEFINITION_SUFFIX_PATTERN, '') || base;
  const directory = dirname(entryPath);

  return {
    schemaPath: join(directory, `${stem}.schema.json`),
    typesPath: join(directory, `${stem}.generated.ts`),
  };
};

const writeDurableFile = (path: string, content: string) => {
  const descriptor = openSync(path, 'w');

  try {
    writeFileSync(descriptor, content);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
};

type ArtifactJournal = Readonly<{
  artifacts: readonly Readonly<{
    backup: string;
    existed: boolean;
    path: string;
    temporary: string;
  }>[];
  phase: 'installed' | 'installing';
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

const ARTIFACT_PROCESS_TOKEN = randomUUID();

class SimulatedArtifactProcessInterruption extends Error {
  constructor() {
    super('simulated process interruption');
  }
}

const artifactJournalPath = (paths: readonly string[]) => {
  const sorted = [...paths].sort();
  const fingerprint = createHash('sha256')
    .update(sorted.join('\0'))
    .digest('hex')
    .slice(0, 16);

  return join(dirname(sorted[0]!), `.plate-artifacts-${fingerprint}.journal`);
};

const isProcessAlive = (pid: number) => {
  try {
    process.kill(pid, 0);

    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code !== 'ESRCH';
  }
};

const acquireArtifactLock = (journalPath: string): ArtifactLock => {
  const directory = dirname(journalPath);
  const prefix = `${basename(journalPath)}.lock.`;
  const token = randomUUID();
  const path = join(directory, `${prefix}${process.pid}-${token}`);

  const temporary = `${path}.tmp`;

  try {
    writeDurableFile(
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
        readFileSync(candidate, 'utf8')
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

const releaseArtifactLock = ({ path }: ArtifactLock) =>
  rmSync(path, { force: true });

const writeArtifactJournal = (path: string, journal: ArtifactJournal) => {
  const temporary = `${path}.${process.pid}-${randomUUID()}.tmp`;

  try {
    writeDurableFile(temporary, `${JSON.stringify(journal)}\n`);
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
};

const readArtifactJournal = (
  path: string,
  expectedPaths: readonly string[]
): ArtifactJournal | undefined => {
  if (!existsSync(path)) return;
  const journal = JSON.parse(readFileSync(path, 'utf8')) as ArtifactJournal;
  const actual = journal.artifacts.map((artifact) => artifact.path).sort();
  const expected = [...expectedPaths].sort();

  if (
    journal.version !== 1 ||
    (journal.phase !== 'installed' && journal.phase !== 'installing') ||
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
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
    journal.artifacts.forEach(({ backup, existed, path, temporary }) => {
      rmSync(temporary, { force: true });
      if (existsSync(backup)) {
        rmSync(path, { force: true });
        renameSync(backup, path);
      } else if (!existed) {
        rmSync(path, { force: true });
      } else if (!existsSync(path)) {
        throw new Error(
          `Cannot recover Plate artifact transaction because both the artifact and backup are missing: ${path}`
        );
      }
    });
  }
  rmSync(path, { force: true });
};

/** @internal Exported only for atomic rollback proof. */
export const replaceArtifacts = (
  artifacts: readonly Readonly<{ content: string; path: string }>[],
  {
    afterInstall,
    interruptAfterInstall,
    removeBackup = (path) => rmSync(path, { force: true }),
  }: Readonly<{
    afterInstall?: (path: string, index: number) => void;
    /** Test-only process interruption point. */
    interruptAfterInstall?: number;
    removeBackup?: (path: string, index: number) => void;
  }> = {}
) => {
  if (artifacts.length === 0) return;
  const paths = artifacts.map(({ path }) => resolve(path));

  if (new Set(paths).size !== paths.length) {
    throw new Error('Plate cannot replace the same generated artifact twice.');
  }
  const journalPath = artifactJournalPath(paths);

  mkdirSync(dirname(journalPath), { recursive: true });
  const lock = acquireArtifactLock(journalPath);

  try {
    recoverArtifactJournal(journalPath, paths);
    const token = `${process.pid}-${randomUUID()}`;
    const prepared = artifacts.map((artifact, index) => ({
      ...artifact,
      backup: `${paths[index]}.${token}.backup`,
      existed: existsSync(paths[index]!),
      path: paths[index]!,
      temporary: `${paths[index]}.${token}.tmp`,
    }));

    try {
      prepared.forEach(({ content, path, temporary }) => {
        mkdirSync(dirname(path), { recursive: true });
        writeDurableFile(temporary, content);
      });
    } catch (error) {
      prepared.forEach(({ temporary }) => {
        rmSync(temporary, { force: true });
      });
      throw error;
    }
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

    writeArtifactJournal(journalPath, journal);

    try {
      prepared.forEach(({ backup, existed, path }) => {
        if (existed) renameSync(path, backup);
      });
      prepared.forEach(({ path, temporary }, index) => {
        renameSync(temporary, path);
        if (interruptAfterInstall === index) {
          throw new SimulatedArtifactProcessInterruption();
        }
        afterInstall?.(path, index);
      });
      writeArtifactJournal(journalPath, { ...journal, phase: 'installed' });
    } catch (error) {
      if (error instanceof SimulatedArtifactProcessInterruption) throw error;
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
      rmSync(journalPath, { force: true });
    }
  } finally {
    releaseArtifactLock(lock);
  }
};

const assertCurrent = (path: string, content: string) => {
  if (!existsSync(path) || readFileSync(path, 'utf8') !== content) {
    throw new Error(`Generated Plate artifact is stale: ${path}`);
  }
};

/** @internal Compile one definition without mutating its generated artifacts. */
/** @internal Run by the isolated codegen worker. */
export const compileEditorInProcess = async (
  entry: string,
  options: Pick<GenerateEditorOptions, 'cwd'> = {}
): Promise<CompiledEditorArtifacts> => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPath = resolve(cwd, entry);

  if (!existsSync(entryPath) || !statSync(entryPath).isFile()) {
    throw new Error(`Plate editor entry does not exist: ${entryPath}`);
  }
  const { definition, sourceFiles: bundleSourceFiles } =
    await readDefinition(entryPath);
  const schemaContract = definition.schema;
  const bindings = createBindings(definition.bindings, schemaContract);
  const owners = [
    ...new Set(schemaContract.properties.byId.map(({ owner }) => owner)),
  ].sort();
  const { schemaPath, typesPath } = outputPaths(entryPath);
  const materialized = materializeProperties(
    entryPath,
    bindings,
    owners,
    cwd,
    new Set([schemaPath, typesPath])
  );
  const schemaSource = `${JSON.stringify(schemaContract, null, 2)}\n`;
  const typesSource = renderGeneratedTypes(
    entryPath,
    typesPath,
    schemaPath,
    schemaContract,
    bindings,
    materialized,
    definition.bindings,
    definition.applicationProperties,
    definition.name
  );

  return Object.freeze({
    entryPath,
    schema: schemaContract,
    schemaPath,
    schemaSource,
    sourceFiles: Object.freeze(
      [...materialized.sourceFiles, ...bundleSourceFiles].filter(
        (path, index, paths) =>
          path !== schemaPath &&
          path !== typesPath &&
          paths.indexOf(path) === index
      )
    ),
    typesPath,
    typesSource,
  });
};

const compileWorkerPath = fileURLToPath(
  new URL(
    import.meta.url.endsWith('.ts')
      ? './compile-worker.ts'
      : './compile-worker.js',
    import.meta.url
  )
);

const runCompileWorker = (entry: string, cwd: string, resultPath: string) =>
  new Promise<void>((resolvePromise, reject) => {
    execFile(
      process.execPath,
      [compileWorkerPath, entry, cwd, resultPath],
      { cwd, maxBuffer: 16 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (!error) {
          resolvePromise();

          return;
        }
        reject(
          new Error(
            stderr || stdout || error.message || 'Plate codegen worker failed.'
          )
        );
      }
    );
  });

/** Compile one definition in an isolated process so repeated watch runs release TypeScript state. */
export const compileEditor = async (
  entry: string,
  options: Pick<GenerateEditorOptions, 'cwd'> = {}
): Promise<CompiledEditorArtifacts> => {
  const cwd = resolve(options.cwd ?? process.cwd());
  const entryPath = resolve(cwd, entry);
  const resultPath = join(
    dirname(entryPath),
    `.plate-codegen-${process.pid}-${randomUUID()}.compile.json`
  );

  try {
    await runCompileWorker(entryPath, cwd, resultPath);

    if (!existsSync(resultPath)) {
      throw new Error(
        `Plate could not compile "${entryPath}": the worker produced no result.`
      );
    }

    return Object.freeze(
      JSON.parse(readFileSync(resultPath, 'utf8')) as CompiledEditorArtifacts
    );
  } finally {
    rmSync(resultPath, { force: true });
  }
};

export const generateEditor = async (
  entry: string,
  options: GenerateEditorOptions = {}
): Promise<GeneratedEditorArtifacts> => {
  const compiled = await compileEditor(entry, options);

  if (options.check) {
    assertCurrent(compiled.schemaPath, compiled.schemaSource);
    assertCurrent(compiled.typesPath, compiled.typesSource);
  } else {
    replaceArtifacts([
      { content: compiled.schemaSource, path: compiled.schemaPath },
      { content: compiled.typesSource, path: compiled.typesPath },
    ]);
  }

  const {
    schemaSource: _schemaSource,
    typesSource: _typesSource,
    ...artifacts
  } = compiled;

  return Object.freeze(artifacts);
};
