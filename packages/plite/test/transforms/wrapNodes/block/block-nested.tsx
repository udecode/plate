/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.wrap(<block new />);
};
export const input = (
  <editor>
    <block a>
      <block b>
        <cursor />
        word
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block a>
      <block new>
        <block b>
          <cursor />
          word
        </block>
      </block>
    </block>
  </editor>
);
