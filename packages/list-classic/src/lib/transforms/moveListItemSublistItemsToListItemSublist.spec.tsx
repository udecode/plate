/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import type { BasePlateEditor } from '@platejs/core';
import { createListClassicTestEditor as createBasePlateEditor } from '../__tests__/createListClassicTestEditor';

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
  ) as any as BasePlateEditor;

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
  ) as any as BasePlateEditor;

  it('moves sublist items into the existing destination sublist', () => {
    const editor = createBasePlateEditor({
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

  it('can prepend the moved items when start is true', () => {
    const editor = createBasePlateEditor({
      selection: input.selection,
      value: input.children,
    });

    const fromListItem = editor.api.node({ id: '12', at: [] }) as any;
    const toListItem = editor.api.node({ id: '11', at: [] }) as any;

    if (fromListItem && toListItem) {
      moveListItemSublistItemsToListItemSublist(editor, {
        fromListItem,
        start: true,
        toListItem,
      });
    }

    expect(editor.children).toEqual(
      (
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
            </hli>
          </hul>
        </editor>
      ).children
    );
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
  ) as any as BasePlateEditor;

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
  ) as any as BasePlateEditor;

  it('creates a destination sublist before moving the items', () => {
    const editor = createBasePlateEditor({
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
