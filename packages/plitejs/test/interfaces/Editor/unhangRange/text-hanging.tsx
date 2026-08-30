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
  editorUnhangRange(editor, editorGetSnapshot(editor).selection);

export const output = {
  anchor: { path: [0, 0], offset: 6 },
  focus: { path: [0, 2], offset: 0 },
};
