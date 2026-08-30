import assert from 'node:assert/strict';
import test from 'node:test';

import {
  auditNamedSchemaLineageDocument,
  auditPlateSchemaSource,
  ciGeneratedPlateSchemaOutputRoots,
  isPlateSchemaAdoptionSourcePath,
} from './check-plate-schema-adoption.mjs';

const expectRejected = (source) => {
  assert.notEqual(auditPlateSchemaSource(source).length, 0, source);
};

const expectAccepted = (source) => {
  assert.deepEqual(auditPlateSchemaSource(source), [], source);
};

test('names CI-owned generated output excluded from source adoption proof', () => {
  assert.deepEqual(ciGeneratedPlateSchemaOutputRoots, [
    'apps/www/public/r',
    'apps/www/public/rd',
    'templates',
  ]);
  assert.equal(
    isPlateSchemaAdoptionSourcePath(
      'apps/www/src/registry/components/editor/plugins/basic-blocks-kit.tsx'
    ),
    true
  );
  assert.equal(
    isPlateSchemaAdoptionSourcePath('apps/www/public/r/basic-blocks-kit.json'),
    false
  );
  assert.equal(
    isPlateSchemaAdoptionSourcePath('apps/www/public/rd/registry.json'),
    false
  );
  assert.equal(
    isPlateSchemaAdoptionSourcePath('templates/plate-template/src/editor.tsx'),
    false
  );
});

test('rejects every deleted Plate schema authoring shape', () => {
  for (const source of [
    `defineBasePlugin('p', {node: { element: true } })`,
    `ParagraphPlugin.configure({ node: { type: 'p' } })`,
    `defineBasePlugin('p', {node: { component: Paragraph } })`,
    `defineBasePlugin('p', {schema: { mark: true } })`,
    `const schemaKey = 'schema'; defineBasePlugin('p', {[schemaKey]: { mark: true } })`,
    `let schemaKey; schemaKey = 'schema'; defineBasePlugin('p', {[schemaKey]: { element: {} } })`,
    `const schemaKey = 'schema'; function helper() { const schemaKey = 'notSchema'; return schemaKey } defineBasePlugin('p', {[schemaKey]: { element: {} } })`,
    `defineBasePlugin('p', {schema: () => ({ mark: true }) })`,
    `schema.contribution({ elements: {} })`,
    `schema.element({ content: schema.content.text() })`,
    `schema.group({ name: 'flow' })`,
    `schema.root({ content: schema.content.text() })`,
    `const value: PluginBaseNode = {}`,
    `const value: PluginNodeMark = {}`,
    `freezePlateSchemaOptions({})`,
    `resolvePlatePluginType('paragraph')`,
    `const name = 'plate:plugin-schema:paragraph'`,
    `const group = 'plate:block-content'`,
    'const group = `plate:block-content`',
    `defineBasePlugin('p', {schema: ({ editor }) => ({ editor }) })`,
    `defineBasePlugin('link', { config: { schemes: ['https'] }, })`,
    `const configKey = 'config'; definePlatePlugin('link', { [configKey]: {}, })`,
    `ParagraphPlugin.configure({ config: { topLevel: true } })`,
    `defineBasePlugin('p', {schema: { element: { groups: ['block'] } } })`,
    `defineBasePlugin('p', {schema: { element: {} } })`,
    `defineBasePlugin('link', {schema: { element: { inline: true } } })`,
    `defineExtension('paragraph', {schema: { elements: { paragraph: {} } } })`,
    `defineEditorSchema("schema:app", { id: 'app', version: 1, elements: { paragraph: {} } })`,
    `const elementsKey = 'elements'; defineEditorSchema("schema:app", { id: 'app', version: 1, [elementsKey]: { paragraph: {} } })`,
    `const schemaKey = 'schema'; const elementsKey = 'elements'; defineExtension('paragraph', {[schemaKey]: { [elementsKey]: { paragraph: {} } } })`,
    `defineBasePlugin<ParagraphConfig>('p', { schema: { element: { content: schema.content.text() } } })`,
    `definePlatePlugin<LinkConfig>('link', { schema: { element: { content: schema.content.text(), inline: true } } })`,
    `defineBasePlugin('p', {schema: { element: { content: schema.content.type(KEYS.p) } } })`,
    `IndentPlugin.configure({ initialState: { targetPlugins: ['p'] } })`,
    `ParagraphPlugin.configure(() => ({ schema: { element: {} } }))`,
    `ParagraphPlugin.configure(() => { return { type: 'other' } })`,
    `defineBasePlugin('p', { type: 'paragraph' })`,
    `defineBasePlugin('mark', { key: 'bold' })`,
    `defineBasePlugin('mark', { schema: ({ own }) => ({ mark: own.key }) })`,
    `defineBasePlugin('p', { schema: ({ type }) => ({ element: { type } }) })`,
    `const badRuntimeConfig = { schema: { element: {} } }; ParagraphPlugin.configure(() => badRuntimeConfig)`,
    `// @ts-expect-error deleted shape\ndefineBasePlugin('p', { node: { element: true } })`,
    `// @ts-expect-error deleted shape\ndefineBasePlugin('p', { schema: { mark: true } })`,
    `node.element`,
    `node.mark`,
    `plugin.node.element`,
    `plugin.node.mark`,
    `node.component`,
    `plugin.node.component`,
    `defineBasePlugin('p', {render: { node: ParagraphElement } })`,
    `definePlatePlugin('p', { }).extend({ render: { node: ParagraphElement } })`,
    `ParagraphPlugin.configure({ render: { node: ParagraphElement } })`,
    `toPlatePlugin(BaseParagraphPlugin, { render: { node: ParagraphElement } })`,
    `editor.read.schema.property({ key: 'schemaAdvanced', placement: 'text', type: 'p' })`,
  ]) {
    expectRejected(source);
  }
});

test('allows the private block-content group only in its compiler owner', () => {
  assert.deepEqual(
    auditPlateSchemaSource(
      `const PLATE_BLOCK_CONTENT_SCHEMA_GROUP = 'plate:block-content'`,
      'packages/platejs/src/internal/plugin/compilePlateModel.ts'
    ),
    []
  );
});

test('rejects deleted plugin builders while allowing the foreign Zustand selector method', () => {
  for (const method of [
    'clone',
    'extendApi',
    'extendCodecs',
    'extendEditorApi',
    'extendExtension',
    'extendHtmlCodec',
    'extendSelectors',
    'extendTx',
    'extendTxGroup',
    'withComponent',
  ]) {
    assert.match(
      auditPlateSchemaSource(`ExamplePlugin.${method}(() => ({}))`)[0]
        ?.reason ?? '',
      /deleted plugin builder/
    );
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `store = store.extendSelectors(() => extendedOptions)`,
      'packages/platejs/src/internal/plugin/resolvePlugins.ts'
    ),
    []
  );
  assert.deepEqual(
    auditPlateSchemaSource(
      `createZustandStore({}, { name: 'store' }).extendActions(() => ({})).extendSelectors(() => ({}))`
    ),
    []
  );
  assert.deepEqual(auditPlateSchemaSource(`request.nextUrl.clone()`), []);

  for (const source of [
    `Plugin.extendApi?.(() => ({}))`,
    `Plugin?.extendApi(() => ({}))`,
    `ExamplePlugin.configure?.({}).extend({})`,
  ]) {
    expectRejected(source);
  }
});

test('accepts the full independent plugin declaration vocabulary in constructors', () => {
  for (const source of [
    `defineBasePlugin('p', { api: () => ({}), commands: () => [], component: ParagraphElement,on: {}, read: () => ({}), readMiddleware: () => [], render: { leaf: Leaf }, selectors: {}, update: () => ({}) })`,
    `defineBasePlugin('markCapability', { schema: { mark: { key: 'persistedMark', property: property.boolean() } } })`,
    `definePlatePlugin('p', { component: ParagraphElement,on: {} })`,
    `defineBasePlugin('p', {...behavior })`,
    `const componentKey = 'component'; defineBasePlugin('p', { [componentKey]: ParagraphElement, })`,
    `const createPlugin = defineBasePlugin; createPlugin('p', { component: ParagraphElement })`,
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source), []);
  }

  assert.match(
    auditPlateSchemaSource(`
      Core.defineBasePlugin('p', {
        codecs: { 'text/html': rule },

      });
    `)[0]?.reason ?? '',
    /context-bound defineCodecs/
  );

  assert.deepEqual(
    auditPlateSchemaSource(
      `(defineBasePlugin as any)({ codecs: {}, name: 'negative' })`,
      'packages/platejs/src/lib/plugin/other.spec.ts'
    ),
    []
  );
});

test('rejects deleted Plate and Plite definition fields', () => {
  const plateIssues = auditPlateSchemaSource(
    `defineBasePlugin('p', {
      clipboard: {},
      config: {},
      extension: {},
      handlers: {},

      pluginApi: {},
      targetPluginKeys: [],
      tx: {},
      validateConfiguration() {},
    })`
  );

  assert.equal(
    plateIssues.filter((issue) =>
      issue.reason.includes('deleted Plate plugin definition field')
    ).length,
    8
  );

  for (const source of [
    `Plugin.extend(() => ({ extension: {} }))`,
    `Plugin.configure({ handlers: {} })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source)[0]?.reason ?? '',
      /deleted Plate plugin definition field/
    );
  }

  const pliteIssues = auditPlateSchemaSource(
    `defineExtension('raw', {
      config: {},

      state: {},
      tx: {},
      validateConfiguration() {},
    })`
  );

  assert.equal(
    pliteIssues.filter((issue) =>
      issue.reason.includes('deleted Plite extension definition field')
    ).length,
    4
  );
  assert.match(
    auditPlateSchemaSource(`defineExtension<Editor>('typed', {})`)[0]?.reason ??
      '',
    /infers one definition/
  );
  assert.match(
    auditPlateSchemaSource(`defineBasePlugin<Definition>('typedPlate', {})`)[0]
      ?.reason ?? '',
    /infer one definition/
  );
  assert.match(
    auditPlateSchemaSource(`editor.getApi(RawExtension).run()`)[0]?.reason ??
      '',
    /editor.extension\(Extension\)\.api/
  );
});

test('rejects the deleted root editor tx channel in test fixtures', () => {
  for (const source of [
    `editor.tx.footnote.focusDefinition({ identifier: '1' })`,
    `editor.tx?.footnote.focusDefinition({ identifier: '1' })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(
        source,
        'apps/www/src/registry/components/editor/footnote.slow.tsx'
      )[0]?.reason ?? '',
      /root editor\.update channel/
    );
  }
  expectAccepted(`editor.update.footnote.focusDefinition({ identifier: '1' })`);
});

test('requires prefixless on listeners only inside resolved plugin declarations', () => {
  const issues = auditPlateSchemaSource(`
    const legacy = { onKeyDown() {}, onNodeChange() {} };
    const on = { onPasteCapture() {}, onTextChange() {} };
    definePlatePlugin('plate', {on: { ...legacy } });
    defineBasePlugin('base', {on });
    defineExtension('plite', {on: { onKeyDown() {} } });
  `);

  assert.equal(
    issues.filter((issue) => issue.reason.includes('listeners are prefixless'))
      .length,
    5
  );
  expectAccepted(`
    definePlatePlugin('current', {
      on: {
        domBeforeInput() {},
        keyDown() {},
        nodeChange() {},
        pasteCapture() {},
        textChange() {},
      },
    });
    const editableProps = { onKeyDown() {}, onPasteCapture() {} };
  `);
});

