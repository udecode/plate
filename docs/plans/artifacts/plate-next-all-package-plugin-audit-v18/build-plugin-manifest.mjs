import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactDirectory, '../../../..');
const packagesDirectory = join(root, 'packages');
const sourceExtensionPattern = /\.(?:cts|mts|ts|tsx)$/;
const testPathPattern =
  /(?:^|\/)(?:__tests__|test|tests)(?:\/|$)|\.(?:slow|spec|test)\.[^.]+$/;
const pluginOwnerPattern = /Plugin(?:Base)?$/;
const canonicalConstructors = new Set([
  'createBasePlugin',
  'createPlatePlugin',
  'toPlatePlugin',
]);

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        if (['dist', 'node_modules'].includes(entry.name)) return [];

        return walk(path);
      }

      return entry.isFile() ? [path] : [];
    });

const escapeCell = (value) =>
  String(value ?? '')
    .replaceAll('\t', ' ')
    .replaceAll('\r', ' ')
    .replaceAll('\n', ' ');

const writeTsv = (path, headers, rows) => {
  const lines = [
    headers.join('\t'),
    ...rows.map((row) =>
      headers.map((header) => escapeCell(row[header])).join('\t')
    ),
  ];

  writeFileSync(path, `${lines.join('\n')}\n`);
};

const nodeText = (node, sourceText) =>
  sourceText.slice(node?.start ?? 0, node?.end ?? 0);

const unwrapExpression = (node) => {
  let current = node;

  while (
    current &&
    [
      'ParenthesizedExpression',
      'TSAsExpression',
      'TSInstantiationExpression',
      'TSNonNullExpression',
      'TSSatisfiesExpression',
      'TypeCastExpression',
    ].includes(current.type)
  ) {
    current = current.expression;
  }

  return current;
};

const getStaticPropertyKey = (node) => {
  if (node?.type === 'Identifier') return node.name;
  if (node?.type === 'StringLiteral') return node.value;
  if (node?.type === 'NumericLiteral') return String(node.value);
};

const getReturnedObject = (node) => {
  const value = unwrapExpression(node);

  if (value?.type === 'ObjectExpression') return value;
  if (['ArrowFunctionExpression', 'FunctionExpression'].includes(value?.type)) {
    const body = unwrapExpression(value.body);
    if (body?.type === 'ObjectExpression') return body;
    if (body?.type === 'BlockStatement') {
      const returnStatement = body.body.find(
        (statement) => statement.type === 'ReturnStatement'
      );
      const argument = unwrapExpression(returnStatement?.argument);
      if (argument?.type === 'ObjectExpression') return argument;
    }
  }
};

const getObjectFields = (object) =>
  (object?.properties ?? [])
    .filter((property) =>
      ['ObjectMethod', 'ObjectProperty'].includes(property.type)
    )
    .map((property) => getStaticPropertyKey(property.key))
    .filter(Boolean);

const getOwnerContainer = (call, ancestors) =>
  [...ancestors]
    .reverse()
    .find((node) =>
      [
        'VariableDeclarator',
        'FunctionDeclaration',
        'FunctionExpression',
        'ObjectMethod',
        'ClassMethod',
        'ObjectProperty',
        'ClassProperty',
      ].includes(node.type)
    ) ?? call;

const getOwner = (call, ancestors, sourceText) => {
  const container = getOwnerContainer(call, ancestors);

  if (container.type === 'VariableDeclarator') {
    return container.id.type === 'Identifier'
      ? container.id.name
      : nodeText(container.id, sourceText);
  }
  if (
    [
      'FunctionDeclaration',
      'FunctionExpression',
      'ObjectMethod',
      'ClassMethod',
    ].includes(container.type)
  ) {
    return container.id?.name ?? nodeText(container.key, sourceText);
  }
  if (['ObjectProperty', 'ClassProperty'].includes(container.type)) {
    return nodeText(container.key, sourceText);
  }

  return '<inline>';
};

const isOwnerExported = (call, ancestors) => {
  const container = getOwnerContainer(call, ancestors);
  const containerIndex = ancestors.lastIndexOf(container);

  for (let index = containerIndex - 1; index >= 0; index -= 1) {
    const ancestor = ancestors[index];

    if (
      ['ExportDefaultDeclaration', 'ExportNamedDeclaration'].includes(
        ancestor.type
      )
    ) {
      return true;
    }
    if (
      ancestor.type === 'BlockStatement' ||
      (ancestor.type.endsWith('Declaration') &&
        !['VariableDeclaration'].includes(ancestor.type))
    ) {
      return false;
    }
  }

  return false;
};

const getBuilderChainMethods = (call, ancestors) => {
  const methods = [];
  let current = call;
  let index = ancestors.length - 1;

  while (index >= 1) {
    const member = ancestors[index];
    const outerCall = ancestors[index - 1];

    if (
      member.type !== 'MemberExpression' ||
      member.object !== current ||
      outerCall.type !== 'CallExpression' ||
      outerCall.callee !== member
    ) {
      break;
    }

    const method =
      member.property.type === 'Identifier'
        ? member.property.name
        : member.property.value;

    methods.push(method);
    current = outerCall;
    index -= 2;
  }

  return methods;
};

