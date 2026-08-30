/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.insert(' a few words');
};
export const input = (
  <editor>
    <block>
      word
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      word a few words
      <cursor />
    </block>
  </editor>
);
