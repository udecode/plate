/** @jsx jsx */

import { jsx } from '../../..';

jsx;

// Apply a mark across a range containing text with other marks and one void that supports marks

export const run = (editor) => {
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
