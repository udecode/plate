/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'character' });
};
export const input = (
  <editor>
    <block>
      a<cursor />
      <inline>two</inline>
      three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      a
      <inline>
        <cursor />
        wo
      </inline>
      three
    </block>
  </editor>
);
