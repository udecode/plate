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
    `createBasePlugin({ key: 'p', node: { element: true } })`,
    `ParagraphPlugin.configure({ node: { type: 'p' } })`,
    `createBasePlugin({ key: 'p', node: { component: Paragraph } })`,
    `createBasePlugin({ key: 'p', schema: { mark: true } })`,
    `const schemaKey = 'schema'; createBasePlugin({ key: 'p', [schemaKey]: { mark: true } })`,
    `let schemaKey; schemaKey = 'schema'; createBasePlugin({ key: 'p', [schemaKey]: { element: {} } })`,
    `const schemaKey = 'schema'; function helper() { const schemaKey = 'notSchema'; return schemaKey } createBasePlugin({ key: 'p', [schemaKey]: { element: {} } })`,
    `createBasePlugin({ key: 'p', schema: () => ({ mark: true }) })`,
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
    `createBasePlugin({ key: 'p', schema: ({ editor }) => ({ editor }) })`,
    `createBasePlugin({ config: { schemes: ['https'] }, key: 'link' })`,
    `const configKey = 'config'; createPlatePlugin({ [configKey]: {}, key: 'link' })`,
    `ParagraphPlugin.configure({ config: { topLevel: true } })`,
    `createBasePlugin({ key: 'p', schema: { element: { groups: ['block'] } } })`,
    `createBasePlugin({ key: 'p', schema: { element: {} } })`,
    `createBasePlugin({ key: 'link', schema: { element: { inline: true } } })`,
    `defineEditorExtension({ name: 'paragraph', schema: { elements: { paragraph: {} } } })`,
    `defineEditorSchema({ id: 'app', version: 1, elements: { paragraph: {} } })`,
    `const elementsKey = 'elements'; defineEditorSchema({ id: 'app', version: 1, [elementsKey]: { paragraph: {} } })`,
    `const schemaKey = 'schema'; const elementsKey = 'elements'; defineEditorExtension({ name: 'paragraph', [schemaKey]: { [elementsKey]: { paragraph: {} } } })`,
    `createBasePlugin<ParagraphConfig>({ key: 'p', schema: { element: { content: schema.content.text() } } })`,
    `createPlatePlugin<LinkConfig>({ key: 'link', schema: { element: { content: schema.content.text(), inline: true } } })`,
    `createBasePlugin({ key: 'p', schema: { element: { content: schema.content.type(KEYS.p) } } })`,
    `IndentPlugin.configure({ initialState: { targetPluginKeys: ['p'] } })`,
    `ParagraphPlugin.configure(() => ({ schema: { element: {} } }))`,
    `ParagraphPlugin.configure(() => { return { type: 'other' } })`,
    `const badRuntimeConfig = { schema: { element: {} } }; ParagraphPlugin.configure(() => badRuntimeConfig)`,
    `// @ts-expect-error deleted shape\ncreateBasePlugin({ key: 'p', node: { element: true } })`,
    `// @ts-expect-error deleted shape\ncreateBasePlugin({ key: 'p', schema: { mark: true } })`,
    `node.element`,
    `node.mark`,
    `plugin.node.element`,
    `plugin.node.mark`,
    `node.component`,
    `plugin.node.component`,
    `createBasePlugin({ key: 'p', render: { node: ParagraphElement } })`,
    `createPlatePlugin({ key: 'p' }).extend({ render: { node: ParagraphElement } })`,
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
    `createBasePlugin({ api: {}, extension: {}, handlers: {}, key: 'p', read: {}, render: { leaf: Leaf }, selectors: {}, update: () => ({}) })`,
    `createPlatePlugin({ component: ParagraphElement, handlers: {}, key: 'p' })`,
    `createBasePlugin({ key: 'p', ...behavior })`,
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source), []);
  }

  assert.match(
    auditPlateSchemaSource(
      `createBasePlugin({ component: ParagraphElement, key: 'p' })`
    )[0]?.reason ?? '',
    /stays renderer-neutral/
  );

  assert.match(
    auditPlateSchemaSource(
      `const componentKey = 'component'; createBasePlugin({ [componentKey]: ParagraphElement, key: 'p' })`
    )[0]?.reason ?? '',
    /stays renderer-neutral/
  );

  assert.match(
    auditPlateSchemaSource(`
      const createPlugin = createBasePlugin;
      createPlugin({ component: ParagraphElement, key: 'p' });
    `)[0]?.reason ?? '',
    /stays renderer-neutral/
  );

  assert.match(
    auditPlateSchemaSource(`
      Core.createBasePlugin({
        codecs: { 'text/html': rule },
        key: 'p',
      });
    `)[0]?.reason ?? '',
    /context-bound defineCodecs/
  );

  assert.deepEqual(
    auditPlateSchemaSource(
      `(createBasePlugin as any)({ codecs: {}, key: 'negative' })`,
      'packages/core/src/lib/plugin/createBasePlugin.spec.ts'
    ),
    []
  );
});

