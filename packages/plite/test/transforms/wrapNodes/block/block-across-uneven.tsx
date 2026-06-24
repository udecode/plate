/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.wrap(<block a />);
};
export const input = (
  <editor>
    <block>
      <block>
        wo
        <anchor />
        rd
      </block>
      <block>
        <block>
          an
          <focus />
          other
        </block>
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block a>
        <block>
          wo
          <anchor />
          rd
        </block>
        <block>
          <block>
            an
            <focus />
            other
          </block>
        </block>
      </block>
    </block>
  </editor>
);
