import { getSnapshot as editorGetSnapshot } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'line', reverse: true });
};
export const input = (
  <editor>
    <block>
      <cursor />
      one two three
    </block>
  </editor>
);
export const output = editorGetSnapshot(input);
