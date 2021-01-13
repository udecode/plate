/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';
import { findNode } from '../../../common/queries/findNode';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

describe('when there is toListItem sublist', () => {
  const input = ((
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
      </hul>
    </editor>
  ) as any) as Editor;

  const output = ((
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
            <hli>
              <hp>21</hp>
            </hli>
            <hli>
              <hp>22</hp>
            </hli>
          </hul>
        </hli>
        <hli id="12">
          <hp>2</hp>
        </hli>
      </hul>
    </editor>
  ) as any) as Editor;

  it('should', () => {
    const editor = input;

    const fromListItem = findNode(input, { match: { id: '12' } }) as any;
    const toListItem = findNode(input, { match: { id: '11' } }) as any;

    if (fromListItem && toListItem) {
      moveListItemSublistItemsToListItemSublist(
        editor,
        {
          fromListItem,
          toListItem,
        },
        {}
      );
    }

    expect(input.children).toEqual(output.children);
  });
});

describe('when there is no list in toListItem', () => {
  const input = ((
    <editor>
      <hul id="1">
        <hli id="11">
          <hp>1</hp>
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
      </hul>
    </editor>
  ) as any) as Editor;

  const output = ((
    <editor>
      <hul id="1">
        <hli id="11">
          <hp>1</hp>
          <hul>
            <hli>
              <hp>21</hp>
            </hli>
            <hli>
              <hp>22</hp>
            </hli>
          </hul>
        </hli>
        <hli id="12">
          <hp>2</hp>
        </hli>
      </hul>
    </editor>
  ) as any) as Editor;

  it('should', () => {
    const editor = input;

    const fromListItem = findNode(input, { match: { id: '12' } }) as any;
    const toListItem = findNode(input, { match: { id: '11' } }) as any;

    if (fromListItem && toListItem) {
      moveListItemSublistItemsToListItemSublist(
        editor,
        {
          fromListItem,
          toListItem,
        },
        {}
      );
    }

    expect(input.children).toEqual(output.children);
  });
});
