/** @jsx jsx */

import { withReact } from 'slate-react';
import { jsx } from '../../../../../__test-utils__/jsx';
import { withInlineVoid } from '../../../../../common/plugins/inline-void/withInlineVoid';
import { ELEMENT_LINK } from '../../../defaults';
import { withLink } from '../../../withLink';

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
    const editor = withLink()(
      withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(withReact(input))
    );

    editor.insertText(text);

    expect(input.children).toEqual(output.children);
  });
});
