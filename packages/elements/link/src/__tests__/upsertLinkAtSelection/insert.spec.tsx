/** @jsx jsx */

import { withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_LINK } from '../../createLinkPlugin';
import { upsertLinkAtSelection } from '../../transforms/upsertLinkAtSelection';
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

it('should run default insertText', () => {
  const editor = withLink()(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(input)
  );
  upsertLinkAtSelection(editor, { url });

  expect(input.children).toEqual(output.children);
});
