import { Editor } from '@platejs/plite/internal';
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
export const output = Editor.getSnapshot(input);
