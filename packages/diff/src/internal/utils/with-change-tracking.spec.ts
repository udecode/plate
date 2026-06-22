import { createEditor, type Descendant } from '@platejs/slate';

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
  getUpdateProps: (_node: Descendant, properties: any, newProperties: any) => ({
    diff: true,
    diffOperation: {
      newProperties,
      properties,
      type: 'update',
    },
  }),
  isInline: () => false,
};

describe('withChangeTracking', () => {
  it('initializes tracking state and exposes an apply wrapper', () => {
    const editor = withChangeTracking(createEditor(), options);

    expect(editor.insertedTexts).toEqual([]);
    expect(editor.removedTexts).toEqual([]);
    expect(editor.propsChanges).toEqual([]);
    expect(editor.recordingOperations).toBe(true);
    expect(typeof editor.apply).toBe('function');
  });

  it('commits removed text back into the document as a delete diff', () => {
    const editor = withChangeTracking(createEditor(), options);

    editor.replaceChildren([{ type: 'p', children: [{ text: 'old' }] }]);
    editor.apply({
      type: 'remove_text',
      path: [0, 0],
      offset: 1,
      text: 'l',
    });
    editor.commitChangesToDiffs();

    expect(editor.editor.read((state) => state.value.root())).toEqual([
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

    editor.replaceChildren([{ type: 'p', children: [{ text: 'old' }] }]);
    editor.apply({
      type: 'insert_text',
      path: [0, 0],
      offset: 3,
      text: '!',
    });
    editor.apply({
      type: 'set_node',
      path: [0, 0],
      properties: {},
      newProperties: { bold: true },
    });
    editor.commitChangesToDiffs();

    expect(editor.editor.read((state) => state.value.root())).toEqual([
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
