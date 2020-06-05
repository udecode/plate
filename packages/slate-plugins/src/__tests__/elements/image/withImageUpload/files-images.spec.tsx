/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withImageUpload } from 'elements';
import { withReact } from 'slate-react';
import { pipe } from '../../../../common/utils';

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
  const editor = pipe(input, withReact, withImageUpload());

  const data = {
    getData: () => 'test',
    files: [
      new File(['test'], 'test.png', {
        type: 'image/png',
      }),
    ],
  };
  editor.insertData(data as any);

  expect(input.children).toEqual(output.children);
});
