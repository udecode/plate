/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { getNode } from 'common/queries';
import { Editor } from 'slate';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

it('should be', () => {
  expect(getNode(input, [0])).toBeDefined();
});
