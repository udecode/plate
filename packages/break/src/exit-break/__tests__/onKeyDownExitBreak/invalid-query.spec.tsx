/** @jsx jsx */

import { ELEMENT_ALIGN_CENTER } from '@udecode/plate-alignment';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { getExitBreakOnKeyDown } from '../../getExitBreakOnKeyDown';

jsx;

const input = (
  <editor>
    <hp>paragraph</hp>
    <hcodeblock>
      code
      <cursor />
      block
    </hcodeblock>
  </editor>
) as any;

const event = new KeyboardEvent('keydown') as any;

const output = (
  <editor>
    <hp>paragraph</hp>
    <hcodeblock>codeblock</hcodeblock>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  getExitBreakOnKeyDown({
    rules: [{ hotkey: 'enter', query: { allow: [ELEMENT_ALIGN_CENTER] } }],
  })(input)(event);
  expect(input.children).toEqual(output.children);
});
