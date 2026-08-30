import { jsx } from '../../..';
/** @jsx jsx */
import { before as editorBefore } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);

export const test = (editor) =>
  editorBefore(editor, { path: [0, 0], offset: 1 });

export const output = { path: [0, 0], offset: 0 };
