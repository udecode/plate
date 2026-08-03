#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(artifactRoot, '../../../..');
const wordgardRoot = resolve(repositoryRoot, '../wordgard');
const expectedHead = 'c715d4ded8fc780f52c13206e589ea31e4148dd4';
const distSnapshotRef = '01eb2b5eae509509677345fd603acad001827dff';
const buildScriptPattern = /bin\/build\.ts/;
const diagnosticPrefixPattern = /^.*?error TS\d+:\s*/;
const jsExtensionPattern = /\.js$/;
const npmPackageManagerPattern = /^(npm|pnpm)$/;
const packJsonPattern = /(\[\s*\{[\s\S]*\}\s*\])\s*$/;
const releaseLifecycleArgumentPattern = /["'](?:test|pack|publish|build)["']/;
const relativeTargetPrefixPattern = /^\.\//;
const tripleSlashInternalPattern = /(?:^|\n)\s*\/\/\/\s*@internal\b/;
const typeScriptDiagnosticPattern = /error TS\d+:/;
const moduleNames = [
  'collab',
  'command',
  'doc',
  'editor',
  'history',
  'phrases',
  'schema',
  'state',
  'table',
  'types',
];
const packageJson = JSON.parse(
  readFileSync(resolve(wordgardRoot, 'package.json'), 'utf8')
);
const wordgardHead = git(['rev-parse', 'HEAD']);

if (wordgardHead !== expectedHead) {
  throw new Error(
    `Expected frozen Wordgard head ${expectedHead}, found ${wordgardHead}`
  );
}

const temporaryRoot = mkdtempSync(
  join(tmpdir(), 'wordgard-public-contract-probe-')
);
const currentArchive = resolve(temporaryRoot, 'current-clean');
const staleArchive = resolve(temporaryRoot, 'current-with-ambient-dist');
const snapshotArchive = resolve(temporaryRoot, 'dist-snapshot');
const consumerRoot = resolve(temporaryRoot, 'consumer');

try {
  extractArchive('HEAD', currentArchive);
  extractArchive('HEAD', staleArchive);
  extractArchive(distSnapshotRef, snapshotArchive);
  linkDependencies(currentArchive);
  linkDependencies(staleArchive);
  linkDependencies(snapshotArchive);
  cpSync(resolve(wordgardRoot, 'dist'), resolve(staleArchive, 'dist'), {
    recursive: true,
  });

  const currentBuild = run('node', ['bin/build.ts'], currentArchive);
  const cleanPack = run('npm', ['pack', '--dry-run', '--json'], currentArchive);
  const stalePack = run('npm', ['pack', '--dry-run', '--json'], staleArchive);
  const snapshotBuild = run('node', ['bin/build.ts'], snapshotArchive);

  const cleanPackJson = parsePackJson(cleanPack.stdout);
  const stalePackJson = parsePackJson(stalePack.stdout);
  const officialDistFiles = listFiles(resolve(wordgardRoot, 'dist'));
  const snapshotDistFiles = listFiles(resolve(snapshotArchive, 'dist'));
  const snapshotFileParity = compareFileSets(
    resolve(wordgardRoot, 'dist'),
    resolve(snapshotArchive, 'dist'),
    officialDistFiles,
    snapshotDistFiles
  );

  const ts = await import(
    pathToFileURL(
      resolve(wordgardRoot, 'node_modules/typescript/lib/typescript.js')
    ).href
  );
  const sourceSurface = collectSourceSurface(ts, wordgardRoot);
  const snapshotSurface = collectSourceSurface(ts, snapshotArchive);
  const sourceSurfaceDelta = compareSurfaces(
    sourceSurface.records,
    snapshotSurface.records
  );
  const declarationRuntime = await compareDeclarationsToRuntime(ts);
  const rootNamespaceParity = await compareRootNamespaces();
  const nodeEntryProbe = probeNodeEntries();
  const typeConsumerProbe = probeTypeConsumer(consumerRoot);
  const browserBundleProbe = probeBrowserBundle(consumerRoot);
  const browserTestResolution = await probeBrowserTestResolution();

  const exportTargets = Object.entries(packageJson.exports).map(
    ([subpath, target]) => ({
      declarationTarget: String(target).replace(jsExtensionPattern, '.d.ts'),
      declarationTargetExists: existsSync(
        resolve(
          wordgardRoot,
          String(target)
            .replace(relativeTargetPrefixPattern, '')
            .replace(jsExtensionPattern, '.d.ts')
        )
      ),
      runtimeTarget: target,
      runtimeTargetExists: existsSync(
        resolve(
          wordgardRoot,
          String(target).replace(relativeTargetPrefixPattern, '')
        )
      ),
      subpath,
    })
  );
  const cleanPackFiles = cleanPackJson.files.map((file) => file.path).sort();
  const stalePackFiles = stalePackJson.files.map((file) => file.path).sort();
  const currentChangedFiles = git([
    'diff',
    '--name-only',
    `${distSnapshotRef}..HEAD`,
    '--',
    'src',
  ]).split('\n');
  const currentChangedCommits = git([
    'log',
    '--format=%H|%cI|%s',
    '--reverse',
    `${distSnapshotRef}..HEAD`,
  ])
    .split('\n')
    .map((line) => {
      const [commit, committedAt, subject] = line.split('|');
      return { commit, committedAt, subject };
    });
  const sourceMapFiles = officialDistFiles.filter((file) =>
    file.endsWith('.map')
  );
  const distJavaScript = officialDistFiles.filter((file) =>
    file.endsWith('.js')
  );
  const pureAnnotationCount = distJavaScript.reduce(
    (count, file) =>
      count +
      (readFileSync(resolve(wordgardRoot, 'dist', file), 'utf8').match(
        /\/\*@__PURE__\*\//g
      )?.length ?? 0),
    0
  );
  const namespaceProbePath = resolve(
    artifactRoot,
    'wordgard-namespace-bundle-probe.json'
  );
  const namespaceProbe = JSON.parse(readFileSync(namespaceProbePath, 'utf8'));
  const releaseSource = readFileSync(
    resolve(wordgardRoot, 'bin/release.ts'),
    'utf8'
  );
  const releaseCommands = [
    ...releaseSource.matchAll(/run\("([^"]+)",\s*\[([^\]]*)\]\)/g),
  ].map((match) => ({ command: match[1], argumentsSource: match[2] }));

  const result = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    method: [
      'Rebuild the exact historical source candidate in an isolated archive and hash every generated dist file against the ambient ignored dist.',
      'Build and pack a clean current-head archive and a current-head archive seeded with ambient dist; capture exit status, diagnostics, and pack contents.',
      'Compare every mechanically discoverable public source symbol/type/member against the historical source surface that generated dist.',
      'Compare every emitted public top-level/static/namespace value and non-abstract prototype method/accessor against runtime objects.',
      'Verify root namespace identity, Node ESM imports, TypeScript declaration resolution, browser-platform bundling, and browser-test module resolution.',
    ].join(' '),
    wordgardHead,
    package: {
      name: packageJson.name,
      version: packageJson.version,
      type: packageJson.type,
      main: packageJson.main,
      files: packageJson.files,
      exports: packageJson.exports,
      exportTargets,
      metadata: {
        browser: packageJson.browser ?? null,
        module: packageJson.module ?? null,
        sideEffects: packageJson.sideEffects ?? null,
        types: packageJson.types ?? null,
        typesVersions: packageJson.typesVersions ?? null,
        conditionalExports: Object.values(packageJson.exports).some(
          (target) => typeof target === 'object'
        ),
      },
    },
    distProvenance: {
      trackedFiles: git(['ls-files', 'dist']).split('\n').filter(Boolean),
      ignored:
        run('git', ['check-ignore', '-q', 'dist/index.js'], wordgardRoot)
          .status === 0,
      snapshotRef: distSnapshotRef,
      snapshotSubject: git(['show', '-s', '--format=%s', distSnapshotRef]),
      snapshotBuild: summarizeProcess(snapshotBuild),
      fileParity: snapshotFileParity,
      changedCommitsAfterSnapshot: currentChangedCommits,
      changedSourceFilesAfterSnapshot: currentChangedFiles,
    },
    currentBuildAndPack: {
      currentBuild: summarizeProcess(currentBuild),
      cleanPack: {
        process: summarizeProcess(cleanPack),
        files: cleanPackFiles,
        exportTargetsMissingFromPack:
          packedExportTargetsMissing(cleanPackFiles),
      },
      ambientDistPack: {
        process: summarizeProcess(stalePack),
        files: stalePackFiles,
        exportTargetsMissingFromPack:
          packedExportTargetsMissing(stalePackFiles),
      },
      releaseCommands,
      releaseScriptRunsBuildOrTests: releaseCommands.some(
        ({ command, argumentsSource }) =>
          (npmPackageManagerPattern.test(command) &&
            releaseLifecycleArgumentPattern.test(argumentsSource)) ||
          (command === 'node' && buildScriptPattern.test(argumentsSource))
      ),
    },
    publicSurface: {
      currentSource: sourceSurface.summary,
      distSnapshotSource: snapshotSurface.summary,
      delta: sourceSurfaceDelta,
      unresolvedCurrentIndexExports: sourceSurface.unresolvedIndexExports,
      emittedDeclarationRuntime: declarationRuntime,
      rootNamespaceParity,
    },
    entryParity: {
      node: nodeEntryProbe,
      typescript: typeConsumerProbe,
      browserBundle: browserBundleProbe,
      browserTestResolution,
      sameUnconditionalTargetsForNodeAndBrowser:
        !packageJson.browser &&
        !Object.values(packageJson.exports).some(
          (target) => typeof target === 'object'
        ),
    },
    sourceMapsAndTreeShaking: {
      sourceMapFiles,
      sourceMappingUrlCount: distJavaScript.reduce(
        (count, file) =>
          count +
          (readFileSync(resolve(wordgardRoot, 'dist', file), 'utf8').match(
            /sourceMappingURL/g
          )?.length ?? 0),
        0
      ),
      sourceFilesPacked: stalePackFiles.filter((file) =>
        file.startsWith('src/')
      ),
      sideEffectsField: packageJson.sideEffects ?? null,
      pureAnnotationCount,
      namespaceProbe: {
        artifact: relative(repositoryRoot, namespaceProbePath),
        sha256: sha256(readFileSync(namespaceProbePath)),
        resultCount: namespaceProbe.results.length,
        siblingRetention: namespaceProbe.results.map((probe) => ({
          id: probe.id,
          esbuild: probe.esbuild.siblingSentinels,
          rolldown: probe.rolldown.siblingSentinels,
        })),
      },
    },
    findings: [
      {
        id: 'WG-PACK-001',
        severity: 'P0',
        kind: 'proof defect',
        title:
          'Clean current-head pack succeeds with every export target absent',
        impacts: ['WG-PROOF-005A'],
      },
      {
        id: 'WG-PACK-002',
        severity: 'P0',
        kind: 'proof defect',
        title: 'Prepare reports five TypeScript errors but exits zero',
        impacts: ['WG-PROOF-005A'],
      },
      {
        id: 'WG-PACK-003',
        severity: 'P0',
        kind: 'proof defect',
        title:
          'Ambient ignored dist is publishable and exactly seven commits stale',
        impacts: [
          'WG-META-003',
          'WG-PROOF-001',
          'WG-PROOF-002A',
          'WG-PROOF-002B',
          'WG-PROOF-002C',
          'WG-PROOF-003',
          'WG-PROOF-004A',
          'WG-PROOF-004B',
          'WG-PROOF-005A',
        ],
      },
      {
        id: 'WG-PACK-004',
        severity: 'P1',
        kind: 'proof defect',
        title:
          'Current public source surface and packed declarations/runtime disagree',
        impacts: ['WG-PROOF-005A', 'WG-PROOF-005B'],
      },
      {
        id: 'WG-PACK-005',
        severity: 'P1',
        kind: 'proof defect',
        title: 'Transaction.foo is declared but absent at runtime',
        impacts: ['WG-PROOF-005A'],
      },
      {
        id: 'WG-PACK-006',
        severity: 'P2',
        kind: 'proof gap',
        title: 'Packed code has neither sources nor source maps',
        impacts: ['WG-PROOF-005A'],
      },
      {
        id: 'WG-PACK-007',
        severity: 'P2',
        kind: 'proof gap',
        title:
          'Tree-shaking relies on emitted PURE rewrites without a sideEffects contract',
        impacts: ['LOCAL-RUNTIME-API-TREESHAKING'],
      },
    ],
    interpretation: {
      semanticArchitectureRowsAdded: [],
      proofDefectsOnly: true,
      entryParityVerdict:
        'The ambient dist has Node/browser/type entry parity, but it is an ignored historical artifact rather than current-head output.',
      testVerdict:
        'Node and browser tests resolve package self-imports to ambient dist, so their green results do not validate source commits after the dist snapshot.',
    },
  };

  assertResult(result);
  writeFileSync(
    resolve(artifactRoot, 'wordgard-public-contract-probe.json'),
    `${JSON.stringify(result, null, 2)}\n`
  );
  process.stdout.write(`${JSON.stringify(result)}\n`);
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true });
}

