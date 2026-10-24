import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import { globSync } from 'tinyglobby';

import { vitestSuites } from '../config/test-suites.mjs';
import {
  entrypointDags,
  partitionTypecheckTask,
} from '../entrypoints/entrypoint-dag.mjs';
import {
  createClientRuntimeProofSource,
  createSsrRuntimeProofSource,
} from '../entrypoints/entrypoint-runtime.mjs';
import {
  classifyPackageFile,
  createManagedPackageScripts,
  createPackageTurboConfig,
  entrypointPackageNames,
  getPackageRuntimeTestFiles,
  getTypecheckedExternalTestFiles,
  repoRoot,
  testPreloadFiles,
  withManagedPackageScripts,
} from '../entrypoints/entrypoint-turbo.mjs';
import { assertWorkspaceSourcePathsGenerated } from '../entrypoints/workspace-source-paths.mjs';
import {
  importClosure,
  isTypecheckedSource,
  tsconfigChain,
} from './import-graph.mjs';
import { taskHash } from './load-trace.mjs';

const generatedByPackage = new Map(
  entrypointPackageNames.map((packageName) => [
    packageName,
    createPackageTurboConfig(packageName),
  ])
);

const packageSourcePattern = new RegExp(
  `^(?:${entrypointPackageNames
    .map((packageName) => entrypointDags[packageName].packageRoot)
    .join('|')})/src/`,
  'u'
);

const isTestSideFile = (filename) => {
  const relativePath = path.relative(repoRoot, filename);

  return (
    !packageSourcePattern.test(relativePath) ||
    /\/__tests__\/|\.(?:spec|test)\.|-contract\./u.test(relativePath)
  );
};

const packageRootOf = (packageName) =>
  path.join(repoRoot, entrypointDags[packageName].packageRoot);

const runtimeTestFilesByTask = entrypointPackageNames.flatMap((packageName) =>
  Object.keys(entrypointDags[packageName].taskPartitions).flatMap(
    (partitionName) => {
      const testFiles = getPackageRuntimeTestFiles(packageName, partitionName);

      return testFiles.length === 0
        ? []
        : [{ packageName, partitionName, testFiles }];
    }
  )
);

const runtimeTestTasks = function* () {
  for (const {
    packageName,
    partitionName,
    testFiles,
  } of runtimeTestFilesByTask) {
    const packageRoot = packageRootOf(packageName);
    const testFolderFiles = globSync('test/**', {
      absolute: true,
      cwd: packageRoot,
    }).filter((filename) =>
      entrypointDags[packageName].taskPartitions[partitionName].includes(
        classifyPackageFile(packageName, filename)
      )
    );
    const loadedFiles = importClosure(
      [...testPreloadFiles, ...testFiles],
      (filename) => !isTypecheckedSource(filename)
    );

    yield {
      label: `${packageName}#test:partition:${partitionName}`,
      packageName,
      task: generatedByPackage.get(packageName).config.tasks[
        `test:partition:${partitionName}`
      ],
      taskName: `test:partition:${partitionName}`,
      testFolderFiles,
      testSideFiles: [
        ...new Set([...testFolderFiles, ...loadedFiles.filter(isTestSideFile)]),
      ],
    };
  }
};

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
      manifest.scripts,
      withManagedPackageScripts(packageName, manifest).scripts
    );
    assert.deepEqual(actualTsconfigPaths, expectedTsconfigPaths);

    for (const [filename, config] of Object.entries(generated.tsconfigs)) {
      assert.deepEqual(JSON.parse(fs.readFileSync(filename, 'utf-8')), config);
    }
  }
  assert.doesNotThrow(() => assertWorkspaceSourcePathsGenerated(repoRoot));
});

const createRuntimeProofFixture = () => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'plate-runtime-proof-'));
  const put = (file, content) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), content);
  };
  const entry = (file) => pathToFileURL(path.join(dir, file)).href;

  put('package.json', '{"type":"module"}');
  put(
    'node_modules/platejs/package.json',
    JSON.stringify({
      exports: { '.': './index.mjs', './react': './react.mjs' },
      name: 'platejs',
      type: 'module',
    })
  );
  put(
    'node_modules/platejs/index.mjs',
    [
      "export const BaseParagraphPlugin = { key: 'p' };",
      'export const createEditor = ({ initialValue }) => ({ initialValue });',
    ].join('\n')
  );
  put(
    'node_modules/platejs/react.mjs',
    [
      "export const isNominalPluginDescriptor = (value) => value?.kind === 'plugin';",
      'export const createEditor = ({ plugins }) => {',
      '  for (const plugin of plugins) {',
      '    if (plugin.broken) throw new Error(plugin.key + " cannot build an editor");',
      '  }',
      '};',
    ].join('\n')
  );

  return {
    entry,
    load: (file, source) => {
      put(file, source);

      return import(entry(file));
    },
    put,
  };
};

