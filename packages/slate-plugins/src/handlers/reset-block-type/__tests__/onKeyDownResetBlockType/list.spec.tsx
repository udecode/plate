/** @jsx jsx */

import * as isHotkey from 'is-hotkey';
import { jsx } from '../../../../__test-utils__/jsx';
import { isBlockAboveEmpty } from '../../../../common/queries/isBlockAboveEmpty';
import { isSelectionAtBlockStart } from '../../../../common/queries/isSelectionAtBlockStart';
import {
  ELEMENT_LI,
  ELEMENT_PARAGRAPH,
  unwrapList,
} from '../../../../elements/index';
import { onKeyDownResetBlockType } from '../../index';

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
