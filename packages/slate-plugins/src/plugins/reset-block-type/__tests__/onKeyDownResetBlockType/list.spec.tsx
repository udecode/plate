/** @jsx jsx */

import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import * as isHotkey from 'is-hotkey';
import {
  ELEMENT_LI,
  ELEMENT_PARAGRAPH,
  unwrapList,
} from '../../../../elements/index';
import { onKeyDownResetBlockType } from '../../onKeyDownResetBlockType';

const input = (
  <editor>
    <hul>
      <hli>
        <hp>
          <htext />
          <cursor />
        </hp>
      </hli>
    </hul>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext />
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);

  const resetBlockTypesListRule = {
    types: [ELEMENT_LI],
    defaultType: ELEMENT_PARAGRAPH,
    onReset: unwrapList,
  };

  onKeyDownResetBlockType({
    rules: [
      {
        ...resetBlockTypesListRule,
        hotkey: 'Enter',
        predicate: isBlockAboveEmpty,
      },
      {
        ...resetBlockTypesListRule,
        hotkey: 'Backspace',
        predicate: isSelectionAtBlockStart,
      },
    ],
  })(new KeyboardEvent('keydown'), input);

  expect(input.children).toEqual(output.children);
});