test('recognizes aliased and namespace Plite extension factories', () => {
  const issues = auditPlateSchemaSource(`
    const directAlias = defineExtension;
    directAlias('a', { config: {} });
    import { defineExtension as importedAlias } from 'plitejs';
    importedAlias('b', { state: {} });
    const { defineExtension: destructuredAlias } = Plite;
    destructuredAlias('c', { tx: {} });
    Plite.defineExtension('d', {
      validateConfiguration() {},
    });
    directAlias<Definition>('typed', {});
    importedAlias('arity', {
      api: (editor, context) => ({ editor, context }),
      read: {},
    });
  `);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('deleted Plite extension definition field')
    ).length,
    4
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('infers one definition'))
      .length,
    1
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('must be declared as a factory')
    ).length,
    1
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('receives one context object')
    ).length,
    1
  );
});

test('resolves local objects, spreads, and returned objects before auditing author fields', () => {
  const issues = auditPlateSchemaSource(`
    const definition = { extension: {} };
    defineBasePlugin('base', definition);
    const stale = { handlers: {} };
    definePlatePlugin('plate', {...stale });
    const staleStage = { pluginApi: {} };
    Plugin.extend(() => ({ ...staleStage }));
    const on = { onPaste() {} };
    Plugin.configure({ on });
  `);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('deleted Plate plugin definition field')
    ).length,
    3
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('listeners are prefixless'))
      .length,
    1
  );
  expectAccepted(`
    const unknown = getRuntimeDefinition();
    defineBasePlugin('base', {...unknown });
  `);
});

test('rejects config only in final Plite callback contexts', () => {
  const issues = auditPlateSchemaSource(`
    defineExtension('contexts', {
      schema: ({ config }) => ({}),
      api: ({ config }) => ({}),
      activate(editor, { config }) {},
      validate({ config }) {},
    });
    const config = {};
    const runtime = ({ config }) => config;
  `);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes(
        'schema/API/activation/validation contexts have no config'
      )
    ).length,
    4
  );
});

test('allows only the exact marked Plite config negative contract', () => {
  const file = 'packages/plitejs/test/generic-extension-contract.ts';

  assert.deepEqual(
    auditPlateSchemaSource(
      `
        defineExtension('bad-validation-config', {
          // @ts-expect-error Plite extensions validate the candidate context, not Plate config
          validate: ({ config }) => {
            void config;
          },
        });
      `,
      file
    ),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `
        defineExtension('bad-validation-config', {
          validate: ({ config }) => {
            void config;
          },
        });
      `,
      file
    )[0]?.reason ?? '',
    /contexts have no config/
  );
});

test('rejects stale names only in capability factory contexts', () => {
  const issues = auditPlateSchemaSource(`
    defineBasePlugin('legacy', {
      read: ({ editorReads }) => ({ value: () => editorReads.value() }),
      update: ({ editorTransforms }) => ({ run: editorTransforms.run }),
    });
    const inspect = ({ editorReads, editorTransforms }) => ({
      editorReads,
      editorTransforms,
    });
  `);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('stale read factory context binding editorReads')
    ).length,
    1
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes(
        'stale update factory context binding editorTransforms'
      )
    ).length,
    1
  );
});

test('rejects only proven API root merges', () => {
  assert.match(
    auditPlateSchemaSource(`Object.assign(editor.api, extensionApi);`)[0]
      ?.reason ?? '',
    /project through editor\.api\.<name>/
  );
  assert.match(
    auditPlateSchemaSource(`editor.api.clipboard.insertData(data);`)[0]
      ?.reason ?? '',
    /editor\.api\.dom\.clipboard/
  );
  expectAccepted(`
    editor.api.block.insert();
    editor.api.dom.clipboard.insertData(data);
    editor.api.string();
    editor.api.undo();
    Object.assign(editor, attributes);
    service.getApi();
  `);
});

test('rejects the deleted parallel plugin generic machine', () => {
  const issues = auditPlateSchemaSource(
    `
      type A = AnyPluginConfig;
      type B = BasePluginExtensionContract;
      type C = EffectiveExtensionContractField;
      type D = EffectivePlateContractField;
      type E = InferConfig;
      type F = PluginConfig;
      type G = TPlatePluginConfig;
      type H = UnifiedRuntimeBasePluginConfig;
      type I = UnifiedRuntimePlatePluginConfig;
      plugin.__config;
      plugin.pluginApi;
    `,
    'packages/example/src/plugin-contract.ts'
  );

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('deleted Plate plugin contract symbol')
    ).length,
    11
  );
  expectAccepted(`
    type PluginConfig = { enabled: boolean };
    const pluginApi = createRuntimeApi();
    const PluginConfig = Symbol('domain-config');
    editor.api.pluginApi.run();
  `);
});

test('names DefinitionOf aliases after the extracted definition', () => {
  const issues = auditPlateSchemaSource(
    `
      type MediaConfig = DefinitionOf<typeof MediaPlugin>;
      type Media = DefinitionOf<typeof MediaPlugin>;
      type MediaPluginDefinition = DefinitionOf<typeof MediaPlugin>;
      type MediaDefinition = DefinitionOf<typeof MediaPlugin>;
      type RuntimeConfig = { enabled: boolean };
    `,
    'packages/example/src/plugin-contract.ts'
  );

  assert.equal(
    issues.filter((issue) => issue.reason.includes('use FooDefinition')).length,
    3
  );
  expectAccepted(`
    type MediaApi = Pick<DefinitionOf<typeof MediaPlugin>, 'api'>;
    type CorePluginDefinition = DefinitionOf<CorePlugins[number]>;
    type WrappedMedia = Readonly<DefinitionOf<typeof MediaPlugin>>;
  `);
});

test('rejects explicit descriptor annotations on exported package plugins', () => {
  const issues = auditPlateSchemaSource(
    `
      type ExamplePluginDefinition = Readonly<{
        name: 'example';
      }>;

      const examplePlugin = defineBasePlugin('example', { });

      export const ExamplePlugin: BasePlugin<ExamplePluginDefinition> =
        examplePlugin;
    `,
    'packages/example/src/ExamplePlugin.ts'
  );

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('infer their exact descriptor')
    ).length,
    1
  );
});

test('rejects static plugin API references in current docs and release prose', () => {
  for (const file of ['.changeset/docx.md', 'content/docs/plugins/docx.mdx']) {
    assert.match(
      auditNamedSchemaLineageDocument(
        'Use `DocxImportPlugin.api.import` for DOCX input.',
        file
      )[0]?.reason ?? '',
      /installed editor portal/
    );
  }
  assert.deepEqual(
    auditNamedSchemaLineageDocument(
      'Use `editor.plugin(DocxImportPlugin).api.import` for DOCX input.',
      '.changeset/docx.md'
    ),
    []
  );
});

test('rejects invented schema identities and accepts absence guards', () => {
  for (const source of [
    `const type = plugin.installed ? plugin.schema.type : 'paragraph';`,
    `const key = plugin.installed ? plugin.schema.key : 'bold';`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source)[0]?.reason ?? '',
      /uninstalled plugins have no schema identity/
    );
  }

  expectAccepted(`if (plugin.installed) plugin.api.run();`);
  expectAccepted(
    `const type = plugin.installed ? plugin.schema.type : undefined;`
  );
  expectAccepted(`const types = plugin.installed ? [plugin.schema.type] : [];`);

  assert.match(
    auditNamedSchemaLineageDocument(
      '```tsx\nconst type = plugin.installed ? plugin.schema.type : "paragraph";\n```'
    )[0]?.reason ?? '',
    /uninstalled plugins have no schema identity/
  );
});

test('rejects spread-wrapped literal arrays', () => {
  assert.match(
    auditPlateSchemaSource(
      `const targets = [...[PLUGINS.h1, PLUGINS.h2], PLUGINS.paragraph];`
    )[0]?.reason ?? '',
    /inline literal array items directly/
  );
  expectAccepted(`const targets = [...plugins, PLUGINS.paragraph];`);

  assert.match(
    auditNamedSchemaLineageDocument(
      '```tsx\nconst targets = [...[PLUGINS.h1, PLUGINS.h2]];\n```'
    )[0]?.reason ?? '',
    /inline literal array items directly/
  );
});

test('keeps Base component docs native and terminal conversion-free', () => {
  for (const file of [
    '.changeset/base-component.md',
    'content/docs/plugins/base-component.mdx',
  ]) {
    assert.deepEqual(
      auditNamedSchemaLineageDocument(
        '`BaseParagraphPlugin.configure({ component: ParagraphStatic })`',
        file
      ),
      []
    );
    assert.deepEqual(
      auditNamedSchemaLineageDocument(
        '`defineBasePlugin("p", { component: ParagraphStatic, })`',
        file
      ),
      []
    );
    assert.deepEqual(
      auditNamedSchemaLineageDocument(
        '`toPlatePlugin(BaseParagraphPlugin, { component: ParagraphElement })`',
        file
      ),
      []
    );
    assert.match(
      auditNamedSchemaLineageDocument(
        '`toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphElement })`',
        file
      )[0]?.reason ?? '',
      /terminal consumers configure the Base descriptor directly/
    );
    assert.match(
      auditNamedSchemaLineageDocument(
        '`BaseParagraphPlugin.extend({ component: ParagraphStatic })`',
        file
      )[0]?.reason ?? '',
      /\.extend\(\) cannot define component/
    );
    assert.match(
      auditNamedSchemaLineageDocument(
        '`basic-blocks-base-kit` adds `toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphStatic })`.',
        file
      )[0]?.reason ?? '',
      /terminal consumers configure the Base descriptor directly/
    );
  }

  assert.match(
    auditNamedSchemaLineageDocument(
      [
        '```tsx',
        "import { createStaticEditor } from 'platejs/static';",
        "import { toPlatePlugin } from 'platejs/react';",
        'createStaticEditor({',
        '  plugins: [toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphStatic })],',
        '});',
        '```',
      ].join('\n')
    )[0]?.reason ?? '',
    /terminal consumers configure the Base descriptor directly/
  );
});

test('keeps Plite dependency requirements behind one public extension generic', () => {
  assert.match(
    auditPlateSchemaSource(
      `type Bad = EditorExtension<ExampleDefinition, readonly [Dependency]>;`
    )[0]?.reason ?? '',
    /one public Definition generic/
  );
  assert.deepEqual(
    auditPlateSchemaSource(`type Good = EditorExtension<ExampleDefinition>;`),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `type Leaked = typeof editorExtensionDefinition;`,
      'packages/example/src/types.ts'
    )[0]?.reason ?? '',
    /private Plite definition witness leaked/
  );
});

test('keeps root dependency references shallow and internal carriers internal', () => {
  const genericIssue = auditPlateSchemaSource(
    `type Bad = EditorExtensionDependencyReference<Capability>;`
  )[0];

  assert.match(genericIssue?.reason ?? '', /shallow non-generic root identity/);
  assert.deepEqual(
    auditPlateSchemaSource(`type Good = EditorExtensionDependencyReference;`),
    []
  );

  const rootImportIssues = auditPlateSchemaSource(`
    import type {
      EditorExtensionDependencyReferenceFor,
      EditorExtensionTypeLambda,
      InternalEditorExtensionDependencyReference,
      InternalEditorExtensionTypeProviderOf,
    } from 'plitejs';
  `);

  assert.equal(
    rootImportIssues.filter((issue) =>
      issue.reason.includes('internal dependency typing')
    ).length,
    3
  );
  assert.deepEqual(
    auditPlateSchemaSource(`
      import type {
        EditorExtensionDependencyReferenceFor,
        EditorExtensionDependencyContractReference,
        EditorExtensionTypeProviderOf,
      } from 'plitejs';
    `),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `import type { EditorExtensionTypeProviderOf } from 'plitejs/internal';`
    )[0]?.reason ?? '',
    /not a public package entrypoint/
  );
  assert.match(
    auditPlateSchemaSource(
      `export type { InternalEditorExtensionTypeProviderOf } from './interfaces/editor';`,
      'packages/plitejs/src/index.ts'
    )[0]?.reason ?? '',
    /cannot be root-exported/
  );
});

