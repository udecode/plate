/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../../createLinkPlugin';

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

  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });

  editor.insertData(data);

  expect(input.children).toEqual(output.children);
});
