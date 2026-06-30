/** @jsx jsx */

import { jsx } from '../..';

void jsx;

export const run = (editor) => {
  editor.update(() => {
    editor.deleteBackward();
  });
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
    <block>Hello</block>
    <block>
      <block>
        <cursor />
        world!
      </block>
    </block>
  </editor>
);
