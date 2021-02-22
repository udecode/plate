/** @jsx jsx */

import * as isHotkey from 'is-hotkey';
import { Editor } from 'slate';
import { options } from '../../../../../../../stories/config/initialValues';
import { jsx } from '../../../../__test-utils__/jsx';
import { isBlockAboveEmpty } from '../../../../common/queries/isBlockAboveEmpty';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/blockquote/defaults';
import { onKeyDownResetBlockType } from '../../onKeyDownResetBlockType';

const input = ((
  <editor>
    <hblockquote>
      <htext />
      <cursor />
    </hblockquote>
  </editor>
) as any) as Editor;

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

  onKeyDownResetBlockType({
    rules: [
      {
        types: [ELEMENT_BLOCKQUOTE],
        defaultType: options.p.type,
        hotkey: 'Enter',
        predicate: isBlockAboveEmpty,
      },
    ],
  })(new KeyboardEvent('keydown'), input);

  expect(input.children).toEqual(output.children);
});
