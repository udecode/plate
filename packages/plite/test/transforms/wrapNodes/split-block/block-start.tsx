/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <anchor />
      wo
      <focus />
      rd
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
        <anchor />
        wo
        <focus />
      </block>
    </block>
    <block>rd</block>
  </editor>
);