test('rejects unaudited direct constructor extend stages', () => {
  assert.match(
    auditPlateSchemaSource(
      `createBasePlugin({ key: 'example' }).extend(() => ({ api: {} }))`,
      'packages/example/src/ExamplePlugin.ts'
    )[0]?.reason ?? '',
    /not an audited constructor-inaccessible shared factory, resolved consumer configuration, or earlier-stage type dependency/
  );

  assert.deepEqual(
    auditPlateSchemaSource(
      `Plugin.extend(() => ({ api: {}, handlers: {} }))`,
      'packages/example/src/ExamplePlugin.ts'
    ),
    []
  );
});

test('rejects unaudited extend stages through local descriptor bindings', () => {
  for (const source of [
    `
      export const BaseExamplePlugin = createBasePlugin({ key: 'example' });
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      export const BaseExamplePlugin = createBasePlugin({ key: 'example' });
      export const ExamplePlugin = BaseExamplePlugin['extend'](() => ({
        api: {},
      }));
    `,
    `
      export const BaseExamplePlugin = createBasePlugin({ key: 'example' });
      const ExamplePluginAlias = BaseExamplePlugin;
      export const ExamplePlugin = ExamplePluginAlias.extend(() => ({
        api: {},
      }));
    `,
    `
      let BaseExamplePlugin;
      BaseExamplePlugin = createBasePlugin({ key: 'example' });
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      import { createBasePlugin as createPlugin } from '@platejs/core';
      export const BaseExamplePlugin = createPlugin({ key: 'example' });
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const createPlugin = createBasePlugin;
      export const ExamplePlugin = createPlugin({ key: 'example' }).extend(
        () => ({ api: {} })
      );
    `,
    `
      let createPlugin;
      createPlugin = createBasePlugin;
      export const ExamplePlugin = createPlugin({ key: 'example' }).extend(
        () => ({ api: {} })
      );
    `,
    `
      import * as Core from '@platejs/core';
      export const ExamplePlugin = Core.createBasePlugin({
        key: 'example',
      }).extend(() => ({ api: {} }));
    `,
    `
      const { createBasePlugin: createPlugin } = Core;
      export const ExamplePlugin = createPlugin({ key: 'example' }).extend(
        () => ({ api: {} })
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
        export const BaseExamplePlugin = createBasePlugin({ key: 'example' });
        export const ExamplePlugin = BaseExamplePlugin[method](() => ({
          api: {},
        }));
      `,
      'packages/example/src/ExamplePlugin.ts'
    )[0]?.reason ?? '',
    /cannot bypass the exact stage audit/
  );

  for (const optionalCall of [
    `BaseExamplePlugin?.extend(() => ({ api: {} }))`,
    `BaseExamplePlugin.extend?.(() => ({ api: {} }))`,
    `BaseExamplePlugin?.['extend'](() => ({ api: {} }))`,
  ]) {
    assert.match(
      auditPlateSchemaSource(
        `
          export const BaseExamplePlugin = createBasePlugin({ key: 'example' });
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
      export const ExamplePlugin = extractedExtend(() => ({ api: {} }));
    `,
    `
      const { extend } = BaseExamplePlugin;
      export const ExamplePlugin = extend(() => ({ api: {} }));
    `,
    `
      const method = 'extend';
      const { [method]: extractedExtend } = BaseExamplePlugin;
      export const ExamplePlugin = extractedExtend(() => ({ api: {} }));
    `,
    `
      const { key, ...pluginMethods } = BaseExamplePlugin;
      export const ExamplePlugin = pluginMethods.extend(() => ({ api: {} }));
    `,
    `
      let extractedExtend;
      extractedExtend = BaseExamplePlugin['extend'];
      export const ExamplePlugin = extractedExtend(() => ({ api: {} }));
    `,
  ]) {
    assert.match(
      auditPlateSchemaSource(
        `
          export const BaseExamplePlugin = createBasePlugin({ key: 'example' });
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
          export const BaseExamplePlugin = createBasePlugin({ key: 'example' });
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
        export const BaseTagPluginOwner = createBasePlugin({ key: 'tag' });
        export const BaseTagPlugin = BaseTagPluginOwner.extend(() => ({
          read: {},
        }));
      `,
      'packages/tag/src/lib/BaseTagPlugin.ts'
    ),
    []
  );

  for (const source of [
    `
      const owners = {
        BaseExamplePlugin: createBasePlugin({ key: 'example' }),
      };
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ key: 'example' });
      const owners = { BaseExamplePlugin };
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ key: 'example' });
      const owners = {};
      owners.BaseExamplePlugin = BaseExamplePlugin;
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ key: 'example' });
      const owners = { BaseExamplePlugin };
      const alias = owners;
      export const ExamplePlugin = alias.BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ key: 'example' });
      const owners = { BaseExamplePlugin };
      const { BaseExamplePlugin: alias } = owners;
      export const ExamplePlugin = alias.extend(() => ({ api: {} }));
    `,
    `
      const owners = [createBasePlugin({ key: 'example' })];
      const alias = owners;
      export const ExamplePlugin = alias[0].extend(() => ({ api: {} }));
    `,
    `
      const owners = [createBasePlugin({ key: 'example' })];
      const [BaseExamplePlugin] = owners;
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const owners = [OtherPlugin, createBasePlugin({ key: 'example' })];
      const [, ...rest] = owners;
      export const ExamplePlugin = rest[0].extend(() => ({ api: {} }));
    `,
    `
      const owners = {
        nested: { BaseExamplePlugin: createBasePlugin({ key: 'example' }) },
      };
      const { ['nested']: { BaseExamplePlugin = OtherPlugin } } = owners;
      export const ExamplePlugin = BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const BaseExamplePlugin = createBasePlugin({ key: 'example' });
      const owners = { BaseExamplePlugin };
      const aliases = { ...owners };
      export const ExamplePlugin = aliases.BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const owners = flag
        ? { BaseExamplePlugin: createBasePlugin({ key: 'example' }) }
        : {};
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: {},
      }));
    `,
    `
      const key = 'BaseExamplePlugin';
      const owners = {};
      owners[key] = createBasePlugin({ key: 'example' });
      export const ExamplePlugin = owners.BaseExamplePlugin.extend(() => ({
        api: {},
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
        const InternalRootPlugin = createBasePlugin({ key: 'root' });
        snapshotSources({ internalRoot: InternalRootPlugin });
      `,
      'packages/core/src/lib/editor/withPlite.ts'
    ),
    []
  );

  assert.equal(
    auditPlateSchemaSource(
      `
        const BaseExamplePlugin = createBasePlugin({ key: 'example' });
        const owners = { BaseExamplePlugin };
        const pluginKey = 'BaseExamplePlugin';
        const aliases = { ...owners, [pluginKey]: ExternalPlugin };
        export const ExamplePlugin = aliases.BaseExamplePlugin.extend(() => ({
          api: {},
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
    const ExamplePluginDefinition = createBasePlugin({ key: 'example' });
    export const ExamplePlugin = ExamplePluginDefinition.extend(() => ({
      api: {},
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
        export const ExamplePluginBase = createBasePlugin({ key: 'example' });
        export const ExamplePlugin = ExamplePluginBase.extend(() => ({
          api: {},
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
  const source = `createBasePlugin({ key: 'example' }).extend(() => ({ api: {} }))`;

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
      `const BaseExamplePlugin = createBasePlugin({ key: 'example' }); export function adapt(BaseExamplePlugin) { return BaseExamplePlugin.extend(() => ({ api: {} })); }`,
      'packages/example/src/lib/BaseExamplePlugin.ts'
    ),
    []
  );
});

test('allows only exact audited production extend stages at their owner path', () => {
  const exact = `
    createBasePlugin({ key: 'code', update: {} }).extend({
      shortcuts: {},
    });
    createBasePlugin({ key: 'highlight', decorate: {}, extension: {} });
  `;
  const owner = 'packages/code-block/src/lib/BaseCodeBlockPlugin.ts';

  assert.deepEqual(auditPlateSchemaSource(exact, owner), []);
  assert.match(
    auditPlateSchemaSource(
      `
        createBasePlugin({ key: 'code', update: {} })
          .extend({ shortcuts: {} });
        createBasePlugin({ key: 'highlight', decorate: {}, extension: {} })
          .extend(() => ({ api: {} }));
      `,
      owner
    )[0]?.reason ?? '',
    /found \[api\]/
  );

  for (const [source, file, expected] of [
    [
      `createBasePlugin({ key: 'code' }).extend({
        rules: {},
        update: {},
      }).extend({ shortcuts: {} }).extend(() => ({ render: {} }))`,
      owner,
      /\[rules, update\]/,
    ],
    [exact, 'packages/example/src/BaseCodeBlockPlugin.ts', /\[shortcuts\]/],
  ]) {
    const issue = auditPlateSchemaSource(source, file).find((item) =>
      item.reason.includes('direct constructor .extend() chain')
    );

    assert.ok(issue, file);
    assert.match(issue.reason, expected);
  }

  assert.match(
    auditPlateSchemaSource(`createBasePlugin({ key: 'code' })`, owner).at(-1)
      ?.reason ?? '',
    /expects exact 1 audited chain but found 0/
  );

  assert.match(
    auditPlateSchemaSource(
      `
        createBasePlugin({ key: 'code' }).extend({ shortcuts: {} });
        createBasePlugin({ key: 'duplicate' }).extend({ shortcuts: {} });
      `,
      owner
    ).at(-1)?.reason ?? '',
    /found 2; signatures did not match/
  );

  for (const file of [
    'packages/core/src/lib/plugins/affinity/AffinityPlugin.ts',
    'packages/core/src/lib/plugins/dom/DOMPlugin.ts',
    'packages/core/src/lib/plugins/override/OverridePlugin.ts',
  ]) {
    assert.deepEqual(
      auditPlateSchemaSource(
        `createBasePlugin({ key: 'owner', update: {} }).extend(() => ({
          extension: {},
        }))`,
        file
      ),
      []
    );
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `createBasePlugin({ key: 'indent', schema: {}, update: {} }).extend(
        ({ defineCodecs }) => ({
          codecs: defineCodecs({}),
          shortcuts: {},
        })
      )`,
      'packages/indent/src/lib/BaseIndentPlugin.ts'
    ),
    []
  );
  assert.deepEqual(
    auditPlateSchemaSource(
      `createBasePlugin({ key: 'column', update: {} }).extend({
        shortcuts: {},
      })`,
      'packages/layout/src/lib/BaseColumnPlugin.ts'
    ),
    []
  );

  const listOwner = 'packages/list/src/lib/BaseListPlugin.ts';
  const listStages = `createBasePlugin({ key: 'list' })
    .extend(() => ({ override: {}, update: {} }))
    .extend(() => ({ extension: {} }))`;

  assert.deepEqual(auditPlateSchemaSource(listStages, listOwner), []);
  assert.match(
    auditPlateSchemaSource(
      `createBasePlugin({ key: 'list' })
        .extend(() => ({ override: {} }))
        .extend(() => ({ update: {} }))
        .extend(() => ({ extension: {} }))`,
      listOwner
    )[0]?.reason ?? '',
    /\[override\] -> \[update\] -> \[extension\]/
  );

  for (const [file, source] of [
    [
      'packages/list-classic/src/lib/BaseListPlugin.ts',
      `createBasePlugin({ key: 'list' })
        .extend(() => ({ read: {} }))
        .extend(() => ({ update: {} }))
        .extend(() => ({ extension: {} }))`,
    ],
    [
      'packages/link/src/lib/BaseLinkPlugin.ts',
      `createBasePlugin({ key: 'link' })
        .extend(() => ({ update: {} }))
        .extend(() => ({ extension: {} }))`,
    ],
    [
      'packages/suggestion/src/lib/BaseSuggestionPlugin.ts',
      `createBasePlugin({ key: 'suggestion' })
        .extend(() => ({ read: {} }))
        .extend(() => ({ update: {} }))
        .extend(() => ({ extension: {} }))`,
    ],
    [
      'packages/ai/src/react/AIChatPlugin.ts',
      `createPlatePlugin({ key: 'aiChat' })
        .extend(() => ({ api: {}, read: {}, selectors: {}, update: {} }))
        .extend(() => ({ extension: {} }))`,
    ],
    [
      'packages/table/src/lib/BaseTablePlugin.ts',
      `createBasePlugin({ key: 'table' })
        .extend(() => ({ api: {} }))
        .extend(() => ({ api: {}, read: {} }))
        .extend(() => ({ read: {} }))
        .extend(() => ({ read: {} }))
        .extend(() => ({ api: {}, read: {} }))
        .extend(() => ({ update: {} }))
        .extend(() => ({ extension: {}, update: {} }))`,
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), [], file);
  }

  assert.deepEqual(
    auditPlateSchemaSource(
      `createPlatePlugin({
        api: {},
        extension: {},
        handlers: {},
        key: 'blockSelection',
        read: {},
        selectors: {},
        shortcuts: {},
        update: {},
      })
        .extend(() => ({ api: {}, extension: {} }))
        .extend(() => ({ inject: {}, shortcuts: {}, update: {} }))
        .extend(() => ({ render: {} }))`,
      'packages/selection/src/react/BlockSelectionPlugin.tsx'
    ),
    []
  );
});

test('requires context-bound codec declarations', () => {
  for (const source of [
    `Plugin.extend(() => ({ codecs: { 'text/html': rule } }))`,
    `const codecsKey = 'codecs'; Plugin.extend(() => ({ [codecsKey]: { 'text/html': rule } }))`,
    `Plugin.extend?.(() => ({ codecs: { 'text/html': rule } }))`,
    `Plugin?.extend(() => ({ codecs: { 'text/html': rule } }))`,
    `Plugin.extend({ codecs: productCodecs })`,
    `const codecsKey = 'codecs'; createBasePlugin({ [codecsKey]: { 'text/html': rule }, key: 'p' })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source)[0]?.reason ?? '',
      /context-bound defineCodecs/
    );
  }

  for (const source of [
    `createBasePlugin({ key: 'p', codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': rule }) })`,
    `createPlatePlugin({ key: 'p', codecs: ({ defineCodecs }) => defineCodecs(TargetPlugin, { 'text/html': rule }) })`,
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
        `createBasePlugin({ key: 'example' }).extend(({ defineCodecs }) => ({ codecs: defineCodecs({ 'text/html': rule }) }))`,
        file
      )[0]?.reason ?? '',
      /constructor callback/
    );
  }
  assert.deepEqual(
    auditPlateSchemaSource(
      `createBasePlugin({ key: 'example', codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': rule }) })`,
      'packages/example/src/lib/BaseExamplePlugin.ts'
    ),
    []
  );
});

