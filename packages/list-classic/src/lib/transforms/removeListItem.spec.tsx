/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import type { SlateEditor } from '@platejs/core';
import { createListClassicTestEditor as createSlateEditor } from '../__tests__/createListClassicTestEditor';

import { removeListItem } from './removeListItem';

jsxt;

const input = (
  <editor>
    <hul id="1">
      <hli id="11">
        <hp>1</hp>
        <hul>
          <hli>
            <hp>11</hp>
          </hli>
          <hli>
            <hp>12</hp>
          </hli>
        </hul>
      </hli>
      <hli id="12">
        <hp>2</hp>
        <hul>
          <hli>
            <hp>21</hp>
          </hli>
          <hli>
            <hp>22</hp>
          </hli>
        </hul>
      </hli>
      <hli id="13">
        <hp>3</hp>
        <hul>
          <hli>
            <hp>31</hp>
          </hli>
          <hli>
            <hp>32</hp>
          </hli>
        </hul>
      </hli>
    </hul>
  </editor>
) as any as SlateEditor;

const output = (
  <editor>
    <hul id="1">
      <hli id="11">
        <hp>1</hp>
        <hul>
          <hli>
            <hp>11</hp>
          </hli>
          <hli>
            <hp>12</hp>
          </hli>
        </hul>
      </hli>
      <hli id="12">
        <hp>2</hp>
        <hul>
          <hli>
            <hp>21</hp>
          </hli>
          <hli>
            <hp>22</hp>
          </hli>
          <hli>
            <hp>31</hp>
          </hli>
          <hli>
            <hp>32</hp>
          </hli>
        </hul>
      </hli>
      <hli id="13">
        <hp>3</hp>
      </hli>
    </hul>
  </editor>
) as any;

it('moves the removed item children into the previous sublist', () => {
  const editor = createSlateEditor({
    selection: input.selection,
    value: input.children,
  });

  const list = editor.api.node({ id: '1', at: [] }) as any;
  const listItem = editor.api.node({ id: '13', at: [] }) as any;

  if (list && listItem) {
    removeListItem(editor, { list, listItem });
  }

  expect(editor.children).toEqual(output.children);
});
