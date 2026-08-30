import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import { parse } from '@babel/parser';

import {
  classifyEntrypoint,
  entrypointTaskPartition,
  entrypointDags,
  normalizePath,
  normalizeSourcePath,
  partitionTypecheckTask,
  resolvePublicEntrypoint,
} from './entrypoint-dag.mjs';

const toolingRoot = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(toolingRoot, '../..');

const sourceFilePattern = /\.[cm]?[jt]sx?$/u;
const runtimeTestPattern = /\.(?:spec|test)\.[cm]?[jt]sx?$/u;
const sourceTestPattern = /(?:\.(?:spec|test|slow)|-contract)\.[cm]?[jt]sx?$/u;
const plateSourceTestPattern = /(?:\.(?:spec|test)|-contract)\.[cm]?[jt]sx?$/u;
const slowSourcePattern = /\.slow\.[cm]?[jt]sx?$/u;
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
  '!src/**/*.slow.*',
  '!src/**/*-contract.*',
  '!src/**/__tests__/**',
];
const sharedTypecheckInputs = [
  '$TURBO_ROOT$/tooling/entrypoints/entrypoint-dag.mjs',
  '$TURBO_ROOT$/tooling/entrypoints/entrypoint-turbo.mjs',
  '$TURBO_ROOT$/tooling/scripts/run-entrypoint-task.mjs',
  '$TURBO_ROOT$/tooling/config/global.d.ts',
  '$TURBO_ROOT$/tooling/config/tsconfig.base.json',
  '$TURBO_ROOT$/tooling/config/tsconfig.test.json',
  '$TURBO_ROOT$/tsconfig.json',
  'tsconfig.json',
];
const sharedTestInputs = [
  '$TURBO_ROOT$/config/plite-source-aliases.ts',
  '$TURBO_ROOT$/config/plite-source-test-setup.ts',
  '$TURBO_ROOT$/tooling/config/bunTestSetup.ts',
  '$TURBO_ROOT$/tooling/entrypoints/entrypoint-dag.mjs',
  '$TURBO_ROOT$/tooling/entrypoints/entrypoint-turbo.mjs',
  '$TURBO_ROOT$/tooling/scripts/run-entrypoint-task.mjs',
  'bunfig.toml',
];
const sharedLintInputs = [
  '$TURBO_ROOT$/oxlint.config.ts',
  '$TURBO_ROOT$/tooling/entrypoints/entrypoint-dag.mjs',
  '$TURBO_ROOT$/tooling/entrypoints/entrypoint-turbo.mjs',
  '$TURBO_ROOT$/tooling/oxlint/entrypoint-dag-plugin.mjs',
  '$TURBO_ROOT$/tooling/scripts/run-entrypoint-task.mjs',
];
const aggregateTaskInputs = [
  '$TURBO_ROOT$/tooling/entrypoints/entrypoint-dag.mjs',
  '$TURBO_ROOT$/tooling/entrypoints/entrypoint-turbo.mjs',
  '$TURBO_ROOT$/tooling/scripts/run-entrypoint-package-task.mjs',
];

const compareStrings = (left, right) => left.localeCompare(right, 'en');

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
  if (packageName === 'platejs' && slowSourcePattern.test(filename)) {
    return 'ignored';
  }

  if (
    packageName === 'platejs' &&
    normalizePath(filename).includes('/__tests__/') &&
    !plateSourceTestPattern.test(filename)
  ) {
    return 'ignored';
  }

  return (packageName === 'platejs'
    ? plateSourceTestPattern.test(filename)
    : sourceTestPattern.test(filename)) ||
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

const externalTestOwnerGlobs = (definition, entrypointName) => {
  const entrypoint = definition.entrypoints[entrypointName];
  const globs = [];

  if (entrypoint.sourceKind === 'root') {
    globs.push('test/**');
  } else if (entrypoint.sourceKind === 'directory') {
    globs.push(`test/${entrypoint.source}/**`);
  } else {
    globs.push(`test/${entrypoint.source}*`);
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
        ? `!test/${other.source}/**`
        : `!test/${other.source}*`
    );
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

const moduleSpecifierCache = new Map();

const moduleSpecifiers = (filename) => {
  if (moduleSpecifierCache.has(filename)) {
    return moduleSpecifierCache.get(filename);
  }

  let source;

  try {
    source = fs.readFileSync(filename, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const sourceFile = parse(source, {
    errorRecovery: false,
    plugins: ['jsx', 'typescript'],
    sourceFilename: filename,
    sourceType: 'unambiguous',
  });
  const specifiers = [];

  const addLiteral = (node) => {
    if (node?.type === 'StringLiteral') specifiers.push(node.value);
  };

  const visit = (node) => {
    if (!node || typeof node !== 'object') return;

    if (
      node.type === 'ImportDeclaration' ||
      node.type === 'ExportAllDeclaration' ||
      node.type === 'ExportNamedDeclaration'
    ) {
      addLiteral(node.moduleSpecifier);
      addLiteral(node.source);
    } else if (node.type === 'TSExternalModuleReference') {
      addLiteral(node.expression);
    } else if (node.type === 'TSImportType') {
      addLiteral(node.argument);
    } else if (node.type === 'ImportExpression') {
      addLiteral(node.source);
    } else if (
      node.type === 'CallExpression' &&
      (node.callee?.type === 'Import' ||
        (node.callee?.type === 'Identifier' && node.callee.name === 'require'))
    ) {
      addLiteral(node.arguments[0]);
    }

    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const child of value) visit(child);
      } else if (value && typeof value === 'object') {
        visit(value);
      }
    }
  };

  visit(sourceFile);
  moduleSpecifierCache.set(filename, specifiers);

  return specifiers;
};

