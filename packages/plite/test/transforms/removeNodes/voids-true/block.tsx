/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>one</block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.remove({ at: [0, 0], voids: true });
};
export const output = (
  <editor>
    <block void>
      <text />
    </block>
  </editor>
);
