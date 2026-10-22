import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
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
import { finalizePlateDeclarations } from './finalize-plate-declarations.mjs';

const directPackageDirectories = ['cli', 'platejs', 'plitejs', 'test'];
const directBuildScript = 'tsdown --config tsdown.config.mts --log-level warn';
const plateBuildScript = `${directBuildScript} && tsdown --config tsdown.declarations.config.mts --log-level warn && node ../../tooling/scripts/fix-declaration-specifiers.mjs dist && node ../../tooling/scripts/finalize-plate-declarations.mjs dist`;

test('finalizes Plate declarations without private-layer provenance', (t) => {
  const packagesRoot = mkdtempSync(
    path.join(os.tmpdir(), 'plate-declarations-')
  );

  t.after(() => rmSync(packagesRoot, { force: true, recursive: true }));

  const declarationRoot = path.join(packagesRoot, 'platejs', 'dist');
  const declarationPath = path.join(declarationRoot, 'index.d.ts');
  const bundledSource = path.join(packagesRoot, 'plitejs', 'src', 'core');

  mkdirSync(declarationRoot, { recursive: true });
  mkdirSync(bundledSource, { recursive: true });
  writeFileSync(
    declarationPath,
    '//#region ../internal/editor.d.ts\nexport type Editor = {};\n//#endregion\n'
  );
  finalizePlateDeclarations(declarationRoot);
  assert.equal(
    readFileSync(declarationPath, 'utf-8'),
    'export type Editor = {};\n'
  );

  writeFileSync(
    path.join(bundledSource, 'reads.ts'),
    'export type Reads = {\n  /**\n   * Plite sets the patched properties.\n   */\n  adopt: true;\n};\n'
  );
  writeFileSync(
    declarationPath,
    '//#region ../plitejs/dist/core/reads.d.ts\n//#region src/core/reads.d.ts\ntype Reads = {\n    /**\n     * Plite sets the patched properties.\n     */\n    adopt: true;\n};\n//#endregion\n'
  );
  assert.throws(
    () => finalizePlateDeclarations(declarationRoot),
    /plitejs\/src\/core\/reads\.ts:3 \(index\.d\.ts:3\)$/u
  );
});

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

test('rejects a stylesheet export outside dist', () => {
  assert.throws(
    () =>
      getPackageBuildArtifacts({
        exports: { './style.css': './style.css' },
      }),
    /must live in \.\/dist/u
  );
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
    "export { react } from 'plitejs/react';\n"
  );
  writeFileSync(path.join(packageRoot, 'dist/index.d.ts'), 'export {};\n');

  assert.throws(
    () =>
      assertPackageBuildArtifacts(packageRoot, {
        runtimeImportBoundaries: [
          {
            entry: 'dist/index.js',
            forbiddenPackages: ['plitejs/react'],
          },
        ],
      }),
    /Runtime import boundary violation from dist\/index\.js: dist\/index\.js -> dist\/base\.js -> plitejs\/react/u
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
    "import 'plitejs/react';\n"
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
    /Runtime import boundary violation from dist\/index\.js: dist\/index\.js -> plitejs\/react/u
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
          'plitejs/react',
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

test('rejects runtime modules that reach external names through a namespace object', async (t) => {
  const packageRoot = mkdtempSync(path.join(os.tmpdir(), 'package-build-'));

  t.after(() => {
    rmSync(packageRoot, { force: true, recursive: true });
  });

  mkdirSync(path.join(packageRoot, 'dist/_virtual/_rolldown'), {
    recursive: true,
  });
  writeFileSync(
    path.join(packageRoot, 'package.json'),
    `${JSON.stringify({ exports: { '.': './dist/index.js' } })}\n`
  );
  writeFileSync(
    path.join(packageRoot, 'dist/_virtual/_rolldown/runtime.js'),
    'var __exportAll = () => {};\nvar __reExport = () => {};\nexport { __exportAll, __reExport };\n'
  );
  writeFileSync(
    path.join(packageRoot, 'dist/index.js'),
    [
      'import { __exportAll, __reExport } from "./_virtual/_rolldown/runtime.js";',
      'export * from "plitejs";',
      'var core_exports = /* @__PURE__ */ __exportAll({});',
      'import * as plitejs from "plitejs";',
      '__reExport(core_exports, plitejs);',
      'const element = core_exports.schema.element.textBlock();',
      'export { element };',
      '',
    ].join('\n')
  );

  const config = withRuntimeImportBoundaryConfig({ cwd: packageRoot });

  await assert.rejects(
    () => config.hooks['build:done']({}),
    /namespace objects that defeat consumer tree shaking: dist\/index\.js\.\n.*: schema$/u
  );

  writeFileSync(
    path.join(packageRoot, 'dist/index.js'),
    'import { schema } from "plitejs";\nexport * from "plitejs";\nexport const element = schema.element.textBlock();\n'
  );

  await assert.doesNotReject(() => config.hooks['build:done']({}));
});

test('shared package config builds from the invoking package root', async () => {
  const packageRoot = path.resolve(
    import.meta.dirname,
    '../../packages/platejs'
  );
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

test('all editor release packages use the direct runtime build owner', async () => {
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
      packageJson.name === 'platejs' ? plateBuildScript : directBuildScript,
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
