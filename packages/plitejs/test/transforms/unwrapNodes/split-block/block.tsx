/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a, split: true });
};
export const input = (
  <editor>
    <block a>
      <block>
        <cursor />
        one
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
      one
    </block>
  </editor>
);
