/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';
import { findNode } from '../../../common/queries/findNode';
import { removeListItem } from './removeListItem';

const input = ((
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
) as any) as Editor;

const output = ((
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
) as any) as Editor;

it('should', () => {
  const editor = input;

  const list = findNode(input, { match: { id: '1' } }) as any;
  const listItem = findNode(input, { match: { id: '13' } }) as any;

  if (list && listItem) {
    removeListItem(editor, { list, listItem });
  }

  expect(input.children).toEqual(output.children);
});
