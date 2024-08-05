/** @jsx jsx */

import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { createPlugin } from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core/server';
import { jsx } from '@udecode/plate-test-utils';

import { onKeyDownSoftBreak } from '../../onKeyDownSoftBreak';

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
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);
  onKeyDownSoftBreak(
    input,
    createPlugin({
      options: {
        rules: [{ hotkey: 'enter', query: { allow: [ELEMENT_CODE_BLOCK] } }],
      },
    })
  )(event as any);
  expect(input.children).toEqual(output.children);
});
