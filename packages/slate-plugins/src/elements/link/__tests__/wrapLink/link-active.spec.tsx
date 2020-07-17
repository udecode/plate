/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { withInlineVoid } from '../../../../common/plugins/inline-void/withInlineVoid';
import { ELEMENT_LINK } from '../../defaults';
import { wrapLink } from '../../transforms/wrapLink';
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
  wrapLink(editor, url);

  expect(input.children).toEqual(output.children);
});
