/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>
      <text>
        t<cursor />
        wo
      </text>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.text.delete({ at: [1, 0] });
};
export const output = (
  <editor>
    <block>
      one
      <cursor />
    </block>
    <block>
      <text />
    </block>
  </editor>
);
