/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { isCollapsed } from 'common/queries/isCollapsed';
import { Editor } from 'slate';

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
