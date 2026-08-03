import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getSnapshot as editorGetSnapshot,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import { createEditor, defineExtension } from '@platejs/plite';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

describe('editor extension namespaces', () => {
  const createSeededEditor = () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [paragraph('one'), paragraph('two')],
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 3 },
      },
    });

    return editor;
  };

  it('installs read and update groups without mutating the editor object', () => {
    const editor = createSeededEditor();

    editor.install(
      defineExtension('table', {
        read: ({ state }) => ({
          selectedText() {
            return state.text.string(state.selection() ?? []);
          },
        }),
        update: ({ tx }) => ({
          makeHeading() {
            tx.nodes.set({ type: 'heading-one' }, { at: [0] });
          },
        }),
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
    assert.equal(editorGetSnapshot(editor).children[0]?.type, 'heading-one');
  });

  it('exposes read-only groups on the active transaction', () => {
    const editor = createSeededEditor();
    let leakedRead: (() => string) | undefined;

    editor.install(
      defineExtension('selectionInfo', {
        read: ({ state }) => ({
          selectedText() {
            return state.text.string(state.selection() ?? []);
          },
        }),
      })
    );

    editor.update((tx) => {
      const selectionInfo = (
        tx as typeof tx & {
          selectionInfo: { selectedText(): string };
        }
      ).selectionInfo;

      assert.equal(selectionInfo.selectedText(), 'one');
      leakedRead = selectionInfo.selectedText;
    });

    assert.throws(
      () => leakedRead?.(),
      /editor transaction is no longer active/
    );
  });

  it('composes same-name read and update groups against the active draft', () => {
    const editor = createSeededEditor();

    editor.install(
      defineExtension('table', {
        read: ({ state }) => ({
          owner: () => 'read',
          rowCount() {
            return state.nodes.children().length;
          },
        }),
        update: ({ tx }) => ({
          insertRow(text = 'row') {
            tx.nodes.insert(paragraph(text), {
              at: [tx.nodes.children().length],
            });
          },
          owner: () => 'update',
        }),
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
        table: {
          insertRow(text?: string): void;
          owner(): string;
          rowCount(): number;
        };
      };

      assert.equal(table.table.owner(), 'update');
      observedCounts.push(table.table.rowCount());
      table.table.insertRow('three');
      observedCounts.push(table.table.rowCount());
    });

    assert.equal(rowCount, 2);
    assert.deepEqual(observedCounts, [2, 3]);
    assert.equal(editorString(editor, [2]), 'three');
    assert.equal('table' in editor, false);
  });

  it('cleans up extension groups when unextended', () => {
    const editor = createSeededEditor();
    const unextend = editor.install(
      defineExtension('mentions', {
        read: () => ({ count: () => 1 }),
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
});
