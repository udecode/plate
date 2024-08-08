/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';

import type { PlateEditor } from '../../../types';

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
  toggleNodeType(input, { activeType: 'blockquote' });

  expect(input.children).toEqual(output.children);
});
