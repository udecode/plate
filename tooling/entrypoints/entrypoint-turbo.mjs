import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import { vitestSuites } from '../config/test-suites.mjs';
import {
  importClosure,
  isTypecheckedSource,
  tsconfigChain,
} from '../scripts/import-graph.mjs';
import {
  classifyEntrypoint,
  entrypointTaskPartition,
  entrypointDags,
  normalizePath,
  normalizeSourcePath,
  partitionTypecheckTask,
} from './entrypoint-dag.mjs';
import { testModuleEffects } from './test-module-effects.mjs';

const toolingRoot = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(toolingRoot, '../..');

const sourceFilePattern = /\.[cm]?[jt]sx?$/u;
const runtimeTestPattern = /\.(?:spec|test)\.[cm]?[jt]sx?$/u;
const sourceTestPattern = /(?:\.(?:spec|test)|-contract)\.[cm]?[jt]sx?$/u;
const ignoredDirectoryNames = new Set([
  '.cache',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
]);
const sourceTestInputNegations = [
  '!src/**/*.spec.*',
  '!src/**/*.test.*',
  '!src/**/*-contract.*',
  '!src/**/__tests__/**',
];
const sharedTypecheckInputs = () => [
  ...runnerInputs('tooling/scripts/run-entrypoint-task.mjs'),
  '$TURBO_ROOT$/tooling/config/global.d.ts',
  '$TURBO_ROOT$/tooling/config/tsconfig.base.json',
  '$TURBO_ROOT$/tooling/config/tsconfig.test.json',
  '$TURBO_ROOT$/tsconfig.json',
  'tsconfig.json',
];
// The preloads import package source, so the walk starts from them too.
export const testPreloadFiles = [
  'config/plite-source-aliases.ts',
  'config/plite-source-test-setup.ts',
  'tooling/config/bunTestSetup.ts',
].map((filename) => path.join(repoRoot, filename));
// Bun and Vitest read their config files without importing them, so the
// load trace cannot report them.
// Top-level files only: Playwright writes its results under tooling/config.
const runtimeTestHarnessInputs = () => [
  ...runnerInputs('tooling/scripts/run-entrypoint-task.mjs'),
  '$TURBO_ROOT$/bunfig.toml',
  '$TURBO_ROOT$/config/*',
  '$TURBO_ROOT$/tooling/config/*',
  'bunfig.toml',
  'vitest.config.*',
];
// Strict env mode hides any variable a task does not declare, so a replay
// seed, a run count or the plitejs law switch would never reach the test.
const partitionTestEnv = (packageName) => [
  'BENCH_MEASURE',
  'CI',
  'FAST_CHECK_SEED',
  ...({
    platejs: ['PLATE_*', 'PLITE_*', 'TZ'],
    plitejs: ['FILL_LAW_*', 'PLITE_*'],
  }[packageName] ?? []),
];
const packagesWithTypecheckedTests = new Set(['platejs', 'plitejs']);

const typecheckedExternalTestFiles = {
  plitejs: [
    'test/authored-tree-recording-laws.spec.ts',
    'test/authored-tree-resolve-laws.spec.ts',
    'test/document-change-relocation-scale.spec.ts',
    'test/history/history-soak-contract.spec.ts',
    'test/index.spec.ts',
    'test/yjs/authored-key-work.spec.ts',
    'test/yjs/collaborative-history-contract.spec.ts',
    'test/yjs/lift-nodes-contract.spec.ts',
    'test/yjs/remote-import-contract.spec.ts',
    'test/yjs/structural-soak-contract.spec.ts',
  ],
};
// ultracite runs oxlint and oxfmt, which load their configs, oxlint's plugins
// and the baseline by path, not by import.
const sharedLintInputs = () => [
  ...new Set([
    ...runnerInputs(
      'oxfmt.config.ts',
      'oxlint.config.ts',
      'tooling/oxlint/anti-slop-plugin.mjs',
      'tooling/oxlint/entrypoint-dag-plugin.mjs',
      'tooling/oxlint/plate-plugin.mjs'
    ),
    '$TURBO_ROOT$/tooling/oxlint/plate-baseline.json',
    ...runnerInputs('tooling/scripts/run-entrypoint-task.mjs'),
  ]),
];
const aggregateTaskInputs = () =>
  runnerInputs('tooling/scripts/run-entrypoint-package-task.mjs');

