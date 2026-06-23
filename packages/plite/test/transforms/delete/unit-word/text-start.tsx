/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'word' });
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
      <cursor /> two three
    </block>
  </editor>
);
