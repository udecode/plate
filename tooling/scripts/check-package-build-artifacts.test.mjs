import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  withDirectPackageConfig,
  withRuntimeImportBoundaryConfig,
} from '../config/direct-package.config.mts';
import {
  assertPackageBuildArtifacts,
  assertPackageRuntimeImportBoundaries,
  getPackageRuntimeImportBoundaries,
  getPackageBuildArtifacts,
} from './check-package-build-artifacts.mjs';

const directPackageDirectories = [
  'browser',
  'cli',
  'core',
  'plite',
  'plite-dom',
  'plite-history',
  'plite-hyperscript',
  'plite-layout',
  'plite-react',
  'udecode/utils',
  'yjs',
];

test('derives runtime and declaration artifacts from public exports', () => {
  assert.deepEqual(
    getPackageBuildArtifacts({
      exports: {
        '.': './dist/index.js',
        './internal': {
          default: './dist/internal/index.js',
          import: './dist/internal/index.js',
          node: './dist/internal/index.cjs',
          types: './dist/internal/index.d.ts',
        },
        './package.json': './package.json',
      },
    }),
    [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/internal/index.js',
      'dist/internal/index.cjs',
      'dist/internal/index.d.ts',
    ]
  );
});

test('rejects public artifacts outside dist', () => {
  assert.throws(
    () =>
      getPackageBuildArtifacts({
        exports: { '.': './src/index.js' },
      }),
    /must live in \.\/dist/u
  );
});

test('accepts a bin-only public package', () => {
  assert.deepEqual(
    getPackageBuildArtifacts({
      bin: { plate: './dist/bin.js' },
      exports: { './package.json': './package.json' },
    }),
    ['dist/bin.js']
  );
});

test('asserts every public runtime and declaration artifact', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({ exports: { '.': './dist/index.js' } })}\n`
  );
  writeFileSync(path.join(packageRoot, 'dist/index.js'), 'export {};\n');

  assert.throws(() => {
    assertPackageBuildArtifacts(packageRoot);
  }, /dist\/index\.d\.ts/u);

  writeFileSync(path.join(packageRoot, 'dist/index.d.ts'), 'export {};\n');
  assert.doesNotThrow(() => {
    assertPackageBuildArtifacts(packageRoot);
  });
});

test('rejects forbidden runtime packages through emitted local chunks', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({ exports: { '.': './dist/index.js' } })}\n`
  );
  writeFileSync(
    path.join(packageRoot, 'dist/index.js'),
    "export * from './base.js';\n"
  );
  writeFileSync(
    path.join(packageRoot, 'dist/base.js'),
    "export { react } from '@platejs/plite-react/internal';\n"
  );
  writeFileSync(path.join(packageRoot, 'dist/index.d.ts'), 'export {};\n');

  assert.throws(
    () =>
      assertPackageBuildArtifacts(packageRoot, {
        runtimeImportBoundaries: [
          {
            entry: 'dist/index.js',
            forbiddenPackages: ['@platejs/plite-react'],
          },
        ],
      }),
    /Runtime import boundary violation from dist\/index\.js: dist\/index\.js -> dist\/base\.js -> @platejs\/plite-react\/internal/u
  );
});

test('rejects forbidden runtime packages through compact ESM chunks', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({
      exports: {
        '.': './dist/index.js',
        './react': './dist/react.js',
      },
    })}\n`
  );
  writeFileSync(
    path.join(packageRoot, 'dist/index.js'),
    "export*from'./base.js';\n"
  );
  writeFileSync(
    path.join(packageRoot, 'dist/base.js'),
    "import{useState}from'react';export{useState};\n"
  );

  assert.throws(
    () => assertPackageRuntimeImportBoundaries(packageRoot),
    /Runtime import boundary violation from dist\/index\.js: dist\/index\.js -> dist\/base\.js -> react/u
  );
});

test('rejects forbidden runtime packages through CommonJS chunks', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({
      exports: {
        '.': './dist/index.cjs',
        './react': './dist/react.cjs',
      },
    })}\n`
  );
  writeFileSync(
    path.join(packageRoot, 'dist/index.cjs'),
    "module.exports = require('./base.cjs');\n"
  );
  writeFileSync(
    path.join(packageRoot, 'dist/base.cjs'),
    "module.exports = require('react');\n"
  );

  assert.throws(
    () => assertPackageRuntimeImportBoundaries(packageRoot),
    /Runtime import boundary violation from dist\/index\.cjs: dist\/index\.cjs -> dist\/base\.cjs -> react/u
  );
});

