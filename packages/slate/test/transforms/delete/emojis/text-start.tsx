/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'character' });
};
export const input = (
  <editor>
    <block>
      <cursor />
      📛word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
      word
    </block>
  </editor>
);
