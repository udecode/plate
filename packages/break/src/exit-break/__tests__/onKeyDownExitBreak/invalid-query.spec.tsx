/** @jsx jsx */

import { type AnyPlatePlugin, createPlugin } from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsx } from '@udecode/plate-test-utils';

import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

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
  jest.spyOn(isHotkey, 'isHotkey').mockReturnValue(true);
  onKeyDownExitBreak({
    editor: input,
    event,
    plugin: createPlugin({
      options: {
        rules: [{ hotkey: 'enter', query: { allow: [HEADING_KEYS.h1] } }],
      },
    }) as AnyPlatePlugin,
  });
  expect(input.children).toEqual(output.children);
});
