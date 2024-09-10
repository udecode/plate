/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { createSlateEditor } from '@udecode/plate-common';
import { LinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';

import { RemoveEmptyNodesPlugin } from '../../lib/RemoveEmptyNodesPlugin';

jsx;

const input = (
  <editor>
    <hp>
      <ha url="http://google.com">
        <htext />
      </ha>
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = (
  <editor>
    <hp>
      <htext />
    </hp>
  </editor>
) as any;

it('should be', () => {
  const editor = createSlateEditor({
    editor: input,
    plugins: [
      RemoveEmptyNodesPlugin.configure({
        options: {
          types: LinkPlugin.key,
        },
      }),
    ],
  });

  editor.normalizeNode([(input.children[0] as any).children[0], [0, 0]]);

  expect(input.children).toEqual(output.children);
});
