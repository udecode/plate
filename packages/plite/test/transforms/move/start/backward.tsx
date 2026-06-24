/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'start' });
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
      one t<focus />
      wo t<anchor />
      hree
    </block>
  </editor>
);
