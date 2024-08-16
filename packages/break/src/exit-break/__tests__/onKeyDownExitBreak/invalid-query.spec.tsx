/** @jsx jsx */

import {
  type AnyPlatePlugin,
  createPlugin,
  getPluginContext,
} from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
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
    ...getPluginContext(
      createPlateEditor({ editor: input }),
      createPlugin({
        options: {
          rules: [{ hotkey: 'enter', query: { allow: [HEADING_KEYS.h1] } }],
        },
      }) as AnyPlatePlugin
    ),
    event,
  });
  expect(input.children).toEqual(output.children);
});
