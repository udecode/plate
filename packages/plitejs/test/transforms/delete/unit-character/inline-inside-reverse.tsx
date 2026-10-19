/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'character', reverse: true });
};
export const input = (
  <editor>
    <block>
      one
      <inline>
        a<cursor />
      </inline>
      three
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
      three
    </block>
  </editor>
);
