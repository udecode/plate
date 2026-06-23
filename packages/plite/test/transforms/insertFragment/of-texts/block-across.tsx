/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(<fragment>fragment</fragment>, options);
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
