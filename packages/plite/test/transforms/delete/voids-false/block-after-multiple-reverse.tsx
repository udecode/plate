/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ reverse: true });
};
export const input = (
  <editor>
    <block>
      <text />
    </block>
    <block void>
      <text />
    </block>
    <block void>
      <text />
    </block>
    <block void>
      <text />
    </block>
    <block>
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
    </block>
    <block void>
      <text />
    </block>
    <block void>
      <text />
    </block>
    <block>
      <cursor />
    </block>
  </editor>
);
