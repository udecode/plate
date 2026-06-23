import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);
export const test = (editor) =>
  Editor.unhangRange(editor, Editor.getSnapshot(editor).selection);
export const output = {
  anchor: { path: [0, 0], offset: 3 },
  focus: { path: [0, 0], offset: 3 },
};
