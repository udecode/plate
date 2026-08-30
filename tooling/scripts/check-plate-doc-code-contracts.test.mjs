import assert from 'node:assert/strict';
import test from 'node:test';

import {
  auditPlateDocCode,
  extractJavaScriptCodeFences,
} from './check-plate-doc-code-contracts.mjs';

test('extracts only JavaScript and TypeScript code fences', () => {
  const source = [
    '```tsx title="editor.tsx"',
    'useEditor({ plugins: [] });',
    '```',
    '```bash',
    'useEditor({ plugins: [] });',
    '```',
  ].join('\n');

  assert.deepEqual(
    extractJavaScriptCodeFences(source).map(({ language }) => language),
    ['tsx']
  );
});

test('derives editor schema identity when direct construction omits it', () => {
  const source = [
    '```tsx',
    'const editor = useEditor({ plugins: [] });',
    "createEditor({ initialValue: [{ children: [{ text: '' }], type: 'p' }] });",
    'createStaticEditor();',
    'useStaticEditor();',
    'createEditor(undefined);',
    'createEditor({ schema: { root: schema.content.element(ParagraphPlugin, { min: 1 }) } });',
    'createEditor({ schema: { overrides: [] } });',
    '```',
  ].join('\n');

  assert.deepEqual(auditPlateDocCode(source), []);
});

test('rejects invalid editor options', () => {
  const source = [
    '```tsx',
    "useEditor('invalid');",
    'createEditor(42);',
    '```',
  ].join('\n');

  assert.equal(auditPlateDocCode(source).length, 2);
});

test('rejects removed and invalid editor initialization shapes', () => {
  const source = [
    '```tsx',
    'createEditor({ value: [] });',
    'createEditor({ onReady() {} });',
    'useEditor({ initialValue: null });',
    'createStaticEditor({ initialValue: [] });',
    "createEditor({ initialValue: 'html' });",
    'createEditor({ initialValue: async () => [] });',
    'createEditor({ async initialValue() { return []; } });',
    'createEditor({ initialValue: () => [] });',
    'createEditor({ initialValue() { return []; } });',
    'createEditor({ initialValue: Promise.resolve([]) });',
    'createEditor({ initialValue: new Promise(() => {}) });',
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(source);

  assert.equal(issues.length, 11);
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('callbacks must be synchronous')
    ).length,
    2
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('at least one')).length,
    3
  );
});

test('accepts complete named lineages and typed pass-through options', () => {
  const source = [
    '```ts',
    "createEditor({ schema: { id: 'comments-example', version: 1 } });",
    'const makeEditor = (options: CreateEditorOptions) => createEditor(options);',
    'const spreadEditor = (...options: [CreateEditorOptions]) => createEditor(...options);',
    'const assertedEditor = createEditor(options as CreateEditorOptions);',
    '```',
  ].join('\n');

  assert.deepEqual(auditPlateDocCode(source), []);
});

test('rejects incomplete inline identities', () => {
  const source = [
    '```ts',
    "createEditor({ schema: { id: 'comments-example' } });",
    '```',
  ].join('\n');

  assert.match(
    auditPlateDocCode(source)[0].reason,
    /named editor schema lineages require string id and numeric version/
  );
});

test('requires explicit content for non-void plugin elements', () => {
  const source = [
    '```ts',
    "defineBasePlugin('p', {schema: { element: {} } });",
    "defineBasePlugin('link', {schema: { element: { inline: true } } });",
    "defineExtension('quote', {schema: { elements: { quote: {} } } });",
    `defineEditorSchema('schema:app', { id: 'app', version: 1, elements: { paragraph: {} } });`,
    '```',
  ].join('\n');

  assert.equal(
    auditPlateDocCode(source).filter((issue) =>
      issue.reason.includes('requires explicit content')
    ).length,
    4
  );
});

test('accepts explicit content, void elements, and configured partial schemas', () => {
  const source = [
    '```ts',
    "defineBasePlugin('p', {schema: { element: { content: schema.content.text() } } });",
    "defineBasePlugin('hr', {schema: { element: { void: 'block' } } });",
    'ParagraphPlugin.configure({ schema: { element: { properties: { id: property.string() } } } });',
    "defineExtension('paragraph', {schema: { elements: { paragraph: { content: schema.content.text() } } } });",
    `defineEditorSchema('schema:app', { id: 'app', version: 1, elements: { horizontalRule: { void: true } } });`,
    "defineExtension('dynamic', {schema: { elements } });",
    "defineExtension('spread', {schema: { elements: { paragraph: { ...definition } } } });",
    '```',
  ].join('\n');

  assert.deepEqual(auditPlateDocCode(source), []);
});

