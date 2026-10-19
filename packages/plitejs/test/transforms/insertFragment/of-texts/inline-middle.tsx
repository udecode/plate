/** @jsx jsx */

import { jsx } from '../../..';
import { insertContentSlice } from '../../../support/with-test.js';

jsx;

export const run = (editor, options = {}) => {
  insertContentSlice(editor, <fragment>fragment</fragment>, options);
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        wo
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
);
// Current policy: text fragments inserted inside inline text split the inline
// and land at the surrounding block text level.
export const output = (
  <editor>
    <block>
      <text />
      <inline>wo</inline>
      fragment
      <cursor />
      <inline>rd</inline>
      <text />
    </block>
  </editor>
);
