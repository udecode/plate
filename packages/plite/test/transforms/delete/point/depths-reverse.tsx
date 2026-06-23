/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ reverse: true });
};
export const input = (
  <editor>
    <block>Hello</block>
    <block>
      <block>
        <cursor />
        world!
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      Hello
      <cursor />
      world!
    </block>
  </editor>
);
