/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);
export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <block void>
      <block>
        <text>two</text>
      </block>
    </block>,
    options
  );
};
export const output = (
  <editor>
    <block>one</block>
    <block void>
      <block>
        <text>
          two
          <cursor />
        </text>
      </block>
    </block>
  </editor>
);
