#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { parse } from '@babel/parser';

import { extractJavaScriptCodeFences } from './check-plate-doc-code-contracts.mjs';

const repoRoot = resolve(import.meta.dirname, '../..');
const sourceRoots = ['packages', 'apps', 'benchmarks', 'content'];
export const ciGeneratedPlateSchemaOutputRoots = Object.freeze([
  'apps/www/public/r',
  'apps/www/public/rd',
  'templates',
]);
const markdownFilePattern = /\.mdx?$/;
const auditedFilePattern = /\.(?:cjs|cts|js|jsx|md|mdx|mjs|mts|ts|tsx)$/;
const typescriptFilePattern = /\.(?:cts|mts|ts|tsx)$/;
const pluginFactoryNamePattern = /^(?:create|define).*(?:Extension|Plugin)$/;
const platePluginFactoryNamePattern = /Plugin$/;
const pliteExtensionNamePattern = /^define.*Extension$/;
const privatePluginBuilderScaffoldNamePattern =
  /(?:PluginBase|PluginDefinition|PluginDescriptor)$/;
const pluginConfigurationMethods = new Set([
  'configure',
  'extend',
  'extendPlugin',
]);
const deletedPluginBuilderMethods = new Set([
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
  'clone',
  'configure',
  'configurePlugin',
  'extend',
  'extendPlugin',
  ...deletedPluginBuilderMethods,
]);
const contextualConfigureKeys = new Set([
  'handlers',
  'initialState',
  'override',
  'render',
  'shortcuts',
]);
const plateEditorConstructionOptionIndexes = new Map([
  ['createBaseEditor', 0],
  ['createPlateEditor', 0],
  ['createSlateEditor', 0],
  ['createStaticEditor', 0],
  ['extendBaseEditor', 1],
  ['extendPlateEditor', 1],
  ['usePlateEditor', 0],
  ['usePlateViewEditor', 0],
]);
const defaultPlateEditorConstructorNames = new Map(
  [...plateEditorConstructionOptionIndexes.keys()].map((name) => [name, name])
);
const skippedDirectoryNames = new Set([
  '.next',
  '.contentlayer',
  '.source',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'public',
  'templates',
]);
export const isPlateSchemaAdoptionSourcePath = (file) =>
  auditedFilePattern.test(file) &&
  !file.split('/').some((part) => skippedDirectoryNames.has(part));
const deletedNodeBagKeys = new Set([
  'component',
  'dangerouslyAllowAttributes',
  'element',
  'isContainer',
  'isDecoration',
  'isElement',
  'isInline',
  'isLeaf',
  'isMarkableVoid',
  'isMetadataProp',
  'isSelectable',
  'isStrictSiblings',
  'isVoid',
  'mark',
  'toDataAttributes',
  'type',
]);
const deletedSymbols = new Set([
  'PluginBaseNode',
  'PluginNodeMark',
  'PluginSchemaOptions',
  'freezePlateSchemaOptions',
  'resolvePlatePluginType',
]);
const privateSchemaGroupOwners = new Set([
  'packages/core/src/internal/plugin/compilePlateModel.ts',
]);
const internalRenderNodeOwners = new Set([
  'packages/core/src/internal/plugin/resolvePlugins.ts',
  'packages/core/src/lib/plugin/createBasePlugin.ts',
  'packages/core/src/react/plugin/toPlatePlugin.ts',
]);
const intentionalRenderNodeNegativeContract =
  'packages/core/src/lib/plugin/createBasePlugin.typed.spec.ts';
const intentionalRawCodecNegativeMarker =
  '@plate-schema-adoption-negative-codec';
const intentionalRawCodecNegativeContractCounts = new Map([
  ['packages/core/src/internal/plugin/compilePlateHtmlCodec.spec.ts', 1],
  ['packages/core/src/lib/plugins/ProductCodecs.spec.ts', 1],
  ['packages/core/src/lib/plugins/html/HtmlPlugin.codec.spec.ts', 1],
  ['packages/core/type-tests/base-plugin-contracts.ts', 1],
]);
const packageConfigureInstallationOwners = new Set([
  'packages/core/src/lib/plugins/getCorePlugins.ts',
  'packages/core/src/react/editor/getPlateCorePlugins.ts',
]);
const packagePluginSourcePattern =
  /^packages\/[^/]+\/src\/.*\.(?:cjs|cts|js|jsx|mjs|mts|ts|tsx)$/;
const packageTestSourcePattern =
  /(?:^|\/)(?:__tests__|type-tests)(?:\/|$)|\.(?:slow|spec|test)\.[cm]?[jt]sx?$/;
const baseOrStaticSourcePattern =
  /(?:^|\/)(?:[^/]*-base-kit|[^/]*-static)\.[cm]?[jt]sx?$|(?:^|\/)static(?:\/|$)/;
const reactPluginEntrypointPattern = /^(?:platejs|@platejs\/[^/]+)\/react$/;
const plateModulePattern = /^(?:platejs|@platejs\/)/;
const liveRegistryNodeModulePattern = /^@\/registry\/ui\/.*-node$/;
const historicalOrGeneratedSourcePattern =
  /(?:^|\/)(?:generated|historical)(?:\/|$)|^(?:apps\/www\/public|templates)\//;
const intentionalProductionExtendStageChains = new Map([
  [
    'packages/core/src/lib/plugins/affinity/AffinityPlugin.ts',
    [[['extension']]],
  ],
  ['packages/core/src/lib/plugins/dom/DOMPlugin.ts', [[['extension']]]],
  [
    'packages/core/src/lib/plugins/override/OverridePlugin.ts',
    [[['extension']]],
  ],
  ['packages/basic-nodes/src/lib/BaseBlockPlugins.ts', [[['shortcuts']]]],
  ['packages/code-block/src/lib/BaseCodeBlockPlugin.ts', [[['shortcuts']]]],
  ['packages/comment/src/lib/BaseCommentPlugin.ts', [[['update']]]],
  [
    'packages/list/src/lib/BaseListPlugin.ts',
    [[['override', 'update'], ['extension']]],
  ],
  [
    'packages/list-classic/src/lib/BaseListPlugin.ts',
    [[['read'], ['update'], ['extension']]],
  ],
  ['packages/link/src/lib/BaseLinkPlugin.ts', [[['update'], ['extension']]]],
  [
    'packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts',
    [[['inject']]],
  ],
  ['packages/csv/src/lib/CsvPlugin.ts', [[['codecs']]]],
  ['packages/indent/src/lib/BaseIndentPlugin.ts', [[['codecs', 'shortcuts']]]],
  ['packages/layout/src/lib/BaseColumnPlugin.ts', [[['shortcuts']]]],
  ['packages/selection/src/react/BlockMenuPlugin.tsx', [[['handlers']]]],
  [
    'packages/selection/src/react/BlockSelectionPlugin.tsx',
    [[['api', 'extension'], ['inject', 'shortcuts', 'update'], ['render']]],
  ],
  [
    'packages/selection/src/react/CursorOverlayPlugin.tsx',
    [[['extension', 'handlers', 'useHooks']]],
  ],
  ['packages/tag/src/lib/BaseTagPlugin.ts', [[['read']]]],
  [
    'packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx',
    [[['inject', 'useHooks']]],
  ],
  [
    'packages/table/src/lib/BaseTablePlugin.ts',
    [
      [
        ['api'],
        ['api', 'read'],
        ['read'],
        ['read'],
        ['api', 'read'],
        ['update'],
        ['extension', 'update'],
      ],
    ],
  ],
  [
    'packages/ai/src/react/CopilotPlugin.tsx',
    [[['api'], ['extension', 'handlers', 'render', 'selectors', 'shortcuts']]],
  ],
  [
    'packages/ai/src/react/AIChatPlugin.ts',
    [[['api', 'read', 'selectors', 'update'], ['extension']]],
  ],
  [
    'packages/suggestion/src/lib/BaseSuggestionPlugin.ts',
    [[['read'], ['update'], ['extension']]],
  ],
  [
    'packages/footnote/src/lib/BaseFootnotePlugin.ts',
    [[['update'], ['update'], ['update'], ['update']]],
  ],
  ['packages/media/src/lib/BaseMediaPlugin.ts', [[[]], [[]], [[]]]],
  ['packages/media/src/lib/image/BaseImagePlugin.ts', [[[], ['extension']]]],
  ['packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts', [[[]]]],
]);
const allowedSchemaFactoryBindings = new Set([
  'initialState',
  'key',
  'own',
  'plugins',
  'targetPluginKeys',
  'type',
]);
// Raw queries are reserved for runtime discovery and contextual contract laws.
// Every owning file has an exact reviewed count so tests cannot hide new drift.
const intentionalRawSchemaQueryCounts = new Map([
  ['packages/ai/src/lib/BaseAIPlugin.spec.tsx', 6],
  ['packages/basic-styles/src/lib/BaseStylePlugins.spec.ts', 6],
  ['packages/comment/src/lib/BaseCommentPlugin.spec.ts', 5],
  ['packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts', 1],
  ['packages/core/src/lib/plugins/html/HtmlPlugin.ts', 5],
  ['packages/plite/test/editor-foundation-contract.ts', 2],
  ['packages/plite/test/schema-contract.ts', 5],
  ['packages/plite/test/schema-inference-contract.ts', 2],
  ['packages/plite/test/schema-validation-diagnostics.test.ts', 4],
  ['packages/excalidraw/src/lib/BaseExcalidrawPlugin.spec.ts', 1],
  ['packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx', 12],
  ['packages/table/src/lib/BaseTablePlugin.schema.spec.ts', 5],
]);
const intentionalExplicitSchemaFactoryCounts = new Map();
const intentionalNamedSchemaLineages = new Map([
  ['content/docs/(guides)/editor.cn.mdx', new Map([['acme-document@3', 1]])],
  ['content/docs/(guides)/editor.mdx', new Map([['acme-document@3', 1]])],
  [
    'content/docs/(plugins)/(collaboration)/yjs.cn.mdx',
    new Map([['yjs-example@1', 1]]),
  ],
  [
    'content/docs/(plugins)/(collaboration)/yjs.mdx',
    new Map([['yjs-example@1', 1]]),
  ],
  [
    'packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts',
    new Map([['plate:yjs-api-test@1', 2]]),
  ],
  ['packages/yjs/README.md', new Map([['yjs-example@1', 1]])],
]);
const requiredNamedSchemaLineageFiles = new Set([
  'content/docs/(guides)/editor.cn.mdx',
  'content/docs/(guides)/editor.mdx',
  'content/docs/(plugins)/(collaboration)/yjs.cn.mdx',
  'content/docs/(plugins)/(collaboration)/yjs.mdx',
  'packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts',
  'packages/yjs/README.md',
]);

if (
  [...intentionalRawSchemaQueryCounts.values()].reduce(
    (total, count) => total + count,
    0
  ) !== 54
) {
  throw new Error('Plate raw schema query allowlist must contain 54 calls.');
}

const toPosixPath = (path) => path.split(sep).join('/');

const getPropertyName = (node) => {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type === 'StringLiteral') return node.value;
  if (node?.type === 'NumericLiteral') return String(node.value);

  return;
};

const getStaticString = (node) => {
  if (node?.type === 'StringLiteral') return node.value;
  if (node?.type === 'NumericLiteral') return String(node.value);
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked;
  }

  return;
};

const getObjectProperty = (node, name) =>
  node?.type === 'ObjectExpression'
    ? node.properties.find(
        (property) =>
          property.type !== 'SpreadElement' &&
          getPropertyName(property.key) === name
      )
    : undefined;

const getResolvedObjectPropertyName = (
  property,
  staticStringBindings = new Map()
) => {
  if (
    property?.type !== 'ObjectProperty' &&
    property?.type !== 'ObjectMethod'
  ) {
    return;
  }
  if (!property.computed) return getPropertyName(property.key);

  const key = unwrapTypedExpression(property.key);

  return (
    getStaticString(key) ??
    (key?.type === 'Identifier'
      ? typeof staticStringBindings.getAt === 'function'
        ? staticStringBindings.getAt(key.name, property.start, property)
        : staticStringBindings.get(key.name)
      : undefined)
  );
};

const getResolvedObjectProperty = (
  node,
  name,
  staticStringBindings = new Map()
) =>
  node?.type === 'ObjectExpression'
    ? node.properties.find(
        (property) =>
          property.type !== 'SpreadElement' &&
          getResolvedObjectPropertyName(property, staticStringBindings) === name
      )
    : undefined;

const unwrapTypedExpression = (node) => {
  if (
    [
      'TSAsExpression',
      'TSNonNullExpression',
      'TSSatisfiesExpression',
      'TypeCastExpression',
    ].includes(node?.type)
  ) {
    return unwrapTypedExpression(node.expression);
  }

  return node;
};