const compareStrings = (left, right) => left.localeCompare(right, 'en');

const rootInput = (filename) =>
  `$TURBO_ROOT$/${normalizePath(path.relative(repoRoot, filename))}`;

const runnerInputs = (...runners) =>
  importClosure(runners.map((runner) => path.join(repoRoot, runner)))
    .map(rootInput)
    .sort(compareStrings);

const declaredEffects = (filename) => {
  const effects =
    testModuleEffects[normalizePath(path.relative(repoRoot, filename))];

  return typeof effects === 'object' ? effects : {};
};

const effectInputs = (files) =>
  files.flatMap((filename) => {
    const { reads = [], runs = [] } = declaredEffects(filename);

    return [...reads, ...runs].map((glob) => `$TURBO_ROOT$/${glob}`);
  });

const walkFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];

  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectoryNames.has(entry.name)) continue;

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
};

const packageRoot = (packageName) =>
  path.join(repoRoot, entrypointDags[packageName].packageRoot);

const packageRelativePath = (packageName, filename) =>
  normalizePath(path.relative(packageRoot(packageName), filename));

const sourceFileCategory = (packageName, filename) => {
  if (
    packageName === 'platejs' &&
    normalizePath(filename).includes('/__tests__/') &&
    !sourceTestPattern.test(filename)
  ) {
    return 'ignored';
  }

  return sourceTestPattern.test(filename) ||
    normalizePath(filename).includes('/__tests__/')
    ? 'tests'
    : 'source';
};

const classifyExternalTest = (definition, relativePath) => {
  const normalizedRelativePath = normalizeSourcePath(relativePath);
  const candidates = Object.entries(definition.entrypoints)
    .filter(([, entrypoint]) => entrypoint.sourceKind !== 'root')
    .toSorted(
      ([, left], [, right]) => right.source.length - left.source.length
    );

  for (const [entrypointName, entrypoint] of candidates) {
    if (
      normalizedRelativePath === entrypoint.source ||
      normalizedRelativePath.startsWith(`${entrypoint.source}/`) ||
      normalizedRelativePath.startsWith(`${entrypoint.source}.`) ||
      normalizedRelativePath.startsWith(`${entrypoint.source}-`)
    ) {
      return entrypointName;
    }
  }

  return 'root';
};

export const classifyPackageFile = (packageName, filename) => {
  const definition = entrypointDags[packageName];
  const relativePath = packageRelativePath(packageName, filename);

  if (relativePath.startsWith('src/')) {
    return classifyEntrypoint(definition, relativePath.slice('src/'.length));
  }
  if (relativePath.startsWith('test/')) {
    return classifyExternalTest(definition, relativePath.slice('test/'.length));
  }

  return 'root';
};

export const getPackageSourceFiles = (
  packageName,
  { entrypointName, tests = false } = {}
) =>
  walkFiles(path.join(packageRoot(packageName), 'src'))
    .filter((filename) => sourceFilePattern.test(filename))
    .filter(
      (filename) =>
        sourceFileCategory(packageName, filename) ===
        (tests ? 'tests' : 'source')
    )
    .filter(
      (filename) =>
        entrypointName === undefined ||
        classifyPackageFile(packageName, filename) === entrypointName
    )
    .sort(compareStrings);

const partitionEntrypoints = (packageName, partitionName) =>
  entrypointDags[packageName].taskPartitions[partitionName];

const partitionOwnsFile = (packageName, partitionName, filename) =>
  partitionEntrypoints(packageName, partitionName).includes(
    classifyPackageFile(packageName, filename)
  );

export const getPackagePartitionSourceFiles = (
  packageName,
  partitionName,
  { tests = false } = {}
) =>
  getPackageSourceFiles(packageName, { tests }).filter((filename) =>
    partitionOwnsFile(packageName, partitionName, filename)
  );

