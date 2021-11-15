/** @jsx jsx */

import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/plate-common';
import { ELEMENT_LI } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { unwrapList } from '../../../../elements/list/src/transforms/unwrapList';
import { createPlateUIEditor } from '../../../../plate/src/utils/createPlateUIEditor';
import { getResetNodeOnKeyDown } from '../getResetNodeOnKeyDown';

jsx;

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
  const editor = createPlateUIEditor({
    editor: input,
  });

  jest.spyOn(isHotkey, 'default').mockReturnValue(true);

  const resetBlockTypesListRule = {
    types: [ELEMENT_LI],
    defaultType: ELEMENT_PARAGRAPH,
    onReset: unwrapList as any,
  };

  getResetNodeOnKeyDown({
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
  })(editor)(new KeyboardEvent('keydown') as any);

  expect(editor.children).toEqual(output.children);
});
