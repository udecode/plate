/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'word', reverse: true });
};
export const input = (
  <editor>
    <block>
      one two three
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two <cursor />
    </block>
  </editor>
);
