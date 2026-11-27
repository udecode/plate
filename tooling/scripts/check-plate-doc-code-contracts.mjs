#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { parse } from '@babel/parser';

import { internalPliteContractTypeSymbols } from './plite-internal-symbols.mjs';

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

const repoRoot = resolve(import.meta.dirname, '../..');
const makerNamePattern = /\b(?:createEditor|useCreateEditor|useEditor)\b/;
const codeFenceLanguages = new Set([
  'javascript',
  'js',
  'jsx',
  'ts',
  'tsx',
  'typescript',
]);
const skippedDocsDirectoryNames = new Set([
  'changelog',
  'migration',
  'releases',
]);
const markdownFilePattern = /\.mdx?$/;
const whitespacePattern = /\s+/;
const pluginFactoryNamePattern = /^define(?:BasePlugin|Plugin)$/;
const plitePluginNamePattern = /^define.*Plugin$/;
const pluginDescriptorOwnerPathPattern =
  /(?:^|\.)(?:editor|plugin|[A-Za-z_$][\w$]*Plugin)$/;
const prefixedOnListenerPattern = /^on[A-Z]/;
const pliteModulePattern = /^plitejs(?:\/|$)/;
const pliteReactModulePattern = /^(?:platejs|plitejs)\/react$/;
const pliteRootModulePattern = /^(?:platejs|plitejs)$/;
const privatePliteModulePattern = /^(?:platejs|plitejs)\/internal(?:\/|$)/;
const publicCoreModulePattern =
  /^(?:@platejs\/core(?:\/react|\/static)?|platejs(?:\/react|\/static)?)$/;
const headlessPluginModulePattern = /^(?:@platejs\/core|platejs)$/;
const reactPluginModulePattern = /^(?:@platejs\/core\/react|platejs\/react)$/;
const plateModulePattern = /^(?:platejs|@platejs\/)/;
const internalCoreContractTypeSymbols = new Set([
  'InternalDefinitionOf',
  'InternalPluginDefinitionOf',
  'PluginDefinitionCarrier',
  'StaticPluginTypeLambda',
]);
const contextualConfigureKeys = new Set([
  'initialState',
  'on',
  'override',
  'render',
  'shortcuts',
  'slots',
]);
const deletedPluginBuilderMethods = new Set([
  'clone',
  'extendApi',
  'extendCodecs',
  'extendEditorApi',
  'extendExtension',
  'extendHtmlCodec',
  'extendSelectors',
  'extendTx',
  'extendTxGroup',
  'withComponent',
]);
const pluginAuthoringMethods = new Set([
  'configure',
  'configurePlugin',
  'extend',
  'extendPlugin',
  ...deletedPluginBuilderMethods,
]);
const deletedPlatePluginDefinitionKeys = new Set([
  'clipboard',
  'codecs',
  'config',
  'extension',
  'handlers',
  'pluginApi',
  'targetPluginKeys',
  'tx',
  'validateConfiguration',
]);
const deletedPlitePluginDefinitionKeys = new Set([
  'config',
  'state',
  'tx',
  'validateConfiguration',
]);
const deletedPluginContractSymbols = new Set(['InferConfig']);
const factoryOnlyCapabilityKeys = new Set([
  'api',
  'commands',
  'read',
  'readMiddleware',
  'update',
]);
const staleCapabilityFactoryContextBindings = new Set([
  'editorApi',
  'editorReads',
  'editorTransforms',
  'pluginApi',
  'pluginReads',
  'pluginTransforms',
]);
const makerOptionKeySources = {
  plate: {
    exportName: 'EDITOR_OPTION_KEYS',
    file: 'packages/platejs/src/lib/editor/withPlite.ts',
    label: "Plate's createEditor",
  },
  plateHook: {
    exportName: 'USE_CREATE_EDITOR_OPTION_KEYS',
    file: 'packages/platejs/src/react/editor/withPlate.ts',
    label: "Plate's useCreateEditor",
  },
  plite: {
    exportName: 'EDITOR_OPTION_KEYS',
    file: 'packages/plitejs/src/internal/editor-options.ts',
    label: "Plite's headless createEditor",
  },
  pliteReact: {
    exportName: 'REACT_EDITOR_OPTION_KEYS',
    file: 'packages/plitejs/src/react/plugin/with-react.ts',
    label: "Plite's React createEditor or useEditor",
  },
};
const importedMakers = [
  { exportedName: 'createEditor', modulePattern: /^platejs$/, set: 'plate' },
  {
    exportedName: 'createEditor',
    modulePattern: /^platejs\/react$/,
    set: 'plate',
  },
  {
    exportedName: 'useCreateEditor',
    modulePattern: /^platejs\/react$/,
    set: 'plateHook',
  },
  { exportedName: 'createEditor', modulePattern: /^plitejs$/, set: 'plite' },
  {
    exportedName: 'createEditor',
    modulePattern: /^plitejs\/react$/,
    set: 'pliteReact',
  },
  {
    exportedName: 'useEditor',
    modulePattern: /^plitejs\/react$/,
    set: 'pliteReact',
  },
];
const importedOptionlessContextHooks = [
  { exportedName: 'useEditor', modulePattern: /^platejs\/react$/ },
];
const unknownBinding =
  'the check cannot tell which binding of this maker name the call reads, so its options are unchecked';
const loadsMakerModule = (node) => {
  const source = node.arguments?.[0];

  return (
    node.type === 'CallExpression' &&
    (node.callee.type === 'Import' ||
      (node.callee.type === 'Identifier' && node.callee.name === 'require')) &&
    source?.type === 'StringLiteral' &&
    importedMakers.some(({ modulePattern }) => modulePattern.test(source.value))
  );
};
const editorMakingUseEditorSet = 'pliteReact';
const widestSetByPageLibrary = {
  plate: {
    createEditor: 'plate',
    useCreateEditor: 'plateHook',
    useEditor: editorMakingUseEditorSet,
  },
  plite: {
    createEditor: 'pliteReact',
    useCreateEditor: 'plateHook',
    useEditor: editorMakingUseEditorSet,
  },
};
const plitePagePattern =
  /^(?:content\/docs\/plite\/|packages\/plitejs\/README\.md$)/;
const sourceModuleExtensions = ['.ts', '/index.ts'];

const parseSourceModule = (path) =>
  parse(readFileSync(path, 'utf-8'), {
    plugins: ['jsx', 'typescript'],
    sourceType: 'module',
  });

const findTopLevelConstDeclarator = (ast, name, { requireExport }) =>
  ast.program.body
    .flatMap((statement) => {
      if (
        statement.type === 'ExportNamedDeclaration' &&
        statement.declaration?.type === 'VariableDeclaration' &&
        statement.declaration.kind === 'const'
      ) {
        return statement.declaration.declarations;
      }
      if (
        !requireExport &&
        statement.type === 'VariableDeclaration' &&
        statement.kind === 'const'
      ) {
        return statement.declarations;
      }

      return [];
    })
    .find(
      (candidate) =>
        candidate.id?.type === 'Identifier' && candidate.id.name === name
    );

