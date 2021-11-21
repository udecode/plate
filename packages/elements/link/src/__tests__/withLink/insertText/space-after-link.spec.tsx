/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';

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
    const editor = createPlateEditor({
      editor: input,
      plugins: [createLinkPlugin()],
    });

    editor.insertText(text);

    expect(input.children).toEqual(output.children);
  });
});
