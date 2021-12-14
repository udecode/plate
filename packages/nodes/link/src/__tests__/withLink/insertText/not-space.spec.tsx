/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../../createLinkPlugin';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const text = 'test';

const output = (
  <editor>
    <hp>testtest</hp>
  </editor>
) as any;

describe('when inserting a character that is not a space', () => {
  it('should run default insertText', () => {
    const editor = createPlateEditor({
      editor: input,
      plugins: [createLinkPlugin()],
    });

    editor.insertText(text);

    expect(input.children).toEqual(output.children);
  });
});
