/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { insertLink, LINK, withLink } from 'elements';
import { withInlineVoid } from '../../../../element';

const input = (
  <editor>
    <hp>
      insert link <anchor />
      here
      <focus />.
    </hp>
  </editor>
) as any;

const url = 'http://localhost';

const output = (
  <editor>
    <hp>
      insert link{' '}
      <element type={LINK} url={url}>
        here
      </element>
      .
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(withInlineVoid({ inlineTypes: [LINK] })(input));
  insertLink(editor, url);

  expect(input.children).toEqual(output.children);
});
