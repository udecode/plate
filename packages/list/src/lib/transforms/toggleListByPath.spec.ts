import { createBaseEditor } from '@platejs/core';
import { KEYS } from 'platejs';

import { toggleListByPath, toggleListByPathUnSet } from './toggleListByPath';

const createTransformEditor = (children: any[]) =>
  createBaseEditor({
    value: children,
  });

describe('toggleListByPath', () => {
  it('sets paragraph list metadata and defaults indent to 1', () => {
    const editor = createTransformEditor([
      {
        children: [{ text: 'Item' }],
        type: 'h1',
      },
    ]);

    toggleListByPath(editor, [editor.read.children()[0], [0]], 'decimal');

    expect(editor.read.children()).toEqual([
      {
        [KEYS.indent]: 1,
        [KEYS.listChecked]: false,
        [KEYS.listType]: 'decimal',
        children: [{ text: 'Item' }],
        type: KEYS.p,
      },
    ]);
  });

  it('preserves an existing indent when toggling a list item', () => {
    const editor = createTransformEditor([
      {
        [KEYS.indent]: 3,
        children: [{ text: 'Item' }],
        type: KEYS.p,
      },
    ]);

    toggleListByPath(editor, [editor.read.children()[0], [0]], 'circle');

    expect(editor.read.children()[0]).toMatchObject({
      [KEYS.indent]: 3,
      [KEYS.listChecked]: false,
      [KEYS.listType]: 'circle',
      type: KEYS.p,
    });
  });

  it('unsets list metadata without touching the text content', () => {
    const editor = createTransformEditor([
      {
        [KEYS.indent]: 2,
        [KEYS.listChecked]: true,
        [KEYS.listType]: 'disc',
        children: [{ text: 'Item' }],
        type: KEYS.p,
      },
    ]);

    toggleListByPathUnSet(editor, [editor.read.children()[0], [0]]);

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Item' }],
        type: KEYS.p,
      },
    ]);
  });
});
