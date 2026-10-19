import { jsx } from '../../..';
/** @jsx jsx */
import { path as editorPath } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  editorPath(
    editor,
    {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    },
    { edge: 'end' }
  );
export const output = [1, 0];
