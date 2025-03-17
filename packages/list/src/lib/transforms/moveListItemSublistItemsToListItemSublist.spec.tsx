/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

jsxt;

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
  ) as any as SlateEditor;

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
  ) as any as SlateEditor;

  it('should', () => {
    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    const fromListItem = editor.api.node({ id: '12', at: [] }) as any;
    const toListItem = editor.api.node({ id: '11', at: [] }) as any;

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
  ) as any as SlateEditor;

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
  ) as any as SlateEditor;

  it('should', () => {
    const editor = createSlateEditor({
      selection: input.selection,
      value: input.children,
    });

    const fromListItem = editor.api.node({ id: '12', at: [] }) as any;
    const toListItem = editor.api.node({ id: '11', at: [] }) as any;

    if (fromListItem && toListItem) {
      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem,
        toListItem,
      });
    }

    expect(editor.children).toEqual(output.children);
  });
});
