/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import _ from 'lodash';
import { TextApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.set(
    { a: { b: 2, c: 3 } },
    { at: [0, 0], match: TextApi.isText, merge: (n, p) => _.defaultsDeep(p, n) }
  );
};
export const input = (
  <editor>
    <block>
      <text a={{ b: 1 }}>word</text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text a={{ b: 2, c: 3 }}>word</text>
    </block>
  </editor>
);
