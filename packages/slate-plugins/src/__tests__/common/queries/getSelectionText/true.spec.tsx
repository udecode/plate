/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { getSelectionText } from 'common/queries/getSelectionText';
import { Editor } from 'slate';

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
