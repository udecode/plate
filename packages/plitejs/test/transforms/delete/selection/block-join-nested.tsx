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
        <block>
          word
          <anchor />
        </block>
        <block>
          <focus />
          another
        </block>
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        <block>
          word
          <cursor />
          another
        </block>
      </block>
    </block>
  </editor>
);
