/** @jsx jsx */

import { withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_LINK } from '../../defaults';
import { getAndUpsertLink } from '../../transforms/getAndUpsertLink';
import { withLink } from '../../withLink';

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
  const editor = withLink()(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
  );
  const getLinkUrl = jest.fn().mockResolvedValue(urlOutput);
  await getAndUpsertLink(editor, getLinkUrl);

  expect(input.children).toEqual(output.children);
});
