import { afterEach, describe, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import type { Registry } from 'shadcn/schema';

import { parseModuleImports } from './registry-imports.mts';
import { deriveRegistryPackageDependencies } from './registry-package-dependencies.mts';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function createSourceRoot(files: Record<string, string>) {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'plate-registry-deps-'));
  temporaryDirectories.push(sourceRoot);

  for (const [path, contents] of Object.entries(files)) {
    const filePath = join(sourceRoot, path);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, contents);
  }

  return sourceRoot;
}

function createRegistry(
  items: Registry['items'],
  name = 'test-registry'
): Registry {
  return {
    homepage: 'https://example.test',
    items,
    name,
  };
}

const cyclicDags = {
  platejs: {
    entrypoints: {
      feature: {
        dependencies: ['root'],
        externalDependencies: ['plitejs'],
        peerDependencies: ['peer-a', 'react'],
        public: true,
      },
      root: {
        dependencies: ['feature'],
        externalDependencies: [],
        peerDependencies: [],
        public: true,
      },
    },
  },
  plitejs: {
    entrypoints: {
      root: {
        dependencies: [],
        externalDependencies: [],
        peerDependencies: ['peer-b'],
        public: true,
      },
    },
  },
};

const packageManifests = {
  platejs: { peerDependencies: { 'peer-a': '^1.2.0', react: '>=19.2.0' } },
  plitejs: { peerDependencies: { 'peer-b': '~2.3.0' } },
};

describe('registry import parsing', () => {
  it('finds type imports, reexports, import queries and finite dynamic imports', () => {
    const imports = parseModuleImports(
      [
        "import type { A } from 'type-import';",
        "export { B } from 'named-export';",
        "export * from 'star-export';",
        "type C = import('type-query').C;",
        "import D = require('import-equals');",
        "void import(flag ? 'dynamic-a' : 'dynamic-b');",
        'void require(`template-import`);',
      ].join('\n'),
      { filePath: 'fixture.ts' }
    );

    expect(imports.map((entry) => entry.specifier).toSorted()).toEqual([
      'dynamic-a',
      'dynamic-b',
      'import-equals',
      'named-export',
      'star-export',
      'template-import',
      'type-import',
      'type-query',
    ]);
  });

  it('ignores shadowed and member require calls', () => {
    const imports = parseModuleImports(
      [
        "require('top-level');",
        "function scoped(require: (name: string) => unknown) { require('shadowed-param'); }",
        "function lexical() { const require = () => null; require('shadowed-local'); }",
        "Plugin.require('member-call');",
      ].join('\n')
    );

    expect(imports.map((entry) => entry.specifier)).toEqual(['top-level']);
  });

  it('rejects computed module targets with source location', () => {
    expect(() =>
      parseModuleImports("const target = 'x';\nvoid import(target);", {
        filePath: 'computed.ts',
      })
    ).toThrow(
      'computed.ts:2:13: dynamic import must use a string literal, a template without substitutions, or finite literal conditional branches.'
    );
    expect(() => parseModuleImports('require();')).toThrow(
      '<source>:1:1: require must use a string literal, a template without substitutions, or finite literal conditional branches.'
    );
  });
});

