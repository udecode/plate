/** @jsx jsx */

import {
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/slate-plugins-common';
import { ELEMENT_LI } from '@udecode/slate-plugins-list';
import { ELEMENT_PARAGRAPH } from '@udecode/slate-plugins-paragraph';
import { jsx } from '@udecode/slate-plugins-test-utils';
import * as isHotkey from 'is-hotkey';
import { unwrapList } from '../../../elements/list/src/transforms/unwrapList';
import { createEditorPlugins } from '../../../slate-plugins/src/utils/createEditorPlugins';
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
  const editor = createEditorPlugins({
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
