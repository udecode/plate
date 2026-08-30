import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  entrypointDags,
  getPublicEntrypointRuntimeRows,
  partitionTypecheckTask,
} from '../entrypoints/entrypoint-dag.mjs';
import {
  createClientRuntimeProofSource,
  createSsrRuntimeProofSource,
} from '../entrypoints/entrypoint-runtime.mjs';
import {
  createManagedPackageScripts,
  createPackageTurboConfig,
  entrypointPackageNames,
  getPackageRuntimeTestFiles,
  repoRoot,
} from '../entrypoints/entrypoint-turbo.mjs';
import { assertWorkspaceSourcePathsGenerated } from '../entrypoints/workspace-source-paths.mjs';

const generatedByPackage = new Map(
  entrypointPackageNames.map((packageName) => [
    packageName,
    createPackageTurboConfig(packageName),
  ])
);
const managedScriptPattern =
  /^(?:lint|test|typecheck)(?::(?:partition|tests):|$)|^typecheck:(?:contracts|tests)$/u;

test('generated entrypoint Turbo state is current', () => {
  for (const packageName of entrypointPackageNames) {
    const packageRoot = path.join(
      repoRoot,
      entrypointDags[packageName].packageRoot
    );
    const generated = generatedByPackage.get(packageName);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf-8')
    );
    const actualManagedScripts = Object.fromEntries(
      Object.entries(manifest.scripts).filter(([scriptName]) =>
        managedScriptPattern.test(scriptName)
      )
    );
    const expectedTsconfigPaths = Object.keys(generated.tsconfigs).sort();
    const actualTsconfigPaths = fs
      .readdirSync(path.join(packageRoot, 'tsconfig.entrypoints'))
      .filter((filename) => filename.endsWith('.json'))
      .map((filename) =>
        path.join(packageRoot, 'tsconfig.entrypoints', filename)
      )
      .sort();

    assert.deepEqual(
      JSON.parse(
        fs.readFileSync(path.join(packageRoot, 'turbo.json'), 'utf-8')
      ),
      generated.config
    );
    assert.deepEqual(
      actualManagedScripts,
      createManagedPackageScripts(packageName)
    );
    assert.deepEqual(actualTsconfigPaths, expectedTsconfigPaths);

    for (const [filename, config] of Object.entries(generated.tsconfigs)) {
      assert.deepEqual(JSON.parse(fs.readFileSync(filename, 'utf-8')), config);
    }
  }
  assert.doesNotThrow(() => assertWorkspaceSourcePathsGenerated(repoRoot));
});

test('generates the browser proof from every client runtime entrypoint', () => {
  const rows = getPublicEntrypointRuntimeRows();
  const source = createClientRuntimeProofSource(rows);

  for (const row of rows) {
    assert.equal(
      source.includes(`from ${JSON.stringify(row.specifier)}`),
      row.runtime === 'client',
      row.specifier
    );
  }
  assert.match(source, /typeof window === 'undefined'/u);
  assert.match(source, /document\.createElement/u);
  assert.match(source, /plate-plugin-client/u);
  assert.match(source, /createRuntimeProofEditor/u);
});

test('generates DOM-free SSR behavior from each SSR proof adapter', () => {
  const rows = getPublicEntrypointRuntimeRows().filter(
    ({ runtime }) => runtime === 'ssr'
  );
  const source = createSsrRuntimeProofSource(rows);

  assert.match(source, /from "platejs\/static"/u);
  assert.match(source, /renderSsrHtml0/u);
  assert.match(source, /typeof globalThis\.document/u);
  assert.throws(
    () =>
      createSsrRuntimeProofSource([
        {
          runtime: 'ssr',
          runtimeProof: 'missing',
          specifier: 'example/ssr',
        },
      ]),
    /unknown SSR proof/u
  );
});

test('every internal partition has cached lint and typecheck tasks', () => {
  for (const packageName of entrypointPackageNames) {
    const { config, tsconfigs } = generatedByPackage.get(packageName);
    const scripts = createManagedPackageScripts(packageName);

    for (const partitionName of Object.keys(
      entrypointDags[packageName].taskPartitions
    )) {
      const taskNames = [
        `lint:partition:${partitionName}`,
        partitionTypecheckTask(partitionName),
      ];

      for (const taskName of taskNames) {
        assert.equal(
          config.tasks[taskName]?.cache,
          true,
          `${packageName}#${taskName}`
        );
        assert.equal(
          typeof scripts[taskName],
          'string',
          `${packageName}#${taskName}`
        );
      }

      const typecheckConfig = path.join(
        repoRoot,
        entrypointDags[packageName].packageRoot,
        'tsconfig.entrypoints',
        `${partitionName}.json`
      );

      assert.equal(tsconfigs[typecheckConfig]?.compilerOptions.composite, true);
      assert.equal(
        tsconfigs[typecheckConfig]?.compilerOptions.emitDeclarationOnly,
        true
      );
    }
  }
});

test('generated tasks replay only errors from cache', () => {
  for (const [packageName, { config }] of generatedByPackage) {
    for (const [taskName, task] of Object.entries(config.tasks)) {
      assert.equal(
        task.outputLogs,
        'errors-only',
        `${packageName}#${taskName}`
      );
    }
  }
});

test('only behavior-sensitive tasks hash CI', () => {
  for (const [packageName, { config }] of generatedByPackage) {
    for (const [taskName, task] of Object.entries(config.tasks)) {
      const shouldHashCi =
        taskName === 'build' || taskName.startsWith('test:partition:');

      assert.equal(
        task.env?.includes('CI') ?? false,
        shouldHashCi,
        `${packageName}#${taskName}`
      );
    }
  }

  const rootTurbo = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'turbo.json'), 'utf-8')
  );

  assert.equal('globalEnv' in rootTurbo, false);
});

