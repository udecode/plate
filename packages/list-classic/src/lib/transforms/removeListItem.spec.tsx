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
import { removeListItem } from './removeListItem';

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
      <hli id="13">
        <hlic>3</hlic>
        <hul>
          <hli>
            <hlic>31</hlic>
          </hli>
          <hli>
            <hlic>32</hlic>
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
          <hli>
            <hlic>31</hlic>
          </hli>
          <hli>
            <hlic>32</hlic>
          </hli>
        </hul>
      </hli>
      <hli id="13">
        <hlic>3</hlic>
      </hli>
    </hul>
  </editor>
) as any;

it('moves the removed item children into the previous sublist', () => {
  const editor = createBaseEditor({
    plugins: ListSchemaPlugins,
    selection: input.selection,
    initialValue: input.children,
  });

  const list = editor.read.nodes.find({ at: [], match: { id: '1' } }) as any;
  const listItem = editor.read.nodes.find({
    at: [],
    match: { id: '13' },
  }) as any;

  if (list && listItem) {
    editor.update((tx) => {
      removeListItem(editor, tx, { list, listItem });
    });
  }

  expect(editor.read.children()).toEqual(output.children);
});
