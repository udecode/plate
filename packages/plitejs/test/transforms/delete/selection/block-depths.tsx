/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      wo
      <anchor />
      rd
    </block>
    <block>
      <block>middle</block>
      <block>
        an
        <focus />
        other
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      wo
      <cursor />
      other
    </block>
  </editor>
);
