/** @jsx jsx */

import { jsx } from '../../..';

jsx;

// Apply a mark across a range containing text with other marks and some voids that support marks

export const run = (editor) => {
  editor.extend({
    name: 'markable-void-range-hanging-fixture',
    elements: [
      {
        type: 'markable-flag',
        match: (node) => node.markable === true,
        void: 'markable-inline',
      },
    ],
  });
  editor.marks.add('bold', true);
};
export const input = (
  <editor>
    <block>
      <text>
        <anchor />
      </text>
      <inline markable void>
        <text />
      </inline>
      <text italic>italic words </text>
      <inline markable void>
        <text />
      </inline>
      <text>
        <focus />
      </text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text bold>
        <anchor />
      </text>
      <inline markable void>
        <text bold />
      </inline>
      <text bold italic>
        italic words{' '}
      </text>
      <inline markable void>
        <text bold />
      </inline>
      <text bold>
        <focus />
      </text>
    </block>
  </editor>
);