test('requires typed handles for known schema properties', () => {
  const source = [
    '```ts',
    'state.schema.getElementProperty(element, "colSpan");',
    'state.schema.property({ key: "colSpan", placement: "element", type: "tableCell" });',
    'state.schema.getElementProperty(element, colSpan);',
    'state.schema.property({ key, placement, type });',
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(source);

  assert.equal(issues.length, 2);
  assert.ok(issues.every((issue) => issue.reason.includes('typed handle')));
});

test('accepts contextual configure runtime fields and rejects model fields', () => {
  const source = [
    '```ts',
    'ParagraphPlugin.configure(({ editor }) => ({ initialState: { editor }, on: {}, override: { plugins: {} } }));',
    'ParagraphPlugin.configure(() => ({ schema: { element: {} } }));',
    "ParagraphPlugin.configure(() => { return { type: 'other' }; });",
    'ParagraphPlugin.configure(() => runtimeConfig);',
    'ParagraphPlugin.extend(({ editor }) => ({ initialState: { editor } }));',
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(source);

  assert.equal(issues.length, 3);
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('contextual plugin configure only accepts')
    ).length,
    2
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('explicit object')).length,
    1
  );
});

test('requires configure to be the final plugin authoring call in docs', () => {
  const source = [
    '```ts',
    'ParagraphPlugin.configure({}).configure({});',
    'ParagraphPlugin.configure({}).extend({});',
    'ParagraphPlugin.configure({}).configure({ component: ParagraphElement });',
    'ParagraphPlugin.extend({}).configure({});',
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(source);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('configure must be the final plugin authoring call')
    ).length,
    3
  );
});

test('rejects deleted plugin builders in docs', () => {
  const source = [
    '```ts',
    ...[
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
    ].map((method) => `ParagraphPlugin.${method}(() => ({}));`),
    `createZustandStore({}, { name: 'store' }).extendSelectors(() => ({}));`,
    'request.nextUrl.clone();',
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(source);

  assert.equal(
    issues.filter((issue) => issue.reason.includes('deleted plugin builder'))
      .length,
    10
  );
});

test('accepts the full independent plugin declaration vocabulary in docs', () => {
  const accepted = [
    '```ts',
    "defineBasePlugin('p', { api: () => ({}), commands: () => [],on: {}, read: () => ({}), readMiddleware: () => [], render: { leaf: Leaf }, selectors: {}, update: () => ({}) });",
    "definePlatePlugin('p', { component: ParagraphElement, });",
    "defineBasePlugin('p', {...behavior });",
    '```',
  ].join('\n');
  const rejected = [
    '```ts',
    "defineBasePlugin('p', { component: ParagraphElement, });",
    '```',
  ].join('\n');

  assert.deepEqual(auditPlateDocCode(accepted), []);
  assert.equal(
    auditPlateDocCode(rejected).filter((issue) =>
      issue.reason.includes('only in definePlatePlugin')
    ).length,
    1
  );
});

test('requires the sole one-argument clipboard contribution form', () => {
  const accepted = [
    '```ts',
    "import { clipboardHandler as clipboard } from 'platejs/dom';",
    'clipboard({ insertData() { return true; } });',
    'clipboardHandler({ insertData() { return true; } });',
    '```',
  ].join('\n');
  const rejected = [
    '```ts',
    "import { clipboardHandler } from 'platejs/dom';",
    'clipboardHandler(editor, { insertData() { return true; } });',
    '```',
  ].join('\n');

  assert.deepEqual(auditPlateDocCode(accepted), []);
  assert.equal(
    auditPlateDocCode(rejected).filter((issue) =>
      issue.reason.includes('exactly one contextually typed handler')
    ).length,
    1
  );
});

test('rejects deleted Plate and Plite definition fields in docs', () => {
  const source = [
    '```ts',
    "defineBasePlugin('p', { clipboard: {}, config: {}, extension: {}, handlers: {},pluginApi: {}, targetPluginKeys: [], tx: {}, validateConfiguration() {} });",
    "defineExtension('raw', { config: {},state: {}, tx: {}, validateConfiguration() {} });",
    'defineExtension<Editor>("typed", {});',
    'defineBasePlugin<Definition>("typedPlate", {});',
    'editor.getApi(RawExtension).run();',
    'service.getApi();',
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(source);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('deleted Plate plugin definition field')
    ).length,
    8
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('deleted Plite extension definition field')
    ).length,
    4
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('infers one definition'))
      .length,
    2
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('editor.extension(Extension).api')
    ).length,
    1
  );
});

