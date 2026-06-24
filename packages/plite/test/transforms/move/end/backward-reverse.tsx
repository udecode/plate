/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'end', reverse: true });
};
export const input = (
  <editor>
    <block>
      one <focus />
      two t<anchor />
      hree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one <focus />
      two <anchor />
      three
    </block>
  </editor>
);
