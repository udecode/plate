/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ reverse: true });
};
export const input = (
  <editor>
    <block>
      <block>word</block>
      <block>
        <cursor />
        another
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        word
        <cursor />
        another
      </block>
    </block>
  </editor>
);
