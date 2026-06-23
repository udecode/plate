/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <block>
        <block>3</block>
        <block>4</block>
      </block>
    </fragment>,
    options
  );
};
export const input = (
  <editor>
    <block>
      <block>1</block>
      <block>
        2<cursor />
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>1</block>
      <block>23</block>
      <block>
        4<cursor />
      </block>
    </block>
  </editor>
);
