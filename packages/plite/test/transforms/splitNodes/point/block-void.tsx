/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split({ at: { path: [0, 0], offset: 2 } });
};
export const input = (
  <editor>
    <block void>word</block>
  </editor>
);
export const output = (
  <editor>
    <block void>word</block>
  </editor>
);