function git(args) {
  return execFileSync('git', args, {
    cwd: wordgardRoot,
    encoding: 'utf8',
  }).trim();
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 50 * 1024 * 1024,
  });
  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? String(result.error) : null,
  };
}

function summarizeProcess(process) {
  const output = `${process.stdout}\n${process.stderr}`;
  return {
    status: process.status,
    signal: process.signal,
    error: process.error,
    diagnostics: output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => typeScriptDiagnosticPattern.test(line)),
  };
}

function extractArchive(ref, target) {
  mkdirSync(target, { recursive: true });
  const archive = execFileSync('git', ['archive', ref], {
    cwd: wordgardRoot,
    encoding: 'buffer',
    maxBuffer: 100 * 1024 * 1024,
  });
  const unpack = spawnSync('tar', ['-x', '-C', target], {
    input: archive,
    maxBuffer: 100 * 1024 * 1024,
  });
  if (unpack.status !== 0) {
    throw new Error(`Unable to extract ${ref}: ${String(unpack.stderr)}`);
  }
}

function linkDependencies(target) {
  symlinkSync(
    resolve(wordgardRoot, 'node_modules'),
    resolve(target, 'node_modules')
  );
}

function listFiles(directory, base = directory) {
  if (!existsSync(directory)) return [];
  const result = [];
  for (const name of readdirSync(directory)) {
    const path = resolve(directory, name);
    const stats = lstatSync(path);
    if (stats.isDirectory()) result.push(...listFiles(path, base));
    else result.push(relative(base, path));
  }
  return result.sort();
}

