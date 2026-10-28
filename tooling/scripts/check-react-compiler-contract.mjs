#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { parse } from '@babel/parser';

import {
  enforceBaseline,
  groupFindings,
  lineIdentity,
  readBaseline,
} from './finding-baseline.mjs';

const repoRoot = resolve(import.meta.dirname, '../..');
const BASELINE = 'tooling/scripts/check-react-compiler-contract-baseline.json';
const RENDER_STATE_READ = 'render-state-read';
const registryRoot = 'apps/www/src/registry/';
const copiedUiRoot = 'apps/www/src/registry/components/editor/';
const skippedManifestRoots = [
  'apps/www/public/',
  'docs/transplant/',
  'templates/',
];
const exactReactVersion = '19.2.8';

const getMemberName = (node) => {
  if (
    node?.type !== 'MemberExpression' &&
    node?.type !== 'OptionalMemberExpression'
  ) {
    return undefined;
  }
  if (!node.computed && node.property.type === 'Identifier') {
    return node.property.name;
  }
  if (node.computed && node.property.type === 'StringLiteral') {
    return node.property.value;
  }

  return undefined;
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

const walk = (node, visit) => {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') visit(node);

  for (const [key, value] of Object.entries(node)) {
    if (['comments', 'errors', 'extra', 'loc', 'tokens'].includes(key)) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit);
    } else {
      walk(value, visit);
    }
  }
};

const createIssue = (file, node, reason) => ({
  column: node?.loc?.start.column === undefined ? 1 : node.loc.start.column + 1,
  file,
  line: node?.loc?.start.line ?? 1,
  reason,
});

const parseReactSource = (source, file) =>
  parse(source, {
    errorRecovery: false,
    plugins: ['decorators-legacy', 'importAttributes', 'jsx', 'typescript'],
    sourceFilename: file,
    sourceType: 'unambiguous',
  });

const functionTypes = new Set([
  'ArrowFunctionExpression',
  'ClassMethod',
  'FunctionDeclaration',
  'FunctionExpression',
  'ObjectMethod',
]);
const callTypes = new Set(['CallExpression', 'OptionalCallExpression']);
const memberTypes = new Set(['MemberExpression', 'OptionalMemberExpression']);
const skippedKeys = new Set(['comments', 'errors', 'extra', 'loc', 'tokens']);

const isRenderFunctionName = (name) =>
  /^[A-Z]/.test(name) || /^use[A-Z]/.test(name);

const renderCallbackCalls = new Set([
  'every',
  'filter',
  'find',
  'findIndex',
  'flatMap',
  'forEach',
  'map',
  'reduce',
  'some',
  'toSorted',
  'useMemo',
]);
const handleCalls = new Set(['plugin', 'useEditor', 'useEditorRef']);
const isStoreHook = (name) => /^use\w*Store$/.test(name ?? '');

const chainOf = (expression) => {
  const called = [];
  const names = [];
  let current = unwrapExpression(expression);

  while (current) {
    if (memberTypes.has(current.type)) {
      names.unshift(getMemberName(current));
      current = unwrapExpression(current.object);
    } else if (callTypes.has(current.type)) {
      current = unwrapExpression(current.callee);
      called.push(
        current.type === 'Identifier' ? current.name : getMemberName(current)
      );
    } else {
      if (current.type === 'Identifier') names.unshift(current.name);
      break;
    }
  }

  return { called, names };
};