const readOptionKeys = (
  path,
  exportName,
  { ast, requireExport = true, seen = new Set() } = {}
) => {
  const resolvedPath = resolve(path);
  const file = toPosixPath(relative(repoRoot, resolvedPath));
  const fail = (reason) => {
    throw new Error(
      `cannot read editor option keys ${exportName} from ${file}: ${reason}`
    );
  };
  const visitKey = `${resolvedPath}#${exportName}`;

  if (seen.has(visitKey)) {
    fail(`circular spread of ${exportName}`);
  }

  const nextSeen = new Set(seen);

  nextSeen.add(visitKey);

  const moduleAst = ast ?? parseSourceModule(resolvedPath);
  const declarator = findTopLevelConstDeclarator(moduleAst, exportName, {
    requireExport,
  });
  const keys = unwrapTypedExpression(declarator?.init);

  if (keys?.type !== 'ObjectExpression') {
    fail(
      requireExport
        ? 'no exported object literal by that name'
        : 'no const object literal by that name'
    );
  }

  return keys.properties.flatMap((property) => {
    if (property.type !== 'SpreadElement') {
      const key = property.computed ? undefined : getPropertyName(property.key);

      return key ?? fail('a key is not a plain name');
    }

    if (property.argument?.type !== 'Identifier') {
      fail('a spread is not a plain identifier');
    }

    const { name } = property.argument;

    if (
      findTopLevelConstDeclarator(moduleAst, name, { requireExport: false })
    ) {
      return readOptionKeys(resolvedPath, name, {
        ast: moduleAst,
        requireExport: false,
        seen: nextSeen,
      });
    }

    const imported = moduleAst.program.body
      .filter((statement) => statement.type === 'ImportDeclaration')
      .flatMap((statement) =>
        statement.specifiers.map((specifier) => ({ specifier, statement }))
      )
      .find(
        ({ specifier }) =>
          specifier.type === 'ImportSpecifier' && specifier.local.name === name
      );

    if (!imported?.statement.source.value.startsWith('.')) {
      fail(
        `its spread of ${name} is neither a same-file const nor a relative import`
      );
    }

    const base = resolve(
      dirname(resolvedPath),
      imported.statement.source.value
    );
    const target = sourceModuleExtensions
      .map((extension) => base + extension)
      .find(existsSync);

    if (!target) fail(`cannot find the module ${name} comes from`);

    return readOptionKeys(
      target,
      getPropertyName(imported.specifier.imported),
      {
        seen: nextSeen,
      }
    );
  });
};

let makerOptionKeys;

const getMakerOptionKeys = () => {
  makerOptionKeys ??= Object.fromEntries(
    Object.entries(makerOptionKeySources).map(
      ([set, { exportName, file, label }]) => [
        set,
        {
          keys: new Set(readOptionKeys(join(repoRoot, file), exportName)),
          label,
        },
      ]
    )
  );

  return makerOptionKeys;
};

const toPosixPath = (path) => path.split(sep).join('/');

const getPropertyName = (node) => {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type === 'StringLiteral') return node.value;

  return undefined;
};

const getMemberPropertyName = (member) =>
  member.computed
    ? member.property?.type === 'StringLiteral'
      ? member.property.value
      : undefined
    : getPropertyName(member.property);

const readStaticKey = (property) => {
  const { computed, key } = property;

  if (key?.type === 'StringLiteral') return key.value;
  if (key?.type === 'NumericLiteral') return String(key.value);
  if (key?.type === 'Identifier' && !computed) return key.name;

  return undefined;
};

const getObjectProperty = (node, name) =>
  node?.type === 'ObjectExpression'
    ? node.properties.find(
        (property) =>
          property.type !== 'SpreadElement' &&
          getPropertyName(property.key) === name
      )
    : undefined;

const getLineNumber = (source, offset) =>
  source.slice(0, offset).split('\n').length;

const visit = (node, callback, ancestors = []) => {
  if (!node || typeof node !== 'object') return;

  callback(node, ancestors);
  const nextAncestors = [...ancestors, node];

  for (const [key, value] of Object.entries(node)) {
    if (
      ['comments', 'errors', 'extra', 'loc', 'tokens'].includes(key) ||
      key === 'start' ||
      key === 'end'
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const child of value) visit(child, callback, nextAncestors);
    } else if (value && typeof value === 'object' && value.type) {
      visit(value, callback, nextAncestors);
    }
  }
};

const containsDefinitionOfType = (node) => {
  const value =
    node?.type === 'TSParenthesizedType' ? node.typeAnnotation : node;

  return (
    value?.type === 'TSTypeReference' &&
    value.typeName?.type === 'Identifier' &&
    value.typeName.name === 'DefinitionOf'
  );
};

const isDirectDefinitionOfDescriptor = (node) => {
  const value =
    node?.type === 'TSParenthesizedType' ? node.typeAnnotation : node;
  const parameter = value?.typeParameters?.params?.[0];

  return (
    containsDefinitionOfType(value) &&
    parameter?.type === 'TSTypeQuery' &&
    parameter.exprName?.type === 'Identifier'
  );
};

const parseCodeFence = (code, { jsx = true } = {}) =>
  parse(code, {
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: true,
    errorRecovery: false,
    plugins: [
      'decorators-legacy',
      'explicitResourceManagement',
      'importAttributes',
      ...(jsx ? ['jsx'] : []),
      'typescript',
    ],
    sourceType: 'unambiguous',
  });

// TypeScript reads `<Type>value` as an assertion only when JSX is off.
const parseFence = ({ code, language }) => {
  try {
    return parseCodeFence(code);
  } catch (error) {
    if (language !== 'ts' && language !== 'typescript') throw error;

    return parseCodeFence(code, { jsx: false });
  }
};

export const extractJavaScriptCodeFences = (source) => {
  const fences = [];
  let opening;
  const addFence = (end) => {
    if (!codeFenceLanguages.has(opening.language)) return;
    const { codeStart, language } = opening;
    fences.push({
      code: source.slice(codeStart, end),
      codeStart,
      language,
      line: getLineNumber(source, codeStart),
    });
  };

  for (const match of source.matchAll(/[^\r\n]*(?:\r?\n|$)/g)) {
    const line = match[0].replace(/\r?\n$/, '');

    if (opening) {
      const closing = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line);
      if (
        closing &&
        closing[1].startsWith(opening.marker[0]) &&
        closing[1].length >= opening.marker.length
      ) {
        addFence(match.index);
        opening = undefined;
      }
      continue;
    }

    const start = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (!start || (start[1].startsWith('`') && start[2].includes('`'))) {
      continue;
    }
    opening = {
      codeStart: match.index + match[0].length,
      language: start[2].trim().split(whitespacePattern, 1)[0].toLowerCase(),
      marker: start[1],
    };
  }

  if (opening) addFence(source.length);

  return fences;
};

const readSchemaIdentity = (schemaProperty) => {
  if (!schemaProperty) return undefined;
  if (schemaProperty.shorthand) return { complete: true };

  const { value } = schemaProperty;

  if (value?.type !== 'ObjectExpression') return { complete: true };

  const id = getObjectProperty(value, 'id')?.value;
  const version = getObjectProperty(value, 'version')?.value;

  if (!id && !version) return { complete: true };

  return {
    complete:
      id?.type === 'StringLiteral' &&
      id.value.length > 0 &&
      version?.type === 'NumericLiteral',
    id: id?.type === 'StringLiteral' ? id.value : undefined,
  };
};

const unwrapTypedExpression = (node) => {
  let value = node;

  while (
    value &&
    [
      'TSAsExpression',
      'TSNonNullExpression',
      'TSSatisfiesExpression',
      'TypeCastExpression',
    ].includes(value.type)
  ) {
    value = value.expression;
  }

  return value;
};

const createIssue = (file, fence, node, reason) => ({
  column: node.loc?.start.column === undefined ? 1 : node.loc.start.column + 1,
  file,
  line: fence.line + (node.loc?.start.line ?? 1) - 1,
  reason,
});

