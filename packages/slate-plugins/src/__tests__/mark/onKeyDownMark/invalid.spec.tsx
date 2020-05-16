/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { onKeyDownMark } from 'mark';
import { MARK_BOLD } from 'marks/bold';

const input = (
  <editor>
    <p>
      t<anchor />
      est
      <focus />
    </p>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <p>
      t<anchor />
      est
      <focus />
    </p>
  </editor>
) as any;

it('should be', () => {
  onKeyDownMark({ hotkey: 'enter', type: MARK_BOLD })(event, input);
  expect(input.children).toEqual(output.children);
  expect(input.selection).toEqual(output.selection);
});
