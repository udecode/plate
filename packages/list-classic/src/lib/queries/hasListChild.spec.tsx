/** @jsx jsxt */

import { createBaseEditor, NodeIdPlugin } from '@platejs/core';

import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { hasListChild } from './hasListChild';

jsxt;

const SchemaOnlyNodeIdPlugin = NodeIdPlugin.configure({
  options: { initialValueIds: false, match: () => false },
});

it.each([
  {
    expected: true,
    input: (
      <editor>
        <hul>
          <hli id="2">
            <hlic>2</hlic>
            <hul>
              <hli>
                <hlic>21</hlic>
              </hli>
              <hli>
                <hlic>
                  22
                  <cursor />
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any,
    title: 'returns true when the list item contains a nested list',
  },
  {
    expected: false,
    input: (
      <editor>
        <hul>
          <hli id="2">
            <hlic>2</hlic>
          </hli>
        </hul>
      </editor>
    ) as any,
    title: 'returns false when the list item has no nested list',
  },
])('$title', ({ expected, input }) => {
  const editor = createBaseEditor({
    plugins: [SchemaOnlyNodeIdPlugin, BaseListPlugin],
    selection: input.selection,
    initialValue: input.children,
  });
  const listItem = editor.read.nodes.find({ at: [], match: { id: '2' } });

  expect(hasListChild(editor, listItem?.[0] as any)).toBe(expected);
});
