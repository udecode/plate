/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      one
      <anchor />
      two
      <focus />
      three
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.wrap(<inline new />, { split: true });
};
export const output = (
  <editor>
    <block>
      one
      <inline new>
        <anchor />
        two
        <focus />
      </inline>
      three
    </block>
  </editor>
);
