/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { getListItemEntry } from './getListItemEntry';

jsxt;

it('returns the current list and list item for a top-level list selection', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>
            1
            <cursor />
          </hlic>
        </hli>
      </hul>
    </editor>
  ) as any;
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  expect(getListItemEntry(editor)).toEqual({
    list: [
      (
        <hul>
          <hli>
            <hlic>
              1
              <cursor />
            </hlic>
          </hli>
        </hul>
      ) as any,
      [0],
    ],
    listItem: [
      (
        <hli>
          <hlic>
            1
            <cursor />
          </hlic>
        </hli>
      ) as any,
      [0, 0],
    ],
  });
});

it('returns the nearest nested list and list item for a nested selection', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>1</hlic>
          <hul>
            <hli>
              <hlic>
                2
                <cursor />
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  expect(getListItemEntry(editor)).toEqual({
    list: [
      (
        <hul>
          <hli>
            <hlic>
              2
              <cursor />
            </hlic>
          </hli>
        </hul>
      ) as any,
      [0, 0, 1],
    ],
    listItem: [
      (
        <hli>
          <hlic>
            2
            <cursor />
          </hlic>
        </hli>
      ) as any,
      [0, 0, 1, 0],
    ],
  });
});

it('uses the focus path for expanded selections', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>
            aa
            <focus />
            aa
          </hlic>
          <hul>
            <hli>
              <hlic>
                bb
                <anchor />
                bb
              </hlic>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  expect(getListItemEntry(editor)).toEqual({
    list: [
      (
        <hul>
          <hli>
            <hlic>aaaa</hlic>
            <hul>
              <hli>
                <hlic>bbbb</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      ) as any,
      [0],
    ],
    listItem: [
      (
        <hli>
          <hlic>
            aa
            <focus />
            aa
          </hlic>
          <hul>
            <hli>
              <hlic>
                bb
                <anchor />
                bb
              </hlic>
            </hli>
          </hul>
        </hli>
      ) as any,
      [0, 0],
    ],
  });
});

it('returns undefined when the selection is outside of a list item', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hlic>1</hlic>
        </hli>
      </hul>
      <hp>
        2<cursor />
      </hp>
    </editor>
  ) as any;
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });

  expect(getListItemEntry(editor)).toBeUndefined();
});
