import { createBaseEditor } from '@platejs/core';
import { NODES } from '@platejs/utils';

import { BaseTodoListPlugin } from '../BaseTodoListPlugin';
import { insertTodoListItem } from './insertTodoListItem';

const createTodoEditor = (offset?: number) =>
  createBaseEditor({
    plugins: [BaseTodoListPlugin],
    selection:
      offset === undefined
        ? null
        : {
            kind: 'text',
            anchor: { offset, path: [0, 0] },
            focus: { offset, path: [0, 0] },
          },
    initialValue: [
      {
        checked: true,
        children: [{ text: 'one' }],
        type: NODES.listTodoClassic,
      },
    ],
  });

describe('insertTodoListItem', () => {
  it('returns false without a selection', () => {
    const editor = createTodoEditor();
    let result = true;

    editor.update((tx) => {
      result = insertTodoListItem(editor, tx);
    });

    expect(result).toBe(false);
  });

  it('inserts before at the start', () => {
    const editor = createTodoEditor(0);

    editor.update((tx) => {
      insertTodoListItem(editor, tx);
    });

    expect(editor.read.children()).toMatchObject([
      { checked: false, children: [{ text: '' }] },
      { checked: true, children: [{ text: 'one' }] },
    ]);
  });

  it('inserts after at the end and selects it', () => {
    const editor = createTodoEditor(3);

    editor.update((tx) => {
      insertTodoListItem(editor, tx);
    });

    expect(editor.read.children()).toMatchObject([
      { checked: true, children: [{ text: 'one' }] },
      { checked: false, children: [{ text: '' }] },
    ]);
    expect(editor.read.selection()?.anchor.path).toEqual([1, 0]);
  });
});
