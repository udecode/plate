/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      w<anchor />o<focus />
      rd
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      w<cursor />
      rd
    </block>
  </editor>
);
