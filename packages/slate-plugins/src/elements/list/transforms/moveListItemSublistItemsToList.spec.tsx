/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';
import { findNode } from '../../../common/queries/findNode';
import { moveListItemsToList } from './moveListItemsToList';

const input = ((
  <editor>
    <hul id="1">
      <hli>
        <hp>1</hp>
      </hli>
    </hul>
    <hul>
      <hli id="2">
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
    </hul>
  </editor>
) as any) as Editor;

const output = ((
  <editor>
    <hul id="1">
      <hli>
        <hp>1</hp>
      </hli>
      <hli>
        <hp>21</hp>
      </hli>
      <hli>
        <hp>22</hp>
      </hli>
    </hul>
    <hul>
      <hli id="2">
        <hp>2</hp>
      </hli>
    </hul>
  </editor>
) as any) as Editor;

it('should', () => {
  const editor = input;

  const fromListItem = findNode(input, { match: { id: '2' } }) as any;
  const toList = findNode(input, { match: { id: '1' } }) as any;

  if (fromListItem && toList) {
    moveListItemsToList(editor, { fromListItem, toList }, {});
  }

  expect(input.children).toEqual(output.children);
});
