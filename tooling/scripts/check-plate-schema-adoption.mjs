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
const liveRegistryNodeModulePattern = /^@\/registry\/ui\/.*-node$/;
const historicalOrGeneratedSourcePattern =
  /(?:^|\/)(?:generated|historical)(?:\/|$)|^(?:apps\/www\/public|templates)\//;
const intentionalProductionExtendStageChains = new Map([
  [
    'packages/core/src/lib/plugins/affinity/AffinityPlugin.ts',
    [[['extension']]],
  ],
  [
    'packages/core/src/lib/plugins/override/OverridePlugin.ts',
    [[['extension']]],
  ],
  ['packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts', [[['shortcuts']]]],
  [
    'packages/code-block/src/lib/BaseCodeBlockPlugin.ts',
    [[['shortcuts']], [['decorate', 'extension']]],
  ],
  ['packages/comment/src/lib/BaseCommentPlugin.ts', [[['update']]]],
  ['packages/indent/src/lib/BaseIndentPlugin.ts', [[['shortcuts']]]],
  ['packages/layout/src/lib/BaseColumnPlugin.ts', [[['shortcuts']]]],
  [
    'packages/list/src/lib/BaseListPlugin.tsx',
    [[['override', 'update'], ['extension']]],
  ],
  [
    'packages/list-classic/src/lib/BaseListPlugin.ts',
    [[['read'], ['update'], ['extension']]],
  ],
  ['packages/link/src/lib/BaseLinkPlugin.ts', [[['extension', 'update']]]],
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
    'packages/ai/src/react/copilot/CopilotPlugin.tsx',
    [[['api'], ['extension', 'handlers', 'render', 'selectors', 'shortcuts']]],
  ],
  [
    'packages/ai/src/react/ai-chat/AIChatPlugin.ts',
    [[['api', 'read', 'selectors', 'update'], ['extension']]],
  ],
  [
    'packages/suggestion/src/lib/BaseSuggestionPlugin.ts',
    [[['read'], ['update'], ['extension']]],
  ],
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
  ['packages/ai/src/lib/BaseAIPlugin.preview.spec.ts', 6],
  ['packages/basic-styles/src/lib/BaseLineHeightPlugin.spec.ts', 2],
  ['packages/basic-styles/src/lib/BaseTextAlignPlugin.spec.ts', 2],
  ['packages/basic-styles/src/lib/BaseTextIndentPlugin.spec.ts', 2],
  ['packages/comment/src/lib/BaseCommentPlugin.spec.ts', 5],
  ['packages/core/src/lib/plugins/element-state/ElementStatePlugin.ts', 1],
  ['packages/core/src/lib/plugins/html/HtmlPlugin.ts', 5],
  ['packages/plite/test/editor-foundation-contract.ts', 2],
  ['packages/plite/test/schema-contract.ts', 5],
  ['packages/plite/test/schema-inference-contract.ts', 2],
  ['packages/plite/test/schema-validation-diagnostics.test.ts', 4],
  ['packages/suggestion/src/lib/BaseSuggestionPlugin.spec.ts', 12],
  ['packages/table/src/lib/BaseTablePlugin.schema.spec.ts', 5],
]);
const intentionalExplicitSchemaFactoryCounts = new Map([
  ['packages/core/src/internal/plugin/compilePlateModel.spec.ts', 1],
  ['packages/core/src/lib/plugin/createBasePlugin.spec.ts', 1],
  ['packages/core/src/lib/plugin/createBasePlugin.typed.spec.ts', 1],
]);
const intentionalNamedSchemaLineages = new Map([
  [
    'packages/core/src/react/editor/TPlateEditorCore.spec.ts',
    new Map([['persisted-document@7', 1]]),
  ],
  [
    'packages/core/src/lib/editor/withPlite.slow.ts',
    new Map([['plate-core-test@4', 1]]),
  ],
  [
    'packages/core/src/internal/plugin/plateModelPublication.spec.ts',
    new Map([['plate-test:core:internal-plugin-identity-snapshot@1', 1]]),
  ],
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
  'packages/core/src/internal/plugin/plateModelPublication.spec.ts',
  'packages/core/src/lib/editor/withPlite.slow.ts',
  'packages/core/src/react/editor/TPlateEditorCore.spec.ts',
  'packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts',
  'packages/yjs/README.md',
]);

