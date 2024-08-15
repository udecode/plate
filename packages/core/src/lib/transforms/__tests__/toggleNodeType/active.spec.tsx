/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';

import type { PlateEditor } from '../../../editor';

import { createPlateEditor } from '../../../../react';
import { toggleNodeType } from '../../toggleNodeType';

jsx;

const input = (
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any as PlateEditor;

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
  toggleNodeType(editor, { activeType: 'blockquote' });

  expect(editor.children).toEqual(output.children);
});
