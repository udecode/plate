/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { isPointAtWordEnd } from 'common/queries';
import { Editor, Range } from 'slate';

const input = ((
  <editor>
    <hp>
      test
      <cursor />
      test2
    </hp>
  </editor>
) as any) as Editor;

const at = Range.start(input.selection as Range);

const output = false;

it('should be', () => {
  expect(isPointAtWordEnd(input, { at })).toEqual(output);
});