if (
  [...intentionalRawSchemaQueryCounts.values()].reduce(
    (total, count) => total + count,
    0
  ) !== 53
) {
  throw new Error('Plate raw schema query allowlist must contain 53 calls.');
}

const toPosixPath = (path) => path.split(sep).join('/');

const getPropertyName = (node) => {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type === 'StringLiteral') return node.value;

  return;
};

const getStaticString = (node) => {
  if (node?.type === 'StringLiteral') return node.value;
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

const readNamedSchemaLineage = (node) => {
  const value = unwrapTypedExpression(node);

  if (value?.type !== 'ObjectExpression') return;

  const id = unwrapTypedExpression(getObjectProperty(value, 'id')?.value);
  const version = unwrapTypedExpression(
    getObjectProperty(value, 'version')?.value
  );

  if (id?.type !== 'StringLiteral' || version?.type !== 'NumericLiteral') {
    return;
  }

  return { id: id.value, version: version.value };
};

const getPlateEditorConstructionOptions = (node) => {
  if (node?.type !== 'CallExpression' || node.callee.type !== 'Identifier') {
    return;
  }

  const optionsIndex = plateEditorConstructionOptionIndexes.get(
    node.callee.name
  );

  if (optionsIndex === undefined) return;

  const options = node.arguments[optionsIndex];

  return options?.type === 'ObjectExpression' ? options : undefined;
};

const getNamedSchemaLineage = (node, bindings) => {
  const options = getPlateEditorConstructionOptions(node);
  const property = getObjectProperty(options, 'schema');

  if (property?.type !== 'ObjectProperty') return;

  const value = unwrapTypedExpression(property.value);
  const lineage =
    readNamedSchemaLineage(value) ??
    (value?.type === 'Identifier' ? bindings.get(value.name) : undefined);

  if (!lineage) return;

  return {
    id: lineage.id,
    node: property,
    version: lineage.version,
  };
};

const recordNamedSchemaLineage = (node, file, bindings, counts) => {
  const lineage = getNamedSchemaLineage(node, bindings);

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

const collectNamedSchemaLineageBindings = (ast) => {
  const bindings = new Map();

  walkAst(ast, (node) => {
    if (node.type !== 'VariableDeclaration' || node.kind !== 'const') return;

    for (const declaration of node.declarations) {
      if (declaration.id?.type !== 'Identifier') continue;

      const lineage = readNamedSchemaLineage(declaration.init);

      if (lineage) bindings.set(declaration.id.name, lineage);
    }
  });

  return bindings;
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

const isDirectCreatorExtendChain = (node) => {
  let current = unwrapTypedExpression(node);

  while (current?.type === 'CallExpression') {
    const callee = unwrapTypedExpression(current.callee);

    if (
      callee?.type === 'Identifier' &&
      ['createBasePlugin', 'createPlatePlugin'].includes(callee.name)
    ) {
      return true;
    }
    if (callee?.type !== 'MemberExpression') return false;

    current = unwrapTypedExpression(callee.object);
  }

  return false;
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

const getExtensionStageFields = (contribution) =>
  getStaticExtensionProperties(contribution)
    .map((property) =>
      property.type === 'SpreadElement'
        ? '...'
        : (getPropertyName(property.key) ?? '?')
    )
    .sort();

const getExtendChainStages = (node) => {
  const stages = [];
  let current = unwrapTypedExpression(node);

  while (
    current?.type === 'CallExpression' &&
    readMemberCallName(current) === 'extend'
  ) {
    stages.unshift(getExtensionStageFields(current.arguments[0]));
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

const isPluginFactoryCall = (node) => {
  if (node?.type !== 'CallExpression') return false;

  if (node.callee.type === 'Identifier') {
    return pluginFactoryNamePattern.test(node.callee.name);
  }

  if (node.callee.type !== 'MemberExpression' || node.callee.computed) {
    return false;
  }

  return pluginConfigurationMethods.has(getPropertyName(node.callee.property));
};

const isPlatePluginFactoryCall = (node) => {
  if (node?.type !== 'CallExpression') return false;

  if (node.callee.type === 'Identifier') {
    return platePluginFactoryNamePattern.test(node.callee.name);
  }

  if (node.callee.type !== 'MemberExpression' || node.callee.computed) {
    return false;
  }

  return pluginConfigurationMethods.has(getPropertyName(node.callee.property));
};

const isDirectPluginDeclarationObject = (ancestors) => {
  const objectIndex = ancestors.length - 1;

  if (ancestors[objectIndex]?.type !== 'ObjectExpression') return false;

  for (let index = objectIndex - 1; index >= 0; index--) {
    const ancestor = ancestors[index];

    if (ancestor.type === 'CallExpression') {
      return (
        isPluginFactoryCall(ancestor) &&
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

const isDirectPlatePluginDeclarationObject = (ancestors) => {
  const objectIndex = ancestors.length - 1;

  if (ancestors[objectIndex]?.type !== 'ObjectExpression') return false;

  for (let index = objectIndex - 1; index >= 0; index--) {
    const ancestor = ancestors[index];

    if (ancestor.type === 'CallExpression') {
      return (
        isPlatePluginFactoryCall(ancestor) &&
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

const isInsidePluginSchema = (ancestors) => {
  const schemaIndex = ancestors.findLastIndex(
    (ancestor) =>
      ancestor.type === 'ObjectProperty' &&
      getPropertyName(ancestor.key) === 'schema'
  );

  return (
    schemaIndex >= 0 &&
    isDirectPluginDeclarationObject(ancestors.slice(0, schemaIndex))
  );
};

const isInsidePluginFactoryDeclaration = (ancestors) => {
  for (let index = ancestors.length - 1; index >= 0; index--) {
    const ancestor = ancestors[index];

    if (ancestor.type !== 'CallExpression' || !isPluginFactoryCall(ancestor)) {
      continue;
    }

    return ancestor.callee.type === 'Identifier';
  }

  return false;
};

const isInsidePluginInitialState = (ancestors) => {
  const initialStateIndex = ancestors.findLastIndex(
    (ancestor) =>
      ancestor.type === 'ObjectProperty' &&
      getPropertyName(ancestor.key) === 'initialState'
  );

  return (
    initialStateIndex >= 0 &&
    isDirectPluginDeclarationObject(ancestors.slice(0, initialStateIndex))
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

const getStaticPliteElementMap = (node) => {
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
      : getObjectProperty(declaration, 'schema')?.value;

  if (schema?.type !== 'ObjectExpression') return;

  const elements = getObjectProperty(schema, 'elements')?.value;

  return elements?.type === 'ObjectExpression' ? elements : undefined;
};

export function auditPlateSchemaSource(source, file = 'fixture.ts') {
  const ast = parsePlateSource(source, file);
  const namedSchemaLineageBindings = collectNamedSchemaLineageBindings(ast);
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
      const key = getPropertyName(node.key);
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
          .map((property) => getPropertyName(property.key))
          .filter((property) => deletedNodeBagKeys.has(property));
        const hasDistinctiveNodeBagKey = keys.some(
          (property) => property !== 'type'
        );

        if (
          keys.length > 0 &&
          (hasDistinctiveNodeBagKey ||
            isDirectPluginDeclarationObject(ancestors))
        ) {
          report(node, `deleted Plate node bag (${keys.join(', ')})`);
        }
      }

      if (
        key === 'mark' &&
        node.value?.type === 'BooleanLiteral' &&
        node.value.value &&
        isInsidePluginSchema(ancestors)
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
        isInsidePluginSchema(ancestors)
      ) {
        report(node, 'Plate plugins must not repeat derived structural groups');
      }

      if (
        key === 'element' &&
        node.value?.type === 'ObjectExpression' &&
        isInsidePluginSchema(ancestors) &&
        isInsidePluginFactoryDeclaration(ancestors) &&
        !node.value.properties.some(
          (property) => property.type === 'SpreadElement'
        ) &&
        !node.value.properties.some((property) =>
          ['content', 'void'].includes(getPropertyName(property.key))
        ) &&
        !hasExpectError(source, node) &&
        !ancestors.some(
          (ancestor) =>
            ancestor.type === 'ObjectProperty' &&
            getPropertyName(ancestor.key) === 'schema' &&
            hasExpectError(source, ancestor)
        )
      ) {
        report(node, 'non-void element schema requires explicit content');
      }

      if (key === 'targetPluginKeys' && isInsidePluginInitialState(ancestors)) {
        report(
          node,
          'schema target descriptors belong in top-level targetPluginKeys'
        );
      }

      if (key === 'config' && isDirectPlatePluginDeclarationObject(ancestors)) {
        report(node, 'Plate plugin values belong in initialState');
      }

      if (
        key === 'schema' &&
        isFunction(node.value) &&
        isDirectPlatePluginDeclarationObject(ancestors)
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

    if (node.type === 'CallExpression') {
      const memberCallName = readMemberCallName(node);
      const memberCallOwner =
        node.callee.type === 'MemberExpression'
          ? unwrapTypedExpression(node.callee.object)
          : undefined;

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

      if (memberCallName === 'extend') {
        for (const property of getStaticExtensionProperties(
          node.arguments[0]
        )) {
          if (getPropertyName(property.key) !== 'codecs') continue;

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
            isProductionPluginAuthoringFile(file)
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
          isDirectCreatorExtendChain(node.callee.object)
        ) {
          const stages = getExtendChainStages(node);

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
        node.callee.type === 'Identifier' &&
        ['createBasePlugin', 'createPlatePlugin'].includes(node.callee.name) &&
        node.arguments[0]?.type === 'ObjectExpression'
      ) {
        for (const property of node.arguments[0].properties) {
          const key =
            property.type === 'ObjectProperty' ||
            property.type === 'ObjectMethod'
              ? getPropertyName(property.key)
              : undefined;

          if (
            node.callee.name === 'createBasePlugin' &&
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
        memberCallName === 'configure' &&
        isPackagePluginDefinitionSource(file)
      ) {
        report(
          node,
          'package plugin definitions must use constructor fields or a justified imported/prebuilt or staged extend; reserve configure for consumer installation'
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
        namedSchemaLineageCounts
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
        node.callee.type === 'Identifier' &&
        ['createBasePlugin', 'createPlatePlugin'].includes(node.callee.name) &&
        (node.typeParameters?.params.length > 0 ||
          node.typeArguments?.params.length > 0) &&
        getObjectProperty(node.arguments[0], 'schema')
      ) {
        explicitSchemaFactoryCount++;

        if (explicitSchemaFactoryCount > allowedExplicitSchemaFactoryCount) {
          report(
            node,
            'schema-bearing plugin factories must infer their descriptor before deriving the plugin config type'
          );
        }
      }

      const elements = getStaticPliteElementMap(node);

      for (const elementProperty of elements?.properties ?? []) {
        if (
          elementProperty.type === 'SpreadElement' ||
          elementProperty.value?.type !== 'ObjectExpression' ||
          elementProperty.value.properties.some(
            (property) => property.type === 'SpreadElement'
          ) ||
          elementProperty.value.properties.some((property) =>
            ['content', 'void'].includes(getPropertyName(property.key))
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
        node.callee?.type === 'MemberExpression' &&
        !node.callee.computed &&
        getPropertyName(node.callee.property) === 'configure' &&
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

    const bindings = collectNamedSchemaLineageBindings(ast);

    walkAst(ast, (node) => {
      if (node.type !== 'CallExpression') return;

      const issue = recordNamedSchemaLineage(node, file, bindings, counts);

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
