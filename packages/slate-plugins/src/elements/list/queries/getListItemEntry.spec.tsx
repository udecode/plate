/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { getListItemEntry } from './getListItemEntry';

describe('when the cursor is in a list item paragraph', () => {
  const input = ((
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
  ) as any) as Editor;

  const listNode = (
    <hul>
      <hli>
        <hp>
          1
          <cursor />
        </hp>
      </hli>
    </hul>
  ) as any;

  const listItemNode = (
    <hli>
      <hp>
        1
        <cursor />
      </hp>
    </hli>
  ) as any;

  it('should be', () => {
    const res = getListItemEntry(input);

    expect(res).toEqual({
      list: [listNode, [0]],
      listItem: [listItemNode, [0, 0]],
    });
  });
});

describe('when the cursor is not in a list item', () => {
  const input = ((
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
  ) as any) as Editor;

  it('should be', () => {
    const res = getListItemEntry(input);

    expect(res).toEqual(undefined);
  });
});
