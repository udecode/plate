/** @jsx jsxt */

import { createSlateEditor, createTEditor } from '@udecode/plate-common';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import { RemoveEmptyNodesPlugin } from '../../lib/RemoveEmptyNodesPlugin';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        <ha url="http://google.com">
          <htext />
        </ha>
        <cursor />
      </hp>
    </editor>
  ) as any
);

const output = (
  <editor>
    <hp>
      <htext />
    </hp>
  </editor>
) as any;

it('should be', () => {
  const editor = createSlateEditor({
    plugins: [
      RemoveEmptyNodesPlugin.configure({
        options: {
          types: LinkPlugin.key,
        },
      }),
    ],
    selection: input.selection,
    value: input.children,
  });

  editor.normalizeNode([(input.children[0] as any).children[0], [0, 0]]);

  expect(editor.children).toEqual(output.children);
});
