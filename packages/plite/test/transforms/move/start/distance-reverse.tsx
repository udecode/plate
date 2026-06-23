/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'start', reverse: true, distance: 3 });
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
      o<anchor />
      ne two t<focus />
      hree
    </block>
  </editor>
);