function compareFileSets(leftRoot, rightRoot, leftFiles, rightFiles) {
  const allFiles = [...new Set([...leftFiles, ...rightFiles])].sort();
  const files = allFiles.map((file) => {
    const left = resolve(leftRoot, file);
    const right = resolve(rightRoot, file);
    const leftHash = existsSync(left) ? sha256(readFileSync(left)) : null;
    const rightHash = existsSync(right) ? sha256(readFileSync(right)) : null;
    return { file, leftHash, rightHash, equal: leftHash === rightHash };
  });
  return {
    fileCount: files.length,
    allEqual: files.every((file) => file.equal),
    mismatches: files.filter((file) => !file.equal),
    digest: sha256(
      Buffer.from(
        files.map(({ file, leftHash }) => `${file}:${leftHash}`).join('\n')
      )
    ),
  };
}

function parsePackJson(output) {
  const match = packJsonPattern.exec(output);
  if (!match) throw new Error(`Unable to parse npm pack output:\n${output}`);
  const parsed = JSON.parse(match[1]);
  if (parsed.length !== 1) throw new Error('Expected one npm pack record.');
  return parsed[0];
}

function packedExportTargetsMissing(files) {
  const packed = new Set(files);
  return Object.entries(packageJson.exports)
    .flatMap(([subpath, target]) => [
      {
        kind: 'runtime',
        subpath,
        target: String(target).replace(relativeTargetPrefixPattern, ''),
      },
      {
        kind: 'declaration',
        subpath,
        target: String(target)
          .replace(relativeTargetPrefixPattern, '')
          .replace(jsExtensionPattern, '.d.ts'),
      },
    ])
    .filter(({ target }) => !packed.has(target));
}