export const getPackageRuntimeTestFiles = (packageName, partitionName) =>
  [
    ...walkFiles(path.join(packageRoot(packageName), 'src')),
    ...walkFiles(path.join(packageRoot(packageName), 'test')),
  ]
    .filter((filename) => runtimeTestPattern.test(filename))
    .filter((filename) =>
      partitionOwnsFile(packageName, partitionName, filename)
    )
    .sort(compareStrings);

export const getTypecheckedExternalTestFiles = (packageName) =>
  (typecheckedExternalTestFiles[packageName] ?? []).map((filename) =>
    path.join(packageRoot(packageName), filename)
  );

export const getPackageLintFiles = (packageName, partitionName) =>
  walkFiles(packageRoot(packageName))
    .filter((filename) => {
      const relativePath = packageRelativePath(packageName, filename);

      return (
        !relativePath.startsWith('.') &&
        !relativePath.startsWith('dist/') &&
        !relativePath.startsWith('node_modules/')
      );
    })
    .filter((filename) =>
      partitionOwnsFile(packageName, partitionName, filename)
    )
    .sort(compareStrings);

const sourceOwnerGlobs = (definition, entrypointName, prefix = 'src') => {
  const entrypoint = definition.entrypoints[entrypointName];
  const globs = [];

  if (entrypoint.sourceKind === 'root') {
    globs.push(`${prefix}/**`);
  } else if (entrypoint.sourceKind === 'directory') {
    globs.push(`${prefix}/${entrypoint.source}/**`);
  } else {
    globs.push(`${prefix}/${entrypoint.source}.*`);
  }

  for (const [otherName, other] of Object.entries(definition.entrypoints)) {
    if (otherName === entrypointName || other.sourceKind === 'root') continue;

    const isNested =
      entrypoint.sourceKind === 'root' ||
      (entrypoint.sourceKind === 'directory' &&
        other.source.startsWith(`${entrypoint.source}/`));

    if (!isNested) continue;

    globs.push(
      other.sourceKind === 'directory'
        ? `!${prefix}/${other.source}/**`
        : `!${prefix}/${other.source}.*`
    );
  }

  return globs;
};

const externalTestGlobs = (source) => [
  `test/${source}/**`,
  `test/${source}.*`,
  `test/${source}-*`,
];

const externalTestOwnerGlobs = (definition, entrypointName) => {
  const entrypoint = definition.entrypoints[entrypointName];
  const ownsUnmatchedTests =
    entrypointName === 'root' || entrypoint.sourceKind === 'root';
  const globs = ownsUnmatchedTests
    ? ['test/**']
    : externalTestGlobs(entrypoint.source);

  for (const [otherName, other] of Object.entries(definition.entrypoints)) {
    if (otherName === entrypointName || other.sourceKind === 'root') continue;

    const winsLongestPrefix =
      ownsUnmatchedTests ||
      (other.source.length > entrypoint.source.length &&
        other.source.startsWith(entrypoint.source));

    if (!winsLongestPrefix) continue;

    globs.push(...externalTestGlobs(other.source).map((glob) => `!${glob}`));
  }

  return globs;
};

const partitionOwnerGlobs = (definition, partitionName, ownerGlob, prefix) => {
  const globs = definition.taskPartitions[partitionName].flatMap(
    (entrypointName) => ownerGlob(definition, entrypointName, prefix)
  );
  const ownedGlobs = new Set(globs.filter((glob) => !glob.startsWith('!')));

  return [
    ...new Set(
      globs.filter(
        (glob) => !glob.startsWith('!') || !ownedGlobs.has(glob.slice(1))
      )
    ),
  ];
};

const partitionSourceOwnerGlobs = (definition, partitionName, prefix = 'src') =>
  partitionOwnerGlobs(definition, partitionName, sourceOwnerGlobs, prefix);

const partitionExternalTestOwnerGlobs = (definition, partitionName) =>
  partitionOwnerGlobs(definition, partitionName, externalTestOwnerGlobs);

const entrypointPackageOf = (filename) =>
  entrypointPackageNames.find(
    (packageName) =>
      !packageRelativePath(packageName, filename).startsWith('../')
  );

