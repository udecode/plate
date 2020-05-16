/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { onKeyDownSoftBreak } from 'soft-break';

const input = (
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any;

it('should be', () => {
  onKeyDownSoftBreak()(event, input);
  expect(input.children).toEqual(output.children);
});