test('direct package builds enforce inferred runtime boundaries', async (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist/react'), { recursive: true });
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({
      exports: {
        '.': './dist/index.js',
        './react': './dist/react/index.js',
      },
    })}\n`
  );
  writeFileSync(
    path.join(packageRoot, 'dist/index.js'),
    "import '@platejs/plite-react';\n"
  );
  writeFileSync(path.join(packageRoot, 'dist/index.d.ts'), 'export {};\n');
  writeFileSync(path.join(packageRoot, 'dist/react/index.js'), 'export {};\n');
  writeFileSync(
    path.join(packageRoot, 'dist/react/index.d.ts'),
    'export {};\n'
  );

  const config = withDirectPackageConfig({ cwd: packageRoot });

  await assert.rejects(
    () => config.hooks['build:done']({}),
    /Runtime import boundary violation from dist\/index\.js: dist\/index\.js -> @platejs\/plite-react/u
  );
});

test('keeps forbidden packages legal in unconfigured sibling entries', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist/react'), { recursive: true });
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({
      exports: {
        '.': './dist/index.js',
        './react': './dist/react/index.js',
      },
    })}\n`
  );
  writeFileSync(path.join(packageRoot, 'dist/index.js'), 'export {};\n');
  writeFileSync(path.join(packageRoot, 'dist/index.d.ts'), 'export {};\n');
  writeFileSync(
    path.join(packageRoot, 'dist/react/index.js'),
    "import React from 'react';\nexport { React };\n"
  );
  writeFileSync(
    path.join(packageRoot, 'dist/react/index.d.ts'),
    'export {};\n'
  );

  assert.doesNotThrow(() => {
    assertPackageBuildArtifacts(packageRoot);
  });
});

test('infers React-free root boundaries from split package exports', () => {
  assert.deepEqual(
    getPackageRuntimeImportBoundaries({
      exports: {
        '.': './dist/index.js',
        './react': './dist/react/index.js',
      },
    }),
    [
      {
        entry: 'dist/index.js',
        forbiddenPackages: [
          '@platejs/plite-react',
          'react',
          'react-compiler-runtime',
          'react-dom',
        ],
      },
    ]
  );
  assert.deepEqual(
    getPackageRuntimeImportBoundaries({
      exports: { '.': './dist/index.js' },
    }),
    []
  );
});

test('non-direct package builds enforce inferred runtime boundaries', async (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({
      exports: {
        '.': './dist/index.js',
        './react': './dist/react/index.js',
      },
    })}\n`
  );
  writeFileSync(
    path.join(packageRoot, 'dist/index.js'),
    "import React from 'react';\nexport { React };\n"
  );

  const config = withRuntimeImportBoundaryConfig({ cwd: packageRoot });

  await assert.rejects(
    () => config.hooks['build:done']({}),
    /Runtime import boundary violation from dist\/index\.js: dist\/index\.js -> react/u
  );
});

test('all root and React packages use a runtime-boundary-aware build owner', () => {
  const packagesRoot = path.resolve(import.meta.dirname, '../../packages');
  const packageJsonPaths = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.name === 'package.json') {
        packageJsonPaths.push(entryPath);
      }
    }
  };

  visit(packagesRoot);

  const targets = packageJsonPaths.filter((packageJsonPath) => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    return getPackageRuntimeImportBoundaries(packageJson).length > 0;
  });

  assert.ok(targets.length > 0);

  for (const packageJsonPath of targets) {
    const packageRoot = path.dirname(packageJsonPath);
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const localConfigPath = path.join(packageRoot, 'tsdown.config.mts');

    if (!existsSync(localConfigPath)) {
      assert.equal(packageJson.scripts?.build, 'plate-pkg p:build');
      continue;
    }

    assert.equal(
      packageJson.scripts?.build,
      'tsdown --config tsdown.config.mts --log-level warn'
    );
    assert.match(
      readFileSync(localConfigPath, 'utf-8'),
      /(?:createPlatePackageConfig|defineDirectPackageConfig)/u
    );
  }
});

test('rejects missing local chunks inside a runtime boundary', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({ exports: { '.': './dist/index.js' } })}\n`
  );
  writeFileSync(
    path.join(packageRoot, 'dist/index.js'),
    "export * from './missing.js';\n"
  );
  writeFileSync(path.join(packageRoot, 'dist/index.d.ts'), 'export {};\n');

  assert.throws(
    () =>
      assertPackageBuildArtifacts(packageRoot, {
        runtimeImportBoundaries: [
          { entry: 'dist/index.js', forbiddenPackages: [] },
        ],
      }),
    /Runtime import boundary missing local import from dist\/index\.js: dist\/index\.js -> dist\/missing\.js/u
  );
});

