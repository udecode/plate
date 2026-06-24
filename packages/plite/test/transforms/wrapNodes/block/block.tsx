/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.wrap(<block a />);
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
    <block a>
      <block>
        <cursor />
        word
      </block>
    </block>
  </editor>
);
