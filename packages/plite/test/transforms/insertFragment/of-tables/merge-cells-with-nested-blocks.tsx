/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <block>
        <block>
          <block>
            <block>
              <block>1</block>
            </block>
            <block>
              <block>2</block>
            </block>
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
            <block>
              <cursor />
            </block>
          </block>
          <block>
            <block>
              <text />
            </block>
          </block>
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
          <block>
            <block>1</block>
            <block>
              <block>
                2<cursor />
              </block>
            </block>
          </block>
          <block>
            <block>
              <text />
            </block>
          </block>
        </block>
      </block>
    </block>
  </editor>
);
