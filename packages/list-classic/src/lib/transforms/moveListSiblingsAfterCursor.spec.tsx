/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt } from '@platejs/test-utils';

import { moveListSiblingsAfterCursor } from './moveListSiblingsAfterCursor';

jsxt;

describe('moveListSiblingsAfterCursor', () => {
  it('moves the following list items into the destination list', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>1</hp>
          </hli>
          <hli>
            <hp>2</hp>
          </hli>
          <hli>
            <hp>3</hp>
          </hli>
        </hul>
        <hul>
          <hli>
            <hp>x</hp>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      value: input.children,
    });

    let result = false;

    editor.update((tx) => {
      result = !!moveListSiblingsAfterCursor(editor, tx, {
        at: [0, 0],
        to: [1, 1],
      });
    });

    expect(result).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            children: [{ children: [{ text: '1' }], type: 'p' }],
            type: 'li',
          },
        ],
        type: 'ul',
      },
      {
        children: [
          {
            children: [{ children: [{ text: 'x' }], type: 'p' }],
            type: 'li',
          },
          {
            children: [{ children: [{ text: '2' }], type: 'p' }],
            type: 'li',
          },
          {
            children: [{ children: [{ text: '3' }], type: 'p' }],
            type: 'li',
          },
        ],
        type: 'ul',
      },
    ]);
  });

  it('returns false when the destination stays inside the same list', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hp>1</hp>
          </hli>
          <hli>
            <hp>2</hp>
          </hli>
        </hul>
      </editor>
    ) as any;

    const editor = createBaseEditor({
      value: input.children,
    });

    let result = true;

    editor.update((tx) => {
      result = !!moveListSiblingsAfterCursor(editor, tx, {
        at: [0, 0],
        to: [0, 1],
      });
    });

    expect(result).toBe(false);
    expect(editor.read.children()).toEqual(input.children);
  });
});
