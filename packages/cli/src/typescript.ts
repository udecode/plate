import { randomUUID } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
} from 'node:path';

import { readTsconfig, resolvePathAlias } from 'get-tsconfig';
import {
  isArrayTypeNode,
  isIndexSignatureDeclaration,
  isIntersectionTypeNode,
  isLiteralTypeNode,
  isNamedTupleMember,
  isOptionalTypeNode,
  isParenthesizedTypeNode,
  isPropertySignatureDeclaration,
  isRestTypeNode,
  isTemplateLiteralTypeNode,
  isTupleTypeNode,
  isTypeLiteralNode,
  isTypeOperatorNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  SyntaxKind,
  type Node,
  type TypeNode,
} from 'typescript/unstable/ast';
import {
  API,
  ElementFlags,
  NodeBuilderFlags,
  SignatureKind,
  SymbolFlags,
  TypeFlags,
  type Checker,
  type Diagnostic,
  type Snapshot,
  type TimingInfo,
  type Type,
} from 'typescript/unstable/async';

export type NativeTypeProperties = Readonly<
  Record<
    string,
    Readonly<{
      optional: boolean;
      type: string;
    }>
  >
>;

export type NativeTypeHelper = Readonly<{
  aliases: ReadonlyArray<
    Readonly<{
      name: string;
      position: number;
      propertyNames?: readonly string[];
    }>
  >;
  generatedPaths: ReadonlySet<string>;
  path: string;
  source: string;
}>;

export type NativeTypeMaterialization = Readonly<{
  properties: Readonly<Record<string, NativeTypeProperties>>;
  sourceFiles: readonly string[];
}>;

export type EditorTsconfigCache = Map<
  string,
  ReturnType<typeof readTsconfig> | undefined
>;

const NODE_MODULES_PATH_PATTERN = /(^|[\\/])node_modules([\\/]|$)/;
const DECLARATION_FILE_PATTERN = /\.d\.[cm]?ts$/;
const DECLARE_GLOBAL_PATTERN = /\bdeclare\s+(?:global|module)\b/;
const MODULE_SYNTAX_PATTERN = /^\s*(?:export|import)\b/m;
const PROPERTY_NAME_PATTERN = /^[$A-Z_a-z][$\w]*$/;

const propertyName = (name: string) =>
  PROPERTY_NAME_PATTERN.test(name) ? name : JSON.stringify(name);

const localAmbientSourceFiles = (paths: readonly string[]) =>
  paths.filter((path) => {
    if (
      NODE_MODULES_PATH_PATTERN.test(path) ||
      !existsSync(path) ||
      !statSync(path).isFile()
    ) {
      return false;
    }
    if (DECLARATION_FILE_PATTERN.test(path)) return true;
    const source = readFileSync(path, 'utf-8');

    return (
      DECLARE_GLOBAL_PATTERN.test(source) || !MODULE_SYNTAX_PATTERN.test(source)
    );
  });

const stripJsonComments = (source: string) => {
  let result = '';
  let inBlockComment = false;
  let inLineComment = false;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (character === '\n') {
        inLineComment = false;
        result += character;
      } else {
        result += ' ';
      }
      continue;
    }
    if (inBlockComment) {
      if (character === '*' && next === '/') {
        result += '  ';
        index += 1;
        inBlockComment = false;
      } else {
        result += character === '\n' ? '\n' : ' ';
      }
      continue;
    }
    if (inString) {
      result += character;
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      result += character;
      continue;
    }
    if (character === '/' && next === '/') {
      result += '  ';
      index += 1;
      inLineComment = true;
      continue;
    }
    if (character === '/' && next === '*') {
      result += '  ';
      index += 1;
      inBlockComment = true;
      continue;
    }
    result += character;
  }

  return result;
};

const readJsonConfig = (path: string) => {
  const source = readFileSync(path, 'utf-8');

  try {
    return JSON.parse(
      stripJsonComments(source).replace(/,\s*([}\]])/g, '$1')
    ) as Record<string, unknown>;
  } catch {
    // Invalid JSON-like TypeScript config text has no parsed object value.
  }

  return undefined;
};

const resolveConfigPath = (specifier: string, fromPath: string) => {
  let candidate: string;

  if (isAbsolute(specifier)) candidate = specifier;
  else if (specifier.startsWith('.')) {
    candidate = resolve(dirname(fromPath), specifier);
  } else {
    try {
      candidate = createRequire(fromPath).resolve(specifier);
    } catch {
      return resolve(dirname(fromPath), specifier);
    }
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    return join(candidate, 'tsconfig.json');
  }
  if (!extname(candidate) && existsSync(`${candidate}.json`)) {
    return `${candidate}.json`;
  }

  return candidate;
};

