/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ reverse: true });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        word🇫🇷
        <cursor />
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
        word
        <cursor />
        🇫🇷
      </inline>
      <text />
    </block>
  </editor>
);
