/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <block>
        <block>
          <block>
            <block>New 1</block>
            <block>New 2</block>
          </block>
        </block>
      </block>
    </fragment>,
    options
  );
};
export const input = (
  <editor>
    <block>
      <block>
        <block>
          <block>
            {'Existing 1 '}
            <cursor />
          </block>
          <block>Existing 2</block>
        </block>
      </block>
    </block>
  </editor>
);
// Core policy: insertFragment is structural, not table-grid aware. The first
// compatible source cell merges into the active cell; later source cells stay
// as inserted siblings before the existing following cells. Positional grid
// merge belongs in a table extension.
export const output = (
  <editor>
    <block>
      <block>
        <block>
          <block>Existing 1 New 1</block>
          <block>
            New 2<cursor />
          </block>
          <block>Existing 2</block>
        </block>
      </block>
    </block>
  </editor>
);
