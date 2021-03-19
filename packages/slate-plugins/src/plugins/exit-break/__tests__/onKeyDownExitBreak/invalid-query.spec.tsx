/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import * as isHotkey from 'is-hotkey';
import { ELEMENT_CODE_BLOCK } from '../../../../elements/code-block/defaults';
import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

const input = (
  <editor>
    <hp>paragraph</hp>
    <hcode>
      code
      <cursor />
      block
    </hcode>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>paragraph</hp>
    <hcode>codeblock</hcode>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);
  onKeyDownExitBreak({
    rules: [{ hotkey: 'enter', query: { allow: [ELEMENT_CODE_BLOCK] } }],
  })(event, input);
  expect(input.children).toEqual(output.children);
});
