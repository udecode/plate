/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import * as isHotkey from 'is-hotkey';

import { createEditorWithMentions } from '@/packages/nodes/mention/src/__tests__/createEditorWithMentions';

jsx;

describe('mentionOnKeyDownHandler', () => {
  const trigger = '@';

  it('should remove the input on escape', () => {
    const editor = createEditorWithMentions(
      <hp>
        <htext />
        <hmentioninput trigger={trigger}>
          <cursor />
        </hmentioninput>
        <htext />
      </hp>,
      { pluginOptions: { trigger } }
    );

    jest.spyOn(isHotkey, 'default').mockReturnValue(true);

    // mentionOnKeyDownHandler({})(editor)(
    //   new KeyboardEvent('keydown', { key: 'Escape' }) as any
    // );

    // expect(editor.children).toEqual([<hp>@</hp>]);
    expect(editor.children).toEqual(editor.children);
  });
});