const isPluginFactoryCall = (node) =>
  node?.type === 'CallExpression' &&
  node.callee.type === 'Identifier' &&
  pluginFactoryNamePattern.test(node.callee.name);

const readMemberCallName = (node) =>
  node?.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed
    ? getPropertyName(node.callee.property)
    : undefined;

const readCallChainRootName = (node) => {
  let current = unwrapTypedExpression(node);

  while (current?.type === 'CallExpression') {
    if (current.callee.type === 'Identifier') return current.callee.name;
    if (current.callee.type !== 'MemberExpression' || current.callee.computed) {
      return undefined;
    }

    current = unwrapTypedExpression(current.callee.object);
  }

  return undefined;
};

const isForeignStoreSelectorPlugin = (node) =>
  readMemberCallName(node) === 'extendSelectors' &&
  readCallChainRootName(node) === 'createZustandStore';

const isFunction = (node) =>
  node?.type === 'ArrowFunctionExpression' ||
  node?.type === 'FunctionExpression' ||
  node?.type === 'ObjectMethod';
const isStaticCapabilityDeclaration = (property) =>
  property?.type === 'ObjectProperty' &&
  property.value?.type === 'ObjectExpression';
const getCapabilityFactoryParameterCount = (property) => {
  if (property?.type === 'ObjectMethod') return property.params.length;
  if (property?.type === 'ObjectProperty' && isFunction(property.value)) {
    return property.value.params.length;
  }

  return undefined;
};

const getStaticFunctionResult = (node) => {
  if (!isFunction(node)) return undefined;

  const body = unwrapTypedExpression(node.body);

  if (body?.type !== 'BlockStatement') return body;
  const returns = body.body.filter(
    (statement) => statement.type === 'ReturnStatement'
  );

  return returns.length === 1
    ? unwrapTypedExpression(returns[0].argument)
    : undefined;
};

const getStaticExpressionPath = (node) => {
  const value = unwrapTypedExpression(node);

  if (value?.type === 'Identifier') return value.name;
  if (
    value?.type !== 'MemberExpression' &&
    value?.type !== 'OptionalMemberExpression'
  ) {
    return undefined;
  }

  const object = getStaticExpressionPath(value.object);
  const property = getMemberPropertyName(value);

  return object && property ? `${object}.${property}` : undefined;
};

const collectStaticDocValueBindings = (ast) => {
  const candidates = new Map();
  const add = (name, value) => {
    if (!name) return;

    const values = candidates.get(name) ?? [];

    values.push(value);
    candidates.set(name, values);
  };

  visit(ast, (node) => {
    if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier') {
      add(node.id.name, node.init);
    }
    if (
      node.type === 'AssignmentExpression' &&
      node.operator === '=' &&
      node.left?.type === 'Identifier'
    ) {
      add(node.left.name, node.right);
    }
  });

  return {
    get(name) {
      const values = candidates.get(name);

      return values?.length === 1 ? values[0] : undefined;
    },
  };
};

const resolveStaticDocObjectProperties = (node, bindings, seen = new Set()) => {
  let value = unwrapTypedExpression(node);

  if (isFunction(value)) value = getStaticFunctionResult(value);
  if (value?.type === 'ObjectExpression') {
    return value.properties.flatMap((property) =>
      property.type === 'SpreadElement'
        ? resolveStaticDocObjectProperties(
            property.argument,
            bindings,
            new Set(seen)
          )
        : [property]
    );
  }
  if (value?.type !== 'Identifier' || seen.has(value.name)) return [];

  const resolved = bindings.get(value.name);

  if (!resolved) return [];

  const nextSeen = new Set(seen);

  nextSeen.add(value.name);

  return resolveStaticDocObjectProperties(resolved, bindings, nextSeen);
};

const isFullyResolvedStaticDocObject = (node, bindings, seen = new Set()) => {
  const value = unwrapTypedExpression(node);

  if (value?.type === 'ObjectExpression') {
    return value.properties.every(
      (property) =>
        property.type !== 'SpreadElement' ||
        isFullyResolvedStaticDocObject(
          property.argument,
          bindings,
          new Set(seen)
        )
    );
  }
  if (value?.type !== 'Identifier' || seen.has(value.name)) return false;

  const resolved = bindings.get(value.name);

  if (!resolved) return false;

  const nextSeen = new Set(seen);

  nextSeen.add(value.name);

  return isFullyResolvedStaticDocObject(resolved, bindings, nextSeen);
};

const collectLocalPlitePluginCreatorNames = (ast) => {
  const creators = new Set();
  const namespaces = new Set();
  const creatorCandidates = [];
  const namespaceCandidates = [];
  const destructuredCandidates = [];
  const isNamespace = (value) => {
    const current = unwrapTypedExpression(value);

    return current?.type === 'Identifier' && namespaces.has(current.name);
  };
  const isCreator = (value) => {
    const current = unwrapTypedExpression(value);

    return (
      (current?.type === 'Identifier' && creators.has(current.name)) ||
      ((current?.type === 'MemberExpression' ||
        current?.type === 'OptionalMemberExpression') &&
        getMemberPropertyName(current) === 'definePlugin' &&
        isNamespace(current.object))
    );
  };
  const addBinding = (name, value) => {
    if (!name) return;

    creatorCandidates.push({ name, value });
    namespaceCandidates.push({ name, value });
  };
  const addDestructure = (pattern, source) => {
    if (pattern?.type !== 'ObjectPattern') return;

    for (const property of pattern.properties) {
      if (
        property.type !== 'ObjectProperty' ||
        readStaticKey(property) !== 'definePlugin'
      ) {
        continue;
      }

      const value = unwrapTypedExpression(property.value);
      const identifier =
        value?.type === 'Identifier'
          ? value
          : value?.type === 'AssignmentPattern' &&
              value.left?.type === 'Identifier'
            ? value.left
            : undefined;

      if (identifier) {
        destructuredCandidates.push({ name: identifier.name, source });
      }
    }
  };

  visit(ast, (node) => {
    if (
      node.type === 'ImportDeclaration' &&
      pliteModulePattern.test(node.source.value)
    ) {
      for (const specifier of node.specifiers) {
        if (specifier.type === 'ImportNamespaceSpecifier') {
          namespaces.add(specifier.local.name);
        }
        if (
          specifier.type === 'ImportSpecifier' &&
          getPropertyName(specifier.imported) === 'definePlugin'
        ) {
          creators.add(specifier.local.name);
        }
      }

      return;
    }
    if (node.type === 'VariableDeclarator') {
      if (node.id?.type === 'Identifier') {
        addBinding(node.id.name, node.init);
      } else {
        addDestructure(node.id, node.init);
      }

      return;
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=') {
      if (node.left?.type === 'Identifier') {
        addBinding(node.left.name, node.right);
      } else {
        addDestructure(node.left, node.right);
      }
    }
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const candidate of creatorCandidates) {
      if (!creators.has(candidate.name) && isCreator(candidate.value)) {
        creators.add(candidate.name);
        changed = true;
      }
    }
    for (const candidate of namespaceCandidates) {
      if (!namespaces.has(candidate.name) && isNamespace(candidate.value)) {
        namespaces.add(candidate.name);
        changed = true;
      }
    }
    for (const candidate of destructuredCandidates) {
      if (!creators.has(candidate.name) && isNamespace(candidate.source)) {
        creators.add(candidate.name);
        changed = true;
      }
    }
  }

  return {
    hasCall(node) {
      if (node?.type !== 'CallExpression') return false;

      return isCreator(node.callee);
    },
  };
};

