/** @jsx jsx */

import * as isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { options } from '../../../../../../../stories/config/initialValues';
import { jsx } from '../../../../__test-utils__/jsx';
import { isSelectionAtBlockStart } from '../../../../common/queries/isSelectionAtBlockStart';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/blockquote/defaults';
import { onKeyDownResetBlockType } from '../../onKeyDownResetBlockType';

const input = ((
  <editor>
    <hblockquote>
      <cursor />
      test
    </hblockquote>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any;

it('should render', () => {
  jest.spyOn(isHotkey, 'default').mockReturnValue(true);

  onKeyDownResetBlockType({
    rules: [
      {
        types: [ELEMENT_BLOCKQUOTE],
        defaultType: options.p.type,
        hotkey: 'Backspace',
        predicate: isSelectionAtBlockStart,
      },
    ],
  })(new KeyboardEvent('keydown'), input);

  expect(input.children).toEqual(output.children);
});
