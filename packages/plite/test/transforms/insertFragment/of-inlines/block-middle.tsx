/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <inline>fragment</inline>
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
    <block>
      wo
      <inline>
        fragment
        <cursor />
      </inline>
      rd
    </block>
  </editor>
);
