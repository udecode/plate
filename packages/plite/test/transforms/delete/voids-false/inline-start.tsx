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
      <inline void>
        <anchor />
      </inline>
      <focus />
      two
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <cursor />
      two
    </block>
  </editor>
);
