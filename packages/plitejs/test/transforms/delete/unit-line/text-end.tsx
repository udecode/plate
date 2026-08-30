import { jsx } from '../../..';
/** @jsx jsx */
import { getSnapshot as editorGetSnapshot } from '../../../../src/internal';

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
