import { type Element } from '@platejs/plite';
import { BaseParagraphPlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

import { getListNode } from './getListNode';
import { isSameNode } from './isSameNode';
import { nodesWithProps } from './nodesWithProps';

const createEditor = () =>
  createPlateEditor({
    plugins: [BaseParagraphPlugin],
    selection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    },
    initialValue: [{ children: [{ text: '' }], type: 'p' }],
  });

describe('ai chat streaming node utils', () => {
  it('marks restarted lists only when previous list context is absent', () => {
    const editor = createEditor();

    expect(
      getListNode(editor, {
        children: [{ text: '' }],
        listStart: 3,
        listStyleType: 'decimal',
        type: 'p',
      })
    ).toEqual({
      children: [{ text: '' }],
      listRestartPolite: 3,
      listStart: 3,
      listStyleType: 'decimal',
      type: 'p',
    });
  });

  it('compares paragraph list styles before falling back to types', () => {
    const editor = createEditor();
    const disc = {
      children: [{ text: '' }],
      listStyleType: 'disc',
      type: 'p',
    } satisfies Element;

    expect(isSameNode(editor, disc, disc)).toBe(true);
    expect(
      isSameNode(editor, disc, {
        ...disc,
        listStyleType: 'decimal',
      })
    ).toBe(false);
  });

  it('merges element and text props while preserving text content', () => {
    const editor = createEditor();

    expect(
      nodesWithProps(
        editor,
        [
          {
            children: [{ text: 'leaf' }],
            listStart: 2,
            listStyleType: 'decimal',
            type: 'p',
          },
        ],
        {
          elementProps: { foo: 'bar' },
          textProps: { bold: true },
        }
      )
    ).toEqual([
      {
        children: [{ bold: true, text: 'leaf' }],
        foo: 'bar',
        listRestartPolite: 2,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'p',
      },
    ]);
  });
});
