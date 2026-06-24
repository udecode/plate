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
      <cursor />
    </block>
    <block>
      <text />
      <inline void>
        <text />
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      word
      <cursor />
      <inline void>
        <text />
      </inline>
      <text />
    </block>
  </editor>
);
