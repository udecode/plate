// Run from packages/plitejs: bun --preload ../../config/plite-source-aliases.ts <this file>
import {
  createEditor as createPliteEditor,
  createEditorView,
  defineEditorSchema,
  definePluginSlot,
  schema,
  setEditorSnapshotInputTransform,
} from 'plitejs';
import { BaseParagraphPlugin, createEditor as createPlateEditor } from 'platejs';
import { defineDocumentMigrations, migrateDocument } from 'platejs/migrations';

const paragraph = (text: string) => ({ children: [{ text }], type: 'paragraph' });
const run = (label: string, fn: () => unknown) => {
  try {
    console.log(`${label} | accept | ${JSON.stringify(fn())}`);
  } catch (error) {
    console.log(`${label} | reject | ${String((error as Error).message).slice(0, 90)}`);
  }
};
const keys = (value: unknown) => Object.keys(value as object).sort();
const loaded = (editor: { read: { value: () => unknown } }) => {
  const value = editor.read.value() as { children: { children: { text: string }[] }[] };
  return { keys: keys(value), text: value.children[0]?.children[0]?.text };
};
const caret = { anchor: { offset: 1, path: [0, 0] }, focus: { offset: 1, path: [0, 0] } };

run('plite replace selection end', () => {
  const editor = createPliteEditor();
  editor.update.value.replace({ children: [paragraph('HELLO')], selection: 'end' } as never);
  return { ...loaded(editor), selection: editor.read.selection() };
});
run('plate replace selection end', () => {
  const editor = createPlateEditor();
  editor.update.value.replace({ children: [paragraph('HELLO')], selection: 'end' } as never);
  return { ...loaded(editor), selection: editor.read.selection() };
});
run('plite replace document key (contract test)', () => {
  const editor = createPliteEditor();
  editor.update.value.replace({ children: [paragraph('HELLO')], document: { application: true } } as never);
  return loaded(editor);
});

// Control: Plate's createEditor has no `value` option, so this input is never loaded.
run('control: plate construction through value', () =>
  loaded(createPlateEditor({ value: { children: [paragraph('HELLO')], extra: 1 } } as never)));
run('plate construction extra JSON', () =>
  loaded(createPlateEditor({ initialValue: { children: [paragraph('HELLO')], extra: 1 } as never })));
run('plate construction extra non-JSON', () =>
  loaded(createPlateEditor({ initialValue: { children: [paragraph('HELLO')], extra: () => 1 } as never })));
run('plate construction raw selection', () => {
  const editor = createPlateEditor({ initialValue: { children: [paragraph('HELLO')], selection: caret } as never });
  return { ...loaded(editor), selection: editor.read.selection() };
});
run('plite construction raw selection', () => {
  const editor = createPliteEditor({ initialValue: { children: [paragraph('HELLO')], selection: caret } as never });
  return { ...loaded(editor), selection: editor.read.selection() };
});

for (const target of ['editor', 'root view'] as const) {
  run(`transform input on ${target} replace`, () => {
    const editor = createPliteEditor({
      initialValue: { children: [paragraph('main')], roots: { header: [paragraph('head')] } },
    });
    let seen: string[] = [];
    setEditorSnapshotInputTransform(editor, (input) => {
      seen = keys(input);
      return input;
    });
    const replace = target === 'editor' ? editor.update.value.replace : createEditorView(editor, { root: 'header' }).update.value.replace;
    replace({ children: [paragraph('HELLO')], extra: 1 } as never);
    return { transformSaw: seen };
  });
}

const slot = definePluginSlot('probe-reconfigure');
const probeSchema = (version: number) =>
  defineEditorSchema('schema:probe-reconfigure', {
    elements: { paragraph: { content: schema.content.text() } },
    id: 'probe-reconfigure',
    root: schema.content.types(['paragraph']),
    unknown: 'reject',
    version,
  });
for (const [label, extra] of [
  ['extra JSON', { extra: 1 }],
  ['extra non-JSON', { extra: () => 1 }],
  ['selection', { selection: 'end' }],
  ['control meta', { meta: {} }],
] as const) {
  run(`reconfigure migrate returns ${label}`, () => {
    const editor = createPliteEditor({ initialValue: [paragraph('HELLO')], plugins: [slot.of(probeSchema(1))] as const });
    editor.update.plugins.reconfigure(slot, probeSchema(2), {
      migrate: ({ document }) => ({ ...document, ...extra }) as never,
    });
    return loaded(editor);
  });
}

const liftTitle = defineDocumentMigrations({
  plugins: [BaseParagraphPlugin] as const,
  schema: { id: 'probe-migrations', version: 2 },
  sourceFingerprints: { 1: 'source-1' },
  steps: {
    2: ({ document }) => {
      const { title, ...rest } = document as typeof document & { title?: string };
      return { document: title === undefined ? rest : { ...rest, meta: { ...rest.meta, title } } };
    },
  },
});
run('migrateDocument lifts title', () =>
  migrateDocument({ children: [paragraph('HELLO')], title: 'T' } as never, { migrations: liftTitle, source: 1 }).output.document);
run('migrateDocument stray key', () =>
  migrateDocument({ children: [paragraph('HELLO')], stray: 1 } as never, { migrations: liftTitle, source: 1 }).output.document);
run('migrateDocument raw selection', () =>
  migrateDocument({ children: [paragraph('HELLO')], selection: null } as never, { migrations: liftTitle, source: 1 }).output.document);