function readTsConfig(ts, root) {
  const configPath = resolve(root, 'tsconfig.json');
  const loaded = ts.readConfigFile(configPath, ts.sys.readFile);
  if (loaded.error)
    throw new Error(ts.flattenDiagnosticMessageText(loaded.error, '\n'));
  return ts.parseJsonConfigFileContent(loaded.config, ts.sys, root);
}

function collectSourceSurface(ts, root) {
  const config = readTsConfig(ts, root);
  const program = ts.createProgram({
    rootNames: config.fileNames,
    options: config.options,
  });
  const checker = program.getTypeChecker();
  const records = new Map();
  const unresolvedIndexExports = [];
  const formatFlags =
    ts.TypeFormatFlags.NoTruncation |
    ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

  for (const moduleName of moduleNames) {
    const sourceFile = program.getSourceFile(
      resolve(root, `src/${moduleName}/index.ts`)
    );
    if (!sourceFile) throw new Error(`Missing source index for ${moduleName}`);
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    const exports = checker.getExportsOfModule(moduleSymbol);
    for (const exported of exports) {
      const resolved = resolveAlias(ts, checker, exported);
      if (!resolved.declarations?.length) {
        unresolvedIndexExports.push(`${moduleName}.${exported.name}`);
        continue;
      }
      collectSymbolSurface(
        ts,
        checker,
        resolved,
        `${moduleName}.${exported.name}`,
        sourceFile,
        records,
        formatFlags,
        new Set()
      );
    }
  }

  const serialized = [...records.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, record]) => ({ path, ...record }));
  return {
    records,
    unresolvedIndexExports: unresolvedIndexExports.sort(),
    summary: {
      recordCount: serialized.length,
      valueRecords: serialized.filter((record) => record.kind.includes('V'))
        .length,
      typeRecords: serialized.filter((record) => record.kind.includes('T'))
        .length,
      digest: sha256(Buffer.from(JSON.stringify(serialized))),
    },
  };
}

