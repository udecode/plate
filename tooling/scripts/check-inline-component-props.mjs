#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';
import { globSync } from 'tinyglobby';

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(scriptPath), '../..');

const sourcePatterns = [
  'apps/**/*.{ts,tsx,mts,cts}',
  'benchmarks/**/*.{ts,tsx,mts,cts}',
  'docs/**/*.{ts,tsx,mts,cts}',
  'packages/**/*.{ts,tsx,mts,cts}',
  'tooling/**/*.{ts,tsx,mts,cts}',
];

export const ignoredSourcePatterns = [
  '**/.next/**',
  '**/.turbo/**',
  '**/build/**',
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  'apps/www/src/__registry__/**',
  'apps/www/src/generated/**',
  'templates/**',
];

const sourceExtensions = ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx'];
const componentTypeNames = new Set([
  'ComponentType',
  'FC',
  'ForwardRefExoticComponent',
  'FunctionComponent',
  'MemoExoticComponent',
  'NamedExoticComponent',
]);
const propWrapperTypeNames = new Set([
  'Omit',
  'Partial',
  'Pick',
  'PropsWithChildren',
  'PropsWithoutRef',
  'Readonly',
  'Required',
]);
const skippedNodeKeys = new Set([
  'comments',
  'errors',
  'extra',
  'loc',
  'tokens',
]);

const toPosixPath = (value) => value.split(sep).join('/');
const compareStrings = (left, right) => left.localeCompare(right);
const isComponentName = (name) => /^[A-Z]/.test(name ?? '');

const walk = (node, visit, parent) => {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') visit(node, parent);

  for (const [key, value] of Object.entries(node)) {
    if (skippedNodeKeys.has(key)) continue;
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit, node);
    } else {
      walk(value, visit, node);
    }
  }
};

const parseSource = (source, file) =>
  parse(source, {
    errorRecovery: false,
    plugins: [
      'decorators-legacy',
      'explicitResourceManagement',
      'importAttributes',
      ...(file.endsWith('.tsx') ? ['jsx'] : []),
      'typescript',
    ],
    sourceFilename: file,
    sourceType: 'unambiguous',
  });

const getIdentifierName = (node) => {
  if (!node) return undefined;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'StringLiteral') return node.value;
  if (node.type === 'TSQualifiedName') return getIdentifierName(node.right);
  if (node.type === 'MemberExpression') return getIdentifierName(node.property);

  return undefined;
};

const unwrapType = (node) => {
  let current = node;

  while (
    current &&
    ['TSParenthesizedType', 'TSTypeAnnotation'].includes(current.type)
  ) {
    current = current.typeAnnotation;
  }

  return current;
};

const unwrapExpression = (node) => {
  let current = node;

  while (
    current &&
    [
      'ParenthesizedExpression',
      'TSAsExpression',
      'TSNonNullExpression',
      'TSSatisfiesExpression',
      'TypeCastExpression',
    ].includes(current.type)
  ) {
    current = current.expression;
  }

  return current;
};

const collectDirectPropAliases = (
  input,
  declarations,
  names = new Set(),
  nested = false
) => {
  const node = unwrapType(input);
  if (!node) return names;

  if (node.type === 'TSIntersectionType' || node.type === 'TSUnionType') {
    for (const type of node.types) {
      collectDirectPropAliases(type, declarations, names, nested);
    }

    return names;
  }
  if (node.type !== 'TSTypeReference') return names;

  const name = getIdentifierName(node.typeName);
  if (
    name &&
    declarations.has(name) &&
    (!nested || /(Options|Props)$/.test(name))
  ) {
    names.add(name);
    return names;
  }
  if (name && propWrapperTypeNames.has(name)) {
    for (const parameter of node.typeParameters?.params ?? []) {
      collectDirectPropAliases(parameter, declarations, names, true);
    }
  }

  return names;
};

const getAssignedName = (node, parents) => {
  let current = node;

  while (parents.has(current)) {
    const parent = parents.get(current);

    if (
      [
        'CallExpression',
        'ParenthesizedExpression',
        'TSAsExpression',
        'TSNonNullExpression',
        'TSSatisfiesExpression',
      ].includes(parent.type)
    ) {
      current = parent;
      continue;
    }
    if (parent.type === 'VariableDeclarator') {
      return getIdentifierName(parent.id);
    }
    if (parent.type === 'ObjectProperty' || parent.type === 'ObjectMethod') {
      return getIdentifierName(parent.key);
    }
    if (parent.type === 'ExportDefaultDeclaration') return 'default';

    break;
  }

  return undefined;
};

