import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';
import { KEYS } from '@platejs/utils';

import { indentList, indentTodo } from './indentList';
import { outdentList } from './outdentList';

describe('indentList helpers', () => {
  const createEditor = (element: Record<string, unknown>) =>
    createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseIndentPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: KEYS.p, ...element }],
    });

  it('indents standard list blocks', () => {
    const editor = createEditor({});

    indentList(editor, {
      at: [0],
      listStyleType: 'square',
    });

    expect(editor.read.children()[0]).toMatchObject({
      [KEYS.indent]: 1,
      [KEYS.listType]: 'square',
    });
  });

  it('indents todo blocks with unchecked state', () => {
    const editor = createEditor({});

    indentTodo(editor, {
      listStyleType: KEYS.listTodo,
    });

    expect(editor.read.children()[0]).toMatchObject({
      [KEYS.indent]: 1,
      [KEYS.listChecked]: false,
      [KEYS.listType]: KEYS.listTodo,
    });
  });

  it('outdents list blocks and removes list metadata at zero', () => {
    const editor = createEditor({
      [KEYS.indent]: 1,
      [KEYS.listChecked]: false,
      [KEYS.listType]: KEYS.listTodo,
    });

    outdentList(editor);

    expect(editor.read.children()[0]).toEqual({
      children: [{ text: '' }],
      type: KEYS.p,
    });
  });
});
