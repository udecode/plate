/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeElement } from 'deserializers/paste-html/utils';
import { ParagraphPlugin } from 'elements/paragraph';

const input = {
  plugins: [ParagraphPlugin({ typeP: 'p' })],
  el: document.createElement('p'),
  children: [{ text: 'test' }],
};

const output = (
  <p>
    <txt>test</txt>
  </p>
);

it('should be', () => {
  expect(deserializeElement(input)).toEqual(output);
});
