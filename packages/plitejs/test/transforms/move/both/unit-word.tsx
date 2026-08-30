/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ unit: 'word' });
};
export const input = (
  <editor>
    <block>
      one <cursor />
      two three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two
      <cursor /> three
    </block>
  </editor>
);
