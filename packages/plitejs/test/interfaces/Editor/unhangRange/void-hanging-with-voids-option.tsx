import { jsx } from '../../..';
/** @jsx jsx */
import {
  getSnapshot as editorGetSnapshot,
  unhangRange as editorUnhangRange,
} from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>
      <anchor />
      This is a first paragraph
    </block>
    <block>This is the second paragraph</block>
    <block void>
      <focus />
    </block>
  </editor>
);

export const test = (editor) =>
  editorUnhangRange(editor, editorGetSnapshot(editor).selection, {
    voids: true,
  });

export const output = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [1, 0], offset: 28 },
};
