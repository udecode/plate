/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withLink, wrapLink } from 'elements';
import { withReact } from 'slate-react';

const input = (
  <editor>
    <p>
      test
      <element type="a" url="http://localhost:3000">
        <anchor />
        http://localhost:3000
        <focus />
      </element>
      <text />
    </p>
  </editor>
) as any;

const url = 'http://localhost:5000';

const output = (
  <editor>
    <p>
      test
      <element type="a" url="http://localhost:5000">
        http://localhost:3000
      </element>
      <text />
    </p>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(withReact(input));

  wrapLink(editor, url);

  // console.log(input.children[0].);

  expect(input.children).toEqual(output.children);
});
