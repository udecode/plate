/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.insert(' a few words ');
};
export const input = (
  <editor>
    <block>
      w<cursor />
      ord
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      w a few words <cursor />
      ord
    </block>
  </editor>
);
