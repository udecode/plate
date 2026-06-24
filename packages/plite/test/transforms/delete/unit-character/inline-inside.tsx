/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      one
      <inline>
        <cursor />a
      </inline>
      two
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <inline>
        <cursor />
      </inline>
      two
    </block>
  </editor>
);
