import { levels as editorLevels } from '@platejs/plite/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (editor) =>
  Array.from(editorLevels(editor, { at: [0, 0] }));
export const output = [
  [input, []],
  [
    <element>
      <text />
    </element>,
    [0],
  ],
  [<text />, [0, 0]],
];
