/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.insert('x', { at: { path: [0, 0], offset: 0 } });
};
export const input = (
  <editor>
    <block>
      <text>
        wo
        <cursor />
        rd
      </text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      xwo
      <cursor />
      rd
    </block>
  </editor>
);
