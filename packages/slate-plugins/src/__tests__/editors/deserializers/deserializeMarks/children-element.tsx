/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeMarks } from 'deserializers/utils';
import { ParagraphPlugin } from 'elements/paragraph';
import { BoldPlugin } from 'marks/bold';
import { ItalicPlugin } from 'marks/italic';

const node = (
  <li>
    <p>test</p>test
  </li>
);

export const input = {
  plugins: [ParagraphPlugin(), BoldPlugin(), ItalicPlugin()],
  el: document.createElement('strong'),
  children: [node],
};

export const run = (value: any) => {
  return deserializeMarks(value);
};

export const output = (
  <fragment>
    <li>
      <p>
        <txt bold>test</txt>
      </p>
      <txt bold>test</txt>
    </li>
  </fragment>
);
