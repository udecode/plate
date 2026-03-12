/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../create-editor';
import { withHistory } from './with-history';

jsxt;

const createHistoryEditor = (value: any): any =>
  withHistory(createEditor(value));

describe('withHistory', () => {
  it('does not save selection-only operations', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>Hello</hp>
        </editor>
      ) as any
    );

    editor.select({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });

    expect(editor.history.undos).toHaveLength(0);
    expect(editor.history.redos).toHaveLength(0);
  });

  it('undoes a basic insertText change', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.insertText('text');
    expect(editor.children).toEqual([
      { children: [{ text: 'onetext' }], type: 'p' },
    ]);

    editor.undo();

    expect(editor.children).toEqual([
      { children: [{ text: 'one' }], type: 'p' },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('batches contiguous insertText operations into one undo step', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.insertText('t');
    editor.insertText('w');
    editor.insertText('o');

    expect(editor.history.undos).toHaveLength(1);
    expect(editor.history.undos[0].operations).toHaveLength(3);

    editor.undo();

    expect(editor.children).toEqual([
      { children: [{ text: 'one' }], type: 'p' },
    ]);
  });

  it('merges contiguous remove_text operations into one undo step', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            word
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.delete({ reverse: true });
    editor.delete({ reverse: true });

    expect(editor.children).toEqual([
      { children: [{ text: 'wo' }], type: 'p' },
    ]);
    expect(editor.history.undos).toHaveLength(1);
    expect(editor.history.undos[0].operations).toHaveLength(2);

    editor.undo();

    expect(editor.children).toEqual([
      { children: [{ text: 'word' }], type: 'p' },
    ]);
  });

  it('restores a reverse delete inside a text node', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            wo
            <cursor />
            rd
          </hp>
        </editor>
      ) as any
    );

    editor.delete({ reverse: true });
    expect(editor.children).toEqual([
      { children: [{ text: 'wrd' }], type: 'p' },
    ]);

    editor.undo();

    expect(editor.children).toEqual([
      { children: [{ text: 'word' }], type: 'p' },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
  });

  it('restores custom element props after deleting across blocks', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hblockquote variant="a">
            o<anchor />
            ne
          </hblockquote>
          <hblockquote variant="b">
            tw
            <focus />o
          </hblockquote>
        </editor>
      ) as any
    );

    editor.delete();
    editor.undo();

    expect(editor.children).toEqual([
      { children: [{ text: 'one' }], type: 'blockquote', variant: 'a' },
      { children: [{ text: 'two' }], type: 'blockquote', variant: 'b' },
    ]);
  });

  it('undoes insertBreak and restores the nested selection', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hblockquote>
            <hp>
              on
              <cursor />e
            </hp>
            <hp>two</hp>
          </hblockquote>
        </editor>
      ) as any
    );

    editor.insertBreak();
    editor.undo();

    expect(editor.children).toEqual([
      {
        children: [
          { children: [{ text: 'one' }], type: 'p' },
          { children: [{ text: 'two' }], type: 'p' },
        ],
        type: 'blockquote',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0] },
    });
  });

  it('undoes insertFragment as a single batch', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.insertFragment([
      { children: [{ text: 'A' }], type: 'p' },
      { children: [{ text: 'B' }], type: 'p' },
    ] as any);

    expect(editor.children).toEqual([
      { children: [{ text: 'A' }], type: 'p' },
      { children: [{ text: 'B' }], type: 'p' },
    ]);

    editor.undo();

    expect(editor.children).toEqual([{ children: [{ text: '' }], type: 'p' }]);
  });

  it('does not save operations wrapped in withoutSaving', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.tf.withoutSaving(() => {
      editor.insertText('!');
    });

    expect(editor.children).toEqual([
      { children: [{ text: 'one!' }], type: 'p' },
    ]);
    expect(editor.history.undos).toHaveLength(0);
  });

  it('forces a new batch for the first operation inside withNewBatch', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.insertText('!');
    editor.tf.withNewBatch(() => {
      editor.insertText('?');
    });

    expect(editor.history.undos).toHaveLength(2);
    expect(editor.history.undos[0].operations).toHaveLength(1);
    expect(editor.history.undos[1].operations).toHaveLength(1);
  });

  it('keeps manually applied contiguous insert_text operations in one batch across change cycles', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>one</hp>
        </editor>
      ) as any
    );

    editor.apply({ offset: 3, path: [0, 0], text: '!', type: 'insert_text' });
    editor.operations = [];
    editor.apply({ offset: 4, path: [0, 0], text: '?', type: 'insert_text' });

    expect(editor.children).toEqual([
      { children: [{ text: 'one!?' }], type: 'p' },
    ]);
    expect(editor.history.undos).toHaveLength(1);
    expect(editor.history.undos[0].operations).toHaveLength(2);
  });

  it('keeps manually applied contiguous remove_text operations in one batch across change cycles', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>word</hp>
        </editor>
      ) as any
    );

    editor.apply({ offset: 3, path: [0, 0], text: 'd', type: 'remove_text' });
    editor.operations = [];
    editor.apply({ offset: 2, path: [0, 0], text: 'r', type: 'remove_text' });

    expect(editor.children).toEqual([
      { children: [{ text: 'wo' }], type: 'p' },
    ]);
    expect(editor.history.undos).toHaveLength(1);
    expect(editor.history.undos[0].operations).toHaveLength(2);
  });

  it('starts a fresh batch inside withoutMerging even when the edits are contiguous', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.insertText('!');
    editor.tf.withoutMerging(() => {
      editor.insertText('?');
    });

    expect(editor.history.undos).toHaveLength(2);
    expect(editor.history.undos[0].operations).toHaveLength(1);
    expect(editor.history.undos[1].operations).toHaveLength(1);
  });

  it('trims undo history to the latest 100 batches', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    for (let i = 0; i < 101; i++) {
      editor.tf.withNewBatch(() => {
        editor.insertText(String(i % 10));
      });
    }

    expect(editor.history.undos).toHaveLength(100);
  });

  it('restores the original selection after undoing a delete/blur/refocus flow', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>Hello</hp>
        </editor>
      ) as any
    );

    editor.select({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    editor.select({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
    editor.deleteFragment();
    editor.deselect();
    editor.select({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    editor.undo();

    expect(editor.children).toEqual([
      { children: [{ text: 'Hello' }], type: 'p' },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('redo reapplies the last undone batch', () => {
    const editor = createHistoryEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.insertText('!');
    editor.undo();
    editor.redo();

    expect(editor.children).toEqual([
      { children: [{ text: 'one!' }], type: 'p' },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
  });
});