const collectStaticStringBindings = (ast) => {
  const rootScope = {
    bindings: new Map(),
    functionOwner: undefined,
    parent: undefined,
  };

  rootScope.functionOwner = rootScope;

  const childScopeByNode = new WeakMap();
  const parentByNode = new WeakMap();
  const scopeByNode = new WeakMap();
  const isFunctionNode = (node) =>
    [
      'ArrowFunctionExpression',
      'FunctionDeclaration',
      'FunctionExpression',
      'ObjectMethod',
    ].includes(node?.type);
  const visitScopes = (node, scope, parent) => {
    if (!node || typeof node !== 'object') return;

    parentByNode.set(node, parent);
    scopeByNode.set(node, scope);

    let childScope = scope;

    if (isFunctionNode(node)) {
      childScope = {
        bindings: new Map(),
        functionOwner: undefined,
        parent: scope,
        parentFunction: scope.functionOwner,
      };
      childScope.functionOwner = childScope;
      childScopeByNode.set(node, childScope);
    } else if (node.type === 'BlockStatement' || node.type === 'CatchClause') {
      childScope = {
        bindings: new Map(),
        functionOwner: scope.functionOwner,
        parent: scope,
      };
      childScopeByNode.set(node, childScope);
    }

    for (const [key, value] of Object.entries(node)) {
      if (
        ['comments', 'errors', 'extra', 'loc', 'tokens'].includes(key) ||
        key === 'start' ||
        key === 'end'
      ) {
        continue;
      }
      if (Array.isArray(value)) {
        for (const child of value) visitScopes(child, childScope, node);
      } else if (value && typeof value === 'object' && value.type) {
        visitScopes(value, childScope, node);
      }
    }
  };

  visitScopes(ast, rootScope);

  const findBinding = (scope, name) => {
    let current = scope;

    while (current) {
      const binding = current.bindings.get(name);

      if (binding) return binding;

      current = current.parent;
    }
  };
  const isApplicableFunctionOwner = (eventOwner, useOwner) => {
    let current = useOwner;

    while (current) {
      if (current === eventOwner) return true;

      current = current.parentFunction;
    }

    return false;
  };
  const readBinding = (binding, position, useScope) =>
    binding?.stringEvents.findLast(
      (event) =>
        (event.position ?? 0) < position &&
        isApplicableFunctionOwner(event.functionOwner, useScope.functionOwner)
    )?.value;
  const readName = (name, position, node) => {
    const useScope = scopeByNode.get(node) ?? rootScope;

    return readBinding(findBinding(useScope, name), position, useScope);
  };
  const declare = (scope, name) => {
    const existing = scope.bindings.get(name);

    if (existing) return existing;

    const binding = {
      objectIdentityEvents: [],
      stringEvents: [],
      valueEvents: new Map(),
    };

    scope.bindings.set(name, binding);

    return binding;
  };
  const assign = (binding, value, position, scope, node) => {
    const resolved = unwrapTypedExpression(value);
    const staticString =
      getStaticString(resolved) ??
      (resolved?.type === 'Identifier'
        ? readName(resolved.name, position, node)
        : undefined);

    binding.stringEvents.push({
      functionOwner: scope.functionOwner,
      position,
      value: staticString,
    });
  };
  const declarePattern = (pattern, scope, position) => {
    if (!pattern) return;
    if (pattern.type === 'Identifier') {
      const binding = declare(scope, pattern.name);

      binding.stringEvents.push({
        functionOwner: scope.functionOwner,
        position,
        value: undefined,
      });

      return;
    }
    if (
      pattern.type === 'AssignmentPattern' ||
      pattern.type === 'RestElement'
    ) {
      declarePattern(pattern.left ?? pattern.argument, scope, position);

      return;
    }
    if (pattern.type === 'ObjectPattern') {
      for (const property of pattern.properties) {
        declarePattern(
          property.type === 'RestElement' ? property.argument : property.value,
          scope,
          position
        );
      }

      return;
    }
    if (pattern.type === 'ArrayPattern') {
      for (const element of pattern.elements) {
        declarePattern(element, scope, position);
      }
    }
  };

  walkAst(ast, (node) => {
    if (isFunctionNode(node)) {
      if (node.type === 'FunctionDeclaration' && node.id) {
        declarePattern(node.id, scopeByNode.get(node) ?? rootScope, node.start);
      }

      const functionScope = childScopeByNode.get(node);

      for (const parameter of node.params ?? []) {
        declarePattern(parameter, functionScope, node.start);
      }

      return;
    }
    if (
      (node.type === 'ClassDeclaration' ||
        node.type === 'ImportDefaultSpecifier' ||
        node.type === 'ImportNamespaceSpecifier' ||
        node.type === 'ImportSpecifier') &&
      (node.id ?? node.local)
    ) {
      declarePattern(
        node.id ?? node.local,
        scopeByNode.get(node) ?? rootScope,
        node.start
      );

      return;
    }
    if (node.type === 'CatchClause') {
      declarePattern(
        node.param,
        childScopeByNode.get(node),
        node.param?.start ?? node.start
      );

      return;
    }
    if (node.type === 'VariableDeclarator') {
      const declaration = parentByNode.get(node);
      let declarationScope = scopeByNode.get(node) ?? rootScope;

      if (declaration?.kind === 'var') {
        declarationScope = declarationScope.functionOwner;
      }

      declarePattern(node.id, declarationScope, node.start);

      if (node.id?.type === 'Identifier') {
        assign(
          declare(declarationScope, node.id.name),
          node.init,
          node.start,
          declarationScope,
          node
        );
      }

      return;
    }
    if (
      node.type === 'AssignmentExpression' &&
      ['=', '&&=', '??=', '||='].includes(node.operator) &&
      node.left?.type === 'Identifier'
    ) {
      const scope = scopeByNode.get(node) ?? rootScope;
      const binding =
        findBinding(scope, node.left.name) ??
        declare(rootScope, node.left.name);

      assign(binding, node.right, node.start, scope, node);
    }
  });

  return {
    bindingContext: {
      declare,
      findBinding,
      isApplicableFunctionOwner,
      rootScope,
      scopeByNode,
    },
    getAt: (name, position = Number.POSITIVE_INFINITY, node = ast) =>
      readName(name, position, node),
  };
};

const collectStaticValueBindings = (ast, staticStringBindings) => {
  const {
    declare,
    findBinding,
    isApplicableFunctionOwner,
    rootScope,
    scopeByNode,
  } = staticStringBindings.bindingContext;
  const objectPropertyEvents = new Map();
  const splitPath = (path) => {
    const [name, ...segments] = path?.split('.') ?? [];

    return { name, suffix: segments.join('.') };
  };
  const getAssignmentPath = (node) => {
    const path = getResolvedStaticExpressionPath(
      node,
      staticStringBindings,
      node?.start,
      node
    );

    if (
      path ||
      (node?.type !== 'MemberExpression' &&
        node?.type !== 'OptionalMemberExpression')
    ) {
      return path;
    }

    const objectPath = getResolvedStaticExpressionPath(
      node.object,
      staticStringBindings,
      node.start,
      node
    );

    if (!objectPath) return;

    const property = unwrapTypedExpression(node.property);
    const key = node.computed
      ? (getStaticString(property) ??
        (property?.type === 'Identifier'
          ? staticStringBindings.getAt(property.name, node.start, node)
          : undefined))
      : getPropertyName(property);

    return `${objectPath}.${key ?? 'schema'}`;
  };
  const getIdentityAt = (binding, position, useScope, inclusive = false) =>
    binding?.objectIdentityEvents.findLast(
      (event) =>
        (inclusive ? event.position <= position : event.position < position) &&
        isApplicableFunctionOwner(event.functionOwner, useScope.functionOwner)
    )?.identity;
  const addBinding = (path, value, position, node) => {
    if (!path) return;

    const { name, suffix } = splitPath(path);
    const scope = scopeByNode.get(node) ?? rootScope;
    const binding = findBinding(scope, name) ?? declare(rootScope, name);
    const events = binding.valueEvents.get(suffix) ?? [];

    events.push({
      functionOwner: scope.functionOwner,
      node,
      position,
      value,
    });
    binding.valueEvents.set(suffix, events);

    if (!suffix) {
      const sourcePath = getResolvedStaticExpressionPath(
        value,
        staticStringBindings,
        position,
        node
      );
      const { name: sourceName, suffix: sourceSuffix } = splitPath(sourcePath);
      const sourceBinding =
        sourceName && !sourceSuffix
          ? findBinding(scope, sourceName)
          : undefined;
      const identity =
        getIdentityAt(sourceBinding, position, scope, true) ?? {};

      binding.objectIdentityEvents.push({
        functionOwner: scope.functionOwner,
        identity,
        position,
      });

      return;
    }

    const identity = getIdentityAt(binding, position, scope, true);

    if (identity) {
      const properties = objectPropertyEvents.get(identity) ?? new Map();
      const propertyEvents = properties.get(suffix) ?? [];

      propertyEvents.push({
        functionOwner: scope.functionOwner,
        node,
        position,
        value,
      });
      properties.set(suffix, propertyEvents);
      objectPropertyEvents.set(identity, properties);
    }
  };
  const getEventAt = (path, position, node) => {
    const { name, suffix } = splitPath(path);
    const useScope = scopeByNode.get(node) ?? rootScope;
    const binding = findBinding(useScope, name);
    const directEvent = binding?.valueEvents
      .get(suffix)
      ?.findLast(
        (event) =>
          (event.position ?? 0) < position &&
          isApplicableFunctionOwner(event.functionOwner, useScope.functionOwner)
      );
    const identity = suffix
      ? getIdentityAt(binding, position, useScope)
      : undefined;
    const identityEvent = identity
      ? objectPropertyEvents
          .get(identity)
          ?.get(suffix)
          ?.findLast(
            (event) =>
              (event.position ?? 0) < position &&
              isApplicableFunctionOwner(
                event.functionOwner,
                useScope.functionOwner
              )
          )
      : undefined;

    return !directEvent ||
      (identityEvent?.position ?? Number.NEGATIVE_INFINITY) >
        directEvent.position
      ? identityEvent
      : directEvent;
  };
  const addContainerBindings = (
    basePath,
    value,
    position,
    node,
    seen = new Set(),
    followAliases = false
  ) => {
    const current = unwrapTypedExpression(value);

    if (current?.type === 'ConditionalExpression') {
      addContainerBindings(
        basePath,
        current.consequent,
        position,
        node,
        seen,
        followAliases
      );
      addContainerBindings(
        basePath,
        current.alternate,
        position,
        node,
        seen,
        followAliases
      );

      return;
    }
    if (current?.type === 'LogicalExpression') {
      addContainerBindings(
        basePath,
        current.left,
        position,
        node,
        seen,
        followAliases
      );
      addContainerBindings(
        basePath,
        current.right,
        position,
        node,
        seen,
        followAliases
      );

      return;
    }
    if (
      current?.type !== 'ArrayExpression' &&
      current?.type !== 'ObjectExpression'
    ) {
      if (!followAliases) return;

      const sourcePath = getResolvedStaticExpressionPath(
        current,
        staticStringBindings,
        position,
        node
      );

      if (!sourcePath || seen.has(sourcePath)) return;

      const event = getEventAt(sourcePath, position, node);

      if (!event) return;

      const nextSeen = new Set(seen);

      nextSeen.add(sourcePath);
      addContainerBindings(
        basePath,
        event.value,
        position,
        node,
        nextSeen,
        true
      );

      return;
    }
    if (current?.type === 'ArrayExpression') {
      for (const [index, element] of current.elements.entries()) {
        if (!element || element.type === 'SpreadElement') continue;

        const path = `${basePath}.${index}`;

        addBinding(path, element, position, node);
        addContainerBindings(
          path,
          element,
          position,
          node,
          seen,
          followAliases
        );
      }

      return;
    }
    if (current?.type !== 'ObjectExpression') return;

    for (const property of current.properties) {
      if (property.type === 'SpreadElement') {
        addContainerBindings(
          basePath,
          property.argument,
          position,
          node,
          seen,
          true
        );

        continue;
      }
      if (property.type !== 'ObjectProperty') continue;

      const key =
        getResolvedObjectPropertyName(property, staticStringBindings) ??
        (property.computed ? 'schema' : undefined);

      if (!key) continue;

      const path = `${basePath}.${key}`;

      addBinding(path, property.value, position, node);
      addContainerBindings(
        path,
        property.value,
        position,
        node,
        seen,
        followAliases
      );
    }
  };

  walkAst(ast, (node) => {
    if (
      isCallExpressionNode(node) &&
      (node.callee.type === 'MemberExpression' ||
        node.callee.type === 'OptionalMemberExpression') &&
      getStaticMemberName(node.callee) === 'assign' &&
      getStaticExpressionPath(node.callee.object) === 'Object'
    ) {
      const targetPath = getResolvedStaticExpressionPath(
        node.arguments[0],
        staticStringBindings,
        node.start,
        node
      );

      if (targetPath) {
        for (const source of node.arguments.slice(1)) {
          addContainerBindings(
            targetPath,
            source,
            node.start,
            node,
            new Set(),
            true
          );
        }
      }

      return;
    }
    if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier') {
      addBinding(node.id.name, node.init, node.start, node);
      addContainerBindings(node.id.name, node.init, node.start, node);

      return;
    }
    if (
      node.type === 'AssignmentExpression' &&
      ['=', '&&=', '??=', '||='].includes(node.operator) &&
      (node.left?.type === 'Identifier' ||
        node.left?.type === 'MemberExpression' ||
        node.left?.type === 'OptionalMemberExpression')
    ) {
      const path = getAssignmentPath(node.left);

      addBinding(path, node.right, node.start, node);
      addContainerBindings(path, node.right, node.start, node);
    }
  });

  return { getEventAt };
};

const getPlateEditorConstructionOptions = (
  node,
  constructorNames = defaultPlateEditorConstructorNames
) => {
  if (!isCallExpressionNode(node)) return;

  const callee = unwrapTypedExpression(node.callee);
  const constructorName =
    callee?.type === 'Identifier'
      ? constructorNames.get(callee.name, callee)
      : callee?.type === 'MemberExpression' ||
          callee?.type === 'OptionalMemberExpression'
        ? typeof constructorNames.getMember === 'function'
          ? constructorNames.getMember(callee)
          : getStaticMemberName(callee)
        : undefined;
  const optionsIndex =
    plateEditorConstructionOptionIndexes.get(constructorName);

  if (optionsIndex === undefined) return;

  const options = node.arguments[optionsIndex];

  return options?.type === 'SpreadElement' ||
    options?.type === 'ArgumentPlaceholder'
    ? undefined
    : options;
};

