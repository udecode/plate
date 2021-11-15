/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin, ELEMENT_LINK } from '../../createLinkPlugin';
import { getAndUpsertLink } from '../../transforms/getAndUpsertLink';

jsx;

const urlInput = 'http://input.com';

const input = (
  <editor>
    <hp>
      insert link <anchor />
      <element type={ELEMENT_LINK} url={urlInput}>
        here
      </element>
      <focus />.
    </hp>
  </editor>
) as any;

const urlOutput = 'http://output.com';

const output = (
  <editor>
    <hp>
      insert link{' '}
      <element type={ELEMENT_LINK} url={urlOutput}>
        here
      </element>
      .
    </hp>
  </editor>
) as any;

it('should update an existing link', async () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });
  const getLinkUrl = jest.fn().mockResolvedValue(urlOutput);
  await getAndUpsertLink(editor, getLinkUrl);

  expect(input.children).toEqual(output.children);
});
