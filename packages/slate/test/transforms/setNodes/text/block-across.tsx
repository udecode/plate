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
      <anchor />
      word
    </block>
    <block>
      a<focus />
      nother
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text someKey>
        <anchor />
        word
      </text>
    </block>
    <block>
      <text someKey>
        a<focus />
        nother
      </text>
    </block>
  </editor>
);
