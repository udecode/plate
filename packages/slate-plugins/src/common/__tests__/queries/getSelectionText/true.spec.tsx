/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { getSelectionText } from '../../../queries/getSelectionText';

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
