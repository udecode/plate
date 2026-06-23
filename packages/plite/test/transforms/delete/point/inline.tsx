/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
    <block>
      two<inline>three</inline>four
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <cursor />
      two<inline>three</inline>four
    </block>
  </editor>
);
