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
      <text />
      <inline>
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline>
        <text />
      </inline>
      <text />
      <inline>
        fragment
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
