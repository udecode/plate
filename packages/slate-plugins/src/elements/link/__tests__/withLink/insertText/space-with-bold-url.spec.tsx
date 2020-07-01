/** @jsx jsx */

import { withReact } from 'slate-react';
import { jsx } from '../../../../../__test-utils__/jsx';
import { withInlineVoid } from '../../../../../element/index';
import { LINK, withLink } from '../../../../index';

const input = (
  <editor>
    <hp>
      link: http://<htext bold>localhost</htext>:3000
      <cursor />
    </hp>
  </editor>
) as any;

const text = ' ';

const output = (
  <editor>
    <hp>
      link:{' '}
      <element type="a" url="http://localhost:3000">
        http://<htext bold>localhost</htext>:3000
      </element>{' '}
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(
    withInlineVoid({ inlineTypes: [LINK] })(withReact(input))
  );

  editor.insertText(text);

  expect(input.children).toEqual(output.children);
});
