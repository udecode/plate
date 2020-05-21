/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { isWordAfterTrigger } from 'common/queries';
import { Editor, Range } from 'slate';

const input = ((
  <editor>
    <hp>
      @test
      <cursor /> test2
    </hp>
  </editor>
) as any) as Editor;

const at = Range.start(input.selection as Range);

const output = 'test';

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' }).match?.[1]).toBe(
    output
  );
});
