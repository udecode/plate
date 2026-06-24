/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.wrap(<inline a />);
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        <cursor />
        word
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline>
        <text />
        <inline a>
          <cursor />
          word
        </inline>
        <text />
      </inline>
      <text />
    </block>
  </editor>
);
