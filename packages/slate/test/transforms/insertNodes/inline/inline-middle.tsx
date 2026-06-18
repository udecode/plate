/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <inline void>
      <text />
    </inline>,
    options
  );
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        wo
        <cursor />
        rd
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
        wo
        <inline void>
          <cursor />
        </inline>
        rd
      </inline>
      <text />
    </block>
  </editor>
);