const collectLocalModuleCallableNames = (
  ast,
  { exportedName, modulePattern }
) => {
  const callables = new Set();
  const namespaces = new Set();
  const callableCandidates = [];
  const namespaceCandidates = [];
  const destructuredCandidates = [];
  const unnamedCandidates = [];
  const isNamespace = (value) => {
    const current = unwrapTypedExpression(value);

    return current?.type === 'Identifier' && namespaces.has(current.name);
  };
  const isCallable = (value) => {
    const current = unwrapTypedExpression(value);

    return (
      (current?.type === 'Identifier' && callables.has(current.name)) ||
      ((current?.type === 'MemberExpression' ||
        current?.type === 'OptionalMemberExpression') &&
        getMemberPropertyName(current) === exportedName &&
        isNamespace(current.object))
    );
  };

  visit(ast, (node) => {
    if (
      node.type === 'ImportDeclaration' &&
      modulePattern.test(node.source.value)
    ) {
      for (const specifier of node.specifiers) {
        if (specifier.type === 'ImportNamespaceSpecifier') {
          namespaces.add(specifier.local.name);
        }
        if (
          specifier.type === 'ImportSpecifier' &&
          getPropertyName(specifier.imported) === exportedName
        ) {
          callables.add(specifier.local.name);
        }
      }

      return;
    }
    if (node.type !== 'VariableDeclarator') return;

    if (node.id?.type === 'Identifier') {
      callableCandidates.push({ name: node.id.name, value: node.init });
      namespaceCandidates.push({ name: node.id.name, value: node.init });

      return;
    }
    if (node.id?.type !== 'ObjectPattern') return;

    for (const property of node.id.properties) {
      if (property.type !== 'ObjectProperty') continue;

      const key = readStaticKey(property);

      if (key !== undefined && key !== exportedName) continue;

      const value = unwrapTypedExpression(property.value);
      const identifier =
        value?.type === 'Identifier'
          ? value
          : value?.type === 'AssignmentPattern' &&
              value.left?.type === 'Identifier'
            ? value.left
            : undefined;

      if (identifier) {
        (key === undefined ? unnamedCandidates : destructuredCandidates).push({
          name: identifier.name,
          source: node.init,
        });
      }
    }
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const candidate of callableCandidates) {
      if (!callables.has(candidate.name) && isCallable(candidate.value)) {
        callables.add(candidate.name);
        changed = true;
      }
    }
    for (const candidate of namespaceCandidates) {
      if (!namespaces.has(candidate.name) && isNamespace(candidate.value)) {
        namespaces.add(candidate.name);
        changed = true;
      }
    }
    for (const candidate of destructuredCandidates) {
      if (!callables.has(candidate.name) && isNamespace(candidate.source)) {
        callables.add(candidate.name);
        changed = true;
      }
    }
  }

  const unnamed = new Set(
    unnamedCandidates
      .filter((candidate) => isNamespace(candidate.source))
      .map((candidate) => candidate.name)
  );
  const isUnnamed = (value) => {
    const current = unwrapTypedExpression(value);

    return (
      (current?.type === 'Identifier' && unnamed.has(current.name)) ||
      ((current?.type === 'MemberExpression' ||
        current?.type === 'OptionalMemberExpression') &&
        getMemberPropertyName(current) === undefined &&
        isNamespace(current.object))
    );
  };
  const isCall = (node) =>
    node.type === 'CallExpression' || node.type === 'OptionalCallExpression';

  return {
    hasCall: (node) => isCall(node) && isCallable(node.callee),
    hasUnnamedCall: (node) => isCall(node) && isUnnamed(node.callee),
    names: new Set([...callables, ...namespaces]),
  };
};

const isPromiseExpression = (node) =>
  (node?.type === 'NewExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'Promise') ||
  (node?.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    getPropertyName(node.callee.object) === 'Promise');

const readInvalidInitialValueReason = (property) => {
  if (!property) return undefined;
  const value =
    property.type === 'ObjectMethod'
      ? property
      : unwrapTypedExpression(property.value);

  if (isFunction(value)) {
    if (value.async) return 'editor initialValue callbacks must be synchronous';

    return readInvalidInitialValueReason({
      type: 'ObjectProperty',
      value: getStaticFunctionResult(value),
    });
  }
  if (isPromiseExpression(value)) {
    return 'editor initialValue cannot be a Promise; applications own async loading';
  }
  if (value?.type === 'NullLiteral') {
    return 'editor initialValue cannot be null';
  }
  if (value?.type === 'ArrayExpression' && value.elements.length === 0) {
    return 'editor initialValue must contain at least one element';
  }
  if (
    value &&
    [
      'BigIntLiteral',
      'BooleanLiteral',
      'DecimalLiteral',
      'NumericLiteral',
      'RegExpLiteral',
      'StringLiteral',
    ].includes(value.type)
  ) {
    return 'editor initialValue must be a document value or synchronous callback';
  }

  return undefined;
};

const inspectContextualConfigure = (callback) => {
  const body = unwrapTypedExpression(callback?.body);

  if (body?.type === 'ObjectExpression') {
    return { invalidReturns: [], properties: body.properties };
  }
  if (body?.type !== 'BlockStatement') {
    return { invalidReturns: [body ?? callback], properties: [] };
  }

  const invalidReturns = [];
  const properties = [];
  let returnCount = 0;
  const visitReturns = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node !== body && isFunction(node)) return;
    if (node.type === 'ReturnStatement') {
      const value = unwrapTypedExpression(node.argument);

      returnCount += 1;
      if (value?.type === 'ObjectExpression') {
        properties.push(...value.properties);
      } else {
        invalidReturns.push(value ?? node);
      }

      return;
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value) visitReturns(child);
      } else {
        visitReturns(value);
      }
    }
  };

  visitReturns(body);

  if (returnCount === 0) invalidReturns.push(callback);

  return { invalidReturns, properties };
};

const getStaticPluginProperties = (contribution, bindings) => {
  if (bindings) {
    return resolveStaticDocObjectProperties(contribution, bindings);
  }

  const value = unwrapTypedExpression(contribution);

  if (value?.type === 'ObjectExpression') return value.properties;
  if (isFunction(value)) return inspectContextualConfigure(value).properties;

  return [];
};

const isDefineFormatsCall = (property) => {
  if (property?.type !== 'ObjectProperty') return false;

  let value = unwrapTypedExpression(property.value);

  if (isFunction(value)) {
    value = unwrapTypedExpression(getStaticFunctionResult(value));
  }

  return (
    value?.type === 'CallExpression' &&
    value.callee.type === 'Identifier' &&
    value.callee.name === 'defineFormats'
  );
};

const isSchemaApiCall = (node, method) =>
  node?.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  getPropertyName(node.callee.property) === method &&
  node.callee.object.type === 'MemberExpression' &&
  getPropertyName(node.callee.object.property) === 'schema';

const hasContentOrVoid = (element) =>
  element.properties.some(
    (property) =>
      property.type === 'SpreadElement' ||
      ['content', 'void'].includes(getPropertyName(property.key))
  );

const getStaticPliteElementMap = (node) => {
  if (
    node?.type !== 'CallExpression' ||
    node.callee.type !== 'Identifier' ||
    (node.callee.name !== 'defineEditorSchema' &&
      !plitePluginNamePattern.test(node.callee.name))
  ) {
    return undefined;
  }

  const declaration = node.arguments[1];

  if (declaration?.type !== 'ObjectExpression') return undefined;

  const schema =
    node.callee.name === 'defineEditorSchema'
      ? declaration
      : getObjectProperty(declaration, 'schema')?.value;

  if (schema?.type !== 'ObjectExpression') return undefined;

  const elements = getObjectProperty(schema, 'elements')?.value;

  return elements?.type === 'ObjectExpression' ? elements : undefined;
};