const packageDirectories = walk(packagesDirectory)
  .filter((path) => path.endsWith('/package.json'))
  .map((path) => dirname(path))
  .sort();
const manifestRows = [];
const adaptationRows = [];
const packageRows = [];

for (const packageDirectory of packageDirectories) {
  const packageName = relative(packagesDirectory, packageDirectory);
  const sourceDirectory = join(packageDirectory, 'src');
  const sourceFiles = existsSync(sourceDirectory)
    ? walk(sourceDirectory).filter((path) => sourceExtensionPattern.test(path))
    : [];
  let productionCalls = 0;
  let productionAdaptations = 0;
  let testCalls = 0;
  let testAdaptations = 0;

  for (const absolutePath of sourceFiles) {
    const path = relative(root, absolutePath);
    const sourceText = readFileSync(absolutePath, 'utf8');
    let sourceFile;

    try {
      sourceFile = parse(sourceText, {
        errorRecovery: true,
        plugins: [
          'decorators-legacy',
          'explicitResourceManagement',
          ...(absolutePath.endsWith('.tsx') ? ['jsx'] : []),
          'typescript',
        ],
        sourceFilename: path,
        sourceType: 'unambiguous',
      });
    } catch (error) {
      error.message = `${path}: ${error.message}`;
      throw error;
    }
    const constructorAliases = new Map(
      [...canonicalConstructors].map((name) => [name, name])
    );

    for (const statement of sourceFile.program.body) {
      if (
        statement.type !== 'ImportDeclaration' ||
        !Array.isArray(statement.specifiers)
      ) {
        continue;
      }

      for (const element of statement.specifiers) {
        if (element.type !== 'ImportSpecifier') continue;

        const importedName = element.imported.name ?? element.imported.value;

        if (canonicalConstructors.has(importedName)) {
          constructorAliases.set(element.local.name, importedName);
        }
      }
    }
    for (const statement of sourceFile.program.body) {
      const declaration =
        statement.type === 'ExportNamedDeclaration'
          ? statement.declaration
          : statement;

      if (declaration?.type !== 'VariableDeclaration') continue;

      for (const declarator of declaration.declarations) {
        if (declarator.id.type !== 'Identifier') continue;

        const initializer = unwrapExpression(declarator.init);
        if (
          initializer?.type === 'Identifier' &&
          constructorAliases.has(initializer.name)
        ) {
          constructorAliases.set(
            declarator.id.name,
            constructorAliases.get(initializer.name)
          );
        }
      }
    }

    const visit = (node, ancestors = []) => {
      if (
        node.type === 'CallExpression' &&
        unwrapExpression(node.callee)?.type === 'MemberExpression'
      ) {
        const parent = ancestors.at(-1);
        const grandparent = ancestors.at(-2);
        const isInnerChainCall =
          parent?.type === 'MemberExpression' &&
          parent.object === node &&
          grandparent?.type === 'CallExpression' &&
          grandparent.callee === parent;

        if (!isInnerChainCall) {
          const methods = [];
          let base = node;

          while (base.type === 'CallExpression') {
            const member = unwrapExpression(base.callee);

            if (member?.type !== 'MemberExpression') break;

            const method =
              member.property.type === 'Identifier'
                ? member.property.name
                : member.property.value;

            if (!['configure', 'extend', 'withComponent'].includes(method)) {
              break;
            }

            methods.push(method);
            base = unwrapExpression(member.object);
          }

          const baseName =
            base.type === 'Identifier'
              ? base.name
              : base.type === 'MemberExpression'
                ? base.property.type === 'Identifier'
                  ? base.property.name
                  : base.property.value
                : undefined;
          const baseIsConstructor =
            base.type === 'CallExpression' &&
            unwrapExpression(base.callee)?.type === 'Identifier' &&
            constructorAliases.has(unwrapExpression(base.callee).name);

          if (
            methods.length > 0 &&
            !baseIsConstructor &&
            pluginOwnerPattern.test(baseName ?? '')
          ) {
            const scope = testPathPattern.test(path) ? 'test' : 'production';
            const owner = getOwner(node, ancestors, sourceText);
            const line = node.loc.start.line;

            if (scope === 'production') {
              productionAdaptations += 1;
            } else {
              testAdaptations += 1;
            }

            adaptationRows.push({
              base: nodeText(base, sourceText),
              configure_count: methods.filter(
                (method) => method === 'configure'
              ).length,
              exported: isOwnerExported(node, ancestors) ? 'yes' : 'no',
              extend_count: methods.filter((method) => method === 'extend')
                .length,
              id: `${packageName}:${path}:${line}:${owner}`,
              line,
              owner,
              package: packageName,
              path,
              scope,
              with_component_count: methods.filter(
                (method) => method === 'withComponent'
              ).length,
            });
          }
        }
      }

      if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
        const initializer = unwrapExpression(node.init);

        if (
          initializer?.type === 'Identifier' &&
          constructorAliases.has(initializer.name)
        ) {
          constructorAliases.set(
            node.id.name,
            constructorAliases.get(initializer.name)
          );
        }
      }

      if (node.type === 'CallExpression') {
        const callee = unwrapExpression(node.callee);
        const pluginConstructor =
          callee?.type === 'Identifier'
            ? constructorAliases.get(callee.name)
            : undefined;

        if (pluginConstructor) {
          const scope = testPathPattern.test(path) ? 'test' : 'production';
          const owner = getOwner(node, ancestors, sourceText);
          const chainMethods = getBuilderChainMethods(node, ancestors);
          const contributionObject =
            pluginConstructor === 'toPlatePlugin'
              ? getReturnedObject(node.arguments[1])
              : getReturnedObject(node.arguments[0]);
          const contributionFields = getObjectFields(contributionObject);
          const configuredKeyProperty = contributionObject?.properties.find(
            (property) =>
              ['ObjectMethod', 'ObjectProperty'].includes(property.type) &&
              getStaticPropertyKey(property.key) === 'key'
          );
          const configuredKey =
            configuredKeyProperty?.type === 'ObjectProperty'
              ? nodeText(configuredKeyProperty.value, sourceText)
              : undefined;
          const line = node.loc.start.line;

          if (scope === 'production') {
            productionCalls += 1;
          } else {
            testCalls += 1;
          }

          manifestRows.push({
            configure_count: chainMethods.filter(
              (method) => method === 'configure'
            ).length,
            contribution_fields: contributionFields.sort().join(','),
            constructor: pluginConstructor,
            exported: isOwnerExported(node, ancestors) ? 'yes' : 'no',
            extend_count: chainMethods.filter((method) => method === 'extend')
              .length,
            id: `${packageName}:${path}:${line}:${owner}`,
            line,
            owner,
            package: packageName,
            path,
            plugin_key:
              configuredKey ??
              (pluginConstructor === 'toPlatePlugin'
                ? `<inherited:${nodeText(node.arguments[0], sourceText)}>`
                : '<dynamic>'),
            scope,
            with_component_count: chainMethods.filter(
              (method) => method === 'withComponent'
            ).length,
          });
        }
      }

      const nextAncestors = [...ancestors, node];

      for (const value of Object.values(node)) {
        if (Array.isArray(value)) {
          for (const child of value) {
            if (child?.type) visit(child, nextAncestors);
          }
        } else if (value?.type) {
          visit(value, nextAncestors);
        }
      }
    };

    visit(sourceFile.program);
  }

  packageRows.push({
    package: packageName,
    production_plugin_adaptations: productionAdaptations,
    production_plugin_calls: productionCalls,
    source_files: sourceFiles.length,
    status:
      sourceFiles.length === 0
        ? 'no-source'
        : productionCalls + productionAdaptations > 0
          ? 'plugin-bearing'
          : 'no-production-plugin-call',
    test_plugin_adaptations: testAdaptations,
    test_plugin_calls: testCalls,
  });
}

