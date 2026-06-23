/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(<fragment>fragment</fragment>, options);
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
      fragment
      <cursor />
    </block>
  </editor>
);
