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
        <anchor />
        one
      </block>
      <block>
        <block>two</block>
        <block>
          <block>
            three
            <focus />
          </block>
        </block>
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        <cursor />
      </block>
    </block>
  </editor>
);
