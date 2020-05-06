/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeElement } from 'deserializers/utils';
import { ParagraphPlugin } from 'elements/paragraph';

export const input = {
  plugins: [ParagraphPlugin({ typeP: 'p' })],
  el: document.createElement('p'),
  children: [{ text: 'test' }],
};

export const run = (value: any) => {
  return deserializeElement(value);
};

export const output = (
  <p>
    <txt>test</txt>
  </p>
);
