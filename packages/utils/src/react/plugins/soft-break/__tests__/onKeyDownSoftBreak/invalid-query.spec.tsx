/** @jsx jsxt */

import { createEditor } from '@udecode/plate';
import { createPlateEditor, getEditorPlugin } from '@udecode/plate/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import * as isHotkey from '@udecode/plate-core';
import { jsxt } from '@udecode/plate-test-utils';

import { SoftBreakPlugin } from '../../SoftBreakPlugin';
import { onKeyDownSoftBreak } from '../../onKeyDownSoftBreak';

jsxt;

const input = createEditor(
  (
    <editor>
      <hp>paragraph</hp>
      <hcodeblock>
        code
        <cursor />
        block
      </hcodeblock>
    </editor>
  ) as any
);

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
    ...getEditorPlugin(
      createPlateEditor({ editor: input }),
      SoftBreakPlugin.configure({
        options: {
          rules: [{ hotkey: 'enter', query: { allow: [CodeBlockPlugin.key] } }],
        },
      })
    ),
    event: event as any,
  });
  expect(input.children).toEqual(output.children);
});
