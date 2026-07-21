/** @jsx jsx */

import { jsx } from '../../..';
import { insertContentSlice } from '../../../support/with-test.js';

jsx;

export const run = (editor, options = {}) => {
  insertContentSlice(
    editor,
    <fragment>
      <text>one</text>
      <block>two</block>
      <text>three</text>
    </fragment>,
    options
  );
};
export const input = (
  <editor>
    <block>
      wo
      <cursor />
      rd
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>woone</block>
    <block>two</block>
    <block>
      three
      <cursor />
      rd
    </block>
  </editor>
);
