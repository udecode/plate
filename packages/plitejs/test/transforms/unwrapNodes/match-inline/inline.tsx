/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a });
};
export const input = (
  <editor>
    <block>
      w<anchor />
      <inline a>
        or
        <focus />
      </inline>
      d
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      w<anchor />
      or
      <focus />d
    </block>
  </editor>
);
