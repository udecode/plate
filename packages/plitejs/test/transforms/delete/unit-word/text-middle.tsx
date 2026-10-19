/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'word' });
};
export const input = (
  <editor>
    <block>
      o<cursor />
      ne two three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      o<cursor /> two three
    </block>
  </editor>
);
