/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

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
) as TestEditor;

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
  const editor = createBaseEditor({
    selection: input.selection,
    value: input.children,
  });

  const list = editor.read.nodes.find({ at: [], match: { id: '1' } }) as any;
  const listItem = editor.read.nodes.find({
    at: [],
    match: { id: '13' },
  }) as any;

  if (list && listItem) {
    editor.update((tx) => {
      removeListItem(editor, tx, { list, listItem });
    });
  }

  expect(editor.read.children()).toEqual(output.children);
});
