import assert from 'node:assert/strict';
import test from 'node:test';

import {
  auditPlateDocCode,
  extractJavaScriptCodeFences,
} from './check-plate-doc-code-contracts.mjs';

test('extracts only JavaScript and TypeScript code fences', () => {
  const source = [
    '```tsx title="editor.tsx"',
    'usePlateEditor({ plugins: [] });',
    '```',
    '```bash',
    'usePlateEditor({ plugins: [] });',
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
    'const editor = usePlateEditor({ plugins: [] });',
    "createBaseEditor({ initialValue: [{ children: [{ text: '' }], type: 'p' }] });",
    'createStaticEditor();',
    'usePlateViewEditor();',
    'createPlateEditor(undefined);',
    '```',
  ].join('\n');

  assert.deepEqual(auditPlateDocCode(source), []);
});

test('rejects invalid editor options', () => {
  const source = [
    '```tsx',
    "usePlateEditor('invalid');",
    'createPlateEditor(42);',
    '```',
  ].join('\n');

  assert.equal(auditPlateDocCode(source).length, 2);
});

test('rejects removed and invalid editor initialization shapes', () => {
  const source = [
    '```tsx',
    'createBaseEditor({ value: [] });',
    'createPlateEditor({ onReady() {} });',
    'usePlateEditor({ initialValue: null });',
    'createStaticEditor({ initialValue: [] });',
    "createBaseEditor({ initialValue: 'html' });",
    'createPlateEditor({ initialValue: async () => [] });',
    'createPlateEditor({ async initialValue() { return []; } });',
    'createPlateEditor({ initialValue: () => [] });',
    'createPlateEditor({ initialValue() { return []; } });',
    'createPlateEditor({ initialValue: Promise.resolve([]) });',
    'createPlateEditor({ initialValue: new Promise(() => {}) });',
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
    "createPlateEditor({ schema: { id: 'comments-example', version: 1 } });",
    'const makeEditor = (options: CreateEditorOptions) => createBaseEditor(options);',
    'const spreadEditor = (...options: [CreateEditorOptions]) => createBaseEditor(...options);',
    'const assertedEditor = createBaseEditor(options as CreateEditorOptions);',
    '```',
  ].join('\n');

  assert.deepEqual(auditPlateDocCode(source), []);
});

test('rejects incomplete inline identities', () => {
  const source = [
    '```ts',
    "createPlateEditor({ schema: { id: 'comments-example' } });",
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
    "createBasePlugin({ key: 'p', schema: { element: {} } });",
    "createBasePlugin({ key: 'link', schema: { element: { inline: true } } });",
    "defineEditorExtension({ name: 'quote', schema: { elements: { quote: {} } } });",
    "defineEditorSchema({ id: 'app', version: 1, elements: { paragraph: {} } });",
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
    "createBasePlugin({ key: 'p', schema: { element: { content: schema.content.text() } } });",
    "createBasePlugin({ key: 'hr', schema: { element: { void: 'block' } } });",
    'ParagraphPlugin.configure({ schema: { element: { properties: { id: property.string() } } } });',
    "defineEditorExtension({ name: 'paragraph', schema: { elements: { paragraph: { content: schema.content.text() } } } });",
    "defineEditorSchema({ id: 'app', version: 1, elements: { horizontalRule: { void: true } } });",
    "defineEditorExtension({ name: 'dynamic', schema: { elements } });",
    "defineEditorExtension({ name: 'spread', schema: { elements: { paragraph: { ...definition } } } });",
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
    'ParagraphPlugin.configure(({ editor }) => ({ options: { editor } }));',
    'ParagraphPlugin.configure(() => ({ schema: { element: {} } }));',
    "ParagraphPlugin.configure(() => { return { type: 'other' }; });",
    'ParagraphPlugin.configure(() => runtimeConfig);',
    'ParagraphPlugin.extend(({ editor }) => ({ options: { editor } }));',
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
    'ParagraphPlugin.configure({}).withComponent(ParagraphElement);',
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
