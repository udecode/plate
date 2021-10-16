/** @jsx jsx */

import { isBlockAboveEmpty } from '@udecode/plate-common';
import { SPEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { CONFIG } from '../../../../docs/src/live/config/config';
import { ELEMENT_BLOCKQUOTE } from '../../../elements/block-quote/src/defaults';
import { getResetNodeOnKeyDown } from '../getResetNodeOnKeyDown';

jsx;

const input = ((
  <editor>
    <hblockquote>
      <htext />
      <cursor />
    </hblockquote>
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
        types: [ELEMENT_BLOCKQUOTE],
        defaultType: CONFIG.options.p.type,
        hotkey: 'Enter',
        predicate: isBlockAboveEmpty,
      },
    ],
  })(input)(new KeyboardEvent('keydown') as any);

  expect(input.children).toEqual(output.children);
});
