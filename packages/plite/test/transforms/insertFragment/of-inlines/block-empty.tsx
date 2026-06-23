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