const getNamedSchemaLineage = (
  node,
  bindings,
  constructorNames,
  staticStringBindings,
  staticValueBindings
) => {
  const options = unwrapTypedExpression(
    getPlateEditorConstructionOptions(node, constructorNames)
  );
  const resolvedHoistedSchema = resolveStaticObjectProperty(
    options,
    'schema',
    staticValueBindings,
    staticStringBindings
  );
  const optionsPath = getResolvedStaticExpressionPath(
    options,
    staticStringBindings,
    node.start,
    node
  );
  const hoistedLineage = resolvedHoistedSchema.present
    ? resolveNamedSchemaLineage(
        resolvedHoistedSchema.value,
        bindings,
        staticStringBindings,
        staticValueBindings,
        resolvedHoistedSchema.position ?? node.start,
        resolvedHoistedSchema.useNode ?? node
      )
    : optionsPath && !resolvedHoistedSchema.resolved
      ? bindings.getAt(`${optionsPath}.schema`, node.start, node)
      : undefined;

  if (hoistedLineage) {
    return {
      id: hoistedLineage.id,
      node: options,
      version: hoistedLineage.version,
    };
  }

  const resolveOptionsObject = (object) => {
    let result = { hasSchema: false };

    for (const property of object.properties) {
      if (property.type === 'SpreadElement') {
        const spread = unwrapTypedExpression(property.argument);
        const resolvedSpreadSchema = resolveStaticObjectProperty(
          spread,
          'schema',
          staticValueBindings,
          staticStringBindings
        );
        const spreadLineage = resolvedSpreadSchema.present
          ? resolveNamedSchemaLineage(
              resolvedSpreadSchema.value,
              bindings,
              staticStringBindings,
              staticValueBindings,
              resolvedSpreadSchema.position ?? node.start,
              resolvedSpreadSchema.useNode ?? node
            )
          : undefined;
        const spreadResult =
          spread?.type === 'ObjectExpression'
            ? resolveOptionsObject(spread)
            : spread?.type === 'ConditionalExpression' ||
                spread?.type === 'LogicalExpression'
              ? resolveOptionsValue(spread)
              : resolvedSpreadSchema.present
                ? { hasSchema: true, lineage: spreadLineage, node: property }
                : { hasSchema: false };

        if (spreadResult.hasSchema) result = spreadResult;

        continue;
      }
      if (property.type !== 'ObjectProperty') continue;

      const key = getResolvedObjectPropertyName(property, staticStringBindings);
      const lineage = resolveNamedSchemaLineage(
        property.value,
        bindings,
        staticStringBindings,
        staticValueBindings,
        node.start,
        node
      );
      const isUnresolvedComputedNamedSchema =
        property.computed && !key && Boolean(lineage);

      if (key === 'schema' || isUnresolvedComputedNamedSchema) {
        result = { hasSchema: true, lineage, node: property };
      }
    }

    return result;
  };
  const resolveOptionsValue = (value) => {
    const resolved = unwrapTypedExpression(value);

    if (resolved?.type === 'ObjectExpression') {
      return resolveOptionsObject(resolved);
    }
    if (resolved?.type === 'ConditionalExpression') {
      const consequent = resolveOptionsValue(resolved.consequent);

      return consequent.lineage
        ? consequent
        : resolveOptionsValue(resolved.alternate);
    }
    if (resolved?.type === 'LogicalExpression') {
      const left = resolveOptionsValue(resolved.left);

      return left.lineage ? left : resolveOptionsValue(resolved.right);
    }
    if (
      isCallExpressionNode(resolved) &&
      (resolved.callee.type === 'MemberExpression' ||
        resolved.callee.type === 'OptionalMemberExpression') &&
      getStaticMemberName(resolved.callee) === 'assign' &&
      getStaticExpressionPath(resolved.callee.object) === 'Object'
    ) {
      let result = { hasSchema: false };

      for (const argument of resolved.arguments) {
        if (
          argument.type === 'ArgumentPlaceholder' ||
          argument.type === 'SpreadElement'
        ) {
          continue;
        }

        const resolvedSchema = resolveStaticObjectProperty(
          argument,
          'schema',
          staticValueBindings,
          staticStringBindings
        );
        const argumentResult = resolvedSchema.present
          ? {
              hasSchema: true,
              lineage: resolveNamedSchemaLineage(
                resolvedSchema.value,
                bindings,
                staticStringBindings,
                staticValueBindings,
                resolvedSchema.position ?? node.start,
                resolvedSchema.useNode ?? node
              ),
              node: argument,
            }
          : resolveOptionsValue(argument);

        if (argumentResult.hasSchema) result = argumentResult;
      }

      return result;
    }

    return { hasSchema: false };
  };
  const result = resolveOptionsValue(options);

  if (!result.lineage) return;

  return {
    id: result.lineage.id,
    node: result.node,
    version: result.lineage.version,
  };
};

const recordNamedSchemaLineage = (
  node,
  file,
  bindings,
  counts,
  constructorNames,
  staticStringBindings,
  staticValueBindings
) => {
  const lineage = getNamedSchemaLineage(
    node,
    bindings,
    constructorNames,
    staticStringBindings,
    staticValueBindings
  );

  if (!lineage) return;

  const signature = `${lineage.id ?? '<dynamic>'}@${
    lineage.version ?? '<dynamic>'
  }`;
  const count = (counts.get(signature) ?? 0) + 1;

  counts.set(signature, count);

  if (
    count <= (intentionalNamedSchemaLineages.get(file)?.get(signature) ?? 0)
  ) {
    return;
  }

  return {
    node: lineage.node,
    reason:
      'ordinary Plate editor construction must use derived schema identity; named lineage belongs in a reviewed persistence, collaboration, or migration contract',
  };
};

const walkAst = (node, callback) => {
  if (!node || typeof node !== 'object') return;

  callback(node);

  for (const [key, value] of Object.entries(node)) {
    if (
      ['comments', 'errors', 'extra', 'loc', 'tokens'].includes(key) ||
      key === 'start' ||
      key === 'end'
    ) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const child of value) walkAst(child, callback);
    } else if (value && typeof value === 'object' && value.type) {
      walkAst(value, callback);
    }
  }
};

const collectNamedSchemaLineageBindings = (
  ast,
  staticStringBindings = new Map()
) => {
  const { findBinding, isApplicableFunctionOwner, rootScope, scopeByNode } =
    staticStringBindings.bindingContext;
  const bindings = new Map();
  const candidates = new Map();
  const pathAliases = new Map();
  const objectSpreadAliases = [];
  const objectRestAliases = [];
  const arrayRestAliases = [];
  const getPathBinding = (path, node) =>
    findBinding(scopeByNode.get(node) ?? rootScope, path?.split('.')[0]);
  const getLineage = (
    path,
    node,
    position = node?.start ?? Number.POSITIVE_INFINITY
  ) => {
    const binding = getPathBinding(path, node);
    const useScope = scopeByNode.get(node) ?? rootScope;

    return binding
      ? bindings
          .get(path)
          ?.get(binding)
          ?.findLast(
            (event) =>
              (event.position ?? 0) < position &&
              isApplicableFunctionOwner(
                event.functionOwner,
                useScope.functionOwner
              )
          )?.lineage
      : undefined;
  };
  const setLineage = (path, node, lineage) => {
    const binding = getPathBinding(path, node);

    if (!path || !binding || !lineage) return false;

    const lineages = bindings.get(path) ?? new Map();
    const events = lineages.get(binding) ?? [];
    const scope = scopeByNode.get(node) ?? rootScope;
    const current = events.find(
      (event) =>
        event.position === node.start &&
        event.functionOwner === scope.functionOwner
    );

    if (
      current?.lineage.id === lineage.id &&
      current?.lineage.version === lineage.version
    ) {
      return false;
    }

    if (current) {
      current.lineage = lineage;
    } else {
      events.push({
        functionOwner: scope.functionOwner,
        lineage,
        position: node.start,
      });
    }
    lineages.set(binding, events);
    bindings.set(path, lineages);

    return true;
  };
  const reader = {
    getAt: (path, position, node) => getLineage(path, node, position),
  };
  const getAssignmentPath = (node) => {
    const path = getResolvedStaticExpressionPath(
      node,
      staticStringBindings,
      node?.start,
      node
    );

    if (
      path ||
      (node?.type !== 'MemberExpression' &&
        node?.type !== 'OptionalMemberExpression')
    ) {
      return path;
    }

    const objectPath = getResolvedStaticExpressionPath(
      node.object,
      staticStringBindings,
      node.start,
      node
    );

    if (!objectPath) return;

    const property = unwrapTypedExpression(node.property);
    const key = node.computed
      ? (getStaticString(property) ??
        (property?.type === 'Identifier'
          ? staticStringBindings.getAt(property.name, node.start, node)
          : undefined))
      : getPropertyName(property);

    return `${objectPath}.${key ?? 'schema'}`;
  };
  const addCandidate = (path, value, node) => {
    const values = candidates.get(path) ?? [];

    values.push({ node, value });
    candidates.set(path, values);
  };
  const addPathAlias = (aliasPath, sourcePath, node) => {
    if (
      !aliasPath ||
      !sourcePath ||
      aliasPath === sourcePath ||
      aliasPath.startsWith(`${sourcePath}.`) ||
      sourcePath.startsWith(`${aliasPath}.`)
    ) {
      return;
    }

    const paths = pathAliases.get(aliasPath) ?? [];

    paths.push({ node, sourcePath });
    pathAliases.set(aliasPath, paths);
  };
  const addContainerCandidates = (basePath, value, node) => {
    const current = unwrapTypedExpression(value);

    if (current?.type === 'ConditionalExpression') {
      addContainerCandidates(basePath, current.consequent, node);
      addContainerCandidates(basePath, current.alternate, node);

      return;
    }
    if (current?.type === 'LogicalExpression') {
      addContainerCandidates(basePath, current.left, node);
      addContainerCandidates(basePath, current.right, node);

      return;
    }
    if (current?.type === 'ArrayExpression') {
      for (const [index, element] of current.elements.entries()) {
        if (!element || element.type === 'SpreadElement') continue;

        const path = `${basePath}.${index}`;

        addCandidate(path, element, node);
        addContainerCandidates(path, element, node);
      }

      return;
    }
    if (current?.type !== 'ObjectExpression') return;

    for (const [index, property] of current.properties.entries()) {
      if (property.type === 'SpreadElement') {
        const overrides = new Map(
          current.properties
            .slice(index + 1)
            .filter((candidate) => candidate.type === 'ObjectProperty')
            .map((candidate) => [
              getResolvedObjectPropertyName(candidate, staticStringBindings),
              candidate.value,
            ])
            .filter(([key]) => Boolean(key))
        );

        objectSpreadAliases.push({
          aliasPath: basePath,
          excludedKeys: new Set(overrides.keys()),
          node,
          overrides,
          sourcePath: getStaticExpressionPath(property.argument),
        });

        continue;
      }
      if (property.type !== 'ObjectProperty') continue;

      const key = getResolvedObjectPropertyName(property, staticStringBindings);

      if (property.computed && !key) {
        addCandidate(`${basePath}.schema`, property.value, node);
      }
      if (!key) continue;

      const path = `${basePath}.${key}`;

      addCandidate(path, property.value, node);
      addContainerCandidates(path, property.value, node);
    }
  };
  const addPatternPathAliases = (pattern, basePath, node = pattern) => {
    if (!pattern || !basePath) return;

    if (pattern.type === 'Identifier') {
      addPathAlias(pattern.name, basePath, node);

      return;
    }
    if (pattern.type === 'AssignmentPattern') {
      addPatternPathAliases(pattern.left, basePath, node);

      return;
    }
    if (pattern.type === 'ObjectPattern') {
      const excludedKeys = new Set(
        pattern.properties
          .filter((property) => property.type === 'ObjectProperty')
          .map((property) =>
            getResolvedObjectPropertyName(property, staticStringBindings)
          )
          .filter(Boolean)
      );

      for (const property of pattern.properties) {
        if (property.type === 'RestElement') {
          if (property.argument.type === 'Identifier') {
            objectRestAliases.push({
              aliasPath: property.argument.name,
              excludedKeys,
              node: property.argument,
              sourcePath: basePath,
            });
          }

          continue;
        }
        if (property.type !== 'ObjectProperty') continue;

        const key = getResolvedObjectPropertyName(
          property,
          staticStringBindings
        );

        if (key) {
          addPatternPathAliases(
            property.value,
            `${basePath}.${key}`,
            property.value
          );
        }
      }

      return;
    }
    if (pattern.type !== 'ArrayPattern') return;

    for (const [index, element] of pattern.elements.entries()) {
      if (!element) continue;
      if (
        element.type === 'RestElement' &&
        element.argument.type === 'Identifier'
      ) {
        arrayRestAliases.push({
          aliasPath: element.argument.name,
          node: element.argument,
          offset: index,
          sourcePath: basePath,
        });

        continue;
      }

      addPatternPathAliases(element, `${basePath}.${index}`, element);
    }
  };

  walkAst(ast, (node) => {
    if (
      isCallExpressionNode(node) &&
      (node.callee.type === 'MemberExpression' ||
        node.callee.type === 'OptionalMemberExpression') &&
      getStaticMemberName(node.callee) === 'assign' &&
      getStaticExpressionPath(node.callee.object) === 'Object'
    ) {
      const targetPath = getResolvedStaticExpressionPath(
        node.arguments[0],
        staticStringBindings,
        node.start,
        node
      );

      if (targetPath) {
        for (const source of node.arguments.slice(1)) {
          addContainerCandidates(targetPath, source, node);
        }
      }

      return;
    }
    if (node.type === 'VariableDeclarator') {
      if (node.id?.type === 'Identifier') {
        addCandidate(node.id.name, node.init, node);
        addPathAlias(node.id.name, getStaticExpressionPath(node.init), node);
        addContainerCandidates(node.id.name, node.init, node);
      } else {
        addPatternPathAliases(node.id, getStaticExpressionPath(node.init));
      }

      return;
    }
    if (
      node.type === 'AssignmentExpression' &&
      ['=', '&&=', '??=', '||='].includes(node.operator) &&
      node.left
    ) {
      if (
        node.left.type === 'Identifier' ||
        node.left.type === 'MemberExpression' ||
        node.left.type === 'OptionalMemberExpression'
      ) {
        const path = getAssignmentPath(node.left);

        if (!path) return;

        addCandidate(path, node.right, node);
        addPathAlias(path, getStaticExpressionPath(node.right), node);
        addContainerCandidates(path, node.right, node);
      } else {
        addPatternPathAliases(node.left, getStaticExpressionPath(node.right));
      }
    }
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const [path, values] of candidates) {
      for (const { node, value } of values) {
        const lineage = resolveNamedSchemaLineage(
          unwrapTypedExpression(value),
          reader,
          staticStringBindings,
          undefined,
          node.start,
          node
        );

        if (setLineage(path, node, lineage)) changed = true;
      }
    }

    for (const [aliasPath, sources] of pathAliases) {
      for (const { node, sourcePath } of sources) {
        for (const bindingPath of [...bindings.keys()]) {
          if (
            bindingPath !== sourcePath &&
            !bindingPath.startsWith(`${sourcePath}.`)
          ) {
            continue;
          }

          const lineage = getLineage(bindingPath, node);

          if (!lineage) continue;

          const aliasBinding = `${aliasPath}${bindingPath.slice(
            sourcePath.length
          )}`;

          if (setLineage(aliasBinding, node, lineage)) changed = true;
        }
      }
    }

    for (const {
      aliasPath,
      excludedKeys,
      node,
      overrides,
      sourcePath,
    } of objectSpreadAliases) {
      if (!sourcePath) continue;

      for (const bindingPath of [...bindings.keys()]) {
        const lineage = getLineage(bindingPath, node);

        if (!lineage) continue;

        if (bindingPath === sourcePath) {
          const idOverride = unwrapTypedExpression(overrides.get('id'));
          const versionOverride = unwrapTypedExpression(
            overrides.get('version')
          );

          if (
            (idOverride && idOverride.type !== 'StringLiteral') ||
            (versionOverride && versionOverride.type !== 'NumericLiteral')
          ) {
            continue;
          }

          const spreadLineage = {
            id:
              idOverride?.type === 'StringLiteral'
                ? idOverride.value
                : lineage.id,
            version:
              versionOverride?.type === 'NumericLiteral'
                ? versionOverride.value
                : lineage.version,
          };

          if (setLineage(aliasPath, node, spreadLineage)) changed = true;

          continue;
        }
        if (!bindingPath.startsWith(`${sourcePath}.`)) continue;

        const suffix = bindingPath.slice(sourcePath.length + 1);
        const [key] = suffix.split('.');

        if (excludedKeys.has(key)) continue;

        const aliasBinding = `${aliasPath}.${suffix}`;

        if (setLineage(aliasBinding, node, lineage)) changed = true;
      }
    }

    for (const {
      aliasPath,
      excludedKeys,
      node,
      sourcePath,
    } of objectRestAliases) {
      for (const bindingPath of [...bindings.keys()]) {
        const lineage = getLineage(bindingPath, node);

        if (!lineage) continue;

        if (bindingPath === sourcePath) {
          if (
            !excludedKeys.has('id') &&
            !excludedKeys.has('version') &&
            setLineage(aliasPath, node, lineage)
          ) {
            changed = true;
          }

          continue;
        }
        if (!bindingPath.startsWith(`${sourcePath}.`)) continue;

        const suffix = bindingPath.slice(sourcePath.length + 1);
        const [key] = suffix.split('.');

        if (excludedKeys.has(key)) continue;

        const aliasBinding = `${aliasPath}.${suffix}`;

        if (setLineage(aliasBinding, node, lineage)) changed = true;
      }
    }

    for (const { aliasPath, node, offset, sourcePath } of arrayRestAliases) {
      for (const bindingPath of [...bindings.keys()]) {
        if (!bindingPath.startsWith(`${sourcePath}.`)) continue;

        const lineage = getLineage(bindingPath, node);

        if (!lineage) continue;

        const [index, ...suffix] = bindingPath
          .slice(sourcePath.length + 1)
          .split('.');
        const numericIndex = Number(index);

        if (!Number.isInteger(numericIndex) || numericIndex < offset) continue;

        const aliasBinding = [
          aliasPath,
          String(numericIndex - offset),
          ...suffix,
        ].join('.');

        if (setLineage(aliasBinding, node, lineage)) changed = true;
      }
    }
  }

  return reader;
};