test('runtime test tasks exist only for partitions with tests', () => {
  for (const packageName of entrypointPackageNames) {
    const { config } = generatedByPackage.get(packageName);
    const scripts = createManagedPackageScripts(packageName);

    for (const partitionName of Object.keys(
      entrypointDags[packageName].taskPartitions
    )) {
      const taskName = `test:partition:${partitionName}`;
      const hasTests =
        getPackageRuntimeTestFiles(packageName, partitionName).length > 0;

      assert.equal(
        taskName in config.tasks,
        hasTests,
        `${packageName}#${taskName}`
      );
      assert.equal(taskName in scripts, hasTests, `${packageName}#${taskName}`);
    }
  }
});

test('leaf task inputs exclude unrelated entrypoint source', () => {
  const { config } = generatedByPackage.get('plitejs');
  const diffTask = config.tasks['typecheck:partition:diff'];

  assert.ok(diffTask.inputs.includes('src/diff/**'));
  assert.equal(diffTask.inputs.includes('src/dom/**'), false);
  assert.equal(diffTask.inputs.includes('src/react/**'), false);
  assert.ok(diffTask.inputs.includes('!src/**/*.spec.*'));
});

test('allowed import edges do not become task dependencies until imported', () => {
  const plateReactCore =
    generatedByPackage.get('platejs').config.tasks['typecheck:partition:react'];

  assert.ok(
    entrypointDags.platejs.entrypoints[
      'react-core'
    ].externalDependencies.includes('plitejs/history')
  );
  assert.equal(
    plateReactCore.dependsOn.includes('plitejs#typecheck:partition:history'),
    false
  );
});

test('generated check graph stays linear in the entrypoint partitions', () => {
  const partitionCount = Object.values(entrypointDags).reduce(
    (count, definition) =>
      count + Object.keys(definition.taskPartitions).length,
    0
  );
  const checkTaskCount = [...generatedByPackage.values()].reduce(
    (count, { config }) =>
      count +
      Object.keys(config.tasks).filter((taskName) => taskName !== 'build')
        .length,
    0
  );

  assert.ok(
    checkTaskCount <= partitionCount * 3,
    `generated ${checkTaskCount} checks for ${partitionCount} partitions`
  );
});

test('plate feature and adapter partitions remain singleton cache units', () => {
  for (const [partitionName, entrypoints] of Object.entries(
    entrypointDags.platejs.taskPartitions
  )) {
    if (['proxies', 'root'].includes(partitionName)) continue;

    assert.equal(
      entrypoints.length,
      1,
      `${partitionName} should own exactly one entrypoint`
    );
  }
});

test('package aggregates preserve the existing typecheck coverage', () => {
  const plate = generatedByPackage.get('platejs').config.tasks;
  const plite = generatedByPackage.get('plitejs').config.tasks;

  assert.ok(plate.typecheck.dependsOn.includes('typecheck:contracts'));
  assert.equal(plate.typecheck.dependsOn.includes('typecheck:tests'), false);
  assert.ok(plite.typecheck.dependsOn.includes('typecheck:contracts'));
  assert.ok(plite.typecheck.dependsOn.includes('typecheck:tests'));
});

test('distributable builds stay atomic and cache only production inputs', () => {
  for (const packageName of entrypointPackageNames) {
    const { build } = generatedByPackage.get(packageName).config.tasks;

    assert.equal(build.cache, true);
    assert.deepEqual(build.dependsOn, ['^build']);
    assert.deepEqual(build.outputs, ['dist/**']);
    assert.ok(build.inputs.includes('src/**'));
    assert.ok(build.inputs.includes('!src/**/*.test.*'));
    assert.ok(build.inputs.includes('!src/**/*.spec.*'));
  }
});

test('the repository root has no workspace dependencies', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );

  for (const dependencyField of [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
  ]) {
    for (const [dependencyName, version] of Object.entries(
      manifest[dependencyField] ?? {}
    )) {
      assert.equal(
        version.startsWith('workspace:'),
        false,
        `${dependencyField}.${dependencyName}`
      );
    }
  }
});

test('root and Core checks preserve partition dependencies', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );
  const checkCore = fs.readFileSync(
    path.join(repoRoot, 'tooling/scripts/check-core.mjs'),
    'utf-8'
  );

  assert.doesNotMatch(manifest.scripts['g:typecheck'], /--only/u);
  assert.doesNotMatch(manifest.scripts['g:typecheck:all'], /--only/u);
  assert.doesNotMatch(checkCore, /['"]--only['"]/u);
});

test('workspace consumers declare dependencies at their owning app', () => {
  const pliteApp = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/plite/package.json'), 'utf-8')
  );
  const website = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'apps/www/package.json'), 'utf-8')
  );

  assert.equal(pliteApp.devDependencies['@platejs/test'], 'workspace:*');
  assert.equal(pliteApp.devDependencies.platejs, 'workspace:*');
  assert.equal(website.dependencies.platejs, 'workspace:^');
});

test('Plate type contracts resolve Plite from the same source graph', () => {
  const config = JSON.parse(
    fs.readFileSync(
      path.join(repoRoot, 'tooling/config/tsconfig.type-tests.json'),
      'utf-8'
    )
  );

  for (const entrypointName of Object.keys(
    entrypointDags.plitejs.entrypoints
  )) {
    const specifier =
      entrypointName === 'root' ? 'plitejs' : `plitejs/${entrypointName}`;
    const targets = config.compilerOptions.paths[specifier];

    assert.equal(targets?.length, 1, specifier);
    assert.match(targets[0], /packages\/plitejs\/src\//u, specifier);
  }
});
