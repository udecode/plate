/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-common';
import * as isHotkey from '@udecode/plate-core/server';
import { ELEMENT_H1 } from '@udecode/plate-heading';
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
  input.blockFactory = (node: any) => node;
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
