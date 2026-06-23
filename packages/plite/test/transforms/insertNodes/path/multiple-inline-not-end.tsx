/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      hel
      <cursor />
      lo
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
      hel
      <inline>
        <text />
      </inline>
      world
      <cursor />
      lo
    </block>
  </editor>
);
