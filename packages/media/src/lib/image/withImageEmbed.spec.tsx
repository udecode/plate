/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { getCurrentRuntimeTransforms } from '../../../../core/src/internal/currentRuntimeBridge';
import { InputRulesPlugin } from '../../../../core/src/lib/plugins/input-rules/internal/InputRulesPlugin';
import { createPlateRuntimeEditor } from '../../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseImagePlugin } from './BaseImagePlugin';

jsxt;

describe('ImageRules.embed', () => {
  const input = (
    <editor>
      <hp>test</hp>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hp>test</hp>
      <himg url="https://i.imgur.com/removed.png">
        <htext />
      </himg>
    </editor>
  ) as any;

  it('insert image from the text', () => {
    const editor = createPlateRuntimeEditor({
      initialSelection: input.selection,
      initialValue: input.children,
      plugins: [InputRulesPlugin, BaseImagePlugin],
    });

    const data = {
      getData: () => 'https://i.imgur.com/removed.png',
    };
    getCurrentRuntimeTransforms(editor).insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});
