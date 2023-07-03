/** @jsx jsx */

import { onKeyDownExitBreak } from '@/packages/break/src/exit-break/onKeyDownExitBreak';
import { ELEMENT_H1 } from '@/packages/heading/src/constants';
import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

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
  onKeyDownExitBreak(
    input,
    mockPlugin({
      options: {
        rules: [{ hotkey: 'enter', query: { allow: [ELEMENT_H1] } }],
      },
    })
  )(event);
  expect(input.children).toEqual(output.children);
});
