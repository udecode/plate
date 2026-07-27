import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { parse } from '@babel/parser';

const root = process.cwd();
const artifactDir = path.join(
  root,
  'docs/plans/artifacts/2026-07-26-plate-next-all-package-plugin-api-review'
);
const packageRoot = path.join(root, 'packages');
const builderNames = new Set([
  'createBasePlugin',
  'createPlatePlugin',
  'toPlatePlugin',
]);
const capabilityFields = new Set([
  'api',
  'extension',
  'read',
  'selectors',
  'update',
]);
const builderImplementationFiles = new Set([
  'packages/core/src/lib/plugin/createBasePlugin.ts',
  'packages/core/src/react/plugin/createPlatePlugin.ts',
  'packages/core/src/react/plugin/toPlatePlugin.ts',
]);
const candidatePattern =
  /\b(?:createBasePlugin|createPlatePlugin|toPlatePlugin)\s*(?=[<(])|\.extend\s*\(|\b(?:const|let|var)\s+\w*Plugin\b/;
const genericPluginTypePattern = /\b(?:Any)?(?:Base|Plate)Plugin\b/;
const productionTestFilePattern = /\.(spec|test|slow)\.[cm]?[jt]sx?$/;
const excludedPathParts = new Set([
  '__fixtures__',
  '__tests__',
  'fixtures',
  'test',
  'tests',
]);
const sourceExtensions = new Set(['.cts', '.mts', '.ts', '.tsx']);

const files = (await walk(packageRoot))
  .filter((file) => {
    const relative = toPosix(path.relative(root, file));
    const parts = relative.split('/');
    const basename = path.basename(relative);

    return (
      parts.length >= 4 &&
      parts[0] === 'packages' &&
      parts[2] === 'src' &&
      sourceExtensions.has(path.extname(relative)) &&
      !parts.some((part) => excludedPathParts.has(part)) &&
      !productionTestFilePattern.test(basename) &&
      !relative.includes('/dist/')
    );
  })
  .sort();

const snapshot = createHash('sha256');
const rows = [];
const parseErrors = [];
const aliases = [];
const builderImplementationCalls = [];
const genericPluginDecorators = [];
const nestedBuilderCalls = [];
let astBuilderCalls = 0;
let candidateFiles = 0;
const excluded = {
  internalAliases: 0,
  nonPluginExtends: 0,
};

for (const file of files) {
  const relative = toPosix(path.relative(root, file));
  const sourceText = await readFile(file, 'utf8');
  let program;

  snapshot.update(relative);
  snapshot.update('\0');
  snapshot.update(sourceText);
  snapshot.update('\0');

  if (!candidatePattern.test(sourceText)) continue;

  candidateFiles += 1;

  try {
    program = parse(sourceText, {
      allowAwaitOutsideFunction: true,
      errorRecovery: false,
      plugins: ['decorators-legacy', 'importAttributes', 'jsx', 'typescript'],
      sourceFilename: relative,
      sourceType: 'unambiguous',
    }).program;
  } catch (error) {
    parseErrors.push({
      error: String(error.message ?? error),
      file: relative,
    });
    continue;
  }

  attachParents(program);
  const candidates = [];

  visit(program, (node) => {
    if (isCall(node) && isBuilderCall(node)) {
      astBuilderCalls += 1;

      if (builderImplementationFiles.has(relative)) {
        builderImplementationCalls.push({
          builder: getCalleeName(node),
          file: relative,
          line: node.loc.start.line,
        });
      } else if (hasEnclosingBuilderArgument(node)) {
        nestedBuilderCalls.push({
          builder: getCalleeName(node),
          file: relative,
          line: node.loc.start.line,
        });
      } else {
        candidates.push({
          kind: getCalleeName(node),
          rootCall: node,
        });
      }

      return;
    }

    if (builderImplementationFiles.has(relative)) return;

    if (
      isCall(node) &&
      isMethodCall(node, 'extend') &&
      !containsBuilderCall(node)
    ) {
      const genericDecorator = getGenericPluginDecorator(node, sourceText);

      if (genericDecorator) {
        genericPluginDecorators.push({
          ...genericDecorator,
          file: relative,
          line: node.loc.start.line,
        });
        return;
      }

      const chainRoot = getChainRoot(node);
      const binding = getBinding(chainRoot, sourceText);
      const receiver = node.callee.object;

      if (
        binding.symbol.includes('Plugin') &&
        getRightmostName(receiver).includes('Plugin')
      ) {
        candidates.push({
          kind: 'derivedPlugin.extend',
          rootCall: node,
        });
      } else {
        excluded.nonPluginExtends += 1;
      }
    }
  });

  const candidatesByRoot = new Map();

  for (const candidate of candidates) {
    const chainRoot = getChainRoot(candidate.rootCall);
    const rootPosition = chainRoot.start;
    const dedupeKey = `${relative}:${rootPosition}`;
    const previous = candidatesByRoot.get(dedupeKey);

    if (
      previous &&
      (previous.kind !== 'derivedPlugin.extend' ||
        candidate.kind === 'derivedPlugin.extend') &&
      previous.rootCall.end - previous.rootCall.start <=
        candidate.rootCall.end - candidate.rootCall.start
    ) {
      continue;
    }

    candidatesByRoot.set(dedupeKey, {
      ...candidate,
      chainRoot,
    });
  }

  for (const candidate of candidatesByRoot.values()) {
    rows.push(
      inspectCandidate({
        ...candidate,
        file: relative,
        sourceText,
      })
    );
  }

  if (builderImplementationFiles.has(relative)) continue;

  visit(program, (node) => {
    if (
      node.type !== 'VariableDeclarator' ||
      node.id?.type !== 'Identifier' ||
      !node.id.name.endsWith('Plugin') ||
      !node.init ||
      containsBuilderCall(node.init) ||
      containsMethodCall(node.init, 'extend')
    ) {
      return;
    }

    const initializer = unwrap(node.init);

    if (
      (initializer.type === 'Identifier' ||
        initializer.type === 'MemberExpression') &&
      getRightmostName(initializer).endsWith('Plugin')
    ) {
      const declaration = findAncestor(node, (candidate) =>
        [
          'VariableDeclaration',
          'ExportNamedDeclaration',
          'ExportDefaultDeclaration',
        ].includes(candidate.type)
      );
      const exported =
        declaration?.type === 'ExportNamedDeclaration' ||
        declaration?.type === 'ExportDefaultDeclaration' ||
        declaration?._parent?.type === 'ExportNamedDeclaration';
      const alias = {
        base: compactText(initializer, sourceText),
        exported: !!exported,
        file: relative,
        line: node.loc.start.line,
        package: relative.split('/')[1],
        symbol: node.id.name,
      };

      aliases.push(alias);

      if (alias.exported) {
        rows.push({
          ambiguities: [],
          base: alias.base,
          capabilities: emptyCapabilities(),
          configuration: [],
          constructor: undefined,
          exported: true,
          extendStages: [],
          file: alias.file,
          id: 0,
          key: undefined,
          kind: 'alias',
          line: alias.line,
          package: alias.package,
          symbol: alias.symbol,
        });
      } else {
        excluded.internalAliases += 1;
      }
    }
  });
}

rows.sort((a, b) =>
  a.package === b.package
    ? a.file === b.file
      ? a.line - b.line
      : a.file.localeCompare(b.file)
    : a.package.localeCompare(b.package)
);
rows.forEach((row, index) => {
  row.id = index + 1;
});

const duplicateSourceRows = findDuplicates(
  rows.map((row) => `${row.file}:${row.line}`)
);
const manifest = {
  ambiguousRows: rows.filter((row) => row.ambiguities.length > 0).length,
  astBuilderCalls,
  builderImplementationCalls,
  builderCounts: countBy(rows, (row) => row.kind),
  candidateFiles,
  duplicateSourceRows,
  excluded,
  exportedAliases: aliases.filter((alias) => alias.exported),
  genericPluginDecorators,
  nestedBuilderCalls,
  packageCounts: countBy(rows, (row) => row.package),
  parseErrors,
  pluginRows: rows.length,
  sourceFiles: files.length,
  sourceSnapshot: `sha256:${snapshot.digest('hex')}`,
};

await mkdir(artifactDir, { recursive: true });
await writeFile(
  path.join(artifactDir, 'plugin-source-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`
);
await writeFile(
  path.join(artifactDir, 'plugin-surfaces.raw.json'),
  `${JSON.stringify(rows, null, 2)}\n`
);
await writeFile(
  path.join(artifactDir, 'plugin-surfaces.raw.tsv'),
  `${toTsv(rows)}\n`
);

process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);

function inspectCandidate({ chainRoot, file, kind, rootCall, sourceText }) {
  const binding = getBinding(chainRoot, sourceText);
  const line = chainRoot.loc.start.line;
  const constructorArg = isBuilderCall(rootCall)
    ? rootCall.arguments[0]
    : undefined;
  const stages = getChainMethodCalls(chainRoot, rootCall, 'extend').map(
    (call, index) =>
      inspectContribution(call.arguments[0], `extend:${index + 1}`, sourceText)
  );
  const configurations = getChainMethodCalls(
    chainRoot,
    rootCall,
    'configure'
  ).map((call, index) =>
    inspectContribution(call.arguments[0], `configure:${index + 1}`, sourceText)
  );
  const constructorContribution =
    kind === 'createBasePlugin' || kind === 'createPlatePlugin'
      ? inspectContribution(constructorArg, 'constructor', sourceText)
      : undefined;
  const adapter =
    kind === 'toPlatePlugin' && rootCall.arguments[1]
      ? inspectContribution(rootCall.arguments[1], 'adapter', sourceText)
      : undefined;
  const base =
    kind === 'toPlatePlugin'
      ? compactText(rootCall.arguments[0], sourceText)
      : kind === 'derivedPlugin.extend'
        ? compactText(rootCall.callee.object, sourceText)
        : undefined;
  const contributions = [constructorContribution, adapter, ...stages].filter(
    Boolean
  );
  const capabilities = Object.fromEntries(
    [...capabilityFields].map((field) => [
      field,
      contributions.flatMap((contribution) => contribution.capabilities[field]),
    ])
  );
  const ambiguities = [
    ...contributions.flatMap((contribution) => contribution.ambiguities),
    ...configurations.flatMap((configuration) => configuration.ambiguities),
  ];

  if (kind === 'toPlatePlugin' && !base) {
    ambiguities.push('missing toPlatePlugin base');
  }

  return {
    ambiguities: [...new Set(ambiguities)],
    base,
    capabilities,
    configuration: configurations,
    constructor: constructorContribution,
    adapter,
    exported: binding.exported,
    extendStages: stages,
    file,
    id: 0,
    key: constructorContribution?.key,
    kind,
    line,
    package: file.split('/')[1],
    symbol: binding.symbol,
  };
}

function inspectContribution(argument, stage, sourceText) {
  const objects = getContributionObjects(argument);
  const capabilities = Object.fromEntries(
    [...capabilityFields].map((field) => [field, []])
  );
  const fields = new Set();
  const ambiguities = [];
  let key;

  if (!argument) {
    ambiguities.push(`${stage} has no argument`);
  } else if (objects.length === 0) {
    ambiguities.push(
      `${stage} contribution is ${compactText(argument, sourceText)}`
    );
  }

  for (const object of objects) {
    for (const property of object.properties) {
      const name = getPropertyName(property.key);

      if (!name) continue;

      fields.add(name);

      if (name === 'key') {
        key ??= compactText(getPropertyValue(property), sourceText);
      }

      if (capabilityFields.has(name)) {
        capabilities[name].push(summarizeProperty(property, sourceText));
      }
    }
  }

  return {
    ambiguities,
    capabilities,
    fields: [...fields].sort(),
    key,
    stage,
  };
}

function summarizeProperty(property, sourceText) {
  const value = getPropertyValue(property);

  if (!value) return 'shorthand';

  const object = unwrapToObject(value);

  if (object) {
    return `object{${getObjectKeys(object).join(',')}}`;
  }

  if (isFunction(value)) {
    const returned = getDirectReturnedObjects(value);

    if (returned.length > 0) {
      const keys = [...new Set(returned.flatMap(getObjectKeys))].sort();
      return `factory{${keys.join(',')}}`;
    }

    return 'factory{dynamic}';
  }

  if (isCall(value)) {
    return `call:${compactText(value.callee, sourceText)}`;
  }

  if (value.type === 'ArrayExpression') {
    return `array[${value.elements.length}]`;
  }

  return compactText(value, sourceText);
}

function getContributionObjects(argument) {
  if (!argument) return [];

  const unwrapped = unwrap(argument);
  const direct = unwrapToObject(unwrapped);

  if (direct) return [direct];

  if (isFunction(unwrapped)) {
    return getDirectReturnedObjects(unwrapped);
  }

  return [];
}

function getDirectReturnedObjects(fn) {
  const direct = unwrapToObject(fn.body);

  if (direct) return [direct];
  if (fn.body.type !== 'BlockStatement') return [];

  const objects = [];

  const walk = (node) => {
    if (node !== fn.body && isFunction(node)) return;

    if (node.type === 'ReturnStatement' && node.argument) {
      const object = unwrapToObject(node.argument);
      if (object) objects.push(object);
      return;
    }

    forEachChild(node, walk);
  };

  walk(fn.body);
  return objects;
}

function getChainMethodCalls(chainRoot, rootCall, methodName) {
  const calls = [];
  let current = unwrap(chainRoot);

  while (isCall(current)) {
    if (isMethodCall(current, methodName)) calls.push(current);
    if (current === rootCall) break;
    if (current.callee?.type !== 'MemberExpression') break;

    const receiver = unwrap(current.callee.object);

    if (
      !receiver ||
      receiver.start == null ||
      receiver.end == null ||
      receiver.start > rootCall.start ||
      receiver.end < rootCall.end
    ) {
      break;
    }

    current = receiver;
  }

  return calls.reverse();
}

function getGenericPluginDecorator(call, sourceText) {
  const receiver = unwrap(call.callee.object);

  if (receiver.type !== 'Identifier') return;

  let current = call._parent;

  while (current) {
    if (isFunction(current)) {
      const parameter = current.params.find((candidate) => {
        const value =
          candidate.type === 'AssignmentPattern' ? candidate.left : candidate;

        return value.type === 'Identifier' && value.name === receiver.name;
      });

      if (parameter) {
        const value =
          parameter.type === 'AssignmentPattern' ? parameter.left : parameter;
        const typeText = compactText(value.typeAnnotation, sourceText);

        if (genericPluginTypePattern.test(typeText)) {
          const contribution = inspectContribution(
            call.arguments[0],
            'generic-plugin-decorator',
            sourceText
          );

          return {
            ambiguities: contribution.ambiguities,
            capabilities: contribution.capabilities,
            receiver: receiver.name,
            receiverType: typeText,
          };
        }
      }
    }

    current = current._parent;
  }
}

function getChainRoot(node) {
  let current = node;

  while (current._parent) {
    const parent = current._parent;

    if (
      (parent.type === 'MemberExpression' && parent.object === current) ||
      (isCall(parent) && parent.callee === current) ||
      isWrapper(parent)
    ) {
      current = parent;
      continue;
    }

    break;
  }

  return current;
}

function getBinding(node, sourceText) {
  let current = node;

  while (current._parent) {
    const parent = current._parent;

    if (parent.type === 'VariableDeclarator') {
      const symbol =
        parent.id.type === 'Identifier'
          ? parent.id.name
          : compactText(parent.id, sourceText);
      const declaration = findAncestor(parent, (candidate) =>
        [
          'VariableDeclaration',
          'ExportNamedDeclaration',
          'ExportDefaultDeclaration',
        ].includes(candidate.type)
      );
      const exported =
        declaration?.type === 'ExportNamedDeclaration' ||
        declaration?.type === 'ExportDefaultDeclaration' ||
        declaration?._parent?.type === 'ExportNamedDeclaration';

      return { exported: !!exported, symbol };
    }

    if (parent.type === 'ObjectProperty') {
      return {
        exported: false,
        symbol: `${getPropertyName(parent.key) ?? 'property'}@${parent.loc.start.line}`,
      };
    }

    if (parent.type === 'ReturnStatement') {
      const fn = findAncestor(parent, isFunction);
      const name =
        fn?.id?.name ??
        (fn?._parent?.type === 'VariableDeclarator' &&
        fn._parent.id.type === 'Identifier'
          ? fn._parent.id.name
          : `factory@${parent.loc.start.line}`);

      return {
        exported: isExportedFunction(fn),
        symbol: `${name}()`,
      };
    }

    if (parent.type === 'ExportDefaultDeclaration') {
      return {
        exported: true,
        symbol: `default@${parent.loc.start.line}`,
      };
    }

    current = parent;
  }

  return {
    exported: false,
    symbol: `inline@${node.loc.start.line}`,
  };
}

function isExportedFunction(node) {
  if (!node) return false;
  let current = node;

  while (current?._parent) {
    if (
      current._parent.type === 'ExportNamedDeclaration' ||
      current._parent.type === 'ExportDefaultDeclaration'
    ) {
      return true;
    }

    if (
      current._parent.type === 'Program' ||
      current._parent.type === 'BlockStatement'
    ) {
      return false;
    }

    current = current._parent;
  }

  return false;
}

function findAncestor(node, predicate) {
  let current = node._parent;

  while (current) {
    if (predicate(current)) return current;
    current = current._parent;
  }
}

function hasEnclosingBuilderArgument(node) {
  let current = node._parent;

  while (current) {
    if (
      isCall(current) &&
      isBuilderCall(current) &&
      current.arguments.some(
        (argument) => node.start >= argument.start && node.end <= argument.end
      )
    ) {
      return true;
    }

    if (
      current.type === 'VariableDeclarator' ||
      current.type === 'ReturnStatement' ||
      current.type === 'ExpressionStatement'
    ) {
      return false;
    }

    current = current._parent;
  }

  return false;
}

function containsBuilderCall(node) {
  let found = false;

  visit(node, (child) => {
    if (isCall(child) && isBuilderCall(child)) found = true;
  });

  return found;
}

function containsMethodCall(node, methodName) {
  let found = false;

  visit(node, (child) => {
    if (isCall(child) && isMethodCall(child, methodName)) found = true;
  });

  return found;
}

function isBuilderCall(node) {
  return builderNames.has(getCalleeName(node));
}

function getCalleeName(node) {
  return getRightmostName(node.callee);
}

function getRightmostName(node) {
  const unwrapped = unwrap(node);

  if (unwrapped.type === 'Identifier') return unwrapped.name;
  if (unwrapped.type === 'MemberExpression') {
    return getPropertyName(unwrapped.property) ?? '';
  }

  return '';
}

function isMethodCall(node, methodName) {
  return (
    node.callee?.type === 'MemberExpression' &&
    getPropertyName(node.callee.property) === methodName
  );
}

function getPropertyName(node) {
  if (!node) return;
  if (node.type === 'Identifier') return node.name;
  if (
    node.type === 'StringLiteral' ||
    node.type === 'NumericLiteral' ||
    node.type === 'BooleanLiteral'
  ) {
    return String(node.value);
  }

  return node.type === 'PrivateName' ? node.id.name : undefined;
}

function getPropertyValue(property) {
  if (property.type === 'ObjectProperty') return property.value;
  if (property.type === 'ObjectMethod') return property;
}

function getObjectKeys(object) {
  return object.properties
    .map((property) => getPropertyName(property.key))
    .filter(Boolean)
    .sort();
}

function unwrapToObject(node) {
  const unwrapped = unwrap(node);
  return unwrapped?.type === 'ObjectExpression' ? unwrapped : undefined;
}

function unwrap(node) {
  let current = node;

  while (current && isWrapper(current)) {
    current = current.expression;
  }

  return current;
}

function isWrapper(node) {
  return [
    'ParenthesizedExpression',
    'TSAsExpression',
    'TSNonNullExpression',
    'TSSatisfiesExpression',
    'TypeCastExpression',
  ].includes(node.type);
}

function isCall(node) {
  return (
    node?.type === 'CallExpression' || node?.type === 'OptionalCallExpression'
  );
}

function isFunction(node) {
  return [
    'ArrowFunctionExpression',
    'FunctionDeclaration',
    'FunctionExpression',
    'ObjectMethod',
  ].includes(node?.type);
}

function compactText(node, sourceText) {
  if (!node || node.start == null || node.end == null) return '';
  return sourceText
    .slice(node.start, node.end)
    .replace(/\s+/g, ' ')
    .slice(0, 160);
}

function attachParents(rootNode) {
  visit(rootNode, () => {});
}

function visit(node, callback, parent) {
  if (!node || typeof node !== 'object') return;

  if (parent && !Object.hasOwn(node, '_parent')) {
    Object.defineProperty(node, '_parent', {
      configurable: true,
      enumerable: false,
      value: parent,
      writable: true,
    });
  }

  callback(node);
  forEachChild(node, (child) => visit(child, callback, node));
}

function forEachChild(node, callback) {
  for (const [key, value] of Object.entries(node)) {
    if (
      key === '_parent' ||
      key === 'comments' ||
      key === 'errors' ||
      key === 'extra' ||
      key === 'loc' ||
      key === 'tokens'
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        if (child?.type) callback(child);
      }
    } else if (value?.type) {
      callback(value);
    }
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === 'dist' ||
        entry.name === 'node_modules' ||
        entry.name === '.turbo'
      ) {
        continue;
      }

      output.push(...(await walk(target)));
      continue;
    }

    output.push(target);
  }

  return output;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function countBy(items, keyOf) {
  return Object.fromEntries(
    [
      ...items.reduce((map, item) => {
        const key = keyOf(item);
        map.set(key, (map.get(key) ?? 0) + 1);
        return map;
      }, new Map()),
    ].sort(([a], [b]) => a.localeCompare(b))
  );
}

