/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

// A range that starts at the end of a leaf leaves that leaf unmarked

export const run = (editor) => {
  editor.marks.add('bold', true);
};
export const input = (
  <editor>
    <block>
      <text italic>
        one
        <anchor />
      </text>
      <text>
        two
        <focus />
      </text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text italic>
        one
        <anchor />
      </text>
      <text bold>
        two
        <focus />
      </text>
    </block>
  </editor>
);
