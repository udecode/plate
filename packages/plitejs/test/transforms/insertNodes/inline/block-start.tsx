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
      <cursor />
      word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline void>
        <cursor />
      </inline>
      word
    </block>
  </editor>
);
