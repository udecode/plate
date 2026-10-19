/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      <block>
        one
        <anchor />
      </block>
      <block>two</block>
    </block>
    <block>
      <block>
        <focus />
        three
      </block>
      <block>four</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        one
        <cursor />
        three
      </block>
    </block>
    <block>
      <block>four</block>
    </block>
  </editor>
);
