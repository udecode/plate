/** @jsx jsx */

import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { jsx } from '@udecode/plate-test-utils';

import type { SlateEditor } from '../../../editor';

import { createPlateEditor } from '../../../../react';
import { toggleNodeType } from '../../toggleNodeType';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = (
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any;

it('should be', () => {
  const editor = createPlateEditor({ editor: input });
  toggleNodeType(editor, { activeType: BlockquotePlugin.key });

  expect(editor.children).toEqual(output.children);
});
