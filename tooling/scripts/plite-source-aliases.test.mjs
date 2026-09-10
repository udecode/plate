import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { getWorkspaceSourceEntries } from '../../config/workspace-source-entries.mjs';
import { plitePackages, repoRoot } from './check-plite.mjs';

const require = createRequire(import.meta.url);
const {
  createBunTestArgs,
} = require('../../tooling/scripts/bun-test-args.cjs');

test('workspace source entries cover every public runtime entry exactly once', () => {
  const entries = getWorkspaceSourceEntries(repoRoot);
  const specifiers = new Set(entries.map(({ specifier }) => specifier));
  const distEntries = new Set(entries.map(({ distEntry }) => distEntry));

  assert.equal(specifiers.size, entries.length);
  assert.equal(distEntries.size, entries.length);

  for (const { sourceEntry } of entries) {
    assert.equal(existsSync(sourceEntry), true, sourceEntry);
    assert.match(sourceEntry, /[/\\]src[/\\]/);
  }

  for (const specifier of [
    'platejs/react',
    'plitejs/react',
    'platejs/yjs',
    'platejs/yjs/react',
  ]) {
    assert.equal(specifiers.has(specifier), true, specifier);
  }
});

test('www resolves public Plite dependencies against workspace source', () => {
  const appRoot = path.join(repoRoot, 'apps/www');
  const appConfig = JSON.parse(
    readFileSync(path.join(appRoot, 'tsconfig.json'), 'utf-8')
  );
  const { paths } = appConfig.compilerOptions;
  const entries = getWorkspaceSourceEntries(repoRoot).filter(
    ({ specifier }) =>
      specifier === 'plitejs' || specifier.startsWith('plitejs/')
  );

  assert.deepEqual(
    Object.keys(paths)
      .filter((specifier) => specifier.startsWith('plitejs'))
      .sort(),
    entries.map(({ specifier }) => specifier).sort()
  );

  for (const { sourceEntry, specifier } of entries) {
    assert.deepEqual(paths[specifier], [
      path.relative(appRoot, sourceEntry).replaceAll('\\', '/'),
    ]);
  }
});

test('typed lint owns Plate tests and resolves CLI dependencies without built declarations', () => {
  const ts = createRequire(path.join(repoRoot, 'apps/www/package.json'))(
    'typescript'
  );
  const readConfig = (relativePath) => {
    const configPath = path.join(repoRoot, relativePath);

    return ts.getParsedCommandLineOfConfigFile(
      configPath,
      {},
      {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
          assert.fail(
            ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
          );
        },
      }
    );
  };
  const plateConfig = readConfig('packages/platejs/tsconfig.json');

  assert.ok(
    plateConfig.fileNames.includes(
      path.join(
        repoRoot,
        'packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts'
      )
    )
  );

  const cliConfig = readConfig('packages/cli/tsconfig.json');
  const host = {
    ...ts.sys,
    fileExists: (fileName) => {
      const resolved = ts.sys.realpath?.(fileName) ?? fileName;

      return (
        !/[/\\](?:packages|node_modules)[/\\](?:platejs|plitejs)[/\\]dist(?:[/\\]|$)/u.test(
          resolved
        ) && ts.sys.fileExists(fileName)
      );
    },
  };
  const resolved = ts.resolveModuleName(
    'plitejs',
    path.join(repoRoot, 'packages/platejs/src/facade.ts'),
    cliConfig.options,
    host
  ).resolvedModule;

  assert.equal(
    resolved?.resolvedFileName,
    path.join(repoRoot, 'packages/plitejs/src/index.ts')
  );
});

test('Plite CI runs the repository Bun version', () => {
  const rootManifest = JSON.parse(
    readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );
  const workflow = readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );
  const versions = [...workflow.matchAll(/bun-version:\s*(\S+)/g)].map(
    ([, version]) => version
  );

  assert.ok(versions.length > 0);
  assert.deepEqual([...new Set(versions)], [rootManifest.devDependencies.bun]);
});

