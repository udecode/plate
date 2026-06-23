import { Editor } from '@platejs/plite/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (editor) =>
  Array.from(
    Editor.levels(editor, {
      at: [0, 0],
      reverse: true,
    })
  );
export const output = [
  [<text />, [0, 0]],
  [
    <element>
      <text />
    </element>,
    [0],
  ],
  [input, []],
];
