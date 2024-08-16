/** @jsx jsx */

import { CodeBlockPlugin } from '@udecode/plate-code-block';
import {
  type AnyPlatePlugin,
  createPlugin,
  getPluginContext,
} from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
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
    ...getPluginContext(
      createPlateEditor({ editor: input }),
      createPlugin({
        options: {
          rules: [{ hotkey: 'enter', query: { allow: [CodeBlockPlugin.key] } }],
        },
      }) as AnyPlatePlugin
    ),
    event: event as any,
  });
  expect(input.children).toEqual(output.children);
});
