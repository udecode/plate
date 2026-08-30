import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { parse } from '@babel/parser';

import oxlintConfig from '../../oxlint.config.ts';
import {
  entrypointRuntimes,
  getPublicEntrypointRuntimeRows,
  publicFeatureDependencies,
  publicFeatureReactEntrypoints,
  publicReactOnlyEntrypoints,
  rootFeatureDependencies,
} from '../entrypoints/entrypoint-dag.mjs';
import {
  assertEntrypointDags,
  entrypointDagRule,
  entrypointDags,
} from '../oxlint/entrypoint-dag-plugin.mjs';

const repositoryRoot = '/virtual/plate';

const getModuleSpecifiers = (source) => {
  const specifiers = [];
  const ast = parse(source, {
    plugins: ['importAttributes', 'jsx', 'typescript'],
    sourceType: 'unambiguous',
  });

  const visit = (node) => {
    if (!node || typeof node !== 'object') return;

    if (
      (node.type === 'ImportDeclaration' ||
        node.type === 'ExportAllDeclaration' ||
        node.type === 'ExportNamedDeclaration') &&
      node.source?.type === 'StringLiteral'
    ) {
      specifiers.push(node.source.value);
    }
    if (
      node.type === 'ImportExpression' &&
      node.source.type === 'StringLiteral'
    ) {
      specifiers.push(node.source.value);
    }
    if (
      node.type === 'CallExpression' &&
      (node.callee.type === 'Import' ||
        (node.callee.type === 'Identifier' &&
          node.callee.name === 'require')) &&
      node.arguments[0]?.type === 'StringLiteral'
    ) {
      specifiers.push(node.arguments[0].value);
    }
    if (
      node.type === 'TSImportType' &&
      node.argument.type === 'StringLiteral'
    ) {
      specifiers.push(node.argument.value);
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else {
        visit(value);
      }
    }
  };

  visit(ast);

  return specifiers;
};

test('enables the DAG and CommonJS ban on both package source trees', () => {
  const boundaryOverride = oxlintConfig.overrides.find(
    (override) =>
      override.files?.includes(
        'packages/platejs/src/**/*.{cjs,cts,js,jsx,mjs,mjsx,mts,ts,tsx}'
      ) &&
      override.files.includes(
        'packages/plitejs/src/**/*.{cjs,cts,js,jsx,mjs,mjsx,mts,ts,tsx}'
      )
  );

  assert.deepEqual(boundaryOverride?.rules, {
    'entrypoint-dag/no-forbidden-imports': 'error',
    'import/no-commonjs': 'error',
  });
});

test('allows only exact Plate facade bridges and raw Plite proofs to import plitejs', () => {
  const restriction = oxlintConfig.overrides.find(
    (override) =>
      override.excludeFiles?.includes('packages/platejs/src/facade.ts') &&
      override.rules?.['no-restricted-imports']
  );
  const [, options] = restriction.rules['no-restricted-imports'];
  const plitePattern = options.patterns.find(
    (pattern) => pattern.regex === '^plitejs(?:/|$)'
  );

  assert.ok(plitePattern);
  assert.deepEqual(restriction.excludeFiles, [
    'packages/platejs/src/core.tsx',
    'packages/platejs/src/diff/index.ts',
    'packages/platejs/src/diff/plite-diff.internal.ts',
    'packages/platejs/src/dom/index.ts',
    'packages/platejs/src/dom/plite-dom.internal.ts',
    'packages/platejs/src/facade.ts',
    'packages/platejs/src/history/index.ts',
    'packages/platejs/src/history/plite-history.internal.ts',
    'packages/platejs/src/hyperscript/index.ts',
    'packages/platejs/src/page-layout/index.ts',
    'packages/platejs/src/page-layout/react/index.ts',
    'packages/platejs/src/react/internal/plite-components.ts',
    'packages/platejs/src/react/internal/plite-types.ts',
    'packages/platejs/src/react/plite-react.ts',
    'packages/platejs/src/static/internal/plite-react.ts',
    'packages/platejs/src/testing/index.ts',
    'packages/plitejs/test/**',
    'config/plite-test-jsx.js',
    'apps/www/src/app/(app)/examples/plite/**',
  ]);
});

