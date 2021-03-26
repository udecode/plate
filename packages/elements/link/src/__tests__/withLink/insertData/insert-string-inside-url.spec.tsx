/** @jsx jsx */

import { withInlineVoid } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { ELEMENT_LINK } from '../../../defaults';
import { withLink } from '../../../withLink';

jsx;

const input = (
  <editor>
    <hp>
      test
      <ha url="http://google.com">
        http://
        <cursor />
        google.com
      </ha>
      <htext />
    </hp>
  </editor>
) as any;

const data = { getData: () => 'docs' };

const output = (
  <editor>
    <hp>
      test
      <element type="a" url="http://google.com">
        http://docsgoogle.com
      </element>
      <htext />
    </hp>
  </editor>
) as any;

it('should run default insertText', () => {
  jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>docs</fragment>);

  const editor = withLink()(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(withReact(input))
  );

  editor.insertData(data);

  expect(input.children).toEqual(output.children);
});