const referencedConfigPaths = (path: string) => {
  const source = readFileSync(path, 'utf-8');
  const parsed = readJsonConfig(path);
  const values = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === 'string' && value.length > 0) values.add(value);
  };

  if (parsed) {
    if (Array.isArray(parsed.extends)) parsed.extends.forEach(add);
    else add(parsed.extends);
    if (Array.isArray(parsed.references)) {
      parsed.references.forEach((reference) => {
        if (reference && typeof reference === 'object') {
          add((reference as { path?: unknown }).path);
        }
      });
    }
  } else {
    for (const match of source.matchAll(
      /"(?:extends|path)"\s*:\s*"((?:\\.|[^"\\])*)"/g
    )) {
      try {
        add(JSON.parse(`"${match[1]}"`));
      } catch {
        // Keep the current invalid config in the watch set; malformed child
        // paths cannot be resolved until the config itself is repaired.
      }
    }
  }

  return [...values].map((value) => resolveConfigPath(value, path));
};

export const findEditorConfig = (entryPath: string) => {
  let directory = dirname(entryPath);

  while (true) {
    const candidate = join(directory, 'tsconfig.json');

    if (existsSync(candidate)) return candidate;
    const parent = dirname(directory);

    if (parent === directory) return undefined;
    directory = parent;
  }
};

export const discoverEditorConfigFiles = (entryPath: string) => {
  const configPath = findEditorConfig(entryPath);

  if (!configPath) return Object.freeze([] as string[]);
  const result = new Set<string>();
  const visit = (path: string) => {
    const resolvedPath = resolve(path);

    if (result.has(resolvedPath)) return;
    result.add(resolvedPath);
    if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) return;
    referencedConfigPaths(resolvedPath).forEach(visit);
  };

  visit(configPath);

  return Object.freeze([...result]);
};

const EDITOR_SOURCE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.d.ts',
  '.mts',
  '.d.mts',
  '.cts',
  '.d.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
] as const;

const EDITOR_SOURCE_SUBSTITUTIONS: Readonly<Record<string, readonly string[]>> =
  {
    '.cjs': ['.cts', '.d.cts', '.cjs'],
    '.js': ['.ts', '.tsx', '.d.ts', '.js'],
    '.jsx': ['.tsx', '.d.ts', '.jsx'],
    '.mjs': ['.mts', '.d.mts', '.mjs'],
  };

/**
 * Resolve one path with TypeScript's source-substitution order.
 *
 * @internal
 */
export const resolveEditorSourceCandidate = (candidate: string) => {
  const extension = extname(candidate);
  const base = extension ? candidate.slice(0, -extension.length) : candidate;
  const substitutions = EDITOR_SOURCE_SUBSTITUTIONS[extension];
  const candidates = substitutions
    ? substitutions.map((sourceExtension) => `${base}${sourceExtension}`)
    : extension
      ? [candidate]
      : [
          ...EDITOR_SOURCE_EXTENSIONS.map(
            (sourceExtension) => `${candidate}${sourceExtension}`
          ),
          ...EDITOR_SOURCE_EXTENSIONS.map((sourceExtension) =>
            join(candidate, `index${sourceExtension}`)
          ),
        ];

  return candidates.find((path) => existsSync(path) && statSync(path).isFile());
};

export const editorSourceImportCandidates = (
  importer: string,
  specifier: string,
  configCache: EditorTsconfigCache = new Map(),
  projectConfigPath = findEditorConfig(importer)
) => {
  if (specifier.startsWith('.') || isAbsolute(specifier)) {
    return Object.freeze([resolve(dirname(importer), specifier)]);
  }
  const configPath = projectConfigPath;

  if (!configPath) return Object.freeze([] as string[]);
  try {
    let config = configCache.get(configPath);

    if (!configCache.has(configPath)) {
      config = readTsconfig(configPath, { typescriptVersion: '7.0.2' });
      configCache.set(configPath, config);
    }

    return Object.freeze(
      config ? resolvePathAlias(config, specifier) : ([] as string[])
    );
  } catch {
    // Invalid configs stay watched through discoverEditorConfigFiles and are
    // resolved after the user repairs the config.
    return Object.freeze([] as string[]);
  }
};

export const resolveEditorSourceImport = (
  importer: string,
  specifier: string,
  configCache?: EditorTsconfigCache,
  projectConfigPath?: string
) =>
  editorSourceImportCandidates(
    importer,
    specifier,
    configCache,
    projectConfigPath
  )
    .map(resolveEditorSourceCandidate)
    .find((path): path is string => Boolean(path));

