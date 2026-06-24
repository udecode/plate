/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'line', reverse: true });
};
export const input = (
  <editor>
    <block>
      one two thr
      <cursor />
      ee
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
      ee
    </block>
  </editor>
);