const createHandleExpander = (ast) => {
  const chains = new Map();
  const declarations = [];
  const expand = (names) => [
    ...(chains.get(names[0]) ?? names.slice(0, 1)),
    ...names.slice(1),
  ];

  walk(ast, (node) => {
    if (
      node.type === 'VariableDeclarator' &&
      node.init &&
      !functionTypes.has(unwrapExpression(node.init).type)
    ) {
      declarations.push(node);
    }
  });

  let changed = true;
  while (changed) {
    changed = false;
    for (const { id, init } of declarations) {
      const { called, names } = chainOf(init);
      const call = unwrapExpression(init);
      const storeHandle =
        callTypes.has(call.type) &&
        call.arguments.length === 0 &&
        isStoreHook(called[0]);
      if (
        names.length === 0 ||
        !(storeHandle || called.every((name) => handleCalls.has(name)))
      ) {
        continue;
      }

      const base = expand(names);
      const bindings =
        id.type === 'Identifier'
          ? [[id.name, base]]
          : id.type === 'ObjectPattern'
            ? id.properties
                .filter(
                  (property) =>
                    property.type === 'ObjectProperty' &&
                    !property.computed &&
                    property.value.type === 'Identifier'
                )
                .map((property) => [
                  property.value.name,
                  [...base, property.key.name ?? property.key.value],
                ])
            : [];

      for (const [name, chain] of bindings) {
        if (!chains.has(name)) {
          chains.set(name, chain);
          changed = true;
        }
      }
    }
  }

  return expand;
};

const isStateRead = (call, expand) => {
  const chain = chainOf(call.callee);
  const names = expand(chain.names);
  const last = names.at(-1);
  const pluginIndex = names.indexOf('plugin');

  const opensPlugin = last === 'plugin';
  const usesAnotherCallResult = chain.called.some(
    (name) => !handleCalls.has(name) && !isStoreHook(name)
  );
  if (opensPlugin || usesAnotherCallResult) return false;

  return (
    names.includes('read') ||
    (pluginIndex !== -1 && names.includes('api', pluginIndex)) ||
    (isStoreHook(names[0]) && /^get[A-Z]/.test(last)) ||
    (['get', 'getSnapshot'].includes(last) &&
      names.length > 1 &&
      call.arguments.length === 0)
  );
};

const visitRender = (node, onCall) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) visitRender(child, onCall);
    return;
  }
  if (typeof node.type !== 'string' || functionTypes.has(node.type)) return;
  if (callTypes.has(node.type)) {
    onCall(node);
    if (renderCallbackCalls.has(chainOf(node.callee).names.at(-1))) {
      for (const callback of node.arguments) {
        if (functionTypes.has(callback.type)) {
          visitRender(callback.body, onCall);
        }
      }
    }
  }
  for (const [key, value] of Object.entries(node)) {
    if (!skippedKeys.has(key)) visitRender(value, onCall);
  }
};

const topLevelFunctions = (ast) =>
  ast.program.body.flatMap((statement) => {
    const declaration =
      statement.type === 'ExportNamedDeclaration' ||
      statement.type === 'ExportDefaultDeclaration'
        ? statement.declaration
        : statement;

    if (declaration?.type === 'FunctionDeclaration' && declaration.id) {
      return [[declaration.id.name, declaration]];
    }
    if (declaration?.type !== 'VariableDeclaration') return [];

    return declaration.declarations.flatMap((declarator) => {
      const init = unwrapExpression(declarator.init);

      return declarator.id.type === 'Identifier' &&
        functionTypes.has(init?.type)
        ? [[declarator.id.name, init]]
        : [];
    });
  });

const isStaticRenderer = (file) => file.endsWith('-static.tsx');