const typecheckTaskFor = (filename, currentPackageName) => {
  const packageName = entrypointPackageOf(filename);
  const taskName = partitionTypecheckTask(
    entrypointTaskPartition(
      packageName,
      classifyPackageFile(packageName, filename)
    )
  );

  return packageName === currentPackageName
    ? taskName
    : `${packageName}#${taskName}`;
};

const taskImportClosure = (packageName, initialFiles, currentPartitionName) =>
  importClosure(
    initialFiles,
    (filename) =>
      !isTypecheckedSource(filename) ||
      (currentPartitionName !== undefined &&
        entrypointPackageOf(filename) === packageName &&
        partitionOwnsFile(packageName, currentPartitionName, filename))
  );

const collectSourceTaskDependencies = (
  packageName,
  initialFiles,
  { currentPartitionName, includeInitialOwners = false } = {}
) => {
  const dependencies = new Set(
    [
      ...taskImportClosure(
        packageName,
        initialFiles,
        currentPartitionName
      ).filter(isTypecheckedSource),
      ...(includeInitialOwners ? initialFiles : []),
    ].map((filename) => typecheckTaskFor(filename, packageName))
  );

  if (currentPartitionName && !includeInitialOwners) {
    dependencies.delete(partitionTypecheckTask(currentPartitionName));
  }

  return [...dependencies].sort(compareStrings);
};

const managedScriptPattern =
  /^(?:lint|test|typecheck)(?::(?:partition|tests):|$)|^typecheck:(?:contracts|tests)$/u;
const managedCommandPattern = /run-entrypoint-(?:package-)?task\.mjs/u;

const aggregateScript = (packageName, taskName) =>
  `node ../../tooling/scripts/run-entrypoint-package-task.mjs ${packageName} ${taskName}`;

const partitionScript = (command, packageName, partitionName) =>
  `node ../../tooling/scripts/run-entrypoint-task.mjs ${command} ${packageName} ${partitionName}`;

export const createManagedPackageScripts = (packageName) => {
  const definition = entrypointDags[packageName];
  const contractPartition = definition.contractPartition ?? 'core';
  const scripts = {
    lint: aggregateScript(packageName, 'lint'),
    test: aggregateScript(packageName, 'test'),
    typecheck: aggregateScript(packageName, 'typecheck'),
    'typecheck:contracts': partitionScript(
      'typecheck-contracts',
      packageName,
      contractPartition
    ),
  };

  if (packagesWithTypecheckedTests.has(packageName)) {
    scripts['typecheck:tests'] = partitionScript(
      'typecheck-package-tests',
      packageName,
      'core'
    );
  }

  for (const partitionName of Object.keys(definition.taskPartitions).sort(
    compareStrings
  )) {
    scripts[`lint:partition:${partitionName}`] = partitionScript(
      'lint',
      packageName,
      partitionName
    );
    if (getPackageRuntimeTestFiles(packageName, partitionName).length > 0) {
      scripts[`test:partition:${partitionName}`] = partitionScript(
        'test',
        packageName,
        partitionName
      );
    }
    scripts[partitionTypecheckTask(partitionName)] = partitionScript(
      'typecheck',
      packageName,
      partitionName
    );
  }

  return Object.fromEntries(
    Object.entries(scripts).sort(([left], [right]) =>
      compareStrings(left, right)
    )
  );
};

export const withManagedPackageScripts = (packageName, manifest) => {
  const scripts = Object.fromEntries(
    Object.entries(manifest.scripts ?? {}).filter(
      ([scriptName, command]) =>
        !managedScriptPattern.test(scriptName) &&
        !managedCommandPattern.test(command)
    )
  );

  return {
    ...manifest,
    scripts: Object.fromEntries(
      Object.entries({
        ...scripts,
        ...createManagedPackageScripts(packageName),
      }).sort(([left], [right]) => compareStrings(left, right))
    ),
  };
};

