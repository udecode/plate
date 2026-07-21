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
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline>
        fragment
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
