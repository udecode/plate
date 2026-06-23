/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'start', reverse: true });
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
      one
      <focus /> two t<anchor />
      hree
    </block>
  </editor>
);
