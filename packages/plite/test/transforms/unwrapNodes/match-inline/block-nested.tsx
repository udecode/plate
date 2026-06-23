/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a });
};
export const input = (
  <editor>
    <block>
      <block>
        w<anchor />
        <inline a>
          or
          <focus />
        </inline>
        d
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        w<anchor />
        or
        <focus />d
      </block>
    </block>
  </editor>
);
