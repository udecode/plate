/** @jsx jsxt */

import { createEditor, createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import { moveListItemsToList } from './moveListItemsToList';

jsxt;

const input = createEditor(
  (
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
  ) as any
);

const output = (
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
) as any;

it('should', () => {
  const editor = createSlateEditor({
    selection: input.selection,
    value: input.children,
  });

  const fromListItem = editor.api.node({ id: '2', at: [] }) as any;
  const toList = editor.api.node({ id: '1', at: [] }) as any;

  if (fromListItem && toList) {
    moveListItemsToList(editor, { fromListItem, toList });
  }

  expect(editor.children).toEqual(output.children);
});
