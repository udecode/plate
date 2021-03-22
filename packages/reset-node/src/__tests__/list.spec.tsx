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
import { createEditorPlugins } from '../../../slate-plugins/src/utils/createEditorPlugins';
import { onKeyDownResetNode } from '../onKeyDownResetNode';

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
    onReset: unwrapList,
  };

  onKeyDownResetNode({
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
  })(editor)(new KeyboardEvent('keydown'));

  expect(editor.children).toEqual(output.children);
});
