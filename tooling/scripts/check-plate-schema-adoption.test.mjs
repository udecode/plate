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
    `createBasePlugin({ name: 'p', node: { element: true } })`,
    `ParagraphPlugin.configure({ node: { type: 'p' } })`,
    `createBasePlugin({ name: 'p', node: { component: Paragraph } })`,
    `createBasePlugin({ name: 'p', schema: { mark: true } })`,
    `const schemaKey = 'schema'; createBasePlugin({ name: 'p', [schemaKey]: { mark: true } })`,
    `let schemaKey; schemaKey = 'schema'; createBasePlugin({ name: 'p', [schemaKey]: { element: {} } })`,
    `const schemaKey = 'schema'; function helper() { const schemaKey = 'notSchema'; return schemaKey } createBasePlugin({ name: 'p', [schemaKey]: { element: {} } })`,
    `createBasePlugin({ name: 'p', schema: () => ({ mark: true }) })`,
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
    `createBasePlugin({ name: 'p', schema: ({ editor }) => ({ editor }) })`,
    `createBasePlugin({ config: { schemes: ['https'] }, name: 'link' })`,
    `const configKey = 'config'; createPlatePlugin({ [configKey]: {}, name: 'link' })`,
    `ParagraphPlugin.configure({ config: { topLevel: true } })`,
    `createBasePlugin({ name: 'p', schema: { element: { groups: ['block'] } } })`,
    `createBasePlugin({ name: 'p', schema: { element: {} } })`,
    `createBasePlugin({ name: 'link', schema: { element: { inline: true } } })`,
    `defineEditorExtension({ name: 'paragraph', schema: { elements: { paragraph: {} } } })`,
    `defineEditorSchema({ id: 'app', version: 1, elements: { paragraph: {} } })`,
    `const elementsKey = 'elements'; defineEditorSchema({ id: 'app', version: 1, [elementsKey]: { paragraph: {} } })`,
    `const schemaKey = 'schema'; const elementsKey = 'elements'; defineEditorExtension({ name: 'paragraph', [schemaKey]: { [elementsKey]: { paragraph: {} } } })`,
    `createBasePlugin<ParagraphConfig>({ name: 'p', schema: { element: { content: schema.content.text() } } })`,
    `createPlatePlugin<LinkConfig>({ name: 'link', schema: { element: { content: schema.content.text(), inline: true } } })`,
    `createBasePlugin({ name: 'p', schema: { element: { content: schema.content.type(KEYS.p) } } })`,
    `IndentPlugin.configure({ initialState: { targetPluginNames: ['p'] } })`,
    `ParagraphPlugin.configure(() => ({ schema: { element: {} } }))`,
    `ParagraphPlugin.configure(() => { return { type: 'other' } })`,
    `const badRuntimeConfig = { schema: { element: {} } }; ParagraphPlugin.configure(() => badRuntimeConfig)`,
    `// @ts-expect-error deleted shape\ncreateBasePlugin({ name: 'p', node: { element: true } })`,
    `// @ts-expect-error deleted shape\ncreateBasePlugin({ name: 'p', schema: { mark: true } })`,
    `node.element`,
    `node.mark`,
    `plugin.node.element`,
    `plugin.node.mark`,
    `node.component`,
    `plugin.node.component`,
    `createBasePlugin({ name: 'p', render: { node: ParagraphElement } })`,
    `createPlatePlugin({ name: 'p' }).extend({ render: { node: ParagraphElement } })`,
    `ParagraphPlugin.configure({ render: { node: ParagraphElement } })`,
    `toPlatePlugin(BaseParagraphPlugin, { render: { node: ParagraphElement } })`,
    `state.schema.getElementProperty(element, 'colSpan')`,
    `editor.read.schema.property({ key: 'schemaAdvanced', placement: 'text', type: 'p' })`,
  ]) {
    expectRejected(source);
  }
});

test('allows the private block-content group only in its compiler owner', () => {
  assert.deepEqual(
    auditPlateSchemaSource(
      `const PLATE_BLOCK_CONTENT_SCHEMA_GROUP = 'plate:block-content'`,
      'packages/core/src/internal/plugin/compilePlateModel.ts'
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
      'packages/core/src/internal/plugin/resolvePlugins.ts'
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
    `createBasePlugin({ api: () => ({}), commands: () => [], component: ParagraphElement, name: 'p', on: {}, read: () => ({}), readMiddleware: () => [], render: { leaf: Leaf }, selectors: {}, update: () => ({}) })`,
    `createPlatePlugin({ component: ParagraphElement, name: 'p', on: {} })`,
    `createBasePlugin({ name: 'p', ...behavior })`,
    `const componentKey = 'component'; createBasePlugin({ [componentKey]: ParagraphElement, name: 'p' })`,
    `const createPlugin = createBasePlugin; createPlugin({ component: ParagraphElement, name: 'p' })`,
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source), []);
  }

  assert.match(
    auditPlateSchemaSource(`
      Core.createBasePlugin({
        codecs: { 'text/html': rule },
        name: 'p',
      });
    `)[0]?.reason ?? '',
    /context-bound defineCodecs/
  );

  assert.deepEqual(
    auditPlateSchemaSource(
      `(createBasePlugin as any)({ codecs: {}, name: 'negative' })`,
      'packages/core/src/lib/plugin/other.spec.ts'
    ),
    []
  );
});

