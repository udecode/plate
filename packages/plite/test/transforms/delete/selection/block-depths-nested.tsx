/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      <block>
        one
        <anchor />
      </block>
    </block>
    <block>
      <focus />
      two
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        one
        <cursor />
        two
      </block>
    </block>
  </editor>
);