test('keeps the Plate raw Plite allowlist equal to every source and test import', () => {
  const restriction = oxlintConfig.overrides.find(
    (override) =>
      override.excludeFiles?.includes('packages/platejs/src/facade.ts') &&
      override.rules?.['no-restricted-imports']
  );
  const expectedBridgeFiles = restriction.excludeFiles
    .filter(
      (file) => file.startsWith('packages/platejs/src/') && !file.includes('*')
    )
    .toSorted();
  const actualBridgeFiles = [
    'packages/platejs/src',
    'packages/platejs/test',
    'packages/platejs/type-tests',
  ]
    .flatMap((auditRoot) =>
      readdirSync(auditRoot, { recursive: true })
        .filter(
          (file) => typeof file === 'string' && /\.[cm]?[jt]sx?$/u.test(file)
        )
        .map((file) => path.join(auditRoot, file))
    )
    .filter((file) =>
      getModuleSpecifiers(readFileSync(file, 'utf-8')).some((specifier) =>
        /^plitejs(?:\/|$)/u.test(specifier)
      )
    )
    .toSorted();

  assert.deepEqual(actualBridgeFiles, expectedBridgeFiles);
});

test('requires authorable Plate features to use the matching Plate proxy', () => {
  const filename = representativeFile('platejs', 'media', 'source');
  const domTarget = representativeFile('platejs', 'dom', 'target');

  assert.equal(lintSource({ filename, specifier: 'plitejs/dom' }).length, 1);
  assert.equal(
    lintSource({
      filename,
      specifier: importSpecifier(filename, domTarget),
    }).length,
    0
  );
});

const representativeFile = (packageName, entrypointName, role) => {
  const definition = entrypointDags[packageName];
  const entrypoint = definition.entrypoints[entrypointName];
  const sourceRoot = path.join(repositoryRoot, definition.packageRoot, 'src');

  if (entrypoint.sourceKind === 'root') {
    return path.join(sourceRoot, `${role}.ts`);
  }
  if (entrypoint.sourceKind === 'file') {
    return path.join(sourceRoot, `${entrypoint.source}.tsx`);
  }

  return path.join(sourceRoot, entrypoint.source, `${role}.ts`);
};

const importSpecifier = (from, to) => {
  const relativePath = path.relative(path.dirname(from), to);
  const extensionlessPath = relativePath.replace(/\.[^.]+$/u, '');

  return extensionlessPath.startsWith('.')
    ? extensionlessPath
    : `./${extensionlessPath}`;
};

const lintSource = ({
  filename,
  nodeType = 'ImportDeclaration',
  specifier,
}) => {
  const reports = [];
  const visitor = entrypointDagRule.create({
    filename,
    report: (report) => reports.push(report),
  });
  const source = { type: 'Literal', value: specifier };

  if (nodeType === 'TSExternalModuleReference') {
    visitor[nodeType]({ expression: source });
  } else {
    visitor[nodeType]({ source });
  }

  return reports;
};

test('the configured entrypoint maps are acyclic', () => {
  assert.doesNotThrow(() => assertEntrypointDags());
});