function collectSymbolSurface(
  ts,
  checker,
  symbol,
  path,
  sourceFile,
  records,
  formatFlags,
  seen
) {
  if (seen.has(symbol) || !isPublicSymbol(ts, symbol)) return;
  seen.add(symbol);
  const declaration =
    symbol.valueDeclaration ??
    symbol.declarations.find((candidate) =>
      isPublicDeclaration(ts, candidate)
    ) ??
    symbol.declarations[0] ??
    sourceFile;
  const kind = `${symbol.flags & ts.SymbolFlags.Value ? 'V' : ''}${
    symbol.flags & ts.SymbolFlags.Type ? 'T' : ''
  }`;
  let type = '';
  if (symbol.flags & ts.SymbolFlags.TypeAlias) {
    type = checker.typeToString(
      checker.getDeclaredTypeOfSymbol(symbol),
      declaration,
      formatFlags | ts.TypeFormatFlags.InTypeAlias
    );
  } else if (symbol.flags & ts.SymbolFlags.Value) {
    type = checker.typeToString(
      checker.getTypeOfSymbolAtLocation(symbol, declaration),
      declaration,
      formatFlags
    );
  } else if (symbol.flags & ts.SymbolFlags.Type) {
    type = checker.typeToString(
      checker.getDeclaredTypeOfSymbol(symbol),
      declaration,
      formatFlags
    );
  }
  records.set(path, { kind, type });

  for (const child of symbol.exports?.values() ?? []) {
    if (child.name === 'prototype') continue;
    const resolved = resolveAlias(ts, checker, child);
    collectSymbolSurface(
      ts,
      checker,
      resolved,
      `${path}.${child.name}`,
      sourceFile,
      records,
      formatFlags,
      new Set(seen)
    );
  }
  for (const child of symbol.members?.values() ?? []) {
    if (child.name === '__constructor') continue;
    collectSymbolSurface(
      ts,
      checker,
      child,
      `${path}#${child.name}`,
      sourceFile,
      records,
      formatFlags,
      new Set(seen)
    );
  }
}

function resolveAlias(ts, checker, symbol) {
  if (!(symbol.flags & ts.SymbolFlags.Alias)) return symbol;
  try {
    return checker.getAliasedSymbol(symbol);
  } catch {
    return symbol;
  }
}

function isPublicSymbol(ts, symbol) {
  return Boolean(
    symbol.declarations?.some((declaration) =>
      isPublicDeclaration(ts, declaration)
    )
  );
}

function isPublicDeclaration(ts, declaration) {
  for (let node = declaration; node; node = node.parent) {
    if (
      node.modifiers?.some(
        (modifier) =>
          modifier.kind === ts.SyntaxKind.PrivateKeyword ||
          modifier.kind === ts.SyntaxKind.ProtectedKeyword
      )
    ) {
      return false;
    }
    if (
      ts.getJSDocTags(node).some((tag) => tag.tagName.text === 'internal') ||
      tripleSlashInternalPattern.test(
        node.getFullText().slice(0, node.getStart() - node.getFullStart())
      )
    ) {
      return false;
    }
    if (
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isModuleDeclaration(node) ||
      ts.isSourceFile(node)
    ) {
      break;
    }
  }
  return true;
}

function compareSurfaces(current, snapshot) {
  const currentKeys = [...current.keys()];
  const snapshotKeys = [...snapshot.keys()];
  const added = currentKeys
    .filter((path) => !snapshot.has(path))
    .map((path) => ({ path, ...current.get(path) }))
    .sort(byPath);
  const removed = snapshotKeys
    .filter((path) => !current.has(path))
    .map((path) => ({ path, ...snapshot.get(path) }))
    .sort(byPath);
  const changed = currentKeys
    .filter(
      (path) =>
        snapshot.has(path) &&
        JSON.stringify(current.get(path)) !== JSON.stringify(snapshot.get(path))
    )
    .map((path) => ({
      path,
      before: snapshot.get(path),
      after: current.get(path),
    }))
    .sort(byPath);
  return { added, removed, changed };
}

function byPath(a, b) {
  return a.path.localeCompare(b.path);
}

