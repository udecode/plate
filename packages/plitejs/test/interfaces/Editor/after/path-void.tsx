import { jsx } from '../../..';
/** @jsx jsx */
import { after as editorAfter } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block void>
      <text>one</text>
      <text>two</text>
    </block>
  </editor>
);

export const test = (editor) => editorAfter(editor, [0, 0], { voids: true });

export const output = { path: [0, 1], offset: 0 };