const parsePlateSource = (source, file, { errorRecovery = false } = {}) => {
  const plugins = [
    'decorators-legacy',
    'explicitResourceManagement',
    'importAttributes',
  ];

  if (!typescriptFilePattern.test(file) || file.endsWith('x')) {
    plugins.push('jsx');
  }
  if (typescriptFilePattern.test(file) || markdownFilePattern.test(file)) {
    plugins.push('typescript');
  }

  return parse(source, {
    allowAwaitOutsideFunction: true,
    allowReturnOutsideFunction: true,
    errorRecovery,
    plugins,
    sourceType: 'unambiguous',
  });
};

const isFunction = (node) =>
  node?.type === 'ArrowFunctionExpression' ||
  node?.type === 'FunctionExpression' ||
  node?.type === 'ObjectMethod';

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

      returnCount++;
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

const getStaticExtensionProperties = (contribution) => {
  const value = unwrapTypedExpression(contribution);

  if (value?.type === 'ObjectExpression') return value.properties;
  if (isFunction(value)) return inspectContextualConfigure(value).properties;

  return [];
};

const defaultPluginCreatorNames = new Set([
  'createBasePlugin',
  'createPlatePlugin',
]);
const isCallExpressionNode = (node) =>
  node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression';

const getPluginCreatorCallKind = (node, pluginCreatorNames) => {
  if (!isCallExpressionNode(node)) return;

  const callee = unwrapTypedExpression(node.callee);

  if (callee?.type === 'Identifier') {
    return (
      pluginCreatorNames.get?.(callee.name) ??
      (pluginCreatorNames.has(callee.name) ? callee.name : undefined)
    );
  }
  if (
    callee?.type === 'MemberExpression' ||
    callee?.type === 'OptionalMemberExpression'
  ) {
    const name = getStaticMemberName(callee);

    return defaultPluginCreatorNames.has(name) ? name : undefined;
  }
};

const isDirectCreatorExtendChain = (
  node,
  pluginCreatorNames = defaultPluginCreatorNames
) => {
  let current = unwrapTypedExpression(node);

  while (isCallExpressionNode(current)) {
    if (getPluginCreatorCallKind(current, pluginCreatorNames)) return true;

    const callee = unwrapTypedExpression(current.callee);

    if (callee?.type !== 'MemberExpression') return false;

    current = unwrapTypedExpression(callee.object);
  }

  return false;
};

const getStaticExpressionPath = (node) => {
  const current = unwrapTypedExpression(node);

  if (current?.type === 'Identifier') return current.name;
  if (
    current?.type !== 'MemberExpression' &&
    current?.type !== 'OptionalMemberExpression'
  ) {
    return;
  }

  const objectPath = getStaticExpressionPath(current.object);
  const property = getStaticMemberName(current);

  return objectPath && property ? `${objectPath}.${property}` : undefined;
};

const getResolvedStaticExpressionPath = (
  node,
  staticStringBindings,
  position = node?.start ?? Number.POSITIVE_INFINITY,
  useNode = node
) => {
  const current = unwrapTypedExpression(node);

  if (current?.type === 'Identifier') return current.name;
  if (
    current?.type !== 'MemberExpression' &&
    current?.type !== 'OptionalMemberExpression'
  ) {
    return;
  }

  const objectPath = getResolvedStaticExpressionPath(
    current.object,
    staticStringBindings,
    position,
    useNode
  );
  const property = unwrapTypedExpression(current.property);
  const key = current.computed
    ? (getStaticString(property) ??
      (property?.type === 'Identifier'
        ? staticStringBindings.getAt(property.name, position, useNode)
        : undefined))
    : getPropertyName(property);

  return objectPath && key ? `${objectPath}.${key}` : undefined;
};

const resolveStaticObjectProperty = (
  node,
  propertyName,
  valueBindings,
  staticStringBindings,
  seen = new Set(),
  position = node?.start ?? Number.POSITIVE_INFINITY,
  useNode = node
) => {
  const value = unwrapTypedExpression(node);

  if (value?.type !== 'ObjectExpression') {
    const path = getResolvedStaticExpressionPath(
      value,
      staticStringBindings,
      position,
      useNode
    );

    if (!path || seen.has(path)) return { present: false, resolved: false };

    const propertyCandidate = valueBindings.getEventAt(
      `${path}.${propertyName}`,
      position,
      useNode
    );
    const candidate = valueBindings.getEventAt(path, position, useNode);
    const propertyFollowsCandidate =
      propertyCandidate &&
      (!candidate || propertyCandidate.position > candidate.position);

    if (propertyFollowsCandidate) {
      return {
        node: propertyCandidate.node,
        position: propertyCandidate.position,
        present: true,
        resolved: true,
        useNode: propertyCandidate.node,
        value: propertyCandidate.value,
      };
    }
    if (!candidate) {
      return propertyCandidate
        ? {
            node: propertyCandidate.node,
            position: propertyCandidate.position,
            present: true,
            resolved: true,
            useNode: propertyCandidate.node,
            value: propertyCandidate.value,
          }
        : { present: false, resolved: false };
    }

    const nextSeen = new Set(seen);

    nextSeen.add(path);

    const result = resolveStaticObjectProperty(
      candidate.value,
      propertyName,
      valueBindings,
      staticStringBindings,
      nextSeen,
      candidate.position,
      candidate.node
    );

    return { ...result, resolved: true };
  }

  let result = { present: false, resolved: true };

  for (const property of value.properties) {
    if (property.type === 'SpreadElement') {
      const spreadResult = resolveStaticObjectProperty(
        property.argument,
        propertyName,
        valueBindings,
        staticStringBindings,
        seen,
        position,
        useNode
      );

      if (spreadResult.present) result = spreadResult;

      continue;
    }
    if (
      property.type === 'ObjectProperty' &&
      (getResolvedObjectPropertyName(property, staticStringBindings) ===
        propertyName ||
        (propertyName === 'schema' &&
          property.computed &&
          !getResolvedObjectPropertyName(property, staticStringBindings)))
    ) {
      result = {
        node: property,
        position,
        present: true,
        resolved: true,
        useNode,
        value: property.value,
      };
    }
  }

  return result;
};

const resolveNamedSchemaLineage = (
  node,
  bindings,
  staticStringBindings,
  staticValueBindings,
  position = node?.start ?? Number.POSITIVE_INFINITY,
  useNode = node,
  seen = new Set()
) => {
  const value = unwrapTypedExpression(node);

  if (value?.type === 'ConditionalExpression') {
    return (
      resolveNamedSchemaLineage(
        value.consequent,
        bindings,
        staticStringBindings,
        staticValueBindings,
        position,
        useNode,
        seen
      ) ??
      resolveNamedSchemaLineage(
        value.alternate,
        bindings,
        staticStringBindings,
        staticValueBindings,
        position,
        useNode,
        seen
      )
    );
  }
  if (value?.type === 'LogicalExpression') {
    return (
      resolveNamedSchemaLineage(
        value.left,
        bindings,
        staticStringBindings,
        staticValueBindings,
        position,
        useNode,
        seen
      ) ??
      resolveNamedSchemaLineage(
        value.right,
        bindings,
        staticStringBindings,
        staticValueBindings,
        position,
        useNode,
        seen
      )
    );
  }
  if (value?.type !== 'ObjectExpression') {
    const path = getResolvedStaticExpressionPath(
      value,
      staticStringBindings,
      position,
      useNode
    );

    if (path && staticValueBindings?.getEventAt && !seen.has(path)) {
      const event = staticValueBindings.getEventAt(path, position, useNode);

      if (event) {
        const nextSeen = new Set(seen);

        nextSeen.add(path);

        return resolveNamedSchemaLineage(
          event.value,
          bindings,
          staticStringBindings,
          staticValueBindings,
          event.position,
          event.node,
          nextSeen
        );
      }
    }

    return typeof bindings.getAt === 'function'
      ? bindings.getAt(path, position, useNode)
      : bindings.get(path);
  }

  let id;
  let version;

  for (const property of value.properties) {
    if (property.type === 'SpreadElement') {
      const spreadLineage = resolveNamedSchemaLineage(
        property.argument,
        bindings,
        staticStringBindings,
        staticValueBindings,
        position,
        useNode,
        seen
      );

      if (spreadLineage) {
        id = spreadLineage.id;
        version = spreadLineage.version;
      }

      continue;
    }
    if (property.type !== 'ObjectProperty') continue;

    const key = getResolvedObjectPropertyName(property, staticStringBindings);
    const propertyValue = unwrapTypedExpression(property.value);

    if (key === 'id') {
      id =
        propertyValue?.type === 'StringLiteral'
          ? propertyValue.value
          : undefined;
    }
    if (key === 'version') {
      version =
        propertyValue?.type === 'NumericLiteral'
          ? propertyValue.value
          : undefined;
    }
  }

  return typeof id === 'string' && typeof version === 'number'
    ? { id, version }
    : undefined;
};