const functionNodeTypes = new Set([
  'ArrowFunctionExpression',
  'ClassMethod',
  'ClassPrivateMethod',
  'FunctionDeclaration',
  'FunctionExpression',
  'ObjectMethod',
  'TSDeclareFunction',
]);
const namedBindingNodeTypes = new Set([
  'ClassDeclaration',
  'ClassExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'TSEnumDeclaration',
  'TSImportEqualsDeclaration',
  'TSModuleDeclaration',
]);

const collectPatternNames = (pattern, names) => {
  const value =
    pattern?.type === 'TSParameterProperty' ? pattern.parameter : pattern;

  if (value?.type === 'Identifier') names.push(value.name);
  if (value?.type === 'AssignmentPattern') {
    collectPatternNames(value.left, names);
  }
  if (value?.type === 'RestElement') collectPatternNames(value.argument, names);
  if (value?.type === 'ArrayPattern') {
    for (const element of value.elements) collectPatternNames(element, names);
  }
  if (value?.type === 'ObjectPattern') {
    for (const property of value.properties) {
      collectPatternNames(
        property.type === 'RestElement' ? property.argument : property.value,
        names
      );
    }
  }
};

const isTopLevelStatement = (ancestors) => {
  const parent = ancestors.at(-1);
  const container =
    parent?.type === 'ExportNamedDeclaration' ||
    parent?.type === 'ExportDefaultDeclaration'
      ? ancestors.at(-2)
      : parent;

  return container?.type === 'Program';
};

const collectFenceNames = (ast) => {
  const bindings = new Map();
  const topLevelBindings = new Map();
  const mentions = new Map();
  const topLevelConstObjects = new Map();
  let hidesBindings = false;
  const count = (map, name) => map.set(name, (map.get(name) ?? 0) + 1);
  const bind = (pattern, topLevel = false) => {
    const names = [];

    collectPatternNames(pattern, names);

    for (const name of names) {
      count(bindings, name);
      if (topLevel) count(topLevelBindings, name);
    }
  };

  visit(ast, (node, ancestors) => {
    if (node.type === 'Identifier') {
      count(mentions, node.name);
      if (node.name === 'eval' || node.name === 'Function') {
        hidesBindings = true;
      }
    }
    if (node.type === 'WithStatement') hidesBindings = true;
    if (node.type === 'VariableDeclarator') {
      const topLevel = isTopLevelStatement(ancestors.slice(0, -1));

      bind(node.id, topLevel);

      if (
        node.id?.type === 'Identifier' &&
        ancestors.at(-1)?.kind === 'const' &&
        topLevel &&
        unwrapTypedExpression(node.init)?.type === 'ObjectExpression'
      ) {
        topLevelConstObjects.set(node.id.name, node.init);
      }
    }
    if (functionNodeTypes.has(node.type)) {
      for (const param of node.params) bind(param);
    }
    if (namedBindingNodeTypes.has(node.type)) {
      bind(
        node.id,
        !node.type.endsWith('Expression') && isTopLevelStatement(ancestors)
      );
    }
    if (node.type === 'CatchClause') bind(node.param);
    if (node.type === 'ImportDeclaration') {
      for (const specifier of node.specifiers) bind(specifier.local, true);
    }
  });

  const spelledOnlyAtDeclarationAndOneUse = (name) => mentions.get(name) === 2;

  return {
    bindingCount: (name) => bindings.get(name) ?? 0,
    bindsOnceAtTopLevel: (name) =>
      bindings.get(name) === 1 && topLevelBindings.get(name) === 1,
    hidesBindings,
    readConstObject: (name) =>
      !hidesBindings && spelledOnlyAtDeclarationAndOneUse(name)
        ? topLevelConstObjects.get(name)
        : undefined,
  };
};

// A plain `__proto__: value` entry sets the object's prototype and adds no own key.
const setsPrototype = (property) =>
  property.type === 'ObjectProperty' &&
  !property.computed &&
  !property.shorthand &&
  readStaticKey(property) === '__proto__';

const readMakerOptionProperties = (node, fenceNames, seen = new Set()) => {
  const value = unwrapTypedExpression(node);

  if (value?.type === 'ObjectExpression') {
    if (
      value.properties.some(
        (property) => property.kind === 'get' || property.kind === 'set'
      )
    ) {
      return { complete: false, entries: [] };
    }

    const entries = [];
    let complete = true;

    for (const property of value.properties) {
      if (property.type !== 'SpreadElement') {
        const key = setsPrototype(property)
          ? undefined
          : readStaticKey(property);

        if (key === undefined) complete = false;
        else entries.push({ key, property });
        continue;
      }

      const spread = readMakerOptionProperties(
        property.argument,
        fenceNames,
        seen
      );

      complete &&= spread.complete;
      entries.push(...spread.entries);
    }

    return { complete, entries };
  }
  if (value?.type === 'Identifier' && !seen.has(value.name)) {
    const init = fenceNames.readConstObject(value.name);

    if (init) {
      return readMakerOptionProperties(
        init,
        fenceNames,
        new Set([...seen, value.name])
      );
    }
  }

  return { complete: false, entries: [] };
};

