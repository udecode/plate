import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getLastCommit as editorGetLastCommit,
  getPathByRuntimeId as editorGetPathByRuntimeId,
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';
import {
  createEditor,
  DocumentChange,
  type Element,
  defineEditorExtension,
  property,
  schema,
} from '@platejs/plite';
import { extendTestSchema } from './support/schema';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const createFoundationEditor = () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [paragraph('one'), paragraph('two'), paragraph('three')],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor;
};

describe('editor foundation contract', () => {
  it('owns editor identity at creation time', () => {
    const provided = createEditor({ id: 'custom-editor' });
    const generatedA = createEditor();
    const generatedB = createEditor();

    assert.equal(provided.id, 'custom-editor');
    assert.match(generatedA.id, /^plite-editor-\d+$/);
    assert.match(generatedB.id, /^plite-editor-\d+$/);
    assert.notEqual(generatedA.id, generatedB.id);
  });

  it('combines extension namespaces and schema specs without extension namespaces on the editor surface', () => {
    const editor = createFoundationEditor();

    extendTestSchema(editor, {
      image: { void: 'block' },
      mention: { void: 'markable-inline' },
    });
    editor.extend(
      defineEditorExtension({
        name: 'table-foundation',
        schema: {
          elements: {
            'table-cell': {
              content: schema.content.text({ default: 'text', min: 1 }),
              properties: {
                colSpan: property.number({ default: 1 }),
              },
            },
          },
        },
        read: ({ state }) => ({
          defaultColSpan() {
            return state.schema.getElementProperty(
              { type: 'table-cell', children: [{ text: '' }] },
              'colSpan'
            );
          },
          imageIsVoid() {
            return state.schema.isVoid({
              type: 'image',
              children: [{ text: '' }],
            });
          },
          rowCount() {
            return state.nodes.children().length;
          },
        }),
        update: ({ tx }) => ({
          imageVoidKind() {
            return tx.schema.element('image')?.behavior.voidKind;
          },
          colSpanIsDefault(value: unknown) {
            return Object.is(
              value,
              tx.schema.property({
                key: 'colSpan',
                placement: 'element',
                type: 'table-cell',
              })?.value.default
            );
          },
          insertRow(text: string) {
            tx.nodes.insert(paragraph(text), {
              at: [tx.nodes.children().length],
            });
          },
          mentionIsMarkableVoid() {
            return tx.schema.isMarkableVoid({
              type: 'mention',
              children: [{ text: '' }],
            });
          },
          rowCount() {
            return tx.nodes.children().length;
          },
        }),
      })
    );

    const readState = editor.read((state) => {
      const tableState = state as typeof state & {
        'table-foundation': {
          defaultColSpan(): unknown;
          imageIsVoid(): boolean;
          rowCount(): number;
        };
      };

      return {
        defaultColSpan: tableState['table-foundation'].defaultColSpan(),
        imageIsVoid: tableState['table-foundation'].imageIsVoid(),
        rowCount: tableState['table-foundation'].rowCount(),
      };
    });
    let txState: {
      imageVoidKind: unknown;
      colSpanIsDefault: boolean;
      mentionIsMarkableVoid: boolean;
      rowCountAfterInsert: number;
    } | null = null;

    editor.update((tx) => {
      const tableTx = tx as typeof tx & {
        'table-foundation': {
          colSpanIsDefault(value: unknown): boolean;
          imageVoidKind(): unknown;
          insertRow(text: string): void;
          mentionIsMarkableVoid(): boolean;
          rowCount(): number;
        };
      };

      tableTx['table-foundation'].insertRow('four');
      txState = {
        colSpanIsDefault: tableTx['table-foundation'].colSpanIsDefault(1),
        imageVoidKind: tableTx['table-foundation'].imageVoidKind(),
        mentionIsMarkableVoid:
          tableTx['table-foundation'].mentionIsMarkableVoid(),
        rowCountAfterInsert: tableTx['table-foundation'].rowCount(),
      };
    });

    assert.deepEqual(readState, {
      defaultColSpan: 1,
      imageIsVoid: true,
      rowCount: 3,
    });
    assert.deepEqual(txState, {
      colSpanIsDefault: true,
      imageVoidKind: 'block',
      mentionIsMarkableVoid: true,
      rowCountAfterInsert: 4,
    });
    assert.equal(editorString(editor, [3]), 'four');

    const editorSurface = editor as unknown as Record<string, unknown>;

    assert.equal(typeof editorSurface.api, 'object');
    assert.equal(typeof editorSurface.extension, 'function');
    assert.equal('tf' in editorSurface, false);
    assert.equal('plate' in editorSurface, false);
    assert.equal('yjs' in editorSurface, false);
    assert.equal('table' in editorSurface, false);
  });

  it('applies serialized canonical changes with commit metadata and local-only runtime targets', () => {
    const source = createFoundationEditor();
    const remote = createFoundationEditor();
    const remoteCommits: NonNullable<ReturnType<typeof editorGetLastCommit>>[] =
      [];
    const unsubscribe = remote.subscribe((_snapshot, commit) => {
      if (commit) {
        remoteCommits.push(commit);
      }
    });

    source.update({ tags: ['local-edit', 'collab-export'] }, (tx) => {
      tx.text.insert('!');
      tx.nodes.insert(paragraph('four'), { at: [3] });
    });

    const sourceCommit = editorGetLastCommit(source);

    assert(sourceCommit);
    assert.deepEqual(sourceCommit.tags, ['local-edit', 'collab-export']);

    remote.update((tx) => {
      tx.tags.add('remote-import');
      tx.changes.apply(DocumentChange.fromJSON(sourceCommit.changes.toJSON()));
    });
    unsubscribe();

    assert.deepEqual(
      editorGetSnapshot(remote).children,
      editorGetSnapshot(source).children
    );
    assert.equal(remoteCommits.length, 1);
    assert.deepEqual(remoteCommits[0]?.tags, ['remote-import']);
    assert.deepEqual(
      remoteCommits[0]?.changes.toJSON(),
      sourceCommit.changes.toJSON()
    );

    const targetEditor = createFoundationEditor();
    const removedId = editorGetRuntimeId(targetEditor, [1]);

    assert(removedId);

    const before = targetEditor.read.value();
    const removeChange = DocumentChange.between(before, {
      ...before,
      children: before.children.filter((_node, index) => index !== 1),
    });

    assert.equal(
      JSON.stringify(removeChange.toJSON()).includes(removedId),
      false
    );

    targetEditor.update((tx) => {
      tx.tags.add('remote-remove');
      tx.changes.apply(DocumentChange.fromJSON(removeChange.toJSON()));
    });

    const removeCommit = editorGetLastCommit(targetEditor);

    assert(removeCommit);
    assert.deepEqual(removeCommit.tags, ['remote-remove']);
    assert.equal(editorGetPathByRuntimeId(targetEditor, removedId), null);
  });
});