const getPluginBuilderRootPath = (node) => {
  let current = unwrapTypedExpression(node);

  while (isCallExpressionNode(current)) {
    const callee = unwrapTypedExpression(current.callee);

    if (
      callee?.type !== 'MemberExpression' &&
      callee?.type !== 'OptionalMemberExpression'
    ) {
      return;
    }

    current = unwrapTypedExpression(callee.object);
  }

  return getStaticExpressionPath(current);
};

const collectLocalPluginCreatorNames = (ast) => {
  const names = new Map(
    [...defaultPluginCreatorNames].map((name) => [name, name])
  );
  const candidates = new Map();
  const addCandidate = (name, value) => {
    const values = candidates.get(name) ?? [];

    values.push(value);
    candidates.set(name, values);
  };
  const collectDestructuredCreatorAliases = (pattern) => {
    if (pattern?.type !== 'ObjectPattern') return;

    for (const property of pattern.properties) {
      if (
        property.type !== 'ObjectProperty' ||
        !defaultPluginCreatorNames.has(getPropertyName(property.key))
      ) {
        continue;
      }

      const value = unwrapTypedExpression(property.value);
      const kind = getPropertyName(property.key);

      if (value?.type === 'Identifier') names.set(value.name, kind);
      if (
        value?.type === 'AssignmentPattern' &&
        value.left?.type === 'Identifier'
      ) {
        names.set(value.left.name, kind);
      }
    }
  };

  walkAst(ast, (node) => {
    if (node.type === 'ImportSpecifier') {
      const importedName = getPropertyName(node.imported);

      if (
        importedName &&
        defaultPluginCreatorNames.has(importedName) &&
        node.local?.type === 'Identifier'
      ) {
        names.set(node.local.name, importedName);
      }

      return;
    }
    if (node.type === 'VariableDeclarator') {
      if (node.id?.type === 'Identifier') {
        addCandidate(node.id.name, node.init);
      } else {
        collectDestructuredCreatorAliases(node.id);
      }

      return;
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=') {
      if (node.left?.type === 'Identifier') {
        addCandidate(node.left.name, node.right);
      } else {
        collectDestructuredCreatorAliases(node.left);
      }
    }
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const [name, values] of candidates) {
      if (names.has(name)) continue;

      let creatorKind;

      for (const value of values) {
        const resolved = unwrapTypedExpression(value);
        const kind =
          resolved?.type === 'Identifier'
            ? names.get(resolved.name)
            : resolved?.type === 'MemberExpression' ||
                resolved?.type === 'OptionalMemberExpression'
              ? getStaticMemberName(resolved)
              : undefined;

        if (kind && defaultPluginCreatorNames.has(kind)) {
          creatorKind = kind;
          break;
        }
      }

      if (!creatorKind) continue;

      names.set(name, creatorKind);
      changed = true;
    }
  }

  return names;
};

const collectLocalPlateEditorConstructorNames = (ast, staticStringBindings) => {
  const { findBinding, isApplicableFunctionOwner, rootScope, scopeByNode } =
    staticStringBindings.bindingContext;
  const constructorEvents = new Map();
  const namespaceEvents = new Map();
  const candidates = [];
  const destructuredCandidates = [];
  const getScope = (node) => scopeByNode.get(node) ?? rootScope;
  const getBinding = (name, node) => findBinding(getScope(node), name);
  const addEvent = (events, binding, node, value) => {
    if (!binding) return;

    const bindingEvents = events.get(binding) ?? [];
    const event = {
      functionOwner: getScope(node).functionOwner,
      position: node.start,
      value,
    };

    bindingEvents.push(event);
    events.set(binding, bindingEvents);

    return event;
  };
  const readEvent = (events, binding, position, node) => {
    const useScope = getScope(node);

    return events
      .get(binding)
      ?.findLast(
        (event) =>
          (event.position ?? 0) < position &&
          isApplicableFunctionOwner(event.functionOwner, useScope.functionOwner)
      )?.value;
  };
  const get = (
    name,
    node,
    position = node?.start ?? Number.POSITIVE_INFINITY
  ) => {
    const binding = getBinding(name, node);

    return binding
      ? readEvent(constructorEvents, binding, position, node)
      : defaultPlateEditorConstructorNames.get(name);
  };
  const isNamespace = (
    value,
    node,
    position = node?.start ?? Number.POSITIVE_INFINITY
  ) => {
    const resolved = unwrapTypedExpression(value);

    if (resolved?.type !== 'Identifier') return false;

    const binding = getBinding(resolved.name, node);

    return binding
      ? Boolean(readEvent(namespaceEvents, binding, position, node))
      : resolved.name === 'Plate';
  };
  const getMember = (
    member,
    node = member,
    position = node?.start ?? Number.POSITIVE_INFINITY
  ) => {
    const constructorName = getStaticMemberName(member);

    return constructorName &&
      defaultPlateEditorConstructorNames.has(constructorName) &&
      isNamespace(member.object, node, position)
      ? constructorName
      : undefined;
  };
  const resolveCandidate = (value, node) => {
    const resolved = unwrapTypedExpression(value);

    return resolved?.type === 'Identifier'
      ? get(resolved.name, node)
      : resolved?.type === 'MemberExpression' ||
          resolved?.type === 'OptionalMemberExpression'
        ? getMember(resolved, node)
        : undefined;
  };
  const addCandidate = (name, value, node) => {
    const binding = getBinding(name, node);

    candidates.push({
      event: addEvent(constructorEvents, binding, node, undefined),
      namespaceEvent: addEvent(namespaceEvents, binding, node, undefined),
      node,
      value,
    });
  };
  const addDestructuredCandidates = (pattern, source, node) => {
    if (pattern?.type !== 'ObjectPattern') return;

    for (const property of pattern.properties) {
      if (property.type !== 'ObjectProperty') continue;

      const constructorName = getPropertyName(property.key);
      const value = unwrapTypedExpression(property.value);
      const identifier =
        value?.type === 'Identifier'
          ? value
          : value?.type === 'AssignmentPattern' &&
              value.left?.type === 'Identifier'
            ? value.left
            : undefined;

      if (
        identifier &&
        constructorName &&
        defaultPlateEditorConstructorNames.has(constructorName)
      ) {
        destructuredCandidates.push({
          constructorName,
          event: addEvent(
            constructorEvents,
            getBinding(identifier.name, identifier),
            identifier,
            undefined
          ),
          node,
          source,
        });
      }
    }
  };

  walkAst(ast, (node) => {
    if (node.type === 'ImportDeclaration') {
      const isPlateModule = plateModulePattern.test(node.source.value);

      for (const specifier of node.specifiers) {
        const binding = getBinding(specifier.local?.name, specifier);

        if (specifier.type === 'ImportNamespaceSpecifier' && isPlateModule) {
          addEvent(namespaceEvents, binding, specifier, true);
        } else if (specifier.type === 'ImportSpecifier' && isPlateModule) {
          const constructorName = getPropertyName(specifier.imported);

          if (
            constructorName &&
            defaultPlateEditorConstructorNames.has(constructorName)
          ) {
            addEvent(constructorEvents, binding, specifier, constructorName);
          }
        }
      }

      return;
    }
    if (node.type === 'VariableDeclarator') {
      if (node.id?.type === 'Identifier') {
        addCandidate(node.id.name, node.init, node);
      } else {
        addDestructuredCandidates(node.id, node.init, node);
      }

      return;
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=') {
      if (node.left?.type === 'Identifier') {
        addCandidate(node.left.name, node.right, node);
      } else {
        addDestructuredCandidates(node.left, node.right, node);
      }
    }
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const candidate of candidates) {
      const constructorName = resolveCandidate(candidate.value, candidate.node);

      if (candidate.event?.value !== constructorName) {
        candidate.event.value = constructorName;
        changed = true;
      }

      const namespace = isNamespace(candidate.value, candidate.node);

      if (candidate.namespaceEvent?.value !== namespace) {
        candidate.namespaceEvent.value = namespace;
        changed = true;
      }
    }

    for (const candidate of destructuredCandidates) {
      const constructorName = isNamespace(candidate.source, candidate.node)
        ? candidate.constructorName
        : undefined;

      if (candidate.event?.value !== constructorName) {
        candidate.event.value = constructorName;
        changed = true;
      }
    }
  }

  return { get, getMember };
};

const collectLocalPluginDescriptorBindings = (
  ast,
  pluginCreatorNames,
  staticStringBindings = new Map()
) => {
  const { findBinding, rootScope, scopeByNode } =
    staticStringBindings.bindingContext;
  const declarations = new Map();
  const pathAliases = new Map();
  const objectSpreadAliases = [];
  const objectRestAliases = [];
  const arrayRestAliases = [];
  const descriptorBindings = new Map();
  const getPathBinding = (path, node) =>
    findBinding(scopeByNode.get(node) ?? rootScope, path?.split('.')[0]);
  const hasDescriptorBinding = (path, node) => {
    const binding = getPathBinding(path, node);

    return binding && descriptorBindings.get(path)?.has(binding);
  };
  const markDescriptorBinding = (path, node) => {
    const binding = getPathBinding(path, node);

    if (!path || !binding) return false;

    const bindings = descriptorBindings.get(path) ?? new Set();
    const size = bindings.size;

    bindings.add(binding);
    descriptorBindings.set(path, bindings);

    return bindings.size !== size;
  };
  const addDeclaration = (name, init, node) => {
    const candidates = declarations.get(name) ?? [];

    candidates.push({ init, node });
    declarations.set(name, candidates);
  };
  const addPathAlias = (name, sourcePath, node) => {
    if (
      !name ||
      !sourcePath ||
      name === sourcePath ||
      name.startsWith(`${sourcePath}.`) ||
      sourcePath.startsWith(`${name}.`)
    ) {
      return;
    }

    const paths = pathAliases.get(name) ?? [];

    paths.push({ node, sourcePath });
    pathAliases.set(name, paths);
  };
  const addContainerDeclarations = (basePath, value, node) => {
    const current = unwrapTypedExpression(value);

    if (current?.type === 'ConditionalExpression') {
      addContainerDeclarations(basePath, current.consequent, node);
      addContainerDeclarations(basePath, current.alternate, node);

      return;
    }
    if (current?.type === 'LogicalExpression') {
      addContainerDeclarations(basePath, current.left, node);
      addContainerDeclarations(basePath, current.right, node);

      return;
    }
    if (current?.type === 'ArrayExpression') {
      for (const [index, element] of current.elements.entries()) {
        if (!element || element.type === 'SpreadElement') continue;

        const path = `${basePath}.${index}`;

        addDeclaration(path, element, node);
        addContainerDeclarations(path, element, node);
      }

      return;
    }
    if (current?.type !== 'ObjectExpression') return;

    for (const [index, property] of current.properties.entries()) {
      if (property.type === 'SpreadElement') {
        objectSpreadAliases.push({
          aliasPath: basePath,
          excludedKeys: new Set(
            current.properties
              .slice(index + 1)
              .filter((candidate) => candidate.type === 'ObjectProperty')
              .map((candidate) =>
                getResolvedObjectPropertyName(candidate, staticStringBindings)
              )
              .filter(Boolean)
          ),
          node,
          sourcePath: getStaticExpressionPath(property.argument),
        });

        continue;
      }
      if (property.type !== 'ObjectProperty') continue;

      const key = getResolvedObjectPropertyName(property, staticStringBindings);

      if (!key) continue;

      const path = `${basePath}.${key}`;

      addDeclaration(path, property.value, node);
      addContainerDeclarations(path, property.value, node);
    }
  };
  const addPatternPathAliases = (pattern, basePath, node = pattern) => {
    if (!pattern || !basePath) return;

    if (pattern.type === 'Identifier') {
      addPathAlias(pattern.name, basePath, node);

      return;
    }
    if (pattern.type === 'AssignmentPattern') {
      addPatternPathAliases(pattern.left, basePath, node);

      return;
    }
    if (pattern.type === 'ObjectPattern') {
      const excludedKeys = new Set(
        pattern.properties
          .filter((property) => property.type === 'ObjectProperty')
          .map((property) =>
            getResolvedObjectPropertyName(property, staticStringBindings)
          )
          .filter(Boolean)
      );

      for (const property of pattern.properties) {
        if (property.type === 'RestElement') {
          if (property.argument.type === 'Identifier') {
            objectRestAliases.push({
              aliasPath: property.argument.name,
              excludedKeys,
              node: property.argument,
              sourcePath: basePath,
            });
          }

          continue;
        }
        if (property.type !== 'ObjectProperty') continue;

        const key = getResolvedObjectPropertyName(
          property,
          staticStringBindings
        );

        if (key) {
          addPatternPathAliases(
            property.value,
            `${basePath}.${key}`,
            property.value
          );
        }
      }

      return;
    }
    if (pattern.type !== 'ArrayPattern') return;

    for (const [index, element] of pattern.elements.entries()) {
      if (!element) continue;
      if (
        element.type === 'RestElement' &&
        element.argument.type === 'Identifier'
      ) {
        arrayRestAliases.push({
          aliasPath: element.argument.name,
          node: element.argument,
          offset: index,
          sourcePath: basePath,
        });

        continue;
      }

      addPatternPathAliases(element, `${basePath}.${index}`, element);
    }
  };
  const addDestructuredPathAliases = (pattern, value) => {
    addPatternPathAliases(pattern, getStaticExpressionPath(value), pattern);
  };

  walkAst(ast, (node) => {
    if (node.type === 'VariableDeclarator') {
      if (node.id?.type === 'Identifier') {
        addDeclaration(node.id.name, node.init, node);
        addPathAlias(node.id.name, getStaticExpressionPath(node.init), node);
        addContainerDeclarations(node.id.name, node.init, node);
      } else {
        addDestructuredPathAliases(node.id, node.init);
      }

      return;
    }

    if (
      node.type === 'AssignmentExpression' &&
      node.operator === '=' &&
      node.left
    ) {
      if (
        node.left.type === 'Identifier' ||
        node.left.type === 'MemberExpression' ||
        node.left.type === 'OptionalMemberExpression'
      ) {
        const path = getResolvedStaticExpressionPath(
          node.left,
          staticStringBindings,
          node.start,
          node
        );

        if (!path) return;

        addDeclaration(path, node.right, node);
        addPathAlias(path, getStaticExpressionPath(node.right), node);
        addContainerDeclarations(path, node.right, node);
      } else {
        addDestructuredPathAliases(node.left, node.right);
      }
    }
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const [path, candidates] of declarations) {
      for (const { init, node } of candidates) {
        if (
          (isDirectCreatorExtendChain(init, pluginCreatorNames) ||
            hasDescriptorBinding(getPluginBuilderRootPath(init), node)) &&
          markDescriptorBinding(path, node)
        ) {
          changed = true;
        }
      }
    }

    for (const [aliasPath, sources] of pathAliases) {
      for (const { node, sourcePath } of sources) {
        for (const descriptorPath of [...descriptorBindings.keys()]) {
          if (
            descriptorPath !== sourcePath &&
            !descriptorPath.startsWith(`${sourcePath}.`)
          ) {
            continue;
          }
          if (!hasDescriptorBinding(descriptorPath, node)) continue;

          const aliasBinding = `${aliasPath}${descriptorPath.slice(
            sourcePath.length
          )}`;

          if (markDescriptorBinding(aliasBinding, node)) {
            changed = true;
          }
        }
      }
    }

    for (const {
      aliasPath,
      excludedKeys,
      node,
      sourcePath,
    } of objectSpreadAliases) {
      if (!sourcePath) continue;

      for (const descriptorPath of [...descriptorBindings.keys()]) {
        if (!descriptorPath.startsWith(`${sourcePath}.`)) continue;
        if (!hasDescriptorBinding(descriptorPath, node)) continue;

        const suffix = descriptorPath.slice(sourcePath.length + 1);
        const [key] = suffix.split('.');

        if (excludedKeys.has(key)) continue;

        const aliasBinding = `${aliasPath}.${suffix}`;

        if (markDescriptorBinding(aliasBinding, node)) {
          changed = true;
        }
      }
    }

    for (const {
      aliasPath,
      excludedKeys,
      node,
      sourcePath,
    } of objectRestAliases) {
      for (const descriptorPath of [...descriptorBindings.keys()]) {
        if (!descriptorPath.startsWith(`${sourcePath}.`)) continue;
        if (!hasDescriptorBinding(descriptorPath, node)) continue;

        const suffix = descriptorPath.slice(sourcePath.length + 1);
        const [key] = suffix.split('.');

        if (excludedKeys.has(key)) continue;

        const aliasBinding = `${aliasPath}.${suffix}`;

        if (markDescriptorBinding(aliasBinding, node)) {
          changed = true;
        }
      }
    }

    for (const { aliasPath, node, offset, sourcePath } of arrayRestAliases) {
      for (const descriptorPath of [...descriptorBindings.keys()]) {
        if (!descriptorPath.startsWith(`${sourcePath}.`)) continue;
        if (!hasDescriptorBinding(descriptorPath, node)) continue;

        const [index, ...suffix] = descriptorPath
          .slice(sourcePath.length + 1)
          .split('.');
        const numericIndex = Number(index);

        if (!Number.isInteger(numericIndex) || numericIndex < offset) continue;

        const aliasBinding = [
          aliasPath,
          String(numericIndex - offset),
          ...suffix,
        ].join('.');

        if (markDescriptorBinding(aliasBinding, node)) {
          changed = true;
        }
      }
    }
  }

  return { has: hasDescriptorBinding };
};

