/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text />
      <inline void>one</inline>
      <text />
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.remove({ at: [0, 1, 0], voids: true });
};
export const output = (
  <editor>
    <block>
      <text />
      <inline void>
        <text />
      </inline>
      <text />
    </block>
  </editor>
);