async function compareDeclarationsToRuntime(ts) {
  const declarationFiles = moduleNames.map((moduleName) =>
    resolve(wordgardRoot, `dist/${moduleName}.d.ts`)
  );
  const program = ts.createProgram(declarationFiles, {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  });
  const checker = program.getTypeChecker();
  const missingValues = [];
  const missingPrototypeMembers = [];
  let declaredValueChecks = 0;
  let prototypeMemberChecks = 0;
  const moduleResults = [];

  for (const moduleName of moduleNames) {
    const sourceFile = program.getSourceFile(
      resolve(wordgardRoot, `dist/${moduleName}.d.ts`)
    );
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    const runtime = await import(
      pathToFileURL(resolve(wordgardRoot, `dist/${moduleName}.js`)).href
    );
    const declaredTopLevel = checker
      .getExportsOfModule(moduleSymbol)
      .filter(
        (symbol) =>
          resolveAlias(ts, checker, symbol).flags & ts.SymbolFlags.Value
      )
      .map((symbol) => symbol.name)
      .sort();
    const runtimeTopLevel = Object.keys(runtime).sort();
    moduleResults.push({
      module: moduleName,
      declaredTopLevel,
      runtimeTopLevel,
      topLevelEqual:
        JSON.stringify(declaredTopLevel) === JSON.stringify(runtimeTopLevel),
    });

    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const symbol = resolveAlias(ts, checker, exported);
      if (!(symbol.flags & ts.SymbolFlags.Value)) continue;
      declaredValueChecks++;
      if (!(exported.name in runtime)) {
        missingValues.push(`${moduleName}.${exported.name}`);
        continue;
      }
      walkRuntimeSymbol(
        ts,
        checker,
        symbol,
        runtime[exported.name],
        `${moduleName}.${exported.name}`,
        new Set()
      );
    }
  }

  return {
    moduleResults,
    declaredValueChecks,
    prototypeMemberChecks,
    missingValues,
    missingPrototypeMembers,
  };

  function walkRuntimeSymbol(ts, checker, symbol, runtime, path, seen) {
    if (seen.has(symbol)) return;
    seen.add(symbol);

    if (
      symbol.flags & ts.SymbolFlags.Class &&
      runtime?.prototype &&
      symbol.members
    ) {
      for (const member of symbol.members.values()) {
        if (!isConcretePrototypeMember(ts, member)) continue;
        prototypeMemberChecks++;
        if (!(member.name in runtime.prototype)) {
          missingPrototypeMembers.push(`${path}#${member.name}`);
        }
      }
    }

    for (const exported of symbol.exports?.values() ?? []) {
      if (exported.name === 'prototype') {
        declaredValueChecks++;
        if (!runtime || !Object.hasOwn(runtime, 'prototype')) {
          missingValues.push(`${path}.prototype`);
        }
        continue;
      }
      const child = resolveAlias(ts, checker, exported);
      if (!(child.flags & ts.SymbolFlags.Value)) continue;
      declaredValueChecks++;
      if (
        runtime == null ||
        (typeof runtime !== 'object' && typeof runtime !== 'function') ||
        !(exported.name in runtime)
      ) {
        missingValues.push(`${path}.${exported.name}`);
        continue;
      }
      walkRuntimeSymbol(
        ts,
        checker,
        child,
        runtime[exported.name],
        `${path}.${exported.name}`,
        new Set(seen)
      );
    }
  }
}

function isConcretePrototypeMember(ts, symbol) {
  return Boolean(
    symbol.declarations?.some(
      (declaration) =>
        (ts.isMethodDeclaration(declaration) ||
          ts.isGetAccessor(declaration) ||
          ts.isSetAccessor(declaration)) &&
        !declaration.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.AbstractKeyword
        ) &&
        isPublicDeclaration(ts, declaration)
    )
  );
}

async function compareRootNamespaces() {
  const root = await import(
    pathToFileURL(resolve(wordgardRoot, 'dist/index.js')).href
  );
  const results = [];
  for (const moduleName of moduleNames) {
    const direct = await import(
      pathToFileURL(resolve(wordgardRoot, `dist/${moduleName}.js`)).href
    );
    const rootKeys = Object.keys(root[moduleName] ?? {}).sort();
    const directKeys = Object.keys(direct).sort();
    results.push({
      module: moduleName,
      keyParity: JSON.stringify(rootKeys) === JSON.stringify(directKeys),
      identityParity: directKeys.every(
        (key) => root[moduleName]?.[key] === direct[key]
      ),
      exportCount: directKeys.length,
    });
  }
  return {
    rootKeys: Object.keys(root).sort(),
    expectedRootKeys: [...moduleNames].sort(),
    modules: results,
  };
}

