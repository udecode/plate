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
      <inline>wo</inline>
      <text />
      <inline>
        fragment
        <cursor />
      </inline>
      <text />
      <inline>rd</inline>
      <text />
    </block>
  </editor>
);
