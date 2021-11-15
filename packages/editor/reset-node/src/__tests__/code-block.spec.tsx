/** @jsx jsx */

import { isBlockAboveEmpty } from '@udecode/plate-common';
import { mockPlugin, PlateEditor } from '@udecode/plate-core';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';
import { ELEMENT_CODE_BLOCK } from '../../../../elements/code-block/src/constants';
import { onKeyDownResetNode } from '../onKeyDownResetNode';

jsx;

const input = ((
  <editor>
    <hcodeblock>
      <htext />
      <cursor />
    </hcodeblock>
  </editor>
) as any) as PlateEditor;

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

  onKeyDownResetNode(
    input,
    mockPlugin({
      options: {
        rules: [
          {
            types: [ELEMENT_CODE_BLOCK],
            defaultType: ELEMENT_PARAGRAPH,
            hotkey: 'Enter',
            predicate: isBlockAboveEmpty,
          },
        ],
      },
    })
  )(new KeyboardEvent('keydown') as any);

  expect(input.children).toEqual(output.children);
});
