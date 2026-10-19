/** @jsx jsx */

import { TextApi } from 'plitejs';

import { jsx } from '../..';

jsx;

export const run = (editor) => {
  editor.nodes.unset('someKey', { match: TextApi.isText });
};
export const input = (
  <editor>
    <block>
      <text someKey>
        <cursor />
        word
      </text>
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
