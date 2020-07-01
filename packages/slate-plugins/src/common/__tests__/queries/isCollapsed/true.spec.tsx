/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { isCollapsed } from '../../../queries/isCollapsed';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

const output = true;

it('should be', () => {
  expect(isCollapsed(input.selection)).toBe(output);
});
