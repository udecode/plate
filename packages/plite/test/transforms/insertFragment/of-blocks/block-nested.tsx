/** @jsx jsx */

import { jsx } from '../../..';
import { insertContentSlice } from '../../../support/with-test.js';

jsx;

export const run = (editor, options = {}) => {
  insertContentSlice(
    editor,
    <fragment>
      <block>one</block>
      <block>two</block>
      <block>three</block>
    </fragment>,
    options
  );
};
export const input = (
  <editor>
    <block>
      <block>
        word
        <cursor />
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>wordone</block>
      <block>two</block>
      <block>
        three
        <cursor />
      </block>
    </block>
  </editor>
);
