/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split();
};
export const input = (
  <editor>
    <block>
      <block void>
        wo
        <anchor />
        rd
      </block>
      <block void>
        an
        <focus />
        other
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
    </block>
  </editor>
);
