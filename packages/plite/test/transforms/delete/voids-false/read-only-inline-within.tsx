/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ reverse: true });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline readOnly>
        read-only <cursor />
        inline
      </inline>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text>
        <cursor />
      </text>
    </block>
  </editor>
);