const getFunctionName = (node, parents) => {
  const declaredName = getIdentifierName(node.id);
  const assignedName = getAssignedName(node, parents);

  return isComponentName(declaredName)
    ? declaredName
    : (assignedName ?? declaredName);
};

const getCallName = (node) => {
  const callee = unwrapExpression(node.callee);
  if (callee?.type === 'Identifier') return callee.name;
  if (callee?.type === 'MemberExpression') {
    return getIdentifierName(callee.property);
  }

  return undefined;
};

const getWrapperPropTypes = (node, parents) => {
  const types = [];
  let current = node;

  while (parents.has(current)) {
    const parent = parents.get(current);
    if (
      [
        'ParenthesizedExpression',
        'TSAsExpression',
        'TSNonNullExpression',
        'TSSatisfiesExpression',
      ].includes(parent.type)
    ) {
      current = parent;
      continue;
    }
    if (parent.type !== 'CallExpression') break;

    const callName = getCallName(parent);
    if (callName === 'forwardRef') {
      const type = parent.typeParameters?.params?.[1];
      if (type) types.push(type);
    }
    if (callName === 'memo') {
      const type = parent.typeParameters?.params?.[0];
      if (type) types.push(type);
    }
    current = parent;
  }

  return types;
};

const getComponentTypeArgument = (input) => {
  const node = unwrapType(input);
  if (node?.type !== 'TSTypeReference') return undefined;

  const name = getIdentifierName(node.typeName);
  if (!name || !componentTypeNames.has(name)) return undefined;

  return node.typeParameters?.params?.at(-1);
};

const collectDeclarations = (ast) => {
  const declarations = new Map();
  const localExports = new Set();

  for (const statement of ast.program.body) {
    if (statement.type !== 'ExportNamedDeclaration' || statement.source) {
      continue;
    }
    for (const specifier of statement.specifiers) {
      localExports.add(getIdentifierName(specifier.local));
    }
  }

  walk(ast.program, (node, parent) => {
    if (
      node.type !== 'TSTypeAliasDeclaration' &&
      node.type !== 'TSInterfaceDeclaration'
    ) {
      return;
    }
    const { name } = node.id;
    declarations.set(name, {
      exported:
        parent?.type === 'ExportNamedDeclaration' || localExports.has(name),
      line: node.loc.start.line,
      name,
      node,
    });
  });

  return declarations;
};

const collectAliasReferenceDetails = (ast, name) => {
  const references = [];

  walk(ast.program, (node, parent) => {
    const isTypeReference =
      node.type === 'TSTypeReference' &&
      getIdentifierName(node.typeName) === name;
    const isHeritageReference =
      node.type === 'TSExpressionWithTypeArguments' &&
      getIdentifierName(node.expression) === name;

    if (isTypeReference || isHeritageReference) {
      references.push({
        context: parent?.type ?? 'unknown',
        line: node.loc.start.line,
      });
    }
  });

  return references;
};

const collectComponentAliasUses = (ast, declarations) => {
  const parents = new WeakMap();
  walk(ast.program, (node, parent) => {
    if (parent) parents.set(node, parent);
  });

  const uses = new Map();
  const addUse = (alias, component, node) => {
    const entries = uses.get(alias) ?? [];
    entries.push({ component, line: node.loc.start.line });
    uses.set(alias, entries);
  };
  const inspectType = (type, component) => {
    for (const alias of collectDirectPropAliases(type, declarations)) {
      addUse(alias, component, unwrapType(type));
    }
  };

  walk(ast.program, (node, parent) => {
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      const name = getFunctionName(node, parents);
      if (!isComponentName(name) && name !== 'default') return;

      const parameterType = node.params[0]?.typeAnnotation;
      if (parameterType) inspectType(parameterType, name);
      for (const wrapperType of getWrapperPropTypes(node, parents)) {
        inspectType(wrapperType, name);
      }
      if (parent?.type === 'VariableDeclarator') {
        const componentType = getComponentTypeArgument(
          parent.id.typeAnnotation
        );
        if (componentType) inspectType(componentType, name);
      }
      return;
    }

    if (node.type !== 'ClassDeclaration' || !isComponentName(node.id?.name)) {
      return;
    }
    const propType = node.superTypeParameters?.params?.[0];
    if (propType) inspectType(propType, node.id.name);
  });

  return uses;
};

