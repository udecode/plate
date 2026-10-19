/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block a>
      <block>
        w<anchor />
        or
        <focus />d
      </block>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.wrap(<block new />, { split: true });
};
export const output = (
  <editor>
    <block a>
      <block>w</block>
      <block new>
        <block>
          <anchor />
          or
          <focus />
        </block>
      </block>
      <block>d</block>
    </block>
  </editor>
);