test('rejects deleted Plate and Plite definition fields', () => {
  const plateIssues = auditPlateSchemaSource(
    `createBasePlugin({
      clipboard: {},
      config: {},
      extension: {},
      handlers: {},
      name: 'p',
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
    `defineEditorExtension({
      config: {},
      name: 'raw',
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
    auditPlateSchemaSource(
      `defineEditorExtension<Editor>()({ name: 'typed' })`
    )[0]?.reason ?? '',
    /infers one definition/
  );
  assert.match(
    auditPlateSchemaSource(
      `createBasePlugin<Definition>({ name: 'typedPlate' })`
    )[0]?.reason ?? '',
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
        'apps/www/src/registry/ui/footnote-node.slow.tsx'
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
    createPlatePlugin({ name: 'plate', on: { ...legacy } });
    createBasePlugin({ name: 'base', on });
    defineEditorExtension({ name: 'plite', on: { onKeyDown() {} } });
  `);

  assert.equal(
    issues.filter((issue) => issue.reason.includes('listeners are prefixless'))
      .length,
    5
  );
  expectAccepted(`
    createPlatePlugin({
      name: 'current',
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
    const directAlias = defineEditorExtension;
    directAlias({ config: {}, name: 'a' });
    import { defineEditorExtension as importedAlias } from '@platejs/plite';
    importedAlias({ name: 'b', state: {} });
    const { defineEditorExtension: destructuredAlias } = Plite;
    destructuredAlias({ name: 'c', tx: {} });
    Plite.defineEditorExtension({
      name: 'd',
      validateConfiguration() {},
    });
    directAlias<Definition>({ name: 'typed' });
    importedAlias({
      api: (editor, context) => ({ editor, context }),
      name: 'arity',
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
    const definition = { extension: {}, name: 'base' };
    createBasePlugin(definition);
    const stale = { handlers: {} };
    createPlatePlugin({ name: 'plate', ...stale });
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
    createBasePlugin({ name: 'base', ...unknown });
  `);
});

test('rejects config only in final Plite callback contexts', () => {
  const issues = auditPlateSchemaSource(`
    defineEditorExtension({
      name: 'contexts',
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
  const file = 'packages/plite/test/generic-extension-contract.ts';

  assert.deepEqual(
    auditPlateSchemaSource(
      `
        defineEditorExtension({
          name: 'bad-validation-config',
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
        defineEditorExtension({
          name: 'bad-validation-config',
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
    createBasePlugin({
      name: 'legacy',
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

      const examplePlugin = createBasePlugin({ name: 'example' });

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
        'Use `DocxIOPlugin.api.import` for DOCX input.',
        file
      )[0]?.reason ?? '',
      /installed editor portal/
    );
  }
  assert.deepEqual(
    auditNamedSchemaLineageDocument(
      'Use `editor.plugin(DocxIOPlugin).api.import` for DOCX input.',
      '.changeset/docx.md'
    ),
    []
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
        '`createBasePlugin({ component: ParagraphStatic, name: "p" })`',
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
    } from '@platejs/plite';
  `);

  assert.equal(
    rootImportIssues.filter((issue) =>
      issue.reason.includes('internal dependency typing')
    ).length,
    4
  );
  assert.deepEqual(
    auditPlateSchemaSource(`
      import type {
        EditorExtensionDependencyReferenceFor,
        EditorExtensionTypeLambda,
        InternalEditorExtensionDependencyReference,
        InternalEditorExtensionTypeProviderOf,
      } from '@platejs/plite/internal';
    `),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `export type { InternalEditorExtensionTypeProviderOf } from './interfaces/editor';`,
      'packages/plite/src/index.ts'
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
    } from '@platejs/core';
  `);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('internal Core author-to-canonical carrier')
    ).length,
    4
  );
  assert.deepEqual(
    auditPlateSchemaSource(`
      import type { PluginReference, DefinitionOf } from '@platejs/core';
    `),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `export type { PluginDefinitionCarrier } from './lib/plugin/pluginDefinitionCarrier.internal';`,
      'packages/core/src/index.ts'
    )[0]?.reason ?? '',
    /cannot be root-exported/
  );
  assert.match(
    auditPlateSchemaSource(
      `export type { InternalPluginDefinitionOf } from '../lib/plugin/pluginDefinitionLookup.internal';`,
      'packages/core/src/internal/index.ts'
    )[0]?.reason ?? '',
    /DefinitionOf is the sole public extractor/
  );
});

test('keeps Core compiler aliases in internal modules', () => {
  const issues = auditPlateSchemaSource(`
    import type {
      LowerBasePlugin,
      NormalizeBasePluginInput,
      NormalizePlatePluginInput,
    } from '@platejs/core';
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
      'packages/core/src/lib/plugin/BasePlugin.ts',
    ],
    [
      `export type NormalizePlatePluginInput<C> = C;`,
      'packages/core/src/react/plugin/PlatePlugin.ts',
    ],
    [
      `export type { NormalizeBasePluginInput } from './basePluginCompiler.internal';`,
      'packages/core/src/lib/plugin/index.ts',
    ],
    [
      `export * from './basePluginCompiler.internal';`,
      'packages/core/src/lib/plugin/index.ts',
    ],
  ]) {
    assert.notEqual(auditPlateSchemaSource(source, file).length, 0, file);
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `export type LowerBasePlugin<C> = C;`,
      'packages/core/src/lib/plugin/basePluginCompiler.internal.ts'
    ),
    []
  );
});

test('requires the exact react({ dom }) factory input', () => {
  const issues = auditPlateSchemaSource(`
    import * as PliteReact from '@platejs/plite-react';
    import { react as installReact } from '@platejs/plite-react';
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
    import * as PliteReact from '@platejs/plite-react';
    import { react as installReact } from '@platejs/plite-react';
    const shared = { dom: DOMExtension };
    const options = { dom: DOMExtension };
    installReact({ dom: DOMExtension });
    PliteReact.react(options);
    PliteReact.react({ ...shared });
  `);
});

test('allows only the exact marked React factory negative contracts', () => {
  const file = 'packages/plite-react/test/generic-react-editor-contract.tsx';

  assert.deepEqual(
    auditPlateSchemaSource(
      `
        import { react } from '@platejs/plite-react';
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
        import { react } from '@platejs/plite-react';
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
    "createBasePlugin({ api: {}, name: 'base' });",
    "createPlatePlugin({ api: {}, name: 'react' });",
    "defineEditorExtension({ api: {}, name: 'raw' });",
    'Plugin.extend({ api: {} });',
    'Plugin.configure({ api: () => ({}) });',
    "createBasePlugin({ name: 'groups', read: {}, update: {} });",
    "defineEditorExtension({ commands: {}, name: 'middleware', readMiddleware: {} });",
    "createBasePlugin({ api: (editor, store) => ({ editor, store }), name: 'twoPlateContexts' });",
    "defineEditorExtension({ api: (editor, context) => ({ editor, context }), name: 'twoPliteContexts' });",
  ].join('\n');
  const accepted = [
    "createBasePlugin({ api: () => ({}), name: 'base', read: () => ({}), update: () => ({}) });",
    "createPlatePlugin({ api() { return {}; }, name: 'react' });",
    "defineEditorExtension({ api: ({ editor, getContributions, root }) => ({ editor, getContributions, root }), commands: () => [], name: 'raw', readMiddleware: () => [] });",
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
      `createBasePlugin({ name: 'example' }).extend(() => ({ api: () => ({}) }))`,
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
      createBasePlugin({
        commands: () => [],
        name: 'example',
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
      export const BaseExamplePlugin = createBasePlugin({ name: 'example' });
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      export const BaseExamplePlugin = createBasePlugin({ name: 'example' });
      export const ExamplePlugin = BaseExamplePlugin['extend'](() => ({
        api: () => ({}),
      }));
    `,
    `
      export const BaseExamplePlugin = createBasePlugin({ name: 'example' });
      const ExamplePluginAlias = BaseExamplePlugin;
      export const ExamplePlugin = ExamplePluginAlias.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      let BaseExamplePlugin;
      BaseExamplePlugin = createBasePlugin({ name: 'example' });
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      import { createBasePlugin as createPlugin } from '@platejs/core';
      export const BaseExamplePlugin = createPlugin({ name: 'example' });
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const createPlugin = createBasePlugin;
      export const ExamplePlugin = createPlugin({ name: 'example' }).extend(
        () => ({ api: () => ({}) })
      );
    `,
    `
      let createPlugin;
      createPlugin = createBasePlugin;
      export const ExamplePlugin = createPlugin({ name: 'example' }).extend(
        () => ({ api: () => ({}) })
      );
    `,
    `
      import * as Core from '@platejs/core';
      export const ExamplePlugin = Core.createBasePlugin({
        name: 'example',
      }).extend(() => ({ api: () => ({}) }));
    `,
    `
      const { createBasePlugin: createPlugin } = Core;
      export const ExamplePlugin = createPlugin({ name: 'example' }).extend(
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
        export const BaseExamplePlugin = createBasePlugin({ name: 'example' });
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
          export const BaseExamplePlugin = createBasePlugin({ name: 'example' });
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
          export const BaseExamplePlugin = createBasePlugin({ name: 'example' });
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
          export const BaseExamplePlugin = createBasePlugin({ name: 'example' });
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
        export const BaseTagPluginOwner = createBasePlugin({ name: 'tag' });
        export const BaseTagPlugin = BaseTagPluginOwner.extend(() => ({
          read: () => ({}),
        }));
      `,
      'packages/tag/src/lib/BaseTagPlugin.ts'
    ),
    []
  );

  for (const source of [
    `
      const owners = {
        BaseExamplePlugin: createBasePlugin({ name: 'example' }),
      };
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ name: 'example' });
      const owners = { BaseExamplePlugin };
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ name: 'example' });
      const owners = {};
      owners.BaseExamplePlugin = BaseExamplePlugin;
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ name: 'example' });
      const owners = { BaseExamplePlugin };
      const alias = owners;
      export const ExamplePlugin = alias.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ name: 'example' });
      const owners = { BaseExamplePlugin };
      const { BaseExamplePlugin: alias } = owners;
      export const ExamplePlugin = alias.extend(() => ({ api: () => ({}) }));
    `,
    `
      const owners = [createBasePlugin({ name: 'example' })];
      const alias = owners;
      export const ExamplePlugin = alias[0].extend(() => ({ api: () => ({}) }));
    `,
    `
      const owners = [createBasePlugin({ name: 'example' })];
      const [BaseExamplePlugin] = owners;
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const owners = [OtherPlugin, createBasePlugin({ name: 'example' })];
      const [, ...rest] = owners;
      export const ExamplePlugin = rest[0].extend(() => ({ api: () => ({}) }));
    `,
    `
      const owners = {
        nested: { BaseExamplePlugin: createBasePlugin({ name: 'example' }) },
      };
      const { ['nested']: { BaseExamplePlugin = OtherPlugin } } = owners;
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ name: 'example' });
      const owners = { BaseExamplePlugin };
      const aliases = { ...owners };
      export const ExamplePlugin = aliases.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const owners = flag
        ? { BaseExamplePlugin: createBasePlugin({ name: 'example' }) }
        : {};
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: () => ({}),
      }));
    `,
    `
      const key = 'BaseExamplePlugin';
      const owners = {};
      owners[key] = createBasePlugin({ name: 'example' });
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
        const InternalRootPlugin = createBasePlugin({ name: 'root' });
        snapshotSources({ internalRoot: InternalRootPlugin });
      `,
      'packages/core/src/lib/editor/withPlite.ts'
    ),
    []
  );

  assert.equal(
    auditPlateSchemaSource(
      `
        const BaseExamplePlugin = createBasePlugin({ name: 'example' });
        const owners = { BaseExamplePlugin };
        const pluginName = 'BaseExamplePlugin';
        const aliases = { ...owners, [pluginName]: ExternalPlugin };
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
});

test('rejects one-use private plugin descriptor scaffolding', () => {
  const source = `
    const ExamplePluginDefinition = createBasePlugin({ name: 'example' });
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
        export const ExamplePluginBase = createBasePlugin({ name: 'example' });
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
  const source = `createBasePlugin({ name: 'example' }).extend(() => ({ api: () => ({}) }))`;

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

test('keeps locally created descriptor identity lexical', () => {
  assert.deepEqual(
    auditPlateSchemaSource(
      `const BaseExamplePlugin = createBasePlugin({ name: 'example' }); export function adapt(BaseExamplePlugin) { return BaseExamplePlugin.extend(() => ({ api: () => ({}) })); }`,
      'packages/example/src/lib/BaseExamplePlugin.ts'
    ),
    []
  );
});

test('allows only exact audited production extend stages at their owner path', () => {
  const exact = `
    createBasePlugin({ name: 'code' }).extend({
      commands: () => [],
      contributions: [],
    });
    createBasePlugin({ name: 'highlight' }).extend({
      corrections: [],
      on: {},
    });
  `;
  const owner = 'packages/code-block/src/lib/BaseCodeBlockPlugin.ts';

  assert.deepEqual(auditPlateSchemaSource(exact, owner), []);
  assert.match(
    auditPlateSchemaSource(
      `
        createBasePlugin({ name: 'code' })
          .extend({ commands: () => [], contributions: [] });
        createBasePlugin({ name: 'highlight' })
          .extend(() => ({ api: () => ({}) }));
      `,
      owner
    )[0]?.reason ?? '',
    /found \[api\]/
  );

  for (const [source, file, expected] of [
    [
      `createBasePlugin({ name: 'code' }).extend({
        rules: {},
        update: () => ({}),
      }).extend({ commands: () => [], contributions: [] }).extend(() => ({ render: {} }))`,
      owner,
      /\[rules, update\]/,
    ],
    [
      exact,
      'packages/example/src/BaseCodeBlockPlugin.ts',
      /\[commands, contributions\]/,
    ],
  ]) {
    const issue = auditPlateSchemaSource(source, file).find((item) =>
      item.reason.includes('direct constructor .extend() chain')
    );

    assert.ok(issue, file);
    assert.match(issue.reason, expected);
  }

  assert.match(
    auditPlateSchemaSource(`createBasePlugin({ name: 'code' })`, owner).at(-1)
      ?.reason ?? '',
    /expects exact 2 audited chains but found 0/
  );

  assert.match(
    auditPlateSchemaSource(
      `
        createBasePlugin({ name: 'code' }).extend({ commands: () => [], contributions: [] });
        createBasePlugin({ name: 'duplicate' }).extend({ commands: () => [], contributions: [] });
      `,
      owner
    ).at(-1)?.reason ?? '',
    /found 2; signatures did not match/
  );

  for (const file of [
    'packages/core/src/lib/plugins/affinity/AffinityPlugin.ts',
  ]) {
    assert.deepEqual(
      auditPlateSchemaSource(
        `createBasePlugin({ name: 'owner', update: () => ({}) }).extend(() => ({
          commands: () => [],
        }))`,
        file
      ),
      []
    );
  }

  for (const [source, file] of [
    [
      `createBasePlugin({ name: 'history' }).extend(history())`,
      'packages/core/src/lib/plugins/HistoryPlugin.ts',
    ],
    [
      `createBasePlugin({ name: 'dom' }).extend(plateDOMExtension)`,
      'packages/core/src/lib/plugins/dom/DOMPlugin.ts',
    ],
    [
      `createBasePlugin({ name: 'inputRules' }).extend(() => ({
        commands: () => [],
        contributions: [],
      }))`,
      'packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts',
    ],
    [
      `createBasePlugin({ name: 'override' }).extend(() => ({
        commands: () => [],
        corrections: [],
        readMiddleware: () => ({}),
      }))`,
      'packages/core/src/lib/plugins/override/OverridePlugin.ts',
    ],
    [
      `createBasePlugin({ name: 'react' }).extend(plateReactExtension)`,
      'packages/core/src/react/editor/getPlateCorePlugins.ts',
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), []);
  }

  assert.match(
    auditPlateSchemaSource(
      `createBasePlugin({ name: 'indent' }).extend({ shortcuts: {} })`,
      'packages/indent/src/lib/BaseIndentPlugin.ts'
    )[0]?.reason ?? '',
    /found \[shortcuts\]/
  );

  const listOwner = 'packages/list/src/lib/BaseListPlugin.ts';
  const listStages = `createBasePlugin({ name: 'list' })
    .extend(() => ({ api: () => ({}), read: () => ({}) }))
    .extend(() => ({ override: {}, update: () => ({}) }))
    .extend(() => ({ commands: () => [], corrections: [], on: {} }))`;

  assert.deepEqual(auditPlateSchemaSource(listStages, listOwner), []);
  assert.match(
    auditPlateSchemaSource(
      `createBasePlugin({ name: 'list' })
        .extend(() => ({ override: {} }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ commands: () => [], corrections: [], on: {} }))`,
      listOwner
    )[0]?.reason ?? '',
    /\[override\] -> \[update\] -> \[commands, corrections, on\]/
  );

  for (const [file, source] of [
    [
      'packages/basic-styles/src/lib/BaseStylePlugins.ts',
      `createBasePlugin({ name: 'textIndent' })
        .extend(() => ({ update: () => ({}) }))`,
    ],
    [
      'packages/csv/src/lib/CsvPlugin.ts',
      `createBasePlugin({ name: 'csv' })
        .extend(() => ({ api: () => ({}) }))
        .extend(({ defineCodecs }) => ({
          codecs: defineCodecs({ 'text/plain': rule }),
        }))`,
    ],
    [
      'packages/list-classic/src/lib/BaseListPlugin.ts',
      `createBasePlugin({ name: 'todo' }).extend(() => ({ commands: () => [] }));
      createBasePlugin({ name: 'list' })
        .extend(() => ({ read: () => ({}) }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ commands: () => [], corrections: [] }))`,
    ],
    [
      'packages/link/src/lib/BaseLinkPlugin.ts',
      `createBasePlugin({ name: 'link' })
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ commands: () => [] }))`,
    ],
    [
      'packages/markdown/src/lib/MarkdownPlugin.ts',
      `createBasePlugin({ name: 'markdown' })
        .extend(() => ({ api: () => ({}) }))`,
    ],
    [
      'packages/suggestion/src/lib/BaseSuggestionPlugin.ts',
      `createBasePlugin({ name: 'suggestion' })
        .extend(() => ({ read: () => ({}) }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ commands: () => [], corrections: [] }))`,
    ],
    [
      'packages/ai/src/react/AIChatPlugin.ts',
      `createPlatePlugin({ name: 'aiChat' })
        .extend(() => ({ api: () => ({}), read: () => ({}), selectors: {}, update: () => ({}) }))
        .extend(() => ({ commands: () => [], corrections: [], effectTypes: [], on: {} }))`,
    ],
    [
      'packages/table/src/lib/BaseTablePlugin.ts',
      `createBasePlugin({ name: 'table' })
        .extend(() => ({ api: () => ({}) }))
        .extend(() => ({ api: () => ({}), read: () => ({}) }))
        .extend(() => ({ read: () => ({}) }))
        .extend(() => ({ read: () => ({}) }))
        .extend(() => ({ api: () => ({}), read: () => ({}) }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ update: () => ({}) }))
        .extend(() => ({ contributions: [] }))
        .extend(() => ({ corrections: [] }))
        .extend(() => ({
          commands: () => [],
          readMiddleware: () => [],
          selectionKinds: [],
        }))`,
    ],
    [
      'packages/tabbable/src/react/TabbablePlugin.tsx',
      `createPlatePlugin({ name: 'tabbable' })
        .extend(() => ({ read: () => ({}) }))`,
    ],
    [
      'packages/toc/src/lib/BaseTocPlugin.ts',
      `createBasePlugin({ name: 'toc' })
        .extend(() => ({ read: () => ({}), update: () => ({}) }))`,
    ],
    [
      'packages/toggle/src/lib/BaseTogglePlugin.ts',
      `createBasePlugin({ name: 'toggle' })
        .extend(() => ({
          api: () => ({}),
          read: () => ({}),
          selectors: {},
        }))`,
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), [], file);
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `
        const BlockPlaceholderPluginBase = createPlatePlugin({
          name: 'blockPlaceholder',
        }).extend({ selectors: {} });
        type BlockPlaceholderHookDefinition =
          DefinitionOf<typeof BlockPlaceholderPluginBase>;
        export const BlockPlaceholderPlugin =
          BlockPlaceholderPluginBase.extend({ inject: {}, useHooks });
      `,
      'packages/utils/src/react/plugins/BlockPlaceholderPlugin.tsx'
    ),
    []
  );

  assert.match(
    auditPlateSchemaSource(
      `createBasePlugin({ name: 'markdown' })
        .extend(() => ({ read: () => ({}) }))`,
      'packages/markdown/src/lib/MarkdownPlugin.ts'
    )[0]?.reason ?? '',
    /found \[read\]/
  );

  assert.deepEqual(
    auditPlateSchemaSource(
      `createPlatePlugin({
        api: () => ({}),
        name: 'blockSelection',
        on: {},
        read: () => ({}),
        selectors: {},
        shortcuts: {},
        update: () => ({}),
      })
        .extend(() => ({ api: () => ({}), commands: () => [], on: {} }))
        .extend(() => ({ inject: {}, shortcuts: {}, update: () => ({}) }))
        .extend(() => ({ render: {} }))`,
      'packages/selection/src/react/BlockSelectionPlugin.tsx'
    ),
    []
  );

  for (const [source, file] of [
    [
      `createPlatePlugin({ name: 'blockMenu' }).extend(() => ({ on: {} }))`,
      'packages/selection/src/react/BlockMenuPlugin.tsx',
    ],
    [
      `createPlatePlugin({ name: 'cursorOverlay' }).extend(() => ({ on: {} }))`,
      'packages/selection/src/react/CursorOverlayPlugin.tsx',
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), []);
  }
});

test('matches opaque shared-factory stages by exact callee identity', () => {
  const owner = 'apps/www/src/registry/examples/version-history-demo.tsx';

  assert.deepEqual(
    auditPlateSchemaSource(
      `createPlatePlugin({ name: 'diff' }).extend(createExcludeDiffFragmentExtension())`,
      owner
    ),
    []
  );
  assert.match(
    auditPlateSchemaSource(
      `createPlatePlugin({ name: 'diff' }).extend(createUnrelatedExtension())`,
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
    `const codecsKey = 'codecs'; createBasePlugin({ [codecsKey]: { 'text/html': rule }, name: 'p' })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source)[0]?.reason ?? '',
      /context-bound defineCodecs/
    );
  }

  for (const source of [
    `createBasePlugin({ name: 'p', codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': rule }) })`,
    `createPlatePlugin({ name: 'p', codecs: ({ defineCodecs }) => defineCodecs(TargetPlugin, { 'text/html': rule }) })`,
    `Plugin.extend(({ defineCodecs }) => ({ codecs: defineCodecs({ 'text/html': rule }) }))`,
    `Plugin.extend(({ defineCodecs }) => ({ codecs: defineCodecs(TargetPlugin, { 'text/html': rule }) }))`,
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source), []);
  }
});

test('keeps independent production codecs in the constructor', () => {
  for (const file of [
    'packages/example/src/lib/BaseExamplePlugin.ts',
    'packages/code-block/src/lib/BaseCodeBlockPlugin.ts',
  ]) {
    assert.match(
      auditPlateSchemaSource(
        `createBasePlugin({ name: 'example' }).extend(({ defineCodecs }) => ({ codecs: defineCodecs({ 'text/html': rule }) }))`,
        file
      )[0]?.reason ?? '',
      /constructor callback/
    );
  }
  assert.deepEqual(
    auditPlateSchemaSource(
      `createBasePlugin({ name: 'example', codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': rule }) })`,
      'packages/example/src/lib/BaseExamplePlugin.ts'
    ),
    []
  );
});

test('keeps independent production fields in the constructor', () => {
  const file = 'packages/example/src/lib/BaseExamplePlugin.ts';
  const issues = auditPlateSchemaSource(
    `createBasePlugin({ name: 'example' }).extend(({ type }) => ({
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
    'packages/core/src/internal/plugin/compilePlateHtmlCodec.spec.ts';
  const productCodecOwner =
    'packages/core/src/lib/plugins/ProductCodecs.spec.ts';
  const typeOwner = 'packages/core/type-tests/base-plugin-contracts.ts';

  for (const file of [runtimeOwner, productCodecOwner, typeOwner]) {
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
      'packages/core/src/internal/plugin/other.spec.ts'
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
    'packages/core/src/internal/plugin/resolvePlugins.ts',
    'packages/core/src/lib/plugin/createBasePlugin.ts',
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
    'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx';

  assert.deepEqual(
    auditPlateSchemaSource(
      [
        `import { BaseParagraphPlugin } from 'platejs';`,
        `import { ParagraphStatic } from '@/registry/ui/paragraph-node-static';`,
        `const kit = [createBasePlugin({ component: ParagraphStatic, name: 'p' })];`,
      ].join('\n'),
      file
    ),
    []
  );

  for (const source of [
    `import { ParagraphPlugin } from 'platejs/react';`,
    `import { H1Plugin } from '@platejs/basic-nodes/react';`,
    `import { CodeDrawingElement } from '@/registry/ui/code-drawing-node';`,
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
      `createBasePlugin({ component: ParagraphStatic, name: 'p' });`,
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
      'packages/core/src/lib/plugin/createBasePlugin.typed.spec.ts'
    ),
    []
  );
});

test('allows only the exact typed negative render.node contract', () => {
  const source = [
    "createBasePlugin({ name: 'negative', render: {",
    '  // @ts-expect-error custom node components use the Plate component field',
    '  node: Component,',
    '} });',
  ].join('\n');
  const file = 'packages/core/src/lib/plugin/createBasePlugin.typed.spec.ts';

  assert.equal(
    auditPlateSchemaSource(source, file).some((issue) =>
      issue.reason.includes('root-level component')
    ),
    false
  );
  assert.equal(
    auditPlateSchemaSource(
      "createBasePlugin({ name: 'negative', render: { node: Component } });",
      file
    ).some((issue) => issue.reason.includes('root-level component')),
    true
  );
  assert.equal(
    auditPlateSchemaSource(
      source,
      'packages/core/src/lib/plugin/other.spec.ts'
    ).some((issue) => issue.reason.includes('root-level component')),
    true
  );
});

test('allows only the exact marked runtime negative render.node contract', () => {
  const source = `
    Reflect.apply(createBasePlugin, undefined, [
      {
        name: 'invalid-render-node',
        render: {
          // @plate-schema-adoption-negative-render-node
          node: () => null,
        },
      },
    ]);
  `;
  const file = 'packages/core/src/lib/plugin/createBasePlugin.spec.ts';

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
      'packages/core/src/lib/plugin/other.spec.ts'
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
    const createRuntime = createPlatePlugin as unknown as (
      definition: unknown
    ) => unknown;
    createRuntime({
      api: { label: () => 'invalid' },
      name: 'invalidApi',
    });
  `;
  const file = 'packages/core/src/react/plugin/createPlatePlugin.spec.ts';

  assert.deepEqual(auditPlateSchemaSource(source, file), []);
  assert.match(
    auditPlateSchemaSource(
      source.replace("name: 'invalidApi'", "name: 'different'"),
      file
    )[0]?.reason ?? '',
    /plugin api must be declared as a factory/
  );
  assert.match(
    auditPlateSchemaSource(
      source,
      'packages/core/src/react/plugin/other.spec.ts'
    )[0]?.reason ?? '',
    /plugin api must be declared as a factory/
  );
});

test('accepts current plugin syntax and unrelated document or Markdown AST shapes', () => {
  for (const source of [
    `createPlatePlugin({ component: Paragraph, name: 'p', type: 'paragraph', schema: { element: { content: schema.content.text() } } })`,
    `createBasePlugin({ name: 'hr', schema: { element: { void: 'block' } } })`,
    `createBasePlugin({ name: 'p', schema: { element: { ...elementSchema } } })`,
    `defineEditorExtension({ name: 'paragraph', schema: { elements: { paragraph: { content: schema.content.text() } } } })`,
    `defineEditorSchema({ id: 'app', version: 1, elements: { horizontalRule: { void: true } } })`,
    `defineEditorExtension({ name: 'dynamic', schema: { elements } })`,
    `defineEditorExtension({ name: 'spread', schema: { elements: { paragraph: { ...definition } } } })`,
    `createBasePlugin({ name: 'runtime', initialState: { enabled: true } })`,
    `ParagraphPlugin.configure(({ editor }) => ({ initialState: { editor }, on: {}, override: { plugins: {} }, render: {}, shortcuts: {} }))`,
    `ParagraphPlugin.configure(() => ({}))`,
    `createBasePlugin({ initialState: { isUrl: () => true, schemes: ['https'] }, name: 'link', schema: ({ initialState, name, own, plugins, type }) => ({ properties: [] }) })`,
    `const event = { node: { type: 'paragraph' } }`,
    `createBasePlugin({ name: 'analytics', initialState: { event: { node: { type: 'paragraph' } } } })`,
    `const rules = { emphasis: { mark: true } }`,
    `const parser = { isElement: true, isLeaf: false }`,
    `defineEditorSchema({ elements: { paragraph: { content: schema.content.text(), groups: ['block'] } } })`,
    `state.schema.element('paragraph')`,
    `createBasePlugin({ initialState: { targets: [ParagraphPlugin] }, name: 'align' })`,
    `createBasePlugin({ name: 'generic', targetPluginNames: ['p'] })`,
    `ParagraphPlugin.configure({ initialState: { topLevel: true } })`,
    `ParagraphPlugin.configure({ schema: { element: { properties: { id: property.string() } } } })`,
    `ParagraphPlugin.extend(({ editor }) => ({ initialState: { editor } }))`,
    `ParagraphPlugin.configure({ component: ParagraphElement })`,
    `createPlatePlugin({ component: ParagraphElement, name: 'p' })`,
    `createPlatePlugin({ name: 'leaf' }).extend({ render: { leaf: Leaf, aboveNodes } })`,
    `const component = editor.getPlugin(ParagraphPlugin).render.node`,
    `createBasePlugin({ name: 'link', initialState: { isUrl: () => true } })`,
    `createBasePlugin({ name: 'negative', /* @ts-expect-error runtime access */ schema: ({ editor }) => ({ editor }) })`,
    `state.schema.getElementProperty(element, colSpanHandle)`,
    `editor.read.schema.property(AdvancedMarkPlugin)`,
    `createPlateEditor(getOptions())`,
    `const configured = { plugins: [], schema: { id: 'ordinary', version: 1 } }; const { schema, ...runtimeOptions } = configured; createPlateEditor(runtimeOptions)`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; const schemaKey = 'schema'; const options = { ...base, [schemaKey]: derivedSchema }; createPlateEditor(options)`,
    `const identity = { id: 'ordinary', version: 1 }; const copy = { ...identity, id: dynamicId }; createPlateEditor({ schema: copy })`,
    `const identity = { id: 'ordinary', version: 1 }; const { id, ...copy } = identity; createPlateEditor({ schema: copy })`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; createPlateEditor({ ...base, schema: derivedSchema })`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; const override = { schema: derivedSchema }; const options = { ...base, ...override }; createPlateEditor(options)`,
    `const override = { schema: derivedSchema }; const options = { schema: { id: 'ordinary', version: 1 }, ...override }; createPlateEditor(options)`,
    `let identity = { id: 'ordinary', version: 1 }; identity = derivedSchema; createPlateEditor({ schema: identity })`,
    `let identity = derivedSchema; createPlateEditor({ schema: identity }); identity = { id: 'ordinary', version: 1 }`,
    `const options = { schema: { id: 'ordinary', version: 1 } }; options.schema = derivedSchema; createPlateEditor(options)`,
    `let options = { schema: { id: 'ordinary', version: 1 } }; options = { plugins: [] }; createPlateEditor(options)`,
    `const options = buildOptions(); createPlateEditor(options); options.schema = { id: 'ordinary', version: 1 }`,
    `let options = { plugins: [] }; createPlateEditor(options); options = { schema: { id: 'ordinary', version: 1 } }`,
    `let options = { plugins: [] }; function helper() { const options = { schema: { id: 'ordinary', version: 1 } }; return options } createPlateEditor(options)`,
    `const schema = { id: 'ordinary', version: 1 }; function build(schema) { createPlateEditor({ schema }) }`,
    `function helper(createPlateEditor) { createPlateEditor({ schema: { id: 'ordinary', version: 1 } }) }`,
    `const options = {}; let alias = options; alias = {}; alias.schema = { id: 'ordinary', version: 1 }; createPlateEditor(options)`,
    `let key = 'schema'; key = 'notSchema'; createPlateEditor({ [key]: { id: 'ordinary', version: 1 } })`,
    `let key = 'notSchema'; createPlateEditor({ [key]: { id: 'ordinary', version: 1 } }); key = 'schema'`,
  ]) {
    expectAccepted(source);
  }
});

test('reserves package configure calls for reviewed consumer installation owners', () => {
  for (const source of [
    `createBasePlugin({ name: 'example' }).configure({ initialState: { enabled: true } })`,
    `createBasePlugin({ name: 'example' }).configurePlugin(OtherPlugin, { initialState: { enabled: true } })`,
    `createBasePlugin({ name: 'example' }).configurePlugin?.(OtherPlugin, { initialState: { enabled: true } })`,
    `createBasePlugin({ name: 'example' }).extendPlugin(OtherPlugin, { shortcuts: {} })`,
    `createBasePlugin({ name: 'example' })?.extendPlugin(OtherPlugin, { shortcuts: {} })`,
    `createBasePlugin({ name: 'example' }).clone()`,
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
      `export const ExamplePlugin = createBasePlugin({ name: 'example', initialState: { enabled: true } });`,
      'packages/example/src/ExamplePlugin.ts',
    ],
    [
      `ExamplePlugin.configure({ initialState: { enabled: true } })`,
      'packages/example/src/ExamplePlugin.spec.ts',
    ],
    [
      `ExamplePlugin.configure({ initialState: { enabled: true } })`,
      'packages/core/src/lib/plugins/getCorePlugins.ts',
    ],
    [
      `
        createBasePlugin({ name: 'react' }).extend(plateReactExtension);
        ExamplePlugin.configure({ initialState: { enabled: true } });
      `,
      'packages/core/src/react/editor/getPlateCorePlugins.ts',
    ],
    [
      `ExamplePlugin.configure({ initialState: { enabled: true } })`,
      'apps/www/src/registry/components/editor/plugins/example-kit.ts',
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
    `createBaseEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `createPlateEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `createStaticEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `extendBaseEditor(editor, { schema: { id: 'ordinary', version: 1 } })`,
    `extendPlateEditor(editor, { schema: { id: 'ordinary', version: 1 } })`,
    `usePlateEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `usePlateViewEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `const createEditor = createPlateEditor; createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `let createEditor; createEditor = createPlateEditor; createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `Plate.createPlateEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `const { createPlateEditor: createEditor } = Plate; createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `import { createPlateEditor as createEditor } from '@platejs/core/react'; createEditor({ schema: { id: 'ordinary', version: 1 } })`,
    `createPlateEditor?.({ schema: { id: 'ordinary', version: 1 } })`,
    `const identity = { id: 'ordinary', version: 1 }; createPlateEditor({ schema: identity })`,
    `let identity = { id: 'ordinary', version: 1 }; createPlateEditor({ schema: identity })`,
    `var identity = { id: 'ordinary', version: 1 }; createPlateEditor({ schema: identity })`,
    `let identity; identity = { id: 'ordinary', version: 1 }; createPlateEditor({ schema: identity })`,
    `let identity = { id: 'ordinary', version: 1 }; const alias = identity; createPlateEditor({ schema: alias })`,
    `const identities = { document: { id: 'ordinary', version: 1 } }; createPlateEditor({ schema: identities.document })`,
    `const identities = { document: { id: 'ordinary', version: 1 } }; const alias = identities; createPlateEditor({ schema: alias.document })`,
    `const identities = { document: { id: 'ordinary', version: 1 } }; const { document: identity } = identities; createPlateEditor({ schema: identity })`,
    `const identities = []; identities[0] = { id: 'ordinary', version: 1 }; const [identity] = identities; createPlateEditor({ schema: identity })`,
    `const identities = [derived, { id: 'ordinary', version: 1 }]; const [, ...rest] = identities; createPlateEditor({ schema: rest[0] })`,
    `const key = 'schema'; createPlateEditor({ [key]: { id: 'ordinary', version: 1 } })`,
    `let key; key = 'schema'; createPlateEditor({ [key]: { id: 'ordinary', version: 1 } })`,
    `const keys = { schema: 'schema' }; createPlateEditor({ [keys.schema]: { id: 'ordinary', version: 1 } })`,
    `const options = { schema: { id: 'ordinary', version: 1 } }; createPlateEditor(options)`,
    `let options; options = { schema: { id: 'ordinary', version: 1 } }; createPlateEditor(options)`,
    `const options = { schema: { id: 'ordinary', version: 1 } }; const alias = options; createPlateEditor(alias)`,
    `const config = { editor: { schema: { id: 'ordinary', version: 1 } } }; createPlateEditor(config.editor)`,
    `const slot = 'editor'; const config = { editor: { schema: { id: 'ordinary', version: 1 } } }; createPlateEditor(config[slot])`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; createPlateEditor({ ...base })`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; const options = { ...base }; createPlateEditor(options)`,
    `const key = getSchemaKey(); const options = { [key]: { id: 'ordinary', version: 1 } }; createPlateEditor(options)`,
    `const configured = { plugins: [], schema: { id: 'ordinary', version: 1 } }; const { plugins, ...runtimeOptions } = configured; createPlateEditor(runtimeOptions)`,
    `const identity = { id: 'ordinary', version: 1 }; createPlateEditor({ schema: { ...identity } })`,
    `const identity = { id: 'ordinary', version: 1 }; const copy = { ...identity }; createPlateEditor({ schema: copy })`,
    `const identity = { id: 'ordinary', version: 1 }; const { ...copy } = identity; createPlateEditor({ schema: copy })`,
    `const identity = { id: 'ordinary', version: 1 }; const copy = { ...identity, id: 'other' }; createPlateEditor({ schema: copy })`,
    `const base = { schema: { id: 'ordinary', version: 1 } }; createPlateEditor({ schema: derivedSchema, ...base })`,
    `createPlateEditor({ ...{ schema: { id: 'ordinary', version: 1 } } })`,
    `const base = { schema: derivedSchema }; const override = { schema: { id: 'ordinary', version: 1 } }; const options = { ...base, ...override }; createPlateEditor(options)`,
    `let identity = derivedSchema; identity = { id: 'ordinary', version: 1 }; createPlateEditor({ schema: identity })`,
    `let identity = { id: 'ordinary', version: 1 }; createPlateEditor({ schema: identity }); identity = derivedSchema`,
    `let identity = { id: 'ordinary', version: 1 }; const options = { schema: identity }; identity = derivedSchema; createPlateEditor(options)`,
    `const options = { schema: derivedSchema }; options.schema = { id: 'ordinary', version: 1 }; createPlateEditor(options)`,
    `let options = { plugins: [] }; options = { schema: { id: 'ordinary', version: 1 } }; createPlateEditor(options)`,
    `let options = { schema: { id: 'ordinary', version: 1 } }; createPlateEditor(options); options = { plugins: [] }`,
    `let options = {}; options.schema ??= { id: 'ordinary', version: 1 }; createPlateEditor(options)`,
    `const options = {}; const key = getSchemaKey(); options[key] = { id: 'ordinary', version: 1 }; createPlateEditor(options)`,
    `const options = {}; Object.assign(options, { schema: { id: 'ordinary', version: 1 } }); createPlateEditor(options)`,
    `const options = {}; const key = getSchemaKey(); Object.assign(options, { [key]: { id: 'ordinary', version: 1 } }); createPlateEditor(options)`,
    `const options = {}; Object.assign(options, flag ? { schema: { id: 'ordinary', version: 1 } } : {}); createPlateEditor(options)`,
    `const source = { schema: { id: 'ordinary', version: 1 } }; const options = {}; Object.assign(options, source); createPlateEditor(options)`,
    `const source = { schema: { id: 'ordinary', version: 1 } }; const options = { ...source }; createPlateEditor(options)`,
    `const options = {}; const alias = options; alias.schema = { id: 'ordinary', version: 1 }; createPlateEditor(options)`,
    `const options = {}; const alias = options; Object.assign(alias, { schema: { id: 'ordinary', version: 1 } }); createPlateEditor(options)`,
    `const config = { editor: {} }; const slot = 'editor'; Object.assign(config[slot], { schema: { id: 'ordinary', version: 1 } }); createPlateEditor(config.editor)`,
    `createPlateEditor(Object.assign({}, { schema: { id: 'ordinary', version: 1 } }))`,
    `createPlateEditor(flag ? { schema: { id: 'ordinary', version: 1 } } : { plugins: [] })`,
    `createPlateEditor({ schema: flag && { id: 'ordinary', version: 1 } })`,
    `let options = { schema: { id: 'ordinary', version: 1 } }; function helper() { const options = { plugins: [] }; return options } createPlateEditor(options)`,
    `let key = 'notSchema'; key = 'schema'; createPlateEditor({ [key]: { id: 'ordinary', version: 1 } })`,
    `let key = 'schema'; createPlateEditor({ [key]: { id: 'ordinary', version: 1 } }); key = 'notSchema'`,
    `const identity = { id: 'ordinary', version: 1 } as const; usePlateViewEditor({ schema: identity })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source, 'packages/example/src/editor.spec.ts')[0]
        ?.reason ?? '',
      /must use derived schema identity/
    );
  }
});

test('ignores same-named constructors imported from non-Plate modules', () => {
  assert.deepEqual(
    auditPlateSchemaSource(
      `import { createPlateEditor } from 'some-editor';
       createPlateEditor({ schema: { id: 'ordinary', version: 1 } });`,
      'packages/example/src/editor.ts'
    ),
    []
  );
});

test('rejects local named lineage on ordinary app editor construction', () => {
  assert.match(
    auditPlateSchemaSource(
      `createPlateEditor({ schema: { id: 'ordinary-app', version: 1 } })`,
      'apps/www/src/example.ts'
    )[0]?.reason ?? '',
    /must use derived schema identity/
  );
});

test('owns named-lineage policy for documentation code fences', () => {
  const fence = (code) => `\`\`\`tsx\n${code}\n\`\`\``;

  assert.match(
    auditNamedSchemaLineageDocument(
      fence(
        `createPlateEditor({ schema: { id: 'ordinary-doc', version: 1 } })`
      ),
      'content/docs/(guides)/ordinary.mdx'
    )[0]?.reason ?? '',
    /must use derived schema identity/
  );

  assert.match(
    auditNamedSchemaLineageDocument(
      fence(
        `const createEditor = Plate.createPlateEditor; createEditor({ schema: { id: 'ordinary-doc', version: 1 } })`
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
    ['packages/yjs/README.md', 'yjs-example', 1],
  ]) {
    assert.deepEqual(
      auditNamedSchemaLineageDocument(
        fence(
          `createPlateEditor({ schema: { id: '${id}', version: ${version} } })`
        ),
        file
      ),
      []
    );
  }

  assert.notDeepEqual(
    auditNamedSchemaLineageDocument(
      fence(`createPlateEditor({ schema: { id: 'yjs-example', version: 1 } })`),
      'content/docs/(guides)/editor.mdx'
    ),
    []
  );
  assert.match(
    auditNamedSchemaLineageDocument(
      fence(`createPlateEditor()`),
      'content/docs/(guides)/editor.mdx'
    )[0]?.reason ?? '',
    /allowlist expects 1 acme-document@3/
  );
});

test('accepts reviewed named lineage without banning schema declarations', () => {
  for (const [source, file] of [
    [
      `createPlateEditor({ schema: importedLineage })`,
      'packages/yjs/test/schema-identity-contract.spec.ts',
    ],
    [
      `const TestSchema = { id: 'plate:yjs-api-test', version: 1 } as const;
       createBaseEditor({ schema: TestSchema });
       createBaseEditor({ schema: TestSchema });
       createBaseEditor({ schema: TestSchema });`,
      'packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts',
    ],
    [
      `defineEditorSchema({ id: 'document', version: 1, elements: { paragraph: { content: schema.content.text() } } })`,
      'packages/plite/test/named-lineage-guard.spec.ts',
    ],
    [
      `createBasePlugin({ name: 'paragraph', schema: { element: { content: schema.content.text(), properties: { id: property.string(), version: property.number() } } } })`,
      'packages/example/src/plugin.spec.ts',
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), []);
  }
});

test('allows only the exact reviewed raw-query count in an owning file', () => {
  expectRejected(`editor.read.schema.property({ key, placement, type })`);

  const htmlOwner = 'packages/core/src/lib/plugins/html/HtmlPlugin.ts';
  const htmlQueries = new Array(5)
    .fill(
      `state.schema.property({ key: property.key, placement: property.property.placement, type })`
    )
    .join(';');

  assert.deepEqual(auditPlateSchemaSource(htmlQueries, htmlOwner), []);
  assert.match(
    auditPlateSchemaSource(
      `${htmlQueries}; state.schema.property({ id, kind: 'schema-property' })`,
      htmlOwner
    )[0]?.reason ?? '',
    /outside the intentional runtime/
  );
});