const classifyPropType = (input, declarations) => {
  const node = unwrapType(input);
  if (!node) return 'untyped';

  if (
    node.type === 'TSTypeLiteral' ||
    node.type === 'TSIntersectionType' ||
    node.type === 'TSUnionType'
  ) {
    return 'inline';
  }
  if (node.type === 'TSTypeReference') {
    const name = getIdentifierName(node.typeName);
    return name && declarations.has(name)
      ? 'local-contract'
      : 'external-contract';
  }

  return 'inline';
};

const collectComponentManifest = (ast, declarations, file) => {
  const parents = new WeakMap();
  walk(ast.program, (node, parent) => {
    if (parent) parents.set(node, parent);
  });

  const components = [];
  const addComponent = ({ line, localAliases, name, propType }) => {
    components.push({
      file,
      line,
      localAliases: [...localAliases].sort(compareStrings),
      name,
      propType,
    });
  };

  walk(ast.program, (node, parent) => {
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      const name = getFunctionName(node, parents);
      if (!isComponentName(name) && name !== 'default') return;

      const typeNodes = [];
      if (node.params[0]?.typeAnnotation) {
        typeNodes.push(node.params[0].typeAnnotation);
      }
      typeNodes.push(...getWrapperPropTypes(node, parents));
      if (parent?.type === 'VariableDeclarator') {
        const componentType = getComponentTypeArgument(
          parent.id.typeAnnotation
        );
        if (componentType) typeNodes.push(componentType);
      }
      const aliases = new Set();
      for (const typeNode of typeNodes) {
        collectDirectPropAliases(typeNode, declarations, aliases);
      }
      const propType =
        typeNodes.length > 0
          ? classifyPropType(typeNodes[0], declarations)
          : node.params.length === 0
            ? 'none'
            : 'untyped';

      addComponent({
        line: node.loc.start.line,
        localAliases: aliases,
        name,
        propType,
      });
      return;
    }

    if (node.type !== 'ClassDeclaration' || !isComponentName(node.id?.name)) {
      return;
    }

    const propType = node.superTypeParameters?.params?.[0];
    addComponent({
      line: node.loc.start.line,
      localAliases: collectDirectPropAliases(propType, declarations),
      name: node.id.name,
      propType: propType ? classifyPropType(propType, declarations) : 'none',
    });
  });

  return components;
};

const resolveLocalModule = (cwd, fromFile, specifier, fileSet) => {
  let base;

  if (specifier.startsWith('.')) {
    base = resolve(cwd, dirname(fromFile), specifier);
  } else if (specifier.startsWith('@/')) {
    base = resolve(cwd, 'apps/www/src', specifier.slice(2));
  } else {
    return undefined;
  }

  const relativeBase = toPosixPath(relative(cwd, base));
  const extension = extname(relativeBase);
  const candidates = extension
    ? [relativeBase]
    : [
        ...sourceExtensions.map((suffix) => `${relativeBase}${suffix}`),
        ...sourceExtensions.map((suffix) => `${relativeBase}/index${suffix}`),
      ];

  return candidates.find((candidate) => fileSet.has(candidate));
};

