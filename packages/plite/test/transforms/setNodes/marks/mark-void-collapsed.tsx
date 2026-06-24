/** @jsx jsx */

import { jsx } from '../../..';

jsx;

// Apply a mark across a range containing text with other marks and one void that supports marks

export const run = (editor) => {
  editor.extend({
    name: 'markable-void-collapsed-fixture',
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
      <text>word</text>
      <inline markable void>
        <text />
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text>word</text>
      <inline markable void>
        <text bold />
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