describe('registry package dependency derivation', () => {
  it('walks exact Plate and Plite DAG edges once and attaches versioned peers', () => {
    const sourceRoot = createSourceRoot({
      'feature.ts': "import type { Feature } from 'platejs/feature';",
    });
    const registry = createRegistry([
      {
        files: [{ path: 'feature.ts', type: 'registry:lib' }],
        name: 'feature',
        type: 'registry:lib',
      },
    ]);

    const derived = deriveRegistryPackageDependencies(registry, {
      entrypointDags: cyclicDags,
      packageManifests,
      sourceRoot,
    });

    expect(derived.items[0].dependencies).toEqual([
      'peer-a@^1.2.0',
      'peer-b@~2.3.0',
      'platejs',
    ]);
    expect(registry.items[0].dependencies).toBeUndefined();
  });

  it('keeps compatible authored versions authoritative', () => {
    const sourceRoot = createSourceRoot({
      'feature.ts': "import { Feature } from 'platejs/feature';",
    });
    const registry = createRegistry([
      {
        dependencies: ['peer-a@1', 'third-party@9'],
        files: [{ path: 'feature.ts', type: 'registry:lib' }],
        name: 'feature',
        type: 'registry:lib',
      },
    ]);

    const derived = deriveRegistryPackageDependencies(registry, {
      entrypointDags: cyclicDags,
      packageManifests,
      sourceRoot,
    });

    expect(derived.items[0].dependencies).toEqual([
      'peer-a@1',
      'third-party@9',
      'peer-b@~2.3.0',
      'platejs',
    ]);
  });

  it('rejects incompatible authored and derived versions with file context', () => {
    const sourceRoot = createSourceRoot({
      'feature.ts': "import { Feature } from 'platejs/feature';",
    });
    const registry = createRegistry([
      {
        dependencies: ['peer-a@2'],
        files: [{ path: 'feature.ts', type: 'registry:lib' }],
        name: 'feature',
        type: 'registry:lib',
      },
    ]);

    expect(() =>
      deriveRegistryPackageDependencies(registry, {
        entrypointDags: cyclicDags,
        packageManifests,
        sourceRoot,
      })
    ).toThrow(
      'feature:feature.ts:1:25 -> platejs/feature via platejs/feature: authored peer-a@2 is incompatible with derived peer-a@^1.2.0.'
    );
  });

  it('rejects missing peer versions and unknown public entrypoints', () => {
    const sourceRoot = createSourceRoot({
      'feature.ts': "import { Feature } from 'platejs/feature';",
      'unknown.ts': "import { Missing } from 'platejs/private';",
    });

    expect(() =>
      deriveRegistryPackageDependencies(
        createRegistry([
          {
            files: [{ path: 'feature.ts', type: 'registry:lib' }],
            name: 'feature',
            type: 'registry:lib',
          },
        ]),
        {
          entrypointDags: cyclicDags,
          packageManifests: {
            ...packageManifests,
            platejs: { peerDependencies: {} },
          },
          sourceRoot,
        }
      )
    ).toThrow(
      'platejs/feature requires peer-a, but platejs/package.json has no peer dependency version'
    );

    expect(() =>
      deriveRegistryPackageDependencies(
        createRegistry([
          {
            files: [{ path: 'unknown.ts', type: 'registry:lib' }],
            name: 'unknown',
            type: 'registry:lib',
          },
        ]),
        {
          entrypointDags: cyclicDags,
          packageManifests,
          sourceRoot,
        }
      )
    ).toThrow('unknown public Plate/Plite entrypoint platejs/private');
  });

  it('accepts exact package-manifest asset exports without inventing DAG nodes', () => {
    const sourceRoot = createSourceRoot({
      'math.ts': "import 'platejs/math/katex.css';",
    });
    const derived = deriveRegistryPackageDependencies(
      createRegistry([
        {
          files: [{ path: 'math.ts', type: 'registry:lib' }],
          name: 'math',
          type: 'registry:lib',
        },
      ]),
      {
        entrypointDags: cyclicDags,
        packageManifests: {
          ...packageManifests,
          platejs: {
            ...packageManifests.platejs,
            exports: { './math/katex.css': './math/katex.css' },
          },
        },
        sourceRoot,
      }
    );

    expect(derived.items[0].dependencies).toEqual(['platejs']);
  });

  it('derives provider packages from the selected source file', () => {
    const sourceRoot = createSourceRoot({
      'bases/base/toolbar.tsx':
        "import { Toolbar } from '@base-ui/react/toolbar';",
      'bases/radix/toolbar.tsx':
        "import * as Toolbar from '@radix-ui/react-toolbar';",
    });
    const item = (path: string) => ({
      files: [
        {
          path,
          target: '@components/editor/toolbar.tsx',
          type: 'registry:component' as const,
        },
      ],
      name: 'toolbar',
      type: 'registry:component' as const,
    });

    const base = deriveRegistryPackageDependencies(
      createRegistry([item('bases/base/toolbar.tsx')]),
      {
        entrypointDags: {},
        packageManifests: {},
        sourceRoot,
      }
    );
    const radix = deriveRegistryPackageDependencies(
      createRegistry([item('bases/radix/toolbar.tsx')]),
      {
        entrypointDags: {},
        packageManifests: {},
        sourceRoot,
      }
    );

    expect(base.items[0].dependencies).toEqual(['@base-ui/react']);
    expect(radix.items[0].dependencies).toEqual(['@radix-ui/react-toolbar']);
  });

  it('resolves copied targets through direct registry edges and terminates cycles', () => {
    const sourceRoot = createSourceRoot({
      'a.ts': "import { value } from '@/registry/b';",
      'b.ts': 'export const value = 1;',
    });
    const registry = createRegistry([
      {
        files: [{ path: 'a.ts', type: 'registry:lib' }],
        name: 'a',
        registryDependencies: ['@plate/b'],
        type: 'registry:lib',
      },
      {
        files: [{ path: 'b.ts', type: 'registry:lib' }],
        name: 'b',
        registryDependencies: ['@plate/a'],
        type: 'registry:lib',
      },
      {
        files: [],
        name: 'empty-cycle-a',
        registryDependencies: ['@plate/empty-cycle-b'],
        type: 'registry:lib',
      },
      {
        files: [],
        name: 'empty-cycle-b',
        registryDependencies: ['@plate/empty-cycle-a'],
        type: 'registry:lib',
      },
    ]);

    const derived = deriveRegistryPackageDependencies(registry, {
      entrypointDags: {},
      packageManifests: {},
      sourceRoot,
    });

    expect(derived.items.map((item) => item.dependencies)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('rejects ambiguous installed targets', () => {
    const sourceRoot = createSourceRoot({
      'consumer.ts': "import { value } from '@/registry/shared';",
      'shared.ts': 'export const value = 1;',
    });
    const registry = createRegistry([
      {
        files: [{ path: 'consumer.ts', type: 'registry:lib' }],
        name: 'consumer',
        registryDependencies: ['@plate/shared-a', '@plate/shared-b'],
        type: 'registry:lib',
      },
      {
        files: [{ path: 'shared.ts', type: 'registry:lib' }],
        name: 'shared-a',
        type: 'registry:lib',
      },
      {
        files: [{ path: 'shared.ts', type: 'registry:lib' }],
        name: 'shared-b',
        type: 'registry:lib',
      },
    ]);

    expect(() =>
      deriveRegistryPackageDependencies(registry, {
        entrypointDags: {},
        packageManifests: {},
        sourceRoot,
      })
    ).toThrow(
      'consumer:consumer.ts:1:23 -> @/registry/shared: installed registry target is ambiguous between shared-a, shared-b.'
    );
  });

  it('fails on missing copied targets and broken internal registry names', () => {
    const sourceRoot = createSourceRoot({
      'missing.ts': "import value from './absent';",
    });

    expect(() =>
      deriveRegistryPackageDependencies(
        createRegistry([
          {
            files: [{ path: 'missing.ts', type: 'registry:lib' }],
            name: 'missing',
            type: 'registry:lib',
          },
        ]),
        {
          entrypointDags: {},
          packageManifests: {},
          sourceRoot,
        }
      )
    ).toThrow(
      'missing:missing.ts:1:19 -> ./absent: no installed registry target'
    );

    expect(() =>
      deriveRegistryPackageDependencies(
        createRegistry([
          {
            files: [],
            name: 'broken',
            registryDependencies: ['@plate/absent'],
            type: 'registry:lib',
          },
        ]),
        {
          entrypointDags: {},
          packageManifests: {},
          sourceRoot,
        }
      )
    ).toThrow('broken: unknown Plate registry dependency @plate/absent');
  });
});
