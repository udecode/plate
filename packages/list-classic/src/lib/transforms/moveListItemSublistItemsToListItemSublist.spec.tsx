/** @jsx jsxt */

import { createBaseEditor, NodeIdPlugin } from '@platejs/core';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseNumberedListPlugin,
  BaseTaskListPlugin,
} from '../BaseListPlugin';
import { moveListItemSublistItemsToListItemSublist } from './moveListItemSublistItemsToListItemSublist';

jsxt;

const SchemaOnlyNodeIdPlugin = NodeIdPlugin.configure({
  options: { initialValueIds: false, match: () => false },
});
const ListSchemaPlugins = [
  SchemaOnlyNodeIdPlugin,
  BaseBulletedListPlugin,
  BaseNumberedListPlugin,
  BaseTaskListPlugin,
  BaseListItemPlugin,
  BaseListItemContentPlugin,
];

describe('when there is toListItem sublist', () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="11">
          <hlic>1</hlic>
          <hul>
            <hli>
              <hlic>11</hlic>
            </hli>
            <hli>
              <hlic>12</hlic>
            </hli>
          </hul>
        </hli>
        <hli id="12">
          <hlic>2</hlic>
          <hul>
            <hli>
              <hlic>21</hlic>
            </hli>
            <hli>
              <hlic>22</hlic>
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
          <hlic>1</hlic>
          <hul>
            <hli>
              <hlic>11</hlic>
            </hli>
            <hli>
              <hlic>12</hlic>
            </hli>
            <hli>
              <hlic>21</hlic>
            </hli>
            <hli>
              <hlic>22</hlic>
            </hli>
          </hul>
        </hli>
        <hli id="12">
          <hlic>2</hlic>
        </hli>
      </hul>
    </editor>
  ) as TestEditor;

  it('moves sublist items into the existing destination sublist', () => {
    const editor = createBaseEditor({
      plugins: ListSchemaPlugins,
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
      plugins: ListSchemaPlugins,
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
              <hlic>1</hlic>
              <hul>
                <hli>
                  <hlic>21</hlic>
                </hli>
                <hli>
                  <hlic>22</hlic>
                </hli>
                <hli>
                  <hlic>11</hlic>
                </hli>
                <hli>
                  <hlic>12</hlic>
                </hli>
              </hul>
            </hli>
            <hli id="12">
              <hlic>2</hlic>
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
          <hlic>1</hlic>
        </hli>
        <hli id="12">
          <hlic>2</hlic>
          <hul>
            <hli>
              <hlic>21</hlic>
            </hli>
            <hli>
              <hlic>22</hlic>
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
          <hlic>1</hlic>
          <hul>
            <hli>
              <hlic>21</hlic>
            </hli>
            <hli>
              <hlic>22</hlic>
            </hli>
          </hul>
        </hli>
        <hli id="12">
          <hlic>2</hlic>
        </hli>
      </hul>
    </editor>
  ) as TestEditor;

  it('creates a destination sublist before moving the items', () => {
    const editor = createBaseEditor({
      plugins: ListSchemaPlugins,
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