const isPluginDescriptorBuilderChain = (node) => {
  let current = unwrapTypedExpression(node);

  while (current?.type === 'CallExpression') {
    const callee = unwrapTypedExpression(current.callee);

    if (
      callee?.type === 'Identifier' &&
      ['createBasePlugin', 'createPlatePlugin', 'toPlatePlugin'].includes(
        callee.name
      )
    ) {
      return true;
    }
    if (callee?.type !== 'MemberExpression') return false;

    current = unwrapTypedExpression(callee.object);
  }

  return false;
};

const isDefineCodecsCall = (property) => {
  if (property?.type !== 'ObjectProperty') return false;

  let value = unwrapTypedExpression(property.value);

  if (isFunction(value)) {
    const body = unwrapTypedExpression(value.body);

    if (body?.type === 'BlockStatement') {
      const returns = body.body.filter(
        (statement) => statement.type === 'ReturnStatement'
      );

      value =
        returns.length === 1
          ? unwrapTypedExpression(returns[0].argument)
          : undefined;
    } else {
      value = body;
    }
  }

  return (
    value?.type === 'CallExpression' &&
    value.callee.type === 'Identifier' &&
    value.callee.name === 'defineCodecs'
  );
};

const getExtensionStageFields = (contribution, staticStringBindings) =>
  getStaticExtensionProperties(contribution)
    .map((property) =>
      property.type === 'SpreadElement'
        ? '...'
        : (getResolvedObjectPropertyName(property, staticStringBindings) ?? '?')
    )
    .sort();

const getExtendChainStages = (node, staticStringBindings) => {
  const stages = [];
  let current = unwrapTypedExpression(node);

  while (
    current?.type === 'CallExpression' &&
    readMemberCallName(current) === 'extend'
  ) {
    stages.unshift(
      getExtensionStageFields(current.arguments[0], staticStringBindings)
    );
    current = unwrapTypedExpression(current.callee.object);
  }

  return stages;
};

const hasExactExtendStageFields = (actual, expected) =>
  actual.length === expected.length &&
  actual.every(
    (fields, index) =>
      fields.length === expected[index].length &&
      fields.every((field, fieldIndex) => field === expected[index][fieldIndex])
  );

const hasExactExtendStageChains = (actual, expected) => {
  if (actual.length !== expected.length) return false;

  const remaining = [...expected];

  return actual.every((chain) => {
    const index = remaining.findIndex((candidate) =>
      hasExactExtendStageFields(chain, candidate)
    );

    if (index === -1) return false;

    remaining.splice(index, 1);

    return true;
  });
};

const isNestedInLaterExtend = (node, ancestors) => {
  const parent = ancestors.at(-1);
  const grandparent = ancestors.at(-2);

  return (
    parent?.type === 'MemberExpression' &&
    parent.object === node &&
    grandparent?.type === 'CallExpression' &&
    grandparent.callee === parent &&
    readMemberCallName(grandparent) === 'extend'
  );
};

const isProductionPluginAuthoringFile = (file) =>
  !packageTestSourcePattern.test(file) &&
  !historicalOrGeneratedSourcePattern.test(file);

const isSchemaApiCall = (node, method) =>
  node?.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  !node.callee.computed &&
  getPropertyName(node.callee.property) === method &&
  node.callee.object.type === 'MemberExpression' &&
  getPropertyName(node.callee.object.property) === 'schema';

const isPluginFactoryCall = (
  node,
  pluginCreatorNames = defaultPluginCreatorNames
) => {
  if (!isCallExpressionNode(node)) return false;
  if (getPluginCreatorCallKind(node, pluginCreatorNames)) return true;

  if (node.callee.type === 'Identifier') {
    return pluginFactoryNamePattern.test(node.callee.name);
  }

  if (node.callee.type !== 'MemberExpression' || node.callee.computed) {
    return false;
  }

  return pluginConfigurationMethods.has(getPropertyName(node.callee.property));
};

const isPlatePluginFactoryCall = (
  node,
  pluginCreatorNames = defaultPluginCreatorNames
) => {
  if (!isCallExpressionNode(node)) return false;
  if (getPluginCreatorCallKind(node, pluginCreatorNames)) return true;

  if (node.callee.type === 'Identifier') {
    return platePluginFactoryNamePattern.test(node.callee.name);
  }

  if (node.callee.type !== 'MemberExpression' || node.callee.computed) {
    return false;
  }

  return pluginConfigurationMethods.has(getPropertyName(node.callee.property));
};

const isDirectPluginDeclarationObject = (
  ancestors,
  pluginCreatorNames = defaultPluginCreatorNames
) => {
  const objectIndex = ancestors.length - 1;

  if (ancestors[objectIndex]?.type !== 'ObjectExpression') return false;

  for (let index = objectIndex - 1; index >= 0; index--) {
    const ancestor = ancestors[index];

    if (isCallExpressionNode(ancestor)) {
      return (
        isPluginFactoryCall(ancestor, pluginCreatorNames) &&
        !ancestors
          .slice(index + 1, objectIndex)
          .some(
            (item) =>
              item.type === 'ArrayExpression' || item.type === 'ObjectProperty'
          )
      );
    }
  }

  return false;
};

const isDirectPlatePluginDeclarationObject = (
  ancestors,
  pluginCreatorNames = defaultPluginCreatorNames
) => {
  const objectIndex = ancestors.length - 1;

  if (ancestors[objectIndex]?.type !== 'ObjectExpression') return false;

  for (let index = objectIndex - 1; index >= 0; index--) {
    const ancestor = ancestors[index];

    if (isCallExpressionNode(ancestor)) {
      return (
        isPlatePluginFactoryCall(ancestor, pluginCreatorNames) &&
        !ancestors
          .slice(index + 1, objectIndex)
          .some(
            (item) =>
              item.type === 'ArrayExpression' || item.type === 'ObjectProperty'
          )
      );
    }
  }

  return false;
};

const isInsidePluginSchema = (
  ancestors,
  pluginCreatorNames = defaultPluginCreatorNames,
  staticStringBindings = new Map()
) => {
  const schemaIndex = ancestors.findLastIndex(
    (ancestor) =>
      ancestor.type === 'ObjectProperty' &&
      getResolvedObjectPropertyName(ancestor, staticStringBindings) === 'schema'
  );

  return (
    schemaIndex >= 0 &&
    isDirectPluginDeclarationObject(
      ancestors.slice(0, schemaIndex),
      pluginCreatorNames
    )
  );
};

const isInsidePluginFactoryDeclaration = (
  ancestors,
  pluginCreatorNames = defaultPluginCreatorNames
) => {
  for (let index = ancestors.length - 1; index >= 0; index--) {
    const ancestor = ancestors[index];

    if (
      !isCallExpressionNode(ancestor) ||
      !isPluginFactoryCall(ancestor, pluginCreatorNames)
    ) {
      continue;
    }

    return ancestor.callee.type === 'Identifier';
  }

  return false;
};

const isInsidePluginInitialState = (
  ancestors,
  pluginCreatorNames = defaultPluginCreatorNames
) => {
  const initialStateIndex = ancestors.findLastIndex(
    (ancestor) =>
      ancestor.type === 'ObjectProperty' &&
      getPropertyName(ancestor.key) === 'initialState'
  );

  return (
    initialStateIndex >= 0 &&
    isDirectPluginDeclarationObject(
      ancestors.slice(0, initialStateIndex),
      pluginCreatorNames
    )
  );
};

const hasExpectError = (source, node) => {
  const lineStart = source.lastIndexOf('\n', Math.max(0, node.start - 1));
  const previousLineStart = source.lastIndexOf(
    '\n',
    Math.max(0, lineStart - 1)
  );

  return source
    .slice(Math.max(0, previousLineStart), node.start)
    .includes('@ts-expect-error');
};

const hasPrecedingMarker = (source, node, marker) => {
  const lineStart = source.lastIndexOf('\n', Math.max(0, node.start - 1));
  const previousLineStart = source.lastIndexOf(
    '\n',
    Math.max(0, lineStart - 1)
  );

  return source
    .slice(Math.max(0, previousLineStart), node.start)
    .includes(marker);
};

const readCallName = (callee) => {
  if (
    callee?.type !== 'MemberExpression' ||
    callee.computed ||
    callee.object?.type !== 'Identifier'
  ) {
    return;
  }

  return callee.object.name === 'schema'
    ? getPropertyName(callee.property)
    : undefined;
};

const readSchemaContentCallName = (callee) => {
  if (
    callee?.type !== 'MemberExpression' ||
    callee.computed ||
    callee.object?.type !== 'MemberExpression' ||
    callee.object.computed ||
    callee.object.object?.type !== 'Identifier' ||
    callee.object.object.name !== 'schema' ||
    getPropertyName(callee.object.property) !== 'content'
  ) {
    return;
  }

  return getPropertyName(callee.property);
};

const getStaticMemberName = (member) => {
  if (
    member?.type !== 'MemberExpression' &&
    member?.type !== 'OptionalMemberExpression'
  ) {
    return;
  }

  return member.computed
    ? getStaticString(member.property)
    : getPropertyName(member.property);
};

const readMemberCallName = (node) =>
  isCallExpressionNode(node) &&
  (node.callee.type === 'MemberExpression' ||
    node.callee.type === 'OptionalMemberExpression')
    ? getStaticMemberName(node.callee)
    : undefined;

const readCallChainRootName = (node) => {
  let current = unwrapTypedExpression(node);

  while (current?.type === 'CallExpression') {
    if (current.callee.type === 'Identifier') return current.callee.name;
    if (current.callee.type !== 'MemberExpression' || current.callee.computed) {
      return;
    }

    current = unwrapTypedExpression(current.callee.object);
  }
};

const isForeignStoreSelectorExtension = (node, file) =>
  readMemberCallName(node) === 'extendSelectors' &&
  (readCallChainRootName(node) === 'createZustandStore' ||
    (file === 'packages/core/src/internal/plugin/resolvePlugins.ts' &&
      node.callee.object?.type === 'Identifier' &&
      node.callee.object.name === 'store'));

const isPackagePluginDefinitionSource = (file) =>
  packagePluginSourcePattern.test(file) &&
  !packageTestSourcePattern.test(file) &&
  !packageConfigureInstallationOwners.has(file);