const collectModuleLinks = (cwd, files, asts) => {
  const fileSet = new Set(files);
  const links = [];

  for (const file of files) {
    const { program } = asts.get(file);
    const usedIdentifiers = new Set();
    walk(program, (node, parent) => {
      if (
        node.type === 'Identifier' &&
        ![
          'ExportSpecifier',
          'ImportDefaultSpecifier',
          'ImportNamespaceSpecifier',
          'ImportSpecifier',
        ].includes(parent?.type)
      ) {
        usedIdentifiers.add(node.name);
      }
    });

    for (const statement of program.body) {
      if (
        statement.type !== 'ImportDeclaration' &&
        statement.type !== 'ExportNamedDeclaration' &&
        statement.type !== 'ExportAllDeclaration'
      ) {
        continue;
      }
      if (!statement.source) continue;

      const target = resolveLocalModule(
        cwd,
        file,
        statement.source.value,
        fileSet
      );
      if (!target) continue;

      if (statement.type === 'ImportDeclaration') {
        for (const specifier of statement.specifiers) {
          if (specifier.type !== 'ImportSpecifier') continue;
          links.push({
            file,
            imported: getIdentifierName(specifier.imported),
            kind: 'import',
            local: specifier.local.name,
            target,
            used: usedIdentifiers.has(specifier.local.name),
          });
        }
        continue;
      }
      if (statement.type === 'ExportAllDeclaration') {
        links.push({ file, kind: 'export-all', target });
        continue;
      }

      for (const specifier of statement.specifiers) {
        if (specifier.type !== 'ExportSpecifier') continue;
        links.push({
          exported: getIdentifierName(specifier.exported),
          file,
          imported: getIdentifierName(specifier.local),
          kind: 'reexport',
          target,
        });
      }
    }
  }

  return links;
};

const traceExternalContract = (candidate, links) => {
  const reachable = new Set([`${candidate.file}\0${candidate.name}`]);
  const consumers = new Set();
  const reexports = new Set();
  let changed = true;

  while (changed) {
    changed = false;
    for (const link of links) {
      if (link.kind === 'import') continue;

      const imported =
        link.kind === 'export-all' ? candidate.name : link.imported;
      if (!reachable.has(`${link.target}\0${imported}`)) continue;

      const exported = link.kind === 'export-all' ? imported : link.exported;
      const key = `${link.file}\0${exported}`;
      reexports.add(`${link.file}:${exported}`);
      if (!reachable.has(key)) {
        reachable.add(key);
        changed = true;
      }
    }
  }

  for (const link of links) {
    if (
      link.kind === 'import' &&
      link.used &&
      reachable.has(`${link.target}\0${link.imported}`)
    ) {
      consumers.add(`${link.file}:${link.local}`);
    }
  }

  return {
    externalConsumers: [...consumers].sort(compareStrings),
    reachableFiles: [
      ...new Set([...reachable].map((key) => key.slice(0, key.indexOf('\0')))),
    ].sort(compareStrings),
    reexports: [...reexports].sort(compareStrings),
  };
};

