/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'start', reverse: true });
};
export const input = (
  <editor>
    <block>
      one <anchor />
      two t<focus />
      hree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <anchor /> two t<focus />
      hree
    </block>
  </editor>
);
