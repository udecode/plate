/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../../createLinkPlugin';

jsx;

const input = (
  <editor>
    <hp>
      link: google.com
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
      </element>{' '}
    </hp>
  </editor>
) as any;

describe('when inserting a space with a link element and using a custom href', () => {
  it('should wrap the url in a link', () => {
    const editor = createPlateEditor({
      editor: input,
      plugins: [
        createLinkPlugin({
          options: {
            isUrl: (url) => url === 'google.com',
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
