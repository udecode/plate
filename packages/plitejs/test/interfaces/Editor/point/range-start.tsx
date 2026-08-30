import { jsx } from '../../..';
/** @jsx jsx */
import { point as editorPoint } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  editorPoint(
    editor,
    {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 1], offset: 2 },
    },
    { edge: 'start' }
  );
export const output = { path: [0, 0], offset: 1 };
