/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { hasListChild } from './hasListChild';

jsxt;

it.each([
  {
    expected: true,
    input: (
      <editor>
        <hul>
          <hli id="2">
            <hp>2</hp>
            <hul>
              <hli>
                <hp>21</hp>
              </hli>
              <hli>
                <hp>
                  22
                  <cursor />
                </hp>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any,
    title: 'returns true when the list item contains a nested list',
  },
  {
    expected: false,
    input: (
      <editor>
        <hul>
          <hli id="2">
            <hp>2</hp>
          </hli>
        </hul>
      </editor>
    ) as any,
    title: 'returns false when the list item has no nested list',
  },
])('$title', ({ expected, input }) => {
  const editor = createSlateEditor({
    selection: input.selection,
    value: input.children,
  });
  const listItem = editor.api.node({ at: [], id: '2' });

  expect(hasListChild(editor, listItem?.[0] as any)).toBe(expected);
});
