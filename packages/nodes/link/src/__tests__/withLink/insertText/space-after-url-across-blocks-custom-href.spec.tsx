/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../../createLinkPlugin';

jsx;

const input = (
  <editor>
    <hp>
      link:{' '}
      <element type="a" url="http://google.com">
        google.com
      </element>
    </hp>
    <hp>
      test
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
        google.com
      </element>
    </hp>
    <hp>
      {'test '}
      {/* keep above as string in quotes to force trailing space */}
      <cursor />
    </hp>
  </editor>
) as any;

describe('when inserting a space with a link element in a preceeding block and using a custom href', () => {
  it('should run default insertText', () => {
    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createLinkPlugin({
          options: {
            getUrlHref: (url) => {
              return 'http://google.com';
            },
          },
        }),
      ],
    });

    editor.insertText(text);

    expect(input.children).toEqual(output.children);
  });
});
