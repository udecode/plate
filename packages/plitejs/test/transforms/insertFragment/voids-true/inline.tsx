/** @jsx jsx */

import { jsx } from '../../..';
import { insertContentSlice } from '../../../support/with-test.js';

jsx;

export const run = (editor, options = {}) => {
  insertContentSlice(editor, <fragment>fragment</fragment>, {
    voids: true,
    ...options,
  });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline void>
        wo
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline void>
        wofragment
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
);
