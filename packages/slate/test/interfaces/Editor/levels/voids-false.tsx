import { Editor } from '@platejs/slate/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <element void>
      <text />
    </element>
  </editor>
);
export const test = (editor) =>
  Array.from(Editor.levels(editor, { at: [0, 0] }));
export const output = [
  [input, []],
  [
    <element void>
      <text />
    </element>,
    [0],
  ],
];