const resolveTaskReference = (packageName, taskReference) => {
  const separatorIndex = taskReference.indexOf('#');
  const dependencyPackageName =
    separatorIndex === -1
      ? packageName
      : taskReference.slice(0, separatorIndex);
  const taskName =
    separatorIndex === -1
      ? taskReference
      : taskReference.slice(separatorIndex + 1);
  const partitionName = Object.keys(
    entrypointDags[dependencyPackageName].taskPartitions
  ).find((candidate) => partitionTypecheckTask(candidate) === taskName);

  if (!partitionName) {
    throw new Error(`Unknown partition task reference ${taskReference}.`);
  }

  return { packageName: dependencyPackageName, partitionName };
};

const partitionTsconfigPath = (packageName, partitionName) =>
  path.join(
    packageRoot(packageName),
    'tsconfig.entrypoints',
    `${partitionName}.json`
  );

const createPartitionTsconfig = (
  packageName,
  partitionName,
  taskDependencies
) => {
  const definition = entrypointDags[packageName];
  const ownerGlobs = partitionSourceOwnerGlobs(
    definition,
    partitionName,
    '../src'
  );
  const toTsconfigGlob = (glob) => (glob.endsWith('/**') ? `${glob}/*` : glob);

  return {
    compilerOptions: {
      composite: true,
      declaration: true,
      declarationMap: false,
      emitDeclarationOnly: true,
      incremental: true,
      noEmit: false,
      outDir: `../.turbo/entrypoint-types/${partitionName}`,
      rootDir: '../src',
      sourceMap: false,
      tsBuildInfoFile: `../.turbo/entrypoint-types/${partitionName}.tsbuildinfo`,
    },
    exclude: [
      ...ownerGlobs
        .filter((glob) => glob.startsWith('!'))
        .map((glob) => toTsconfigGlob(glob.slice(1))),
      '../src/**/*.spec.*',
      '../src/**/*.test.*',
      '../src/**/*-contract.*',
      '../src/**/__tests__/**',
    ],
    extends: '../tsconfig.json',
    include: ownerGlobs
      .filter((glob) => !glob.startsWith('!'))
      .map(toTsconfigGlob),
    references: projectReferences(packageName, taskDependencies),
  };
};

const projectReferences = (packageName, taskDependencies) =>
  taskDependencies.map((taskReference) => {
    const dependency = resolveTaskReference(packageName, taskReference);

    return {
      path:
        dependency.packageName === packageName
          ? `./${dependency.partitionName}.json`
          : `../../${dependency.packageName}/tsconfig.entrypoints/${dependency.partitionName}.json`,
    };
  });

const createPackageTestsTsconfig = (packageName) => {
  const configDirectory = path.join(
    packageRoot(packageName),
    'tsconfig.entrypoints'
  );
  const absoluteTestFiles = [
    ...Object.keys(entrypointDags[packageName].entrypoints).flatMap(
      (entrypointName) =>
        getPackageSourceFiles(packageName, {
          entrypointName,
          tests: true,
        })
    ),
    ...getTypecheckedExternalTestFiles(packageName),
  ].sort(compareStrings);
  const testFiles = absoluteTestFiles
    .map((filename) => normalizePath(path.relative(configDirectory, filename)))
    .sort(compareStrings);

  testFiles.push('../../../tooling/config/global.d.ts');
  const taskDependencies = collectSourceTaskDependencies(
    packageName,
    absoluteTestFiles,
    { includeInitialOwners: true }
  );

  return {
    compilerOptions: {
      disableSourceOfProjectReferenceRedirect: true,
      noEmit: true,
    },
    exclude: [],
    extends:
      packageName === 'platejs' ? '../tsconfig.test.json' : '../tsconfig.json',
    files: testFiles,
    include: ['../src/**/*.d.ts'],
    references: projectReferences(packageName, taskDependencies),
  };
};

const packageContractFiles = (packageName) =>
  packageName === 'platejs'
    ? walkFiles(path.join(packageRoot(packageName), 'type-tests')).filter(
        (filename) => sourceFilePattern.test(filename)
      )
    : [path.join(packageRoot(packageName), 'test/public-api-contract.tsx')];