const auditRenderStateReads = (ast, source, file) => {
  if (isStaticRenderer(file)) return [];

  const expand = createHandleExpander(ast);
  const functions = topLevelFunctions(ast);
  const readingHelpers = new Map();
  const readOf = (call) => {
    if (isStateRead(call, expand)) return call;
    const callee = unwrapExpression(call.callee);

    return callee.type === 'Identifier'
      ? readingHelpers.get(callee.name)
      : undefined;
  };

  let changed = true;
  while (changed) {
    changed = false;
    for (const [name, fn] of functions) {
      if (isRenderFunctionName(name) || readingHelpers.has(name)) continue;
      visitRender(fn.body, (call) => {
        const read = readOf(call);
        if (read && !readingHelpers.has(name)) {
          readingHelpers.set(name, read);
          changed = true;
        }
      });
    }
  }

  const issues = [];
  for (const [name, fn] of functions) {
    if (!isRenderFunctionName(name)) continue;
    visitRender(fn.body, (call) => {
      const read = readOf(call);
      if (!read) return;

      const text = source.slice(read.start, read.end).replace(/\s+/g, ' ');
      const shown = text.length > 80 ? `${text.slice(0, 77)}...` : text;
      const via =
        read === call
          ? ''
          : ` through ${source.slice(call.callee.start, call.callee.end)}()`;

      issues.push({
        ...createIssue(
          file,
          call,
          `${name} calls ${shown}${via} while rendering, and the React Compiler caches that read of editor or plugin state on its receiver and arguments; subscribe with useEditorSelector or usePluginStore, read it in a handler or effect, or take a mount-time snapshot with useState(() => ...)`
        ),
        identity: lineIdentity(source, call.loc.start.line),
        rule: RENDER_STATE_READ,
      });
    });
  }

  return issues;
};

export function auditRegistryReactSource(source, file = 'fixture.tsx') {
  if (!file.startsWith(registryRoot)) return [];

  const ast = parseReactSource(source, file);
  const namespaces = new Set();
  const memoBindings = new Set();
  const variableDeclarations = [];

  walk(ast, (node) => {
    if (node.type === 'ImportDeclaration' && node.source.value === 'react') {
      for (const specifier of node.specifiers) {
        if (
          specifier.type === 'ImportDefaultSpecifier' ||
          specifier.type === 'ImportNamespaceSpecifier'
        ) {
          namespaces.add(specifier.local.name);
        }
        if (
          specifier.type === 'ImportSpecifier' &&
          (specifier.imported.name ?? specifier.imported.value) === 'memo'
        ) {
          memoBindings.add(specifier.local.name);
        }
      }
    }
    if (
      node.type === 'VariableDeclarator' &&
      node.id.type === 'Identifier' &&
      node.init
    ) {
      variableDeclarations.push(node);
    }
  });

  let changed = true;
  while (changed) {
    changed = false;
    for (const declaration of variableDeclarations) {
      const init = unwrapExpression(declaration.init);
      if (init?.type === 'Identifier' && namespaces.has(init.name)) {
        changed ||= !namespaces.has(declaration.id.name);
        namespaces.add(declaration.id.name);
      }
      if (
        (init?.type === 'Identifier' && memoBindings.has(init.name)) ||
        (init?.type === 'MemberExpression' &&
          getMemberName(init) === 'memo' &&
          unwrapExpression(init.object)?.type === 'Identifier' &&
          namespaces.has(unwrapExpression(init.object).name))
      ) {
        changed ||= !memoBindings.has(declaration.id.name);
        memoBindings.add(declaration.id.name);
      }
    }
  }

  const issues = [];
  walk(ast, (node) => {
    if (node.type === 'CallExpression') {
      const callee = unwrapExpression(node.callee);
      const isMemoBinding =
        callee?.type === 'Identifier' && memoBindings.has(callee.name);
      const object =
        callee?.type === 'MemberExpression'
          ? unwrapExpression(callee.object)
          : undefined;
      const isMemoMember =
        callee?.type === 'MemberExpression' &&
        getMemberName(callee) === 'memo' &&
        object?.type === 'Identifier' &&
        namespaces.has(object.name);

      if (isMemoBinding || isMemoMember) {
        issues.push(
          createIssue(
            file,
            node,
            'copied registry components rely on React Compiler and must not use manual memoization'
          )
        );
      }
    }

    if (
      node.type === 'AssignmentExpression' &&
      getMemberName(unwrapExpression(node.left)) === 'displayName'
    ) {
      issues.push(
        createIssue(
          file,
          node,
          'copied registry components must use named functions instead of displayName assignments'
        )
      );
    }
  });

  if (file.startsWith(copiedUiRoot)) {
    issues.push(...auditRenderStateReads(ast, source, file));
  }

  return issues;
}

