#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { parse } from '@babel/parser';

import { extractJavaScriptCodeFences } from './check-plate-doc-code-contracts.mjs';

const repoRoot = resolve(import.meta.dirname, '../..');
const sourceRoots = ['packages', 'apps', 'benchmarks', 'content', '.changeset'];
export const ciGeneratedPlateSchemaOutputRoots = Object.freeze([
  'apps/www/public/r',
  'apps/www/public/rd',
  'templates',
]);
const markdownFilePattern = /\.mdx?$/;
const staticPluginApiReferencePattern = /\b[A-Za-z_$][\w$]*Plugin\.api\b/gu;
const basePluginExtendComponentPattern =
  /\bBase[\w$]*Plugin\s*\.\s*extend\s*\(\s*(?:\([^)]*\)\s*=>\s*\(?\s*)?\{[\s\S]{0,400}?\bcomponent\s*:/;
const terminalComponentConversionPattern =
  /\btoPlatePlugin\s*\(\s*Base[\w$]*Plugin\s*\)\s*\.\s*configure\s*\(\s*\{[\s\S]{0,400}?\bcomponent\s*:/;
const staticBaseKitReactAdapterPattern =
  /(?:\b[\w-]+-base-kit\b[^\n]{0,500}\btoPlatePlugin\s*\(\s*Base[\w$]*Plugin\b|\btoPlatePlugin\s*\(\s*Base[\w$]*Plugin\b[^\n]{0,500}\b[\w-]+-base-kit\b)/i;
const staticEditorBaseReactAdapterPattern =
  /(?=[\s\S]*\b(?:createStaticEditor\s*\(|from\s+['"](?:platejs|@platejs\/core)\/static['"]))[\s\S]*\btoPlatePlugin\s*\(\s*Base[\w$]*Plugin\b/;
const auditedFilePattern = /\.(?:cjs|cts|js|jsx|md|mdx|mjs|mts|ts|tsx)$/;
const typescriptFilePattern = /\.(?:cts|mts|ts|tsx)$/;
const pluginFactoryNamePattern = /^(?:create|define).*(?:Extension|Plugin)$/;
const platePluginFactoryNamePattern = /Plugin$/;
const pliteExtensionNamePattern = /^define.*Extension$/;
const privatePluginBuilderScaffoldNamePattern =
  /(?:PluginBase|PluginDefinition|PluginDescriptor)$/;
const pluginDescriptorOwnerPathPattern =
  /(?:^|\.)(?:plugin|[A-Za-z_$][\w$]*Plugin)$/;
const basePluginDescriptorNamePattern = /^Base[\w$]*Plugin$/;
const prefixedOnListenerPattern = /^on[A-Z]/;
const pluginOwnerNamePattern = /plugin/i;
const pluginPortalOwnerNamePattern =
  /^(?:installed|owner|plugin|portal|reference|resolved|target)/i;
const schemaIdentityVariableNamePattern = /Type$/;
const schemaTypeOperationNamePattern = /(?:Block|Element|Node)Types?$/;
const pluginConfigurationMethods = new Set([
  'configure',
  'extend',
  'extendPlugin',
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
const contextualConfigureKeys = new Set([
  'initialState',
  'on',
  'override',
  'render',
  'shortcuts',
]);
const deletedPlatePluginDefinitionKeys = new Set([
  'clipboard',
  'config',
  'extension',
  'handlers',
  'key',
  'pluginApi',
  'targetPluginKeys',
  'tx',
  'type',
  'validateConfiguration',
]);
const deletedPliteExtensionDefinitionKeys = new Set([
  'config',
  'state',
  'tx',
  'validateConfiguration',
]);
const deletedPluginTypeSymbols = new Set([
  'AnyPluginConfig',
  'BasePluginExtensionContract',
  'EffectiveExtensionContractField',
  'EffectivePlateContractField',
  'InferConfig',
  'PluginConfig',
  'TPlatePluginConfig',
  'UnifiedRuntimeBasePluginConfig',
  'UnifiedRuntimePlatePluginConfig',
]);
const deletedPluginContractMemberKeys = new Set(['__config', 'pluginApi']);
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
const plitePrivateWitnessOwner = 'packages/plite/src/interfaces/editor.ts';
const internalRenderNodeOwners = new Set([
  'packages/core/src/internal/plugin/resolvePlugins.ts',
  'packages/core/src/lib/plugin/defineBasePlugin.ts',
  'packages/core/src/react/plugin/toPlatePlugin.ts',
]);
const intentionalRenderNodeNegativeContract =
  'packages/core/src/lib/plugin/defineBasePlugin.typed.spec.ts';
const intentionalRuntimeRenderNodeNegativeMarker =
  '@plate-schema-adoption-negative-render-node';
const intentionalPluginDeclarationStageMarker =
  '@plate-plugin-declaration-stage';
const intentionalRuntimeRenderNodeNegativeContractCounts = new Map([
  ['packages/core/src/lib/plugin/defineBasePlugin.spec.ts', 1],
]);
const intentionalRawCodecNegativeMarker =
  '@plate-schema-adoption-negative-codec';
const intentionalPliteConfigNegativeMarker =
  '@ts-expect-error Plite extensions validate the candidate context, not Plate config';
const intentionalReactFactoryNegativeMarker = '@ts-expect-error react ';
const intentionalRawCodecNegativeContractCounts = new Map([
  ['packages/core/src/internal/plugin/compilePlateHtmlCodec.spec.ts', 1],
  ['packages/core/src/lib/plugins/ProductCodecs.spec.ts', 1],
  ['packages/core/src/lib/plugins/html/HtmlPlugin.codec.spec.ts', 1],
  ['packages/core/type-tests/base-plugin-contracts.ts', 1],
  ['packages/markdown/src/lib/internal/markdownCodecs.spec.ts', 1],
]);
const intentionalPliteConfigNegativeContractCounts = new Map([
  ['packages/plite/test/generic-extension-contract.ts', 1],
]);
const intentionalReactFactoryNegativeContractCounts = new Map([
  ['packages/plite-react/test/generic-react-editor-contract.tsx', 2],
]);
const intentionalRuntimeNegativeDefinitionFields = new Map([
  [
    'packages/core/src/react/plugin/definePlatePlugin.spec.ts',
    new Set(['invalidApi:api']),
  ],
]);
const packageConfigureInstallationOwners = new Set([
  'packages/core/src/lib/plugins/getCorePlugins.ts',
  'packages/core/src/react/editor/getPlateCorePlugins.ts',
]);
const packagePluginSourcePattern =
  /^packages\/[^/]+\/src\/.*\.(?:cjs|cts|js|jsx|mjs|mts|ts|tsx)$/;
const packageTestSourcePattern =
  /(?:^|\/)(?:__tests__|type-tests)(?:\/|$)|\.(?:slow|spec|test)\.[cm]?[jt]sx?$/;
const registryProductionSourcePattern = /^apps\/www\/src\/registry\//;
const registryStandaloneEditorTypeSourcePattern =
  /^apps\/www\/src\/registry\/(?:ui\/|components\/editor\/use-chat\.tsx?$)/;
const registrySchemaIdentityOwnerPathPattern =
  /(?:^|\.)(?:element|node|plugin|rootNode)\.type$/;
const registryRenderContributionPluginTypePattern = /\.plugin\.type$/;
const baseOrStaticSourcePattern =
  /(?:^|\/)(?:[^/]*-base-kit|[^/]*-static)\.[cm]?[jt]sx?$|(?:^|\/)static(?:\/|$)/;
const reactPluginEntrypointPattern = /^(?:platejs|@platejs\/[^/]+)\/react$/;
const plateReactAdapterEntrypointPattern =
  /^(?:platejs|@platejs\/core)\/react$/;
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
const privateCoreDefinitionCarrierSymbols = new Set([
  'InternalDefinitionOf',
  'PluginDefinitionCarrier',
]);
const internalCoreCompilerTypeSymbols = new Set([
  'LowerBasePlugin',
  'NormalizeBasePluginInput',
  'NormalizePlatePluginInput',
]);
const internalPliteContractTypeSymbols = new Set([
  'EditorExtensionDependencyReferenceFor',
  'EditorExtensionTypeLambda',
  'InternalEditorExtensionDependencyReference',
  'InternalEditorExtensionInstalledCapabilitiesOf',
  'InternalEditorExtensionTypeProviderOf',
  'InternalEditorExtensionWitnessFor',
]);
const liveRegistryNodeModulePattern = /^@\/registry\/ui\/.*-node$/;
const historicalOrGeneratedSourcePattern =
  /(?:^|\/)(?:generated|historical)(?:\/|$)|^(?:apps\/www\/public|templates)\//;
const intentionalProductionExtendStageChains = new Map([
  [
    'packages/core/src/lib/plugins/affinity/AffinityPlugin.ts',
    [[['commands']]],
  ],
  ['packages/core/src/lib/plugins/HistoryPlugin.ts', [[['$factory:history']]]],
  [
    'packages/core/src/lib/plugins/dom/DOMPlugin.ts',
    [[['$value:plateDOMExtension']]],
  ],
  [
    'packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts',
    [[['commands', 'contributions']]],
  ],
  [
    'packages/core/src/lib/plugins/override/OverridePlugin.ts',
    [[['commands', 'corrections', 'readMiddleware']]],
  ],
  [
    'packages/core/src/react/editor/getPlateCorePlugins.ts',
    [[['$value:plateReactExtension']]],
  ],
  [
    'apps/www/src/registry/examples/version-history-demo.tsx',
    [[['$factory:excludeDiffFragment']]],
  ],
  [
    'packages/code-block/src/lib/BaseCodeBlockPlugin.ts',
    [[['update'], ['commands', 'contributions']], [['corrections', 'on']]],
  ],
  [
    'packages/comment/src/lib/BaseCommentPlugin.ts',
    [[['api', 'corrections', 'read', 'rules'], ['update']]],
  ],
  ['packages/date/src/lib/BaseDatePlugin.ts', [[['update']]]],
  ['packages/indent/src/lib/BaseIndentPlugin.ts', [[['corrections']]]],
  [
    'packages/list/src/lib/BaseListPlugin.ts',
    [
      [
        ['codecs'],
        ['api', 'read'],
        ['override', 'update'],
        ['commands', 'corrections', 'on'],
      ],
    ],
  ],
  [
    'packages/list-classic/src/lib/BaseListPlugin.ts',
    [[['commands']], [['read'], ['update'], ['commands', 'corrections']]],
  ],
  ['packages/link/src/lib/BaseLinkPlugin.ts', [[['update'], ['commands']]]],
  ['packages/csv/src/lib/CsvPlugin.ts', [[['api'], ['codecs']]]],
  ['packages/markdown/src/lib/MarkdownPlugin.ts', [[['api']]]],
  ['packages/tabbable/src/react/TabbablePlugin.tsx', [[['read']]]],
  ['packages/toc/src/lib/BaseTocPlugin.ts', [[['read']]]],
  [
    'packages/toggle/src/lib/BaseTogglePlugin.ts',
    [[['api', 'read', 'selectors']]],
  ],
  [
    'packages/selection/src/react/BlockSelectionPlugin.tsx',
    [
      [
        ['api', 'commands', 'on'],
        ['inject', 'shortcuts', 'update'],
        ['render'],
      ],
    ],
  ],
  ['packages/selection/src/react/BlockMenuPlugin.tsx', [[['on']]]],
  ['packages/selection/src/react/CursorOverlayPlugin.tsx', [[['on']]]],
  ['packages/tag/src/lib/BaseTagPlugin.ts', [[['read', 'update'], ['read']]]],
  [
    'packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx',
    [[['selectors'], ['inject', 'useHooks']]],
  ],
  [
    'packages/table/src/lib/BaseTablePlugin.ts',
    [
      [
        ['api'],
        ['api'],
        ['api', 'read'],
        ['read'],
        ['api', 'read'],
        ['update'],
        ['update'],
        ['contributions'],
        ['corrections'],
        ['commands', 'readMiddleware', 'selectionKinds'],
      ],
    ],
  ],
  [
    'packages/ai/src/react/CopilotPlugin.tsx',
    [[['api'], ['commands', 'on', 'render', 'selectors', 'shortcuts']]],
  ],
  [
    'packages/ai/src/react/AIChatPlugin.ts',
    [
      [
        ['api', 'read', 'selectors', 'update'],
        ['commands', 'corrections', 'effectTypes', 'on'],
      ],
    ],
  ],
  [
    'packages/suggestion/src/lib/BaseSuggestionPlugin.ts',
    [[['api', 'rules'], ['read'], ['update'], ['commands', 'corrections']]],
  ],
  [
    'packages/footnote/src/lib/BaseFootnotePlugin.ts',
    [[['commands'], ['update']]],
  ],
  ['packages/emoji/src/lib/BaseEmojiPlugin.ts', [[['commands']]]],
  ['packages/mention/src/lib/BaseMentionPlugin.ts', [[['commands']]]],
  ['packages/slash-command/src/lib/BaseSlashPlugin.ts', [[['commands']]]],
  [
    'packages/layout/src/lib/BaseColumnPlugin.ts',
    [[['update'], ['shortcuts']], [['corrections', 'update']]],
  ],
  ['packages/math/src/lib/BaseEquationPlugin.ts', [[['update']]]],
  [
    'packages/media/src/lib/BaseMediaPlugin.ts',
    [
      [['$factory:defineMediaPlugin']],
      [['$factory:defineMediaPlugin']],
      [['$factory:defineMediaPlugin']],
    ],
  ],
  [
    'packages/media/src/lib/image/BaseImagePlugin.ts',
    [[['$factory:defineMediaPlugin'], ['contributions']]],
  ],
  [
    'packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts',
    [[['$factory:defineMediaPlugin']]],
  ],
  ['packages/yjs/src/lib/BaseYjsPlugin.ts', [[['$factory:yjs']]]],
]);
const allowedSchemaFactoryBindings = new Set([
  'initialState',
  'name',
  'plugins',
  'targetElementTypes',
]);
// Raw queries are reserved for runtime discovery and contextual contract laws.
// Every owning file has an exact reviewed count so tests cannot hide new drift.
const intentionalRawSchemaQueryCounts = new Map([
  [
    'apps/www/src/app/(app)/examples/plite/_examples/plate-schema-descriptors.tsx',
    1,
  ],
  ['packages/ai/src/lib/BaseAIPlugin.spec.tsx', 6],
  ['packages/basic-styles/src/lib/BaseStylePlugins.spec.ts', 8],
  ['packages/code-block/src/lib/BaseCodeBlockPlugin.spec.tsx', 1],
  ['packages/code-drawing/src/lib/BaseCodeDrawingPlugin.spec.ts', 1],
  ['packages/comment/src/lib/BaseCommentPlugin.spec.ts', 5],
  ['packages/core/src/internal/plugin/compilePlateModel.spec.ts', 4],
  ['packages/core/src/lib/editor/withPlite.slow.ts', 2],
  ['packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts', 1],
  ['packages/core/src/lib/plugins/html/HtmlPlugin.ts', 4],
  ['packages/core/src/lib/plugins/element-id/ElementIdPlugin.spec.tsx', 1],
  ['packages/core/type-tests/plugin-schema-contracts.ts', 8],
  ['packages/find-replace/src/lib/FindReplacePlugin.spec.ts', 1],
  ['packages/math/src/lib/BaseEquationPlugin.spec.tsx', 2],
  ['packages/plite/test/editor-foundation-contract.ts', 2],
  ['packages/plite/test/schema-contract.ts', 5],
  ['packages/plite/test/schema-inference-contract.ts', 2],
  ['packages/plite/test/schema-validation-diagnostics.test.ts', 4],
  ['packages/excalidraw/src/lib/BaseExcalidrawPlugin.spec.ts', 1],
  ['packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx', 12],
  ['packages/table/src/lib/BaseTablePlugin.schema.spec.ts', 5],
  ['packages/tag/src/lib/BaseTagPlugin.spec.tsx', 1],
]);
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
    new Map([['plate:yjs-api-test@1', 4]]),
  ],
  [
    'packages/yjs/test/react-contract.spec.tsx',
    new Map([['plate:yjs-react-contract@1', 1]]),
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
  ) !== 77
) {
  throw new Error('Plate raw schema query allowlist must contain 77 calls.');
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
        (property.computed ? 'schemaIdentity' : undefined);

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
    'schemaIdentity',
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
      ? bindings.getAt(`${optionsPath}.schemaIdentity`, node.start, node)
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
          'schemaIdentity',
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

      if (key === 'schemaIdentity' || isUnresolvedComputedNamedSchema) {
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
          'schemaIdentity',
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

const containsMemberNamed = (node, names) => {
  let found = false;

  walkAst(node, (current) => {
    if (
      (current.type === 'MemberExpression' ||
        current.type === 'OptionalMemberExpression') &&
      names.has(getStaticMemberName(current))
    ) {
      found = true;
    }
  });

  return found;
};

const containsStringLiteral = (node) => {
  let found = false;

  walkAst(node, (current) => {
    if (current.type === 'StringLiteral') found = true;
  });

  return found;
};

const containsCapabilityIdentityFallback = (node) => {
  const current = unwrapTypedExpression(node);

  if (
    current?.type === 'LogicalExpression' ||
    current?.type === 'ConditionalExpression'
  ) {
    return Object.values(current).some(
      (value) =>
        value &&
        typeof value === 'object' &&
        containsCapabilityIdentityFallback(value)
    );
  }
  if (
    current?.type !== 'MemberExpression' &&
    current?.type !== 'OptionalMemberExpression'
  ) {
    return false;
  }
  const owner = unwrapTypedExpression(current.object);

  if (owner?.type === 'Identifier' && owner.name === 'PLUGINS') return true;
  if (getStaticMemberName(current) !== 'name') return false;

  return (
    (owner?.type === 'Identifier' &&
      (pluginOwnerNamePattern.test(owner.name) ||
        pluginPortalOwnerNamePattern.test(owner.name))) ||
    (isCallExpressionNode(owner) && readMemberCallName(owner) === 'plugin')
  );
};

const containsInvalidSchemaIdentityFallback = (node) =>
  containsStringLiteral(node) || containsCapabilityIdentityFallback(node);

const isConsumerPortalSchemaIdentity = (
  node,
  portalBindings = new Set(),
  schemaBindings = new Set(),
  getBinding = (name) => name
) => {
  const current = unwrapTypedExpression(node);

  if (
    (current?.type !== 'MemberExpression' &&
      current?.type !== 'OptionalMemberExpression') ||
    !['key', 'type'].includes(getStaticMemberName(current))
  ) {
    return false;
  }
  const schemaMember = unwrapTypedExpression(current.object);

  if (
    schemaMember?.type === 'Identifier' &&
    schemaBindings.has(getBinding(schemaMember.name, schemaMember))
  ) {
    return true;
  }
  if (
    (schemaMember?.type !== 'MemberExpression' &&
      schemaMember?.type !== 'OptionalMemberExpression') ||
    getStaticMemberName(schemaMember) !== 'schema'
  ) {
    return false;
  }
  const portal = unwrapTypedExpression(schemaMember.object);
  const portalBinding =
    portal?.type === 'Identifier' ? getBinding(portal.name, portal) : undefined;

  return (
    (isCallExpressionNode(portal) && readMemberCallName(portal) === 'plugin') ||
    (portal?.type === 'Identifier' &&
      (portalBindings.has(portalBinding) ||
        (!portalBinding && pluginPortalOwnerNamePattern.test(portal.name))))
  );
};

const containsConsumerPortalSchemaIdentity = (
  node,
  portalBindings,
  schemaBindings,
  getBinding
) => {
  let found = false;

  walkAst(node, (current) => {
    if (
      isConsumerPortalSchemaIdentity(
        current,
        portalBindings,
        schemaBindings,
        getBinding
      )
    ) {
      found = true;
    }
  });

  return found;
};

const isInstalledSchemaIdentityFallback = (
  node,
  portalBindings = new Set(),
  schemaBindings = new Set(),
  getBinding = (name) => name
) => {
  if (
    node?.type === 'LogicalExpression' &&
    ['??', '||'].includes(node.operator)
  ) {
    return (
      (containsConsumerPortalSchemaIdentity(
        node.left,
        portalBindings,
        schemaBindings,
        getBinding
      ) &&
        containsInvalidSchemaIdentityFallback(node.right)) ||
      (containsConsumerPortalSchemaIdentity(
        node.right,
        portalBindings,
        schemaBindings,
        getBinding
      ) &&
        containsInvalidSchemaIdentityFallback(node.left))
    );
  }
  if (node?.type !== 'ConditionalExpression') return false;
  if (!containsMemberNamed(node.test, new Set(['installed']))) return false;

  return (
    (containsConsumerPortalSchemaIdentity(
      node.consequent,
      portalBindings,
      schemaBindings,
      getBinding
    ) &&
      containsInvalidSchemaIdentityFallback(node.alternate)) ||
    (containsConsumerPortalSchemaIdentity(
      node.alternate,
      portalBindings,
      schemaBindings,
      getBinding
    ) &&
      containsInvalidSchemaIdentityFallback(node.consequent))
  );
};

const collectConsumerPluginPortalBindings = (ast, staticStringBindings) => {
  const portalBindings = new Set();
  const schemaBindings = new Set();
  const { findBinding, rootScope, scopeByNode } =
    staticStringBindings.bindingContext;
  const getBinding = (name, node) =>
    findBinding(scopeByNode.get(node) ?? rootScope, name);
  let changed = true;

  while (changed) {
    changed = false;
    walkAst(ast, (node) => {
      if (node.type !== 'VariableDeclarator') return;
      const value = unwrapTypedExpression(node.init);
      const sourceBinding =
        value?.type === 'Identifier'
          ? getBinding(value.name, value)
          : undefined;
      const isPluginPortal =
        (isCallExpressionNode(value) &&
          readMemberCallName(value) === 'plugin') ||
        (value?.type === 'Identifier' &&
          (portalBindings.has(sourceBinding) ||
            (!sourceBinding && pluginPortalOwnerNamePattern.test(value.name))));
      const declaredBinding =
        node.id?.type === 'Identifier'
          ? getBinding(node.id.name, node.id)
          : undefined;

      if (
        declaredBinding &&
        isPluginPortal &&
        !portalBindings.has(declaredBinding)
      ) {
        portalBindings.add(declaredBinding);
        changed = true;
      }
      if (node.id?.type === 'ObjectPattern' && isPluginPortal) {
        for (const property of node.id.properties) {
          if (
            property.type !== 'ObjectProperty' ||
            getPropertyName(property.key) !== 'schema'
          ) {
            continue;
          }
          const binding =
            property.value.type === 'Identifier'
              ? property.value
              : property.value.type === 'AssignmentPattern' &&
                  property.value.left.type === 'Identifier'
                ? property.value.left
                : undefined;

          const resolvedBinding = binding
            ? getBinding(binding.name, binding)
            : undefined;

          if (resolvedBinding && !schemaBindings.has(resolvedBinding)) {
            schemaBindings.add(resolvedBinding);
            changed = true;
          }
        }
      }
      if (node.id?.type !== 'Identifier') return;

      const schemaOwner =
        (value?.type === 'MemberExpression' ||
          value?.type === 'OptionalMemberExpression') &&
        getStaticMemberName(value) === 'schema'
          ? unwrapTypedExpression(value.object)
          : undefined;
      const isPortalSchema =
        (isCallExpressionNode(schemaOwner) &&
          readMemberCallName(schemaOwner) === 'plugin') ||
        (schemaOwner?.type === 'Identifier' &&
          portalBindings.has(getBinding(schemaOwner.name, schemaOwner)));
      const isSchemaAlias =
        value?.type === 'Identifier' &&
        schemaBindings.has(getBinding(value.name, value));

      if (
        declaredBinding &&
        (isPortalSchema || isSchemaAlias) &&
        !schemaBindings.has(declaredBinding)
      ) {
        schemaBindings.add(declaredBinding);
        changed = true;
      }
    });
  }

  return { getBinding, portalBindings, schemaBindings };
};

const isConsumerPortalSchemaMap = (
  node,
  portalBindings = new Set(),
  schemaBindings = new Set(),
  getBinding = (name) => name
) => {
  const current = unwrapTypedExpression(node);

  if (
    current?.type !== 'MemberExpression' &&
    current?.type !== 'OptionalMemberExpression'
  ) {
    return false;
  }
  if (!['element', 'properties'].includes(getStaticMemberName(current))) {
    return false;
  }
  const schemaMember = unwrapTypedExpression(current.object);

  if (
    schemaMember?.type === 'Identifier' &&
    schemaBindings.has(getBinding(schemaMember.name, schemaMember))
  ) {
    return true;
  }

  if (
    (schemaMember?.type !== 'MemberExpression' &&
      schemaMember?.type !== 'OptionalMemberExpression') ||
    getStaticMemberName(schemaMember) !== 'schema'
  ) {
    return false;
  }
  const portal = unwrapTypedExpression(schemaMember.object);
  const portalBinding =
    portal?.type === 'Identifier' ? getBinding(portal.name, portal) : undefined;

  return (
    (isCallExpressionNode(portal) && readMemberCallName(portal) === 'plugin') ||
    (portal?.type === 'Identifier' &&
      (portalBindings.has(portalBinding) ||
        (!portalBinding && pluginPortalOwnerNamePattern.test(portal.name))))
  );
};

const isLiteralArraySpread = (node) =>
  node?.type === 'SpreadElement' &&
  unwrapTypedExpression(node.argument)?.type === 'ArrayExpression';

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

const isExplicitPluginDescriptorAnnotation = (node) => {
  const value = node?.type === 'TSTypeAnnotation' ? node.typeAnnotation : node;
  const typeName =
    value?.type === 'TSTypeReference' && value.typeName?.type === 'Identifier'
      ? value.typeName.name
      : undefined;

  return (
    typeName === 'BasePlugin' ||
    typeName === 'ConfiguredBasePlugin' ||
    typeName === 'ConfiguredPlatePlugin' ||
    typeName === 'PlatePlugin'
  );
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
const isStaticCapabilityDeclaration = (property) =>
  property?.type === 'ObjectProperty' &&
  property.value?.type === 'ObjectExpression';
const getCapabilityFactoryParameterCount = (property) => {
  if (property?.type === 'ObjectMethod') return property.params.length;
  if (property?.type === 'ObjectProperty' && isFunction(property.value)) {
    return property.value.params.length;
  }
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

const getStaticExtensionProperties = (
  contribution,
  valueBindings,
  staticStringBindings,
  position,
  useNode
) => {
  if (valueBindings && staticStringBindings) {
    return resolveStaticObjectProperties(
      contribution,
      valueBindings,
      staticStringBindings,
      new Set(),
      position ?? contribution?.start ?? Number.POSITIVE_INFINITY,
      useNode ?? contribution
    );
  }

  const value = unwrapTypedExpression(contribution);

  if (value?.type === 'ObjectExpression') return value.properties;
  if (isFunction(value)) return inspectContextualConfigure(value).properties;

  return [];
};

const getStaticFunctionResults = (callback) => {
  const body = unwrapTypedExpression(callback?.body);

  if (!body) return [];
  if (body.type !== 'BlockStatement') return [body];

  const results = [];
  const visitReturns = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node !== body && isFunction(node)) return;
    if (node.type === 'ReturnStatement') {
      const result = unwrapTypedExpression(node.argument);

      if (result) results.push(result);

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

  return results;
};

const defaultPluginCreatorNames = new Set([
  'defineBasePlugin',
  'definePlatePlugin',
]);
const defaultPliteExtensionCreatorNames = new Set(['defineExtension']);
const pliteModulePattern = /^@platejs\/plite(?:\/|$)/;
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

const resolveStaticObjectProperties = (
  node,
  valueBindings,
  staticStringBindings,
  seen = new Set(),
  position = node?.start ?? Number.POSITIVE_INFINITY,
  useNode = node
) => {
  const value = unwrapTypedExpression(node);

  if (isFunction(value)) {
    return getStaticFunctionResults(value).flatMap((result) =>
      resolveStaticObjectProperties(
        result,
        valueBindings,
        staticStringBindings,
        new Set(seen),
        result.start ?? position,
        result
      )
    );
  }
  if (value?.type === 'ObjectExpression') {
    return value.properties.flatMap((property) =>
      property.type === 'SpreadElement'
        ? resolveStaticObjectProperties(
            property.argument,
            valueBindings,
            staticStringBindings,
            new Set(seen),
            property.start ?? position,
            property
          )
        : [property]
    );
  }

  const path = getResolvedStaticExpressionPath(
    value,
    staticStringBindings,
    position,
    useNode
  );

  if (!path || seen.has(path)) return [];

  const event = valueBindings.getEventAt(path, position, useNode);

  if (!event) return [];

  const nextSeen = new Set(seen);

  nextSeen.add(path);

  return resolveStaticObjectProperties(
    event.value,
    valueBindings,
    staticStringBindings,
    nextSeen,
    event.position,
    event.node
  );
};

const isFullyResolvedStaticObject = (
  node,
  valueBindings,
  staticStringBindings,
  seen = new Set(),
  position = node?.start ?? Number.POSITIVE_INFINITY,
  useNode = node
) => {
  const value = unwrapTypedExpression(node);

  if (value?.type === 'ObjectExpression') {
    return value.properties.every(
      (property) =>
        property.type !== 'SpreadElement' ||
        isFullyResolvedStaticObject(
          property.argument,
          valueBindings,
          staticStringBindings,
          new Set(seen),
          property.start ?? position,
          property
        )
    );
  }

  const path = getResolvedStaticExpressionPath(
    value,
    staticStringBindings,
    position,
    useNode
  );

  if (!path || seen.has(path)) return false;

  const event = valueBindings.getEventAt(path, position, useNode);

  if (!event) return false;

  const nextSeen = new Set(seen);

  nextSeen.add(path);

  return isFullyResolvedStaticObject(
    event.value,
    valueBindings,
    staticStringBindings,
    nextSeen,
    event.position,
    event.node
  );
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

const collectLocalPliteExtensionCreatorNames = (ast) => {
  const creators = new Set(defaultPliteExtensionCreatorNames);
  const namespaces = new Set(['Plite']);
  const creatorCandidates = [];
  const namespaceCandidates = [];
  const destructuredCandidates = [];
  const addCandidate = (name, value) => {
    if (!name) return;

    creatorCandidates.push({ name, value });
    namespaceCandidates.push({ name, value });
  };
  const addDestructuredCandidates = (pattern, source) => {
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
  const isNamespaceValue = (value) => {
    const current = unwrapTypedExpression(value);

    return current?.type === 'Identifier' && namespaces.has(current.name);
  };
  const isCreatorValue = (value) => {
    const current = unwrapTypedExpression(value);

    if (current?.type === 'Identifier') return creators.has(current.name);
    if (
      current?.type !== 'MemberExpression' &&
      current?.type !== 'OptionalMemberExpression'
    ) {
      return false;
    }

    return (
      getStaticMemberName(current) === 'defineExtension' &&
      isNamespaceValue(current.object)
    );
  };

  walkAst(ast, (node) => {
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
        addCandidate(node.id.name, node.init);
      } else {
        addDestructuredCandidates(node.id, node.init);
      }

      return;
    }
    if (node.type === 'AssignmentExpression' && node.operator === '=') {
      if (node.left?.type === 'Identifier') {
        addCandidate(node.left.name, node.right);
      } else {
        addDestructuredCandidates(node.left, node.right);
      }
    }
  });

  let changed = true;

  while (changed) {
    changed = false;

    for (const candidate of creatorCandidates) {
      if (!creators.has(candidate.name) && isCreatorValue(candidate.value)) {
        creators.add(candidate.name);
        changed = true;
      }
    }
    for (const candidate of namespaceCandidates) {
      if (
        !namespaces.has(candidate.name) &&
        isNamespaceValue(candidate.value)
      ) {
        namespaces.add(candidate.name);
        changed = true;
      }
    }
    for (const candidate of destructuredCandidates) {
      if (!creators.has(candidate.name) && isNamespaceValue(candidate.source)) {
        creators.add(candidate.name);
        changed = true;
      }
    }
  }

  return {
    hasCall(node) {
      if (!isCallExpressionNode(node)) return false;

      const callee = unwrapTypedExpression(node.callee);

      if (callee?.type === 'Identifier') return creators.has(callee.name);
      if (
        callee?.type !== 'MemberExpression' &&
        callee?.type !== 'OptionalMemberExpression'
      ) {
        return false;
      }

      return (
        getStaticMemberName(callee) === 'defineExtension' &&
        isNamespaceValue(callee.object)
      );
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
        getStaticMemberName(current) === exportedName &&
        isNamespace(current.object))
    );
  };

  walkAst(ast, (node) => {
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
      if (!isCallExpressionNode(node)) return false;

      return isCallable(node.callee);
    },
  };
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
      ['defineBasePlugin', 'definePlatePlugin', 'toPlatePlugin'].includes(
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

const getDefineCodecsCall = (property) => {
  if (property?.type !== 'ObjectProperty') return;

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

  if (
    value?.type === 'CallExpression' &&
    value.callee.type === 'Identifier' &&
    value.callee.name === 'defineCodecs'
  ) {
    return value;
  }
};

const isDefineCodecsCall = (property) => !!getDefineCodecsCall(property);

const getOpaqueExtensionStageIdentity = (
  contribution,
  staticStringBindings
) => {
  let value = unwrapTypedExpression(contribution);

  if (isFunction(value)) {
    const results = getStaticFunctionResults(value);

    if (results.length !== 1) return `$returns:${results.length}`;

    value = results[0];
  }
  if (isCallExpressionNode(value)) {
    const factory = getResolvedStaticExpressionPath(
      value.callee,
      staticStringBindings,
      value.start,
      value
    );

    return `$factory:${factory ?? '<dynamic>'}`;
  }
  if (value?.type === 'ArrayExpression') {
    const entries = value.elements.map((element) => {
      const item = unwrapTypedExpression(element);

      if (isCallExpressionNode(item)) {
        const callee = unwrapTypedExpression(item.callee);

        if (isFunction(callee)) {
          const results = getStaticFunctionResults(callee);
          const fields = results.flatMap((result) =>
            result?.type === 'ObjectExpression'
              ? result.properties.map((property) =>
                  property.type === 'SpreadElement'
                    ? '...'
                    : (getResolvedObjectPropertyName(
                        property,
                        staticStringBindings
                      ) ?? '?')
                )
              : [`$${result?.type ?? 'missing'}`]
          );

          return `$iife:${fields.sort().join(',')}`;
        }

        return `$factory:${
          getResolvedStaticExpressionPath(
            item.callee,
            staticStringBindings,
            item.start,
            item
          ) ?? '<dynamic>'
        }`;
      }
      if (item?.type !== 'ObjectExpression') {
        return `$${item?.type ?? 'hole'}`;
      }

      return item.properties
        .map((property) =>
          property.type === 'SpreadElement'
            ? '...'
            : (getResolvedObjectPropertyName(property, staticStringBindings) ??
              '?')
        )
        .sort()
        .join(',');
    });

    return `$array:${entries.join('|')}`;
  }
  if (value?.type === 'ObjectExpression') return '$object';

  const path = getResolvedStaticExpressionPath(
    value,
    staticStringBindings,
    value?.start,
    value
  );

  return path ? `$value:${path}` : `$node:${value?.type ?? 'missing'}`;
};

const getExtensionStageFields = (contribution, staticStringBindings) => {
  const fields = getStaticExtensionProperties(contribution)
    .map((property) =>
      property.type === 'SpreadElement'
        ? '...'
        : (getResolvedObjectPropertyName(property, staticStringBindings) ?? '?')
    )
    .sort();

  return fields.length > 0
    ? fields
    : [getOpaqueExtensionStageIdentity(contribution, staticStringBindings)];
};

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

const getPluginCreatorFromBuilderChain = (node, pluginCreatorNames) => {
  let current = unwrapTypedExpression(node);

  while (isCallExpressionNode(current)) {
    if (getPluginCreatorCallKind(current, pluginCreatorNames)) return current;

    const callee = unwrapTypedExpression(current.callee);

    if (
      callee?.type !== 'MemberExpression' &&
      callee?.type !== 'OptionalMemberExpression'
    ) {
      return;
    }

    current = unwrapTypedExpression(callee.object);
  }
};

const countStageField = (stages, field) =>
  stages.reduce(
    (count, stage) =>
      count +
      stage.reduce((stageCount, signature) => {
        const entries = signature.startsWith('$array:')
          ? signature.slice('$array:'.length).split('|')
          : [signature];

        return (
          stageCount +
          entries.reduce((entryCount, entry) => {
            const fields = entry.startsWith('$iife:')
              ? entry.slice('$iife:'.length).split(',')
              : entry.startsWith('$')
                ? []
                : entry.split(',');

            return (
              entryCount +
              fields.filter((candidate) => candidate === field).length
            );
          }, 0)
        );
      }, 0),
    0
  );

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

  const declaration = node.arguments[1];

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
  const staticStringBindings = collectStaticStringBindings(ast);
  const { getBinding, portalBindings, schemaBindings } =
    collectConsumerPluginPortalBindings(ast, staticStringBindings);
  const localPluginCreatorNames = collectLocalPluginCreatorNames(ast);
  const localPliteExtensionCreatorNames =
    collectLocalPliteExtensionCreatorNames(ast);
  const localReactFactoryNames = collectLocalModuleCallableNames(ast, {
    exportedName: 'react',
    modulePattern: pliteReactModulePattern,
  });
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
  const allowedRawCodecNegativeContractCount =
    intentionalRawCodecNegativeContractCounts.get(file) ?? 0;
  const allowedRuntimeRenderNodeNegativeContractCount =
    intentionalRuntimeRenderNodeNegativeContractCounts.get(file) ?? 0;
  const allowedPliteConfigNegativeContractCount =
    intentionalPliteConfigNegativeContractCounts.get(file) ?? 0;
  const allowedReactFactoryNegativeContractCount =
    intentionalReactFactoryNegativeContractCounts.get(file) ?? 0;
  const allowedRawSchemaQueryCount =
    intentionalRawSchemaQueryCounts.get(file) ?? 0;
  const namedSchemaLineageCounts = new Map();
  let productionExtendChainCount = 0;
  const productionExtendChains = [];
  let pliteConfigNegativeContractCount = 0;
  let reactFactoryNegativeContractCount = 0;
  let rawCodecNegativeContractCount = 0;
  let rawSchemaQueryCount = 0;
  let runtimeRenderNodeNegativeContractCount = 0;

  const report = (node, reason) => issues.push(createIssue(file, node, reason));
  const getAuthorProperties = (value, owner = value) =>
    getStaticExtensionProperties(
      value,
      staticValueBindings,
      staticStringBindings,
      owner?.start ?? value?.start,
      owner
    );
  const externalMarkdownElementNodeNames = new Set([
    'figure',
    'figcaption',
    'image',
    'img',
    'span',
  ]);
  const externalMarkdownNodeSources = new Set([
    'blockquote',
    'br',
    'break',
    'code',
    'definition',
    'del',
    'delete',
    'emphasis',
    'figure',
    'footnoteDefinition',
    'footnoteReference',
    'heading',
    'html',
    'image',
    'imageReference',
    'img',
    'inlineCode',
    'inlineMath',
    'link',
    'linkReference',
    'list',
    'listItem',
    'mark',
    'math',
    'mdxFlowExpression',
    'mdxJsxFlowElement',
    'mdxJsxTextElement',
    'mdxTextExpression',
    'mdxjsEsm',
    'mention',
    'paragraph',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tableCell',
    'tableRow',
    'text',
    'thematicBreak',
    'u',
    'yaml',
  ]);
  const getProperty = (properties, name) =>
    properties.find(
      (property) =>
        getResolvedObjectPropertyName(property, staticStringBindings) === name
    );
  const getSchemaTypeBindings = (value) => {
    const callback = unwrapTypedExpression(value);
    const parameter = unwrapTypedExpression(callback?.params?.[0]);

    if (!isFunction(callback) || parameter?.type !== 'ObjectPattern') {
      return new Set();
    }

    const schemaProperty = getProperty(parameter.properties, 'schema');
    const schemaPattern = unwrapTypedExpression(schemaProperty?.value);

    if (schemaPattern?.type !== 'ObjectPattern') return new Set();

    const typeProperty = getProperty(schemaPattern.properties, 'type');
    const localType = unwrapTypedExpression(typeProperty?.value);

    return new Set(localType?.type === 'Identifier' ? [localType.name] : []);
  };
  const getSchemaObjectBindings = (value) => {
    const callback = unwrapTypedExpression(value);
    const parameter = unwrapTypedExpression(callback?.params?.[0]);

    if (!isFunction(callback) || parameter?.type !== 'ObjectPattern') {
      return new Set();
    }

    const schemaProperty = getProperty(parameter.properties, 'schema');
    const localSchema = unwrapTypedExpression(schemaProperty?.value);

    return new Set(
      localSchema?.type === 'Identifier' ? [localSchema.name] : []
    );
  };
  const getCodecContextSchemaBindings = (property, ownerCallback) => ({
    objects: new Set([
      ...getSchemaObjectBindings(property?.value),
      ...getSchemaObjectBindings(ownerCallback),
    ]),
    types: new Set([
      ...getSchemaTypeBindings(property?.value),
      ...getSchemaTypeBindings(ownerCallback),
    ]),
  });
  const isSchemaTypeBinding = (node, typeBindings, schemaBindings) => {
    const value = unwrapTypedExpression(node);

    if (value?.type === 'Identifier' && typeBindings.has(value.name)) {
      return true;
    }

    if (
      (value?.type === 'MemberExpression' ||
        value?.type === 'OptionalMemberExpression') &&
      getStaticMemberName(value) === 'type'
    ) {
      const owner = unwrapTypedExpression(value.object);

      return owner?.type === 'Identifier' && schemaBindings.has(owner.name);
    }

    return false;
  };
  const getReturnedObjectPropertySets = (callback) => {
    if (!isFunction(unwrapTypedExpression(callback))) return [];

    const collect = (value) => {
      const result = unwrapTypedExpression(value);

      if (result?.type === 'ConditionalExpression') {
        return [...collect(result.consequent), ...collect(result.alternate)];
      }
      if (result?.type !== 'ObjectExpression') return [];

      return [getAuthorProperties(result, callback)];
    };

    return getStaticFunctionResults(unwrapTypedExpression(callback)).flatMap(
      collect
    );
  };
  const getReturnedRawObjectPropertySets = (callback) => {
    if (!isFunction(unwrapTypedExpression(callback))) return [];

    const collect = (value) => {
      const result = unwrapTypedExpression(value);

      if (result?.type === 'ConditionalExpression') {
        return [...collect(result.consequent), ...collect(result.alternate)];
      }
      if (result?.type !== 'ObjectExpression') return [];

      return [result.properties];
    };

    return getStaticFunctionResults(unwrapTypedExpression(callback)).flatMap(
      collect
    );
  };
  const getCodecRulePropertySets = (value, owner) => {
    const rules = unwrapTypedExpression(value);

    if (rules?.type === 'ArrayExpression') {
      return rules.elements
        .filter((element) => !!element && element.type !== 'SpreadElement')
        .map((element) => getAuthorProperties(element, owner))
        .filter((properties) => properties.length > 0);
    }

    const properties = getAuthorProperties(rules, owner);

    return properties.length > 0 ? [properties] : [];
  };
  const reportCustomMarkdownCodecIdentity = (
    authorProperties,
    ownerCallback
  ) => {
    const codecsProperty = getProperty(authorProperties, 'codecs');
    const defineCodecsCall = getDefineCodecsCall(codecsProperty);

    if (
      !defineCodecsCall ||
      ![1, 2].includes(defineCodecsCall.arguments.length)
    ) {
      return;
    }

    const codecProperties = getAuthorProperties(
      defineCodecsCall.arguments.at(-1),
      codecsProperty
    );
    const markdownProperty = getProperty(codecProperties, 'text/markdown');

    if (!markdownProperty || markdownProperty.type !== 'ObjectProperty') {
      return;
    }

    const schemaBindings = getCodecContextSchemaBindings(
      codecsProperty,
      ownerCallback
    );
    const targetsForeignPlugin = defineCodecsCall.arguments.length === 2;

    for (const ruleProperties of getCodecRulePropertySets(
      markdownProperty.value,
      markdownProperty
    )) {
      const kindProperty = getProperty(ruleProperties, 'kind');
      const markProperty = getProperty(ruleProperties, 'mark');
      const fromProperty = getProperty(ruleProperties, 'from');
      const from = unwrapTypedExpression(fromProperty?.value);
      const decodeProperty = getProperty(ruleProperties, 'decode');

      if (
        getStaticString(unwrapTypedExpression(kindProperty?.value)) !==
          'node' ||
        unwrapTypedExpression(markProperty?.value)?.value === true
      ) {
        continue;
      }

      const encodeProperty = getProperty(ruleProperties, 'encode');
      const encodedMdxObjects = getReturnedObjectPropertySets(
        encodeProperty?.value
      ).filter((properties) => {
        const typeProperty = getProperty(properties, 'type');
        const type = getStaticString(
          unwrapTypedExpression(typeProperty?.value)
        );

        return type === 'mdxJsxFlowElement' || type === 'mdxJsxTextElement';
      });
      const encodedNameProperties = encodedMdxObjects
        .map((properties) => getProperty(properties, 'name'))
        .filter(Boolean);
      const fromName = getStaticString(from);
      const hasCustomDecodeSource =
        !!decodeProperty &&
        !!fromProperty &&
        (!fromName || !externalMarkdownNodeSources.has(fromName));
      const hasCustomEncodedName = encodedNameProperties.some((property) => {
        const name = getStaticString(unwrapTypedExpression(property.value));

        return !name || !externalMarkdownElementNodeNames.has(name);
      });

      if (
        targetsForeignPlugin &&
        (hasCustomDecodeSource || hasCustomEncodedName)
      ) {
        report(
          codecsProperty,
          'custom Markdown element codecs must be owned by their target plugin so from, decode, and encode share its resolved schema type; foreign defineCodecs(TargetPlugin, ...) contributions cannot author configurable MDX identity'
        );
        continue;
      }

      if (
        hasCustomDecodeSource &&
        !isSchemaTypeBinding(from, schemaBindings.types, schemaBindings.objects)
      ) {
        report(
          fromProperty ?? decodeProperty,
          'custom Markdown element codecs use the resolved schema type for from; bind schema: { type } in the codec factory and use from: type'
        );
      }

      const decodedObjects = getReturnedObjectPropertySets(
        decodeProperty?.value
      );
      const decodedTypeProperties = decodedObjects
        .map((properties) => getProperty(properties, 'type'))
        .filter(Boolean);
      const decodedSchemaBindings = {
        objects: new Set([
          ...schemaBindings.objects,
          ...getSchemaObjectBindings(decodeProperty?.value),
        ]),
        types: new Set([
          ...schemaBindings.types,
          ...getSchemaTypeBindings(decodeProperty?.value),
        ]),
      };
      const hasInvalidDecodedType = decodedTypeProperties.some(
        (property) =>
          !isSchemaTypeBinding(
            property.value,
            decodedSchemaBindings.types,
            decodedSchemaBindings.objects
          )
      );

      if (
        decodeProperty &&
        ((decodedObjects.length > 0 && decodedTypeProperties.length === 0) ||
          hasInvalidDecodedType)
      ) {
        report(
          decodeProperty ?? fromProperty,
          'custom Markdown element codecs decode to the resolved schema type; return type from the codec schema context'
        );
      }

      if (
        getReturnedRawObjectPropertySets(decodeProperty?.value).some(
          (properties) => {
            const spreadIndex = properties.findLastIndex(
              (property) => property.type === 'SpreadElement'
            );

            if (spreadIndex < 0) return false;

            return ['children', 'type'].some((name) => {
              const index = properties.findIndex(
                (property) =>
                  getResolvedObjectPropertyName(
                    property,
                    staticStringBindings
                  ) === name
              );

              return index >= 0 && index < spreadIndex;
            });
          }
        )
      ) {
        report(
          decodeProperty,
          'Markdown codec attributes cannot override Plate children or schema type; spread parsed properties before structural fields'
        );
      }

      if (
        hasCustomEncodedName &&
        encodedNameProperties.some(
          (property) =>
            !isSchemaTypeBinding(
              property.value,
              schemaBindings.types,
              schemaBindings.objects
            )
        )
      ) {
        report(
          encodeProperty ?? fromProperty,
          'custom Markdown element codecs encode the resolved schema type as the MDX name; use name: type from the codec schema context'
        );
      }
    }
  };
  const isIntentionalRuntimeNegativeDefinitionField = (
    property,
    properties,
    factoryCall
  ) => {
    const key = getResolvedObjectPropertyName(property, staticStringBindings);
    const nameProperty = properties.find(
      (candidate) =>
        getResolvedObjectPropertyName(candidate, staticStringBindings) ===
        'name'
    );
    const name =
      getStaticString(unwrapTypedExpression(factoryCall?.arguments[0])) ??
      (nameProperty?.type === 'ObjectProperty'
        ? getStaticString(unwrapTypedExpression(nameProperty.value))
        : undefined);

    return (
      !!name &&
      !!key &&
      (intentionalRuntimeNegativeDefinitionFields
        .get(file)
        ?.has(`${name}:${key}`) ??
        false)
    );
  };
  const reportPrefixedOnHandlers = (property) => {
    const key = getResolvedObjectPropertyName(property, staticStringBindings);

    if (key !== 'on' || property.type !== 'ObjectProperty') return;

    for (const handler of resolveStaticObjectProperties(
      property.value,
      staticValueBindings,
      staticStringBindings,
      new Set(),
      property.start,
      property
    )) {
      const handlerName = getResolvedObjectPropertyName(
        handler,
        staticStringBindings
      );

      if (prefixedOnListenerPattern.test(handlerName ?? '')) {
        report(
          handler,
          `plugin on listeners are prefixless; use ${handlerName[2].toLowerCase()}${handlerName.slice(3)}`
        );
      }
    }
  };
  const getPropertyFunction = (property) => {
    if (property?.type === 'ObjectMethod') return property;
    if (
      property?.type === 'ObjectProperty' &&
      isFunction(unwrapTypedExpression(property.value))
    ) {
      return unwrapTypedExpression(property.value);
    }
  };
  const reportPliteConfigContext = (property) => {
    const key = getResolvedObjectPropertyName(property, staticStringBindings);

    if (!['activate', 'api', 'schema', 'validate'].includes(key)) return;

    const callback = getPropertyFunction(property);
    const parameter = callback?.params[key === 'activate' ? 1 : 0];

    if (parameter?.type !== 'ObjectPattern') return;

    for (const binding of parameter.properties) {
      if (
        binding.type === 'ObjectProperty' &&
        getResolvedObjectPropertyName(binding, staticStringBindings) ===
          'config'
      ) {
        const isIntentionalNegativeContract =
          key === 'validate' &&
          pliteConfigNegativeContractCount <
            allowedPliteConfigNegativeContractCount &&
          hasPrecedingMarker(
            source,
            property,
            intentionalPliteConfigNegativeMarker
          );

        if (isIntentionalNegativeContract) {
          pliteConfigNegativeContractCount++;
          continue;
        }

        report(
          binding,
          'final Plite schema/API/activation/validation contexts have no config'
        );
      }
    }
  };
  const reportStaleCapabilityFactoryContext = (property) => {
    const key = getResolvedObjectPropertyName(property, staticStringBindings);

    if (!['api', 'read', 'update'].includes(key)) return;

    const callback = getPropertyFunction(property);
    const parameter = callback?.params[0];

    if (parameter?.type !== 'ObjectPattern') return;

    for (const binding of parameter.properties) {
      const bindingName =
        binding.type === 'ObjectProperty'
          ? getResolvedObjectPropertyName(binding, staticStringBindings)
          : undefined;

      if (
        bindingName &&
        staleCapabilityFactoryContextBindings.has(bindingName)
      ) {
        report(binding, `stale ${key} factory context binding ${bindingName}`);
      }
    }
  };
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
  const isCapabilityIdentityExpression = (value) => {
    const current = unwrapTypedExpression(value);

    if (current?.type === 'Identifier') return current.name === 'name';
    if (
      current?.type !== 'MemberExpression' &&
      current?.type !== 'OptionalMemberExpression'
    ) {
      return false;
    }

    const owner = unwrapTypedExpression(current.object);

    if (owner?.type === 'Identifier' && owner.name === 'PLUGINS') return true;
    if (getStaticMemberName(current) !== 'name') return false;
    if (owner?.type === 'Identifier') {
      return (
        pluginOwnerNamePattern.test(owner.name) ||
        pluginPortalOwnerNamePattern.test(owner.name)
      );
    }

    return (
      (isCallExpressionNode(owner) && readMemberCallName(owner) === 'plugin') ||
      getStaticExpressionPath(owner)?.split('.').includes('plugin')
    );
  };
  const containsCapabilityIdentityExpression = (value) => {
    const current = unwrapTypedExpression(value);

    if (isCapabilityIdentityExpression(current)) return true;
    if (current?.type === 'ArrayExpression') {
      return current.elements.some(containsCapabilityIdentityExpression);
    }

    return false;
  };
  const containsRawStringLiteral = (value) => {
    const current = unwrapTypedExpression(value);

    if (current?.type === 'StringLiteral') return true;
    if (current?.type === 'ArrayExpression') {
      return current.elements.some(containsRawStringLiteral);
    }

    return false;
  };
  const isSchemaIdentityMember = (value) => {
    const current = unwrapTypedExpression(value);

    return (
      (current?.type === 'MemberExpression' ||
        current?.type === 'OptionalMemberExpression') &&
      ['key', 'type'].includes(getStaticMemberName(current))
    );
  };

  const visit = (node, ancestors = []) => {
    if (!node || typeof node !== 'object') return;

    if (
      isInstalledSchemaIdentityFallback(
        node,
        portalBindings,
        schemaBindings,
        getBinding
      )
    ) {
      report(
        node,
        'uninstalled plugins have no schema identity; do not replace a missing type or key with a raw string fallback'
      );
    }
    if (
      isConsumerPortalSchemaMap(
        node,
        portalBindings,
        schemaBindings,
        getBinding
      ) &&
      !hasExpectError(source, node)
    ) {
      report(
        node,
        'consumer plugin portals expose only flat schema.type or schema.key; schema.element and schema.properties are author/compiler-only'
      );
    }
    if (isLiteralArraySpread(node)) {
      report(
        node,
        'inline literal array items directly instead of spreading a literal array'
      );
    }

    if (
      node.type === 'VariableDeclarator' &&
      node.id?.type === 'Identifier' &&
      schemaIdentityVariableNamePattern.test(node.id.name) &&
      containsCapabilityIdentityExpression(node.init)
    ) {
      report(
        node.init,
        'element type bindings must not derive from plugin capability names'
      );
    }

    const isMarkedPluginDeclarationStage =
      node.type === 'VariableDeclarator' &&
      node.id?.type === 'Identifier' &&
      hasPrecedingMarker(source, node, intentionalPluginDeclarationStageMarker);

    if (isMarkedPluginDeclarationStage) {
      report(
        node,
        'new plugin declaration stages are forbidden; repair the owning generic or declaration boundary'
      );
    }

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
      node.type === 'TSTypeReference' &&
      node.typeName?.type === 'Identifier' &&
      (node.typeName.name === 'ElementOf' || node.typeName.name === 'TextOf') &&
      (node.typeParameters?.params ?? node.typeArguments?.params)?.some(
        (parameter) =>
          parameter.type === 'TSTypeQuery' &&
          parameter.exprName?.type === 'Identifier' &&
          parameter.exprName.name === 'editor'
      ) &&
      isProductionPluginAuthoringFile(file) &&
      packagePluginSourcePattern.test(file)
    ) {
      report(
        node,
        `${node.typeName.name}<typeof editor> captures the entire installed editor in an inferred plugin declaration; use the owning descriptor or the honest broad Element/Text domain`
      );
    }

    if (
      node.type === 'ImportDeclaration' &&
      baseOrStaticSourcePattern.test(file) &&
      reactPluginEntrypointPattern.test(node.source.value) &&
      !plateReactAdapterEntrypointPattern.test(node.source.value)
    ) {
      report(
        node,
        'static/base modules cannot import a feature package live React plugin'
      );
    }

    if (
      node.type === 'ImportDeclaration' &&
      registryStandaloneEditorTypeSourcePattern.test(file) &&
      node.specifiers.some(
        (specifier) =>
          specifier.type === 'ImportSpecifier' &&
          getPropertyName(specifier.imported) === 'MyEditor'
      )
    ) {
      report(
        node,
        'copied registry items must type against their owned plugin tuple, not the host MyEditor'
      );
    }

    if (
      node.type === 'ImportDeclaration' &&
      baseOrStaticSourcePattern.test(file) &&
      plateReactAdapterEntrypointPattern.test(node.source.value)
    ) {
      report(
        node,
        'static/base modules bind components with terminal BasePlugin.configure({ component }) without platejs/react'
      );
    }

    if (
      node.type === 'ImportDeclaration' &&
      baseOrStaticSourcePattern.test(file) &&
      liveRegistryNodeModulePattern.test(node.source.value)
    ) {
      report(
        node,
        'static/base kits cannot bind live registry node modules; import the static renderer'
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
    if (
      node.type === 'TSTypeAliasDeclaration' &&
      containsDefinitionOfType(node.typeAnnotation) &&
      (!node.id.name.endsWith('Definition') ||
        (isDirectDefinitionOfDescriptor(node.typeAnnotation) &&
          node.id.name.endsWith('PluginDefinition')))
    ) {
      report(
        node.id,
        'aliases derived with DefinitionOf use FooDefinition, never FooPluginDefinition'
      );
    }
    if (
      node.type === 'VariableDeclarator' &&
      node.id?.type === 'Identifier' &&
      node.id.name.endsWith('Plugin') &&
      isExplicitPluginDescriptorAnnotation(node.id.typeAnnotation) &&
      ancestors.some(
        (ancestor) => ancestor.type === 'ExportNamedDeclaration'
      ) &&
      isPackagePluginDefinitionSource(file)
    ) {
      report(
        node.id,
        'exported package plugins infer their exact descriptor; do not force BasePlugin or PlatePlugin annotations'
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
      report(
        node,
        'EditorExtension exposes one public Definition generic; transitive dependency requirements stay private'
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
      report(
        node,
        'EditorExtensionDependencyReference is a shallow non-generic root identity; capability/provider contracts stay internal'
      );
    }
    if (
      node.type === 'ImportDeclaration' &&
      pliteRootModulePattern.test(node.source.value)
    ) {
      for (const specifier of node.specifiers) {
        if (
          specifier.type === 'ImportSpecifier' &&
          internalPliteContractTypeSymbols.has(
            getPropertyName(specifier.imported)
          )
        ) {
          report(
            specifier,
            `${getPropertyName(specifier.imported)} is internal dependency typing; import it from @platejs/plite/internal`
          );
        }
      }
    }
    if (
      node.type === 'ImportDeclaration' &&
      publicCoreModulePattern.test(node.source.value)
    ) {
      for (const specifier of node.specifiers) {
        if (
          specifier.type === 'ImportSpecifier' &&
          internalCoreContractTypeSymbols.has(
            getPropertyName(specifier.imported)
          )
        ) {
          report(
            specifier,
            `${getPropertyName(specifier.imported)} is an internal Core author-to-canonical carrier and cannot be imported from a public entrypoint`
          );
        }
        if (
          specifier.type === 'ImportSpecifier' &&
          internalCoreCompilerTypeSymbols.has(
            getPropertyName(specifier.imported)
          )
        ) {
          report(
            specifier,
            `${getPropertyName(specifier.imported)} is internal Core compiler typing and cannot be imported from a public entrypoint`
          );
        }
      }
    }
    if (
      node.type === 'ExportNamedDeclaration' &&
      node.source &&
      pliteRootModulePattern.test(node.source.value)
    ) {
      for (const specifier of node.specifiers) {
        const exportedName = getPropertyName(specifier.local);

        if (internalPliteContractTypeSymbols.has(exportedName)) {
          report(
            specifier,
            `${exportedName} is internal dependency typing; re-export it only from @platejs/plite/internal`
          );
        }
      }
    }
    if (
      file === 'packages/plite/src/index.ts' &&
      node.type === 'ExportSpecifier'
    ) {
      const exportedName = getPropertyName(node.local);

      if (internalPliteContractTypeSymbols.has(exportedName)) {
        report(
          node,
          `${exportedName} is internal dependency typing and cannot be root-exported`
        );
      }
    }
    if (
      file === 'packages/core/src/index.ts' &&
      node.type === 'ExportSpecifier'
    ) {
      const exportedName = getPropertyName(node.local);

      if (internalCoreContractTypeSymbols.has(exportedName)) {
        report(
          node,
          `${exportedName} is internal Core author-to-canonical typing and cannot be root-exported`
        );
      }
    }
    if (
      file === 'packages/core/src/internal/index.ts' &&
      node.type === 'ExportSpecifier'
    ) {
      const exportedName = getPropertyName(node.local);

      if (privateCoreDefinitionCarrierSymbols.has(exportedName)) {
        report(
          node,
          `${exportedName} is a private definition carrier; DefinitionOf is the sole public extractor`
        );
      }
    }
    if (
      file.startsWith('packages/core/src/') &&
      !file.includes('.internal.') &&
      node.type === 'ExportSpecifier'
    ) {
      const exportedName = getPropertyName(node.local);

      if (internalCoreCompilerTypeSymbols.has(exportedName)) {
        report(
          node,
          `${exportedName} is internal Core compiler typing and cannot be public-exported`
        );
      }
    }
    if (
      file.startsWith('packages/core/src/') &&
      !file.includes('.internal.') &&
      node.type === 'ExportAllDeclaration' &&
      node.source.value.includes('.internal')
    ) {
      report(
        node,
        'public Core barrels cannot star-export internal compiler modules'
      );
    }
    if (
      node.type === 'TSTypeAliasDeclaration' &&
      internalCoreCompilerTypeSymbols.has(node.id.name) &&
      ancestors.some(
        (ancestor) => ancestor.type === 'ExportNamedDeclaration'
      ) &&
      !file.includes('.internal.')
    ) {
      report(
        node.id,
        `${node.id.name} is a Core compiler alias and must be declared only in an internal module`
      );
    }
    if (
      (node.type === 'CallExpression' ||
        node.type === 'OptionalCallExpression') &&
      localReactFactoryNames.hasCall(node)
    ) {
      const options = node.arguments.length === 1 ? node.arguments[0] : null;
      const properties = options
        ? getAuthorProperties(options, node).filter(
            (property) => property.type !== 'SpreadElement'
          )
        : [];
      const propertyNames = properties.map((property) =>
        getResolvedObjectPropertyName(property, staticStringBindings)
      );

      if (
        properties.length !== 1 ||
        propertyNames[0] !== 'dom' ||
        node.arguments.length !== 1 ||
        !isFullyResolvedStaticObject(
          options,
          staticValueBindings,
          staticStringBindings,
          new Set(),
          node.start,
          node
        )
      ) {
        const isIntentionalNegativeContract =
          reactFactoryNegativeContractCount <
            allowedReactFactoryNegativeContractCount &&
          hasPrecedingMarker(
            source,
            node,
            intentionalReactFactoryNegativeMarker
          );

        if (isIntentionalNegativeContract) {
          reactFactoryNegativeContractCount++;
        } else {
          report(
            node,
            'react requires exactly one { dom } object containing the exact DOM descriptor'
          );
        }
      }
    }
    if (
      node.type === 'CallExpression' ||
      node.type === 'OptionalCallExpression'
    ) {
      const calleePath = getStaticExpressionPath(node.callee);

      if (
        (calleePath === 'target.type' || calleePath === 'target.types') &&
        node.arguments.some(containsCapabilityIdentityExpression)
      ) {
        report(
          node,
          'schema targets must use element types or property keys, not plugin capability names'
        );
      }
      if (
        calleePath === 'schema.handle.element' &&
        containsCapabilityIdentityExpression(node.arguments[1])
      ) {
        report(
          node,
          'schema handles must use an element type, not a plugin capability name'
        );
      }
      if (
        schemaTypeOperationNamePattern.test(calleePath ?? '') &&
        node.arguments.some(containsCapabilityIdentityExpression)
      ) {
        report(
          node,
          'node type operations must use element types, not plugin capability names'
        );
      }
    }
    if (
      node.type === 'Identifier' &&
      node.name === 'editorExtensionDefinition' &&
      file !== plitePrivateWitnessOwner &&
      (file.startsWith('packages/') || file.startsWith('apps/'))
    ) {
      report(node, 'private Plite definition witness leaked outside its owner');
    }
    if (node.type === 'Identifier') {
      const parent = ancestors.at(-1);
      const isDeletedTypeReference =
        deletedPluginTypeSymbols.has(node.name) &&
        ((parent?.type === 'TSTypeReference' && parent.typeName === node) ||
          (parent?.type === 'ImportSpecifier' &&
            plateModulePattern.test(ancestors.at(-2)?.source?.value ?? '') &&
            (parent.imported === node || parent.local === node)));
      const deletedContractMemberOwner =
        (parent?.type === 'MemberExpression' ||
          parent?.type === 'OptionalMemberExpression') &&
        parent.property === node
          ? getStaticExpressionPath(parent.object)
          : undefined;
      const isDeletedContractMember =
        deletedPluginContractMemberKeys.has(node.name) &&
        ((deletedContractMemberOwner !== undefined &&
          pluginDescriptorOwnerPathPattern.test(deletedContractMemberOwner)) ||
          (parent?.type === 'TSPropertySignature' && parent.key === node));

      if (
        (isDeletedTypeReference || isDeletedContractMember) &&
        (file.startsWith('packages/') || file.startsWith('apps/'))
      ) {
        report(node, `deleted Plate plugin contract symbol ${node.name}`);
      }
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

    if (
      (node.type === 'MemberExpression' ||
        node.type === 'OptionalMemberExpression') &&
      node.computed &&
      getStaticMemberName(unwrapTypedExpression(node.object)) ===
        'properties' &&
      getStaticMemberName(
        unwrapTypedExpression(unwrapTypedExpression(node.object)?.object)
      ) === 'schema' &&
      getStaticExpressionPath(node.property)?.endsWith('.name')
    ) {
      report(
        node,
        'schema property local ids must be explicit; plugin capability names are not property keys'
      );
    }

    if (
      (node.type === 'MemberExpression' ||
        node.type === 'OptionalMemberExpression') &&
      !node.computed
    ) {
      const memberName = getStaticMemberName(node);
      const memberOwner = unwrapTypedExpression(node.object);
      const isUniversalPluginIdentity =
        (memberName === 'key' || memberName === 'type') &&
        ((memberOwner?.type === 'Identifier' &&
          platePluginFactoryNamePattern.test(memberOwner.name)) ||
          (isCallExpressionNode(memberOwner) &&
            readMemberCallName(memberOwner) === 'plugin'));

      if (isUniversalPluginIdentity && !hasExpectError(source, node)) {
        report(
          node,
          `plugins do not expose universal ${memberName}; use the installed schema handle`
        );
      }

      if (
        packageTestSourcePattern.test(file) &&
        getStaticExpressionPath(node) === 'editor.tx'
      ) {
        report(
          node,
          'test fixtures use the canonical root editor.update channel'
        );
      }

      if (getStaticExpressionPath(node) === 'editor.api.clipboard') {
        report(
          node,
          'DOM clipboard APIs project through editor.api.dom.clipboard'
        );
      }

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
      const parentObject = ancestors.at(-1);
      const isElementSourceMarker =
        file === 'packages/plite/src/core/schema-definition.ts' &&
        key === 'type' &&
        parentObject?.type === 'ObjectExpression' &&
        getObjectProperty(parentObject, 'source');

      if (
        !isElementSourceMarker &&
        (key === 'type' ||
          (key === 'key' &&
            !ancestors
              .at(-1)
              ?.properties?.some(
                (property) => property.type === 'SpreadElement'
              ))) &&
        containsCapabilityIdentityExpression(node.value)
      ) {
        report(
          node.value,
          `persisted ${key} must use a schema identity, not a plugin capability name`
        );
      }
      const nodeComponent =
        key === 'render' && node.value?.type === 'ObjectExpression'
          ? getObjectProperty(node.value, 'node')
          : undefined;
      const isIntentionalTypedNegativeRenderNode =
        file === intentionalRenderNodeNegativeContract &&
        nodeComponent &&
        hasExpectError(source, nodeComponent) &&
        ancestors.some(
          (ancestor) =>
            ancestor.type === 'CallExpression' &&
            ((ancestor.callee.type === 'Identifier' &&
              ancestor.callee.name === 'toPlatePlugin') ||
              !!getPluginCreatorCallKind(ancestor, localPluginCreatorNames))
        );
      const isIntentionalRuntimeNegativeRenderNode =
        nodeComponent &&
        runtimeRenderNodeNegativeContractCount <
          allowedRuntimeRenderNodeNegativeContractCount &&
        hasPrecedingMarker(
          source,
          nodeComponent,
          intentionalRuntimeRenderNodeNegativeMarker
        ) &&
        ancestors.some(
          (ancestor) =>
            ancestor.type === 'CallExpression' &&
            ancestor.callee.type === 'MemberExpression' &&
            !ancestor.callee.computed &&
            ancestor.callee.object.type === 'Identifier' &&
            ancestor.callee.object.name === 'Reflect' &&
            getPropertyName(ancestor.callee.property) === 'apply' &&
            ancestor.arguments[0]?.type === 'Identifier' &&
            ancestor.arguments[0].name === 'defineBasePlugin'
        );

      if (isIntentionalRuntimeNegativeRenderNode) {
        runtimeRenderNodeNegativeContractCount++;
      }

      if (
        nodeComponent &&
        !internalRenderNodeOwners.has(file) &&
        !isIntentionalTypedNegativeRenderNode &&
        !isIntentionalRuntimeNegativeRenderNode
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
        key === 'targetPlugins' &&
        isInsidePluginInitialState(ancestors, localPluginCreatorNames)
      ) {
        report(
          node,
          'schema target descriptors belong in top-level targetPlugins'
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
      const memberCallOwnerPath = getStaticExpressionPath(memberCallOwner);
      const callsLikelyPluginClone =
        memberCallName !== 'clone' ||
        callsLocallyCreatedPluginDescriptor ||
        pluginDescriptorOwnerPathPattern.test(memberCallOwnerPath ?? '');

      if (
        memberCallName === 'assign' &&
        getStaticExpressionPath(node.callee.object) === 'Object' &&
        getStaticExpressionPath(node.arguments[0]) === 'editor.api'
      ) {
        report(
          node,
          'extension APIs project through editor.api.<name>, not Object.assign(editor.api, extensionApi)'
        );
      }

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

      const configuresComponent =
        memberCallName === 'configure' &&
        getAuthorProperties(node.arguments[0], node).some(
          (property) =>
            getResolvedObjectPropertyName(property, staticStringBindings) ===
            'component'
        );
      const configuresConvertedBaseDescriptor =
        memberCallOwner?.type === 'CallExpression' &&
        (memberCallOwner.callee.type === 'Identifier'
          ? memberCallOwner.callee.name === 'toPlatePlugin'
          : getStaticMemberName(memberCallOwner.callee) === 'toPlatePlugin');
      const configureOwnerName = memberCallOwnerPath?.split('.').at(-1);
      const configureOwnerCreator = getPluginCreatorFromBuilderChain(
        memberCallOwner,
        localPluginCreatorNames
      );
      const configuresBaseDescriptor =
        basePluginDescriptorNamePattern.test(configureOwnerName ?? '') ||
        getPluginCreatorCallKind(
          configureOwnerCreator,
          localPluginCreatorNames
        ) === 'defineBasePlugin';

      if (
        configuresComponent &&
        configuresConvertedBaseDescriptor &&
        isProductionPluginAuthoringFile(file) &&
        (file.startsWith('apps/') || file.startsWith('packages/'))
      ) {
        report(
          node,
          'terminal consumers configure the Base descriptor directly; owning React adapters pass component to toPlatePlugin() while publishing the Plate descriptor'
        );
      } else if (
        baseOrStaticSourcePattern.test(file) &&
        configuresComponent &&
        configuresConvertedBaseDescriptor
      ) {
        report(
          node,
          'static/base component bindings use BasePlugin.configure({ component }) without a Plate React adapter'
        );
      }

      if (
        baseOrStaticSourcePattern.test(file) &&
        configuresComponent &&
        !configuresConvertedBaseDescriptor &&
        !configuresBaseDescriptor
      ) {
        report(
          node,
          'static/base component bindings require the owning BasePlugin and its terminal .configure({ component })'
        );
      }

      if (
        memberCallName &&
        deletedPluginBuilderMethods.has(memberCallName) &&
        callsLikelyPluginClone &&
        !isForeignStoreSelectorExtension(node, file)
      ) {
        report(
          node,
          memberCallName === 'withComponent'
            ? 'deleted plugin builder .withComponent(); use root-level component'
            : `deleted plugin builder .${memberCallName}(); use constructor fields or .extend() only for imported/prebuilt adaptation or a real staged dependency`
        );
      }

      if (
        memberCallName === 'getApi' &&
        memberCallOwner?.type === 'Identifier' &&
        memberCallOwner.name === 'editor'
      ) {
        report(
          node,
          'extension APIs use editor.api.<name> or editor.extension(Extension).api'
        );
      }

      if (memberCallName === 'extend' && isCallExpressionNode(node)) {
        const authorProperties = getAuthorProperties(node.arguments[0], node);

        reportCustomMarkdownCodecIdentity(authorProperties, node.arguments[0]);

        for (const property of authorProperties) {
          const key = getResolvedObjectPropertyName(
            property,
            staticStringBindings
          );

          reportPrefixedOnHandlers(property);
          reportStaleCapabilityFactoryContext(property);

          if (
            key &&
            deletedPlatePluginDefinitionKeys.has(key) &&
            !hasExpectError(source, property)
          ) {
            report(property, `deleted Plate plugin definition field ${key}`);
          }

          if (
            key === 'component' &&
            (callsLocallyCreatedPluginDescriptor ||
              pluginDescriptorOwnerPathPattern.test(
                memberCallOwnerPath ?? ''
              )) &&
            !(
              file === intentionalRenderNodeNegativeContract &&
              hasExpectError(source, node)
            )
          ) {
            report(
              property,
              'plugin .extend() cannot define component; use the constructor default or terminal .configure({ component }) replacement'
            );
          }

          if (
            key &&
            factoryOnlyCapabilityKeys.has(key) &&
            isStaticCapabilityDeclaration(property)
          ) {
            report(property, `plugin ${key} must be declared as a factory`);
          }

          if (
            key === 'api' &&
            (getCapabilityFactoryParameterCount(property) ?? 0) > 1
          ) {
            report(property, 'plugin api factory receives one context object');
          }

          if (key !== 'codecs') {
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
          const creator = getPluginCreatorFromBuilderChain(
            node,
            localPluginCreatorNames
          );
          const authorStages = creator
            ? [
                getExtensionStageFields(
                  creator.arguments[1],
                  staticStringBindings
                ),
                ...stages,
              ]
            : stages;

          productionExtendChainCount++;
          productionExtendChains.push(stages);

          if (countStageField(authorStages, 'commands') > 1) {
            report(
              node,
              'replacement plugin commands must have one ordered owner factory; .extend() does not concatenate command declarations'
            );
          }

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

      if (memberCallName === 'configure' && isCallExpressionNode(node)) {
        for (const property of getAuthorProperties(node.arguments[0], node)) {
          const key = getResolvedObjectPropertyName(
            property,
            staticStringBindings
          );

          reportPrefixedOnHandlers(property);
          reportStaleCapabilityFactoryContext(property);

          if (
            key &&
            deletedPlatePluginDefinitionKeys.has(key) &&
            !hasExpectError(source, property)
          ) {
            report(property, `deleted Plate plugin definition field ${key}`);
          }

          if (key === 'api') {
            report(
              property,
              'plugin api is an author factory and cannot be configured'
            );
          }
        }
      }

      if (pluginCreatorKind && !isIntentionalRuntimeNegativeConstructor) {
        if (node.arguments.length !== 2) {
          report(node, `${pluginCreatorKind} requires (name, definition)`);
        }
        const authorProperties = getAuthorProperties(node.arguments[1], node);

        reportCustomMarkdownCodecIdentity(authorProperties, node.arguments[1]);

        if (
          (node.typeParameters?.params.length > 0 ||
            node.typeArguments?.params.length > 0) &&
          !hasExpectError(source, node)
        ) {
          report(
            node,
            'Plate plugin factories infer one definition from the author object'
          );
        }

        for (const property of authorProperties) {
          const key =
            property.type === 'ObjectProperty' ||
            property.type === 'ObjectMethod'
              ? getResolvedObjectPropertyName(property, staticStringBindings)
              : undefined;

          reportPrefixedOnHandlers(property);
          reportStaleCapabilityFactoryContext(property);

          if (
            key &&
            deletedPlatePluginDefinitionKeys.has(key) &&
            !hasExpectError(source, property)
          ) {
            report(property, `deleted Plate plugin definition field ${key}`);
          }

          if (
            key &&
            factoryOnlyCapabilityKeys.has(key) &&
            isStaticCapabilityDeclaration(property) &&
            !isIntentionalRuntimeNegativeDefinitionField(
              property,
              authorProperties,
              node
            )
          ) {
            report(property, `plugin ${key} must be declared as a factory`);
          }

          if (
            key === 'api' &&
            (getCapabilityFactoryParameterCount(property) ?? 0) > 1
          ) {
            report(property, 'plugin api factory receives one context object');
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

      if (localPliteExtensionCreatorNames.hasCall(node)) {
        if (node.arguments.length !== 2) {
          report(node, 'defineExtension requires (name, definition)');
        }
        if (
          node.typeParameters?.params.length > 0 ||
          node.typeArguments?.params.length > 0
        ) {
          report(
            node,
            'defineExtension infers one definition from its author object'
          );
        }

        if (node.arguments[1]) {
          for (const property of getAuthorProperties(node.arguments[1], node)) {
            const key =
              property.type === 'ObjectProperty' ||
              property.type === 'ObjectMethod'
                ? getResolvedObjectPropertyName(property, staticStringBindings)
                : undefined;

            reportPrefixedOnHandlers(property);
            reportPliteConfigContext(property);
            reportStaleCapabilityFactoryContext(property);

            if (key && deletedPliteExtensionDefinitionKeys.has(key)) {
              report(
                property,
                `deleted Plite extension definition field ${key}`
              );
            }

            if (
              key &&
              factoryOnlyCapabilityKeys.has(key) &&
              isStaticCapabilityDeclaration(property)
            ) {
              report(
                property,
                `extension ${key} must be declared as a factory`
              );
            }

            if (
              key === 'api' &&
              (getCapabilityFactoryParameterCount(property) ?? 0) > 1
            ) {
              report(
                property,
                'extension api factory receives one context object'
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
        ((isSchemaApiCall(node, 'getProperty') ||
          isSchemaApiCall(node, 'getElementProperty')) &&
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
              'contextual plugin configure only accepts explicit initialState, on, override, render, and shortcuts overrides'
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

    if (
      node.type === 'BinaryExpression' &&
      ((isSchemaIdentityMember(node.left) &&
        containsCapabilityIdentityExpression(node.right)) ||
        (isSchemaIdentityMember(node.right) &&
          containsCapabilityIdentityExpression(node.left)))
    ) {
      report(
        node,
        'schema identity comparisons must not use plugin capability names'
      );
    }
    if (
      node.type === 'BinaryExpression' &&
      registryProductionSourcePattern.test(file) &&
      !packageTestSourcePattern.test(file)
    ) {
      for (const [identity, literal] of [
        [node.left, node.right],
        [node.right, node.left],
      ]) {
        if (
          unwrapTypedExpression(literal)?.type === 'StringLiteral' &&
          registrySchemaIdentityOwnerPathPattern.test(
            getStaticExpressionPath(unwrapTypedExpression(identity)) ?? ''
          )
        ) {
          report(
            node,
            'registry runtime schema identity comparisons must use an editor plugin portal'
          );
          break;
        }
      }
    }

    if (
      node.type === 'MemberExpression' &&
      registryProductionSourcePattern.test(file) &&
      !packageTestSourcePattern.test(file) &&
      registryRenderContributionPluginTypePattern.test(
        getStaticExpressionPath(unwrapTypedExpression(node)) ?? ''
      )
    ) {
      report(
        node,
        'registry render contribution plugins do not own element types; compare element.type to an editor plugin portal type'
      );
    }

    if (
      node.type === 'ObjectProperty' &&
      registryProductionSourcePattern.test(file) &&
      !packageTestSourcePattern.test(file)
    ) {
      const key = getResolvedObjectPropertyName(node, staticStringBindings);
      const containerProperty = ancestors.at(-2);
      const outerProperty = ancestors.at(-4);
      const containerKey =
        containerProperty?.type === 'ObjectProperty'
          ? getResolvedObjectPropertyName(
              containerProperty,
              staticStringBindings
            )
          : undefined;
      const outerKey =
        outerProperty?.type === 'ObjectProperty'
          ? getResolvedObjectPropertyName(outerProperty, staticStringBindings)
          : undefined;

      if (
        key === 'type' &&
        containsRawStringLiteral(node.value) &&
        containerKey === 'match'
      ) {
        report(
          node.value,
          'registry runtime node matchers must use editor plugin portal types'
        );
      }
      if (key === 'plainMarks' && containsRawStringLiteral(node.value)) {
        report(
          node.value,
          'registry Markdown plain marks must use exact plugin property keys'
        );
      }
      if (
        !node.computed &&
        outerKey === 'override' &&
        (containerKey === 'components' || containerKey === 'plugins')
      ) {
        report(
          node,
          `registry override.${containerKey} keys must use plugin references or PLUGINS capability names`
        );
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
  if (
    runtimeRenderNodeNegativeContractCount <
    allowedRuntimeRenderNodeNegativeContractCount
  ) {
    report(
      ast,
      `runtime render.node negative-contract allowlist expects ${allowedRuntimeRenderNodeNegativeContractCount} marked declaration${allowedRuntimeRenderNodeNegativeContractCount === 1 ? '' : 's'} but found ${runtimeRenderNodeNegativeContractCount}`
    );
  }
  if (
    pliteConfigNegativeContractCount < allowedPliteConfigNegativeContractCount
  ) {
    issues.push(
      createIssue(
        file,
        ast.program,
        `Plite config negative-contract allowlist expects ${allowedPliteConfigNegativeContractCount} marked declaration${allowedPliteConfigNegativeContractCount === 1 ? '' : 's'} but found ${pliteConfigNegativeContractCount}`
      )
    );
  }
  if (
    reactFactoryNegativeContractCount < allowedReactFactoryNegativeContractCount
  ) {
    issues.push(
      createIssue(
        file,
        ast.program,
        `React factory negative-contract allowlist expects ${allowedReactFactoryNegativeContractCount} marked call${allowedReactFactoryNegativeContractCount === 1 ? '' : 's'} but found ${reactFactoryNegativeContractCount}`
      )
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
  const auditsCurrentPluginRendererProse =
    file.startsWith('.changeset/') ||
    (file.startsWith('content/docs/') &&
      !file.startsWith('content/docs/migration/'));

  if (auditsCurrentPluginRendererProse) {
    const terminalComponentConversion =
      terminalComponentConversionPattern.exec(source);

    if (terminalComponentConversion?.index !== undefined) {
      issues.push({
        column: 1,
        file,
        line: source.slice(0, terminalComponentConversion.index).split('\n')
          .length,
        reason:
          'terminal consumers configure the Base descriptor directly; owning React adapters pass component to toPlatePlugin() while publishing the Plate descriptor',
      });
    }

    const baseExtendComponent = basePluginExtendComponentPattern.exec(source);

    if (baseExtendComponent?.index !== undefined) {
      issues.push({
        column: 1,
        file,
        line: source.slice(0, baseExtendComponent.index).split('\n').length,
        reason:
          'Base plugin .extend() cannot define component; use the constructor default or terminal .configure({ component }) replacement',
      });
    }

    const staticBaseKitReactAdapter =
      staticBaseKitReactAdapterPattern.exec(source);

    if (staticBaseKitReactAdapter?.index !== undefined) {
      issues.push({
        column: 1,
        file,
        line: source.slice(0, staticBaseKitReactAdapter.index).split('\n')
          .length,
        reason:
          'static/base kits declare or configure component on the Base descriptor without platejs/react',
      });
    }
  }

  if (file.startsWith('.changeset/') || file.startsWith('content/')) {
    for (const match of source.matchAll(staticPluginApiReferencePattern)) {
      issues.push({
        column: 1,
        file,
        line: source.slice(0, match.index).split('\n').length,
        reason:
          'release prose uses an installed editor portal instead of static FooPlugin.api',
      });
    }
  }

  for (const fence of extractJavaScriptCodeFences(source)) {
    const staticEditorBaseReactAdapter = auditsCurrentPluginRendererProse
      ? staticEditorBaseReactAdapterPattern.exec(fence.code)
      : undefined;

    if (staticEditorBaseReactAdapter?.index !== undefined) {
      issues.push({
        column: 1,
        file,
        line:
          fence.line +
          fence.code.slice(0, staticEditorBaseReactAdapter.index).split('\n')
            .length -
          1,
        reason:
          'static editors use terminal BasePlugin.configure({ component }) without platejs/react; toPlatePlugin(BasePlugin) is for live React',
      });
    }

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
    const { getBinding, portalBindings, schemaBindings } =
      collectConsumerPluginPortalBindings(ast, staticStringBindings);
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
      if (
        isInstalledSchemaIdentityFallback(
          node,
          portalBindings,
          schemaBindings,
          getBinding
        )
      ) {
        issues.push({
          ...createIssue(
            file,
            node,
            'uninstalled plugins have no schema identity; do not replace a missing type or key with a raw string fallback'
          ),
          line: fence.line + (node.loc?.start.line ?? 1) - 1,
        });
      }
      if (isLiteralArraySpread(node)) {
        issues.push({
          ...createIssue(
            file,
            node,
            'inline literal array items directly instead of spreading a literal array'
          ),
          line: fence.line + (node.loc?.start.line ?? 1) - 1,
        });
      }
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
