import { createSlateEditor, KEYS } from 'platejs';

import { someTodoList } from './someTodoList';

const createListEditor = ({ children }: { children: any[] }) =>
  createSlateEditor({
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    value: children as any,
  });

describe('someTodoList', () => {
  it('returns true for a todo paragraph with checked metadata', () => {
    const editor = createListEditor({
      children: [
        {
          [KEYS.indent]: 1,
          [KEYS.listChecked]: false,
          [KEYS.listType]: KEYS.listTodo,
          children: [{ text: 'Todo' }],
          type: 'p',
        },
      ],
    });

    expect(someTodoList(editor)).toBe(true);
  });

  it('returns false for a regular list paragraph', () => {
    const editor = createListEditor({
      children: [
        {
          [KEYS.indent]: 1,
          [KEYS.listType]: 'disc',
          children: [{ text: 'Item' }],
          type: 'p',
        },
      ],
    });

    expect(someTodoList(editor)).toBe(false);
  });

  it('returns false when the checked node is not a paragraph', () => {
    const editor = createListEditor({
      children: [
        {
          [KEYS.indent]: 1,
          [KEYS.listChecked]: false,
          [KEYS.listType]: KEYS.listTodo,
          children: [{ text: 'Title' }],
          type: 'h1',
        },
      ],
    });

    expect(someTodoList(editor)).toBe(false);
  });
});
