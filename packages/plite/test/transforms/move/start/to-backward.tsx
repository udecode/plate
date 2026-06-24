/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'start', distance: 8 });
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
      one two t<focus />
      hre
      <anchor />e
    </block>
  </editor>
);