test('keeps Core author-to-canonical carriers internal', () => {
  const issues = auditPlateSchemaSource(`
    import type {
      InternalDefinitionOf,
      InternalPluginDefinitionOf,
      PluginDefinitionCarrier,
      StaticEditorExtensionTypeLambda,
    } from 'platejs';
  `);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('internal Core author-to-canonical carrier')
    ).length,
    4
  );
  assert.deepEqual(
    auditPlateSchemaSource(`
      import type { PluginReference, DefinitionOf } from 'platejs';
    `),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `export type { PluginDefinitionCarrier } from './lib/plugin/pluginDefinitionCarrier.internal';`,
      'packages/platejs/src/index.ts'
    )[0]?.reason ?? '',
    /cannot be root-exported/
  );
  assert.deepEqual(
    auditPlateSchemaSource(
      `export type { InternalPluginDefinitionOf } from '../lib/plugin/pluginDefinitionLookup.internal';`,
      'packages/platejs/src/internal/index.ts'
    ),
    []
  );
});

test('keeps Core compiler aliases in internal modules', () => {
  const issues = auditPlateSchemaSource(`
    import type {
      LowerBasePlugin,
      NormalizeBasePluginInput,
      NormalizePlatePluginInput,
    } from 'platejs';
  `);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('internal Core compiler typing')
    ).length,
    3
  );

  for (const [source, file] of [
    [
      `export type LowerBasePlugin<C> = C;`,
      'packages/platejs/src/lib/plugin/BasePlugin.ts',
    ],
    [
      `export type NormalizePlatePluginInput<C> = C;`,
      'packages/platejs/src/react/plugin/PlatePlugin.ts',
    ],
    [
      `export type { NormalizeBasePluginInput } from './basePluginCompiler.internal';`,
      'packages/platejs/src/lib/plugin/index.ts',
    ],
    [
      `export * from './basePluginCompiler.internal';`,
      'packages/platejs/src/lib/plugin/index.ts',
    ],
  ]) {
    assert.notEqual(auditPlateSchemaSource(source, file).length, 0, file);
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `export type LowerBasePlugin<C> = C;`,
      'packages/platejs/src/lib/plugin/basePluginCompiler.internal.ts'
    ),
    []
  );
});

test('requires the exact react({ dom }) factory input', () => {
  const issues = auditPlateSchemaSource(`
    import * as PliteReact from 'plitejs/react';
    import { react as installReact } from 'plitejs/react';
    const alias = installReact;
    const namespaceAlias = PliteReact;
    installReact();
    alias({ dom: DOMExtension, readOnly: true });
    namespaceAlias.react({ dom: DOMExtension, clipboardFormatKey: 'x' });
    PliteReact.react(options);
    PliteReact.react({ ...unknownOptions, dom: DOMExtension });
  `);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('exactly one { dom } object')
    ).length,
    5
  );
  expectAccepted(`
    import * as PliteReact from 'plitejs/react';
    import { react as installReact } from 'plitejs/react';
    const shared = { dom: DOMExtension };
    const options = { dom: DOMExtension };
    installReact({ dom: DOMExtension });
    PliteReact.react(options);
    PliteReact.react({ ...shared });
  `);
});

test('allows only the exact marked React factory negative contracts', () => {
  const file = 'packages/plitejs/test/react/generic-react-editor-contract.tsx';

  assert.deepEqual(
    auditPlateSchemaSource(
      `
        import { react } from 'plitejs/react';
        // @ts-expect-error react requires an exact DOM descriptor
        const invalidZeroArgumentReact = react();
        // @ts-expect-error react does not accept flattened DOM options
        const invalidFlattenedReact = react({ clipboardFormatKey: 'x-test' });
      `,
      file
    ),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `
        import { react } from 'plitejs/react';
        const invalidZeroArgumentReact = react();
        const invalidFlattenedReact = react({ clipboardFormatKey: 'x-test' });
      `,
      file
    )[0]?.reason ?? '',
    /exactly one \{ dom \} object/
  );
});

test('requires API factories and keeps API out of consumer configuration', () => {
  const rejected = [
    "defineBasePlugin('base', { api: {}, });",
    "definePlatePlugin('react', { api: {}, });",
    "defineExtension('raw', { api: {}, });",
    'Plugin.extend({ api: {} });',
    'Plugin.configure({ api: () => ({}) });',
    "defineBasePlugin('groups', {read: {}, update: {} });",
    "defineExtension('middleware', { commands: {},readMiddleware: {} });",
    "defineBasePlugin('twoPlateContexts', { api: (editor, store) => ({ editor, store }), });",
    "defineExtension('twoPliteContexts', { api: (editor, context) => ({ editor, context }), });",
  ].join('\n');
  const accepted = [
    "defineBasePlugin('base', { api: () => ({}),read: () => ({}), update: () => ({}) });",
    "definePlatePlugin('react', { api() { return {}; }, });",
    "defineExtension('raw', { api: ({ editor, getContributions, root }) => ({ editor, getContributions, root }), commands: () => [],readMiddleware: () => [] });",
    'Plugin.extend({ api: () => ({}) });',
  ].join('\n');
  const issues = auditPlateSchemaSource(rejected);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('api must be declared as a factory')
    ).length,
    4
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('must be declared as a factory')
    ).length,
    8
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('receives one context object')
    ).length,
    2
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('cannot be configured'))
      .length,
    1
  );
  assert.deepEqual(auditPlateSchemaSource(accepted), []);
});

test('rejects unaudited direct constructor extend stages', () => {
  assert.match(
    auditPlateSchemaSource(
      `defineBasePlugin('example', { }).extend(() => ({ api: () => ({}) }))`,
      'packages/example/src/ExamplePlugin.ts'
    )[0]?.reason ?? '',
    /not an audited constructor-inaccessible shared factory, resolved consumer configuration, or earlier-stage type dependency/
  );

  assert.deepEqual(
    auditPlateSchemaSource(
      `Plugin.extend(() => ({ api: () => ({}), on: {} }))`,
      'packages/example/src/ExamplePlugin.ts'
    ),
    []
  );
});

test('keeps replacement command declarations in one owner factory', () => {
  const issues = auditPlateSchemaSource(
    `
      defineBasePlugin('example', {
        commands: () => [],

      }).extend({
        commands: () => [],
      });
    `,
    'packages/example/src/BaseExamplePlugin.ts'
  );

  assert.match(
    issues.find((issue) => issue.reason.includes('replacement plugin commands'))
      ?.reason ?? '',
    /one ordered owner factory/
  );
});