const sourceModuleIndex = new Map();

const getSourceModuleIndex = (packageName) => {
  if (sourceModuleIndex.has(packageName)) {
    return sourceModuleIndex.get(packageName);
  }

  const index = new Map();

  for (const filename of [
    ...getPackageSourceFiles(packageName),
    ...getPackageSourceFiles(packageName, { tests: true }),
  ]) {
    const normalizedFilename = normalizeSourcePath(filename);

    index.set(normalizedFilename, filename);
    if (normalizedFilename.endsWith('/index')) {
      index.set(normalizedFilename.slice(0, -'/index'.length), filename);
    }
  }

  sourceModuleIndex.set(packageName, index);

  return index;
};

const resolveRelativeModule = (packageName, filename, specifier) => {
  const index = getSourceModuleIndex(packageName);
  const target = normalizeSourcePath(
    path.resolve(path.dirname(filename), specifier)
  );

  return index.get(target) ?? index.get(`${target}/index`) ?? null;
};

const addTaskDependency = (dependencies, dependency, currentPackageName) => {
  const taskName = partitionTypecheckTask(
    entrypointTaskPartition(dependency.packageName, dependency.entrypointName)
  );

  dependencies.add(
    dependency.packageName === currentPackageName
      ? taskName
      : `${dependency.packageName}#${taskName}`
  );
};

const collectSourceTaskDependencies = (
  packageName,
  initialFiles,
  { currentPartitionName, includeInitialOwners = false } = {}
) => {
  const dependencies = new Set();
  const queuedFiles = [...initialFiles];
  const visitedFiles = new Set();

  if (includeInitialOwners) {
    for (const filename of initialFiles) {
      addTaskDependency(
        dependencies,
        {
          entrypointName: classifyPackageFile(packageName, filename),
          packageName,
        },
        packageName
      );
    }
  }

  while (queuedFiles.length > 0) {
    const filename = queuedFiles.pop();

    if (!filename || visitedFiles.has(filename)) continue;
    visitedFiles.add(filename);

    for (const specifier of moduleSpecifiers(filename)) {
      const publicEntrypoint = resolvePublicEntrypoint(specifier);

      if (publicEntrypoint) {
        addTaskDependency(dependencies, publicEntrypoint, packageName);
        continue;
      }
      if (!specifier.startsWith('.')) continue;

      const resolved = resolveRelativeModule(packageName, filename, specifier);

      if (!resolved) continue;

      const resolvedEntrypoint = classifyPackageFile(packageName, resolved);
      const resolvedPartition = entrypointTaskPartition(
        packageName,
        resolvedEntrypoint
      );

      addTaskDependency(
        dependencies,
        { entrypointName: resolvedEntrypoint, packageName },
        packageName
      );

      if (
        sourceFileCategory(packageName, resolved) === 'tests' ||
        resolvedPartition === currentPartitionName
      ) {
        queuedFiles.push(resolved);
      }
    }
  }

  if (currentPartitionName && !includeInitialOwners) {
    dependencies.delete(partitionTypecheckTask(currentPartitionName));
  }

  return [...dependencies].sort(compareStrings);
};

