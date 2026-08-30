/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'character', reverse: true });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        wor📛
        <cursor />d
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
        wor
        <cursor />d
      </inline>
      <text />
    </block>
  </editor>
);
