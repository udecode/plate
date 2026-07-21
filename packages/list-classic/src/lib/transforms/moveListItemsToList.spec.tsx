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
import { moveListItemsToList } from './moveListItemsToList';

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

const input = (
  <editor>
    <hul id="1">
      <hli>
        <hlic>1</hlic>
      </hli>
    </hul>
    <hul>
      <hli id="2">
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
      <hli>
        <hlic>1</hlic>
      </hli>
      <hli>
        <hlic>21</hlic>
      </hli>
      <hli>
        <hlic>22</hlic>
      </hli>
    </hul>
    <hul>
      <hli id="2">
        <hlic>2</hlic>
      </hli>
    </hul>
  </editor>
) as any;

it('moves sublist items into the target list', () => {
  const editor = createBaseEditor({
    plugins: ListSchemaPlugins,
    selection: input.selection,
    value: input.children,
  });

  const fromListItem = editor.read.nodes.find({
    at: [],
    match: { id: '2' },
  }) as any;
  const toList = editor.read.nodes.find({
    at: [],
    match: { id: '1' },
  }) as any;

  if (fromListItem && toList) {
    editor.update((tx) => {
      moveListItemsToList(editor, tx, { fromListItem, toList });
    });
  }

  expect(editor.read.children()).toEqual(output.children);
});
