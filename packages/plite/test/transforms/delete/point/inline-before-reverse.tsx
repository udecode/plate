/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ reverse: true });
};
export const input = (
  <editor>
    <block>one</block>
    <block>
      <cursor />
      two
      <inline>three</inline>
      four
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <cursor />
      two
      <inline>three</inline>
      four
    </block>
  </editor>
);