test('models every public governed package entrypoint', () => {
  for (const [packageName, definition] of Object.entries(entrypointDags)) {
    const packageJson = JSON.parse(
      readFileSync(
        new URL(
          `../../${definition.packageRoot}/package.json`,
          import.meta.url
        ),
        'utf-8'
      )
    );
    const publicEntrypoints = Object.keys(packageJson.exports)
      .filter(
        (subpath) =>
          subpath !== './package.json' &&
          !subpath.endsWith('.css') &&
          typeof packageJson.exports[subpath] === 'object'
      )
      .map((subpath) =>
        subpath === '.' ? 'root' : subpath.replace(/^\.\//u, '')
      )
      .sort();

    assert.deepEqual(
      Object.entries(definition.entrypoints)
        .filter(([, entrypoint]) => entrypoint.public !== false)
        .map(([entrypointName]) => entrypointName)
        .sort(),
      publicEntrypoints,
      packageName
    );
  }
});

test('platejs exposes exactly the accepted root and feature owners', () => {
  const plate = entrypointDags.platejs;
  const rootFeatures = Object.keys(rootFeatureDependencies);
  const publicFeatures = Object.keys(publicFeatureDependencies);

  assert.deepEqual(rootFeatures, [
    'basic-nodes',
    'basic-styles',
    'code-block',
    'indent',
    'link',
    'list',
  ]);
  assert.deepEqual(publicFeatures, [
    'callout',
    'combobox',
    'comment',
    'date',
    'details',
    'find-replace',
    'footnote',
    'layout',
    'media',
    'mention',
    'slash-command',
    'suggestion',
    'table',
    'tag',
    'toc',
  ]);

  for (const name of rootFeatures) {
    assert.equal(plate.entrypoints[`standard/${name}`].public, false);
  }
  for (const name of publicFeatures) {
    assert.equal(plate.entrypoints[name].public, true);
    assert.equal(plate.entrypoints[`standard/${name}`], undefined);
  }
  for (const name of publicFeatureReactEntrypoints) {
    assert.equal(plate.entrypoints[`${name}/react`].public, true);
  }
  for (const name of publicReactOnlyEntrypoints) {
    assert.equal(plate.entrypoints[`${name}/react`].public, true);
  }

  assert.equal(plate.entrypoints.basic, undefined);
});

test('models every optional peer as one direct entrypoint permission', () => {
  for (const [packageName, definition] of Object.entries(entrypointDags)) {
    const packageJson = JSON.parse(
      readFileSync(
        new URL(
          `../../${definition.packageRoot}/package.json`,
          import.meta.url
        ),
        'utf-8'
      )
    );
    const optionalPeers = Object.entries(packageJson.peerDependenciesMeta ?? {})
      .filter(([, metadata]) => metadata?.optional === true)
      .map(([dependencyName]) => dependencyName)
      .sort((a, b) => a.localeCompare(b));
    const modeledPeers = Object.values(definition.entrypoints)
      .flatMap((entrypoint) => entrypoint.peerDependencies ?? [])
      .sort((a, b) => a.localeCompare(b));

    assert.deepEqual(
      [...new Set(modeledPeers)],
      optionalPeers,
      `${packageName} optional peer inventory`
    );
  }
});

test('entrypoint map validation rejects cycles', () => {
  assert.throws(
    () =>
      assertEntrypointDags({
        example: {
          entrypoints: {
            feature: {
              dependencies: ['root'],
              externalDependencies: [],
              runtime: 'headless',
              source: 'feature',
              sourceKind: 'directory',
            },
            root: {
              dependencies: ['feature'],
              externalDependencies: [],
              runtime: 'headless',
              source: null,
              sourceKind: 'root',
            },
          },
          sourceMarker: '/packages/example/src/',
          taskPartitions: {
            core: ['root'],
            feature: ['feature'],
          },
        },
      }),
    /contain a cycle/u
  );
});

test('entrypoint map validation rejects cross-package cycles', () => {
  const packageDefinition = (packageName, externalDependency) => ({
    entrypoints: {
      root: {
        dependencies: [],
        externalDependencies: [externalDependency],
        runtime: 'headless',
        source: null,
        sourceKind: 'root',
      },
    },
    packageRoot: `packages/${packageName}`,
    sourceMarker: `/packages/${packageName}/src/`,
    taskPartitions: { core: ['root'] },
  });

  assert.throws(
    () =>
      assertEntrypointDags({
        first: packageDefinition('first', 'second'),
        second: packageDefinition('second', 'first'),
      }),
    /contain a cycle/u
  );
});

test('every public entrypoint has one canonical runtime', () => {
  const rows = getPublicEntrypointRuntimeRows();

  assert.equal(
    rows.length,
    new Set(rows.map(({ specifier }) => specifier)).size
  );
  assert.deepEqual(
    [...new Set(rows.map(({ runtime }) => runtime))].sort((a, b) =>
      a.localeCompare(b)
    ),
    [...entrypointRuntimes].sort((a, b) => a.localeCompare(b))
  );
  assert.deepEqual(
    rows
      .filter(({ runtime }) => runtime === 'ssr')
      .map(({ specifier }) => specifier),
    ['platejs/static']
  );
  assert.equal(
    rows.filter(({ runtimeProof }) => runtimeProof === 'plate-plugin').length,
    14
  );
  assert.equal(
    rows.filter(({ runtimeProof }) => runtimeProof === 'plate-plugin-client')
      .length,
    13
  );
});

test('entrypoint validation rejects missing runtime metadata', () => {
  assert.throws(
    () =>
      assertEntrypointDags({
        example: {
          entrypoints: {
            root: {
              dependencies: [],
              externalDependencies: [],
              source: null,
              sourceKind: 'root',
            },
          },
          sourceMarker: '/packages/example/src/',
          taskPartitions: { core: ['root'] },
        },
      }),
    /must declare runtime/u
  );
});

test('public SSR entrypoints require a generated proof adapter', () => {
  assert.throws(
    () =>
      assertEntrypointDags({
        example: {
          entrypoints: {
            root: {
              dependencies: [],
              externalDependencies: [],
              runtime: 'ssr',
              source: null,
              sourceKind: 'root',
            },
          },
          sourceMarker: '/packages/example/src/',
          taskPartitions: { core: ['root'] },
        },
      }),
    /must declare an SSR runtime proof/u
  );
});

test('enforces every modeled governed-package entrypoint direction', () => {
  for (const [packageName, definition] of Object.entries(entrypointDags)) {
    for (const [from, fromDefinition] of Object.entries(
      definition.entrypoints
    )) {
      for (const to of Object.keys(definition.entrypoints)) {
        const filename = representativeFile(packageName, from, 'source');
        const target = representativeFile(packageName, to, 'target');
        const reports = lintSource({
          filename,
          specifier: importSpecifier(filename, target),
        });
        const isAllowed =
          from === to || fromDefinition.dependencies.includes(to);

        assert.equal(
          reports.length,
          isAllowed ? 0 : 1,
          `${packageName}: ${from} -> ${to}`
        );
      }
    }
  }
});

test('enforces direct cross-package entrypoint permissions', () => {
  for (const [packageName, definition] of Object.entries(entrypointDags)) {
    for (const [from, fromDefinition] of Object.entries(
      definition.entrypoints
    )) {
      const filename = representativeFile(packageName, from, 'source');

      for (const [targetPackageName, targetDefinition] of Object.entries(
        entrypointDags
      )) {
        if (targetPackageName === packageName) continue;

        for (const [to, toDefinition] of Object.entries(
          targetDefinition.entrypoints
        )) {
          if (toDefinition.public === false) continue;
          const specifier =
            to === 'root' ? targetPackageName : `${targetPackageName}/${to}`;
          const reports = lintSource({ filename, specifier });
          const isAllowed =
            fromDefinition.externalDependencies.includes(specifier);

          assert.equal(
            reports.length,
            isAllowed ? 0 : 1,
            `${packageName}/${from} -> ${specifier}`
          );
        }
      }
    }
  }
});

test('enforces direct optional-peer permissions', () => {
  for (const [packageName, definition] of Object.entries(entrypointDags)) {
    const optionalPeers = new Set(
      Object.values(definition.entrypoints).flatMap(
        (entrypoint) => entrypoint.peerDependencies ?? []
      )
    );

    for (const [from, fromDefinition] of Object.entries(
      definition.entrypoints
    )) {
      const filename = representativeFile(packageName, from, 'source');

      for (const dependencyName of optionalPeers) {
        const reports = lintSource({ filename, specifier: dependencyName });
        const isAllowed = (fromDefinition.peerDependencies ?? []).includes(
          dependencyName
        );

        assert.equal(
          reports.length,
          isAllowed ? 0 : 1,
          `${packageName}/${from} -> ${dependencyName}`
        );
        if (!isAllowed) {
          assert.equal(reports[0].messageId, 'forbiddenPeerImport');
        }
      }
    }
  }
});

test('does not grant transitive import permission', () => {
  const filename = representativeFile('platejs', 'migrations', 'source');

  assert.equal(
    lintSource({ filename, specifier: 'plitejs/react' }).length,
    1,
    'platejs/migrations may import plitejs, but not its react dependency'
  );
});

test('checks every supported module dependency syntax', () => {
  const filename = representativeFile('plitejs', 'root', 'source');

  for (const nodeType of [
    'ExportAllDeclaration',
    'ExportNamedDeclaration',
    'ImportDeclaration',
    'ImportExpression',
    'TSExternalModuleReference',
    'TSImportType',
  ]) {
    const reports = lintSource({
      filename,
      nodeType,
      specifier: './react',
    });

    assert.equal(reports.length, 1, nodeType);
    assert.equal(reports[0].messageId, 'forbiddenEntrypointImport');
  }
});

test('rejects computed dynamic import sources', () => {
  const reports = [];
  const visitor = entrypointDagRule.create({
    filename: representativeFile('platejs', 'root', 'source'),
    report: (report) => reports.push(report),
  });

  visitor.ImportExpression({
    source: { name: 'specifier', type: 'Identifier' },
  });

  assert.equal(reports.length, 1);
  assert.equal(reports[0].messageId, 'dynamicImportSource');
});

test('rejects relative imports that escape a governed source root', () => {
  const filename = representativeFile('platejs', 'root', 'source');
  const target = representativeFile('plitejs', 'react', 'target');
  const reports = lintSource({
    filename,
    specifier: importSpecifier(filename, target),
  });

  assert.equal(reports.length, 1);
  assert.equal(reports[0].messageId, 'sourceRootEscape');
});

test('ignores external packages and files outside the governed packages', () => {
  assert.equal(
    lintSource({
      filename: representativeFile('plitejs', 'root', 'external'),
      specifier: 'unmanaged-package',
    }).length,
    0
  );
  assert.equal(
    lintSource({
      filename: path.join(repositoryRoot, 'outside.ts'),
      specifier: './local',
    }).length,
    0
  );
});
