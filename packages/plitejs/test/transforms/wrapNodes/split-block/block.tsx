/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <cursor />
      word
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.wrap(<block new />, { split: true });
};
export const output = (
  <editor>
    <block new>
      <block>
        <cursor />
        word
      </block>
    </block>
  </editor>
);
