/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { deserializeMarks } from 'deserializers/utils';
import { BoldPlugin } from 'marks/bold';

export const input = {
  plugins: [BoldPlugin()],
  el: document.createElement('strong'),
  children: <fragment>test</fragment>,
};

export const run = (value: any) => {
  return deserializeMarks(value);
};

export const output = (
  <fragment>
    <txt bold>test</txt>
  </fragment>
);
