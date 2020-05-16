/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { toggleCode } from 'elements';

const input = (
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any;

const output = (
  <editor>
    <code>
      <p>
        test
        <cursor />
      </p>
    </code>
  </editor>
) as any;

it('should be', () => {
  toggleCode(input);

  expect(input.children).toEqual(output.children);
});
