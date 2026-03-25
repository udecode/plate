import { createEditor } from 'platejs';

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
  it('initializes tracking state and syncs editor.tf.apply', () => {
    const editor = withChangeTracking(createEditor(), options);

    expect(editor.insertedTexts).toEqual([]);
    expect(editor.removedTexts).toEqual([]);
    expect(editor.propsChanges).toEqual([]);
    expect(editor.recordingOperations).toBe(true);
    expect(editor.tf.apply as any).toBe(editor.apply as any);
  });

  it('commits removed text back into the document as a delete diff', () => {
    const editor = withChangeTracking(createEditor(), options);

    editor.children = [{ type: 'p', children: [{ text: 'old' }] }] as any;
    editor.tf.apply({
      type: 'remove_text',
      path: [0, 0],
      offset: 1,
      text: 'l',
    });
    editor.commitChangesToDiffs();

    expect(editor.children).toEqual([
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
    const editor = withChangeTracking(createEditor(), options);

    editor.children = [{ type: 'p', children: [{ text: 'old' }] }] as any;
    editor.tf.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 3,
      text: '!',
    });
    editor.tf.apply({
      type: 'set_node',
      path: [0, 0],
      properties: {},
      newProperties: { bold: true },
    });
    editor.commitChangesToDiffs();

    expect(editor.children).toEqual([
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
