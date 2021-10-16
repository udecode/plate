/** @jsx jsx */

import { isBlockAboveEmpty } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { CONFIG } from '../../../../docs/src/live/config/config';
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
        defaultType: CONFIG.options.p.type,
        hotkey: 'Enter',
        predicate: isBlockAboveEmpty,
      },
    ],
  })(input)(new KeyboardEvent('keydown') as any);

  expect(input.children).toEqual(output.children);
});
