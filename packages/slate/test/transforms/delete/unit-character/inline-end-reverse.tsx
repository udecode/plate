/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'character', reverse: true });
};
export const input = (
  <editor>
    <block>
      one
      <inline>two</inline>
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <inline>
        tw
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
