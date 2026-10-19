/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.insert('a');
};
export const input = (
  <editor>
    <block>
      first paragraph
      <inline>
        tw
        <anchor />o
      </inline>
    </block>
    <block>
      second
      <focus />
      paragraph
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      first paragraph
      <inline>
        twa
        <cursor />
      </inline>
      paragraph
    </block>
  </editor>
);
