/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeElement } from 'deserializers/utils';
import { ParagraphPlugin } from 'elements/paragraph';

const el = document.createElement('div');
el.setAttribute('data-slate-type', 'p');

export const input = {
  plugins: [ParagraphPlugin({ typeP: 'p' })],
  el,
  children: [{ text: 'test' }],
};

export const run = (value: any) => {
  return deserializeElement(value);
};

export const output = (
  <p>
    <text>test</text>
  </p>
);
