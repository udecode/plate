/** @jsx jsx */

import { TextApi } from '@platejs/plite';

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>
      <block>
        <cursor />
        <text />
      </block>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.merge({ at: [1, 0, 1], match: TextApi.isText });
};
export const output = (
  <editor>
    <block>one</block>
    <block>
      <block>
        <cursor />
      </block>
    </block>
  </editor>
);
