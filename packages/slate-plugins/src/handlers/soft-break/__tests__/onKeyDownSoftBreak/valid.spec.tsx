/** @jsx jsx */

import * as isHotkey from 'is-hotkey';
import { jsx } from '../../../../__test-utils__/jsx';
import { onKeyDownSoftBreak } from '../../index';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>
      test{'\n'}
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownSoftBreak({ rules: [{ hotkey: 'shift+enter' }] })(event, input);
  expect(input.children).toEqual(output.children);
});