const createPackageContractsTsconfig = (packageName) => {
  const taskDependencies = collectSourceTaskDependencies(
    packageName,
    packageContractFiles(packageName)
  );

  return {
    compilerOptions: {
      disableSourceOfProjectReferenceRedirect: true,
    },
    extends:
      packageName === 'platejs'
        ? '../tsconfig.type-tests.json'
        : '../tsconfig.public-api.json',
    references: projectReferences(packageName, taskDependencies),
  };
};

const packageTaskInputs = (definition, partitionName) => [
  ...partitionSourceOwnerGlobs(definition, partitionName),
  ...partitionExternalTestOwnerGlobs(definition, partitionName),
];

const runtimeTestClosure = (packageName, partitionName, roots) => {
  const files = taskImportClosure(packageName, roots, partitionName);
  const children = files
    .filter((filename) => !isTypecheckedSource(filename))
    .flatMap((filename) => declaredEffects(filename).runs ?? [])
    .map((runs) => path.join(repoRoot, runs))
    .filter((filename) => !files.includes(filename));

  return children.length === 0
    ? files
    : runtimeTestClosure(packageName, partitionName, [...files, ...children]);
};

// Vitest loads its config's setup files by path, so the walk starts from the
// config and its test-module-effects.mjs entry.
const vitestConfigFiles = (packageName, partitionName, runtimeTestFiles) => {
  const suite = vitestSuites[packageName];

  return suite &&
    runtimeTestFiles.some((filename) =>
      suite.includes(partitionName, packageRelativePath(packageName, filename))
    )
    ? [path.join(packageRoot(packageName), suite.config)]
    : [];
};

const runtimeTestTaskGraph = (packageName, partitionName, runtimeTestFiles) => {
  const loadedFiles = runtimeTestClosure(packageName, partitionName, [
    ...runtimeTestFiles,
    ...testPreloadFiles,
    ...vitestConfigFiles(packageName, partitionName, runtimeTestFiles),
  ]);
  const testSideFiles = loadedFiles.filter(
    (filename) => !isTypecheckedSource(filename)
  );

  return {
    dependsOn: [
      ...new Set(
        [...loadedFiles.filter(isTypecheckedSource), ...runtimeTestFiles].map(
          (filename) => typecheckTaskFor(filename, packageName)
        )
      ),
    ].sort(compareStrings),
    inputs: [
      ...new Set([
        ...testSideFiles.flatMap((filename) => {
          const relativePath = packageRelativePath(packageName, filename);

          if (relativePath.startsWith('../')) return [rootInput(filename)];

          return partitionOwnsFile(packageName, partitionName, filename)
            ? []
            : [relativePath];
        }),
        ...effectInputs(testSideFiles),
        ...loadedFiles.flatMap(tsconfigChain).map(rootInput),
      ]),
    ].sort(compareStrings),
  };
};

const buildInputs = [
  'src/**',
  ...sourceTestInputNegations,
  '$TURBO_ROOT$/tooling/config/direct-package.config.mts',
  '$TURBO_ROOT$/tooling/config/tsdown.config.ts',
  '$TURBO_ROOT$/tooling/scripts/check-package-build-artifacts.mjs',
  'tsconfig.build.json',
  'tsdown.config.mts',
];

