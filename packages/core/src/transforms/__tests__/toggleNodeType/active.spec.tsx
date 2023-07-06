/** @jsx jsx */

import { PlateEditor, toggleNodeType } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';

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
  toggleNodeType(input, { activeType: 'blockquote' });

  expect(input.children).toEqual(output.children);
});
