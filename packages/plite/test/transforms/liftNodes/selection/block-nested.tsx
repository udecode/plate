/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.lift({ match: (n) => n.c });
};
export const input = (
  <editor>
    <block a>
      <block b>
        <block c>
          <cursor />
          one
        </block>
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block a>
      <block c>
        <cursor />
        one
      </block>
    </block>
  </editor>
);
