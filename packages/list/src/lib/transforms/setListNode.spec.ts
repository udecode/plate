import { createSlateEditor, KEYS } from 'platejs';

import { ListStyleType } from '../types';
import { setIndentTodoNode, setListNode } from './setListNode';

const createTransformEditor = (children: any[]) =>
  createSlateEditor({
    value: children,
  });

describe('setListNode', () => {
  it('defaults to indent 1 and disc list style', () => {
    const editor = createTransformEditor([
      {
        children: [{ text: 'Item' }],
        type: KEYS.p,
      },
    ]);

    setListNode(editor, { at: [0] });

    expect(editor.children[0]).toMatchObject({
      [KEYS.indent]: 1,
      [KEYS.listType]: ListStyleType.Disc,
      type: KEYS.p,
    });
  });

  it('keeps a non-zero indent and custom list style', () => {
    const editor = createTransformEditor([
      {
        children: [{ text: 'Item' }],
        type: KEYS.p,
      },
    ]);

    setListNode(editor, {
      at: [0],
      indent: 3,
      listStyleType: 'decimal',
    });

    expect(editor.children[0]).toMatchObject({
      [KEYS.indent]: 3,
      [KEYS.listType]: 'decimal',
      type: KEYS.p,
    });
  });
});

describe('setIndentTodoNode', () => {
  it('defaults to indent 1, todo list type, and unchecked state', () => {
    const editor = createTransformEditor([
      {
        children: [{ text: 'Todo' }],
        type: KEYS.p,
      },
    ]);

    setIndentTodoNode(editor, { at: [0] });

    expect(editor.children[0]).toMatchObject({
      [KEYS.indent]: 1,
      [KEYS.listChecked]: false,
      [KEYS.listType]: KEYS.listTodo,
      type: KEYS.p,
    });
  });

  it('keeps a non-zero indent for todo nodes', () => {
    const editor = createTransformEditor([
      {
        children: [{ text: 'Todo' }],
        type: KEYS.p,
      },
    ]);

    setIndentTodoNode(editor, {
      at: [0],
      indent: 2,
    });

    expect(editor.children[0]).toMatchObject({
      [KEYS.indent]: 2,
      [KEYS.listChecked]: false,
      [KEYS.listType]: KEYS.listTodo,
      type: KEYS.p,
    });
  });
});
