/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>
      <cursor />
      one
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.remove({ at: [0] });
};
export const output = <editor />;
