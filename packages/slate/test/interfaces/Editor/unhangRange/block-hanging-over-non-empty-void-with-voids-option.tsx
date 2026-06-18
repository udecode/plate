import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <anchor />
      This is a first paragraph
    </block>
    <block>This is the second paragraph</block>
    <block void>
      This is the third paragraph
      {/* unhang should move focus to here */}
    </block>
    <block>
      <focus />
    </block>
  </editor>
);

export const test = (editor) =>
  Editor.unhangRange(editor, Editor.getSnapshot(editor).selection, {
    voids: true,
  });

export const output = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [2, 0], offset: 27 },
};
