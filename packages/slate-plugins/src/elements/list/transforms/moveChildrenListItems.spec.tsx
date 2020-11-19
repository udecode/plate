/** @jsx jsx */

import { Ancestor, Editor, NodeEntry } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';
import { getNodeById } from '../../../common/queries/getNodeById';
import { moveChildrenListItems } from './moveChildrenListItems';

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
        <hp>21</hp>
      </hli>
      <hli>
        <hp>22</hp>
      </hli>
      <hli>
        <hp>1</hp>
      </hli>
    </hul>
    <hul>
      <hli id="2">
        <hp>2</hp>
        <hul>
          <htext />
        </hul>
      </hli>
    </hul>
  </editor>
) as any) as Editor;

it('should', () => {
  const editor = input;

  const listItem = getNodeById(editor, '2') as NodeEntry<Ancestor>;
  const [, targetListPath] = getNodeById(editor, '1') as NodeEntry<Ancestor>;

  if (listItem && targetListPath) {
    moveChildrenListItems(editor, { listItem, targetListPath });
  }

  expect(input.children).toEqual(output.children);
});
