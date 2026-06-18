/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { TextApi } from '@platejs/slate';

export const input = (
  <editor>
    <block>
      <text>
        <anchor />
        word
        <focus />
      </text>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.wrap(<block new />, { match: TextApi.isText });
};
export const output = (
  <editor>
    <block>
      <block new>
        <anchor />
        word
        <focus />
      </block>
    </block>
  </editor>
);
