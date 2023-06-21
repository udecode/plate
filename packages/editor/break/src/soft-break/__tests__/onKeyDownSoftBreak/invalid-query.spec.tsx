/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

import { onKeyDownSoftBreak } from '@/packages/editor/break/src/soft-break/onKeyDownSoftBreak';
import { ELEMENT_CODE_BLOCK } from '@/packages/nodes/code-block/src/constants';

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
  onKeyDownSoftBreak(
    input,
    mockPlugin({
      options: {
        rules: [{ hotkey: 'enter', query: { allow: [ELEMENT_CODE_BLOCK] } }],
      },
    })
  )(event as any);
  expect(input.children).toEqual(output.children);
});
