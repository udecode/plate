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
    `ParagraphPlugin.configure({ config: { topLevel: true } })`,
    `createBasePlugin({ key: 'p', schema: { element: { groups: ['block'] } } })`,
    `createBasePlugin({ key: 'p', schema: { element: {} } })`,
    `createBasePlugin({ key: 'link', schema: { element: { inline: true } } })`,
    `defineEditorExtension({ name: 'paragraph', schema: { elements: { paragraph: {} } } })`,
    `defineEditorSchema({ id: 'app', version: 1, elements: { paragraph: {} } })`,
    `createBasePlugin<ParagraphConfig>({ key: 'p', schema: { element: { content: schema.content.text() } } })`,
    `createPlatePlugin<LinkConfig>({ key: 'link', schema: { element: { content: schema.content.text(), inline: true } } })`,
    `createBasePlugin({ key: 'p', schema: { element: { content: schema.content.type(KEYS.p) } } })`,
    `IndentPlugin.configure({ options: { targetPluginKeys: ['p'] } })`,
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

test('accepts current plugin syntax and unrelated document or Markdown AST shapes', () => {
  for (const source of [
    `createBasePlugin({ key: 'p', type: 'paragraph', schema: { element: { content: schema.content.text() } }, render: { node: Paragraph } })`,
    `createBasePlugin({ key: 'hr', schema: { element: { void: 'block' } } })`,
    `createBasePlugin({ key: 'p', schema: { element: { ...elementSchema } } })`,
    `defineEditorExtension({ name: 'paragraph', schema: { elements: { paragraph: { content: schema.content.text() } } } })`,
    `defineEditorSchema({ id: 'app', version: 1, elements: { horizontalRule: { void: true } } })`,
    `defineEditorExtension({ name: 'dynamic', schema: { elements } })`,
    `defineEditorExtension({ name: 'spread', schema: { elements: { paragraph: { ...definition } } } })`,
    `createBasePlugin<RuntimeConfig>({ key: 'runtime', options: { enabled: true } })`,
    `ParagraphPlugin.configure(({ editor }) => ({ options: { editor }, handlers: {}, render: {}, shortcuts: {} }))`,
    `ParagraphPlugin.configure(() => ({}))`,
    `createBasePlugin({ options: { isUrl: () => true, schemes: ['https'] }, key: 'link', schema: ({ options, key, own, plugins, type }) => ({ properties: [] }) })`,
    `const event = { node: { type: 'paragraph' } }`,
    `createBasePlugin({ key: 'analytics', options: { event: { node: { type: 'paragraph' } } } })`,
    `const rules = { emphasis: { mark: true } }`,
    `const parser = { isElement: true, isLeaf: false }`,
    `defineEditorSchema({ elements: { paragraph: { content: schema.content.text(), groups: ['block'] } } })`,
    `state.schema.element('paragraph')`,
    `createBasePlugin({ options: { targets: [ParagraphPlugin] }, key: 'align' })`,
    `createBasePlugin({ key: 'generic', targetPluginKeys: ['p'] })`,
    `ParagraphPlugin.configure({ options: { topLevel: true } })`,
    `ParagraphPlugin.configure({ schema: { element: { properties: { id: property.string() } } } })`,
    `ParagraphPlugin.extend(({ editor }) => ({ options: { editor } }))`,
    `ParagraphPlugin.withComponent(ParagraphElement)`,
    `createPlatePlugin({ key: 'p', render: { node: ParagraphElement } })`,
    `createBasePlugin({ key: 'link', options: { isUrl: () => true } })`,
    `createBasePlugin({ key: 'negative', /* @ts-expect-error runtime access */ schema: ({ editor }) => ({ editor }) })`,
    `state.schema.getElementProperty(element, colSpanHandle)`,
    `editor.read.schema.property(AdvancedMarkPlugin)`,
  ]) {
    expectAccepted(source);
  }
});

test('reserves package configure calls for reviewed consumer installation owners', () => {
  assert.match(
    auditPlateSchemaSource(
      `export const ExamplePlugin = createBasePlugin({ key: 'example' }).configure({ options: { enabled: true } });`,
      'packages/example/src/ExamplePlugin.ts'
    )[0]?.reason ?? '',
    /package plugin definitions must use extend/
  );

  for (const [source, file] of [
    [
      `export const ExamplePlugin = createBasePlugin({ key: 'example' }).extend({ options: { enabled: true } });`,
      'packages/example/src/ExamplePlugin.ts',
    ],
    [
      `ExamplePlugin.configure({ options: { enabled: true } })`,
      'packages/example/src/ExamplePlugin.spec.ts',
    ],
    [
      `ExamplePlugin.configure({ options: { enabled: true } })`,
      'packages/core/src/lib/plugins/getCorePlugins.ts',
    ],
    [
      `ExamplePlugin.configure({ options: { enabled: true } })`,
      'packages/core/src/react/editor/getPlateCorePlugins.ts',
    ],
    [
      `ExamplePlugin.configure({ options: { enabled: true } })`,
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
    `ExamplePlugin.configure({}).extendApi(() => ({}))`,
    `ExamplePlugin.configure({}).extendEditorApi(() => ({}))`,
    `ExamplePlugin.configure({}).extendExtension({})`,
    `ExamplePlugin.configure({}).extendPlugin(OtherPlugin, {})`,
    `ExamplePlugin.configure({}).extendSelectors(() => ({}))`,
    `ExamplePlugin.configure({}).extendTx(() => ({}))`,
    `ExamplePlugin.configure({}).extendTxGroup(() => ({}))`,
    `ExamplePlugin.configure({}).withComponent(Component)`,
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
    `const identity = { id: 'ordinary', version: 1 }; createPlateEditor({ schema: identity })`,
    `const identity = { id: 'ordinary', version: 1 } as const; usePlateViewEditor({ schema: identity })`,
  ]) {
    assert.match(
      auditPlateSchemaSource(source, 'packages/example/src/editor.spec.ts')[0]
        ?.reason ?? '',
      /must use derived schema identity/
    );
  }
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
      `extendPlateEditor(editor, { schema: { id: 'plate-core-test', version: 4 } })`,
      'packages/core/src/lib/editor/withPlite.slow.ts',
    ],
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
  const file = 'packages/basic-styles/src/lib/BaseTextAlignPlugin.spec.ts';
  const rawQueries = `
    editor.read.schema.property({ key: 'align', placement: 'element', type: 'custom-paragraph' });
    editor.read.schema.property({ key: 'align', placement: 'element', type: paragraphType });
  `;

  assert.deepEqual(auditPlateSchemaSource(rawQueries, file), []);
  assert.notEqual(
    auditPlateSchemaSource(
      `editor.read.schema.property({ key, placement, type })`,
      file
    ).length,
    0
  );
  expectRejected(`editor.read.schema.property({ key, placement, type })`);
});
