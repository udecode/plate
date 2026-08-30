/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      <anchor />w<focus />
      ord
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
      ord
    </block>
  </editor>
);
