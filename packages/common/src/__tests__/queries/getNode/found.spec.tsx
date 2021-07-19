/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { getNode } from '../../../queries/index';

jsx;

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
