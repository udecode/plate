/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'line' });
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
      one two thr
      <cursor />
    </block>
  </editor>
);
