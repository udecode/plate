/** @jsx jsx */

import { withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { ELEMENT_LINK } from '../../../createLinkPlugin';
import { withLink } from '../../../withLink';

jsx;

const input = (
  <editor>
    <hp>
      link: http://<htext bold>google</htext>.com
      <cursor />
    </hp>
  </editor>
) as any;

const text = ' ';

const output = (
  <editor>
    <hp>
      link:{' '}
      <element type="a" url="http://google.com">
        http://<htext bold>google</htext>.com
      </element>{' '}
    </hp>
  </editor>
) as any;

describe('when inserting a space after a url text containing bold mark', () => {
  it('should wrap the url with a link', () => {
    const editor = withLink()(
      withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(withReact(input))
    );

    editor.insertText(text);

    expect(input.children).toEqual(output.children);
  });
});
