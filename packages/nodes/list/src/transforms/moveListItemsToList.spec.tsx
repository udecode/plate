/** @jsx jsx */

import { findNode, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from 'apps/www/src/lib/createPlateUIEditor';
import { moveListItemsToList } from './moveListItemsToList';

jsx;

const input = (
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
) as any as PlateEditor;

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
) as any as PlateEditor;

it('should', () => {
  const editor = createPlateUIEditor({
    editor: input,
  });

  const fromListItem = findNode(editor, { match: { id: '2' } }) as any;
  const toList = findNode(editor, { match: { id: '1' } }) as any;

  if (fromListItem && toList) {
    moveListItemsToList(editor, { fromListItem, toList });
  }

  expect(editor.children).toEqual(output.children);
});
