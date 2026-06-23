/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
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
export const output = (
  <editor>
    <block>
      <text />
      <inline>wo</inline>
      <text />
      <inline>
        <cursor />
        other
      </inline>
      <text />
    </block>
  </editor>
);
