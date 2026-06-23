/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      <cursor />
    </block>
    <block void>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
    </block>
  </editor>
);
