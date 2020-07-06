/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { upsertLinkAtSelection } from '../../transforms/upsertLinkAtSelection';
import { withLink } from '../../withLink';

const input = (
  <editor>
    <hp>insert link</hp>
  </editor>
) as any;

const url = 'http://google.com';

const output = (
  <editor>
    <hp>insert link</hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(input);
  upsertLinkAtSelection(editor, url);

  expect(input.children).toEqual(output.children);
});
