/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'character', distance: 3, reverse: true });
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
      w<cursor />
    </block>
  </editor>
);
