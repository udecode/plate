/** @jsx jsx */

import { isBlockAboveEmpty } from '@udecode/slate-plugins-common';
import { SPEditor } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import * as isHotkey from 'is-hotkey';
import { options } from '../../../../stories/config/pluginOptions';
import { ELEMENT_CODE_BLOCK } from '../../../elements/code-block/src/defaults';
import { getResetNodeOnKeyDown } from '../getResetNodeOnKeyDown';

jsx;

const input = ((
  <editor>
    <hcodeblock>
      <htext />
      <cursor />
    </hcodeblock>
  </editor>
) as any) as SPEditor;

const output = (
  <editor>
    <hp>
      <htext />
      <cursor />
    </hp>
  </editor>
) as any;

it('should render', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);

  getResetNodeOnKeyDown({
    rules: [
      {
        types: [ELEMENT_CODE_BLOCK],
        defaultType: options.p.type,
        hotkey: 'Enter',
        predicate: isBlockAboveEmpty,
      },
    ],
  })(input)(new KeyboardEvent('keydown'));

  expect(input.children).toEqual(output.children);
});
