import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <anchor />
      This is a first paragraph
      <inline void>
        <text />
      </inline>
      <text />
      {/* unhang should move focus to here */}
    </block>
    <block>
      <focus />
      This is the second paragraph
    </block>
  </editor>
);

export const test = (editor) =>
  Editor.unhangRange(editor, Editor.getSnapshot(editor).selection, {
    voids: true,
  });

export const output = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 2], offset: 0 },
};