function probeNodeEntries() {
  const imports = [
    'wordgard',
    ...moduleNames.map((name) => `wordgard/${name}`),
  ];
  const code = `const result = {};\nfor (const id of ${JSON.stringify(imports)}) {\n  const mod = await import(id);\n  result[id] = { resolved: import.meta.resolve(id), exports: Object.keys(mod).sort() };\n}\nprocess.stdout.write(JSON.stringify(result));\n`;
  const process = run(
    'node',
    ['--input-type=module', '--eval', code],
    wordgardRoot
  );
  return {
    process: summarizeProcess(process),
    imports: process.status === 0 ? JSON.parse(process.stdout) : null,
  };
}

function probeTypeConsumer(root) {
  const nodeModules = resolve(root, 'node_modules');
  const wordgardLink = resolve(nodeModules, 'wordgard');
  mkdirSync(nodeModules, { recursive: true });
  symlinkSync(wordgardRoot, wordgardLink);
  writeFileSync(resolve(root, 'package.json'), '{"type":"module"}\n');
  writeFileSync(
    resolve(root, 'index.ts'),
    [
      "import * as root from 'wordgard';",
      ...moduleNames.map(
        (name) => `import * as ${name} from 'wordgard/${name}';`
      ),
      `const modules: [${moduleNames
        .map((name) => `typeof root.${name}`)
        .join(', ')}] = [${moduleNames.join(', ')}];`,
      'void modules;',
      '',
    ].join('\n')
  );
  const process = run(
    resolve(wordgardRoot, 'node_modules/.bin/tsc'),
    [
      '--noEmit',
      '--strict',
      '--target',
      'es2022',
      '--module',
      'nodenext',
      '--moduleResolution',
      'nodenext',
      resolve(root, 'index.ts'),
    ],
    root
  );
  return summarizeProcess(process);
}

function probeBrowserBundle(root) {
  const entry = resolve(root, 'browser-entry.mjs');
  const output = resolve(root, 'browser-bundle.mjs');
  writeFileSync(entry, "export * from 'wordgard';\n");
  const esbuild = resolve(
    repositoryRoot,
    'node_modules/.pnpm/node_modules/.bin/esbuild'
  );
  const process = run(
    esbuild,
    [
      entry,
      '--bundle',
      '--platform=browser',
      '--format=esm',
      '--log-level=silent',
      '--tsconfig-raw={"compilerOptions":{}}',
      `--outfile=${output}`,
    ],
    root
  );
  return {
    process: summarizeProcess(process),
    bytes: process.status === 0 ? statSync(output).size : null,
    sha256: process.status === 0 ? sha256(readFileSync(output)) : null,
  };
}

