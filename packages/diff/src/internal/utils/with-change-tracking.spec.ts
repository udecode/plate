import { createEditor, type Value } from '@platejs/plite';

import { withChangeTracking } from './with-change-tracking';

const options = {
  getDeleteProps: () => ({
    diff: true,
    diffOperation: { type: 'delete' },
  }),
  getInsertProps: () => ({
    diff: true,
    diffOperation: { type: 'insert' },
  }),
  getUpdateProps: (_node: any, properties: any, newProperties: any) => ({
    diff: true,
    diffOperation: {
      newProperties,
      properties,
      type: 'update',
    },
  }),
  isInline: () => false,
} as any;

describe('withChangeTracking', () => {
  it('keeps tracking state off the editor root', () => {
    const editor = createEditor();
    const changeTracking = withChangeTracking(editor, options);

    expect(changeTracking.editor).toBe(editor);
    expect('insertedTexts' in editor).toBe(false);
    expect('removedTexts' in editor).toBe(false);
    expect('propsChanges' in editor).toBe(false);
    expect('recordingOperations' in editor).toBe(false);
    expect('applyOperation' in editor).toBe(false);
    expect('commitChangesToDiffs' in editor).toBe(false);
    expect(typeof changeTracking.applyOperation).toBe('function');
    expect(typeof changeTracking.commitChangesToDiffs).toBe('function');
  });

  it('commits removed text back into the document as a delete diff', () => {
    const changeTracking = withChangeTracking(
      createEditor<Value>({
        initialValue: [{ type: 'p', children: [{ text: 'old' }] }],
      }),
      options
    );
    const { editor } = changeTracking;

    editor.update((tx) => {
      changeTracking.applyOperation(tx, {
        type: 'remove_text',
        path: [0, 0],
        offset: 1,
        text: 'l',
      });
    });
    editor.update((tx) => {
      changeTracking.commitChangesToDiffs(tx);
    });

    expect(editor.read.children()).toEqual([
      {
        type: 'p',
        children: [
          { text: 'o' },
          {
            text: 'l',
            diff: true,
            diffOperation: { type: 'delete' },
          },
          { text: 'd' },
        ],
      },
    ]);
  });

  it('skips update diffs for inserted ranges while preserving the inserted node props', () => {
    const changeTracking = withChangeTracking(
      createEditor<Value>({
        initialValue: [{ type: 'p', children: [{ text: 'old' }] }],
      }),
      options
    );
    const { editor } = changeTracking;

    editor.update((tx) => {
      changeTracking.applyOperation(tx, {
        type: 'insert_text',
        path: [0, 0],
        offset: 3,
        text: '!',
      });
    });
    editor.update((tx) => {
      changeTracking.applyOperation(tx, {
        type: 'set_node',
        path: [0, 0],
        properties: {},
        newProperties: { bold: true },
      });
    });
    editor.update((tx) => {
      changeTracking.commitChangesToDiffs(tx);
    });

    expect(editor.read.children()).toEqual([
      {
        type: 'p',
        children: [
          {
            text: 'old',
            bold: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
            },
          },
          {
            text: '!',
            bold: true,
            diff: true,
            diffOperation: { type: 'insert' },
          },
        ],
      },
    ]);
  });
});