const discoverPublicEntrypointFiles = (cwd) => {
  const entrypoints = new Set();
  const addCandidate = (candidate) => {
    if (existsSync(resolve(cwd, candidate))) entrypoints.add(candidate);
  };
  const addSourceStem = (sourceStem) => {
    for (const candidate of [
      ...sourceExtensions.map((extension) => `${sourceStem}${extension}`),
      ...sourceExtensions.map((extension) => `${sourceStem}/index${extension}`),
    ]) {
      addCandidate(candidate);
    }
  };
  const manifests = globSync('packages/*/package.json', {
    cwd,
    onlyFiles: true,
  });

  for (const manifest of manifests) {
    const packageRoot = dirname(manifest);
    const json = JSON.parse(readFileSync(resolve(cwd, manifest), 'utf-8'));
    for (const subpath of Object.keys(json.exports ?? {})) {
      if (subpath === './package.json') continue;

      const sourceStem =
        subpath === '.'
          ? `${packageRoot}/src/index`
          : `${packageRoot}/src/${subpath.slice(2)}`;
      addSourceStem(sourceStem);
    }
  }

  const tsconfigPath = resolve(cwd, 'tsconfig.json');
  if (existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
    for (const targets of Object.values(
      tsconfig.compilerOptions?.paths ?? {}
    )) {
      for (const target of targets) {
        if (target.includes('*')) continue;
        const source = toPosixPath(target.replace(/^\.\//, ''));
        if (sourceExtensions.includes(extname(source))) {
          addCandidate(source);
        } else {
          addSourceStem(source);
        }
      }
    }
  }

  return entrypoints;
};

export function auditInlineComponentProps({ cwd = repoRoot, files } = {}) {
  const reviewedFiles = (
    files ??
    globSync(sourcePatterns, {
      cwd,
      ignore: ignoredSourcePatterns,
      onlyFiles: true,
    })
  )
    .map(toPosixPath)
    .sort(compareStrings);
  const asts = new Map();
  const candidates = [];
  const components = [];

  for (const file of reviewedFiles) {
    const ast = parseSource(readFileSync(resolve(cwd, file), 'utf-8'), file);
    asts.set(file, ast);
    if (!file.endsWith('.tsx')) continue;

    const declarations = collectDeclarations(ast);
    components.push(...collectComponentManifest(ast, declarations, file));
    const componentUses = collectComponentAliasUses(ast, declarations);
    for (const [name, uses] of componentUses) {
      const declaration = declarations.get(name);
      const references = collectAliasReferenceDetails(ast, name);
      candidates.push({
        components: [...new Set(uses.map((use) => use.component))].sort(
          compareStrings
        ),
        exported: declaration.exported,
        file,
        genericParameters:
          declaration.node.typeParameters?.params?.map(
            (parameter) => parameter.name
          ) ?? [],
        kind:
          declaration.node.type === 'TSInterfaceDeclaration'
            ? 'interface'
            : 'type',
        line: declaration.line,
        name,
        referenceContexts: [
          ...new Set(references.map(({ context }) => context)),
        ].sort(compareStrings),
        referenceCount: references.length,
        referenceLines: [...new Set(references.map(({ line }) => line))].sort(
          (left, right) => left - right
        ),
        useLines: [...new Set(uses.map((use) => use.line))].sort(
          (left, right) => left - right
        ),
      });
    }
  }

  const links = collectModuleLinks(cwd, reviewedFiles, asts);
  const publicEntrypoints = discoverPublicEntrypointFiles(cwd);
  const auditedCandidates = candidates
    .map((candidate) => {
      const contract = candidate.exported
        ? traceExternalContract(candidate, links)
        : { externalConsumers: [], reachableFiles: [], reexports: [] };
      const publicEntrypoint =
        candidate.exported &&
        contract.reachableFiles.some((file) => publicEntrypoints.has(file));

      return {
        ...candidate,
        decision:
          candidate.exported &&
          (contract.externalConsumers.length > 0 || publicEntrypoint)
            ? 'keep'
            : 'inline',
        ...contract,
        publicEntrypoint,
      };
    })
    .sort((left, right) =>
      compareStrings(`${left.file}:${left.line}`, `${right.file}:${right.line}`)
    );

  return {
    candidateCount: auditedCandidates.length,
    candidateFileCount: new Set(
      auditedCandidates.map((candidate) => candidate.file)
    ).size,
    candidates: auditedCandidates,
    componentCount: components.length,
    componentFileCount: new Set(components.map((component) => component.file))
      .size,
    components: components.sort((left, right) =>
      compareStrings(`${left.file}:${left.line}`, `${right.file}:${right.line}`)
    ),
    ignoredSourcePatterns,
    issueCount: auditedCandidates.filter(
      (candidate) => candidate.decision === 'inline'
    ).length,
    reviewedSourceFileCount: reviewedFiles.length,
    reviewedTsxFileCount: reviewedFiles.filter((file) => file.endsWith('.tsx'))
      .length,
  };
}

const formatIssue = (candidate) =>
  `${candidate.file}:${candidate.line}: inline ${candidate.name} into ${candidate.components.join(', ')}; named component prop types require a used export or published entrypoint contract`;

function run() {
  const args = process.argv.slice(2);
  const reportIndex = args.indexOf('--report');
  const reportPath = reportIndex === -1 ? undefined : args[reportIndex + 1];
  const result = auditInlineComponentProps();
  const output = `${JSON.stringify(result, null, 2)}\n`;

  if (reportPath) {
    const absoluteReport = resolve(repoRoot, reportPath);
    if (!existsSync(dirname(absoluteReport))) {
      throw new Error(
        `Report directory does not exist: ${dirname(absoluteReport)}`
      );
    }
    writeFileSync(absoluteReport, output);
  }
  if (args.includes('--json')) {
    process.stdout.write(output);
    return;
  }
  if (result.issueCount > 0) {
    console.error(
      `Inline component prop audit failed (${result.issueCount}/${result.candidateCount} aliases; ${result.reviewedTsxFileCount} TSX files reviewed).`
    );
    for (const candidate of result.candidates) {
      if (candidate.decision === 'inline') {
        console.error(`- ${formatIssue(candidate)}`);
      }
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Inline component prop audit passed (${result.candidateCount} retained exported contracts; ${result.reviewedTsxFileCount} TSX files reviewed).`
  );
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) run();
