/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.merge({
    at: {
      path: [0, 1, 1, 0, 0, 0],
      offset: 0,
    },
  });
};

export const input = (
  <editor>
    <block>
      <block>
        <text>123</text>
      </block>
      <block>
        <block>
          <text>45</text>
        </block>
        <block>
          <block>
            <block>
              <text>c</text>
            </block>
          </block>
        </block>
      </block>
    </block>
  </editor>
);

export const output = (
  <editor>
    <block>
      <block>
        <text>123</text>
      </block>
      <block>
        <block>
          <text>45c</text>
        </block>
      </block>
    </block>
  </editor>
);
