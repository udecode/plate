/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { onKeyDownSoftBreak } from 'handlers/soft-break';
import * as isHotkey from 'is-hotkey';
import { CODE_BLOCK } from '../../../../elements/code-block';

const input = (
  <editor>
    <hp>paragraph</hp>
    <hcode>
      code
      <cursor />
      block
    </hcode>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>paragraph</hp>
    <hcode>code{'\n'}block</hcode>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownSoftBreak({
    rules: [{ hotkey: 'enter', query: { allow: [CODE_BLOCK] } }],
  })(event, input);
  expect(input.children).toEqual(output.children);
});