const isPluginTypeReference = (node) => {
  if (node?.type !== 'MemberExpression') return false;

  let object = node.object;

  while (object?.type === 'MemberExpression') object = object.object;

  return (
    object?.type === 'Identifier' &&
    (object.name === 'KEYS' || object.name === 'NODES')
  );
};

const createIssue = (file, node, reason) => ({
  column: node.loc?.start.column === undefined ? 1 : node.loc.start.column + 1,
  file,
  line: node.loc?.start.line ?? 1,
  reason,
});

const getStaticPliteElementMap = (node, staticStringBindings) => {
  if (
    node?.type !== 'CallExpression' ||
    node.callee.type !== 'Identifier' ||
    (node.callee.name !== 'defineEditorSchema' &&
      !pliteExtensionNamePattern.test(node.callee.name))
  ) {
    return;
  }

  const declaration = node.arguments[0];

  if (declaration?.type !== 'ObjectExpression') return;

  const schema =
    node.callee.name === 'defineEditorSchema'
      ? declaration
      : getResolvedObjectProperty(declaration, 'schema', staticStringBindings)
          ?.value;

  if (schema?.type !== 'ObjectExpression') return;

  const elements = getResolvedObjectProperty(
    schema,
    'elements',
    staticStringBindings
  )?.value;

  return elements?.type === 'ObjectExpression' ? elements : undefined;
};

export function auditPlateSchemaSource(source, file = 'fixture.ts') {
  const ast = parsePlateSource(source, file);
  const localPluginCreatorNames = collectLocalPluginCreatorNames(ast);
  const staticStringBindings = collectStaticStringBindings(ast);
  const localPlateEditorConstructorNames =
    collectLocalPlateEditorConstructorNames(ast, staticStringBindings);
  const staticValueBindings = collectStaticValueBindings(
    ast,
    staticStringBindings
  );
  const localPluginDescriptorBindings = collectLocalPluginDescriptorBindings(
    ast,
    localPluginCreatorNames,
    staticStringBindings
  );
  const namedSchemaLineageBindings = collectNamedSchemaLineageBindings(
    ast,
    staticStringBindings
  );
  const issues = [];
  const allowedExplicitSchemaFactoryCount =
    intentionalExplicitSchemaFactoryCounts.get(file) ?? 0;
  const allowedRawCodecNegativeContractCount =
    intentionalRawCodecNegativeContractCounts.get(file) ?? 0;
  const allowedRawSchemaQueryCount =
    intentionalRawSchemaQueryCounts.get(file) ?? 0;
  let explicitSchemaFactoryCount = 0;
  const namedSchemaLineageCounts = new Map();
  let productionExtendChainCount = 0;
  const productionExtendChains = [];
  let rawCodecNegativeContractCount = 0;
  let rawSchemaQueryCount = 0;

  const report = (node, reason) => issues.push(createIssue(file, node, reason));
  const isLocallyCreatedPluginDescriptorExpression = (expression) =>
    isDirectCreatorExtendChain(expression, localPluginCreatorNames) ||
    localPluginDescriptorBindings.has(
      getPluginBuilderRootPath(expression),
      expression
    );
  const hasNonExtractablePluginAuthoringBinding = (pattern) =>
    pattern?.type === 'ObjectPattern' &&
    pattern.properties.some(
      (property) =>
        property.type === 'RestElement' ||
        (property.type === 'ObjectProperty' &&
          (property.computed ||
            pluginAuthoringMethods.has(getPropertyName(property.key))))
    );

  const visit = (node, ancestors = []) => {
    if (!node || typeof node !== 'object') return;

    if (
      node.type === 'VariableDeclarator' &&
      node.id?.type === 'Identifier' &&
      privatePluginBuilderScaffoldNamePattern.test(node.id.name) &&
      isProductionPluginAuthoringFile(file) &&
      isPluginDescriptorBuilderChain(node.init) &&
      !ancestors.some((ancestor) => ancestor.type === 'ExportNamedDeclaration')
    ) {
      const escapedName = node.id.name.replaceAll(
        /[$()*+.?[\\\]^{|}]/g,
        '\\$&'
      );
      const referenceCount =
        source.match(new RegExp(`\\b${escapedName}\\b`, 'g'))?.length ?? 0;
      const onlyConsumerContinuesBuilder = new RegExp(
        `\\b${escapedName}\\s*\\.\\s*(?:configure|extend)\\b`
      ).test(source);

      if (referenceCount === 2 && onlyConsumerContinuesBuilder) {
        report(
          node,
          'one-use private plugin descriptor scaffolding; export the complete builder chain directly'
        );
      }
    }

    if (
      node.type === 'ImportDeclaration' &&
      baseOrStaticSourcePattern.test(file) &&
      reactPluginEntrypointPattern.test(node.source.value)
    ) {
      report(
        node,
        'Base/static modules cannot import the React plugin layer; bind static components through BasePlugin.configure({ component })'
      );
    }

    if (
      node.type === 'ImportDeclaration' &&
      baseOrStaticSourcePattern.test(file) &&
      liveRegistryNodeModulePattern.test(node.source.value)
    ) {
      report(
        node,
        'Base/static kits cannot bind live registry node modules; import the static renderer'
      );
    }

    if (
      ((node.type === 'VariableDeclarator' &&
        hasNonExtractablePluginAuthoringBinding(node.id) &&
        isLocallyCreatedPluginDescriptorExpression(node.init)) ||
        (node.type === 'AssignmentExpression' &&
          node.operator === '=' &&
          hasNonExtractablePluginAuthoringBinding(node.left) &&
          isLocallyCreatedPluginDescriptorExpression(node.right))) &&
      isProductionPluginAuthoringFile(file) &&
      (packagePluginSourcePattern.test(file) || file.startsWith('apps/'))
    ) {
      report(
        node,
        'plugin authoring methods cannot be extracted from a locally created descriptor; keep the exact builder chain visible'
      );
    }

    if (
      (node.type === 'MemberExpression' ||
        node.type === 'OptionalMemberExpression') &&
      pluginAuthoringMethods.has(getStaticMemberName(node)) &&
      isLocallyCreatedPluginDescriptorExpression(node.object)
    ) {
      const parent = ancestors.at(-1);
      const isDirectCall =
        (parent?.type === 'CallExpression' ||
          parent?.type === 'OptionalCallExpression') &&
        parent.callee === node;

      if (
        !isDirectCall &&
        isProductionPluginAuthoringFile(file) &&
        (packagePluginSourcePattern.test(file) || file.startsWith('apps/'))
      ) {
        report(
          node,
          'plugin authoring methods cannot be extracted from a locally created descriptor; keep the exact builder chain visible'
        );
      }
    }

    if (
      node.type === 'OptionalCallExpression' &&
      (node.callee.type === 'MemberExpression' ||
        node.callee.type === 'OptionalMemberExpression')
    ) {
      const callsLocallyCreatedPluginDescriptor =
        isLocallyCreatedPluginDescriptorExpression(node.callee.object);

      if (
        callsLocallyCreatedPluginDescriptor &&
        isProductionPluginAuthoringFile(file) &&
        (packagePluginSourcePattern.test(file) || file.startsWith('apps/'))
      ) {
        report(
          node,
          'optional plugin-authoring calls on locally created descriptors cannot bypass the exact stage audit'
        );
      }
    }

    if (node.type === 'Identifier' && deletedSymbols.has(node.name)) {
      report(node, `deleted Plate schema symbol ${node.name}`);
    }

    const staticString = getStaticString(node);

    if (staticString?.startsWith('plate:plugin-schema:')) {
      report(node, 'synthetic Plate schema extension identity');
    }
    if (
      staticString === 'plate:block-content' &&
      !privateSchemaGroupOwners.has(file)
    ) {
      report(node, 'private Plate block-content schema group');
    }

    if (node.type === 'MemberExpression' && !node.computed) {
      const owner = node.object;
      const readsDeletedNodeField =
        owner?.type === 'Identifier'
          ? owner.name === 'node'
          : owner?.type === 'MemberExpression' &&
            !owner.computed &&
            getPropertyName(owner.property) === 'node';

      if (
        readsDeletedNodeField &&
        ['component', 'element', 'mark'].includes(
          getPropertyName(node.property)
        )
      ) {
        report(
          node,
          `deleted Plate node.${getPropertyName(node.property)} access`
        );
      }
    }

    if (node.type === 'ObjectProperty') {
      const key = getResolvedObjectPropertyName(node, staticStringBindings);
      const nodeComponent =
        key === 'render' && node.value?.type === 'ObjectExpression'
          ? getObjectProperty(node.value, 'node')
          : undefined;
      const isIntentionalNegativeRenderNode =
        file === intentionalRenderNodeNegativeContract &&
        nodeComponent &&
        hasExpectError(source, nodeComponent) &&
        ancestors.some(
          (ancestor) =>
            ancestor.type === 'CallExpression' &&
            ancestor.callee.type === 'Identifier' &&
            ancestor.callee.name === 'toPlatePlugin'
        );

      if (
        nodeComponent &&
        !internalRenderNodeOwners.has(file) &&
        !isIntentionalNegativeRenderNode
      ) {
        report(
          nodeComponent,
          'plugin node components must use root-level component instead of render.node authoring'
        );
      }

      if (key === 'node' && node.value?.type === 'ObjectExpression') {
        const keys = node.value.properties
          .map((property) =>
            getResolvedObjectPropertyName(property, staticStringBindings)
          )
          .filter((property) => deletedNodeBagKeys.has(property));
        const hasDistinctiveNodeBagKey = keys.some(
          (property) => property !== 'type'
        );

        if (
          keys.length > 0 &&
          (hasDistinctiveNodeBagKey ||
            isDirectPluginDeclarationObject(ancestors, localPluginCreatorNames))
        ) {
          report(node, `deleted Plate node bag (${keys.join(', ')})`);
        }
      }

      if (
        key === 'mark' &&
        node.value?.type === 'BooleanLiteral' &&
        node.value.value &&
        isInsidePluginSchema(
          ancestors,
          localPluginCreatorNames,
          staticStringBindings
        )
      ) {
        report(node, 'schema.mark must use a property descriptor');
      }

      if (
        key === 'groups' &&
        node.value?.type === 'ArrayExpression' &&
        node.value.elements.some(
          (element) =>
            element?.type === 'StringLiteral' &&
            (element.value === 'block' || element.value === 'inline')
        ) &&
        isInsidePluginSchema(
          ancestors,
          localPluginCreatorNames,
          staticStringBindings
        )
      ) {
        report(node, 'Plate plugins must not repeat derived structural groups');
      }

      if (
        key === 'element' &&
        node.value?.type === 'ObjectExpression' &&
        isInsidePluginSchema(
          ancestors,
          localPluginCreatorNames,
          staticStringBindings
        ) &&
        isInsidePluginFactoryDeclaration(ancestors, localPluginCreatorNames) &&
        !node.value.properties.some(
          (property) => property.type === 'SpreadElement'
        ) &&
        !node.value.properties.some((property) =>
          ['content', 'void'].includes(
            getResolvedObjectPropertyName(property, staticStringBindings)
          )
        ) &&
        !hasExpectError(source, node) &&
        !ancestors.some(
          (ancestor) =>
            ancestor.type === 'ObjectProperty' &&
            getResolvedObjectPropertyName(ancestor, staticStringBindings) ===
              'schema' &&
            hasExpectError(source, ancestor)
        )
      ) {
        report(node, 'non-void element schema requires explicit content');
      }

      if (
        key === 'targetPluginKeys' &&
        isInsidePluginInitialState(ancestors, localPluginCreatorNames)
      ) {
        report(
          node,
          'schema target descriptors belong in top-level targetPluginKeys'
        );
      }

      if (
        key === 'config' &&
        isDirectPlatePluginDeclarationObject(ancestors, localPluginCreatorNames)
      ) {
        report(node, 'Plate plugin values belong in initialState');
      }

      if (
        key === 'schema' &&
        isFunction(node.value) &&
        isDirectPlatePluginDeclarationObject(ancestors, localPluginCreatorNames)
      ) {
        const parameter = node.value.params?.[0];

        if (parameter?.type === 'ObjectPattern') {
          for (const property of parameter.properties) {
            const binding = getPropertyName(
              property.value ?? property.argument
            );

            if (
              binding &&
              !allowedSchemaFactoryBindings.has(binding) &&
              !hasExpectError(source, node)
            ) {
              report(
                property,
                `schema factory cannot read runtime binding ${binding}`
              );
            }
          }
        }
      }
    }

    if (isCallExpressionNode(node)) {
      const memberCallName = readMemberCallName(node);
      const pluginCreatorKind = getPluginCreatorCallKind(
        node,
        localPluginCreatorNames
      );
      const isIntentionalRuntimeNegativeConstructor =
        packageTestSourcePattern.test(file) &&
        node.callee.type === 'TSAsExpression' &&
        node.callee.typeAnnotation?.type === 'TSAnyKeyword';
      const memberCallOwner =
        node.callee.type === 'MemberExpression' ||
        node.callee.type === 'OptionalMemberExpression'
          ? unwrapTypedExpression(node.callee.object)
          : undefined;
      const hasDynamicComputedMember =
        (node.callee.type === 'MemberExpression' ||
          node.callee.type === 'OptionalMemberExpression') &&
        node.callee.computed &&
        getStaticMemberName(node.callee) === undefined;
      const callsLocallyCreatedPluginDescriptor =
        (node.callee.type === 'MemberExpression' ||
          node.callee.type === 'OptionalMemberExpression') &&
        isLocallyCreatedPluginDescriptorExpression(node.callee.object);

      if (
        hasDynamicComputedMember &&
        callsLocallyCreatedPluginDescriptor &&
        isProductionPluginAuthoringFile(file) &&
        (packagePluginSourcePattern.test(file) || file.startsWith('apps/'))
      ) {
        report(
          node,
          'computed plugin-authoring calls on locally created descriptors cannot bypass the exact stage audit'
        );
      }

      if (
        baseOrStaticSourcePattern.test(file) &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'toPlatePlugin'
      ) {
        report(
          node,
          'Base/static modules use BasePlugin.configure({ component }); toPlatePlugin belongs in live React adapters'
        );
      }

      if (
        memberCallName &&
        deletedPluginBuilderMethods.has(memberCallName) &&
        !isForeignStoreSelectorExtension(node, file)
      ) {
        report(
          node,
          memberCallName === 'withComponent'
            ? 'deleted plugin builder .withComponent(); use root-level component'
            : `deleted plugin builder .${memberCallName}(); use constructor fields or .extend() only for imported/prebuilt adaptation or a real staged dependency`
        );
      }

      if (memberCallName === 'extend' && isCallExpressionNode(node)) {
        for (const property of getStaticExtensionProperties(
          node.arguments[0]
        )) {
          if (
            getResolvedObjectPropertyName(property, staticStringBindings) !==
            'codecs'
          ) {
            continue;
          }

          if (!isDefineCodecsCall(property)) {
            const isIntentionalNegativeContract =
              rawCodecNegativeContractCount <
                allowedRawCodecNegativeContractCount &&
              hasPrecedingMarker(
                source,
                property,
                intentionalRawCodecNegativeMarker
              );

            if (isIntentionalNegativeContract) {
              rawCodecNegativeContractCount++;
            } else {
              report(
                property,
                'plugin codec declarations must use the context-bound defineCodecs(...) helper'
              );
            }
          }

          if (
            packagePluginSourcePattern.test(file) &&
            isProductionPluginAuthoringFile(file) &&
            !(intentionalProductionExtendStageChains.get(file) ?? []).some(
              (chain) => chain.some((fields) => fields.includes('codecs'))
            )
          ) {
            report(
              property,
              'independent plugin codecs belong in the constructor callback'
            );
          }
        }

        if (
          !isNestedInLaterExtend(node, ancestors) &&
          isProductionPluginAuthoringFile(file) &&
          (packagePluginSourcePattern.test(file) || file.startsWith('apps/')) &&
          isLocallyCreatedPluginDescriptorExpression(node.callee.object)
        ) {
          const stages = getExtendChainStages(node, staticStringBindings);

          productionExtendChainCount++;
          productionExtendChains.push(stages);
          const expected =
            intentionalProductionExtendStageChains.get(file) ?? [];

          if (
            !expected.some((chain) => hasExactExtendStageFields(stages, chain))
          ) {
            report(
              node,
              `direct constructor .extend() chain is not an audited constructor-inaccessible shared factory, resolved consumer configuration, or earlier-stage type dependency; found ${stages
                .map((fields) => `[${fields.join(', ')}]`)
                .join(' -> ')}`
            );
          }
        }
      }

      if (
        pluginCreatorKind &&
        !isIntentionalRuntimeNegativeConstructor &&
        node.arguments[0]?.type === 'ObjectExpression'
      ) {
        for (const property of node.arguments[0].properties) {
          const key =
            property.type === 'ObjectProperty' ||
            property.type === 'ObjectMethod'
              ? getResolvedObjectPropertyName(property, staticStringBindings)
              : undefined;

          if (
            pluginCreatorKind === 'createBasePlugin' &&
            key === 'component' &&
            !hasExpectError(source, property)
          ) {
            report(
              property,
              'createBasePlugin stays renderer-neutral; bind static components through terminal BasePlugin.configure({ component })'
            );
          }

          if (key === 'codecs' && !isDefineCodecsCall(property)) {
            const isIntentionalNegativeContract =
              rawCodecNegativeContractCount <
                allowedRawCodecNegativeContractCount &&
              hasPrecedingMarker(
                source,
                property,
                intentionalRawCodecNegativeMarker
              );

            if (isIntentionalNegativeContract) {
              rawCodecNegativeContractCount++;
            } else {
              report(
                property,
                'plugin codec declarations must use the context-bound defineCodecs(...) helper'
              );
            }
          }
        }
      }

      if (
        memberCallName &&
        ['clone', 'configure', 'configurePlugin', 'extendPlugin'].includes(
          memberCallName
        ) &&
        isPackagePluginDefinitionSource(file)
      ) {
        report(
          node,
          'package plugin definitions must use constructor fields or a justified imported/prebuilt or staged extend; reserve configure and nested plugin configuration for consumer installation'
        );
      }

      if (
        memberCallName &&
        pluginAuthoringMethods.has(memberCallName) &&
        readMemberCallName(memberCallOwner) === 'configure'
      ) {
        report(node, 'configure must be the final plugin authoring call');
      }

      const namedLineageIssue = recordNamedSchemaLineage(
        node,
        file,
        namedSchemaLineageBindings,
        namedSchemaLineageCounts,
        localPlateEditorConstructorNames,
        staticStringBindings,
        staticValueBindings
      );

      if (namedLineageIssue) {
        report(namedLineageIssue.node, namedLineageIssue.reason);
      }

      const rawSchemaQuery =
        (isSchemaApiCall(node, 'getElementProperty') &&
          node.arguments[1]?.type === 'StringLiteral') ||
        (isSchemaApiCall(node, 'property') &&
          node.arguments[0]?.type === 'ObjectExpression');

      if (rawSchemaQuery) {
        rawSchemaQueryCount++;

        if (rawSchemaQueryCount > allowedRawSchemaQueryCount) {
          report(
            node,
            'raw schema query is outside the intentional runtime/context contract allowlist'
          );
        }
      }

      if (
        pluginCreatorKind &&
        !isIntentionalRuntimeNegativeConstructor &&
        (node.typeParameters?.params.length > 0 ||
          node.typeArguments?.params.length > 0) &&
        getResolvedObjectProperty(
          node.arguments[0],
          'schema',
          staticStringBindings
        )
      ) {
        explicitSchemaFactoryCount++;

        if (explicitSchemaFactoryCount > allowedExplicitSchemaFactoryCount) {
          report(
            node,
            'schema-bearing plugin factories must infer their descriptor before deriving the plugin config type'
          );
        }
      }

      const elements = getStaticPliteElementMap(node, staticStringBindings);

      for (const elementProperty of elements?.properties ?? []) {
        if (
          elementProperty.type === 'SpreadElement' ||
          elementProperty.value?.type !== 'ObjectExpression' ||
          elementProperty.value.properties.some(
            (property) => property.type === 'SpreadElement'
          ) ||
          elementProperty.value.properties.some((property) =>
            ['content', 'void'].includes(
              getResolvedObjectPropertyName(property, staticStringBindings)
            )
          ) ||
          hasExpectError(source, elementProperty)
        ) {
          continue;
        }

        report(
          elementProperty,
          'non-void element schema requires explicit content'
        );
      }

      if (
        (node.callee?.type === 'MemberExpression' ||
          node.callee?.type === 'OptionalMemberExpression') &&
        getStaticMemberName(node.callee) === 'configure' &&
        isFunction(node.arguments[0])
      ) {
        const inspection = inspectContextualConfigure(node.arguments[0]);

        for (const invalidReturn of inspection.invalidReturns) {
          if (!hasExpectError(source, invalidReturn)) {
            report(
              invalidReturn,
              'contextual plugin configure callbacks must return an explicit object'
            );
          }
        }
        for (const property of inspection.properties) {
          const key =
            property.type === 'SpreadElement'
              ? undefined
              : getPropertyName(property.key);

          if (
            (!key || !contextualConfigureKeys.has(key)) &&
            !hasExpectError(source, property)
          ) {
            report(
              property,
              'contextual plugin configure only accepts explicit initialState, handlers, override, render, and shortcuts overrides'
            );
          }
        }
      }

      const schemaCall = readCallName(node.callee);

      if (['contribution', 'element', 'group', 'root'].includes(schemaCall)) {
        report(node, `deleted schema.${schemaCall}(...) wrapper`);
      }

      const contentCall = readSchemaContentCallName(node.callee);

      if (
        (contentCall === 'type' || contentCall === 'types') &&
        node.arguments.some(isPluginTypeReference)
      ) {
        report(node, 'schema content must use typed plugin references');
      }
    }

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
        for (const child of value) visit(child, nextAncestors);
      } else if (value && typeof value === 'object' && value.type) {
        visit(value, nextAncestors);
      }
    }
  };

  visit(ast);

  if (rawSchemaQueryCount < allowedRawSchemaQueryCount) {
    report(
      ast,
      `raw schema query allowlist expects ${allowedRawSchemaQueryCount} calls but found ${rawSchemaQueryCount}`
    );
  }
  if (rawCodecNegativeContractCount < allowedRawCodecNegativeContractCount) {
    report(
      ast,
      `raw codec negative-contract allowlist expects ${allowedRawCodecNegativeContractCount} marked declaration${allowedRawCodecNegativeContractCount === 1 ? '' : 's'} but found ${rawCodecNegativeContractCount}`
    );
  }
  if (explicitSchemaFactoryCount < allowedExplicitSchemaFactoryCount) {
    report(
      ast,
      `explicit schema factory allowlist expects ${allowedExplicitSchemaFactoryCount} calls but found ${explicitSchemaFactoryCount}`
    );
  }
  if (
    intentionalProductionExtendStageChains.has(file) &&
    !hasExactExtendStageChains(
      productionExtendChains,
      intentionalProductionExtendStageChains.get(file)
    )
  ) {
    const expectedCount =
      intentionalProductionExtendStageChains.get(file).length;

    report(
      ast,
      `production extend-stage allowlist expects exact ${expectedCount} audited chain${expectedCount === 1 ? '' : 's'} but found ${productionExtendChainCount}; signatures did not match`
    );
  }
  for (const [signature, count] of intentionalNamedSchemaLineages.get(file) ??
    []) {
    const found = namedSchemaLineageCounts.get(signature) ?? 0;

    if (found < count && requiredNamedSchemaLineageFiles.has(file)) {
      report(
        ast,
        `named schema lineage allowlist expects ${count} ${signature} construction${count === 1 ? '' : 's'} but found ${found}`
      );
    }
  }

  return issues;
}

