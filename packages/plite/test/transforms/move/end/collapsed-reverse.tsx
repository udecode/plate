/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'end', reverse: true });
};
export const input = (
  <editor>
    <block>
      one two t<cursor />
      hree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two <focus />t<anchor />
      hree
    </block>
  </editor>
);
