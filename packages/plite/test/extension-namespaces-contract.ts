import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/plite/internal';

import { createEditor, defineEditorExtension } from '../src';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('editor extension namespaces', () => {
  const createSeededEditor = () => {
    const editor = createEditor();

    Editor.replace(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
      marks: null,
    });

    return editor;
  };

  it('installs state and tx groups without mutating the editor object', () => {
    const editor = createSeededEditor();

    editor.extend(
      defineEditorExtension({
        name: 'table',
        state: {
          table(state) {
            return {
              selectedText() {
                return state.text.string(state.selection.get() ?? []);
              },
            };
          },
        },
        tx: {
          table(tx) {
            return {
              makeHeading() {
                tx.nodes.set({ type: 'heading-one' }, { at: [0] });
              },
            };
          },
        },
      })
    );

    const selectedText = editor.read((state) =>
      (
        state as typeof state & { table: { selectedText(): string } }
      ).table.selectedText()
    );

    editor.update((tx) => {
      (
        tx as typeof tx & { table: { makeHeading(): void } }
      ).table.makeHeading();
    });

    assert.equal('table' in editor, false);
    assert.equal(selectedText, 'one');
    assert.equal(Editor.getSnapshot(editor).children[0]?.type, 'heading-one');
  });

  it('lets plugin-style tx groups read transaction-local state', () => {
    const editor = createSeededEditor();

    editor.extend(
      defineEditorExtension({
        name: 'table-foundation',
        state: {
          table(state) {
            return {
              rowCount() {
                return state.nodes.children().length;
              },
            };
          },
        },
        tx: {
          table(tx) {
            return {
              insertRow(text = 'row') {
                tx.nodes.insert(paragraph(text), {
                  at: [tx.nodes.children().length],
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

    const rowCount = editor.read((state) => {
      const tableState = state as typeof state & {
        table: { rowCount(): number };
      };

      return tableState.table.rowCount();
    });
    const observedCounts: number[] = [];

    editor.update((tx) => {
      const table = tx as typeof tx & {
        table: { insertRow(text?: string): void; rowCount(): number };
      };

      observedCounts.push(table.table.rowCount());
      table.table.insertRow('three');
      observedCounts.push(table.table.rowCount());
    });

    assert.equal(rowCount, 2);
    assert.deepEqual(observedCounts, [2, 3]);
    assert.equal(Editor.string(editor, [2]), 'three');
    assert.equal('table' in editor, false);
  });

  it('cleans up extension groups when unextended', () => {
    const editor = createSeededEditor();
    const unextend = editor.extend(
      defineEditorExtension({
        name: 'mentions',
        state: {
          mentions() {
            return { count: () => 1 };
          },
        },
      })
    );

    assert.equal(
      editor.read((state) => 'mentions' in state),
      true
    );

    unextend();

    assert.equal(
      editor.read((state) => 'mentions' in state),
      false
    );
  });

  it('rejects duplicate extension state and tx group names', () => {
    const editor = createSeededEditor();
    const first = defineEditorExtension({
      name: 'first-table',
      state: { table: () => ({}) },
    });
    const second = defineEditorExtension({
      name: 'second-table',
      state: { table: () => ({}) },
    });

    assert.throws(
      () => editor.extend([first, second]),
      /state group "table".*conflicts/
    );

    const txFirst = defineEditorExtension({
      name: 'first-media',
      tx: { media: () => ({}) },
    });
    const txSecond = defineEditorExtension({
      name: 'second-media',
      tx: { media: () => ({}) },
    });

    assert.throws(
      () => editor.extend([txFirst, txSecond]),
      /tx group "media".*conflicts/
    );
  });

  it('rejects extension groups that collide with core state or tx groups', () => {
    const editor = createSeededEditor();

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            name: 'bad-state',
            state: { selection: () => ({}) },
          })
        ),
      /state group "selection" is reserved/
    );

    assert.throws(
      () =>
        editor.extend(
          defineEditorExtension({
            name: 'bad-tx',
            tx: { nodes: () => ({}) },
          })
        ),
      /tx group "nodes" is reserved/
    );
  });
});
