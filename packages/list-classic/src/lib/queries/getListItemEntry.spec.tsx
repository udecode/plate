/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { getListItemEntry } from './getListItemEntry';

jsxt;

it('returns the current list and list item for a top-level list selection', () => {
  const input = (
    <editor>
      <hul>
        <hli>
          <hp>
            1
            <cursor />
          </hp>
        </hli>
      </hul>
    </editor>
  ) as any;
  const editor = createSlateEditor({
    selection: input.selection,
    value: input.children,
  });

  expect(getListItemEntry(editor)).toEqual({
    list: [
      (
        <hul>
          <hli>
            <hp>
              1
              <cursor />
            </hp>
          </hli>
        </hul>
      ) as any,
      [0],
    ],
    listItem: [
      (
        <hli>
          <hp>
            1
            <cursor />
          </hp>
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
          <hp>1</hp>
          <hul>
            <hli>
              <hp>
                2
                <cursor />
              </hp>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;
  const editor = createSlateEditor({
    selection: input.selection,
    value: input.children,
  });

  expect(getListItemEntry(editor)).toEqual({
    list: [
      (
        <hul>
          <hli>
            <hp>
              2
              <cursor />
            </hp>
          </hli>
        </hul>
      ) as any,
      [0, 0, 1],
    ],
    listItem: [
      (
        <hli>
          <hp>
            2
            <cursor />
          </hp>
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
          <hp>
            aa
            <focus />
            aa
          </hp>
          <hul>
            <hli>
              <hp>
                bb
                <anchor />
                bb
              </hp>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;
  const editor = createSlateEditor({
    selection: input.selection,
    value: input.children,
  });

  expect(getListItemEntry(editor)).toEqual({
    list: [
      (
        <hul>
          <hli>
            <hp>aaaa</hp>
            <hul>
              <hli>
                <hp>bbbb</hp>
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
          <hp>
            aa
            <focus />
            aa
          </hp>
          <hul>
            <hli>
              <hp>
                bb
                <anchor />
                bb
              </hp>
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
          <hp>1</hp>
        </hli>
      </hul>
      <hp>
        2<cursor />
      </hp>
    </editor>
  ) as any;
  const editor = createSlateEditor({
    selection: input.selection,
    value: input.children,
  });

  expect(getListItemEntry(editor)).toBeUndefined();
});
