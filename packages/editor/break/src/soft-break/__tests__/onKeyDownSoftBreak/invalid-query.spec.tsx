/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { ELEMENT_CODE_BLOCK } from '../../../../../../elements/code-block/src/defaults';
import { getSoftBreakOnKeyDown } from '../../getSoftBreakOnKeyDown';

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
    <hcodeblock>code{'\n'}block</hcodeblock>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  getSoftBreakOnKeyDown({
    rules: [{ hotkey: 'enter', query: { allow: [ELEMENT_CODE_BLOCK] } }],
  })(input)(event as any);
  expect(input.children).toEqual(output.children);
});