export const createPackageTurboConfig = (packageName) => {
  const definition = entrypointDags[packageName];
  const partitionNames = Object.keys(definition.taskPartitions).sort(
    compareStrings
  );
  const tasks = {
    build: {
      cache: true,
      dependsOn: ['^build'],
      env: ['CI'],
      inputs: buildInputs,
      outputLogs: 'errors-only',
      outputs: ['dist/**'],
    },
  };
  const lintTasks = [];
  const testTasks = [];
  const typecheckTasks = [];
  const partitionTaskDependencies = new Map();

  for (const partitionName of partitionNames) {
    const sourceFiles = getPackagePartitionSourceFiles(
      packageName,
      partitionName
    );
    const runtimeTestFiles = getPackageRuntimeTestFiles(
      packageName,
      partitionName
    );
    const lintTask = `lint:partition:${partitionName}`;
    const testTask = `test:partition:${partitionName}`;
    const typecheckTask = partitionTypecheckTask(partitionName);

    lintTasks.push(lintTask);
    typecheckTasks.push(typecheckTask);

    tasks[lintTask] = {
      cache: true,
      dependsOn: [],
      inputs: [
        ...(definition.taskPartitions[partitionName].includes('root')
          ? [
              '$TURBO_DEFAULT$',
              ...packageTaskInputs(definition, partitionName).slice(1),
            ]
          : packageTaskInputs(definition, partitionName)),
        ...sharedLintInputs(),
      ],
      outputLogs: 'errors-only',
      outputs: [],
    };
    if (runtimeTestFiles.length > 0) {
      const testGraph = runtimeTestTaskGraph(
        packageName,
        partitionName,
        runtimeTestFiles
      );

      testTasks.push(testTask);
      tasks[testTask] = {
        cache: true,
        dependsOn: testGraph.dependsOn,
        inputs: [
          ...packageTaskInputs(definition, partitionName),
          ...testGraph.inputs,
          ...runtimeTestHarnessInputs(),
        ],
        env: partitionTestEnv(packageName),
        outputLogs: 'errors-only',
        outputs: [],
      };
    }
    const sourceTaskDependencies = collectSourceTaskDependencies(
      packageName,
      sourceFiles,
      { currentPartitionName: partitionName }
    );

    partitionTaskDependencies.set(partitionName, sourceTaskDependencies);
    tasks[typecheckTask] = {
      cache: true,
      dependsOn: sourceTaskDependencies,
      inputs: [
        ...partitionSourceOwnerGlobs(definition, partitionName),
        ...sourceTestInputNegations,
        ...sharedTypecheckInputs(),
        ...new Set(effectInputs(sourceFiles)),
        `tsconfig.entrypoints/${partitionName}.json`,
      ],
      outputLogs: 'errors-only',
      outputs: [
        `.turbo/entrypoint-types/${partitionName}/**`,
        `.turbo/entrypoint-types/${partitionName}.tsbuildinfo`,
      ],
    };
  }

  const contractFiles = packageContractFiles(packageName);
  const contractDependencies = collectSourceTaskDependencies(
    packageName,
    contractFiles
  );

  tasks['typecheck:contracts'] = {
    cache: true,
    dependsOn: contractDependencies,
    inputs: [
      ...(packageName === 'platejs'
        ? ['type-tests/**', 'tsconfig.type-tests.json']
        : ['test/public-api-contract.tsx', 'tsconfig.public-api.json']),
      ...sharedTypecheckInputs(),
      '$TURBO_ROOT$/config/workspace-source-entries.mjs',
      '$TURBO_ROOT$/tooling/scripts/typecheck-package-source.mjs',
      'tsconfig.entrypoints/contracts.json',
    ],
    outputLogs: 'errors-only',
    outputs: [],
  };
  if (packagesWithTypecheckedTests.has(packageName)) {
    const packageTestFiles = [
      ...getPackageSourceFiles(packageName, { tests: true }),
      ...getTypecheckedExternalTestFiles(packageName),
      ...walkFiles(path.join(packageRoot(packageName), 'test/react')).filter(
        (filename) => sourceFilePattern.test(filename)
      ),
    ];

    tasks['typecheck:tests'] = {
      cache: true,
      dependsOn: collectSourceTaskDependencies(packageName, packageTestFiles, {
        includeInitialOwners: true,
      }),
      inputs: [
        'src/**/*.spec.*',
        'src/**/*.test.*',
        'src/**/*-contract.*',
        'src/**/__tests__/**',
        ...(packageName === 'platejs'
          ? ['test/testing/**', 'tsconfig.test.json']
          : ['test/**']),
        ...sharedTypecheckInputs(),
        'tsconfig.entrypoints/tests.json',
      ],
      outputLogs: 'errors-only',
      outputs: [],
    };
  }
  tasks.lint = {
    cache: true,
    dependsOn: lintTasks,
    inputs: aggregateTaskInputs(),
    outputLogs: 'errors-only',
    outputs: [],
  };
  tasks.test = {
    cache: true,
    dependsOn: testTasks,
    inputs: aggregateTaskInputs(),
    outputLogs: 'errors-only',
    outputs: [],
    passThroughEnv: partitionTestEnv(packageName),
  };
  tasks.typecheck = {
    cache: true,
    dependsOn: [
      ...typecheckTasks,
      'typecheck:contracts',
      ...(packagesWithTypecheckedTests.has(packageName)
        ? ['typecheck:tests']
        : []),
    ],
    inputs: aggregateTaskInputs(),
    outputLogs: 'errors-only',
    outputs: [],
  };

  return {
    config: {
      $schema: 'https://turbo.build/schema.json',
      extends: ['//'],
      tasks: Object.fromEntries(
        Object.entries(tasks).sort(([left], [right]) =>
          compareStrings(left, right)
        )
      ),
    },
    tsconfigs: Object.fromEntries([
      ...partitionNames.map((partitionName) => [
        partitionTsconfigPath(packageName, partitionName),
        createPartitionTsconfig(
          packageName,
          partitionName,
          partitionTaskDependencies.get(partitionName)
        ),
      ]),
      ...(packagesWithTypecheckedTests.has(packageName)
        ? [
            [
              path.join(
                packageRoot(packageName),
                'tsconfig.entrypoints/tests.json'
              ),
              createPackageTestsTsconfig(packageName),
            ],
          ]
        : []),
      [
        path.join(
          packageRoot(packageName),
          'tsconfig.entrypoints/contracts.json'
        ),
        createPackageContractsTsconfig(packageName),
      ],
    ]),
  };
};

