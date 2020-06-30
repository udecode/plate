/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { insertLink, withLink } from '../../../../elements';

const input = (
  <editor>
    <hp>insert link</hp>
  </editor>
) as any;

const url = 'http://localhost';

const output = (
  <editor>
    <hp>insert link</hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(input);
  insertLink(editor, url);

  expect(input.children).toEqual(output.children);
});
