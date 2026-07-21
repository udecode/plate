/** @jsx jsxt */

import { createBaseEditor, NodeIdPlugin } from '@platejs/core';

import { jsxt } from '@platejs/test-utils';

import { BaseListPlugin } from '../BaseListPlugin';
import { getListRoot } from './getListRoot';

jsxt;

const SchemaOnlyNodeIdPlugin = NodeIdPlugin.configure({
  options: { initialValueIds: false, match: () => false },
});

const listRoot = (
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
) as any;

const input = (<editor>{listRoot}</editor>) as any;

it('returns the top-most list containing the current selection', () => {
  const editor = createBaseEditor({
    plugins: [SchemaOnlyNodeIdPlugin, BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

  const sublist = getListRoot(editor, input.selection);

  expect(sublist).toEqual([listRoot, [0]]);
});