function findDuplicates(values) {
  const counts = countBy(values, (value) => value);
  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
}

function emptyCapabilities() {
  return Object.fromEntries([...capabilityFields].map((field) => [field, []]));
}

function toTsv(items) {
  const headers = [
    'id',
    'package',
    'symbol',
    'file',
    'line',
    'kind',
    'key',
    'base',
    'adapter_fields',
    'constructor_fields',
    'extend_stages',
    'configure_fields',
    'api',
    'read',
    'selectors',
    'update',
    'extension',
    'ambiguities',
  ];
  const lines = [headers.join('\t')];

  for (const item of items) {
    lines.push(
      [
        item.id,
        item.package,
        item.symbol,
        item.file,
        item.line,
        item.kind,
        item.key ?? '',
        item.base ?? '',
        item.adapter?.fields.join(',') ?? '',
        item.constructor?.fields.join(',') ?? '',
        item.extendStages.map((stage) => stage.fields.join(',')).join(' | '),
        item.configuration
          .map((configuration) => configuration.fields.join(','))
          .join(' | '),
        item.capabilities.api.join(' | '),
        item.capabilities.read.join(' | '),
        item.capabilities.selectors.join(' | '),
        item.capabilities.update.join(' | '),
        item.capabilities.extension.join(' | '),
        item.ambiguities.join(' | '),
      ]
        .map(tsvCell)
        .join('\t')
    );
  }

  return lines.join('\n');
}

function tsvCell(value) {
  return String(value ?? '')
    .replaceAll('\t', ' ')
    .replaceAll('\r', ' ')
    .replaceAll('\n', ' ');
}
