/** @jsx jsx */

import { Ancestor, Editor, NodeEntry } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';
import { getNodeById } from '../../../common/queries/getNodeById';
import { moveListItemSublistItemsToList } from './moveListItemSublistItemsToList';

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

  const fromListItem = getNodeById(editor, '2') as NodeEntry<Ancestor>;
  const toList = getNodeById(editor, '1') as NodeEntry<Ancestor>;

  if (fromListItem && toList) {
    moveListItemSublistItemsToList(editor, { fromListItem, toList }, {});
  }

  expect(input.children).toEqual(output.children);
});
