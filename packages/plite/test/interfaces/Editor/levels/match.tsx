import { levels as editorLevels } from '@platejs/plite/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <element a>
      <text a />
    </element>
  </editor>
);
export const test = (editor) =>
  Array.from(
    editorLevels(editor, {
      at: [0, 0],
      match: (n) => n.a,
    })
  );
export const output = [
  [
    <element a>
      <text a />
    </element>,
    [0],
  ],
  [<text a />, [0, 0]],
];
