/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.wrap(<inline a />);
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        wo
        <anchor />
        rd
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline>
        an
        <focus />
        other
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline a>
        <text />
        <inline>
          wo
          <anchor />
          rd
        </inline>
        <text />
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline a>
        <text />
        <inline>
          an
          <focus />
          other
        </inline>
        <text />
      </inline>
      <text />
    </block>
  </editor>
);
