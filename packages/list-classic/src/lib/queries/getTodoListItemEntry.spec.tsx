import { KEYS, createSlateEditor } from 'platejs';

import { getTodoListItemEntry } from './getTodoListItemEntry';

const createTodoEditor = ({
  at,
  value = [
    {
      type: KEYS.taskList,
      children: [
        {
          checked: false,
          children: [{ text: 'one' }],
          type: KEYS.listTodoClassic,
        },
        {
          checked: true,
          children: [{ text: 'two' }],
          type: KEYS.listTodoClassic,
        },
      ],
    },
    {
      type: 'p',
      children: [{ text: 'tail' }],
    },
  ],
}: {
  at?: any;
  value?: any[];
} = {}) =>
  createSlateEditor({
    selection: at,
    value,
  });

describe('getTodoListItemEntry', () => {
  it('returns the nearest todo item and parent task list for a collapsed selection', () => {
    const editor = createTodoEditor({
      at: {
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
      },
    });

    const result = getTodoListItemEntry(editor);

    expect(result?.list[0].type).toBe(KEYS.taskList);
    expect(result?.list[1]).toEqual([0]);
    expect(result?.listItem[0]).toMatchObject({
      checked: true,
      type: KEYS.listTodoClassic,
    });
    expect(result?.listItem[1]).toEqual([0, 1]);
  });

  it('uses the focus path for expanded selections', () => {
    const editor = createTodoEditor({
      at: {
        anchor: { offset: 2, path: [1, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
    });

    const result = getTodoListItemEntry(editor);

    expect(result?.list[1]).toEqual([0]);
    expect(result?.listItem[1]).toEqual([0, 0]);
    expect(result?.listItem[0]).toMatchObject({
      checked: false,
      type: KEYS.listTodoClassic,
    });
  });

  it('accepts an explicit path', () => {
    const editor = createTodoEditor();

    const result = getTodoListItemEntry(editor, { at: [0, 1, 0] });

    expect(result?.list[1]).toEqual([0]);
    expect(result?.listItem[1]).toEqual([0, 1]);
  });

  it('returns undefined for non-todo and missing paths', () => {
    const editor = createTodoEditor();

    expect(getTodoListItemEntry(editor, { at: [1, 0] })).toBeUndefined();
    expect(getTodoListItemEntry(editor, { at: [9, 9, 9] })).toBeUndefined();
  });
});
