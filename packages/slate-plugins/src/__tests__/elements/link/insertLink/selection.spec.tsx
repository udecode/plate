/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { insertLink, LINK, withLink } from 'elements';

const input = (
  <editor>
    <p>
      insert link <anchor />
      here
      <focus />.
    </p>
  </editor>
) as any;

const url = 'http://localhost';

const output = (
  <editor>
    <p>
      insert link{' '}
      <element type={LINK} url={url}>
        here
      </element>
      .
    </p>
  </editor>
) as any;

it('should run default insertText', () => {
  const editor = withLink()(input);
  insertLink(editor, url);

  expect(input.children).toEqual(output.children);
});