test('Core proof preserves generated partition dependencies', () => {
  const source = readFileSync(
    path.join(repoRoot, 'tooling/scripts/check-core.mjs'),
    'utf-8'
  );

  assert.doesNotMatch(source, /run\('build /);
  assert.match(
    source,
    /run\(`lint \$\{packageSlugs\.length\} Core and reviewed packages`, 'pnpm', \[\s*'turbo',\s*'lint'/s
  );
  assert.doesNotMatch(source, /['"]--only['"]/u);
});

test('ordinary package tests use the root source-first Bun config', () => {
  assert.deepEqual(
    createBunTestArgs({
      packageCwd: path.join(repoRoot, 'packages/plitejs'),
      projectCwd: repoRoot,
    }),
    [
      `--config=${path.join(repoRoot, 'bunfig.toml')}`,
      `--cwd=${repoRoot}`,
      'test',
      'packages/plitejs/',
    ]
  );
});

test('Plate public import smoke resolves test entrypoints from root and package cwd', () => {
  for (const [cwd, filename] of [
    [repoRoot, './packages/platejs/test/public-package-import-smoke.slow.ts'],
    [
      path.join(repoRoot, 'packages/platejs'),
      './test/public-package-import-smoke.slow.ts',
    ],
  ]) {
    const result = spawnSync('bun', ['test', filename], {
      cwd,
      encoding: 'utf-8',
      timeout: 60_000,
    });

    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stderr + result.stdout, /Ran \d+ tests across 1 file/u);
  }
});

test('package typecheck gets source paths without exposing them to Bun', () => {
  const packageRunner = readFileSync(
    path.join(repoRoot, 'tooling/scripts/run-with-pkg-dir.cjs'),
    'utf-8'
  );
  const baseConfig = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'tooling/config/tsconfig.base.json'),
      'utf-8'
    )
  );

  assert.match(packageRunner, /typecheck-package-source\.mjs/);
  assert.deepEqual(baseConfig.compilerOptions.paths, {});

  const rootManifest = JSON.parse(
    readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );

  assert.match(
    rootManifest.scripts['plite:typecheck'],
    /^turbo run typecheck --filter=plitejs --filter=platejs --filter=@platejs\/test --concurrency=8/u
  );
  assert.doesNotMatch(rootManifest.scripts['plite:typecheck'], /--parallel/);
});

test('type-aware lint resolves workspace source without built declarations', (t) => {
  const root = mkdtempSync(path.join(tmpdir(), 'plate-lint-source-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const library = path.join(root, 'packages/library');
  mkdirSync(path.join(library, 'src'), { recursive: true });
  symlinkSync(
    path.join(repoRoot, 'node_modules'),
    path.join(root, 'node_modules'),
    'junction'
  );
  writeFileSync(
    path.join(library, 'package.json'),
    JSON.stringify({
      name: '@fixture/library',
      type: 'module',
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.js' },
      },
    })
  );
  const source = path.join(library, 'src/index.ts');
  writeFileSync(source, 'export const count = (): number => 1;');
  const paths = Object.fromEntries(
    getWorkspaceSourceEntries(root).map(({ specifier, sourceEntry }) => [
      specifier,
      [sourceEntry],
    ])
  );
  writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'bundler',
        strict: true,
        paths,
      },
      include: ['**/*.ts'],
    })
  );
  writeFileSync(
    path.join(root, 'check.ts'),
    "import { count } from '@fixture/library';\nasync function check() { await count(); }\nvoid check();\n"
  );
  writeFileSync(
    path.join(root, 'oxlint.json'),
    JSON.stringify({
      plugins: ['typescript'],
      rules: { 'typescript/await-thenable': 'error' },
    })
  );
  const manifest = JSON.parse(
    readFileSync(path.join(repoRoot, 'package.json'), 'utf-8')
  );
  const [command, ...args] = manifest.scripts['lint:type-aware'].split(' ');
  const run = () =>
    spawnSync(
      path.join(
        repoRoot,
        'node_modules/.bin',
        process.platform === 'win32' ? `${command}.cmd` : command
      ),
      [
        ...args.slice(0, -1),
        '--no-ignore',
        '--config',
        'oxlint.json',
        'check.ts',
      ],
      { cwd: root, encoding: 'utf-8', shell: process.platform === 'win32' }
    );
  const invalid = run();
  assert.equal(invalid.status, 1, invalid.stderr + invalid.stdout);
  assert.match(invalid.stdout + invalid.stderr, /await-thenable/);
  writeFileSync(source, 'export const count = async (): Promise<number> => 1;');
  const valid = run();
  assert.equal(valid.status, 0, valid.stderr + valid.stdout);
});

test('every Plite package typechecks against workspace source', () => {
  for (const { name, root } of plitePackages) {
    const manifest = JSON.parse(
      readFileSync(path.join(repoRoot, root, 'package.json'), 'utf-8')
    );
    const entrypointTypecheckScripts = {
      '@platejs/test':
        'node ../../tooling/scripts/run-entrypoint-package-task.mjs @platejs/test typecheck',
      platejs:
        'node ../../tooling/scripts/run-entrypoint-package-task.mjs platejs typecheck',
      plitejs:
        'node ../../tooling/scripts/run-entrypoint-package-task.mjs plitejs typecheck',
    };
    const entrypointTypecheck = entrypointTypecheckScripts[name];

    if (entrypointTypecheck) {
      assert.equal(manifest.scripts?.typecheck, entrypointTypecheck, root);
    } else {
      assert.match(
        manifest.scripts?.typecheck ?? '',
        /^node \.\.\/\.\.\/tooling\/scripts\/plate-pkg\.cjs p:typecheck(?:\s|$)/u,
        root
      );
    }
  }
});

test('Playwright containers install Bun prerequisites before setup', () => {
  const workflow = readFileSync(
    path.join(repoRoot, '.github/workflows/plite-ci.yml'),
    'utf-8'
  );

  for (const jobName of ['browser-chromium', 'browser-matrix-linux']) {
    const job = workflow.match(
      new RegExp(
        `\\n  ${jobName}:(?<body>[\\s\\S]*?)(?=\\n  [a-z][a-z0-9-]*:|$)`,
        'u'
      )
    )?.groups?.body;

    assert.ok(job, `missing ${jobName} job`);
    assert.match(job, /container: mcr\.microsoft\.com\/playwright/u);
    assert.ok(
      job.indexOf('apt-get install --yes --no-install-recommends unzip') <
        job.indexOf('uses: oven-sh/setup-bun@v2'),
      `${jobName} must install unzip before setup-bun`
    );
  }
});

test('Plate type-test fixtures resolve Plate and Plite from source', () => {
  const config = JSON.parse(
    readFileSync(
      path.join(repoRoot, 'tooling/config/tsconfig.type-tests.json'),
      'utf-8'
    )
  );

  assert.deepEqual(config.compilerOptions.paths['platejs/react'], [
    '../../packages/platejs/src/react/index.tsx',
  ]);
  assert.deepEqual(config.compilerOptions.paths['plitejs/react'], [
    '../../packages/plitejs/src/react/index.ts',
  ]);
  assert.equal(config.compilerOptions.paths['plitejs/internal'], undefined);
  assert.equal(
    config.compilerOptions.paths['plitejs/react/internal'],
    undefined
  );
  assert.equal(config.compilerOptions.paths['@udecode/*'], undefined);
});
