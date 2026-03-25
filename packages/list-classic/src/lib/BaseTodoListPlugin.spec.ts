import { BaseParagraphPlugin, KEYS, createSlateEditor } from 'platejs';

import { BaseTodoListPlugin } from './BaseTodoListPlugin';

describe('BaseTodoListPlugin', () => {
  it('inserts a new todo item on line break inside a todo item', () => {
    const editor = createSlateEditor({
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

    editor.tf.insertBreak();

    expect(editor.children).toEqual([
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
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('falls back to the base insertBreak outside todo items', () => {
    const editor = createSlateEditor({
      plugins: [BaseParagraphPlugin, BaseTodoListPlugin],
      selection: {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      },
      value: [{ children: [{ text: 'task' }], type: KEYS.p }],
    } as any);

    editor.tf.insertBreak();

    expect(editor.children).toEqual([
      {
        children: [{ text: 'task' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('binds the toggle transform to the todo list type', () => {
    const editor = createSlateEditor({
      plugins: [BaseTodoListPlugin],
    } as any);
    const transforms = editor.getTransforms(BaseTodoListPlugin) as any;
    const spy = spyOn(editor.tf, 'toggleBlock');

    transforms.action_item.toggle();

    expect(spy).toHaveBeenCalledWith(editor.getType(KEYS.listTodoClassic));
  });
});
