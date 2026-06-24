/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      hello
      <cursor />
    </block>
  </editor>
);
export const run = (editor, options = {}) => {
  editor.nodes.insert(
    [
      <inline>
        <text />
      </inline>,
      <text>world</text>,
    ],
    options
  );
};
export const output = (
  <editor>
    <block>
      hello
      <inline>
        <text />
      </inline>
      world
      <cursor />
    </block>
  </editor>
);