async function probeBrowserTestResolution() {
  const { testServer } = await import(
    pathToFileURL(resolve(wordgardRoot, 'bin/testserver.ts')).href
  );
  const server = testServer(0);
  await new Promise((resolvePromise) => {
    if (server.listening) resolvePromise();
    else server.once('listening', resolvePromise);
  });
  try {
    const address = server.address();
    const response = await fetch(
      `http://127.0.0.1:${address.port}/_m/__/test/webtest-content.ts`
    );
    const source = await response.text();
    const moduleImports = [...source.matchAll(/from\s+"([^"]+)"/g)].map(
      (match) => match[1]
    );
    return {
      status: response.status,
      moduleImports,
      wordgardImports: moduleImports.filter((path) => path.includes('/dist/')),
      resolvesWordgardToDist:
        moduleImports.some((path) => path === '/_m/__/dist/editor.js') &&
        moduleImports.some((path) => path === '/_m/__/dist/state.js') &&
        moduleImports.some((path) => path === '/_m/__/dist/doc.js'),
    };
  } finally {
    await new Promise((resolvePromise, reject) =>
      server.close((error) => (error ? reject(error) : resolvePromise()))
    );
  }
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function assertResult(result) {
  const expectedDiagnostics = [
    "'InputRule' is declared but its value is never read.",
    "Cannot find name 'enter'.",
    "Cannot find name 'CodeBlockLanguage'.",
    "Cannot find name 'CodeBlockLanguage'.",
    `Module '"./code"' has no exported member 'codeBlockLanguage'.`,
  ];
  const actualDiagnostics =
    result.currentBuildAndPack.currentBuild.diagnostics.map((line) =>
      line.replace(diagnosticPrefixPattern, '')
    );
  const failures = [];
  if (result.wordgardHead !== expectedHead) failures.push('head');
  if (!result.distProvenance.ignored) failures.push('dist ignored state');
  if (result.distProvenance.trackedFiles.length !== 0)
    failures.push('dist tracked files');
  if (!result.distProvenance.fileParity.allEqual)
    failures.push('historical dist parity');
  if (result.distProvenance.changedCommitsAfterSnapshot.length !== 7)
    failures.push('post-snapshot commit count');
  if (result.distProvenance.changedSourceFilesAfterSnapshot.length !== 11)
    failures.push('post-snapshot file count');
  if (result.currentBuildAndPack.currentBuild.status !== 0)
    failures.push('false-green build status');
  if (JSON.stringify(actualDiagnostics) !== JSON.stringify(expectedDiagnostics))
    failures.push('current diagnostics');
  if (result.currentBuildAndPack.cleanPack.process.status !== 0)
    failures.push('false-green clean pack status');
  if (result.currentBuildAndPack.cleanPack.files.length !== 3)
    failures.push('clean pack file count');
  if (
    result.currentBuildAndPack.cleanPack.exportTargetsMissingFromPack.length !==
    22
  )
    failures.push('clean pack missing target count');
  if (result.currentBuildAndPack.ambientDistPack.process.status !== 0)
    failures.push('ambient pack status');
  if (
    result.currentBuildAndPack.ambientDistPack.exportTargetsMissingFromPack
      .length !== 0
  )
    failures.push('ambient pack targets');
  if (
    JSON.stringify(result.publicSurface.delta.changed) !==
    JSON.stringify([
      {
        path: 'editor.Widget.Spec',
        before: {
          kind: 'T',
          type: '{ render: (value: Param) => Element | Text; eq?: (a: Param, b: Param) => boolean; connect?: (value: Param, dom: Element | Text) => void; disconnect?: (value: Param, dom: Element | Text) => void; handleEvent?: (event: Event, wg: Wordgard) => boolean; }',
        },
        after: {
          kind: 'T',
          type: '{ render: (value: Param) => Element | Text; eq?: (a: Param, b: Param) => boolean; connect?: (value: Param, dom: Element | Text) => void; disconnect?: (value: Param, dom: Element | Text) => void; handleEvent?: (event: Event, wg: Wordgard) => boolean; inFlow?: boolean; }',
        },
      },
      {
        path: 'schema.codeBlock.createOnBackticks',
        before: { kind: 'V', type: 'InputRule' },
        after: { kind: 'V', type: 'GardState.Extension' },
      },
    ])
  ) {
    failures.push('public surface delta');
  }
  if (
    JSON.stringify(result.publicSurface.unresolvedCurrentIndexExports) !==
    JSON.stringify(['schema.codeBlockLanguage'])
  )
    failures.push('unresolved current export');
  if (
    JSON.stringify(
      result.publicSurface.emittedDeclarationRuntime.missingValues
    ) !== JSON.stringify(['state.Transaction.foo'])
  )
    failures.push('declaration/runtime values');
  if (
    result.publicSurface.emittedDeclarationRuntime.missingPrototypeMembers
      .length
  )
    failures.push('declaration/runtime prototype members');
  if (
    result.publicSurface.emittedDeclarationRuntime.moduleResults.some(
      (module) => !module.topLevelEqual
    )
  )
    failures.push('top-level declaration/runtime parity');
  if (
    result.publicSurface.rootNamespaceParity.modules.some(
      (module) => !module.keyParity || !module.identityParity
    )
  )
    failures.push('root namespace parity');
  if (result.entryParity.node.process.status !== 0)
    failures.push('Node entries');
  if (result.entryParity.typescript.status !== 0)
    failures.push('TypeScript entries');
  if (result.entryParity.browserBundle.process.status !== 0)
    failures.push('browser bundle');
  if (!result.entryParity.browserTestResolution.resolvesWordgardToDist)
    failures.push('browser test resolution');
  if (result.sourceMapsAndTreeShaking.sourceMapFiles.length !== 0)
    failures.push('source maps');
  if (result.sourceMapsAndTreeShaking.sourceMappingUrlCount !== 0)
    failures.push('source map URLs');
  if (result.sourceMapsAndTreeShaking.sourceFilesPacked.length !== 0)
    failures.push('packed source files');
  if (result.sourceMapsAndTreeShaking.sideEffectsField !== null)
    failures.push('sideEffects field');
  if (failures.length) {
    throw new Error(
      `Wordgard public-contract probe drift: ${failures.join(', ')}`
    );
  }
}
