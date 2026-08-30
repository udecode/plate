/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'focus', reverse: true });
};
export const input = (
  <editor>
    <block>
      one <anchor />
      tw
      <focus />o three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one <anchor />t<focus />
      wo three
    </block>
  </editor>
);
