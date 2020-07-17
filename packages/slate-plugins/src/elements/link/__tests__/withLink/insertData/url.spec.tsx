/** @jsx jsx */

import { withReact } from 'slate-react';
import { jsx } from '../../../../../__test-utils__/jsx';
import { withInlineVoid } from '../../../../../common/plugins/inline-void/withInlineVoid';
import { ELEMENT_LINK } from '../../../defaults';
import { withLink } from '../../../withLink';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const data = { getData: () => 'http://google.com' };

const output = (
  <editor>
    <hp>
      test
      <element type="a" url="http://google.com">
        http://google.com
      </element>
      <htext />
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(withReact(input))
  );

  editor.insertData(data);

  expect(input.children).toEqual(output.children);
});
