/** @jsx jsx */

import {
  isSelectionAtBlockStart,
  mockPlugin,
  PlateEditor,
} from '@udecode/plate-core';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/block-quote/src/createBlockquotePlugin';
import { onKeyDownResetNode } from '../onKeyDownResetNode';

jsx;

const input = ((
  <editor>
    <hblockquote>
      <cursor />
      test
    </hblockquote>
  </editor>
) as any) as PlateEditor;

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

  onKeyDownResetNode(
    input,
    mockPlugin({
      options: {
        rules: [
          {
            types: [ELEMENT_BLOCKQUOTE],
            defaultType: ELEMENT_PARAGRAPH,
            hotkey: 'Backspace',
            predicate: isSelectionAtBlockStart,
          },
        ],
      },
    })
  )(new KeyboardEvent('keydown') as any);

  expect(input.children).toEqual(output.children);
});
