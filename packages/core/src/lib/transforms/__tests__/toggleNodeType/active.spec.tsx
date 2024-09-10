/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';

import type { SlateEditor } from '../../../editor';

import { createPlateEditor } from '../../../../react';

jsx;

const input = (
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any as SlateEditor;

const output = (
  <editor>
    <hdefault>
      test
      <cursor />
    </hdefault>
  </editor>
) as any;

it('should be', () => {
  const editor = createPlateEditor({ editor: input });
  editor.tf.toggle.block({ type: 'blockquote' });

  expect(editor.children).toEqual(output.children);
});
