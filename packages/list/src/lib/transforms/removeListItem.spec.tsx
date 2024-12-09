/** @jsx jsxt */

import { type SlateEditor, findNode } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

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
) as any as SlateEditor;

it('should', () => {
  const editor = createPlateEditor({ editor: input });

  const list = findNode(input, { match: { id: '1' } }) as any;
  const listItem = findNode(input, { match: { id: '13' } }) as any;

  if (list && listItem) {
    removeListItem(editor, { list, listItem });
  }

  expect(input.children).toEqual(output.children);
});
