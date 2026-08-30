import { jsx } from '../../..';
/** @jsx jsx */
import { getSnapshot as editorGetSnapshot } from '../../../../src/internal';

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
