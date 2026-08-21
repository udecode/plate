/** @jsx jsx */

import { TextApi } from '@platejs/plite';

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>
      <cursor />
      <text />
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.merge({ at: [1, 1], match: TextApi.isText });
};
export const output = (
  <editor>
    <block>one</block>
    <block>
      <cursor />
    </block>
  </editor>
);
