/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import * as isHotkey from 'is-hotkey';
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
      test{'\n'}
      <cursor />
    </p>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownSoftBreak()(event, input);
  expect(input.children).toEqual(output.children);
});
