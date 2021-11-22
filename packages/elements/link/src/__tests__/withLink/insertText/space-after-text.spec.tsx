/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../../createLinkPlugin';

jsx;

const input = (
  <editor>
    <hp>
      not a link
      <cursor />
    </hp>
  </editor>
) as any;

const text = ' ';

const output = (
  <editor>
    <hp>not a link </hp>
  </editor>
) as any;

describe('when inserting a space after a text (not url)', () => {
  it('should just insert a space', () => {
    const editor = createPlateEditor({
      editor: input,
      plugins: [createLinkPlugin()],
    });

    editor.insertText(text);

    expect(input.children).toEqual(output.children);
  });
});
