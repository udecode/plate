import { createBaseEditor } from '@platejs/core';
import { BaseParagraphPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { BaseTodoListPlugin } from './BaseTodoListPlugin';

describe('BaseTodoListPlugin', () => {
  it('inserts a new todo item on line break inside a todo item', () => {
    const editor = createBaseEditor({
      plugins: [BaseTodoListPlugin],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      value: [
        {
          checked: true,
          children: [{ text: 'task' }],
          type: KEYS.listTodoClassic,
        },
      ],
    } as any);

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      {
        checked: true,
        children: [{ text: 'task' }],
        type: KEYS.listTodoClassic,
      },
      {
        checked: false,
        children: [{ text: '' }],
        type: KEYS.listTodoClassic,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('falls back to the base insertBreak outside todo items', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTodoListPlugin],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      value: [{ children: [{ text: 'task' }], type: KEYS.p }],
    } as any);

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'task' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('toggles the selected block to the todo list type', () => {
    const editor = createBaseEditor({
      plugins: [BaseTodoListPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: KEYS.p }],
    } as any);

    editor.plugin(BaseTodoListPlugin).update.toggle();

    expect(editor.read.children()[0].type).toBe(
      editor.getType(KEYS.listTodoClassic)
    );
  });
});