export function auditNamedSchemaLineageDocument(
  source,
  file = 'content/docs/example.mdx'
) {
  const issues = [];
  const counts = new Map();

  for (const fence of extractJavaScriptCodeFences(source)) {
    let ast;

    try {
      ast = parsePlateSource(fence.code, file, { errorRecovery: true });
    } catch (error) {
      if (
        [...plateEditorConstructionOptionIndexes.keys()].some((name) =>
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

    const staticStringBindings = collectStaticStringBindings(ast);
    const staticValueBindings = collectStaticValueBindings(
      ast,
      staticStringBindings
    );
    const bindings = collectNamedSchemaLineageBindings(
      ast,
      staticStringBindings
    );
    const constructorNames = collectLocalPlateEditorConstructorNames(
      ast,
      staticStringBindings
    );

    walkAst(ast, (node) => {
      if (!isCallExpressionNode(node)) return;

      const issue = recordNamedSchemaLineage(
        node,
        file,
        bindings,
        counts,
        constructorNames,
        staticStringBindings,
        staticValueBindings
      );

      if (!issue) return;

      issues.push({
        ...createIssue(file, issue.node, issue.reason),
        line: fence.line + (issue.node.loc?.start.line ?? 1) - 1,
      });
    });
  }

  if (requiredNamedSchemaLineageFiles.has(file)) {
    for (const [signature, count] of intentionalNamedSchemaLineages.get(file) ??
      []) {
      const found = counts.get(signature) ?? 0;

      if (found < count) {
        issues.push({
          column: 1,
          file,
          line: 1,
          reason: `named schema lineage allowlist expects ${count} ${signature} construction${count === 1 ? '' : 's'} but found ${found}`,
        });
      }
    }
  }

  return issues;
}

const collectSourceFiles = () =>
  execFileSync(
    'git',
    [
      'ls-files',
      '--cached',
      '--others',
      '--exclude-standard',
      '--',
      ...sourceRoots,
    ],
    { cwd: repoRoot, encoding: 'utf8' }
  )
    .split('\n')
    .filter(Boolean)
    .filter(isPlateSchemaAdoptionSourcePath)
    .map((file) => join(repoRoot, file))
    .filter(existsSync);

export function auditPlateSchemaAdoption() {
  const files = collectSourceFiles();
  const issues = files.flatMap((path) => {
    const file = toPosixPath(relative(repoRoot, path));
    const source = readFileSync(path, 'utf8');

    try {
      return markdownFilePattern.test(file)
        ? auditNamedSchemaLineageDocument(source, file)
        : auditPlateSchemaSource(source, file);
    } catch (error) {
      return [
        {
          column: error.loc?.column === undefined ? 1 : error.loc.column + 1,
          file,
          line: error.loc?.line ?? 1,
          reason: `source parse failed: ${error.message}`,
        },
      ];
    }
  });

  return {
    excludedGeneratedRoots: ciGeneratedPlateSchemaOutputRoots,
    fileCount: files.length,
    issues,
  };
}

function runAudit() {
  const { excludedGeneratedRoots, fileCount, issues } =
    auditPlateSchemaAdoption();

  if (issues.length > 0) {
    console.error('Plate schema adoption audit failed:');
    for (const issue of issues) {
      console.error(
        `- ${issue.file}:${issue.line}:${issue.column}: ${issue.reason}`
      );
    }
    process.exit(1);
  }

  console.log(
    `Plate schema adoption source audit passed (${fileCount} source and documentation files; CI-generated ${excludedGeneratedRoots.join(', ')} excluded).`
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runAudit();
}