export function auditPlateDocCode(
  source,
  file = 'content/docs/example.mdx',
  uncheckedMakerCalls = []
) {
  const issues = [];
  const unimportedMakers =
    widestSetByPageLibrary[plitePagePattern.test(file) ? 'plite' : 'plate'];

  for (const fence of extractJavaScriptCodeFences(source)) {
    let ast;

    try {
      ast = parseFence(fence);
    } catch (error) {
      if (makerNamePattern.test(fence.code)) {
        issues.push({
          column: (error.loc?.column ?? 0) + 1,
          file,
          line: fence.line + (error.loc?.line ?? 1) - 1,
          reason: `cannot validate editor construction in code fence: ${error.message}`,
        });
      }

      continue;
    }

    for (const statement of ast.program.body) {
      if (statement.type !== 'ImportDeclaration') continue;
      const blankLine = fence.code
        .slice(statement.start, statement.end)
        .split(/\r?\n/)
        .findIndex((line) => line.trim() === '');
      if (blankLine === -1) continue;
      issues.push({
        column: 1,
        file,
        line: fence.line + statement.loc.start.line - 1 + blankLine,
        reason: 'blank line inside an import list',
      });
    }

    const staticValueBindings = collectStaticDocValueBindings(ast);
    const fenceNames = collectFenceNames(ast);
    const withCalls = (entries) =>
      entries.map((entry) => ({
        ...entry,
        calls: collectLocalModuleCallableNames(ast, entry),
      }));
    const makerImports = withCalls(importedMakers);
    const contextHookImports = withCalls(importedOptionlessContextHooks);
    const isRebound = ({ calls }) =>
      [...calls.names].some((name) => fenceNames.bindingCount(name) > 1);
    const resolveMaker = (node) => {
      const maker = makerImports.find(({ calls }) => calls.hasCall(node));

      if (maker) {
        return isRebound(maker) ? { unchecked: unknownBinding } : maker;
      }

      const hook = contextHookImports.find(({ calls }) => calls.hasCall(node));

      if (hook) {
        return isRebound(hook) ? { unchecked: unknownBinding } : { hook };
      }
      if (makerImports.some(({ calls }) => calls.hasUnnamedCall(node))) {
        return {
          unchecked:
            'the fence picks a maker module export by a computed key, so the call is unchecked',
        };
      }
      if (loadsMakerModule(node)) {
        return {
          unchecked:
            'the fence loads a maker module at runtime, so the check does not follow its makers',
        };
      }
      if (
        (node.type !== 'CallExpression' &&
          node.type !== 'OptionalCallExpression') ||
        node.callee.type !== 'Identifier' ||
        !Object.hasOwn(unimportedMakers, node.callee.name)
      ) {
        return undefined;
      }

      const { name } = node.callee;

      if (fenceNames.bindingCount(name) === 0 && !fenceNames.hidesBindings) {
        return { set: unimportedMakers[name] };
      }

      return fenceNames.bindsOnceAtTopLevel(name)
        ? undefined
        : { unchecked: unknownBinding };
    };
    const localPlitePluginCreatorNames =
      collectLocalPlitePluginCreatorNames(ast);
    const localHeadlessPluginCreatorNames = collectLocalModuleCallableNames(
      ast,
      {
        exportedName: 'definePlugin',
        modulePattern: headlessPluginModulePattern,
      }
    );
    const localReactPluginCreatorNames = collectLocalModuleCallableNames(ast, {
      exportedName: 'definePlugin',
      modulePattern: reactPluginModulePattern,
    });
    const localReactFactoryNames = collectLocalModuleCallableNames(ast, {
      exportedName: 'react',
      modulePattern: pliteReactModulePattern,
    });
    const getAuthorProperties = (value) =>
      getStaticPluginProperties(value, staticValueBindings);
    const reportPrefixedOnHandlers = (property) => {
      if (
        property.type !== 'ObjectProperty' ||
        getPropertyName(property.key) !== 'on'
      ) {
        return;
      }

      for (const handler of resolveStaticDocObjectProperties(
        property.value,
        staticValueBindings
      )) {
        const handlerName =
          handler.type === 'ObjectProperty' || handler.type === 'ObjectMethod'
            ? getPropertyName(handler.key)
            : undefined;

        if (prefixedOnListenerPattern.test(handlerName ?? '')) {
          issues.push(
            createIssue(
              file,
              fence,
              handler,
              `plugin on listeners are prefixless; use ${handlerName[2].toLowerCase()}${handlerName.slice(3)}`
            )
          );
        }
      }
    };
    const reportPliteConfigContext = (property) => {
      const key =
        property.type === 'ObjectProperty' || property.type === 'ObjectMethod'
          ? getPropertyName(property.key)
          : undefined;

      if (!['activate', 'api', 'schema', 'validate'].includes(key)) return;

      const callback =
        property.type === 'ObjectMethod'
          ? property
          : isFunction(unwrapTypedExpression(property.value))
            ? unwrapTypedExpression(property.value)
            : undefined;
      const parameter = callback?.params[key === 'activate' ? 1 : 0];

      if (parameter?.type !== 'ObjectPattern') return;

      for (const binding of parameter.properties) {
        if (
          binding.type === 'ObjectProperty' &&
          getPropertyName(binding.key) === 'config'
        ) {
          issues.push(
            createIssue(
              file,
              fence,
              binding,
              'final Plite schema/API/activation/validation contexts have no config'
            )
          );
        }
      }
    };
    const reportStaleCapabilityFactoryContext = (property) => {
      const key =
        property.type === 'ObjectProperty' || property.type === 'ObjectMethod'
          ? getPropertyName(property.key)
          : undefined;

      if (!['api', 'read', 'update'].includes(key)) return;

      const callback =
        property.type === 'ObjectMethod'
          ? property
          : isFunction(unwrapTypedExpression(property.value))
            ? unwrapTypedExpression(property.value)
            : undefined;
      const parameter = callback?.params[0];

      if (parameter?.type !== 'ObjectPattern') return;

      for (const binding of parameter.properties) {
        const bindingName =
          binding.type === 'ObjectProperty'
            ? getPropertyName(binding.key)
            : undefined;

        if (
          bindingName &&
          staleCapabilityFactoryContextBindings.has(bindingName)
        ) {
          issues.push(
            createIssue(
              file,
              fence,
              binding,
              `stale ${key} factory context binding ${bindingName}`
            )
          );
        }
      }
    };

    visit(ast, (node, ancestors) => {
      if (
        node.type === 'TSTypeAliasDeclaration' &&
        containsDefinitionOfType(node.typeAnnotation) &&
        (!node.id.name.endsWith('Definition') ||
          (isDirectDefinitionOfDescriptor(node.typeAnnotation) &&
            node.id.name.endsWith('PluginDefinition')))
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node.id,
            'aliases derived with DefinitionOf use FooDefinition, never FooPluginDefinition'
          )
        );
      }
      if (
        node.type === 'TSTypeReference' &&
        node.typeName?.type === 'Identifier' &&
        node.typeName.name === 'Plugin' &&
        (node.typeParameters?.params.length ??
          node.typeArguments?.params.length ??
          0) > 1
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            'Plugin exposes one public Definition generic; transitive dependency requirements stay private'
          )
        );
      }
      if (
        node.type === 'TSTypeReference' &&
        node.typeName?.type === 'Identifier' &&
        node.typeName.name === 'PluginDependencyReference' &&
        (node.typeParameters?.params.length ??
          node.typeArguments?.params.length ??
          0) > 0
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            'PluginDependencyReference is a shallow non-generic root identity; capability/provider contracts stay internal'
          )
        );
      }
      if (
        node.type === 'ImportDeclaration' &&
        privatePliteModulePattern.test(node.source.value)
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            `${node.source.value} is not a public package entrypoint`
          )
        );
      }
      if (
        node.type === 'ImportDeclaration' &&
        pliteRootModulePattern.test(node.source.value)
      ) {
        for (const specifier of node.specifiers) {
          const importedName =
            specifier.type === 'ImportSpecifier'
              ? getPropertyName(specifier.imported)
              : undefined;

          if (internalPliteContractTypeSymbols.has(importedName)) {
            issues.push(
              createIssue(
                file,
                fence,
                specifier,
                `${importedName} is internal dependency typing and cannot be imported from the public editor root`
              )
            );
          }
        }
      }
      if (
        node.type === 'ImportDeclaration' &&
        publicCoreModulePattern.test(node.source.value)
      ) {
        for (const specifier of node.specifiers) {
          const importedName =
            specifier.type === 'ImportSpecifier'
              ? getPropertyName(specifier.imported)
              : undefined;

          if (internalCoreContractTypeSymbols.has(importedName)) {
            issues.push(
              createIssue(
                file,
                fence,
                specifier,
                `${importedName} is internal Core author-to-canonical typing and cannot be imported from a public entrypoint`
              )
            );
          }
        }
      }
      if (localReactFactoryNames.hasCall(node)) {
        const options = node.arguments.length === 1 ? node.arguments[0] : null;
        const properties = options ? getAuthorProperties(options) : [];
        const propertyNames = properties.map((property) =>
          property.type === 'ObjectProperty' || property.type === 'ObjectMethod'
            ? getPropertyName(property.key)
            : undefined
        );

        if (
          properties.length !== 1 ||
          propertyNames[0] !== 'dom' ||
          node.arguments.length !== 1 ||
          !isFullyResolvedStaticDocObject(options, staticValueBindings)
        ) {
          issues.push(
            createIssue(
              file,
              fence,
              node,
              'react requires exactly one { dom } object containing the exact DOM descriptor'
            )
          );
        }
      }

      if (
        node.type === 'Identifier' &&
        deletedPluginContractSymbols.has(node.name) &&
        ((ancestors.at(-1)?.type === 'TSTypeReference' &&
          ancestors.at(-1).typeName === node) ||
          (ancestors.at(-1)?.type === 'ImportSpecifier' &&
            plateModulePattern.test(ancestors.at(-2)?.source?.value ?? '') &&
            (ancestors.at(-1).imported === node ||
              ancestors.at(-1).local === node)))
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            `deleted Plate plugin contract symbol ${node.name}; use DefinitionOf`
          )
        );
      }

      const memberCallName = readMemberCallName(node);
      const memberCallOwner =
        node?.callee?.type === 'MemberExpression'
          ? unwrapTypedExpression(node.callee.object)
          : undefined;
      const memberCallOwnerPath = getStaticExpressionPath(memberCallOwner);
      const callsLikelyPluginBuilder =
        pluginDescriptorOwnerPathPattern.test(memberCallOwnerPath ?? '') ||
        pluginFactoryNamePattern.test(
          readCallChainRootName(memberCallOwner) ?? ''
        );

      if (
        memberCallName === 'assign' &&
        memberCallOwnerPath === 'Object' &&
        getStaticExpressionPath(node.arguments[0]) === 'editor.api'
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            'plugin APIs project through editor.api.<name>, not Object.assign(editor.api, extensionApi)'
          )
        );
      }

      if (
        memberCallName &&
        deletedPluginBuilderMethods.has(memberCallName) &&
        callsLikelyPluginBuilder &&
        !isForeignStoreSelectorPlugin(node)
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            memberCallName === 'withComponent'
              ? 'deleted plugin builder .withComponent(); use root-level component'
              : `deleted plugin builder .${memberCallName}(); use constructor fields or .extend() when context is required`
          )
        );
      }

      if (memberCallName === 'getApi' && memberCallOwnerPath === 'editor') {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            'plugin APIs use editor.api.<name> or editor.plugin(Plugin).api'
          )
        );
      }

      if (memberCallName === 'extend') {
        for (const property of getAuthorProperties(node.arguments[0])) {
          const key = getPropertyName(property.key);

          reportPrefixedOnHandlers(property);
          reportStaleCapabilityFactoryContext(property);

          if (key && deletedPlatePluginDefinitionKeys.has(key)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                `deleted Plate plugin definition field ${key}`
              )
            );
          }

          if (
            key &&
            factoryOnlyCapabilityKeys.has(key) &&
            isStaticCapabilityDeclaration(property)
          ) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                `plugin ${key} must be declared as a factory`
              )
            );
          }

          if (
            key === 'api' &&
            (getCapabilityFactoryParameterCount(property) ?? 0) > 1
          ) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'plugin api factory receives one context object'
              )
            );
          }

          if (key === 'formats' && !isDefineFormatsCall(property)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'plugin format declarations must use the context-bound defineFormats(...) helper'
              )
            );
          }
        }
      }

      if (memberCallName === 'configure') {
        for (const property of getAuthorProperties(node.arguments[0])) {
          const key = getPropertyName(property.key);

          reportPrefixedOnHandlers(property);
          reportStaleCapabilityFactoryContext(property);

          if (key && deletedPlatePluginDefinitionKeys.has(key)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                `deleted Plate plugin definition field ${key}`
              )
            );
          }

          if (key === 'api') {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'plugin api is an author factory and cannot be configured'
              )
            );
          }
        }
      }

      const isPlitePluginCreator = localPlitePluginCreatorNames.hasCall(node);
      const isHeadlessPluginCreator =
        localHeadlessPluginCreatorNames.hasCall(node);
      const isReactPluginCreator =
        localReactPluginCreatorNames.hasCall(node) ||
        (node.type === 'CallExpression' &&
          node.callee.type === 'Identifier' &&
          node.callee.name === 'definePlugin' &&
          !isPlitePluginCreator &&
          !isHeadlessPluginCreator);

      if (
        !isPlitePluginCreator &&
        (isHeadlessPluginCreator || isReactPluginCreator)
      ) {
        if (node.arguments.length !== 2) {
          issues.push(
            createIssue(
              file,
              fence,
              node,
              `${node.callee.name} requires (name, definition)`
            )
          );
        }
        if (
          node.typeParameters?.params.length > 0 ||
          node.typeArguments?.params.length > 0
        ) {
          issues.push(
            createIssue(
              file,
              fence,
              node,
              'Plate plugin factory infers one definition from the author object'
            )
          );
        }

        for (const property of getAuthorProperties(node.arguments[1])) {
          const key =
            property.type === 'ObjectProperty' ||
            property.type === 'ObjectMethod'
              ? getPropertyName(property.key)
              : undefined;

          reportPrefixedOnHandlers(property);
          reportStaleCapabilityFactoryContext(property);

          if (key === 'key') {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'Plate plugin identity uses name instead of key'
              )
            );
          }

          if (key && deletedPlatePluginDefinitionKeys.has(key)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                `deleted Plate plugin definition field ${key}`
              )
            );
          }

          if (
            key &&
            factoryOnlyCapabilityKeys.has(key) &&
            isStaticCapabilityDeclaration(property)
          ) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                `plugin ${key} must be declared as a factory`
              )
            );
          }

          if (
            key === 'api' &&
            (getCapabilityFactoryParameterCount(property) ?? 0) > 1
          ) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'plugin api factory receives one context object'
              )
            );
          }

          if (isHeadlessPluginCreator && key === 'component') {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'root-level component is available only in definePlugin'
              )
            );
          }

          if (key === 'formats' && !isDefineFormatsCall(property)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'plugin format declarations must use the context-bound defineFormats(...) helper'
              )
            );
          }
        }
      }

      if (localPlitePluginCreatorNames.hasCall(node)) {
        if (node.arguments.length !== 2) {
          issues.push(
            createIssue(
              file,
              fence,
              node,
              'definePlugin requires (name, definition)'
            )
          );
        }
        if (
          node.typeParameters?.params.length > 0 ||
          node.typeArguments?.params.length > 0
        ) {
          issues.push(
            createIssue(
              file,
              fence,
              node,
              'definePlugin infers one definition from its author object'
            )
          );
        }

        if (node.arguments[1]) {
          for (const property of getAuthorProperties(node.arguments[1])) {
            const key =
              property.type === 'ObjectProperty' ||
              property.type === 'ObjectMethod'
                ? getPropertyName(property.key)
                : undefined;

            reportPrefixedOnHandlers(property);
            reportPliteConfigContext(property);
            reportStaleCapabilityFactoryContext(property);

            if (key && deletedPlitePluginDefinitionKeys.has(key)) {
              issues.push(
                createIssue(
                  file,
                  fence,
                  property,
                  `deleted Plite plugin definition field ${key}`
                )
              );
            }

            if (
              key &&
              factoryOnlyCapabilityKeys.has(key) &&
              isStaticCapabilityDeclaration(property)
            ) {
              issues.push(
                createIssue(
                  file,
                  fence,
                  property,
                  `plugin ${key} must be declared as a factory`
                )
              );
            }

            if (
              key === 'api' &&
              (getCapabilityFactoryParameterCount(property) ?? 0) > 1
            ) {
              issues.push(
                createIssue(
                  file,
                  fence,
                  property,
                  'plugin api factory receives one context object'
                )
              );
            }
          }
        }
      }

      if (
        node.type === 'ObjectProperty' &&
        getPropertyName(node.key) === 'render' &&
        node.value?.type === 'ObjectExpression'
      ) {
        const nodeComponent = getObjectProperty(node.value, 'node');

        if (nodeComponent) {
          issues.push(
            createIssue(
              file,
              fence,
              nodeComponent,
              'plugin node components must use root-level component instead of render.node authoring'
            )
          );
        }
      }

      if (
        memberCallName &&
        pluginAuthoringMethods.has(memberCallName) &&
        readMemberCallName(memberCallOwner) === 'configure'
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            'configure must be the final plugin authoring call'
          )
        );
      }

      const pliteElements = getStaticPliteElementMap(node);

      for (const elementProperty of pliteElements?.properties ?? []) {
        if (
          elementProperty.type === 'SpreadElement' ||
          elementProperty.value?.type !== 'ObjectExpression' ||
          hasContentOrVoid(elementProperty.value)
        ) {
          continue;
        }

        issues.push(
          createIssue(
            file,
            fence,
            elementProperty,
            'non-void element schema requires explicit content'
          )
        );
      }

      if (isSchemaApiCall(node, 'property')) {
        const query = unwrapTypedExpression(node.arguments[0]);
        const key = getObjectProperty(query, 'key')?.value;
        const placement = getObjectProperty(query, 'placement')?.value;
        const type = getObjectProperty(query, 'type')?.value;

        if (
          key?.type === 'StringLiteral' &&
          placement?.type === 'StringLiteral' &&
          type?.type === 'StringLiteral'
        ) {
          issues.push(
            createIssue(
              file,
              fence,
              query,
              'known schema property context uses a typed handle instead of raw literals'
            )
          );
        }
      }

      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        !node.callee.computed &&
        getPropertyName(node.callee.property) === 'configure' &&
        isFunction(node.arguments[0])
      ) {
        const inspection = inspectContextualConfigure(node.arguments[0]);

        for (const invalidReturn of inspection.invalidReturns) {
          issues.push(
            createIssue(
              file,
              fence,
              invalidReturn,
              'contextual plugin configure callbacks must return an explicit object'
            )
          );
        }
        for (const property of inspection.properties) {
          const key =
            property.type === 'SpreadElement'
              ? undefined
              : getPropertyName(property.key);

          if (!key || !contextualConfigureKeys.has(key)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'contextual plugin configure only accepts explicit initialState, on, override, render, shortcuts, and slots overrides'
              )
            );
          }
        }
      }

      const maker = resolveMaker(node);

      if (maker?.unchecked) {
        uncheckedMakerCalls.push(
          createIssue(file, fence, node.callee, maker.unchecked)
        );

        return;
      }
      if (maker?.hook) {
        const argument = node.arguments.find(
          ({ type }) => type !== 'SpreadElement'
        );

        if (argument) {
          issues.push(
            createIssue(
              file,
              fence,
              argument,
              "Plate's useEditor takes no options; build the editor with useCreateEditor"
            )
          );
        } else if (node.arguments.length > 0) {
          uncheckedMakerCalls.push(
            createIssue(
              file,
              fence,
              node.arguments[0],
              'the fence spreads values into this call, so the check cannot tell whether it passes options'
            )
          );
        }

        return;
      }
      if (maker) {
        const argument = unwrapTypedExpression(node.arguments[0]);

        if (!argument) return;

        if (
          argument.type !== 'Identifier' &&
          argument.type !== 'SpreadElement' &&
          argument.type !== 'ObjectExpression'
        ) {
          issues.push(
            createIssue(
              file,
              fence,
              argument,
              `${getStaticExpressionPath(node.callee)} requires object options or a typed options pass-through`
            )
          );

          return;
        }

        const { keys, label } = getMakerOptionKeys()[maker.set];
        const { complete, entries } =
          argument.type === 'SpreadElement'
            ? { complete: false, entries: [] }
            : readMakerOptionProperties(argument, fenceNames);

        if (!complete) {
          uncheckedMakerCalls.push(
            createIssue(
              file,
              fence,
              argument,
              'the fence does not pin down every key of these options, so they are unchecked'
            )
          );
        }
        for (const { key, property } of entries) {
          if (!keys.has(key)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                `${label} does not accept ${key}`
              )
            );
          }
        }

        if (argument.type !== 'ObjectExpression') return;

        const options = argument;
        const initialValueProperty = getObjectProperty(options, 'initialValue');
        const invalidInitialValueReason =
          readInvalidInitialValueReason(initialValueProperty);

        if (invalidInitialValueReason) {
          issues.push(
            createIssue(
              file,
              fence,
              initialValueProperty,
              invalidInitialValueReason
            )
          );
        }
        const schemaProperty = getObjectProperty(options, 'schema');
        const identity = readSchemaIdentity(schemaProperty);

        if (schemaProperty && !identity?.complete) {
          issues.push(
            createIssue(
              file,
              fence,
              schemaProperty,
              'named editor schema lineages require string id and numeric version'
            )
          );
        }
      }

      if (!isPluginFactoryCall(node)) return;

      const declaration = node.arguments[1];

      if (declaration?.type !== 'ObjectExpression') return;

      const schemaProperty = getObjectProperty(declaration, 'schema');
      const schemaValue = schemaProperty?.value;

      if (schemaValue?.type !== 'ObjectExpression') return;

      const elementProperty = getObjectProperty(schemaValue, 'element');
      const element = elementProperty?.value;

      if (element?.type === 'ObjectExpression' && !hasContentOrVoid(element)) {
        issues.push(
          createIssue(
            file,
            fence,
            elementProperty,
            'non-void element schema requires explicit content'
          )
        );
      }
    });
  }

  return issues;
}