manifestRows.sort((left, right) => left.id.localeCompare(right.id));
adaptationRows.sort((left, right) => left.id.localeCompare(right.id));

writeTsv(
  join(artifactDirectory, 'plugin-manifest.tsv'),
  [
    'id',
    'package',
    'scope',
    'path',
    'line',
    'owner',
    'constructor',
    'exported',
    'extend_count',
    'configure_count',
    'with_component_count',
    'plugin_key',
    'contribution_fields',
  ],
  manifestRows
);
writeTsv(
  join(artifactDirectory, 'plugin-adaptation-manifest.tsv'),
  [
    'id',
    'package',
    'scope',
    'path',
    'line',
    'owner',
    'base',
    'exported',
    'extend_count',
    'configure_count',
    'with_component_count',
  ],
  adaptationRows
);
writeTsv(
  join(artifactDirectory, 'package-inventory.tsv'),
  [
    'package',
    'source_files',
    'production_plugin_calls',
    'test_plugin_calls',
    'status',
    'production_plugin_adaptations',
    'test_plugin_adaptations',
  ],
  packageRows
);

process.stdout.write(
  `${JSON.stringify(
    {
      packageCount: packageRows.length,
      pluginBearingPackages: packageRows.filter(
        (row) => row.status === 'plugin-bearing'
      ).length,
      productionPluginCalls: manifestRows.filter(
        (row) => row.scope === 'production'
      ).length,
      productionPluginAdaptations: adaptationRows.filter(
        (row) => row.scope === 'production'
      ).length,
      sourceFiles: packageRows.reduce(
        (total, row) => total + row.source_files,
        0
      ),
      testPluginCalls: manifestRows.filter((row) => row.scope === 'test')
        .length,
      testPluginAdaptations: adaptationRows.filter(
        (row) => row.scope === 'test'
      ).length,
    },
    null,
    2
  )}\n`
);
