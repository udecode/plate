import { getSnapshot as editorGetSnapshot } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ unit: 'line' });
};
export const input = (
  <editor>
    <block>
      one two three
      <cursor />
    </block>
  </editor>
);
export const output = editorGetSnapshot(input);
