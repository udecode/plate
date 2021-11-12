/** @jsx jsx */

import { withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_LINK } from '../../createLinkPlugin';
import { getAndUpsertLink } from '../../transforms/getAndUpsertLink';
import { withLink } from '../../withLink';

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
  const editor = withLink()(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
  );
  const getLinkUrl = jest.fn().mockResolvedValue(url);

  await getAndUpsertLink(editor, getLinkUrl);

  expect(input.children).toEqual(output.children);
});
