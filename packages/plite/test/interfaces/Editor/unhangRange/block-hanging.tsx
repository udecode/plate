import {
  getSnapshot as editorGetSnapshot,
  unhangRange as editorUnhangRange,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <anchor />
      word
    </block>
    <block>
      <focus />
      another
    </block>
  </editor>
);

export const test = (editor) =>
  editorUnhangRange(editor, editorGetSnapshot(editor).selection);

export const output = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 4 },
};