test('audits aliased Plite factories and resolved author objects in docs', () => {
  const source = [
    '```ts',
    'const directAlias = defineExtension;',
    "directAlias('a', { config: {} });",
    "import { defineExtension as importedAlias } from 'platejs';",
    "importedAlias('b', { state: {} });",
    'const { defineExtension: destructuredAlias } = Plite;',
    "destructuredAlias('c', { tx: {} });",
    "Plite.defineExtension('d', {validateConfiguration() {} });",
    "directAlias<Definition>('typed', {});",
    "importedAlias('static-api', { api: {} });",
    "destructuredAlias('arity', { api: (editor, context) => ({ editor, context }) });",
    "const stale = { handlers: {} }; defineBasePlugin('plate', {...stale });",
    "const on = { onKeyDown() {} }; definePlatePlugin('events', {on });",
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(source);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('deleted Plite extension definition field')
    ).length,
    4
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('deleted Plate plugin definition field')
    ).length,
    1
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('listeners are prefixless'))
      .length,
    1
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('infers one definition'))
      .length,
    1
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('api must be declared as a factory')
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

test('rejects config only in Plite callback contexts in docs', () => {
  const source = [
    '```ts',
    "defineExtension('contexts', {",
    '  schema: ({ config }) => ({}),',
    '  api: ({ config }) => ({}),',
    '  activate(editor, { config }) {},',
    '  validate({ config }) {},',
    '});',
    'const config = {};',
    '```',
  ].join('\n');

  assert.equal(
    auditPlateDocCode(source).filter((issue) =>
      issue.reason.includes(
        'schema/API/activation/validation contexts have no config'
      )
    ).length,
    4
  );
});

test('rejects stale names only in capability factory contexts in docs', () => {
  const source = [
    '```ts',
    "defineBasePlugin('legacy', {read: ({ editorReads }) => ({ value: () => editorReads.value() }) });",
    'const inspect = ({ editorReads }) => editorReads;',
    '```',
  ].join('\n');

  assert.equal(
    auditPlateDocCode(source).filter((issue) =>
      issue.reason.includes('stale read factory context binding editorReads')
    ).length,
    1
  );
});

test('rejects only proven API root merges in docs', () => {
  const source = [
    '```ts',
    'Object.assign(editor.api, extensionApi);',
    'editor.api.block.insert();',
    'editor.api.string();',
    'editor.api.undo();',
    'Object.assign(editor, attributes);',
    '```',
  ].join('\n');

  assert.equal(
    auditPlateDocCode(source).filter((issue) =>
      issue.reason.includes('project through editor.api.<name>')
    ).length,
    1
  );
});

test('requires API factories and keeps API out of consumer configuration', () => {
  const rejected = [
    '```ts',
    "defineBasePlugin('base', { api: {}, });",
    "definePlatePlugin('react', { api: {}, });",
    "defineExtension('raw', { api: {}, });",
    'Plugin.extend({ api: {} });',
    'Plugin.configure({ api: () => ({}) });',
    "defineBasePlugin('groups', {read: {}, update: {} });",
    "defineExtension('middleware', { commands: {},readMiddleware: {} });",
    "defineBasePlugin('twoPlateContexts', { api: (editor, store) => ({ editor, store }), });",
    "defineExtension('twoPliteContexts', { api: (editor, context) => ({ editor, context }), });",
    '```',
  ].join('\n');
  const accepted = [
    '```ts',
    "defineBasePlugin('base', { api: () => ({}),read: () => ({}), update: () => ({}) });",
    "definePlatePlugin('react', { api() { return {}; }, });",
    "defineExtension('raw', { api: ({ editor, getContributions, root }) => ({ editor, getContributions, root }), commands: () => [],readMiddleware: () => [] });",
    'Plugin.extend({ api: () => ({}) });',
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(rejected);

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
  assert.deepEqual(auditPlateDocCode(accepted), []);
});

test('uses DefinitionOf instead of the deleted InferConfig alias', () => {
  const issues = auditPlateDocCode(
    [
      '```ts',
      'type Legacy = InferConfig<typeof Plugin>;',
      'type CurrentConfig = DefinitionOf<typeof Plugin>;',
      'type Current = DefinitionOf<typeof Plugin>;',
      'type CurrentPluginDefinition = DefinitionOf<typeof Plugin>;',
      'type CurrentDefinition = DefinitionOf<typeof Plugin>;',
      'type CorePluginDefinition = DefinitionOf<CorePlugins[number]>;',
      "type CurrentApi = Pick<DefinitionOf<typeof Plugin>, 'api'>;",
      'type Wrapped = Readonly<DefinitionOf<typeof Plugin>>;',
      'type RuntimeConfig = { enabled: boolean };',
      '```',
    ].join('\n')
  );

  assert.equal(
    issues.filter((issue) => issue.reason.includes('use DefinitionOf')).length,
    1
  );
  assert.equal(
    issues.filter((issue) => issue.reason.includes('use FooDefinition')).length,
    3
  );
});

test('keeps Plite dependency requirements behind one public extension generic in docs', () => {
  const source = [
    '```ts',
    'type Bad = EditorExtension<ExampleDefinition, readonly [Dependency]>;',
    'type Good = EditorExtension<ExampleDefinition>;',
    '```',
  ].join('\n');

  assert.equal(
    auditPlateDocCode(source).filter((issue) =>
      issue.reason.includes('one public Definition generic')
    ).length,
    1
  );
});

test('keeps dependency carriers internal and teaches exact react composition', () => {
  const source = [
    '```ts',
    "import type { InternalEditorExtensionTypeProviderOf } from 'platejs';",
    "import { react as installReact } from 'platejs/react';",
    'type Bad = EditorExtensionDependencyReference<Capability>;',
    'installReact();',
    'installReact({ dom: DOMExtension, readOnly: true });',
    'installReact({ ...unknownOptions, dom: DOMExtension });',
    '```',
  ].join('\n');
  const issues = auditPlateDocCode(source);

  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('internal dependency typing')
    ).length,
    1
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('shallow non-generic root identity')
    ).length,
    1
  );
  assert.equal(
    issues.filter((issue) =>
      issue.reason.includes('exactly one { dom } object')
    ).length,
    3
  );
  assert.deepEqual(
    auditPlateDocCode(
      [
        '```ts',
        "import type { EditorExtensionTypeProviderOf } from 'platejs';",
        "import { react } from 'platejs/react';",
        'const shared = { dom: DOMExtension };',
        'type Reference = EditorExtensionDependencyReference;',
        'react({ dom: DOMExtension });',
        'react({ ...shared });',
        '```',
      ].join('\n')
    ),
    []
  );
  assert.equal(
    auditPlateDocCode(
      [
        '```ts',
        "import type { EditorExtensionTypeProviderOf } from 'platejs/internal';",
        '```',
      ].join('\n')
    ).filter((issue) =>
      issue.reason.includes('not a public package entrypoint')
    ).length,
    1
  );
});

