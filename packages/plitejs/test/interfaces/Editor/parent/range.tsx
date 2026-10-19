import { jsx } from '../../..';
/** @jsx jsx */
import { parent as editorParent } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  editorParent(editor, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 2 },
  });
export const output = [<block>one</block>, [0]];
