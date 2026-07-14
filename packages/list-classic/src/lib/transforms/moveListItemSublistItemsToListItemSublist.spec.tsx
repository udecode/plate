/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

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
  ) as TestEditor;

  it('moves sublist items into the existing destination sublist', () => {
    const editor = createBaseEditor({
      selection: input.selection,
      value: input.children,
    });

    const fromListItem = editor.read.nodes.find({
      at: [],
      match: { id: '12' },
    }) as any;
    const toListItem = editor.read.nodes.find({
      at: [],
      match: { id: '11' },
    }) as any;

    if (fromListItem && toListItem) {
      editor.update((tx) => {
        moveListItemSublistItemsToListItemSublist(editor, tx, {
          fromListItem,
          toListItem,
        });
      });
    }

    expect(editor.read.children()).toEqual(output.children);
  });

  it('can prepend the moved items when start is true', () => {
    const editor = createBaseEditor({
      selection: input.selection,
      value: input.children,
    });

    const fromListItem = editor.read.nodes.find({
      at: [],
      match: { id: '12' },
    }) as any;
    const toListItem = editor.read.nodes.find({
      at: [],
      match: { id: '11' },
    }) as any;

    if (fromListItem && toListItem) {
      editor.update((tx) => {
        moveListItemSublistItemsToListItemSublist(editor, tx, {
          fromListItem,
          start: true,
          toListItem,
        });
      });
    }

    expect(editor.read.children()).toEqual(
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
  ) as TestEditor;

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
  ) as TestEditor;

  it('creates a destination sublist before moving the items', () => {
    const editor = createBaseEditor({
      selection: input.selection,
      value: input.children,
    });

    const fromListItem = editor.read.nodes.find({
      at: [],
      match: { id: '12' },
    }) as any;
    const toListItem = editor.read.nodes.find({
      at: [],
      match: { id: '11' },
    }) as any;

    if (fromListItem && toListItem) {
      editor.update((tx) => {
        moveListItemSublistItemsToListItemSublist(editor, tx, {
          fromListItem,
          toListItem,
        });
      });
    }

    expect(editor.read.children()).toEqual(output.children);
  });
});
