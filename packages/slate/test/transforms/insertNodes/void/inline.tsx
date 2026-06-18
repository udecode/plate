/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      one
      <inline>
        two
        <cursor />
      </inline>
      three
    </block>
  </editor>
);
export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <inline void>
      <text>four</text>
    </inline>,
    options
  );
};
export const output = (
  <editor>
    <block>
      one
      <inline>
        two
        <inline void>
          four
          <cursor />
        </inline>
        <text />
      </inline>
      three
    </block>
  </editor>
);
