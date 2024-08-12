/** @jsx jsx */

import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import { type AnyPlatePlugin, createPlugin } from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core';
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
  onKeyDownSoftBreak({
    editor: input,
    event: event as any,
    plugin: createPlugin({
      options: {
        rules: [{ hotkey: 'enter', query: { allow: [ELEMENT_CODE_BLOCK] } }],
      },
    }) as AnyPlatePlugin,
  });
  expect(input.children).toEqual(output.children);
});
