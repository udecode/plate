/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a, mode: 'all' });
};
export const input = (
  <editor>
    <block a>
      <block>
        <anchor />
        one
      </block>
    </block>
    <block a>
      <block>
        two
        <focus />
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <anchor />
      one
    </block>
    <block>
      two
      <focus />
    </block>
  </editor>
);
