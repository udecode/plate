/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { TextApi } from '@platejs/slate';

export const run = (editor) => {
  editor.nodes.set({ someKey: true }, { match: TextApi.isText });
};
export const input = (
  <editor>
    <block>
      <cursor />
      word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text someKey>
        <cursor />
        word
      </text>
    </block>
  </editor>
);