test('rejects unaudited extend stages through local descriptor bindings', () => {
  for (const source of [
    `
      export const BaseExamplePlugin = defineBasePlugin('example', { });
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      export const BaseExamplePlugin = defineBasePlugin('example', { });
      export const ExamplePlugin = BaseExamplePlugin['extend'](() => ({
        api: () => ({}),
      }));
    `,
    `
      export const BaseExamplePlugin = defineBasePlugin('example', { });
      const ExamplePluginAlias = BaseExamplePlugin;
      export const ExamplePlugin = ExamplePluginAlias.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      let BaseExamplePlugin;
      BaseExamplePlugin = defineBasePlugin('example', { });
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      import { defineBasePlugin as createPlugin } from 'platejs';
      export const BaseExamplePlugin = createPlugin('example', {});
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const createPlugin = defineBasePlugin;
      export const ExamplePlugin = createPlugin('example', {}).extend(
        () => ({ api: () => ({}) })
      );
    `,
    `
      let createPlugin;
      createPlugin = defineBasePlugin;
      export const ExamplePlugin = createPlugin('example', {}).extend(
        () => ({ api: () => ({}) })
      );
    `,
    `
      import * as Core from 'platejs';
      export const ExamplePlugin = Core.defineBasePlugin('example', {
      }).extend(() => ({ api: () => ({}) }));
    `,
    `
      const { defineBasePlugin: createPlugin } = Core;
      export const ExamplePlugin = createPlugin('example', {}).extend(
        () => ({ api: () => ({}) })
      );
    `,
  ]) {
    assert.match(
      auditPlateSchemaSource(source, 'packages/example/src/ExamplePlugin.ts')[0]
        ?.reason ?? '',
      /not an audited constructor-inaccessible shared factory, resolved consumer configuration, or earlier-stage type dependency/
    );
  }

  assert.match(
    auditPlateSchemaSource(
      `
        const method = 'extend';
        export const BaseExamplePlugin = defineBasePlugin('example', { });
        export const ExamplePlugin = BaseExamplePlugin[method](() => ({
          api: () => ({}),
        }));
      `,
      'packages/example/src/ExamplePlugin.ts'
    )[0]?.reason ?? '',
    /cannot bypass the exact stage audit/
  );

  for (const optionalCall of [
    `BaseExamplePlugin?.extend(() => ({ api: () => ({}) }))`,
    `BaseExamplePlugin.extend?.(() => ({ api: () => ({}) }))`,
    `BaseExamplePlugin?.['extend'](() => ({ api: () => ({}) }))`,
  ]) {
    assert.match(
      auditPlateSchemaSource(
        `
          export const BaseExamplePlugin = defineBasePlugin('example', { });
          export const ExamplePlugin = ${optionalCall};
        `,
        'packages/example/src/ExamplePlugin.ts'
      )[0]?.reason ?? '',
      /optional plugin-authoring calls.*cannot bypass the exact stage audit/
    );
  }

  for (const extraction of [
    `
      const extractedExtend = BaseExamplePlugin.extend;
      export const ExamplePlugin = extractedExtend(() => ({ api: () => ({}) }));
    `,
    `
      const { extend } = BaseExamplePlugin;
      export const ExamplePlugin = extend(() => ({ api: () => ({}) }));
    `,
    `
      const method = 'extend';
      const { [method]: extractedExtend } = BaseExamplePlugin;
      export const ExamplePlugin = extractedExtend(() => ({ api: () => ({}) }));
    `,
    `
      const { name, ...pluginMethods } = BaseExamplePlugin;
      export const ExamplePlugin = pluginMethods.extend(() => ({ api: () => ({}) }));
    `,
    `
      let extractedExtend;
      extractedExtend = BaseExamplePlugin['extend'];
      export const ExamplePlugin = extractedExtend(() => ({ api: () => ({}) }));
    `,
  ]) {
    assert.match(
      auditPlateSchemaSource(
        `
          export const BaseExamplePlugin = defineBasePlugin('example', { });
          ${extraction}
        `,
        'packages/example/src/ExamplePlugin.ts'
      )[0]?.reason ?? '',
      /plugin authoring methods cannot be extracted/
    );
  }

  for (const method of [
    'clone',
    'configure',
    'configurePlugin',
    'extendApi',
    'extendPlugin',
  ]) {
    assert.match(
      auditPlateSchemaSource(
        `
          export const BaseExamplePlugin = defineBasePlugin('example', { });
          const extractedMethod = BaseExamplePlugin.${method};
          export const ExamplePlugin = extractedMethod();
        `,
        'packages/example/src/ExamplePlugin.ts'
      )[0]?.reason ?? '',
      /plugin authoring methods cannot be extracted/
    );
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `
        export const BaseTagPluginOwner = defineBasePlugin('tag', { });
        export const BaseTagPlugin = BaseTagPluginOwner
          .extend({
            read: () => ({}),
            update: () => ({}),
          })
          .extend(() => ({
            read: () => ({}),
          }));
      `,
      'packages/platejs/src/features/tag/lib/BaseTagPlugin.ts'
    ),
    []
  );

  for (const source of [
    `
      const owners = {
        BaseExamplePlugin: defineBasePlugin('example', { }),
      };
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = defineBasePlugin('example', { });
      const owners = { BaseExamplePlugin };
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = defineBasePlugin('example', { });
      const owners = {};
      owners.BaseExamplePlugin = BaseExamplePlugin;
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = defineBasePlugin('example', { });
      const owners = { BaseExamplePlugin };
      const alias = owners;
      export const ExamplePlugin = alias.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = defineBasePlugin('example', { });
      const owners = { BaseExamplePlugin };
      const { BaseExamplePlugin: alias } = owners;
      export const ExamplePlugin = alias.extend(() => ({ api: () => ({}) }));
    `,
    `
      const owners = [defineBasePlugin('example', { })];
      const alias = owners;
      export const ExamplePlugin = alias[0].extend(() => ({ api: () => ({}) }));
    `,
    `
      const owners = [defineBasePlugin('example', { })];
      const [BaseExamplePlugin] = owners;
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const owners = [OtherPlugin, defineBasePlugin('example', { })];
      const [, ...rest] = owners;
      export const ExamplePlugin = rest[0].extend(() => ({ api: () => ({}) }));
    `,
    `
      const owners = {
        nested: { BaseExamplePlugin: defineBasePlugin('example', { }) },
      };
      const { ['nested']: { BaseExamplePlugin = OtherPlugin } } = owners;
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = defineBasePlugin('example', { });
      const owners = { BaseExamplePlugin };
      const aliases = { ...owners };
      export const ExamplePlugin = aliases.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const owners = flag
        ? { BaseExamplePlugin: defineBasePlugin('example', { }) }
        : {};
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const key = 'BaseExamplePlugin';
      const owners = {};
      owners[key] = defineBasePlugin('example', { });
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
  ]) {
    assert.match(
      auditPlateSchemaSource(
        source,
        'packages/example/src/ExamplePlugin.ts'
      ).find((issue) =>
        issue.reason.includes('direct constructor .extend() chain')
      )?.reason ?? '',
      /not an audited constructor-inaccessible/
    );
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `
        const InternalRootPlugin = defineBasePlugin('root', { });
        snapshotSources({ internalRoot: InternalRootPlugin });
      `,
      'packages/platejs/src/lib/editor/withPlite.ts'
    ),
    []
  );

  assert.equal(
    auditPlateSchemaSource(
      `
        const BaseExamplePlugin = defineBasePlugin('example', { });
        const owners = { BaseExamplePlugin };
        const name = 'BaseExamplePlugin';
        const aliases = { ...owners, [name]: ExternalPlugin };
        export const ExamplePlugin = aliases.BaseExamplePlugin.extend(() => ({
          api: () => ({}),
        }));
      `,
      'packages/example/src/ExamplePlugin.ts'
    ).some((issue) =>
      issue.reason.includes('direct constructor .extend() chain')
    ),
    false
  );
  const newDeclarationStageIssues = auditPlateSchemaSource(
    `
      /** @plate-plugin-declaration-stage TS7056 */
      const ExamplePluginBase = defineBasePlugin('example', { });
      export const ExamplePlugin = ExamplePluginBase.extend(() => ({
        api: () => ({}),
      }));
    `,
    'packages/example/src/ExamplePlugin.ts'
  );

  assert.match(
    newDeclarationStageIssues.find((issue) =>
      issue.reason.includes('new plugin declaration stages')
    )?.reason ?? '',
    /repair the owning generic or declaration boundary/
  );

  assert.match(
    auditPlateSchemaSource(
      `
        /** @plate-plugin-declaration-stage TS7056 */
        const baseCodeBlockPluginWithUpdate = defineBasePlugin('codeBlock', { });
        export const ExamplePlugin = baseCodeBlockPluginWithUpdate.extend(() => ({
          api: () => ({}),
        }));
      `,
      'packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts'
    ).find((issue) => issue.reason.includes('new plugin declaration stages'))
      ?.reason ?? '',
    /repair the owning generic or declaration boundary/
  );

  assert.match(
    auditPlateSchemaSource(
      `
        export const BaseExamplePlugin = defineBasePlugin('example', {
          read: ({ editor }) => ({
            entry: <N extends ElementOf<typeof editor> = Element>() => undefined as N | undefined,
          }),
        });
      `,
      'packages/example/src/BaseExamplePlugin.ts'
    ).find((issue) => issue.reason.includes('entire installed editor'))
      ?.reason ?? '',
    /owning descriptor or the honest broad Element\/Text domain/
  );
});

test('rejects one-use private plugin descriptor scaffolding', () => {
  const source = `
    const ExamplePluginDefinition = defineBasePlugin('example', { });
    export const ExamplePlugin = ExamplePluginDefinition.extend(() => ({
      api: () => ({}),
    }));
  `;

  assert.match(
    auditPlateSchemaSource(source, 'packages/example/src/ExamplePlugin.ts')[0]
      ?.reason ?? '',
    /export the complete builder chain directly/
  );
  assert.equal(
    auditPlateSchemaSource(
      `
        export const ExamplePluginBase = defineBasePlugin('example', { });
        export const ExamplePlugin = ExamplePluginBase.extend(() => ({
          api: () => ({}),
        }));
      `,
      'packages/example/src/ExamplePlugin.ts'
    ).some((issue) =>
      issue.reason.includes('one-use private plugin descriptor scaffolding')
    ),
    false
  );
});

test('excludes non-production plugin chains from the constructor-stage rule', () => {
  const source = `defineBasePlugin('example', { }).extend(() => ({ api: () => ({}) }))`;

  for (const file of [
    'packages/example/src/ExamplePlugin.spec.ts',
    'packages/example/type-tests/ExamplePlugin.ts',
    'packages/example/historical/ExamplePlugin.ts',
    'packages/example/generated/ExamplePlugin.ts',
    'templates/example/ExamplePlugin.ts',
  ]) {
    assert.equal(
      auditPlateSchemaSource(source, file).some((issue) =>
        issue.reason.includes('direct constructor .extend() chain')
      ),
      false,
      file
    );
  }
});

test('rejects plugin capability names used as persisted schema identities', () => {
  for (const source of [
    `const value = { type: ParagraphPlugin.name }`,
    `const property = { key: BoldPlugin.name }`,
    `const value = { type: PLUGINS.paragraph }`,
    `const property = { key: name }`,
    `target.types([ParagraphPlugin.name])`,
    `schema.handle.element(ParagraphPlugin, ParagraphPlugin.name)`,
    `const paragraphType = ParagraphPlugin.name`,
    `setBlockType(editor, ParagraphPlugin.name)`,
    `node.type === ParagraphPlugin.name`,
    `const value = { type: ParagraphPlugin.type }`,
    `const property = { key: BoldPlugin.key }`,
    `target.types([ParagraphPlugin.type])`,
    `schema.handle.element(ParagraphPlugin, ParagraphPlugin.type)`,
    `const paragraphType = ParagraphPlugin.type`,
    `setBlockType(editor, ParagraphPlugin.type)`,
    `node.type === ParagraphPlugin.type`,
    `const key = editor.plugin(BoldPlugin).schema.properties[BoldPlugin.name].key`,
    `const key = portal.schema.properties[portal.name]?.key`,
  ]) {
    expectRejected(source);
  }

  expectAccepted(
    `const type = editor.plugin(ParagraphPlugin).schema.type; const key = editor.plugin(BoldPlugin).schema.key`
  );
});

test('rejects compiler schema maps on consumer plugin portals', () => {
  for (const source of [
    `const type = editor.plugin(ParagraphPlugin).schema.element.type`,
    `const key = editor.plugin(BoldPlugin).schema.properties.bold.key`,
    `const key = portal.schema.properties.bold.key`,
    `const bold = editor.plugin(BoldPlugin); const key = bold.schema.properties.bold.key`,
    `const bold = editor.plugin(BoldPlugin); const alias = bold; const key = alias.schema.properties.bold.key`,
    `const { schema } = editor.plugin(BoldPlugin); const key = schema.properties.bold.key`,
    `const bold = editor.plugin(BoldPlugin); const { schema: boldSchema } = bold; const key = boldSchema.properties.bold.key`,
    `const bold = editor.plugin(BoldPlugin); const schema = bold.schema; const alias = schema; const key = alias.properties.bold.key`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source)[0]?.reason ?? '',
      /consumer plugin portals expose only flat/
    );
  }

  expectAccepted(
    `defineBasePlugin('indent', {}).extend(({ schema }) => ({ api: () => ({ key: schema.properties.indent.key }) }))`
  );
  expectAccepted(
    `function read(plugin) { const { schema } = plugin; return schema.type } defineBasePlugin('indent', {}).extend(({ schema }) => ({ api: () => ({ key: schema.properties.indent.key }) }))`
  );
  expectAccepted(
    `const portal = editor.plugin(BoldPlugin); function read() { const portal = makeAuthorSchema(); return portal.schema.properties.bold.key }`
  );
});

test('rejects capability identities as missing-plugin schema fallbacks', () => {
  for (const source of [
    `const type = plugin.installed ? plugin.schema.type : PLUGINS.paragraph`,
    `const key = plugin.installed ? plugin.schema.key : plugin.name`,
    `const type = plugin.installed ? plugin.name : plugin.schema.type`,
    `const type = plugin.schema.type ?? 'paragraph'`,
    `const type = plugin.schema.type || PLUGINS.paragraph`,
    `const type = (plugin.installed && plugin.schema.type) || plugin.name`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source)[0]?.reason ?? '',
      /uninstalled plugins have no schema identity/
    );
  }

  expectAccepted(
    `const type = plugin.installed ? plugin.schema.type : undefined`
  );
  expectAccepted(
    `const same = node.type === editor.plugin(PLUGINS.paragraph).schema.type || node.type === editor.plugin(PLUGINS.table).schema.type`
  );
  expectAccepted(
    `const type = selectedType ?? editor.plugin(PLUGINS.paragraph).schema.type`
  );
});

test('rejects raw registry runtime and configuration identities', () => {
  const file = 'apps/www/src/registry/ui/example.tsx';

  for (const source of [
    `editor.read.nodes.some({ match: { type: 'table' } })`,
    `editor.read.nodes.some({ match: { type: ['tableCell', 'tableRow'] } })`,
    `const selected = node.type === 'table'`,
    `const selected = props.plugin.type !== 'tableRow'`,
    `const selected = props.plugin.type !== editor.plugin(TableRowPlugin).type`,
    `MarkdownPlugin.configure({ initialState: { plainMarks: ['suggestion'] } })`,
    `DocxPastePlugin.configure({ override: { components: { table: Table } } })`,
    `Plugin.configure({ override: { plugins: { indent: {} } } })`,
  ]) {
    assert.notDeepEqual(auditPlateSchemaSource(source, file), [], source);
  }

  for (const source of [
    `editor.read.nodes.some({ match: { type: editor.plugin(TablePlugin).schema.type } })`,
    `const selected = node.type === editor.plugin(TablePlugin).schema.type`,
    `const selected = props.element.type !== editor.plugin(TableRowPlugin).schema.type`,
    `MarkdownPlugin.configure(({ editor }) => ({ initialState: { plainMarks: [editor.plugin(SuggestionPlugin).schema.key] } }))`,
    `DocxPastePlugin.configure({ override: { components: { [PLUGINS.table]: Table } } })`,
    `Plugin.configure({ override: { plugins: { [IndentPlugin.name]: {} } } })`,
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), [], source);
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `export const value = [{ children: [{ text: '' }], type: 'table' }]`,
      'apps/www/src/registry/examples/values/table-value.ts'
    ),
    []
  );
});

test('rejects host editor types in standalone copied registry items', () => {
  const source = `
    import type { MyEditor } from '@/registry/components/editor/editor-kit';
    const editor = useEditor<MyEditor>();
  `;

  for (const file of [
    'apps/www/src/registry/ui/example.tsx',
    'apps/www/src/registry/components/editor/use-chat.ts',
    'apps/www/src/registry/components/editor/use-chat.tsx',
  ]) {
    assert.match(
      auditPlateSchemaSource(source, file)[0]?.reason ?? '',
      /owned plugin tuple/
    );
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `const editor = useEditor<Editor<Value, readonly [typeof TablePlugin]>>();`,
      'apps/www/src/registry/ui/example.tsx'
    ),
    []
  );
  assert.deepEqual(
    auditPlateSchemaSource(
      source,
      'apps/www/src/registry/examples/example.tsx'
    ),
    []
  );
});

test('keeps locally created descriptor identity lexical', () => {
  assert.deepEqual(
    auditPlateSchemaSource(
      `const BaseExamplePlugin = defineBasePlugin('example', { }); export function adapt(BaseExamplePlugin) { return BaseExamplePlugin.extend(() => ({ api: () => ({}) })); }`,
      'packages/example/src/lib/BaseExamplePlugin.ts'
    ),
    []
  );
});

test('allows only exact audited production extend stages at their owner path', () => {
  const exact = `
    defineBasePlugin('code', { })
      .extend({ update: () => ({}) })
      .extend({
        commands: () => [],
        contributions: [],
      });
    defineBasePlugin('highlight', { }).extend({
        corrections: [],
        on: {},
      });
  `;
  const owner =
    'packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts';

  assert.deepEqual(auditPlateSchemaSource(exact, owner), []);
  assert.match(
    auditPlateSchemaSource(
      `
        defineBasePlugin('code', { })
          .extend({ update: () => ({}) })
          .extend({ commands: () => [], contributions: [] });
        defineBasePlugin('highlight', { })
          .extend(() => ({ api: () => ({}) }));
      `,
      owner
    )[0]?.reason ?? '',
    /found \[api\]/
  );

  for (const [source, file, expected] of [
    [
      `defineBasePlugin('code', { }).extend({
        rules: {},
        update: () => ({}),
      }).extend({ commands: () => [], contributions: [] }).extend(() => ({ render: {} }))`,
      owner,
      /\[rules, update\]/,
    ],
    [exact, 'packages/example/src/BaseCodeBlockPlugin.ts', /\[update\]/],
  ]) {
    const issue = auditPlateSchemaSource(source, file).find((item) =>
      item.reason.includes('direct constructor .extend() chain')
    );

    assert.ok(issue, file);
    assert.match(issue.reason, expected);
  }

  assert.match(
    auditPlateSchemaSource(`defineBasePlugin('code', { })`, owner).at(-1)
      ?.reason ?? '',
    /expects exact 2 audited chains but found 0/
  );

  assert.match(
    auditPlateSchemaSource(
      `
        defineBasePlugin('code', { }).extend({ commands: () => [], contributions: [] });
        defineBasePlugin('duplicate', { }).extend({ commands: () => [], contributions: [] });
      `,
      owner
    ).at(-1)?.reason ?? '',
    /found 2; signatures did not match/
  );

  for (const file of [
    'packages/platejs/src/lib/plugins/affinity/AffinityPlugin.ts',
  ]) {
    assert.deepEqual(
      auditPlateSchemaSource(
        `defineBasePlugin('owner', {update: () => ({}) }).extend(() => ({
          commands: () => [],
        }))`,
        file
      ),
      []
    );
  }

  for (const [source, file] of [
    [
      `defineBasePlugin('history', { }).extend(history())`,
      'packages/platejs/src/lib/plugins/HistoryPlugin.ts',
    ],
    [
      `defineBasePlugin('dom', { }).extend(plateDOMExtension)`,
      'packages/platejs/src/lib/plugins/dom/DOMPlugin.ts',
    ],
    [
      `defineBasePlugin('inputRules', { }).extend(() => ({
        commands: () => [],
        contributions: [],
      }))`,
      'packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts',
    ],
    [
      `defineBasePlugin('override', { }).extend(() => ({
        commands: () => [],
        corrections: [],
        readMiddleware: () => ({}),
      }))`,
      'packages/platejs/src/lib/plugins/override/OverridePlugin.ts',
    ],
    [
      `defineBasePlugin('react', { }).extend(plateReactExtension)`,
      'packages/platejs/src/react/editor/getPlateCorePlugins.ts',
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), []);
  }

  assert.match(
    auditPlateSchemaSource(
      `defineBasePlugin('indent', { }).extend({ shortcuts: {} })`,
      'packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts'
    )[0]?.reason ?? '',
    /found \[shortcuts\]/
  );

  const listOwner = 'packages/platejs/src/features/list/lib/BaseListPlugin.ts';
  const listStages = `defineBasePlugin('list', { })
    .extend(({ defineCodecs }) => ({ codecs: defineCodecs({}) }))
    .extend(() => ({ api: () => ({}), read: () => ({}) }))
    .extend(() => ({ override: {}, update: () => ({}) }))
    .extend(() => ({ commands: () => [] }))
    .extend(() => ({ corrections: [] }))`;

  assert.deepEqual(auditPlateSchemaSource(listStages, listOwner), []);
  assert.match(
    auditPlateSchemaSource(
      `defineBasePlugin('list', { })
        .extend(() => ({ override: {} }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ commands: () => [] }))
        .extend(() => ({ corrections: [] }))`,
      listOwner
    )[0]?.reason ?? '',
    /\[override\] -> \[update\] -> \[commands\] -> \[corrections\]/
  );

  for (const [file, source] of [
    [
      'packages/platejs/src/csv/lib/CsvPlugin.ts',
      `defineBasePlugin('csv', { })
        .extend(() => ({ api: () => ({}) }))
        .extend(({ defineCodecs }) => ({
          codecs: defineCodecs({ 'text/plain': rule }),
        }))`,
    ],
    [
      'packages/platejs/src/features/link/lib/BaseLinkPlugin.ts',
      `defineBasePlugin('link', { })
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ commands: () => [] }))`,
    ],
    [
      'packages/platejs/src/markdown/lib/MarkdownPlugin.ts',
      `defineBasePlugin('markdown', { })
        .extend(() => ({ api: () => ({}) }))`,
    ],
    [
      'packages/platejs/src/features/suggestion/lib/BaseSuggestionPlugin.ts',
      `defineBasePlugin('suggestion', { })
        .extend(() => ({ api: () => ({}), rules: {} }))
        .extend(() => ({ read: () => ({}) }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ commands: () => [], corrections: [] }));
       editor.read.schema.property({});
       editor.read.schema.property({});`,
    ],
    [
      'packages/platejs/src/ai/react/AIChatPlugin.ts',
      `definePlatePlugin('aiChat', { })
        .extend(() => ({ api: () => ({}), read: () => ({}), selectors: {}, update: () => ({}) }))
        .extend(() => ({ commands: () => [], corrections: [], effectTypes: [], on: {} }))`,
    ],
    [
      'packages/platejs/src/features/table/lib/BaseTablePlugin.ts',
      `defineBasePlugin('table', { })
        .extend(() => ({ api: () => ({}) }))
        .extend(() => ({ api: () => ({}) }))
        .extend(() => ({ api: () => ({}), read: () => ({}) }))
        .extend(() => ({ read: () => ({}) }))
        .extend(() => ({ api: () => ({}), read: () => ({}) }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ contributions: [] }))
        .extend(() => ({ corrections: [] }))
        .extend(() => ({ readMiddleware: () => [] }))
        .extend(() => ({ commands: () => [] }))`,
    ],
    [
      'packages/platejs/src/tabbable/react/TabbablePlugin.tsx',
      `definePlatePlugin('tabbable', { })
        .extend(() => ({ read: () => ({}) }))`,
    ],
    [
      'packages/platejs/src/features/toc/lib/BaseTocPlugin.ts',
      `defineBasePlugin('toc', { })
        .extend(() => ({ read: () => ({}) }))`,
    ],
    [
      'packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts',
      `defineBasePlugin('details', { })
        .extend(() => ({
          api: () => ({}),
          corrections: [],
          on: {},
          selectors: {},
          update: () => ({}),
        }))`,
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), [], file);
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `
        export const BlockPlaceholderPlugin = definePlatePlugin(
          'blockPlaceholder',
          {}
        )
          .extend({ selectors: {} })
          .extend({ inject: {}, useHooks });
      `,
      'packages/platejs/src/react/utils/BlockPlaceholderPlugin.tsx'
    ),
    []
  );

  assert.match(
    auditPlateSchemaSource(
      `defineBasePlugin('markdown', { })
        .extend(() => ({ read: () => ({}) }))`,
      'packages/platejs/src/markdown/lib/MarkdownPlugin.ts'
    )[0]?.reason ?? '',
    /found \[read\]/
  );

  assert.deepEqual(
    auditPlateSchemaSource(
      `definePlatePlugin('cursorOverlay', { })
        .extend(() => ({ on: {} }))`,
      'packages/platejs/src/react/features/cursor/CursorOverlayPlugin.tsx'
    ),
    []
  );
});

test('matches opaque shared-factory stages by exact callee identity', () => {
  const owner = 'apps/www/src/registry/examples/version-history-demo.tsx';

  assert.deepEqual(
    auditPlateSchemaSource(
      `definePlatePlugin('diff', { })
        .extend(excludeDiffFragment())
        .extend({ render: {} })`,
      owner
    ),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `definePlatePlugin('diff', { }).extend(createUnrelatedExtension())`,
      owner
    )[0]?.reason ?? '',
    /\$factory:createUnrelatedExtension/
  );
});

test('requires context-bound codec declarations', () => {
  for (const source of [
    `Plugin.extend(() => ({ codecs: { 'text/html': rule } }))`,
    `const codecsKey = 'codecs'; Plugin.extend(() => ({ [codecsKey]: { 'text/html': rule } }))`,
    `Plugin.extend?.(() => ({ codecs: { 'text/html': rule } }))`,
    `Plugin?.extend(() => ({ codecs: { 'text/html': rule } }))`,
    `Plugin.extend({ codecs: productCodecs })`,
    `const codecsKey = 'codecs'; defineBasePlugin('p', { [codecsKey]: { 'text/html': rule }, })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source)[0]?.reason ?? '',
      /context-bound defineCodecs/
    );
  }

  for (const source of [
    `defineBasePlugin('p', {codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': rule }) })`,
    `definePlatePlugin('p', {codecs: ({ defineCodecs }) => defineCodecs(TargetPlugin, { 'text/html': rule }) })`,
    `Plugin.extend(({ defineCodecs }) => ({ codecs: defineCodecs({ 'text/html': rule }) }))`,
    `Plugin.extend(({ defineCodecs }) => ({ codecs: defineCodecs(TargetPlugin, { 'text/html': rule }) }))`,
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source), []);
  }
});

