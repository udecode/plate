import { TextApi } from 'plitejs';

import { levels as editorLevels } from '../../../../src/internal';

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
      match: TextApi.isText,
      voids: true,
    })
  );

export const output = [[<text />, [0, 0]]];
