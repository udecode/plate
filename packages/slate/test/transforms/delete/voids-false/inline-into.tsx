/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      <anchor />
      one
      <inline>
        t<focus />
        wo
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
        <cursor />
        wo
      </inline>
      <text />
    </block>
  </editor>
);
