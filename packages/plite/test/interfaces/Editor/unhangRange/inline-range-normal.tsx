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
      <text>Block before</text>
    </block>
    <block>
      <text>
        <anchor />
        Some text before{' '}
      </text>
      <inline void>
        <focus />
      </inline>
      <text />
    </block>
    <block>
      <text>Another block</text>
    </block>
  </editor>
);

export const test = (editor) => {
  const range = editorUnhangRange(editor, editorGetSnapshot(editor).selection);
  return range;
};

export const output = {
  anchor: { path: [1, 0], offset: 0 },
  focus: { path: [1, 1, 0], offset: 0 },
};
