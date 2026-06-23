import { TextApi } from '@platejs/plite';
import { Editor } from '@platejs/plite/internal';

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
    Editor.levels(editor, {
      at: [0, 0],
      match: TextApi.isText,
      voids: true,
    })
  );

export const output = [[<text />, [0, 0]]];