test('binds custom Markdown element identity to the resolved schema type', () => {
  const definition = (rule) => `defineBasePlugin('customCapability', {
    schema: { element: schema.element.textBlock() },
    codecs: ({ defineCodecs, schema: { type } }) => defineCodecs({
      'text/markdown': ${rule},
    }),
  })`;

  assert.deepEqual(
    auditPlateSchemaSource(
      definition(`{
        from: type,
        kind: 'node',
        decode: () => ({ children: [{ text: '' }], type }),
        encode: () => ({
          attributes: [],
          children: [],
          name: type,
          type: 'mdxJsxFlowElement',
        }),
      }`)
    ),
    []
  );

  assert.match(
    auditPlateSchemaSource(`defineBasePlugin('imageCapability', {
      schema: { element: schema.element.void() },
      codecs: ({ defineCodecs }) => defineCodecs({
        'text/markdown': {
          from: 'image',
          kind: 'node',
          decode: () => ({ children: [{ text: '' }], type: 'image' }),
        },
      }),
    })`)[0]?.reason ?? '',
    /decode to the resolved schema type/
  );
  assert.deepEqual(
    auditPlateSchemaSource(`defineBasePlugin('imageCapability', {
      schema: { element: schema.element.void() },
      codecs: ({ defineCodecs, schema: { type } }) => defineCodecs({
        'text/markdown': {
          from: 'image',
          kind: 'node',
          decode: () => ({ children: [{ text: '' }], type }),
        },
      }),
    })`),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      definition(`{
        from: type,
        kind: 'node',
        decode: ({ node, parseAttributes }) => ({
          children: [{ text: '' }],
          type,
          ...parseAttributes(node.attributes),
        }),
        encode: () => ({ attributes: [], children: [], name: type, type: 'mdxJsxFlowElement' }),
      }`)
    ).find((issue) => /attributes cannot override/.test(issue.reason))
      ?.reason ?? '',
    /attributes cannot override/
  );

  for (const [rule, reason] of [
    [
      `{
        from: 'legacy_custom',
        kind: 'node',
        decode: () => ({ children: [{ text: '' }], type }),
        encode: () => ({ attributes: [], children: [], name: type, type: 'mdxJsxFlowElement' }),
      }`,
      /resolved schema type for from/,
    ],
    [
      `{
        from: type,
        kind: 'node',
        decode: () => ({ children: [{ text: '' }], type: 'customElement' }),
        encode: () => ({ attributes: [], children: [], name: type, type: 'mdxJsxFlowElement' }),
      }`,
      /decode to the resolved schema type/,
    ],
    [
      `{
        from: type,
        kind: 'node',
        decode: () => ({ children: [{ text: '' }], type }),
        encode: () => ({ attributes: [], children: [], name: 'customElement', type: 'mdxJsxFlowElement' }),
      }`,
      /encode the resolved schema type as the MDX name/,
    ],
  ]) {
    assert.match(
      auditPlateSchemaSource(definition(rule))[0]?.reason ?? '',
      reason
    );
  }

  assert.match(
    auditPlateSchemaSource(`defineBasePlugin('customCapability', {
      schema: { element: schema.element.textBlock() },
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/markdown': {
          from: 'customElement',
          kind: 'node',
          decode: () => ({ children: [{ text: '' }], type: 'customElement' }),
          encode: () => ({ attributes: [], children: [], name: 'customElement', type: 'mdxJsxFlowElement' }),
        },
      }),
    }))`).find((issue) => /resolved schema type for from/.test(issue.reason))
      ?.reason ?? '',
    /resolved schema type for from/
  );
  assert.match(
    auditPlateSchemaSource(`defineBasePlugin('customCapability', {
      schema: { element: schema.element.textBlock() },
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/markdown': {
          from: 'legacy_custom',
          kind: 'node',
          decode: () => ({ children: [{ text: '' }], type: 'customElement' }),
        },
      }),
    }))`).find((issue) => /resolved schema type for from/.test(issue.reason))
      ?.reason ?? '',
    /resolved schema type for from/
  );

  assert.deepEqual(
    auditPlateSchemaSource(`defineBasePlugin('customCapability', {
      schema: { element: schema.element.textBlock() },
    }).extend(({ defineCodecs, schema: { type } }) => ({
      codecs: defineCodecs({
        'text/markdown': {
          from: type,
          kind: 'node',
          decode: () => ({ children: [{ text: '' }], type }),
          encode: () => ({ attributes: [], children: [], name: type, type: 'mdxJsxFlowElement' }),
        },
      }),
    }))`).filter((issue) => /custom Markdown element codec/.test(issue.reason)),
    []
  );

  assert.match(
    auditPlateSchemaSource(`defineBasePlugin('product', {
      codecs: ({ defineCodecs }) => defineCodecs(TargetPlugin, {
        'text/markdown': {
          from: 'customElement',
          kind: 'node',
          decode: () => ({ children: [{ text: '' }], type: 'customElement' }),
          encode: () => ({ attributes: [], children: [], name: 'customElement', type: 'mdxJsxFlowElement' }),
        },
      }),
    })`)[0]?.reason ?? '',
    /must be owned by their target plugin/
  );
  assert.deepEqual(
    auditPlateSchemaSource(`defineBasePlugin('product', {
      codecs: ({ defineCodecs }) => defineCodecs(TargetPlugin, {
        'text/markdown': {
          from: 'img',
          kind: 'node',
          decode: ({ schema }) => ({ children: [{ text: '' }], type: schema.type }),
          encode: () => ({ attributes: [], children: [], name: 'img', type: 'mdxJsxFlowElement' }),
        },
      }),
    })`),
    []
  );

  assert.deepEqual(
    auditPlateSchemaSource(
      definition(`{
        from: 'img',
        kind: 'node',
        decode: () => ({ children: [{ text: '' }], type }),
        encode: () => ({ attributes: [], children: [], name: 'img', type: 'mdxJsxFlowElement' }),
      }`)
    ),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      definition(`{
        from: 'img',
        kind: 'node',
        decode: () => ({ children: [{ text: '' }] }),
      }`)
    )[0]?.reason ?? '',
    /decode to the resolved schema type/
  );
  assert.deepEqual(
    auditPlateSchemaSource(`defineBasePlugin('comment', {
      schema: { mark: { property: property.boolean() } },
      codecs: ({ defineCodecs, schema: { key } }) => defineCodecs({
        'text/markdown': {
          from: 'comment',
          kind: 'node',
          mark: true,
          decode: ({ decode, node }) => decode(node.children, { [key]: true }),
          encode: ({ node }) => ({ attributes: [], children: [], name: 'comment', type: 'mdxJsxTextElement' }),
        },
      }),
    })`),
    []
  );
});

