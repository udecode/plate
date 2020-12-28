/** @jsx jsx */

import { ELEMENT_LINK, withInlineVoid } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { withLink } from '../../../withLink';

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
