/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { getSelectionText } from '../../../queries/getSelectionText';

jsx;

const input = ((
  <editor>
    <hp>
      <anchor />
      test
      <focus />
    </hp>
  </editor>
) as any) as Editor;

const output = 'test';

it('should be', () => {
  expect(getSelectionText(input)).toBe(output);
});
