/** @jsx jsx */

import { TextApi } from 'plitejs';

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.merge({ at: [1, 0], match: TextApi.isText });
};
export const output = (
  <editor>
    <block>onetwo</block>
  </editor>
);
