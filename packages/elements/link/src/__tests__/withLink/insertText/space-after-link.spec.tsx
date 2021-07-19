/** @jsx jsx */

import { withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { ELEMENT_LINK } from '../../../defaults';
import { withLink } from '../../../withLink';

jsx;

const input = (
  <editor>
    <hp>
      link:{' '}
      <element type="a" url="http://google.com">
        http://google.com
      </element>
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
        http://google.com
      </element>{' '}
    </hp>
  </editor>
) as any;

describe('when inserting a space after a link', () => {
  it('should upsert the link', () => {
    const editor = withLink()(
      withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(withReact(input))
    );

    editor.insertText(text);

    expect(input.children).toEqual(output.children);
  });
});
