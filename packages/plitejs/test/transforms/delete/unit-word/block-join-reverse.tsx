/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'word', reverse: true });
};
export const input = (
  <editor>
    <block>word</block>
    <block>
      <cursor />
      another
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      word
      <cursor />
      another
    </block>
  </editor>
);