const collectMarkdownFiles = (root) => {
  if (!existsSync(root)) return [];

  return readdirSync(root)
    .flatMap((entry) => {
      const path = join(root, entry);

      if (statSync(path).isDirectory()) {
        return skippedDocsDirectoryNames.has(entry)
          ? []
          : collectMarkdownFiles(path);
      }

      return markdownFilePattern.test(path) ? [path] : [];
    })
    .sort(compareStrings);
};

const collectCurrentDocs = () => [
  ...collectMarkdownFiles(join(repoRoot, 'content/docs')),
  join(repoRoot, 'content/docs/migration/plite-to-plate.mdx'),
  join(repoRoot, 'content/docs/migration/plite-to-plate.cn.mdx'),
  ...readdirSync(join(repoRoot, 'packages'))
    .map((entry) => join(repoRoot, 'packages', entry, 'README.md'))
    .filter(existsSync),
];

export function auditPlateDocCodeContracts() {
  const files = collectCurrentDocs();
  const uncheckedMakerCalls = [];
  const issues = files.flatMap((path) => {
    const file = toPosixPath(relative(repoRoot, path));

    return auditPlateDocCode(
      readFileSync(path, 'utf-8'),
      file,
      uncheckedMakerCalls
    );
  });

  return { fileCount: files.length, issues, uncheckedMakerCalls };
}

function runAudit() {
  const { fileCount, issues, uncheckedMakerCalls } =
    auditPlateDocCodeContracts();

  for (const call of uncheckedMakerCalls) {
    console.log(
      `note ${call.file}:${call.line}:${call.column}: ${call.reason}`
    );
  }

  if (issues.length > 0) {
    console.error('Plate docs code contract audit failed:');
    for (const issue of issues) {
      console.error(
        `- ${issue.file}:${issue.line}:${issue.column}: ${issue.reason}`
      );
    }
    process.exit(1);
  }

  console.log(
    `Plate docs code contract audit passed (${fileCount} current docs files).`
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runAudit();
}
