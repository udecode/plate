/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        wo
        <anchor />r<focus />d
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
        wo
        <cursor />d
      </inline>
      <text />
    </block>
  </editor>
);