test('keeps independent production fields in the constructor', () => {
  const file = 'packages/example/src/lib/BaseExamplePlugin.ts';
  const issues = auditPlateSchemaSource(
    `createBasePlugin({ key: 'example' }).extend(({ type }) => ({
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

test('keeps Base and static modules out of the React plugin layer', () => {
  const file =
    'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx';

  assert.deepEqual(
    auditPlateSchemaSource(
      [
        `import { BaseParagraphPlugin } from 'platejs';`,
        `import { ParagraphStatic } from '@/registry/ui/paragraph-node-static';`,
        `const kit = [BaseParagraphPlugin.configure({ component: ParagraphStatic })];`,
      ].join('\n'),
      file
    ),
    []
  );

  for (const source of [
    `import { toPlatePlugin } from '@platejs/core/react';`,
    `import { ParagraphPlugin } from 'platejs/react';`,
    `import { H1Plugin } from '@platejs/basic-nodes/react';`,
    `import { CodeDrawingElement } from '@/registry/ui/code-drawing-node';`,
    `toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphStatic });`,
  ]) {
    assert.equal(
      auditPlateSchemaSource(source, file).some((issue) =>
        issue.reason.includes('Base/static')
      ),
      true
    );
  }
});

test('keeps Base constructors renderer-neutral', () => {
  assert.equal(
    auditPlateSchemaSource(
      `createBasePlugin({ component: ParagraphStatic, key: 'p' });`,
      'packages/example/src/lib/BaseParagraphPlugin.ts'
    ).some((issue) => issue.reason.includes('renderer-neutral')),
    true
  );
  assert.deepEqual(
    auditPlateSchemaSource(
      `BaseParagraphPlugin.configure({ component: ParagraphStatic });`,
      'apps/www/src/registry/components/editor/plugins/basic-blocks-base-kit.tsx'
    ),
    []
  );
});

test('allows only the exact typed negative render.node contract', () => {
  const source = [
    '// @ts-expect-error React extension config must be applied before consumer configure',
    'toPlatePlugin(ConfiguredBasePlugin, { render: { node: Component } });',
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
      'toPlatePlugin(ConfiguredBasePlugin, { render: { node: Component } });',
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

test('accepts current plugin syntax and unrelated document or Markdown AST shapes', () => {
  for (const source of [
    `createPlatePlugin({ component: Paragraph, key: 'p', type: 'paragraph', schema: { element: { content: schema.content.text() } } })`,
    `createBasePlugin({ key: 'hr', schema: { element: { void: 'block' } } })`,
    `createBasePlugin({ key: 'p', schema: { element: { ...elementSchema } } })`,
    `defineEditorExtension({ name: 'paragraph', schema: { elements: { paragraph: { content: schema.content.text() } } } })`,
    `defineEditorSchema({ id: 'app', version: 1, elements: { horizontalRule: { void: true } } })`,
    `defineEditorExtension({ name: 'dynamic', schema: { elements } })`,
    `defineEditorExtension({ name: 'spread', schema: { elements: { paragraph: { ...definition } } } })`,
    `createBasePlugin<RuntimeConfig>({ key: 'runtime', initialState: { enabled: true } })`,
    `ParagraphPlugin.configure(({ editor }) => ({ initialState: { editor }, handlers: {}, override: { plugins: {} }, render: {}, shortcuts: {} }))`,
    `ParagraphPlugin.configure(() => ({}))`,
    `createBasePlugin({ initialState: { isUrl: () => true, schemes: ['https'] }, key: 'link', schema: ({ initialState, key, own, plugins, type }) => ({ properties: [] }) })`,
    `const event = { node: { type: 'paragraph' } }`,
    `createBasePlugin({ key: 'analytics', initialState: { event: { node: { type: 'paragraph' } } } })`,
    `const rules = { emphasis: { mark: true } }`,
    `const parser = { isElement: true, isLeaf: false }`,
    `defineEditorSchema({ elements: { paragraph: { content: schema.content.text(), groups: ['block'] } } })`,
    `state.schema.element('paragraph')`,
    `createBasePlugin({ initialState: { targets: [ParagraphPlugin] }, key: 'align' })`,
    `createBasePlugin({ key: 'generic', targetPluginKeys: ['p'] })`,
    `ParagraphPlugin.configure({ initialState: { topLevel: true } })`,
    `ParagraphPlugin.configure({ schema: { element: { properties: { id: property.string() } } } })`,
    `ParagraphPlugin.extend(({ editor }) => ({ initialState: { editor } }))`,
    `ParagraphPlugin.configure({ component: ParagraphElement })`,
    `createPlatePlugin({ component: ParagraphElement, key: 'p' })`,
    `createPlatePlugin({ key: 'leaf' }).extend({ render: { leaf: Leaf, aboveNodes } })`,
    `const component = editor.getPlugin(ParagraphPlugin).render.node`,
    `createBasePlugin({ key: 'link', initialState: { isUrl: () => true } })`,
    `createBasePlugin({ key: 'negative', /* @ts-expect-error runtime access */ schema: ({ editor }) => ({ editor }) })`,
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
    `createBasePlugin({ key: 'example' }).configure({ initialState: { enabled: true } })`,
    `createBasePlugin({ key: 'example' }).configurePlugin(OtherPlugin, { initialState: { enabled: true } })`,
    `createBasePlugin({ key: 'example' }).configurePlugin?.(OtherPlugin, { initialState: { enabled: true } })`,
    `createBasePlugin({ key: 'example' }).extendPlugin(OtherPlugin, { shortcuts: {} })`,
    `createBasePlugin({ key: 'example' })?.extendPlugin(OtherPlugin, { shortcuts: {} })`,
    `createBasePlugin({ key: 'example' }).clone()`,
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
      `export const ExamplePlugin = createBasePlugin({ key: 'example', initialState: { enabled: true } });`,
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
      `ExamplePlugin.configure({ initialState: { enabled: true } })`,
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
       createBaseEditor({ schema: TestSchema });`,
      'packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts',
    ],
    [
      `defineEditorSchema({ id: 'document', version: 1, elements: { paragraph: { content: schema.content.text() } } })`,
      'packages/plite/test/named-lineage-guard.spec.ts',
    ],
    [
      `createBasePlugin({ key: 'paragraph', schema: { element: { content: schema.content.text(), properties: { id: property.string(), version: property.number() } } } })`,
      'packages/example/src/plugin.spec.ts',
    ],
  ]) {
    assert.deepEqual(auditPlateSchemaSource(source, file), []);
  }
});

test('allows only the exact reviewed raw-query count in an owning file', () => {
  const file = 'packages/basic-styles/src/lib/BaseStylePlugins.spec.ts';
  const rawQueries = new Array(6)
    .fill(
      `editor.read.schema.property({ key: 'align', placement: 'element', type: 'custom-paragraph' })`
    )
    .join(';');

  assert.deepEqual(auditPlateSchemaSource(rawQueries, file), []);
  assert.notEqual(
    auditPlateSchemaSource(
      `editor.read.schema.property({ key, placement, type })`,
      file
    ).length,
    0
  );
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
