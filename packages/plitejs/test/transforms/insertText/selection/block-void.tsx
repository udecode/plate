/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.insert('a');
};
export const input = (
  <editor>
    <block void>
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block void>
      <cursor />
    </block>
  </editor>
);
