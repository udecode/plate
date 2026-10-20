/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text />
      <inline>
        one
        <anchor />
      </inline>
      <text />
      <inline>
        <focus />
        two
      </inline>
      <text />
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.wrap(<inline new />, { split: true });
};
export const output = (
  <editor>
    <block>
      <text />
      <inline>
        one
        <anchor />
      </inline>
      <text />
      <inline>
        <focus />
        two
      </inline>
      <text />
    </block>
  </editor>
);
