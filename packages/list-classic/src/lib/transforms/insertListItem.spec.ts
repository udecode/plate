import { createBaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { insertListItem } from './insertListItem';

const createListEditor = (offset?: number) =>
  createBaseEditor({
    plugins: [BaseListPlugin],
    selection:
      offset === undefined
        ? null
        : {
            kind: 'text',
            anchor: { offset, path: [0, 0, 0] },
            focus: { offset, path: [0, 0, 0] },
          },
    initialValue: [
      {
        children: [
          {
            checked: true,
            children: [{ children: [{ text: 'one' }], type: KEYS.lic }],
            type: KEYS.li,
          },
        ],
        type: KEYS.taskList,
      },
    ],
  });

describe('insertListItem', () => {
  it('returns false without a selection', () => {
    const editor = createListEditor();
    let result = true;

    editor.update((tx) => {
      result = insertListItem(editor, tx);
    });

    expect(result).toBe(false);
  });

  it('inserts before at the start and inherits the task state', () => {
    const editor = createListEditor(0);

    editor.update((tx) => {
      insertListItem(editor, tx, {
        inheritCheckStateOnLineStartBreak: true,
      });
    });

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { checked: true, children: [{ children: [{ text: '' }] }] },
        { checked: true, children: [{ children: [{ text: 'one' }] }] },
      ],
    });
  });

  it('inserts after at the end and selects it', () => {
    const editor = createListEditor(3);

    editor.update((tx) => {
      insertListItem(editor, tx, {
        inheritCheckStateOnLineEndBreak: true,
      });
    });

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { checked: true, children: [{ children: [{ text: 'one' }] }] },
        { checked: true, children: [{ children: [{ text: '' }] }] },
      ],
    });
    expect(editor.read.selection()?.anchor.path).toEqual([0, 1, 0, 0]);
  });
});
