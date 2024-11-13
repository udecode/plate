/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';
import type { TDescendant } from '@udecode/slate';
import type { Range } from 'slate';

import { createPlateEditor } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import { getBlockAbove } from '../../getBlockAbove';
import { getNextSiblingNodes } from '../../getNextSiblingNodes';

jsxt;

const input = (
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
    </hp>
  </editor>
) as any as SlateEditor;

const output: TDescendant[] = [];

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [LinkPlugin],
  });

  const above = getBlockAbove(editor) as any;
  expect(
    getNextSiblingNodes(above, (input.selection as Range).anchor.path)
  ).toEqual(output);
});
