/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

// A range that starts inside a markable void marks that void

export const run = (editor) => {
  editor.marks.add('bold', true);
};
export const input = (
  <editor>
    <block>
      <text />
      <inline markable void>
        <text>
          <anchor />
        </text>
      </inline>
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
      <text />
      <inline markable void>
        <text bold>
          <anchor />
        </text>
      </inline>
      <text bold>
        two
        <focus />
      </text>
    </block>
  </editor>
);
