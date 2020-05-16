/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withImage } from 'elements';
import { withReact } from 'slate-react';

const input = (
  <editor>
    <p>test</p>
  </editor>
) as any;

const output = (
  <editor>
    <p>test</p>
  </editor>
) as any;

it('should insert image from the file(s)', () => {
  const editor = withImage()(withReact(input));

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
