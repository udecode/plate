#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { parse } from '@babel/parser';

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
const pluginFactoryNamePattern = /^(?:create|define).*(?:Extension|Plugin)$/;
const pliteExtensionNamePattern = /^define.*Extension$/;
const contextualConfigureKeys = new Set([
  'handlers',
  'options',
  'render',
  'shortcuts',
]);

const toPosixPath = (path) => path.split(sep).join('/');

const getPropertyName = (node) => {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type === 'StringLiteral') return node.value;

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

const getLineNumber = (source, offset) =>
  source.slice(0, offset).split('\n').length;

const visit = (node, callback) => {
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
      for (const child of value) visit(child, callback);
    } else if (value && typeof value === 'object' && value.type) {
      visit(value, callback);
    }
  }
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
  if (!schemaProperty) return;
  if (schemaProperty.shorthand) return { complete: true };

  const value = schemaProperty.value;

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

const isFunction = (node) =>
  node?.type === 'ArrowFunctionExpression' ||
  node?.type === 'FunctionExpression';

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

    visit(ast, (node) => {
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
                'contextual plugin configure only accepts explicit options, handlers, render, and shortcuts overrides'
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

      const declaration = node.arguments[0];

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
    .sort();
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

    return auditPlateDocCode(readFileSync(path, 'utf8'), file);
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
