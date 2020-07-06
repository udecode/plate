/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { withInlineVoid } from '../../../../common/plugins/inline-void/withInlineVoid';
import { wrapLink } from '../../transforms/wrapLink';
import { LINK } from '../../types';
import { withLink } from '../../withLink';

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
      <element type={LINK} url={url}>
        here
      </element>
      .
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(withInlineVoid({ inlineTypes: [LINK] })(input));
  wrapLink(editor, url);

  expect(input.children).toEqual(output.children);
});