const managedScriptPattern =
  /^(?:lint|test|typecheck)(?::(?:partition|tests):|$)|^typecheck:(?:contracts|tests)$/u;

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

  if (packageName === 'plitejs') {
    scripts['typecheck:tests'] = partitionScript(
      'typecheck-package-tests',
      packageName,
      'core'
    );
  }

  for (const partitionName of Object.keys(definition.taskPartitions).sort(
    compareStrings
  )) {
    const suffix = partitionName;

    scripts[`lint:partition:${suffix}`] = partitionScript(
      'lint',
      packageName,
      partitionName
    );
    if (getPackageRuntimeTestFiles(packageName, partitionName).length > 0) {
      scripts[`test:partition:${suffix}`] = partitionScript(
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
      ([scriptName]) => !managedScriptPattern.test(scriptName)
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

const taskSuffix = (partitionName) => partitionName;

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
    `${taskSuffix(partitionName)}.json`
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
  const suffix = taskSuffix(partitionName);
  const toTsconfigGlob = (glob) => (glob.endsWith('/**') ? `${glob}/*` : glob);
  const references = taskDependencies.map((taskReference) => {
    const dependency = resolveTaskReference(packageName, taskReference);

    return {
      path:
        dependency.packageName === packageName
          ? `./${taskSuffix(dependency.partitionName)}.json`
          : `../../${dependency.packageName}/tsconfig.entrypoints/${taskSuffix(
              dependency.partitionName
            )}.json`,
    };
  });

  return {
    compilerOptions: {
      composite: true,
      declaration: true,
      declarationMap: false,
      emitDeclarationOnly: true,
      incremental: true,
      noEmit: false,
      outDir: `../.turbo/entrypoint-types/${suffix}`,
      rootDir: '../src',
      sourceMap: false,
      tsBuildInfoFile: `../.turbo/entrypoint-types/${suffix}.tsbuildinfo`,
    },
    exclude: [
      ...ownerGlobs
        .filter((glob) => glob.startsWith('!'))
        .map((glob) => toTsconfigGlob(glob.slice(1))),
      '../src/**/*.spec.*',
      '../src/**/*.test.*',
      '../src/**/*.slow.*',
      '../src/**/*-contract.*',
      '../src/**/__tests__/**',
    ],
    extends: '../tsconfig.json',
    include: ownerGlobs
      .filter((glob) => !glob.startsWith('!'))
      .map(toTsconfigGlob),
    references,
  };
};

const projectReferences = (packageName, taskDependencies) =>
  taskDependencies.map((taskReference) => {
    const dependency = resolveTaskReference(packageName, taskReference);

    return {
      path:
        dependency.packageName === packageName
          ? `./${taskSuffix(dependency.partitionName)}.json`
          : `../../${dependency.packageName}/tsconfig.entrypoints/${taskSuffix(
              dependency.partitionName
            )}.json`,
    };
  });

const createPackageTestsTsconfig = (packageName) => {
  const configDirectory = path.join(
    packageRoot(packageName),
    'tsconfig.entrypoints'
  );
  const absoluteTestFiles = Object.keys(entrypointDags[packageName].entrypoints)
    .flatMap((entrypointName) =>
      getPackageSourceFiles(packageName, {
        entrypointName,
        tests: true,
      })
    )
    .sort(compareStrings);
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
    include: [],
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
    const suffix = taskSuffix(partitionName);
    const sourceFiles = getPackagePartitionSourceFiles(
      packageName,
      partitionName
    );
    const runtimeTestFiles = getPackageRuntimeTestFiles(
      packageName,
      partitionName
    );
    const lintTask = `lint:partition:${suffix}`;
    const testTask = `test:partition:${suffix}`;
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
        ...sharedLintInputs,
      ],
      outputLogs: 'errors-only',
      outputs: [],
    };
    if (runtimeTestFiles.length > 0) {
      testTasks.push(testTask);
      tasks[testTask] = {
        cache: true,
        dependsOn: collectSourceTaskDependencies(
          packageName,
          runtimeTestFiles,
          { currentPartitionName: partitionName, includeInitialOwners: true }
        ),
        inputs: [
          ...packageTaskInputs(definition, partitionName),
          ...sharedTestInputs,
          ...(packageName === 'plitejs' ? ['vitest.config.mjs'] : []),
        ],
        env: ['CI'],
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
        ...sharedTypecheckInputs,
        `tsconfig.entrypoints/${suffix}.json`,
      ],
      outputLogs: 'errors-only',
      outputs: [
        `.turbo/entrypoint-types/${suffix}/**`,
        `.turbo/entrypoint-types/${suffix}.tsbuildinfo`,
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
      ...sharedTypecheckInputs,
      '$TURBO_ROOT$/config/workspace-source-entries.mjs',
      '$TURBO_ROOT$/tooling/scripts/typecheck-package-source.mjs',
      'tsconfig.entrypoints/contracts.json',
    ],
    outputLogs: 'errors-only',
    outputs: [],
  };
  if (packageName === 'plitejs') {
    const packageTestFiles = getPackageSourceFiles(packageName, {
      tests: true,
    });

    tasks['typecheck:tests'] = {
      cache: true,
      dependsOn: collectSourceTaskDependencies(packageName, packageTestFiles, {
        includeInitialOwners: true,
      }),
      inputs: [
        'src/**/*.spec.*',
        'src/**/*.test.*',
        'src/**/*.slow.*',
        'src/**/*-contract.*',
        'src/**/__tests__/**',
        ...sharedTypecheckInputs,
        'tsconfig.entrypoints/tests.json',
      ],
      outputLogs: 'errors-only',
      outputs: [],
    };
  }
  tasks.lint = {
    cache: true,
    dependsOn: lintTasks,
    inputs: aggregateTaskInputs,
    outputLogs: 'errors-only',
    outputs: [],
  };
  tasks.test = {
    cache: true,
    dependsOn: testTasks,
    inputs: aggregateTaskInputs,
    outputLogs: 'errors-only',
    outputs: [],
  };
  tasks.typecheck = {
    cache: true,
    dependsOn: [
      ...typecheckTasks,
      'typecheck:contracts',
      ...(packageName === 'plitejs' ? ['typecheck:tests'] : []),
    ],
    inputs: aggregateTaskInputs,
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
      ...(packageName === 'plitejs'
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
