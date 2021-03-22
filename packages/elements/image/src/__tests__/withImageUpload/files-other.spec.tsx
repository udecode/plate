/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { withReact } from 'slate-react';
import { withImageUpload } from '../../../../../slate-plugins/src/elements/index';

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>test</hp>
  </editor>
) as any;

it('should insert image from the file(s)', () => {
  const editor = withImageUpload()(withReact(input));

  const data = {
    getData: () => 'test',
    files: [new File(['test'], 'not-an-image')],
  };
  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
