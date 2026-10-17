/** @jsx jsx */

import { jsx } from '../../..';

jsx;

// A range that ends at the start of a leaf leaves that leaf unmarked

export const run = (editor) => {
  editor.marks.add('bold', true);
};
export const input = (
  <editor>
    <block>
      <text>
        <anchor />
        one
      </text>
      <text italic>
        <focus />
        two
      </text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text bold>
        <anchor />
        one
      </text>
      <text italic>
        <focus />
        two
      </text>
    </block>
  </editor>
);
