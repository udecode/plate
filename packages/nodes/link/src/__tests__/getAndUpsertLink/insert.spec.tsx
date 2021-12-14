/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin, ELEMENT_LINK } from '../../createLinkPlugin';
import { getAndUpsertLink } from '../../transforms/getAndUpsertLink';

jsx;

const input = (
  <editor>
    <hp>
      insert link <anchor />
      here
      <focus />.
    </hp>
  </editor>
) as any;

const url = 'http://google.com';

const output = (
  <editor>
    <hp>
      insert link{' '}
      <element type={ELEMENT_LINK} url={url}>
        here
      </element>
      .
    </hp>
  </editor>
) as any;

it('should wrap the selection in a link', async () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });
  const getLinkUrl = jest.fn().mockResolvedValue(url);

  await getAndUpsertLink(editor, getLinkUrl);

  expect(input.children).toEqual(output.children);
});