test('rejects plugin descriptors erased to any in public declarations', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({ exports: { '.': './dist/index.js' } })}\n`
  );
  writeFileSync(path.join(packageRoot, 'dist/index.js'), 'export {};\n');
  writeFileSync(
    path.join(packageRoot, 'dist/index.d.ts'),
    'declare const BrokenPlugin: any;\nexport { BrokenPlugin };\n'
  );

  assert.throws(() => {
    assertPackageBuildArtifacts(packageRoot);
  }, /plugin declarations collapsed to any/u);
});

test('rejects declaration aliases with erased Readonly arguments', (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist'));
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({ exports: { '.': './dist/index.js' } })}\n`
  );
  writeFileSync(path.join(packageRoot, 'dist/index.js'), 'export {};\n');
  writeFileSync(
    path.join(packageRoot, 'dist/index.d.ts'),
    'type BrokenDescriptor = Readonly;\nexport { BrokenDescriptor };\n'
  );

  assert.throws(() => {
    assertPackageBuildArtifacts(packageRoot);
  }, /lost their Readonly type arguments/u);
});

test('shared package config builds from the invoking package root', async () => {
  const packageRoot = path.resolve(import.meta.dirname, '../../packages/media');
  const repositoryRoot = path.resolve(import.meta.dirname, '../..');
  const previousInitCwd = process.env.INIT_CWD;

  process.env.INIT_CWD = packageRoot;

  try {
    const { default: buildConfig, resolvePlatePackageRoot } = await import(
      `../config/tsdown.config.ts?test=${Date.now()}`
    );
    const resolvedBuildConfig = await buildConfig({});

    assert.equal(
      resolvePlatePackageRoot({
        cwd: packageRoot,
        initCwd: repositoryRoot,
      }),
      packageRoot
    );
    assert.equal(
      resolvePlatePackageRoot({
        cwd: path.join(repositoryRoot, 'tooling/config'),
        initCwd: packageRoot,
      }),
      packageRoot
    );

    for (const config of Array.isArray(resolvedBuildConfig)
      ? resolvedBuildConfig
      : [resolvedBuildConfig]) {
      assert.equal(config.cwd, packageRoot);
      assert.ok(
        config.entry.every((entry) => entry.startsWith(packageRoot)),
        config.entry
      );
    }
  } finally {
    if (previousInitCwd === undefined) {
      delete process.env.INIT_CWD;
    } else {
      process.env.INIT_CWD = previousInitCwd;
    }
  }
});

test('all Plite release packages use one direct tsdown build', async () => {
  for (const packageDirectory of directPackageDirectories) {
    const packageRoot = path.resolve(
      import.meta.dirname,
      `../../packages/${packageDirectory}`
    );
    const previousInitCwd = process.env.INIT_CWD;

    process.env.INIT_CWD = packageRoot;

    const { default: buildConfig } = await import(
      `../../packages/${packageDirectory}/tsdown.config.mts`
    ).finally(() => {
      if (previousInitCwd === undefined) {
        delete process.env.INIT_CWD;
      } else {
        process.env.INIT_CWD = previousInitCwd;
      }
    });
    const resolvedBuildConfig =
      typeof buildConfig === 'function' ? await buildConfig({}) : buildConfig;
    const packageJson = JSON.parse(
      await readFile(
        new URL(
          `../../packages/${packageDirectory}/package.json`,
          import.meta.url
        ),
        'utf-8'
      )
    );

    assert.equal(
      packageJson.scripts.build,
      'tsdown --config tsdown.config.mts --log-level warn',
      packageDirectory
    );
    assert.ok(
      getPackageBuildArtifacts(packageJson).length > 0,
      packageDirectory
    );
    for (const config of Array.isArray(resolvedBuildConfig)
      ? resolvedBuildConfig
      : [resolvedBuildConfig]) {
      assert.equal(config.tsconfig, 'tsconfig.build.json', packageDirectory);
    }
  }
});
