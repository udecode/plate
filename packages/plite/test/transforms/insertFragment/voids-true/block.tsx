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
    <block void>
      wo
      <cursor />
      rd
    </block>
  </editor>
);
export const output = (
  <editor>
    <block void>
      wofragment
      <cursor />
      rd
    </block>
  </editor>
);
