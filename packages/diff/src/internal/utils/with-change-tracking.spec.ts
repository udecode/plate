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
  it('initializes tracking state', () => {
    const editor = withChangeTracking(createEditor(), options);

    expect(editor.insertedTexts).toEqual([]);
    expect(editor.removedTexts).toEqual([]);
    expect(editor.propsChanges).toEqual([]);
    expect(editor.recordingOperations).toBe(true);
    expect(typeof editor.applyOperation).toBe('function');
  });

  it('commits removed text back into the document as a delete diff', () => {
    const editor = withChangeTracking(
      createEditor<Value>({
        initialValue: [{ type: 'p', children: [{ text: 'old' }] }],
      }),
      options
    );

    editor.update((tx) => {
      editor.applyOperation(tx, {
        type: 'remove_text',
        path: [0, 0],
        offset: 1,
        text: 'l',
      });
    });
    editor.update((tx) => {
      editor.commitChangesToDiffs(tx);
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
    const editor = withChangeTracking(
      createEditor<Value>({
        initialValue: [{ type: 'p', children: [{ text: 'old' }] }],
      }),
      options
    );

    editor.update((tx) => {
      editor.applyOperation(tx, {
        type: 'insert_text',
        path: [0, 0],
        offset: 3,
        text: '!',
      });
    });
    editor.update((tx) => {
      editor.applyOperation(tx, {
        type: 'set_node',
        path: [0, 0],
        properties: {},
        newProperties: { bold: true },
      });
    });
    editor.update((tx) => {
      editor.commitChangesToDiffs(tx);
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
