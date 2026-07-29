import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactDirectory, '../../../..');
const packagesDirectory = join(root, 'packages');
const sourceExtensionPattern = /\.(?:cts|mts|ts|tsx)$/;
const testPathPattern =
  /(?:^|\/)(?:__tests__|test|tests)(?:\/|$)|\.(?:slow|spec|test)\.[^.]+$/;
const pluginFilePattern = /Plugin\.(?:ts|tsx)$/;
const hookOwnerPattern = /^use[A-Z]/;
const constructors = new Set([
  'createBasePlugin',
  'createPlatePlugin',
  'toPlatePlugin',
]);
const forbiddenBuilderMethods = new Set([
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
const deletedOptionHelpers = new Set([
  'getOption',
  'getOptions',
  'setOption',
  'setOptions',
  'usePluginOption',
]);
const capabilityNames = new Set(['api', 'read', 'selectors', 'update']);
const contextParameterNames = new Set(['api', 'editor', 'read', 'store', 'tx']);
const taxonomyDirectories = new Set([
  'components',
  'helpers',
  'hooks',
  'queries',
  'transforms',
  'utils',
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

const getStaticKey = (node) => {
  if (!node) return;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'StringLiteral') return node.value;
  if (node.type === 'NumericLiteral') return String(node.value);
};

const unwrapExpression = (node) => {
  let current = node;

  while (
    current &&
    [
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

const returnedObject = (node) => {
  const value = unwrapExpression(node);

  if (!value) return;
  if (value.type === 'ObjectExpression') return value;
  if (['ArrowFunctionExpression', 'FunctionExpression'].includes(value.type)) {
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

const inspectContributionObject = ({
  pluginConstructor,
  object,
  owner,
  packageName,
  path,
}) => {
  if (object?.type !== 'ObjectExpression') return;

  for (const property of object.properties) {
    if (!['ObjectMethod', 'ObjectProperty'].includes(property.type)) continue;

    const key = getStaticKey(property.key);
    const value =
      property.type === 'ObjectMethod'
        ? property
        : unwrapExpression(property.value);

    if (['config', 'options'].includes(key)) {
      candidateRows.push({
        evidence: key,
        line: property.loc.start.line,
        owner,
        package: packageName,
        path,
        rule: 'plugin-config-channel',
        severity: 'P0',
      });
    }
    if (pluginConstructor === 'createBasePlugin' && key === 'component') {
      candidateRows.push({
        evidence: 'createBasePlugin component',
        line: property.loc.start.line,
        owner,
        package: packageName,
        path,
        rule: 'base-component-binding',
        severity: 'P0',
      });
    }
    if (
      key === 'initialState' &&
      property.type === 'ObjectProperty' &&
      property.value.type === 'TSSatisfiesExpression'
    ) {
      candidateRows.push({
        evidence: 'initialState satisfies',
        line: property.loc.start.line,
        owner,
        package: packageName,
        path,
        rule: 'initial-state-satisfies',
        severity: 'P1',
      });
    }
    if (
      key === 'useHooks' &&
      ['ArrowFunctionExpression', 'FunctionExpression'].includes(value.type)
    ) {
      candidateRows.push({
        evidence: 'inline useHooks callback',
        line: property.loc.start.line,
        owner,
        package: packageName,
        path,
        rule: 'hook-in-plugin-file',
        severity: 'P1',
      });
    }
    if (key === 'render') {
      const renderObject = returnedObject(value);
      const nodeProperty = renderObject?.properties.find(
        (member) =>
          ['ObjectMethod', 'ObjectProperty'].includes(member.type) &&
          getStaticKey(member.key) === 'node'
      );

      if (nodeProperty) {
        candidateRows.push({
          evidence: 'render.node',
          line: nodeProperty.loc.start.line,
          owner,
          package: packageName,
          path,
          rule: 'direct-render-node',
          severity: 'P0',
        });
      }
    }
    if (capabilityNames.has(key)) {
      const capabilityObject = returnedObject(value);

      for (const member of capabilityObject?.properties ?? []) {
        if (
          member.type === 'ObjectProperty' &&
          unwrapExpression(member.value)?.type === 'ObjectExpression'
        ) {
          candidateRows.push({
            evidence: `${key}.${getStaticKey(member.key)}`,
            line: member.loc.start.line,
            owner,
            package: packageName,
            path,
            rule: 'nested-plugin-capability',
            severity: 'P1',
          });
        }
      }
    }
  }
};

const collectPatternNames = (pattern, names = []) => {
  if (!pattern) return names;
  if (pattern.type === 'Identifier') names.push(pattern.name);
  if (pattern.type === 'AssignmentPattern') {
    collectPatternNames(pattern.left, names);
  }
  if (pattern.type === 'RestElement')
    collectPatternNames(pattern.argument, names);
  if (pattern.type === 'ObjectPattern') {
    for (const property of pattern.properties) {
      if (property.type === 'RestElement') {
        collectPatternNames(property.argument, names);
      } else {
        collectPatternNames(property.value, names);
      }
    }
  }
  if (pattern.type === 'ArrayPattern') {
    for (const element of pattern.elements) collectPatternNames(element, names);
  }

  return names;
};

const isTopLevelFunctionOwner = (node, ancestors) => {
  const parent = ancestors.at(-1);
  const grandparent = ancestors.at(-2);

  if (node.type === 'FunctionDeclaration') {
    return (
      parent?.type === 'Program' ||
      (parent?.type === 'ExportNamedDeclaration' &&
        grandparent?.type === 'Program')
    );
  }

  if (
    ['ArrowFunctionExpression', 'FunctionExpression'].includes(node.type) &&
    parent?.type === 'VariableDeclarator'
  ) {
    const declaration = ancestors.at(-2);
    const exportNode = ancestors.at(-3);

    return (
      declaration?.type === 'VariableDeclaration' &&
      (exportNode?.type === 'Program' ||
        (exportNode?.type === 'ExportNamedDeclaration' &&
          ancestors.at(-4)?.type === 'Program'))
    );
  }

  return false;
};

const functionOwnerName = (node, ancestors) => {
  if (node.type === 'FunctionDeclaration')
    return node.id?.name ?? '<anonymous>';
  const declarator = ancestors.at(-1);

  return getStaticKey(declarator?.id) ?? '<anonymous>';
};

const candidateRows = [];
const topologyRows = [];
const closurePath = join(artifactDirectory, 'plugin-source-closure.tsv');
const closurePaths = existsSync(closurePath)
  ? new Set(
      readFileSync(closurePath, 'utf8')
        .trim()
        .split('\n')
        .slice(1)
        .map((line) => line.split('\t')[1])
    )
  : undefined;
const packageDirectories = walk(packagesDirectory)
  .filter((path) => path.endsWith('/package.json'))
  .map((path) => dirname(path))
  .sort();

for (const packageDirectory of packageDirectories) {
  const packageName = relative(packagesDirectory, packageDirectory);
  const sourceDirectory = join(packageDirectory, 'src');
  const sourceFiles = existsSync(sourceDirectory)
    ? walk(sourceDirectory).filter((path) => sourceExtensionPattern.test(path))
    : [];

  for (const absolutePath of sourceFiles) {
    const path = relative(root, absolutePath);
    if (testPathPattern.test(path)) continue;

    const sourceText = readFileSync(absolutePath, 'utf8');
    const sourceFile = parse(sourceText, {
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
    const constructorAliases = new Map(
      [...constructors].map((name) => [name, name])
    );
    const pathSegments = path.split('/');
    const taxonomy = pathSegments.filter((segment) =>
      taxonomyDirectories.has(segment)
    );

    if (taxonomy.length > 0) {
      topologyRows.push({
        detail: taxonomy.join(','),
        package: packageName,
        path,
        rule: 'taxonomy-directory',
      });
    }
    if (/^use[A-Z].*\.(?:ts|tsx)$/.test(basename(path))) {
      topologyRows.push({
        detail: dirname(path),
        package: packageName,
        path,
        rule: 'hook-family-file',
      });
    }

    for (const statement of sourceFile.program.body) {
      if (statement.type !== 'ImportDeclaration') continue;

      const importSource = statement.source.value;
      for (const specifier of statement.specifiers) {
        if (specifier.type !== 'ImportSpecifier') continue;
        const importedName =
          specifier.imported.name ?? specifier.imported.value;
        if (constructors.has(importedName)) {
          constructorAliases.set(specifier.local.name, importedName);
        }
      }

      if (
        /(?:base-kit|static)/i.test(path) &&
        /(?:^|\/)react$/.test(importSource) &&
        /(?:^|\/)(?:platejs|@platejs)/.test(importSource)
      ) {
        candidateRows.push({
          evidence: importSource,
          line: statement.loc.start.line,
          owner: '<module>',
          package: packageName,
          path,
          rule: 'base-static-react-import',
          severity: 'P1',
        });
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

          if (initializer !== declarator.init) {
            candidateRows.push({
              evidence: `${initializer.name} alias cast`,
              line: declarator.loc.start.line,
              owner: declarator.id.name,
              package: packageName,
              path,
              rule: 'plugin-builder-cast',
              severity: 'P0',
            });
          }
        }
      }
    }

    const visit = (node, ancestors = []) => {
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

          if (initializer !== node.init) {
            candidateRows.push({
              evidence: `${initializer.name} alias cast`,
              line: node.loc.start.line,
              owner: node.id.name,
              package: packageName,
              path,
              rule: 'plugin-builder-cast',
              severity: 'P0',
            });
          }
        }
      }

      if (
        node.type === 'CallExpression' &&
        unwrapExpression(node.callee)?.type === 'MemberExpression'
      ) {
        const member = unwrapExpression(node.callee);
        const method = getStaticKey(member.property);

        if (
          node.callee !== member &&
          ['configure', 'extend'].includes(method)
        ) {
          candidateRows.push({
            evidence: `${method} callee cast`,
            line: node.loc.start.line,
            owner: '<call>',
            package: packageName,
            path,
            rule: 'plugin-builder-cast',
            severity: 'P0',
          });
        }

        if (forbiddenBuilderMethods.has(method)) {
          candidateRows.push({
            evidence: method,
            line: node.loc.start.line,
            owner: '<call>',
            package: packageName,
            path,
            rule: 'forbidden-builder-method',
            severity: method === 'extendSelectors' ? 'triage-receiver' : 'P0',
          });
        }

        if (['configure', 'extend'].includes(method)) {
          const declaration = [...ancestors]
            .reverse()
            .find((ancestor) => ancestor.type === 'VariableDeclarator');
          inspectContributionObject({
            object: returnedObject(node.arguments[0]),
            owner: getStaticKey(declaration?.id) ?? '<inline>',
            packageName,
            path,
          });
        }
      }

      if (
        node.type === 'CallExpression' &&
        unwrapExpression(node.callee)?.type === 'Identifier' &&
        deletedOptionHelpers.has(unwrapExpression(node.callee).name)
      ) {
        const callee = unwrapExpression(node.callee);
        candidateRows.push({
          evidence: callee.name,
          line: node.loc.start.line,
          owner: '<call>',
          package: packageName,
          path,
          rule: 'deleted-option-helper',
          severity: 'P0',
        });
      }

      if (
        node.type === 'CallExpression' &&
        unwrapExpression(node.callee)?.type === 'Identifier' &&
        constructorAliases.has(unwrapExpression(node.callee).name)
      ) {
        const callee = unwrapExpression(node.callee);
        const pluginConstructor = constructorAliases.get(callee.name);
        const declaration = [...ancestors]
          .reverse()
          .find((ancestor) => ancestor.type === 'VariableDeclarator');
        const owner = getStaticKey(declaration?.id) ?? '<inline>';
        const object = unwrapExpression(node.arguments[0]);

        if (node.callee !== callee) {
          candidateRows.push({
            evidence: `${pluginConstructor} callee cast`,
            line: node.loc.start.line,
            owner,
            package: packageName,
            path,
            rule: 'plugin-builder-cast',
            severity: 'P0',
          });
        }
        if (declaration?.id?.typeAnnotation) {
          candidateRows.push({
            evidence: 'annotated plugin variable',
            line: declaration.loc.start.line,
            owner,
            package: packageName,
            path,
            rule: 'plugin-export-annotation',
            severity: 'P1',
          });
        }
        if (
          declaration &&
          [
            'TSAsExpression',
            'TSSatisfiesExpression',
            'TypeCastExpression',
          ].includes(declaration.init?.type)
        ) {
          candidateRows.push({
            evidence: declaration.init.type,
            line: declaration.loc.start.line,
            owner,
            package: packageName,
            path,
            rule: 'plugin-export-cast',
            severity: 'P1',
          });
        }

        inspectContributionObject({
          pluginConstructor,
          object,
          owner,
          packageName,
          path,
        });
        if (pluginConstructor === 'toPlatePlugin') {
          inspectContributionObject({
            object: returnedObject(node.arguments[1]),
            owner,
            packageName,
            path,
          });
        }
      }

      if (
        node.type === 'TSTypeAliasDeclaration' &&
        node.typeAnnotation.type === 'TSTypeReference' &&
        getStaticKey(node.typeAnnotation.typeName) === 'PluginConfig' &&
        (node.typeAnnotation.typeParameters?.params.length ?? 0) === 1
      ) {
        candidateRows.push({
          evidence: node.id.name,
          line: node.loc.start.line,
          owner: node.id.name,
          package: packageName,
          path,
          rule: 'empty-plugin-config-alias',
          severity: 'P1',
        });
      }

      if (
        pluginFilePattern.test(path) &&
        !hookOwnerPattern.test(basename(path)) &&
        isTopLevelFunctionOwner(node, ancestors)
      ) {
        const owner = functionOwnerName(node, ancestors);
        if (hookOwnerPattern.test(owner)) {
          candidateRows.push({
            evidence: owner,
            line: node.loc.start.line,
            owner,
            package: packageName,
            path,
            rule: 'hook-in-plugin-file',
            severity: 'P1',
          });
        }
      }

      if (
        isTopLevelFunctionOwner(node, ancestors) &&
        (!closurePaths || closurePaths.has(path))
      ) {
        const owner = functionOwnerName(node, ancestors);
        const parameters = node.params.flatMap((parameter) =>
          collectPatternNames(parameter)
        );
        const threaded = [...new Set(parameters)].filter((name) =>
          contextParameterNames.has(name)
        );

        if (threaded.length > 0) {
          candidateRows.push({
            evidence: threaded.join(','),
            line: node.loc.start.line,
            owner,
            package: packageName,
            path,
            rule: 'context-parameter-helper',
            severity: 'triage-boundary',
          });
        }
      }

      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        getStaticKey(node.callee.property) === 'normalize'
      ) {
        const receiver = node.callee.object;
        const receiverText = sourceText.slice(receiver.start, receiver.end);

        if (receiverText === 'tx' || receiverText === 'editor.update') {
          candidateRows.push({
            evidence: `${receiverText}.normalize`,
            line: node.loc.start.line,
            owner: '<call>',
            package: packageName,
            path,
            rule: 'explicit-normalization',
            severity: 'triage-semantics',
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
}

candidateRows.sort((left, right) =>
  [left.package, left.path, String(left.line).padStart(8, '0'), left.rule]
    .join(':')
    .localeCompare(
      [
        right.package,
        right.path,
        String(right.line).padStart(8, '0'),
        right.rule,
      ].join(':')
    )
);
topologyRows.sort((left, right) =>
  [left.package, left.path, left.rule]
    .join(':')
    .localeCompare([right.package, right.path, right.rule].join(':'))
);

writeTsv(
  join(artifactDirectory, 'static-candidates.tsv'),
  ['package', 'rule', 'severity', 'path', 'line', 'owner', 'evidence'],
  candidateRows
);
writeTsv(
  join(artifactDirectory, 'topology-inventory.tsv'),
  ['package', 'rule', 'path', 'detail'],
  topologyRows
);

process.stdout.write(
  `${JSON.stringify(
    {
      candidateCount: candidateRows.length,
      rules: Object.fromEntries(
        [...new Set(candidateRows.map((row) => row.rule))].map((rule) => [
          rule,
          candidateRows.filter((row) => row.rule === rule).length,
        ])
      ),
      topologyRows: topologyRows.length,
    },
    null,
    2
  )}\n`
);
