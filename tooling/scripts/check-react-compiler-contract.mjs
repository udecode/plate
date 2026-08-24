#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { parse } from '@babel/parser';

const repoRoot = resolve(import.meta.dirname, '../..');
const registryRoot = 'apps/www/src/registry/';
const skippedManifestRoots = [
  'apps/www/public/',
  'docs/transplant/',
  'templates/',
];
const exactReactVersion = '19.2.8';

const getMemberName = (node) => {
  if (node?.type !== 'MemberExpression') return undefined;
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
      /files:\s*\[\s*['"]packages\/plite-react\/test\/render-probes\/\*\*\/\*\.\{ts,tsx\}['"]\s*\][\s\S]{0,240}?['"]react\/immutability['"]\s*:\s*['"]off['"]/.test(
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

function runAudit() {
  const { fileCount, issues } = auditReactCompilerContract();

  if (issues.length > 0) {
    console.error('React Compiler contract audit failed:');
    for (const issue of issues) {
      console.error(
        `- ${issue.file}:${issue.line}:${issue.column}: ${issue.reason}`
      );
    }
    process.exit(1);
  }

  console.log(`React Compiler contract audit passed (${fileCount} files).`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runAudit();
}