const diagnosticText = (diagnostic: Diagnostic): string => {
  const chain = diagnostic.messageChain?.map(diagnosticText).filter(Boolean);

  return chain?.length
    ? `${diagnostic.text}\n${chain.join('\n')}`
    : diagnostic.text;
};

const formatDiagnostics = (
  diagnostics: readonly Diagnostic[],
  cwd: string,
  helpers: ReadonlyMap<string, string>
) =>
  diagnostics
    .map((diagnostic) => {
      const message = diagnosticText(diagnostic);

      if (!diagnostic.fileName || diagnostic.pos < 0) return message;
      const source =
        helpers.get(resolve(diagnostic.fileName)) ??
        (existsSync(diagnostic.fileName)
          ? readFileSync(diagnostic.fileName, 'utf-8')
          : '');
      const before = source.slice(0, diagnostic.pos);
      const line = before.split('\n').length;
      const character =
        diagnostic.pos - Math.max(before.lastIndexOf('\n') + 1, 0) + 1;

      return `${relative(cwd, diagnostic.fileName)}:${line}:${character} ${message}`;
    })
    .join('\n');

const escapeTemplateLiteralText = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${');

const nodeName = (node: Node) => {
  if ('text' in node && typeof node.text === 'string') return node.text;

  return undefined;
};

const printedNamedTypes = new WeakMap<Checker, Map<string, string>>();

const printNamedType = async (
  checker: Checker,
  type: Type,
  seen: ReadonlySet<number>,
  excludeUndefined = false
): Promise<string> => {
  let cache = printedNamedTypes.get(checker);

  if (!cache) {
    cache = new Map();
    printedNamedTypes.set(checker, cache);
  }
  const key = `${type.id}:${excludeUndefined ? 1 : 0}`;
  const cacheable = seen.size === 0;
  const cached = cacheable ? cache.get(key) : undefined;

  if (cached && !seen.has(type.id)) return cached;
  if (seen.has(type.id)) return 'unknown';
  const nextSeen = new Set(seen).add(type.id);
  try {
    const printed = await (async () => {
      if (type.isStringLiteralType()) return JSON.stringify(type.value);
      if (type.isNumberLiteralType()) return String(type.value);
      if (type.isBooleanLiteralType()) return type.value ? 'true' : 'false';
      if (type.flags & TypeFlags.Any) return 'unknown';
      if (type.flags & TypeFlags.Never) {
        throw new Error(
          'Generated editor property types cannot contain `never`.'
        );
      }
      if (type.flags & TypeFlags.Unknown) return 'unknown';
      if (type.isTemplateLiteralType()) {
        const types = await type.getTypes();
        const segments = await Promise.all(
          type.texts.map(async (text, index) => {
            const nested = types[index];

            return `${escapeTemplateLiteralText(text)}${
              nested
                ? `\${${await printNamedType(checker, nested, nextSeen)}}`
                : ''
            }`;
          })
        );

        return `\`${segments.join('')}\``;
      }
      if (type.flags & TypeFlags.StringLike) return 'string';
      if (type.flags & TypeFlags.NumberLike) return 'number';
      if (type.flags & TypeFlags.BigIntLike) return 'bigint';
      if (type.flags & TypeFlags.BooleanLike) return 'boolean';
      if (type.flags & TypeFlags.ESSymbolLike) return 'symbol';
      if (type.flags & TypeFlags.Null) return 'null';
      if (type.flags & (TypeFlags.Undefined | TypeFlags.Void)) {
        return 'undefined';
      }
      if (type.isUnionType()) {
        const unionTypes = await type.getTypes();
        const values = await Promise.all(
          unionTypes
            .filter(
              (item) =>
                !excludeUndefined ||
                !(item.flags & (TypeFlags.Undefined | TypeFlags.Void))
            )
            .map((item) => printNamedType(checker, item, nextSeen))
        );
        const unique = [...new Set(values)];

        if (unique.includes('unknown')) return 'unknown';
        if (unique.includes('false') && unique.includes('true')) {
          unique.splice(unique.indexOf('false'), 1);
          unique.splice(unique.indexOf('true'), 1);
          unique.push('boolean');
        }

        return unique.sort().join(' | ') || 'undefined';
      }
      if (type.isIntersectionType()) {
        const intersectionTypes = await type.getTypes();
        const printedTypes = await Promise.all(
          intersectionTypes.map(async (item) => ({
            item,
            printed: await printNamedType(checker, item, nextSeen),
          }))
        );
        const values = printedTypes.flatMap(
          ({ item, printed: innerPrinted }) =>
            innerPrinted === 'unknown'
              ? []
              : [item.isUnionType() ? `(${innerPrinted})` : innerPrinted]
        );

        return [...new Set(values)].join(' & ') || 'unknown';
      }
      if (type.isTupleType()) {
        const tuple = type;
        const tupleTypes = await checker.getTypeArguments(tuple);
        const values = await Promise.all(
          tupleTypes.map(async (item, index) => {
            const flag = tuple.elementFlags[index] ?? ElementFlags.Required;
            const innerPrinted2 = await printNamedType(
              checker,
              item,
              nextSeen,
              Boolean(flag & ElementFlags.Optional)
            );

            if (flag & (ElementFlags.Rest | ElementFlags.Variadic)) {
              return `...${item.isUnionType() ? `(${innerPrinted2})` : innerPrinted2}[]`;
            }

            return flag & ElementFlags.Optional
              ? `${innerPrinted2}?`
              : innerPrinted2;
          })
        );

        return `readonly [${values.join(', ')}]`;
      }
      if (await checker.isTupleType(type)) {
        const node = await checker.typeToTypeNode(
          type,
          undefined,
          NodeBuilderFlags.NoTruncation | NodeBuilderFlags.InTypeAlias
        );

        if (node && isTupleTypeNode(node)) {
          return printTypeNode(checker, node, nextSeen);
        }
      }
      if (await checker.isArrayType(type)) {
        const indexInfos = await checker.getIndexInfosOfType(type);
        const item = indexInfos.find(
          (index) => index.keyType.flags & TypeFlags.NumberLike
        )?.valueType;

        return `readonly (${item ? await printNamedType(checker, item, nextSeen) : 'unknown'})[]`;
      }
      if (type.isTypeParameter()) {
        const constraint = await checker.getBaseConstraintOfType(type);

        return constraint
          ? printNamedType(checker, constraint, nextSeen)
          : 'unknown';
      }
      const symbol = (await type.getAliasSymbol()) ?? (await type.getSymbol());

      if (
        symbol?.declarations.some((declaration) =>
          NODE_MODULES_PATH_PATTERN.test(declaration.path)
        )
      ) {
        return 'unknown';
      }
      if (!type.isObjectType()) {
        throw new Error(
          `Cannot materialize editor property type "${await checker.typeToString(type)}".`
        );
      }
      const callSignatures = await checker.getSignaturesOfType(
        type,
        SignatureKind.Call
      );

      if (callSignatures.length > 0) {
        return 'unknown';
      }
      const [symbols, indexInfos] = await Promise.all([
        checker.getPropertiesOfType(type),
        checker.getIndexInfosOfType(type),
      ]);
      const types = await checker.getTypeOfSymbol(symbols);
      const [fields, indexFields] = await Promise.all([
        Promise.all(
          symbols.map(async (property, index) => {
            const optional = (property.flags & SymbolFlags.Optional) !== 0;
            const value = types[index];

            return `readonly ${propertyName(property.name)}${optional ? '?' : ''}: ${
              value
                ? await printNamedType(checker, value, nextSeen, optional)
                : 'unknown'
            };`;
          })
        ),
        Promise.all(
          indexInfos.map(async (index) => {
            const innerKey =
              index.keyType.flags & TypeFlags.NumberLike ? 'number' : 'string';

            return `readonly [key: ${innerKey}]: ${await printNamedType(
              checker,
              index.valueType,
              nextSeen
            )};`;
          })
        ),
      ]);

      return `{ ${[...fields, ...indexFields].join(' ')} }`;
    })();

    if (cacheable) cache.set(key, printed);

    return printed;
  } catch (error) {
    cache.delete(key);
    throw error;
  }
};

const printTypeNode = async (
  checker: Checker,
  node: TypeNode,
  seen: ReadonlySet<number>,
  excludeUndefined = false
): Promise<string> => {
  switch (node.kind) {
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.ObjectKeyword:
    case SyntaxKind.UnknownKeyword: {
      return 'unknown';
    }
    case SyntaxKind.BigIntKeyword: {
      return 'bigint';
    }
    case SyntaxKind.BooleanKeyword: {
      return 'boolean';
    }
    case SyntaxKind.NeverKeyword: {
      throw new Error(
        'Generated editor property types cannot contain `never`.'
      );
    }
    case SyntaxKind.NumberKeyword: {
      return 'number';
    }
    case SyntaxKind.StringKeyword: {
      return 'string';
    }
    case SyntaxKind.SymbolKeyword: {
      return 'symbol';
    }
    case SyntaxKind.UndefinedKeyword:
    case SyntaxKind.VoidKeyword: {
      return 'undefined';
    }
    default: {
      break;
    }
  }
  if (isLiteralTypeNode(node)) {
    const value = node.literal;

    if (value.kind === SyntaxKind.NullKeyword) return 'null';
    if (value.kind === SyntaxKind.TrueKeyword) return 'true';
    if (value.kind === SyntaxKind.FalseKeyword) return 'false';
    if (value.kind === SyntaxKind.StringLiteral) {
      return JSON.stringify(nodeName(value) ?? '');
    }
    if (
      value.kind === SyntaxKind.NumericLiteral ||
      value.kind === SyntaxKind.BigIntLiteral
    ) {
      return nodeName(value) ?? 'unknown';
    }

    return 'unknown';
  }
  if (isUnionTypeNode(node)) {
    const values = [
      ...new Set(
        node.types
          .filter(
            (item) =>
              !excludeUndefined || item.kind !== SyntaxKind.UndefinedKeyword
          )
          .map((item) => item)
      ),
    ];
    const printed: string[] = [];

    for (const item of values) {
      printed.push(await printTypeNode(checker, item, seen));
    }
    const unique = [...new Set(printed)];

    if (unique.includes('unknown')) return 'unknown';
    if (unique.includes('false') && unique.includes('true')) {
      unique.splice(unique.indexOf('false'), 1);
      unique.splice(unique.indexOf('true'), 1);
      unique.push('boolean');
    }

    return unique.sort().join(' | ') || 'undefined';
  }
  if (isIntersectionTypeNode(node)) {
    const printed: string[] = [];

    for (const item of node.types) {
      const value = await printTypeNode(checker, item, seen);

      if (value !== 'unknown') {
        printed.push(isUnionTypeNode(item) ? `(${value})` : value);
      }
    }
    const values = [...new Set(printed)];

    return values.join(' & ') || 'unknown';
  }
  if (isParenthesizedTypeNode(node)) {
    return printTypeNode(checker, node.type, seen);
  }
  if (isTypeOperatorNode(node)) return printTypeNode(checker, node.type, seen);
  if (isArrayTypeNode(node)) {
    return `readonly (${await printTypeNode(checker, node.elementType, seen)})[]`;
  }
  if (isTupleTypeNode(node)) {
    const values: string[] = [];

    for (const element of node.elements) {
      if (isNamedTupleMember(element)) {
        const printed = await printTypeNode(
          checker,
          element.type,
          seen,
          Boolean(element.questionToken)
        );

        if (element.dotDotDotToken) {
          values.push(
            isArrayTypeNode(element.type)
              ? `...${await printTypeNode(checker, element.type.elementType, seen)}[]`
              : `...${printed}`
          );
        } else {
          values.push(element.questionToken ? `${printed}?` : printed);
        }
      } else if (isRestTypeNode(element)) {
        const printed = await printTypeNode(checker, element.type, seen);

        values.push(
          isArrayTypeNode(element.type)
            ? `...${await printTypeNode(checker, element.type.elementType, seen)}[]`
            : `...${printed}`
        );
      } else if (isOptionalTypeNode(element)) {
        values.push(
          `${await printTypeNode(checker, element.type, seen, true)}?`
        );
      } else {
        values.push(await printTypeNode(checker, element, seen));
      }
    }

    return `readonly [${values.join(', ')}]`;
  }
  if (isTemplateLiteralTypeNode(node)) {
    const spans: string[] = [];

    for (const span of node.templateSpans) {
      spans.push(
        `\${${await printTypeNode(checker, span.type, seen)}}${escapeTemplateLiteralText(span.literal.text)}`
      );
    }

    return `\`${escapeTemplateLiteralText(node.head.text)}${spans.join('')}\``;
  }
  if (isTypeLiteralNode(node)) {
    const fields: string[] = [];

    for (const member of node.members) {
      if (isPropertySignatureDeclaration(member)) {
        const name = nodeName(member.name);

        if (!name) return 'unknown';
        const optional = member.postfixToken?.kind === SyntaxKind.QuestionToken;

        fields.push(
          `readonly ${propertyName(name)}${optional ? '?' : ''}: ${await printTypeNode(
            checker,
            member.type,
            seen,
            optional
          )};`
        );
      } else if (isIndexSignatureDeclaration(member)) {
        const keyType = member.parameters[0]?.type;
        const key =
          keyType?.kind === SyntaxKind.NumberKeyword ? 'number' : 'string';

        fields.push(
          `readonly [key: ${key}]: ${await printTypeNode(
            checker,
            member.type,
            seen
          )};`
        );
      } else {
        return 'unknown';
      }
    }

    return `{ ${fields.join(' ')} }`;
  }

  if (isTypeReferenceNode(node)) {
    const type = await checker.getTypeFromTypeNode(node);

    return type
      ? printNamedType(checker, type, seen, excludeUndefined)
      : 'unknown';
  }

  // Remaining named, callable, conditional, indexed, mapped, imported, and
  // recursive references are not portable generated contract types.
  return 'unknown';
};

const printedPropertyTypes = new WeakMap<Checker, Map<string, string>>();

const printRootPropertyType = async (
  checker: Checker,
  type: Type,
  excludeUndefined: boolean
): Promise<string> => {
  let cache = printedPropertyTypes.get(checker);

  if (!cache) {
    cache = new Map();
    printedPropertyTypes.set(checker, cache);
  }
  const key = `${type.id}:${excludeUndefined ? 1 : 0}`;
  const cached = cache.get(key);

  if (cached) return cached;
  try {
    const printed = await printNamedType(
      checker,
      type,
      new Set<number>(),
      excludeUndefined
    );

    cache.set(key, printed);

    return printed;
  } catch (error) {
    cache.delete(key);
    throw error;
  }
};

const readTypePropertiesCache = new WeakMap<
  Checker,
  Map<string, Promise<NativeTypeProperties>>
>();

const readTypeProperties = async (
  checker: Checker,
  type: Type,
  propertyNames?: readonly string[]
): Promise<NativeTypeProperties> => {
  if (propertyNames?.length === 0) return Object.freeze({});
  let cache = readTypePropertiesCache.get(checker);

  if (!cache) {
    cache = new Map();
    readTypePropertiesCache.set(checker, cache);
  }
  const key = `${type.id}:${JSON.stringify(propertyNames ?? null)}`;
  const cached = cache.get(key);

  if (cached) return cached;
  const reading = (async () => {
    const propertyNameSet = propertyNames ? new Set(propertyNames) : undefined;
    const allSymbols = await checker.getPropertiesOfType(type);
    const symbols = allSymbols.filter(
      (symbol) => !propertyNameSet || propertyNameSet.has(symbol.name)
    );
    const types = await checker.getTypeOfSymbol(symbols);
    const entries = await Promise.all(
      symbols.map(async (symbol, index) => {
        const optional = (symbol.flags & SymbolFlags.Optional) !== 0;
        const value = types[index];
        let printed = 'unknown';

        try {
          if (value) {
            printed = await printRootPropertyType(checker, value, optional);
          }
        } catch (error) {
          throw new Error(
            `Cannot materialize schema property "${symbol.name}": ${
              error instanceof Error ? error.message : String(error)
            }`,
            { cause: error }
          );
        }

        return [
          symbol.name,
          Object.freeze({ optional, type: printed }),
        ] as const;
      })
    );

    return Object.freeze(Object.fromEntries(entries));
  })();

  cache.set(key, reading);
  try {
    return await reading;
  } catch (error) {
    cache.delete(key);
    throw error;
  }
};

const projectForHelper = async (
  snapshot: Snapshot,
  helperPath: string,
  configPath: string | undefined
) =>
  (configPath ? snapshot.getProject(configPath) : undefined) ??
  (await snapshot.getDefaultProjectForFile(helperPath));

export class NativeTypeScriptSession {
  readonly #api: API;
  readonly #ambientOpenFiles = new Set<string>();
  readonly #ambientOpenProjects = new Set<string>();
  readonly #cwd: string;
  readonly #helperPathByEntry = new Map<string, string>();
  readonly #pendingFileChanges = {
    changed: new Set<string>(),
    created: new Set<string>(),
    deleted: new Set<string>(),
  };
  #helperSources = new Map<string, string>();
  #ambientDiscovery = Promise.resolve();
  #snapshot: Snapshot | undefined;

  constructor(cwd: string, collectTiming = false) {
    this.#cwd = resolve(cwd);
    this.#api = new API({
      collectTiming,
      cwd: this.#cwd,
      fs: {
        getAccessibleEntries: (directoryName) => {
          const directory = resolve(directoryName);
          const virtualFiles = [...this.#helperSources.keys()].filter(
            (path) => dirname(path) === directory
          );

          if (virtualFiles.length === 0) return undefined;
          const entries = readdirSync(directory, { withFileTypes: true });

          return {
            directories: entries
              .filter((entry) => entry.isDirectory())
              .map(({ name }) => name),
            files: [
              ...new Set([
                ...entries
                  .filter((entry) => entry.isFile())
                  .map(({ name }) => name),
                ...virtualFiles.map((path) => basename(path)),
              ]),
            ],
          };
        },
        fileExists: (path) =>
          this.#helperSources.has(resolve(path)) ? true : undefined,
        readFile: (path) => this.#helperSources.get(resolve(path)),
      },
    });
  }

  async getTimingInfo(): Promise<TimingInfo> {
    return this.#api.getTimingInfo();
  }

  async discoverAmbientSourceFiles(entryPath: string) {
    const resolvedEntryPath = resolve(entryPath);
    const configPath = findEditorConfig(resolvedEntryPath);
    const discover = this.#ambientDiscovery.then(async () => {
      this.#ambientOpenFiles.add(resolvedEntryPath);
      if (configPath) this.#ambientOpenProjects.add(configPath);
      const previousSnapshot = this.#snapshot;
      const snapshot = await this.#api.updateSnapshot({
        openFiles: [...this.#ambientOpenFiles],
        ...(this.#ambientOpenProjects.size > 0
          ? { openProjects: [...this.#ambientOpenProjects] }
          : {}),
      });

      this.#snapshot = snapshot;
      if (previousSnapshot) await previousSnapshot.dispose();
      const project = await projectForHelper(
        snapshot,
        resolvedEntryPath,
        configPath
      );

      if (!project) {
        return Object.freeze(discoverEditorConfigFiles(entryPath));
      }

      return Object.freeze([
        ...discoverEditorConfigFiles(entryPath),
        ...localAmbientSourceFiles(await project.program.getSourceFileNames()),
      ]);
    });

    this.#ambientDiscovery = discover.then(
      () => undefined,
      () => undefined
    );

    return discover;
  }

  discardHelpers(paths: readonly string[]) {
    paths.forEach((path) => {
      const resolvedPath = resolve(path);

      this.#helperSources.delete(resolvedPath);
    });
  }

  helperPath(entryPath: string) {
    const resolvedEntryPath = resolve(entryPath);
    const existing = this.#helperPathByEntry.get(resolvedEntryPath);

    if (existing) return existing;
    const path = join(
      dirname(resolvedEntryPath),
      `__editor_schema_${process.pid}_${randomUUID()}.ts`
    );

    this.#helperPathByEntry.set(resolvedEntryPath, path);

    return path;
  }

  recordFileChange(event: 'add' | 'change' | 'unlink', path: string) {
    const resolvedPath = resolve(path);
    const { changed, created, deleted } = this.#pendingFileChanges;

    // Collapse each save burst to its net TS transition. In particular,
    // create -> unlink is no change, while unlink -> add is a replacement.
    if (event === 'add' || event === 'change') {
      if (deleted.delete(resolvedPath)) changed.add(resolvedPath);
      else if (event === 'add') {
        if (!changed.has(resolvedPath)) created.add(resolvedPath);
      } else if (!created.has(resolvedPath)) {
        changed.add(resolvedPath);
      }

      return;
    }
    const wasCreated = created.delete(resolvedPath);

    changed.delete(resolvedPath);
    if (wasCreated) {
      deleted.delete(resolvedPath);
    } else {
      deleted.add(resolvedPath);
    }
  }

  async materialize(
    helpers: readonly NativeTypeHelper[]
  ): Promise<readonly NativeTypeMaterialization[]> {
    const configs = helpers.map(({ path }) => findEditorConfig(path));
    const helperSources = new Map(
      helpers.map(({ path, source }) => [resolve(path), source])
    );
    const createdHelpers = [...helperSources.keys()].filter(
      (path) => !this.#helperSources.has(path)
    );
    const deletedHelpers = [...this.#helperSources.keys()].filter(
      (path) => !helperSources.has(path)
    );
    const changedHelpers = [...helperSources].flatMap(([path, source]) =>
      this.#helperSources.get(path) !== source && this.#helperSources.has(path)
        ? [path]
        : []
    );
    const pendingChanged = new Set(this.#pendingFileChanges.changed);
    const pendingCreated = new Set(this.#pendingFileChanges.created);
    const pendingDeleted = new Set(this.#pendingFileChanges.deleted);

    this.#pendingFileChanges.changed.clear();
    this.#pendingFileChanges.created.clear();
    this.#pendingFileChanges.deleted.clear();
    const changed = new Set([...pendingChanged, ...changedHelpers]);
    const created = new Set([...pendingCreated, ...createdHelpers]);
    const deleted = new Set([...pendingDeleted, ...deletedHelpers]);
    const previousSnapshot = this.#snapshot;
    const previousHelperSources = this.#helperSources;
    let nextSnapshot: Snapshot;

    this.#helperSources = helperSources;
    try {
      nextSnapshot = await this.#api.updateSnapshot({
        ...(changed.size > 0 || created.size > 0 || deleted.size > 0
          ? {
              fileChanges: {
                ...(changed.size > 0 ? { changed: [...changed] } : {}),
                ...(created.size > 0 ? { created: [...created] } : {}),
                ...(deleted.size > 0 ? { deleted: [...deleted] } : {}),
              },
            }
          : {}),
        openFiles: helpers.map(({ path }) => path),
        openProjects: [
          ...new Set(configs.filter((path): path is string => Boolean(path))),
        ],
      });
    } catch (error) {
      pendingChanged.forEach((path) => {
        this.#pendingFileChanges.changed.add(path);
      });
      pendingCreated.forEach((path) => {
        this.#pendingFileChanges.created.add(path);
      });
      pendingDeleted.forEach((path) => {
        this.#pendingFileChanges.deleted.add(path);
      });
      this.#helperSources = previousHelperSources;

      throw error;
    }

    this.#snapshot = nextSnapshot;
    if (previousSnapshot) await previousSnapshot.dispose();

    const projects = new Map<
      string,
      Awaited<ReturnType<typeof projectForHelper>>
    >();
    const projectEntries: Array<{
      helper: NativeTypeHelper;
      project: NonNullable<Awaited<ReturnType<typeof projectForHelper>>>;
      projectKey: string;
    }> = [];

    for (const [helperIndex, helper] of helpers.entries()) {
      const configPath = configs[helperIndex];
      const projectKey = configPath ?? helper.path;
      let project = projects.get(projectKey);

      if (!projects.has(projectKey)) {
        project = await projectForHelper(nextSnapshot, helper.path, configPath);
        projects.set(projectKey, project);
      }

      if (!project) {
        throw new Error(
          `Plate could not open a TypeScript project for "${helper.path}".`
        );
      }
      projectEntries.push({ helper, project, projectKey });
    }
    const configDiagnosticsByProject = new Map<
      string,
      Promise<readonly Diagnostic[]>
    >();
    const sourceFilesByProject = new Map<string, Promise<readonly string[]>>();
    const results = await Promise.all(
      projectEntries.map(async ({ helper, project, projectKey }) => {
        let configDiagnostics = configDiagnosticsByProject.get(projectKey);

        if (!configDiagnostics) {
          configDiagnostics = project.program.getConfigFileParsingDiagnostics();
          configDiagnosticsByProject.set(projectKey, configDiagnostics);
        }
        let projectSourceFiles = sourceFilesByProject.get(projectKey);

        if (!projectSourceFiles) {
          projectSourceFiles = project.program.getSourceFileNames();
          sourceFilesByProject.set(projectKey, projectSourceFiles);
        }
        const [config, syntactic, semantic, types, programSourceFiles] =
          await Promise.all([
            configDiagnostics,
            project.program.getSyntacticDiagnostics(helper.path),
            project.program.getSemanticDiagnostics(helper.path),
            project.checker.getTypeAtPosition(
              helper.path,
              helper.aliases.map(({ position }) => position)
            ),
            projectSourceFiles,
          ]);
        const diagnostics = [...config, ...syntactic, ...semantic];

        if (diagnostics.length > 0) {
          throw new Error(
            formatDiagnostics(diagnostics, this.#cwd, helperSources)
          );
        }
        const propertyEntries = await Promise.all(
          helper.aliases.map(async (alias, index) => {
            const type = types[index];

            if (!type) {
              throw new Error(
                `Missing generated type helper for "${alias.name}".`
              );
            }
            if (type.isErrorType()) {
              throw new Error(
                `Cannot resolve generated type helper "${alias.name}" in ${project.configFileName}: ${await project.checker.typeToString(type)}`
              );
            }

            try {
              return [
                alias.name,
                await readTypeProperties(
                  project.checker,
                  type,
                  alias.propertyNames
                ),
              ] as const;
            } catch (error) {
              throw new Error(
                `Cannot materialize schema property "${alias.name}": ${
                  error instanceof Error ? error.message : String(error)
                }`,
                { cause: error }
              );
            }
          })
        );
        const properties = Object.fromEntries(propertyEntries);
        const sourceFiles = [
          ...discoverEditorConfigFiles(helper.path),
          ...localAmbientSourceFiles(programSourceFiles),
        ].filter((path) => !helper.generatedPaths.has(resolve(path)));

        return Object.freeze({
          properties: Object.freeze(properties),
          sourceFiles: Object.freeze(
            sourceFiles.filter(
              (path, index, paths) => paths.indexOf(path) === index
            )
          ),
        });
      })
    );

    return Object.freeze(results);
  }

  async close() {
    try {
      if (this.#snapshot) await this.#snapshot.dispose();
    } finally {
      this.#snapshot = undefined;
      try {
        this.#helperPathByEntry.clear();
        this.#helperSources.clear();
        this.#ambientOpenFiles.clear();
        this.#ambientOpenProjects.clear();
      } finally {
        await this.#api.close();
      }
    }
  }
}