test('generates the browser proof from every client runtime entrypoint', async () => {
  const { entry, load, put } = createRuntimeProofFixture();

  put(
    'plugin-entry.mjs',
    "export const plugin = { key: 'a', kind: 'plugin' };"
  );
  put(
    'broken-entry.mjs',
    "export const plugin = { broken: true, key: 'b', kind: 'plugin' };"
  );
  put('plain-entry.mjs', 'export const value = 1;');
  const proof = await load(
    'client.ts',
    createClientRuntimeProofSource([
      {
        runtime: 'client',
        runtimeProof: 'plate-plugin-client',
        specifier: entry('plugin-entry.mjs'),
      },
      {
        runtime: 'client',
        runtimeProof: null,
        specifier: entry('plain-entry.mjs'),
      },
      {
        runtime: 'ssr',
        runtimeProof: 'plate-static-html',
        specifier: entry('missing-ssr-entry.mjs'),
      },
    ])
  );
  const brokenProof = await load(
    'broken-client.ts',
    createClientRuntimeProofSource([
      {
        runtime: 'client',
        runtimeProof: 'plate-plugin-client',
        specifier: entry('broken-entry.mjs'),
      },
    ])
  );

  assert.deepEqual(proof.clientRuntimeEntrypointSpecifiers, [
    entry('plugin-entry.mjs'),
    entry('plain-entry.mjs'),
  ]);
  assert.throws(
    () => proof.exerciseClientRuntimeEntrypoints(),
    /requires a browser DOM/u
  );
  globalThis.window = globalThis;
  globalThis.document = {
    createElement: () => ({ dataset: {}, remove() {} }),
  };
  try {
    assert.deepEqual(proof.exerciseClientRuntimeEntrypoints(), [
      { exportCount: 1, specifier: entry('plugin-entry.mjs') },
      { exportCount: 1, specifier: entry('plain-entry.mjs') },
    ]);
    assert.throws(
      () => brokenProof.exerciseClientRuntimeEntrypoints(),
      /b cannot build an editor/u
    );
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});

test('generates DOM-free SSR behavior from each SSR proof adapter', async () => {
  const { entry, load, put } = createRuntimeProofFixture();

  put(
    'html-server.mjs',
    [
      'export const parseHtml = (html) => ({',
      '  document: { children: [{ children: [{ text: html.replace(/<[^>]+>/g, "") }] }] },',
      '  ok: true,',
      '});',
    ].join('\n')
  );
  put(
    'broken-html-server.mjs',
    'export const parseHtml = () => ({ document: { children: [] }, ok: true });'
  );
  put(
    'static.mjs',
    [
      'export const renderStaticHtml = async (editor) => ({',
      '  data: editor.initialValue[0].children[0].text,',
      '  diagnostics: [],',
      '});',
    ].join('\n')
  );
  const rows = [
    {
      runtime: 'ssr',
      runtimeProof: 'plate-html-server',
      specifier: entry('html-server.mjs'),
    },
    {
      runtime: 'ssr',
      runtimeProof: 'plate-static-html',
      specifier: entry('static.mjs'),
    },
    {
      runtime: 'client',
      runtimeProof: 'plate-plugin-client',
      specifier: entry('missing-client-entry.mjs'),
    },
  ];

  await load('ssr.mjs', createSsrRuntimeProofSource(rows));
  await assert.rejects(
    load(
      'broken-ssr.mjs',
      createSsrRuntimeProofSource([
        {
          runtime: 'ssr',
          runtimeProof: 'plate-html-server',
          specifier: entry('broken-html-server.mjs'),
        },
      ])
    ),
    assert.AssertionError
  );
  globalThis.document = {};
  try {
    await assert.rejects(
      load('dom-ssr.mjs', createSsrRuntimeProofSource(rows)),
      assert.AssertionError
    );
  } finally {
    delete globalThis.document;
  }
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
      assert.equal(
        task.env?.includes('FAST_CHECK_SEED') ?? false,
        taskName.startsWith('test:partition:'),
        `${packageName}#${taskName}`
      );
      if (taskName.startsWith('test:partition:')) {
        for (const name of task.env) {
          assert.ok(
            config.tasks.test.passThroughEnv?.includes(name),
            `${packageName}#test cannot see ${name}`
          );
        }
      }
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

test('a runtime test task hashes every test/ file its partition owns', () => {
  for (const { label, testFolderFiles } of runtimeTestTasks()) {
    const { files } = taskHash(label);

    assert.deepEqual(
      testFolderFiles
        .map((filename) => path.relative(repoRoot, filename))
        .filter((filename) => !files.has(filename)),
      [],
      label
    );
  }
});

test('a runtime test task hashes the tsconfig files that compile the tests it runs', () => {
  for (const { label, testFiles } of runtimeTestFilesByTask.map((entry) => ({
    ...entry,
    label: `${entry.packageName}#test:partition:${entry.partitionName}`,
  }))) {
    const { files } = taskHash(label);

    assert.deepEqual(
      [...new Set(testFiles.flatMap(tsconfigChain))]
        .map((filename) => path.relative(repoRoot, filename))
        .filter((filename) => !files.has(filename)),
      [],
      label
    );
  }
});

test('a Vitest task hashes the setup files its config loads', async () => {
  const vitestTasks = runtimeTestFilesByTask.filter(
    ({ packageName, partitionName, testFiles }) =>
      testFiles.some((filename) =>
        vitestSuites[packageName]?.includes(
          partitionName,
          path.relative(packageRootOf(packageName), filename)
        )
      )
  );

  assert.ok(vitestTasks.length > 0);

  for (const { packageName, partitionName } of vitestTasks) {
    const label = `${packageName}#test:partition:${partitionName}`;
    const configFile = path.join(
      packageRootOf(packageName),
      vitestSuites[packageName].config
    );
    const { default: config } = await import(pathToFileURL(configFile).href);
    const setupFiles = [
      config.test,
      ...(config.test?.projects ?? []).map((project) => project.test),
    ]
      .flatMap((options) => [options?.setupFiles ?? []].flat())
      .map((filename) =>
        path.relative(
          repoRoot,
          path.resolve(path.dirname(configFile), filename)
        )
      );
    const { files } = taskHash(label);

    assert.deepEqual(
      setupFiles.filter((filename) => !files.has(filename)),
      [],
      label
    );
  }
});

test('every environment variable a runtime test reads reaches it', () => {
  for (const { label, task, testSideFiles } of runtimeTestTasks()) {
    const reaches = (name) =>
      task.env.some((pattern) =>
        pattern.endsWith('*')
          ? name.startsWith(pattern.slice(0, -1))
          : name === pattern
      );
    const filtered = new Set(
      testSideFiles.flatMap((filename) =>
        [
          ...fs
            .readFileSync(filename, 'utf-8')
            .matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/gu),
        ]
          .map(([, name]) => name)
          .filter((name) => !reaches(name))
      )
    );

    assert.deepEqual([...filtered].sort(), [], label);
  }
});

test('the plite tests project typechecks each listed test/ file', () => {
  const [testsConfigPath, testsConfig] = Object.entries(
    generatedByPackage.get('plitejs').tsconfigs
  ).find(([filename]) => path.basename(filename) === 'tests.json');
  const checked = new Set(
    testsConfig.files.map((filename) =>
      path.resolve(path.dirname(testsConfigPath), filename)
    )
  );

  for (const filename of getTypecheckedExternalTestFiles('plitejs')) {
    assert.ok(fs.existsSync(filename), filename);
    assert.ok(checked.has(filename), filename);
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
    entrypointDags.platejs.entrypoints['react-core'].dependencies.includes(
      'history'
    )
  );
  assert.equal(
    plateReactCore.dependsOn.includes('typecheck:partition:proxies'),
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
  assert.ok(plate.typecheck.dependsOn.includes('typecheck:tests'));
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

test('root checks preserve partition dependencies', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );

  assert.doesNotMatch(manifest.scripts['g:typecheck'], /--only/u);
  assert.doesNotMatch(manifest.scripts['g:typecheck:all'], /--only/u);
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

  for (const [entrypointName, entrypoint] of Object.entries(
    entrypointDags.plitejs.entrypoints
  )) {
    if (!entrypoint.public) continue;

    const specifier =
      entrypointName === 'root' ? 'plitejs' : `plitejs/${entrypointName}`;
    const targets = config.compilerOptions.paths[specifier];

    assert.equal(targets?.length, 1, specifier);
    assert.match(targets[0], /packages\/plitejs\/src\//u, specifier);
  }
});
