/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { moveListItemsToList } from './moveListItemsToList';

jsxt;

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
) as TestEditor;

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

it('moves sublist items into the target list', () => {
  const editor = createBaseEditor({
    selection: input.selection,
    value: input.children,
  });

  const fromListItem = editor.read.nodes.find({
    at: [],
    match: { id: '2' },
  }) as any;
  const toList = editor.read.nodes.find({
    at: [],
    match: { id: '1' },
  }) as any;

  if (fromListItem && toList) {
    editor.update((tx) => {
      moveListItemsToList(editor, tx, { fromListItem, toList });
    });
  }

  expect(editor.read.children()).toEqual(output.children);
});
