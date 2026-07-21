/** @jsx jsx */

import { jsx } from '../../..';
import { insertContentSlice } from '../../../support/with-test.js';

jsx;

export const run = (editor, options = {}) => {
  insertContentSlice(
    editor,
    <fragment>
      <inline>fragment</inline>
    </fragment>,
    options
  );
};
export const input = (
  <editor>
    <block>
      word
      <cursor />
    </block>
  </editor>
);
// Current policy: the inserted inline owns the collapsed cursor and is followed
// by the normal trailing spacer text node.
export const output = (
  <editor>
    <block>
      word
      <inline>
        fragment
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
