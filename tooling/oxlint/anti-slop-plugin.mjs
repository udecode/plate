import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const antiSlopConfigPath = require.resolve('ultracite/oxlint/anti-slop');
const upstreamPluginPath = path.join(
  path.dirname(antiSlopConfigPath),
  'plugin.mjs'
);
const upstreamPlugin = (await import(pathToFileURL(upstreamPluginPath).href))
  .default;

const assertionKinds = new Set(['TSAsExpression', 'TSTypeAssertion']);

const unwrapParentheses = (node) => {
  let current = node;

  while (current.type === 'ParenthesizedExpression') {
    current = current.expression;
  }

  return current;
};

const isTopType = (type) =>
  type.type === 'TSAnyKeyword' || type.type === 'TSUnknownKeyword';

export const hasExplicitTopTypeBridge = (node) => {
  if (!assertionKinds.has(node.type) || isTopType(node.typeAnnotation)) {
    return false;
  }

  const bridge = unwrapParentheses(node.expression);

  if (!assertionKinds.has(bridge.type) || !isTopType(bridge.typeAnnotation)) {
    return false;
  }

  const source = unwrapParentheses(bridge.expression);

  return !assertionKinds.has(source.type);
};

export const isTypeAssertionAnnotation = (node) => {
  let current = node;
  let parent = current.parent;

  while (
    parent !== null &&
    parent.type.startsWith('TS') &&
    !assertionKinds.has(parent.type)
  ) {
    current = parent;
    parent = parent.parent;
  }

  return (
    parent !== null &&
    assertionKinds.has(parent.type) &&
    parent.typeAnnotation === current
  );
};

const typeReferenceName = (node) =>
  node.type === 'TSTypeReference' && node.typeName.type === 'Identifier'
    ? node.typeName.name
    : null;

export const isAnyConditionalFallback = (node) => {
  let current = node;
  let parent = current.parent;

  while (parent !== null && parent.type.startsWith('TS')) {
    if (
      parent.type === 'TSConditionalType' &&
      parent.trueType === current &&
      typeReferenceName(parent.checkType) === 'IsAny'
    ) {
      return true;
    }

    current = parent;
    parent = parent.parent;
  }

  return false;
};

export const isJsxIntrinsicElementsDictionary = (node) => {
  let current = node.parent;

  while (current !== null && current.type !== 'Program') {
    if (
      current.type === 'TSInterfaceDeclaration' &&
      current.id.name === 'IntrinsicElements'
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
};

export const isNamedTypeAlias = (node, name) => {
  let current = node.parent;

  while (current !== null && current.type !== 'Program') {
    if (current.type === 'TSTypeAliasDeclaration' && current.id.name === name) {
      return true;
    }

    current = current.parent;
  }

  return false;
};

export const shouldSuppressUnsafeDictionary = ({ data, node }) =>
  data?.value === 'unknown' ||
  isTypeAssertionAnnotation(node) ||
  isAnyConditionalFallback(node) ||
  isJsxIntrinsicElementsDictionary(node) ||
  isNamedTypeAlias(node, 'AnyObject');

const wrapContext = (context, shouldSuppress) => {
  const descriptors = Object.getOwnPropertyDescriptors(context);
  const report = context.report;

  descriptors.report = {
    ...descriptors.report,
    value: (descriptor, ...extraArguments) => {
      if (!shouldSuppress(descriptor)) report(descriptor, ...extraArguments);
    },
  };

  return Object.create(Object.getPrototypeOf(context), descriptors);
};

const refineRule = (rule, shouldSuppress, description) => ({
  ...rule,
  meta: {
    ...rule.meta,
    docs: {
      ...rule.meta.docs,
      description,
    },
  },
  create: (context) => rule.create(wrapContext(context, shouldSuppress)),
  createOnce: (context) =>
    rule.createOnce(wrapContext(context, shouldSuppress)),
});

const rules = {
  ...upstreamPlugin.rules,
  'no-chained-type-assertions': refineRule(
    upstreamPlugin.rules['no-chained-type-assertions'],
    ({ node }) => hasExplicitTopTypeBridge(node),
    'Disallow accidental chained TypeScript assertions while preserving explicit unknown or any bridges.'
  ),
  'no-unsafe-dictionary-type': refineRule(
    upstreamPlugin.rules['no-unsafe-dictionary-type'],
    shouldSuppressUnsafeDictionary,
    'Disallow unchecked open dictionary contracts while preserving type-safe unknown values, local runtime assertions, explicit any propagation, the explicitly unchecked AnyObject alias, and JSX host declarations.'
  ),
};

export default {
  ...upstreamPlugin,
  meta: {
    ...upstreamPlugin.meta,
    name: 'plate-anti-slop',
  },
  rules,
};