test('keeps independent production codecs in the constructor', () => {
  for (const file of [
    'packages/example/src/lib/BaseExamplePlugin.ts',
    'packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts',
  ]) {
    assert.match(
      auditPlateSchemaSource(
        `defineBasePlugin('example', { }).extend(({ defineCodecs }) => ({ codecs: defineCodecs({ 'text/html': rule }) }))`,
        file
      )[0]?.reason ?? '',
      /constructor callback/
    );
  }
  assert.deepEqual(
    auditPlateSchemaSource(
      `defineBasePlugin('example', {codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': rule }) })`,
      'packages/example/src/lib/BaseExamplePlugin.ts'
    ),
    []
  );
});

test('keeps independent production fields in the constructor', () => {
  const file = 'packages/example/src/lib/BaseExamplePlugin.ts';
  const issues = auditPlateSchemaSource(
    `defineBasePlugin('example', { }).extend(({ type }) => ({
      render: { as: 'p' },
      update: ({ tx }) => ({ set: () => tx.nodes.set({ type }) }),
    }))`,
    file
  );

  assert.equal(issues.length, 1);
  assert.match(
    issues[0]?.reason ?? '',
    /not an audited constructor-inaccessible shared factory, resolved consumer configuration, or earlier-stage type dependency/
  );
});

test('allows only exact marked raw-codec negative contracts', () => {
  const markedRawCodec = `Plugin.extend(() => ({
    // @plate-schema-adoption-negative-codec
    codecs: { 'text/html': rule },
  }))`;
  const runtimeOwner =
    'packages/platejs/src/internal/plugin/compilePlateHtmlCodec.spec.ts';
  const productCodecOwner =
    'packages/platejs/src/lib/plugins/ProductCodecs.spec.ts';
  const typeOwner = 'packages/platejs/type-tests/base-plugin-contracts.ts';
  const markdownOwner =
    'packages/platejs/src/markdown/lib/internal/markdownCodecs.spec.ts';

  for (const file of [
    runtimeOwner,
    productCodecOwner,
    typeOwner,
    markdownOwner,
  ]) {
    assert.deepEqual(auditPlateSchemaSource(markedRawCodec, file), []);
    assert.match(
      auditPlateSchemaSource(
        `Plugin.extend(() => ({ codecs: { 'text/html': rule } }))`,
        file
      )[0]?.reason ?? '',
      /context-bound defineCodecs/
    );
  }

  assert.match(
    auditPlateSchemaSource(
      markedRawCodec,
      'packages/platejs/src/internal/plugin/other.spec.ts'
    )[0]?.reason ?? '',
    /context-bound defineCodecs/
  );
  assert.equal(
    auditPlateSchemaSource(
      `${markedRawCodec};\n${markedRawCodec}`,
      runtimeOwner
    ).filter((issue) => issue.reason.includes('context-bound defineCodecs'))
      .length,
    1
  );
});

test('allows render.node only in Core resolved-slot owners', () => {
  for (const file of [
    'packages/platejs/src/internal/plugin/resolvePlugins.ts',
    'packages/platejs/src/lib/plugin/defineBasePlugin.ts',
  ]) {
    assert.deepEqual(
      auditPlateSchemaSource(
        `const value = { render: { node: Component } }`,
        file
      ),
      []
    );
  }
});

test('keeps static/base component bindings free of Plate React adapters', () => {
  const file =
    'apps/www/src/registry/components/editor/basic-blocks-static.tsx';

  assert.deepEqual(
    auditPlateSchemaSource(
      [
        `import { BaseParagraphPlugin } from 'platejs';`,
        `import { ParagraphStatic } from '@/registry/components/editor/paragraph-static';`,
        `const kit = [defineBasePlugin('p', { component: ParagraphStatic, })];`,
      ].join('\n'),
      file
    ),
    []
  );

  for (const source of [
    `import { ParagraphPlugin } from 'platejs/react';`,
    `import { H1Plugin } from 'platejs/react';`,
    `import { CodeDrawingElement } from '@/registry/components/editor/code-drawing';`,
    `import { toPlatePlugin } from 'platejs/react';`,
    `toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphStatic });`,
    `ParagraphPlugin.configure({ component: ParagraphStatic });`,
  ]) {
    assert.equal(
      auditPlateSchemaSource(source, file).some((issue) =>
        /static\/base|terminal consumers/.test(issue.reason)
      ),
      true
    );
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `BaseParagraphPlugin.configure({ initialState: { enabled: true } });`,
      file
    ),
    []
  );
});

