import assert from 'node:assert/strict';
import test from 'node:test';

import { auditPrivatePlateDeclarationBrands } from './check-package-declaration-brands.mjs';

const audit = (source) =>
  auditPrivatePlateDeclarationBrands([{ path: 'dist/index.d.ts', source }]);
const auditAt = (path, source) =>
  auditPrivatePlateDeclarationBrands([{ path, source }]);

test('checks compiler types only in exported declaration entrypoints', () => {
  const files = [
    {
      path: 'dist/index.d.ts',
      source: 'export interface BasePlugin<D> {}',
    },
    {
      path: 'dist/index-AbCd1234.d.ts',
      source:
        'type MergePluginDefinitions<A, B> = A & B; export { MergePluginDefinitions as M };',
    },
  ];

  assert.deepEqual(
    auditPrivatePlateDeclarationBrands(files, {
      publicDeclarationPaths: new Set(['dist/index.d.ts']),
    }),
    []
  );
  assert.deepEqual(
    auditPrivatePlateDeclarationBrands(files, {
      publicDeclarationPaths: new Set(['dist/index-AbCd1234.d.ts']),
    }),
    [
      'dist/index-AbCd1234.d.ts: public declaration exposes internal Plate plugin compiler type MergePluginDefinitions',
    ]
  );
});

test('rejects private Plate unique-symbol brands in public declarations', () => {
  for (const source of [
    'declare const PLATE_PLUGIN_SCHEMA_MODEL: unique symbol;',
    'type Model = typeof PLATE_PLUGIN_SCHEMA_MODEL;',
    'interface Model { readonly [PLATE_PLUGIN_SCHEMA_MODEL]: true }',
    "import { PLATE_PLUGIN_SCHEMA_MODEL as model } from 'platejs';",
  ]) {
    assert.deepEqual(audit(source), [
      'dist/index.d.ts: public declaration exposes private Plate brand PLATE_PLUGIN_SCHEMA_MODEL',
    ]);
  }
});

test('allows ordinary public Plate constants', () => {
  assert.deepEqual(
    audit(
      [
        "import { PLATE_SCOPE } from 'platejs';",
        "declare const PLATE_SCOPE = 'plate';",
        'declare const PLATE_DEFAULT_PRIORITY = 100;',
        'export { PLATE_DEFAULT_PRIORITY, PLATE_SCOPE };',
      ].join('\n')
    ),
    []
  );
});

test('rejects leaked plugin witnesses and public dependency generics', () => {
  assert.deepEqual(
    audit(`
      declare const PublicPlugin: {
        readonly [pluginDefinition]: { definition: unknown };
      };
      type Rebuilt = Plugin<ExampleDefinition, readonly [Dependency]>;
    `),
    [
      'dist/index.d.ts: public declaration exposes private plugin witness pluginDefinition',
      'dist/index.d.ts: Plugin exposes a public dependencies generic; keep Plugin<Definition> and private transitive requirements',
    ]
  );
});

test('allows the private plugin witness owner and one public definition generic', () => {
  assert.deepEqual(
    audit(`
      declare const pluginDefinition: unique symbol;
      type PluginShape<TDefinition> = {
        readonly [pluginDefinition]: {
          definition: (value: TDefinition) => TDefinition;
        };
      };
      type Plugin<TDefinition> = PluginShape<TDefinition>;
      type ExamplePlugin = Plugin<ExampleDefinition>;
      type UnifiedPlugin = import('unified').Plugin<any[], any, any>;
    `),
    []
  );
});

test('keeps root dependency references shallow and internal carriers off root', () => {
  assert.deepEqual(
    audit(`
      type Bad = PluginDependencyReference<Capability>;
      export type { PluginTypeLambda };
      export type { PluginTypeProviderOf };
    `),
    [
      'dist/index.d.ts: PluginDependencyReference must remain shallow and non-generic',
      'dist/index.d.ts: root declaration exposes internal Plite dependency type PluginTypeLambda',
      'dist/index.d.ts: root declaration exposes internal Plite dependency type PluginTypeProviderOf',
    ]
  );
  assert.deepEqual(
    audit(`
      interface PluginDependencyReference {
        readonly enabled?: boolean;
        readonly name: string;
      }
    `),
    []
  );
  assert.deepEqual(
    audit(`
      interface PluginDependencyReference {
        readonly api: unknown;
        readonly enabled?: boolean;
        readonly name: string;
      }
    `),
    [
      'dist/index.d.ts: PluginDependencyReference must contain exactly readonly name: string and readonly enabled?: boolean',
    ]
  );
  assert.deepEqual(
    audit(`
      type PluginDependencyReference = Readonly<{
        enabled?: boolean;
        name: string;
      }>;
    `),
    [
      'dist/index.d.ts: PluginDependencyReference must remain the exact shallow interface',
    ]
  );
  assert.deepEqual(
    auditAt(
      'dist/internal/index.d.ts',
      `
        export type { PluginTypeLambda };
        export type { PluginTypeProviderOf };
      `
    ),
    []
  );
  assert.deepEqual(
    auditAt('dist/index.d.mts', `export type { PluginTypeLambda };`),
    [
      'dist/index.d.mts: root declaration exposes internal Plite dependency type PluginTypeLambda',
    ]
  );
});

