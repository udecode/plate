/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <inline void>
      <text />
    </inline>,
    options
  );
};
export const input = (
  <editor>
    <block>
      wo
      <cursor />
      rd
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      wo
      <inline void>
        <cursor />
      </inline>
      rd
    </block>
  </editor>
);