test('keeps Core lowering carriers out of public docs', () => {
  const source = [
    '```ts',
    "import type { PluginDefinitionCarrier } from 'platejs';",
    '```',
  ].join('\n');

  assert.match(
    auditPlateDocCode(source)[0]?.reason ?? '',
    /internal Core author-to-canonical typing/
  );
  assert.deepEqual(
    auditPlateDocCode(
      [
        '```ts',
        "import type { PluginReference, DefinitionOf } from 'platejs';",
        '```',
      ].join('\n')
    ),
    []
  );
});

test('requires context-bound codec declarations in docs', () => {
  const rejected = [
    '```ts',
    `Plugin.extend(() => ({ codecs: { 'text/html': rule } }));`,
    `Plugin.extend({ codecs: productCodecs });`,
    '```',
  ].join('\n');
  const accepted = [
    '```ts',
    `defineBasePlugin('p', {codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': rule }) });`,
    `definePlatePlugin('p', {codecs: ({ defineCodecs }) => defineCodecs(TargetPlugin, { 'text/html': rule }) });`,
    `Plugin.extend(({ defineCodecs }) => ({ codecs: defineCodecs({ 'text/html': rule }) }));`,
    `Plugin.extend(({ defineCodecs }) => ({ codecs: defineCodecs(TargetPlugin, { 'text/html': rule }) }));`,
    '```',
  ].join('\n');

  assert.equal(
    auditPlateDocCode(rejected).filter((issue) =>
      issue.reason.includes('context-bound defineCodecs')
    ).length,
    2
  );
  assert.deepEqual(auditPlateDocCode(accepted), []);
});

test('requires root-level component for plugin node components in docs', () => {
  const rejected = [
    '```tsx',
    "definePlatePlugin('p', {render: { node: ParagraphElement } });",
    'ParagraphPlugin.extend({ render: { node: ParagraphElement } });',
    'ParagraphPlugin.configure({ render: { node: ParagraphElement } });',
    '```',
  ].join('\n');
  const accepted = [
    '```tsx',
    "definePlatePlugin('p', { component: ParagraphElement, });",
    'ParagraphPlugin.configure({ component: ParagraphElement });',
    'toPlatePlugin(BaseParagraphPlugin).configure({ component: ParagraphElement });',
    'ParagraphPlugin.extend({ render: { leaf: Leaf, aboveNodes } });',
    'const component = editor.getPlugin(ParagraphPlugin).render.node;',
    '```',
  ].join('\n');

  assert.equal(
    auditPlateDocCode(rejected).filter((issue) =>
      issue.reason.includes('root-level component')
    ).length,
    3
  );
  assert.deepEqual(auditPlateDocCode(accepted), []);
});
