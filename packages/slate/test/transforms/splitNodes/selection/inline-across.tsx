/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text />
      <inline>
        wo
        <anchor />
        rd
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline>
        an
        <focus />
        other
      </inline>
      <text />
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.split();
};
export const output = (
  <editor>
    <block>
      <text />
      <inline>wo</inline>
      <text />
    </block>
    <block>
      <text />
      <inline>
        <cursor />
        other
      </inline>
      <text />
    </block>
  </editor>
);