export function auditReactCompilerTextContract({
  appConfigs,
  compilerConfig,
  lintConfig,
  lockfile,
  manifests,
}) {
  const issues = [];
  const report = (file, reason) =>
    issues.push({ column: 1, file, line: 1, reason });

  if (
    !/babel-plugin-react-compiler['"][\s\S]{0,240}?target:\s*['"]19['"]/.test(
      compilerConfig.source
    )
  ) {
    report(
      compilerConfig.file,
      'package compilation must target the React 19 runtime'
    );
  }

  if (lintConfig) {
    const enabledReactRules = [
      'react/display-name',
      'react/immutability',
      'react/preserve-manual-memoization',
      'react/refs',
      'react/set-state-in-effect',
      'react/use-memo',
    ];
    const disabledCompilerRules = [
      ...lintConfig.source.matchAll(
        /['"]react\/(immutability|refs|set-state-in-effect|use-memo)['"]\s*:\s*['"]off['"]/g
      ),
    ];
    const hasExactRenderProbeBoundary =
      /files:\s*\[\s*['"]packages\/plitejs\/test\/react\/render-probes\/\*\*\/\*\.\{ts,tsx\}['"]\s*\][\s\S]{0,240}?['"]react\/immutability['"]\s*:\s*['"]off['"]/.test(
        lintConfig.source
      );

    if (
      disabledCompilerRules.length !== 1 ||
      disabledCompilerRules[0]?.[1] !== 'immutability'
    ) {
      report(
        lintConfig.file,
        'only react/immutability may be disabled, once, for the structural render-probe boundary'
      );
    }
    if (!hasExactRenderProbeBoundary) {
      report(
        lintConfig.file,
        'render-probe immutability exemption must use the exact shared directory boundary'
      );
    }
    for (const rule of enabledReactRules) {
      const escapedRule = rule.replace('/', '\\/');

      if (
        !new RegExp(`['"]${escapedRule}['"]\\s*:\\s*['"]error['"]`).test(
          lintConfig.source
        )
      ) {
        report(lintConfig.file, `${rule} must be explicitly enabled`);
      }
    }
    if (
      !/['"]react-doctor\/react-compiler-no-manual-memoization['"]\s*:\s*['"]off['"]/.test(
        lintConfig.source
      )
    ) {
      report(
        lintConfig.file,
        'the React Doctor manual-memoization ban must remain disabled'
      );
    }
  }

  for (const manifest of manifests) {
    const json = JSON.parse(manifest.source);
    for (const field of [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ]) {
      const dependencies = json[field] ?? {};
      if ('react-compiler-runtime' in dependencies) {
        report(
          manifest.file,
          `React 19 manifests must not depend on react-compiler-runtime (${field})`
        );
      }
      for (const name of ['react', 'react-dom']) {
        const version = dependencies[name];
        if (
          /^\d+\.\d+\.\d+$/.test(version ?? '') &&
          version !== exactReactVersion
        ) {
          report(
            manifest.file,
            `exact ${name} versions must be ${exactReactVersion}, found ${version}`
          );
        }
      }
    }
  }

  if (lockfile.source.includes('react-compiler-runtime')) {
    report(
      lockfile.file,
      'the lockfile must not retain react-compiler-runtime'
    );
  }

  for (const appConfig of appConfigs) {
    for (const [pattern, reason] of [
      [/\breactCompiler:\s*true\b/, 'must enable React Compiler'],
      [
        /\bturbopackRustReactCompiler:\s*true\b/,
        'must enable the Turbopack Rust React Compiler',
      ],
      [/\btypedRoutes:\s*true\b/, 'must enable typed routes'],
      [
        /\bturbopack\s*:[\s\S]{0,600}?\broot\s*:/,
        'must declare the Turbopack repository root',
      ],
    ]) {
      if (!pattern.test(appConfig.source)) {
        report(appConfig.file, `${appConfig.name} ${reason}`);
      }
    }
  }

  return issues;
}

const collectFiles = (...args) =>
  execFileSync('rg', ['--files', ...args], {
    cwd: repoRoot,
    encoding: 'utf-8',
  })
    .trim()
    .split('\n')
    .filter(Boolean)
    .sort();

export function auditReactCompilerContract() {
  const registryFiles = collectFiles(
    'apps/www/src/registry',
    '-g',
    '*.ts',
    '-g',
    '*.tsx'
  );
  const registryIssues = registryFiles.flatMap((file) =>
    auditRegistryReactSource(
      readFileSync(resolve(repoRoot, file), 'utf-8'),
      file
    )
  );
  const manifestFiles = collectFiles('-g', 'package.json').filter(
    (file) => !skippedManifestRoots.some((root) => file.startsWith(root))
  );
  const textIssues = auditReactCompilerTextContract({
    appConfigs: [
      {
        file: 'apps/www/next.config.ts',
        name: 'www',
        source: readFileSync(
          resolve(repoRoot, 'apps/www/next.config.ts'),
          'utf-8'
        ),
      },
      {
        file: 'apps/plite/next.config.ts',
        name: 'Plite',
        source: readFileSync(
          resolve(repoRoot, 'apps/plite/next.config.ts'),
          'utf-8'
        ),
      },
    ],
    compilerConfig: {
      file: 'tooling/config/tsdown.config.ts',
      source: readFileSync(
        resolve(repoRoot, 'tooling/config/tsdown.config.ts'),
        'utf-8'
      ),
    },
    lockfile: {
      file: 'pnpm-lock.yaml',
      source: readFileSync(resolve(repoRoot, 'pnpm-lock.yaml'), 'utf-8'),
    },
    lintConfig: {
      file: 'oxlint.config.ts',
      source: readFileSync(resolve(repoRoot, 'oxlint.config.ts'), 'utf-8'),
    },
    manifests: manifestFiles.map((file) => ({
      file,
      source: readFileSync(resolve(repoRoot, file), 'utf-8'),
    })),
  });

  return {
    fileCount: registryFiles.length + manifestFiles.length + 4,
    issues: [...registryIssues, ...textIssues],
  };
}

const formatIssue = (issue) =>
  `- ${issue.file}:${issue.line}:${issue.column}: ${issue.reason}`;

function runAudit() {
  const { fileCount, issues } = auditReactCompilerContract();
  const reads = issues.filter((issue) => issue.rule === RENDER_STATE_READ);
  const failures = issues.filter((issue) => issue.rule !== RENDER_STATE_READ);

  if (failures.length > 0) {
    console.error('React Compiler contract audit failed:');
    console.error(failures.map(formatIssue).join('\n'));
    process.exit(1);
  }

  const known = readBaseline(BASELINE)[RENDER_STATE_READ] ?? {};
  process.exitCode = enforceBaseline({
    file: BASELINE,
    found: { [RENDER_STATE_READ]: {}, ...groupFindings(reads) },
    lowerCommand: 'node tooling/scripts/check-react-compiler-contract.mjs',
    mode: process.argv.includes('--check')
      ? 'check'
      : process.argv.includes('--init')
        ? 'init'
        : 'lower',
    newFindingsHelp: [
      'New render-time reads of editor or plugin state in copied UI:',
      ...reads
        .filter((issue) => !known[issue.file]?.includes(issue.identity))
        .map(formatIssue),
    ].join('\n'),
    rules: [RENDER_STATE_READ],
  });
  if (process.exitCode === 0) {
    console.log(`React Compiler contract audit passed (${fileCount} files).`);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runAudit();
}
