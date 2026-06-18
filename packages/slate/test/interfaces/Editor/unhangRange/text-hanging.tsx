import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text>
        before
        <anchor />
      </text>
      <text>selected</text>
      <text>
        <focus />
        after
      </text>
    </block>
  </editor>
);

export const test = (editor) =>
  Editor.unhangRange(editor, Editor.getSnapshot(editor).selection);

export const output = {
  anchor: { path: [0, 0], offset: 6 },
  focus: { path: [0, 2], offset: 0 },
};
