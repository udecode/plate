/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('above', () => {
  it('returns the highest matching block ancestor', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            <hblockquote>one</hblockquote>
          </hp>
        </editor>
      ) as any
    );

    const above = editor.api.above({
      at: [0, 0, 0],
      block: true,
      mode: 'highest',
    });

    expect(above).toEqual([editor.children[0], [0]]);
  });

  it('returns the lowest matching block ancestor', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            <hblockquote>one</hblockquote>
          </hp>
        </editor>
      ) as any
    );

    const above = editor.api.above({
      at: [0, 0, 0],
      block: true,
      mode: 'lowest',
    });
    const expected: [any, number[]] = [
      editor.children[0].children[0] as any,
      [0, 0],
    ];

    expect(above).toEqual(expected);
  });

  it('matches inline ancestors', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            one
            <ha>two</ha>
            three
          </hp>
        </editor>
      ) as any
    ) as any;
    const { isInline } = editor;

    editor.isInline = (element: any) =>
      element.type === 'a' || isInline(element);

    const above = editor.api.above({
      at: [0, 1, 0],
      match: (node: any) => 'type' in node && editor.isInline(node),
    });

    expect(above).toEqual([editor.children[0].children[1], [0, 1]]);
  });

  it('returns the parent block even when the exact path does not exist', () => {
    const editor = createEditor({
      children: [
        {
          children: [
            {
              children: [{ children: [{ text: 'one' }], type: 'code' }],
              type: 'blockquote',
            },
            { children: [{ text: 'two' }], type: 'blockquote' },
          ],
          type: 'p',
        },
      ] as any,
    });

    const above = editor.api.above({
      at: [0, 0, 1],
      block: true,
    });

    expect(above).toEqual([editor.children[0].children[0], [0, 0]]);
  });

  it('returns undefined instead of throwing for an invalid path', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>one</hp>
        </editor>
      ) as any
    );

    expect(editor.api.above({ at: [9, 9, 9], block: true })).toBeUndefined();
  });
});
