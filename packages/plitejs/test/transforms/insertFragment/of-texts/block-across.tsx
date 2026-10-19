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
      wo
      <anchor />
      rd
    </block>
    <block>
      an
      <focus />
      other
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      wofragment
      <cursor />
      other
    </block>
  </editor>
);