test('keeps Core author-to-canonical carriers off public entrypoints', () => {
  assert.deepEqual(
    auditAt(
      'dist/react/index.d.ts',
      `
        export type { PluginDefinitionCarrier };
        type Runtime = StaticPluginTypeLambda<Definition>;
      `
    ),
    [
      'dist/react/index.d.ts: public declaration exposes internal Core author-to-canonical type PluginDefinitionCarrier',
      'dist/react/index.d.ts: public declaration exposes internal Core author-to-canonical type StaticPluginTypeLambda',
    ]
  );
  assert.deepEqual(
    auditAt(
      'dist/react/internal/index.d.ts',
      `
        export type { PluginDefinitionCarrier };
        type Runtime = StaticPluginTypeLambda<Definition>;
      `
    ),
    []
  );
  assert.deepEqual(
    auditAt(
      'dist/react/index.d.ts',
      `export type { DefinitionOf, PluginReference };`
    ),
    []
  );
});

test('keeps Plate plugin compiler machinery private and out of leaf declarations', () => {
  const symbols = [
    'InternalDefinitionOf',
    'PluginDefinitionCarrier',
    'StaticPluginTypeLambda',
    'PluginDefinitionProvider',
    'PluginDefinitionRoot',
    'PluginDefinitionFromRoot',
    'NormalizeBasePluginInput',
    'NormalizePluginInput',
    'MergePluginDefinitions',
    'MergePluginState',
    'BasePluginContextualDescriptor',
    'BasePluginDescriptorCarrier',
    'BasePluginRuntimeDescriptor',
    'BasePluginDescriptor',
    'BasePluginMethods',
    'MergeBasePluginDefinitions',
    'BasePluginConstructorDefinition',
    'BasePluginConstructorProvider',
    'BasePluginConstructorResult',
    'BasePluginStageDefinition',
    'BasePluginStage',
    'ExtendedBasePlugin',
    'PluginMethods',
    'MergePlatePluginDefinitions',
    'PlatePluginConstructorDefinition',
    'PlatePluginConstructorProvider',
    'PlatePluginConstructorResult',
    'PluginStageDefinition',
    'PlatePluginStage',
    'ExtendedPlatePlugin',
    'PlatePluginAdapterProvider',
    'ToPlatePluginResult',
    'ToPlatePluginAdapterResult',
    'ToConfiguredPlatePluginResult',
  ];

  for (const symbol of symbols) {
    assert.deepEqual(
      auditAt(
        'dist/react/FeaturePlugin.d.ts',
        `export declare const FeaturePlugin: ${symbol}<Definition>;`
      ),
      [
        `dist/react/FeaturePlugin.d.ts: public declaration exposes internal Plate plugin compiler type ${symbol}`,
      ]
    );
  }

  assert.deepEqual(
    auditAt(
      'dist/lib/plugin/BasePlugin.d.ts',
      `
        type BasePluginStageDefinition<C, TStage> = C & TStage;
        interface BasePluginMethods<C> {
          extend<TStage>(stage: TStage):
            BasePlugin<BasePluginStageDefinition<C, TStage>>;
        }
        export interface BasePlugin<D> extends BasePluginMethods<D> {}
      `
    ),
    []
  );
  assert.deepEqual(
    auditAt(
      'dist/react/index.d.ts',
      `
        export interface BasePlugin<D> {}
        export interface Plugin<D> {}
        export type DefinitionOf<P> = P;
        export interface PluginReference { readonly name: string }
        export interface PluginTypeProvider<T> {
          readonly __pluginTypes?: T;
        }
      `
    ),
    []
  );
});

test('keeps package-specific type lambdas private behind public type providers', () => {
  const privateLambda = `
    interface HistoryPluginTypeLambda {
      readonly input: Value;
      readonly output: HistoryPluginTypes<this['input']>;
    }
    type HistoryPluginTypeProvider =
      PluginTypeProvider<HistoryPluginTypeLambda>;
    export { HistoryPluginTypeProvider };
  `;

  assert.deepEqual(audit(privateLambda), []);
  assert.deepEqual(
    audit(
      privateLambda.replace(
        'export { HistoryPluginTypeProvider };',
        'export { HistoryPluginTypeLambda, HistoryPluginTypeProvider };'
      )
    ),
    [
      'dist/index.d.ts: public declaration exports package-specific type lambda HistoryPluginTypeLambda; expose a *TypeProvider and keep PluginTypeLambda internal',
    ]
  );
  assert.deepEqual(audit(`export interface HistoryPluginTypeLambda {}`), [
    'dist/index.d.ts: public declaration exports package-specific type lambda HistoryPluginTypeLambda; expose a *TypeProvider and keep PluginTypeLambda internal',
  ]);
  assert.deepEqual(
    audit(`export type { LocalHistoryTypeLambda as PublicHistoryTypeLambda };`),
    [
      'dist/index.d.ts: public declaration exports package-specific type lambda LocalHistoryTypeLambda; expose a *TypeProvider and keep PluginTypeLambda internal',
      'dist/index.d.ts: public declaration exports package-specific type lambda PublicHistoryTypeLambda; expose a *TypeProvider and keep PluginTypeLambda internal',
    ]
  );
  assert.deepEqual(audit(`export type { HistoryPluginTypeProvider };`), []);
});
