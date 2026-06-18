/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'line' });
};
export const input = (
  <editor>
    <block>
      <cursor />
      one two three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
    </block>
  </editor>
);