const readJson = (filename) => JSON.parse(fs.readFileSync(filename, 'utf-8'));

export const expectedEntrypointTurboState = (packageName) => {
  const root = packageRoot(packageName);
  const manifestPath = path.join(root, 'package.json');
  const generated = createPackageTurboConfig(packageName);

  return {
    manifest: withManagedPackageScripts(packageName, readJson(manifestPath)),
    manifestPath,
    tsconfigs: generated.tsconfigs,
    turboConfig: generated.config,
    turboPath: path.join(root, 'turbo.json'),
  };
};

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

export const assertEntrypointTurboGenerated = (packageName) => {
  const expected = expectedEntrypointTurboState(packageName);
  const actualManifest = readJson(expected.manifestPath);
  const actualTurbo = fs.existsSync(expected.turboPath)
    ? readJson(expected.turboPath)
    : null;

  if (!isDeepStrictEqual(actualManifest, expected.manifest)) {
    throw new Error(
      `${packageName} package scripts are stale. Run pnpm entrypoint:turbo:generate.`
    );
  }
  if (!isDeepStrictEqual(actualTurbo, expected.turboConfig)) {
    throw new Error(
      `${packageName} turbo.json is stale. Run pnpm entrypoint:turbo:generate.`
    );
  }

  for (const [configPath, config] of Object.entries(expected.tsconfigs)) {
    if (
      !fs.existsSync(configPath) ||
      !isDeepStrictEqual(readJson(configPath), config)
    ) {
      throw new Error(
        `${packageName} entrypoint tsconfig is stale. Run pnpm entrypoint:turbo:generate.`
      );
    }
  }
};

export const writeEntrypointTurboGenerated = (packageName) => {
  const expected = expectedEntrypointTurboState(packageName);

  fs.writeFileSync(expected.manifestPath, stableJson(expected.manifest));
  fs.writeFileSync(expected.turboPath, stableJson(expected.turboConfig));

  const tsconfigDirectory = path.join(
    packageRoot(packageName),
    'tsconfig.entrypoints'
  );

  fs.mkdirSync(tsconfigDirectory, { recursive: true });

  for (const [configPath, config] of Object.entries(expected.tsconfigs)) {
    fs.writeFileSync(configPath, stableJson(config));
  }

  const expectedConfigPaths = new Set(Object.keys(expected.tsconfigs));

  for (const filename of fs.readdirSync(tsconfigDirectory)) {
    const configPath = path.join(tsconfigDirectory, filename);

    if (filename.endsWith('.json') && !expectedConfigPaths.has(configPath)) {
      fs.rmSync(configPath);
    }
  }
};

export const entrypointPackageNames = Object.freeze(
  Object.keys(entrypointDags).sort(compareStrings)
);