test('accepts Base constructor components and rejects extension-stage components', () => {
  assert.deepEqual(
    auditPlateSchemaSource(
      `defineBasePlugin('p', { component: ParagraphStatic, });`,
      'packages/example/src/lib/BaseParagraphPlugin.ts'
    ),
    []
  );
  assert.equal(
    auditPlateSchemaSource(
      `BaseParagraphPlugin.extend({ component: ParagraphStatic });`,
      'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx'
    ).some((issue) =>
      issue.reason.includes('.extend() cannot define component')
    ),
    true
  );
  assert.deepEqual(
    auditPlateSchemaSource(
      `BaseParagraphPlugin.configure({ component: ParagraphStatic });`,
      'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx'
    ),
    []
  );
  assert.deepEqual(
    auditPlateSchemaSource(
      `toPlatePlugin(BaseParagraphPlugin, { component: ParagraphElement });`,
      'packages/example/src/react/ParagraphPlugin.tsx'
    ),
    []
  );
  assert.equal(
    auditPlateSchemaSource(
      `toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphElement });`,
      'apps/www/src/registry/examples/example.tsx'
    ).some((issue) =>
      issue.reason.includes(
        'terminal consumers configure the Base descriptor directly'
      )
    ),
    true
  );
  assert.deepEqual(
    auditPlateSchemaSource(
      [
        '// @ts-expect-error configured descriptors are terminal authoring inputs',
        'ConfiguredPlatePlugin.extend({ component: ParagraphElement });',
      ].join('\n'),
      'packages/platejs/src/lib/plugin/defineBasePlugin.typed.spec.ts'
    ),
    []
  );
});

test('allows only the exact typed negative render.node contract', () => {
  const source = [
    "defineBasePlugin('negative', { render: {",
    '  // @ts-expect-error custom node components use the Plate component field',
    '  node: Component,',
    '} });',
  ].join('\n');
  const file = 'packages/platejs/src/lib/plugin/defineBasePlugin.typed.spec.ts';

  assert.equal(
    auditPlateSchemaSource(source, file).some((issue) =>
      issue.reason.includes('root-level component')
    ),
    false
  );
  assert.equal(
    auditPlateSchemaSource(
      "defineBasePlugin('negative', {render: { node: Component } });",
      file
    ).some((issue) => issue.reason.includes('root-level component')),
    true
  );
  assert.equal(
    auditPlateSchemaSource(
      source,
      'packages/platejs/src/lib/plugin/other.spec.ts'
    ).some((issue) => issue.reason.includes('root-level component')),
    true
  );
});

test('allows only the exact marked runtime negative render.node contract', () => {
  const source = `
    Reflect.apply(defineBasePlugin, undefined, [
      {
        name: 'invalid-render-node',
        render: {
          // @plate-schema-adoption-negative-render-node
          node: () => null,
        },
      },
    ]);
  `;
  const file = 'packages/platejs/src/lib/plugin/defineBasePlugin.spec.ts';

  assert.deepEqual(auditPlateSchemaSource(source, file), []);

  const unmarkedIssues = auditPlateSchemaSource(
    source.replace(
      '          // @plate-schema-adoption-negative-render-node\n',
      ''
    ),
    file
  );

  assert.equal(
    unmarkedIssues.some((issue) =>
      issue.reason.includes('root-level component')
    ),
    true
  );
  assert.equal(
    unmarkedIssues.some((issue) =>
      issue.reason.includes(
        'runtime render.node negative-contract allowlist expects 1 marked declaration but found 0'
      )
    ),
    true
  );
  assert.equal(
    auditPlateSchemaSource(
      source,
      'packages/platejs/src/lib/plugin/other.spec.ts'
    ).some((issue) => issue.reason.includes('root-level component')),
    true
  );
  assert.equal(
    auditPlateSchemaSource(`${source}\n${source}`, file).filter((issue) =>
      issue.reason.includes('root-level component')
    ).length,
    1
  );
});

test('allows only the exact runtime API negative fixture', () => {
  const source = `
    const createRuntime = definePlatePlugin as unknown as (
      name: string,
      definition: unknown
    ) => unknown;
    createRuntime('invalidApi', {
      api: { label: () => 'invalid' },
    });
  `;
  const file = 'packages/platejs/src/react/plugin/definePlatePlugin.spec.ts';

  assert.deepEqual(auditPlateSchemaSource(source, file), []);
  assert.match(
    auditPlateSchemaSource(
      source.replace("'invalidApi'", "'different'"),
      file
    )[0]?.reason ?? '',
    /plugin api must be declared as a factory/
  );
  assert.match(
    auditPlateSchemaSource(
      source,
      'packages/platejs/src/react/plugin/other.spec.ts'
    )[0]?.reason ?? '',
    /plugin api must be declared as a factory/
  );
});

test('accepts current plugin syntax and unrelated document or Markdown AST shapes', () => {
  for (const source of [
    `definePlatePlugin('p', { component: Paragraph, schema: { element: { content: schema.content.text(), type: 'paragraph' } } })`,
    `defineBasePlugin('hr', {schema: { element: { void: 'block' } } })`,
    `defineBasePlugin('p', {schema: { element: { ...elementSchema } } })`,
    `defineExtension('paragraph', {schema: { elements: { paragraph: { content: schema.content.text() } } } })`,
    `defineEditorSchema("schema:app", { id: 'app', version: 1, elements: { horizontalRule: { void: true } } })`,
    `defineExtension('dynamic', {schema: { elements } })`,
    `defineExtension('spread', {schema: { elements: { paragraph: { ...definition } } } })`,
    `defineBasePlugin('runtime', {initialState: { enabled: true } })`,
    `ParagraphPlugin.configure(({ editor }) => ({ initialState: { editor }, on: {}, override: { plugins: {} }, render: {}, shortcuts: {} }))`,
    `ParagraphPlugin.configure(() => ({}))`,
    `defineBasePlugin('link', { initialState: { isUrl: () => true, schemes: ['https'] }, schema: ({ initialState, name, plugins }) => ({ properties: {} }) })`,
    `const event = { node: { type: 'paragraph' } }`,
    `defineBasePlugin('analytics', {initialState: { event: { node: { type: 'paragraph' } } } })`,
    `const rules = { emphasis: { mark: true } }`,
    `const parser = { isElement: true, isLeaf: false }`,
    `defineEditorSchema('documentSchema', { elements: { paragraph: { content: schema.content.text(), groups: ['block'] } } })`,
    `state.schema.element('paragraph')`,
    `defineBasePlugin('align', { initialState: { targets: [ParagraphPlugin] }, })`,
    `defineBasePlugin('generic', {targetPlugins: ['p'] })`,
    `ParagraphPlugin.configure({ initialState: { topLevel: true } })`,
    `ParagraphPlugin.configure({ schema: { element: { properties: { id: property.string() } } } })`,
    `ParagraphPlugin.extend(({ editor }) => ({ initialState: { editor } }))`,
    `ParagraphPlugin.configure({ component: ParagraphElement })`,
    `definePlatePlugin('p', { component: ParagraphElement, })`,
    `definePlatePlugin('leaf', { }).extend({ render: { leaf: Leaf, aboveNodes } })`,
    `const component = editor.getPlugin(ParagraphPlugin).render.node`,
    `defineBasePlugin('link', {initialState: { isUrl: () => true } })`,
    `defineBasePlugin('negative', {/* @ts-expect-error runtime access */ schema: ({ editor }) => ({ editor }) })`,
    `state.schema.getProperty(element, colSpanHandle)`,
    `editor.read.schema.property(AdvancedMarkPlugin)`,
    `createEditor(getOptions())`,
    `const configured = { plugins: [], schema: { id: 'ordinary', version: 1 } }; const { schema, ...runtimeOptions } = configured; createEditor(runtimeOptions)`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; const schemaKey = 'schema'; const options = { ...base, [schemaKey]: derivedSchema }; createEditor(options)`,
    `const identity = { id: 'ordinary', version: 1 }; const copy = { ...identity, id: dynamicId }; createEditor({ schema: copy })`,
    `const identity = { id: 'ordinary', version: 1 }; const { id, ...copy } = identity; createEditor({ schema: copy })`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; createEditor({ ...base, schema: derivedSchema })`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; const override = { schema: derivedSchema }; const options = { ...base, ...override }; createEditor(options)`,
    `const override = { schema: derivedSchema }; const options = { schema: { id: 'ordinary', version: 1 }, ...override }; createEditor(options)`,
    `let identity = { id: 'ordinary', version: 1 }; identity = derivedSchema; createEditor({ schema: identity })`,
    `let identity = derivedSchema; createEditor({ schema: identity }); identity = { id: 'ordinary', version: 1 }`,
    `const options = { schema: { id: 'ordinary', version: 1 } }; options.schema = derivedSchema; createEditor(options)`,
    `let options = { schema: { id: 'ordinary', version: 1 } }; options = { plugins: [] }; createEditor(options)`,
    `const options = buildOptions(); createEditor(options); options.schema = { id: 'ordinary', version: 1 }`,
    `let options = { plugins: [] }; createEditor(options); options = { schema: { id: 'ordinary', version: 1 } }`,
    `let options = { plugins: [] }; function helper() { const options = { schema: { id: 'ordinary', version: 1 } }; return options } createEditor(options)`,
    `const schema = { id: 'ordinary', version: 1 }; function build(schema) { createEditor({ schema }) }`,
    `function helper(createEditor) { createEditor({ schema: { id: 'ordinary', version: 1 } }) }`,
    `const options = {}; let alias = options; alias = {}; alias.schema = { id: 'ordinary', version: 1 }; createEditor(options)`,
    `let key = 'schema'; key = 'notSchema'; createEditor({ [key]: { id: 'ordinary', version: 1 } })`,
    `let key = 'notSchema'; createEditor({ [key]: { id: 'ordinary', version: 1 } }); key = 'schema'`,
  ]) {
    expectAccepted(source);
  }
});

test('reserves package configure calls for reviewed consumer installation owners', () => {
  for (const source of [
    `defineBasePlugin('example', { }).configure({ initialState: { enabled: true } })`,
    `defineBasePlugin('example', { }).configurePlugin(OtherPlugin, { initialState: { enabled: true } })`,
    `defineBasePlugin('example', { }).configurePlugin?.(OtherPlugin, { initialState: { enabled: true } })`,
    `defineBasePlugin('example', { }).extendPlugin(OtherPlugin, { shortcuts: {} })`,
    `defineBasePlugin('example', { })?.extendPlugin(OtherPlugin, { shortcuts: {} })`,
    `defineBasePlugin('example', { }).clone()`,
  ]) {
    assert.ok(
      auditPlateSchemaSource(
        `export const ExamplePlugin = ${source};`,
        'packages/example/src/ExamplePlugin.ts'
      ).some((issue) =>
        /package plugin definitions must use constructor fields/.test(
          issue.reason
        )
      )
    );
  }

  for (const [source, file] of [
    [
      `export const ExamplePlugin = defineBasePlugin('example', {initialState: { enabled: true } });`,
      'packages/example/src/ExamplePlugin.ts',
    ],
    [
      `ExamplePlugin.configure({ initialState: { enabled: true } })`,
      'packages/example/src/ExamplePlugin.spec.ts',
    ],
    [
      `ExamplePlugin.configure({ initialState: { enabled: true } })`,
      'packages/platejs/src/lib/plugins/getCorePlugins.ts',
    ],
    [
      `
        defineBasePlugin('react', { }).extend(plateReactExtension);
        ExamplePlugin.configure({ initialState: { enabled: true } });
      `,
      'packages/platejs/src/react/editor/getPlateCorePlugins.ts',
    ],
    [
      `ExamplePlugin.configure({ initialState: { enabled: true } })`,
      'apps/www/src/registry/components/editor/plugins/example-kit.ts',
    ],
    [
      `viewportStore.configure({ root: null })`,
      'packages/example/src/ExamplePlugin.ts',
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), []);
  }
});

test('rejects authoring chained after terminal configure', () => {
  for (const source of [
    `ExamplePlugin.configure({}).configure({})`,
    `ExamplePlugin.configure({}).extend({})`,
    `ExamplePlugin.configure({}).extendPlugin(OtherPlugin, {})`,
    `ExamplePlugin.configure({}).configure({ component: Component })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source)[0]?.reason ?? '',
      /configure must be the final plugin authoring call/
    );
  }
});

