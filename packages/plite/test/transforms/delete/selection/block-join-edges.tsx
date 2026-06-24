/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      word
      <anchor />
    </block>
    <block>
      <focus />
      another
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      word
      <cursor />
      another
    </block>
  </editor>
);
