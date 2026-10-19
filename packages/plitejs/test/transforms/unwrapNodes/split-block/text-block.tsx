/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a, split: true });
};
export const input = (
  <editor>
    <block>
      <block a>
        one <anchor />
        two
        <focus /> three
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block a>
        one <anchor />
        two
        <focus /> three
      </block>
    </block>
  </editor>
);
