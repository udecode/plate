/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <block>
      <text />
    </block>,
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
    <block>wo</block>
    <block>
      <cursor />
    </block>
    <block>rd</block>
  </editor>
);
