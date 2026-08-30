/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split({ match: () => true, mode: 'highest' });
};
export const input = (
  <editor>
    <block>
      <block>
        <block>
          wo
          <cursor />
          rd
        </block>
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>
        <block>wo</block>
      </block>
    </block>
    <block>
      <block>
        <block>
          <cursor />
          rd
        </block>
      </block>
    </block>
  </editor>
);
