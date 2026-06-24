/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>1</block>
    <block>2</block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.move({ at: [1], to: [1] });
};
export const output = (
  <editor>
    <block>1</block>
    <block>2</block>
  </editor>
);
