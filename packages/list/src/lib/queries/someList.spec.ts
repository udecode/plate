import { createSlateEditor, KEYS } from 'platejs';

import { someList } from './someList';

const createListEditor = ({
  children,
  selection,
}: {
  children: any[];
  selection?: {
    anchor: { offset: number; path: number[] };
    focus: { offset: number; path: number[] };
  };
}) =>
  createSlateEditor({
    selection,
    value: children as any,
  });

describe('someList', () => {
  it('returns false when the editor has no selection', () => {
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

    expect(someList(editor, 'disc')).toBe(false);
  });

  it('returns true when the selection is inside a matching list item', () => {
    const editor = createListEditor({
      children: [
        {
          [KEYS.indent]: 1,
          [KEYS.listType]: 'disc',
          children: [{ text: 'Item' }],
          type: 'p',
        },
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    expect(someList(editor, 'disc')).toBe(true);
  });

  it('ignores todo list nodes with their own checked property', () => {
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
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    expect(someList(editor, KEYS.listTodo)).toBe(false);
  });

  it('supports matching against multiple list types', () => {
    const editor = createListEditor({
      children: [
        {
          [KEYS.indent]: 1,
          [KEYS.listType]: 'circle',
          children: [{ text: 'Item' }],
          type: 'p',
        },
      ],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    expect(someList(editor, ['decimal', 'circle'])).toBe(true);
  });
});
