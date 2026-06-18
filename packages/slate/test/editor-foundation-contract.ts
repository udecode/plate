import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/slate/internal';
import {
  createEditor,
  type Descendant,
  defineEditorExtension,
  elementProperty,
  type Operation,
} from '../src';
import { extendTestSchema } from './support/schema';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const createFoundationEditor = () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [paragraph('one'), paragraph('two'), paragraph('three')],
    marks: null,
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  return editor;
};

describe('editor foundation contract', () => {
  it('combines extension namespaces and schema specs without extension namespaces on the editor surface', () => {
    const editor = createFoundationEditor();

    extendTestSchema(editor, [
      { type: 'image', void: 'block' },
      { type: 'mention', void: 'markable-inline' },
    ]);
    editor.extend(
      defineEditorExtension({
        elements: [
          {
            properties: {
              colSpan: elementProperty.number({ default: 1 }),
            },
            type: 'table-cell',
          },
        ],
        name: 'table-foundation',
        state: {
          table(state) {
            return {
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
            };
          },
        },
        tx: {
          table(tx) {
            return {
              imageSpec() {
                return tx.schema.getElementSpec('image');
              },
              colSpanIsDefault(value: unknown) {
                return tx.schema.isElementPropertyEqual(
                  'table-cell',
                  'colSpan',
                  value,
                  undefined
                );
              },
              insertRow(text: string) {
                tx.nodes.insert(paragraph(text), {
                  at: [tx.nodes.children().length],
                });
              },
              mentionIsMarkableVoid() {
                return tx.schema.markableVoid({
                  type: 'mention',
                  children: [{ text: '' }],
                });
              },
              rowCount() {
                return tx.nodes.children().length;
              },
            };
          },
        },
      })
    );

    const readState = editor.read((state) => {
      const tableState = state as typeof state & {
        table: {
          defaultColSpan(): unknown;
          imageIsVoid(): boolean;
          rowCount(): number;
        };
      };

      return {
        defaultColSpan: tableState.table.defaultColSpan(),
        imageIsVoid: tableState.table.imageIsVoid(),
        rowCount: tableState.table.rowCount(),
      };
    });
    let txState: {
      imageSpec: unknown;
      colSpanIsDefault: boolean;
      mentionIsMarkableVoid: boolean;
      rowCountAfterInsert: number;
    } | null = null;

    editor.update((tx) => {
      const tableTx = tx as typeof tx & {
        table: {
          colSpanIsDefault(value: unknown): boolean;
          imageSpec(): unknown;
          insertRow(text: string): void;
          mentionIsMarkableVoid(): boolean;
          rowCount(): number;
        };
      };

      tableTx.table.insertRow('four');
      txState = {
        colSpanIsDefault: tableTx.table.colSpanIsDefault(1),
        imageSpec: tableTx.table.imageSpec(),
        mentionIsMarkableVoid: tableTx.table.mentionIsMarkableVoid(),
        rowCountAfterInsert: tableTx.table.rowCount(),
      };
    });

    assert.deepEqual(readState, {
      defaultColSpan: 1,
      imageIsVoid: true,
      rowCount: 3,
    });
    assert.deepEqual(txState, {
      colSpanIsDefault: true,
      imageSpec: { type: 'image', void: 'block' },
      mentionIsMarkableVoid: true,
      rowCountAfterInsert: 4,
    });
    assert.equal(Editor.string(editor, [3]), 'four');

    const editorSurface = editor as unknown as Record<string, unknown>;

    assert.equal(typeof editorSurface.api, 'object');
    assert.equal(typeof editorSurface.getApi, 'function');
    assert.equal('tf' in editorSurface, false);
    assert.equal('plate' in editorSurface, false);
    assert.equal('yjs' in editorSurface, false);
    assert.equal('table' in editorSurface, false);
  });

  it('replays deterministic operations with commit metadata and local-only runtime targets', () => {
    const source = createFoundationEditor();
    const remote = createFoundationEditor();
    const remoteCommits: NonNullable<
      ReturnType<typeof Editor.getLastCommit>
    >[] = [];
    const unsubscribe = remote.subscribe((_snapshot, commit) => {
      if (commit) {
        remoteCommits.push(commit);
      }
    });

    source.update(
      (tx) => {
        tx.text.insert('!');
        tx.nodes.insert(paragraph('four'), { at: [3] });
      },
      { tag: ['local-edit', 'collab-export'] }
    );

    const sourceCommit = Editor.getLastCommit(source);

    assert(sourceCommit);
    assert.deepEqual(sourceCommit.tags, ['local-edit', 'collab-export']);

    remote.update((tx) => {
      tx.operations.replay(sourceCommit.operations, { tag: 'remote-import' });
    });
    unsubscribe();

    assert.deepEqual(
      Editor.getSnapshot(remote).children,
      Editor.getSnapshot(source).children
    );
    assert.equal(remoteCommits.length, 1);
    assert.deepEqual(remoteCommits[0]?.tags, ['remote-import']);
    assert.deepEqual(
      remoteCommits[0]?.operations.map((operation) => operation.type),
      sourceCommit.operations.map((operation) => operation.type)
    );

    const targetEditor = createFoundationEditor();
    const removedId = Editor.getRuntimeId(targetEditor, [1]);
    const removedNode = Editor.getSnapshot(targetEditor).children[1]!;

    assert(removedId);

    const removeOperation: Operation = {
      node: removedNode,
      path: [1],
      type: 'remove_node',
    };

    assert.equal(JSON.stringify(removeOperation).includes(removedId), false);

    targetEditor.update((tx) => {
      tx.operations.replay([removeOperation], { tag: 'remote-remove' });
    });

    const removeCommit = Editor.getLastCommit(targetEditor);

    assert(removeCommit);
    assert.deepEqual(removeCommit.tags, ['remote-remove']);
    assert.equal(Editor.getPathByRuntimeId(targetEditor, removedId), null);
  });
});
