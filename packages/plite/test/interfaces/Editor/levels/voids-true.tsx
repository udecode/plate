import { levels as editorLevels } from '@platejs/plite/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <element void>
      <text />
    </element>
  </editor>
);
export const test = (editor) =>
  Array.from(
    editorLevels(editor, {
      at: [0, 0],
      voids: true,
    })
  );
export const output = [
  [input, []],
  [
    <element void>
      <text />
    </element>,
    [0],
  ],
  [<text />, [0, 0]],
];
