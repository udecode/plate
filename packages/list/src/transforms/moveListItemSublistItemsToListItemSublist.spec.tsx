/** @jsx jsx */

import {
  PlateEditor,
  createPlateEditor,
  findNode,
} from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

jsx;

describe('when there is toListItem sublist', () => {
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
      </hul>
    </editor>
  ) as any as PlateEditor;

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
  ) as any as PlateEditor;

  it('should', () => {
    const editor = createPlateEditor({
      editor: input,
    });

    const fromListItem = findNode(editor, { match: { id: '12' } }) as any;
    const toListItem = findNode(editor, { match: { id: '11' } }) as any;

    if (fromListItem && toListItem) {
      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem,
        toListItem,
      });
    }

    expect(editor.children).toEqual(output.children);
  });
});

describe('when there is no list in toListItem', () => {
  const input = (
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
  ) as any as PlateEditor;

  const output = (
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
  ) as any as PlateEditor;

  it('should', () => {
    const editor = createPlateEditor({
      editor: input,
    });

    const fromListItem = findNode(editor, { match: { id: '12' } }) as any;
    const toListItem = findNode(editor, { match: { id: '11' } }) as any;

    if (fromListItem && toListItem) {
      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem,
        toListItem,
      });
    }

    expect(editor.children).toEqual(output.children);
  });
});
