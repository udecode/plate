/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { ELEMENT_H1 } from '../../../../../elements/heading/src/defaults';
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
    rules: [{ hotkey: 'enter', query: { allow: [ELEMENT_H1] } }],
  })(input)(event);
  expect(input.children).toEqual(output.children);
});
