/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withLink } from 'elements';
import { withReact } from 'slate-react';

const input = (
  <editor>
    <p>
      test
      <cursor />
    </p>
  </editor>
) as any;

const data = { getData: () => 'http://localhost:3000' };

const output = (
  <editor>
    <p>
      test
      <element type="a" url="http://localhost:3000">
        http://localhost:3000
      </element>
      <text />
    </p>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(withReact(input));

  editor.insertData(data);

  expect(input.children).toEqual(output.children);
});
