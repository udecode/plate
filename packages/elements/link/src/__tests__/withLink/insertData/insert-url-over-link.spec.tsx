/** @jsx jsx */

import { withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { ELEMENT_LINK } from '../../../createLinkPlugin';
import { withLink } from '../../../withLink';

jsx;

const input = (
  <editor>
    <hp>
      test{' '}
      <ha url="http://google.com">
        please
        <anchor />
        click
      </ha>{' '}
      here
      <focus />.
    </hp>
  </editor>
) as any;

const data: any = { getData: () => 'http://google.com/test' };

const output = (
  <editor>
    <hp>
      test please
      <element type="a" url="http://google.com/test">
        click here
      </element>
      .
    </hp>
  </editor>
) as any;

it('should unwrap the existing link', () => {
  jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>docs</fragment>);

  const editor = withLink()(
    withInlineVoid({ inlineTypes: [ELEMENT_LINK] })(withReact(input))
  );

  editor.insertData(data);

  expect(input.children).toEqual(output.children);
});
