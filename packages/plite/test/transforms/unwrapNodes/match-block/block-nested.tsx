/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a });
};
export const input = (
  <editor>
    <block a>
      <block>
        <block>
          <cursor />
          word
        </block>
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        <cursor />
        word
      </block>
    </block>
  </editor>
);