test('rejects local named lineage on ordinary package editor construction', () => {
  for (const source of [
    `createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `createStaticEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `useEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `useStaticEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `const makeEditor = createEditor; makeEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `let makeEditor; makeEditor = createEditor; makeEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `Plate.createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `const { createEditor: createEditor } = Plate; createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `import { createEditor as createEditor } from 'platejs/react'; createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `createEditor?.({ schema: { id: 'ordinary', version: 1 } })`,
    `const identity = { id: 'ordinary', version: 1 }; createEditor({ schema: identity })`,
    `let identity = { id: 'ordinary', version: 1 }; createEditor({ schema: identity })`,
    `var identity = { id: 'ordinary', version: 1 }; createEditor({ schema: identity })`,
    `let identity; identity = { id: 'ordinary', version: 1 }; createEditor({ schema: identity })`,
    `let identity = { id: 'ordinary', version: 1 }; const alias = identity; createEditor({ schema: alias })`,
    `const identities = { document: { id: 'ordinary', version: 1 } }; createEditor({ schema: identities.document })`,
    `const identities = { document: { id: 'ordinary', version: 1 } }; const alias = identities; createEditor({ schema: alias.document })`,
    `const identities = { document: { id: 'ordinary', version: 1 } }; const { document: identity } = identities; createEditor({ schema: identity })`,
    `const identities = []; identities[0] = { id: 'ordinary', version: 1 }; const [identity] = identities; createEditor({ schema: identity })`,
    `const identities = [derived, { id: 'ordinary', version: 1 }]; const [, ...rest] = identities; createEditor({ schema: rest[0] })`,
    `const key = 'schema'; createEditor({ [key]: { id: 'ordinary', version: 1 } })`,
    `let key; key = 'schema'; createEditor({ [key]: { id: 'ordinary', version: 1 } })`,
    `const keys = { schema: 'schema' }; createEditor({ [keys.schema]: { id: 'ordinary', version: 1 } })`,
    `const options = { schema: { id: 'ordinary', version: 1 } }; createEditor(options)`,
    `let options; options = { schema: { id: 'ordinary', version: 1 } }; createEditor(options)`,
    `const options = { schema: { id: 'ordinary', version: 1 } }; const alias = options; createEditor(alias)`,
    `const config = { editor: { schema: { id: 'ordinary', version: 1 } } }; createEditor(config.editor)`,
    `const slot = 'editor'; const config = { editor: { schema: { id: 'ordinary', version: 1 } } }; createEditor(config[slot])`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; createEditor({ ...base })`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; const options = { ...base }; createEditor(options)`,
    `const configured = { plugins: [], schema: { id: 'ordinary', version: 1 } }; const { plugins, ...runtimeOptions } = configured; createEditor(runtimeOptions)`,
    `const identity = { id: 'ordinary', version: 1 }; createEditor({ schema: { ...identity } })`,
    `const identity = { id: 'ordinary', version: 1 }; const copy = { ...identity }; createEditor({ schema: copy })`,
    `const identity = { id: 'ordinary', version: 1 }; const { ...copy } = identity; createEditor({ schema: copy })`,
    `const identity = { id: 'ordinary', version: 1 }; const copy = { ...identity, id: 'other' }; createEditor({ schema: copy })`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; createEditor({ schema: derivedSchema, ...base })`,
    `createEditor({ ...{ schema: { id: 'ordinary', version: 1 } } })`,
    `const base = { schema: derivedSchema }; const override = { schema: { id: 'ordinary', version: 1 } }; const options = { ...base, ...override }; createEditor(options)`,
    `let identity = derivedSchema; identity = { id: 'ordinary', version: 1 }; createEditor({ schema: identity })`,
    `let identity = { id: 'ordinary', version: 1 }; createEditor({ schema: identity }); identity = derivedSchema`,
    `let identity = { id: 'ordinary', version: 1 }; const options = { schema: identity }; identity = derivedSchema; createEditor(options)`,
    `const options = { schema: derivedSchema }; options.schema = { id: 'ordinary', version: 1 }; createEditor(options)`,
    `let options = { plugins: [] }; options = { schema: { id: 'ordinary', version: 1 } }; createEditor(options)`,
    `let options = { schema: { id: 'ordinary', version: 1 } }; createEditor(options); options = { plugins: [] }`,
    `let options = {}; options.schema ??= { id: 'ordinary', version: 1 }; createEditor(options)`,
    `const options = {}; Object.assign(options, { schema: { id: 'ordinary', version: 1 } }); createEditor(options)`,
    `const options = {}; const key = getSchemaKey(); Object.assign(options, { [key]: { id: 'ordinary', version: 1 } }); createEditor(options)`,
    `const options = {}; Object.assign(options, flag ? { schema: { id: 'ordinary', version: 1 } } : {}); createEditor(options)`,
    `const source = { schema: { id: 'ordinary', version: 1 } }; const options = {}; Object.assign(options, source); createEditor(options)`,
    `const source = { schema: { id: 'ordinary', version: 1 } }; const options = { ...source }; createEditor(options)`,
    `const options = {}; const alias = options; alias.schema = { id: 'ordinary', version: 1 }; createEditor(options)`,
    `const options = {}; const alias = options; Object.assign(alias, { schema: { id: 'ordinary', version: 1 } }); createEditor(options)`,
    `const config = { editor: {} }; const slot = 'editor'; Object.assign(config[slot], { schema: { id: 'ordinary', version: 1 } }); createEditor(config.editor)`,
    `createEditor(Object.assign({}, { schema: { id: 'ordinary', version: 1 } }))`,
    `createEditor(flag ? { schema: { id: 'ordinary', version: 1 } } : { plugins: [] })`,
    `createEditor({ schema: flag && { id: 'ordinary', version: 1 } })`,
    `let options = { schema: { id: 'ordinary', version: 1 } }; function helper() { const options = { plugins: [] }; return options } createEditor(options)`,
    `let key = 'notSchema'; key = 'schema'; createEditor({ [key]: { id: 'ordinary', version: 1 } })`,
    `let key = 'schema'; createEditor({ [key]: { id: 'ordinary', version: 1 } }); key = 'notSchema'`,
    `const identity = { id: 'ordinary', version: 1 } as const; useStaticEditor({ schema: identity })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source, 'packages/example/src/editor.spec.ts')[0]
        ?.reason ?? '',
      /must use derived schema identity/,
      source
    );
  }
});

test('ignores same-named constructors imported from non-Plate modules', () => {
  assert.deepEqual(
    auditPlateSchemaSource(
      `import { createEditor } from 'some-editor';
       createEditor({ schema: { id: 'ordinary', version: 1 } });`,
      'packages/example/src/editor.ts'
    ),
    []
  );
});

test('rejects local named lineage on ordinary app editor construction', () => {
  assert.match(
    auditPlateSchemaSource(
      `createEditor({ schema: { id: 'ordinary-app', version: 1 } })`,
      'apps/www/src/example.ts'
    )[0]?.reason ?? '',
    /must use derived schema identity/
  );
});

test('owns named-lineage policy for documentation code fences', () => {
  const fence = (code) => `\`\`\`tsx\n${code}\n\`\`\``;

  assert.match(
    auditNamedSchemaLineageDocument(
      fence(`createEditor({ schema: { id: 'ordinary-doc', version: 1 } })`),
      'content/docs/(guides)/ordinary.mdx'
    )[0]?.reason ?? '',
    /must use derived schema identity/
  );

  assert.match(
    auditNamedSchemaLineageDocument(
      fence(
        `const createEditor = Plate.createEditor; createEditor({ schema: { id: 'ordinary-doc', version: 1 } })`
      ),
      'content/docs/(guides)/ordinary.mdx'
    )[0]?.reason ?? '',
    /must use derived schema identity/
  );

  for (const [file, id, version] of [
    ['content/docs/(guides)/editor.cn.mdx', 'acme-document', 3],
    ['content/docs/(guides)/editor.mdx', 'acme-document', 3],
    ['content/docs/(plugins)/(collaboration)/yjs.cn.mdx', 'yjs-example', 1],
    ['content/docs/(plugins)/(collaboration)/yjs.mdx', 'yjs-example', 1],
  ]) {
    assert.deepEqual(
      auditNamedSchemaLineageDocument(
        fence(`createEditor({ schema: { id: '${id}', version: ${version} } })`),
        file
      ),
      []
    );
  }

  assert.notDeepEqual(
    auditNamedSchemaLineageDocument(
      fence(`createEditor({ schema: { id: 'yjs-example', version: 1 } })`),
      'content/docs/(guides)/editor.mdx'
    ),
    []
  );
  assert.match(
    auditNamedSchemaLineageDocument(
      fence(`createEditor()`),
      'content/docs/(guides)/editor.mdx'
    )[0]?.reason ?? '',
    /allowlist expects 1 acme-document@3/
  );
});

test('accepts reviewed named lineage without banning schema declarations', () => {
  for (const [source, file] of [
    [
      `createEditor({ schema: importedLineage })`,
      'packages/platejs/test/yjs/schema-identity-contract.spec.ts',
    ],
    [
      `const TestSchema = { id: 'plate:yjs-api-test', version: 1 } as const;
       createEditor({ schema: TestSchema });
       createEditor({ schema: TestSchema });
       createEditor({ schema: TestSchema });
       createEditor({ schema: TestSchema });`,
      'packages/platejs/src/yjs/BaseYjsPlugin.api.spec.ts',
    ],
    [
      `defineEditorSchema("schema:document", { id: 'document', version: 1, elements: { paragraph: { content: schema.content.text() } } })`,
      'packages/plitejs/test/named-lineage-guard.spec.ts',
    ],
    [
      `defineBasePlugin('paragraph', {schema: { element: { content: schema.content.text(), properties: { id: property.string(), version: property.number() } } } })`,
      'packages/example/src/plugin.spec.ts',
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), []);
  }
});

test('allows only the exact reviewed raw-query count in an owning file', () => {
  expectRejected(`editor.read.schema.property({ key, placement, type })`);
  expectRejected(`editor.read.schema.getElementProperty(element, 'colSpan')`);
  expectRejected(`editor.read.schema.getProperty(element, 'colSpan')`);

  const htmlOwner = 'packages/platejs/src/lib/plugins/html/HtmlPlugin.ts';
  const htmlQueries = Array.from(
    { length: 4 },
    () =>
      `state.schema.property({ key: property.key, placement: property.property.placement, type })`
  ).join(';');

  assert.deepEqual(auditPlateSchemaSource(htmlQueries, htmlOwner), []);
  assert.match(
    auditPlateSchemaSource(
      `${htmlQueries}; state.schema.property({ id, kind: 'schema-property' })`,
      htmlOwner
    )[0]?.reason ?? '',
    /outside the intentional runtime/
  );
});
