/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a, mode: 'all' });
};
export const input = (
  <editor>
    <block a>
      <block a>
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
      <cursor />
      word
    </block>
  </editor>
);
