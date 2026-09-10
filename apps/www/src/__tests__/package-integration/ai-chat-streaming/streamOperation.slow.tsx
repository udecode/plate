import { describe, expect, it } from 'bun:test';

import {
  createEditor,
  createEditorView,
  defineBasePlugin,
  schema,
} from 'platejs';

import { createAIChatOperation } from '../../../../../../packages/platejs/src/ai/react/internal/createAIChatOperation';
import { defaultPlugins, createTestEditor } from './__tests__/createTestEditor';

const p = (text: string) => ({ type: 'paragraph', children: [{ text }] });
const range = (text: string, index = 0) => ({
  anchor: { path: [index, 0], offset: 0 },
  focus: { path: [index, 0], offset: text.length },
});

describe('AI detached operation', () => {
  for (const mode of ['chat', 'insert'] as const) {
    it(`${mode} keeps all previews out of document/history and accepts exactly once`, () => {
      const { editor } = createTestEditor({
        children: [p(mode === 'chat' ? 'old' : ''), p('tail')],
      });
      editor.update.selection.set(range(mode === 'chat' ? 'old' : ''));
      const before = editor.read.value();
      const selection = editor.read.selection();
      const history = editor.read.history.undos().length;
      const operation = createAIChatOperation(editor, () => {});
      const id = operation.start({ mode, edit: mode === 'chat' });
      for (const source of ['New', 'New **bold', 'New **bold** text']) {
        operation.receive(id, source);
      }
      expect(editor.read.value()).toEqual(before);
      expect(editor.read.children()).toBe(before.children);
      expect(editor.read.history.undos().length).toBe(history);
      operation.finish(id);
      expect(operation.accept()).toEqual({ comments: [] });
      expect(operation.accept()).toBe(false);
      expect(editor.read.history.undos().length).toBe(history + 1);
      const accepted = editor.read.value();
      const acceptedSelection = editor.read.selection();
      expect(accepted.children[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'New ' },
          { text: 'bold', bold: true },
          { text: ' text' },
        ],
      });
      editor.update.history.undo();
      expect(editor.read.value()).toEqual(before);
      expect(editor.read.selection()).toEqual(selection);
      editor.update.history.redo();
      expect(editor.read.value()).toEqual(accepted);
      expect(editor.read.selection()).toEqual(acceptedSelection);
    });
  }
  it('discards without consuming redo and rejects obsolete attempts', () => {
    const { editor } = createTestEditor({ children: [p('old')] });
    editor.update.selection.set(range('old'));
    editor.update.text.insert('x');
    editor.update.history.undo();
    const before = editor.read.value();
    const redo = editor.read.history.redos();
    const operation = createAIChatOperation(editor, () => {});
    const first = operation.start({ mode: 'chat', edit: true });
    operation.receive(first, 'draft');
    const second = operation.start({ mode: 'chat', edit: true, retry: true });
    operation.receive(first, 'stale');
    expect(operation.current?.source).toBe('');
    operation.receive(second, 'fresh');
    operation.stop();
    operation.receive(second, 'late');
    expect(operation.current?.source).toBe('fresh');
    operation.discard();
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.children()).toBe(before.children);
    expect(editor.read.history.redos()).toEqual(redo);
  });
  it('maps discrete named-root members and preserves unselected user edits', () => {
    const holder = defineBasePlugin('holder', {
      schema: {
        element: {
          void: 'block',
          blockContent: true,
          contentRoots: {
            body: {
              content: schema.content.type('paragraph', {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
        },
      },
    });
    const editor = createEditor({
      plugins: [...defaultPlugins, holder],
      initialValue: {
        children: [
          {
            type: 'holder',
            childRoots: { body: 'header' },
            children: [{ text: '' }],
          },
        ],
        roots: { header: [p('one'), p('middle'), p('three')] },
      },
    });
    const view = createEditorView(editor, { root: 'header' });
    view.update.selection.setNodes([[0], [2]]);
    const operation = createAIChatOperation(editor, () => {});
    const id = operation.start({ mode: 'chat', edit: true });
    operation.receive(id, 'First\n\nThird');
    view.update({ history: 'new-batch' }, (tx) =>
      tx.text.insert('!', { at: { path: [1, 0], offset: 6 } })
    );
    const before = editor.read.value();
    const beforeSelection = editor.read.selection();
    operation.finish(id);
    expect(operation.accept()).toEqual({ comments: [] });
    expect(editor.read.value().roots?.header).toEqual([
      p('First'),
      p('middle!'),
      p('Third'),
    ]);
    editor.update.history.undo();
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.selection()).toEqual(beforeSelection);
  });
  for (const change of ['edit', 'delete'] as const) {
    it(`refuses to overwrite a target after ${change}`, () => {
      const { editor } = createTestEditor({ children: [p('old'), p('tail')] });
      editor.update.selection.set(range('old'));
      const operation = createAIChatOperation(editor, () => {});
      const id = operation.start({ mode: 'chat', edit: true });
      operation.receive(id, 'new');
      if (change === 'delete') editor.update.nodes.remove({ at: [0] });
      else editor.update.text.insert('user');
      const before = editor.read.value();
      operation.finish(id);
      expect(operation.accept()).toBe(false);
      expect(operation.current?.status).toBe('error');
      expect(editor.read.value()).toEqual(before);
      expect(editor.read.children()).toBe(before.children);
    });
  }
});
