#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { parse } from '@babel/parser';

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

const repoRoot = resolve(import.meta.dirname, '../..');
const editorConstructorNames = new Set([
  'createBaseEditor',
  'createPlateEditor',
  'createStaticEditor',
  'usePlateEditor',
  'usePlateViewEditor',
]);
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
const codeFencePattern =
  /^ {0,3}```([^\n`]*)\r?\n([\s\S]*?)^ {0,3}```[^\n]*$/gm;
const whitespacePattern = /\s+/;
const pluginFactoryNamePattern = /^define(?:BasePlugin|Extension|PlatePlugin)$/;
const pliteExtensionNamePattern = /^define.*Extension$/;
const pliteDomModulePattern = /^@platejs\/plite-dom(?:\/|$)/;
const pluginDescriptorOwnerPathPattern =
  /(?:^|\.)(?:editor|plugin|[A-Za-z_$][\w$]*Plugin)$/;
const prefixedOnListenerPattern = /^on[A-Z]/;
const pliteModulePattern = /^@platejs\/plite(?:\/|$)/;
const pliteReactModulePattern = /^@platejs\/plite-react$/;
const pliteRootModulePattern = /^@platejs\/plite$/;
const publicCoreModulePattern =
  /^(?:@platejs\/core(?:\/react|\/static)?|platejs(?:\/react|\/static)?)$/;
const plateModulePattern = /^(?:platejs|@platejs\/)/;
const internalCoreContractTypeSymbols = new Set([
  'InternalDefinitionOf',
  'InternalPluginDefinitionOf',
  'PluginDefinitionCarrier',
  'StaticEditorExtensionTypeLambda',
]);
const internalPliteContractTypeSymbols = new Set([
  'EditorExtensionDependencyReferenceFor',
  'EditorExtensionTypeLambda',
  'InternalEditorExtensionDependencyReference',
  'InternalEditorExtensionInstalledCapabilitiesOf',
  'InternalEditorExtensionTypeProviderOf',
  'InternalEditorExtensionWitnessFor',
]);
const contextualConfigureKeys = new Set([
  'initialState',
  'on',
  'override',
  'render',
  'shortcuts',
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
  'config',
  'extension',
  'handlers',
  'pluginApi',
  'targetPluginKeys',
  'tx',
  'validateConfiguration',
]);
const deletedPliteExtensionDefinitionKeys = new Set([
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
const removedEditorConstructorKeys = new Set(['onReady', 'value']);

const toPosixPath = (path) => path.split(sep).join('/');

const getPropertyName = (node) => {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type === 'StringLiteral') return node.value;

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

const parseCodeFence = (code) =>
  parse(code, {
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: true,
    errorRecovery: false,
    plugins: [
      'decorators-legacy',
      'explicitResourceManagement',
      'importAttributes',
      'jsx',
      'typescript',
    ],
    sourceType: 'unambiguous',
  });

export const extractJavaScriptCodeFences = (source) => {
  const fences = [];

  for (const match of source.matchAll(codeFencePattern)) {
    const language = (match[1] ?? '')
      .trim()
      .split(whitespacePattern, 1)[0]
      .toLowerCase();

    if (!codeFenceLanguages.has(language)) continue;

    const code = match[2] ?? '';
    const codeStart = (match.index ?? 0) + match[0].indexOf(code);

    fences.push({
      code,
      codeStart,
      language,
      line: getLineNumber(source, codeStart),
    });
  }

  return fences;
};

const readSchemaIdentity = (schemaProperty) => {
  if (!schemaProperty) return undefined;
  if (schemaProperty.shorthand) return { complete: true };

  const { value } = schemaProperty;

  if (value?.type !== 'ObjectExpression') return { complete: true };

  const id = getObjectProperty(value, 'id')?.value;
  const version = getObjectProperty(value, 'version')?.value;

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

const isForeignStoreSelectorExtension = (node) =>
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
  const property = value.computed
    ? value.property?.type === 'StringLiteral'
      ? value.property.value
      : undefined
    : getPropertyName(value.property);

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

const collectLocalPliteExtensionCreatorNames = (ast) => {
  const creators = new Set(['defineExtension']);
  const namespaces = new Set(['Plite']);
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
        getPropertyName(current.property) === 'defineExtension' &&
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
        getPropertyName(property.key) !== 'defineExtension'
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
          getPropertyName(specifier.imported) === 'defineExtension'
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
        getPropertyName(current.property) === exportedName &&
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
      if (
        property.type !== 'ObjectProperty' ||
        getPropertyName(property.key) !== exportedName
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
        destructuredCandidates.push({
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

  return {
    hasCall(node) {
      return (
        (node.type === 'CallExpression' ||
          node.type === 'OptionalCallExpression') &&
        isCallable(node.callee)
      );
    },
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

const getStaticExtensionProperties = (contribution, bindings) => {
  if (bindings) {
    return resolveStaticDocObjectProperties(contribution, bindings);
  }

  const value = unwrapTypedExpression(contribution);

  if (value?.type === 'ObjectExpression') return value.properties;
  if (isFunction(value)) return inspectContextualConfigure(value).properties;

  return [];
};

const isDefineCodecsCall = (property) => {
  if (property?.type !== 'ObjectProperty') return false;

  let value = unwrapTypedExpression(property.value);

  if (isFunction(value)) {
    value = unwrapTypedExpression(getStaticFunctionResult(value));
  }

  return (
    value?.type === 'CallExpression' &&
    value.callee.type === 'Identifier' &&
    value.callee.name === 'defineCodecs'
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
      !pliteExtensionNamePattern.test(node.callee.name))
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

export function auditPlateDocCode(source, file = 'content/docs/example.mdx') {
  const issues = [];

  for (const fence of extractJavaScriptCodeFences(source)) {
    let ast;

    try {
      ast = parseCodeFence(fence.code);
    } catch (error) {
      if (
        [...editorConstructorNames].some((name) =>
          fence.code.includes(`${name}(`)
        )
      ) {
        issues.push({
          column: (error.loc?.column ?? 0) + 1,
          file,
          line: fence.line + (error.loc?.line ?? 1) - 1,
          reason: `cannot validate editor construction in code fence: ${error.message}`,
        });
      }

      continue;
    }

    const staticValueBindings = collectStaticDocValueBindings(ast);
    const localPliteExtensionCreatorNames =
      collectLocalPliteExtensionCreatorNames(ast);
    const localReactFactoryNames = collectLocalModuleCallableNames(ast, {
      exportedName: 'react',
      modulePattern: pliteReactModulePattern,
    });
    const localClipboardHandlerNames = collectLocalModuleCallableNames(ast, {
      exportedName: 'clipboardHandler',
      modulePattern: pliteDomModulePattern,
    });
    const getAuthorProperties = (value) =>
      getStaticExtensionProperties(value, staticValueBindings);
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
        (localClipboardHandlerNames.hasCall(node) ||
          (node.type === 'CallExpression' &&
            node.callee.type === 'Identifier' &&
            node.callee.name === 'clipboardHandler')) &&
        node.arguments.length !== 1
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            'clipboardHandler accepts exactly one contextually typed handler argument'
          )
        );
      }
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
        node.typeName.name === 'EditorExtension' &&
        (node.typeParameters?.params.length ??
          node.typeArguments?.params.length ??
          0) > 1
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            'EditorExtension exposes one public Definition generic; transitive dependency requirements stay private'
          )
        );
      }
      if (
        node.type === 'TSTypeReference' &&
        node.typeName?.type === 'Identifier' &&
        node.typeName.name === 'EditorExtensionDependencyReference' &&
        (node.typeParameters?.params.length ??
          node.typeArguments?.params.length ??
          0) > 0
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node,
            'EditorExtensionDependencyReference is a shallow non-generic root identity; capability/provider contracts stay internal'
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
                `${importedName} is internal dependency typing; import it from @platejs/plite/internal`
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
            'extension APIs project through editor.api.<name>, not Object.assign(editor.api, extensionApi)'
          )
        );
      }

      if (
        memberCallName &&
        deletedPluginBuilderMethods.has(memberCallName) &&
        callsLikelyPluginBuilder &&
        !isForeignStoreSelectorExtension(node)
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
            'extension APIs use editor.api.<name> or editor.extension(Extension).api'
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

          if (key === 'codecs' && !isDefineCodecsCall(property)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'plugin codec declarations must use the context-bound defineCodecs(...) helper'
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

      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        ['defineBasePlugin', 'definePlatePlugin'].includes(node.callee.name)
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

          if (node.callee.name === 'defineBasePlugin' && key === 'component') {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'root-level component is available only in definePlatePlugin'
              )
            );
          }

          if (key === 'codecs' && !isDefineCodecsCall(property)) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                'plugin codec declarations must use the context-bound defineCodecs(...) helper'
              )
            );
          }
        }
      }

      if (localPliteExtensionCreatorNames.hasCall(node)) {
        if (node.arguments.length !== 2) {
          issues.push(
            createIssue(
              file,
              fence,
              node,
              'defineExtension requires (name, definition)'
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
              'defineExtension infers one definition from its author object'
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

            if (key && deletedPliteExtensionDefinitionKeys.has(key)) {
              issues.push(
                createIssue(
                  file,
                  fence,
                  property,
                  `deleted Plite extension definition field ${key}`
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
                  `extension ${key} must be declared as a factory`
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
                  'extension api factory receives one context object'
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

      if (
        isSchemaApiCall(node, 'getElementProperty') &&
        unwrapTypedExpression(node.arguments[1])?.type === 'StringLiteral'
      ) {
        issues.push(
          createIssue(
            file,
            fence,
            node.arguments[1],
            'known schema properties use a typed handle from schema.handle.property instead of a raw key'
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
                'contextual plugin configure only accepts explicit initialState, on, override, render, and shortcuts overrides'
              )
            );
          }
        }
      }

      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        editorConstructorNames.has(node.callee.name)
      ) {
        const argument = unwrapTypedExpression(node.arguments[0]);

        if (!argument) return;

        if (
          argument.type === 'Identifier' ||
          argument.type === 'SpreadElement'
        ) {
          return;
        }

        if (argument.type !== 'ObjectExpression') {
          issues.push(
            createIssue(
              file,
              fence,
              argument,
              `${node.callee.name} requires object options or a typed options pass-through`
            )
          );

          return;
        }

        const options = argument;

        for (const property of options.properties) {
          if (
            property.type !== 'SpreadElement' &&
            removedEditorConstructorKeys.has(getPropertyName(property.key))
          ) {
            issues.push(
              createIssue(
                file,
                fence,
                property,
                `editor construction does not accept ${getPropertyName(property.key)}`
              )
            );
          }
        }
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
  ...readdirSync(join(repoRoot, 'packages'))
    .map((entry) => join(repoRoot, 'packages', entry, 'README.md'))
    .filter(existsSync),
];

export function auditPlateDocCodeContracts() {
  const files = collectCurrentDocs();
  const issues = files.flatMap((path) => {
    const file = toPosixPath(relative(repoRoot, path));

    return auditPlateDocCode(readFileSync(path, 'utf-8'), file);
  });

  return { fileCount: files.length, issues };
}

function runAudit() {
  const { fileCount, issues } = auditPlateDocCodeContracts();

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
