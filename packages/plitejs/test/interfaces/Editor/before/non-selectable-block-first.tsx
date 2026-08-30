import { jsx } from '../../..';
/** @jsx jsx */
import { before as editorBefore } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block nonSelectable>two</block>
    <block>three</block>
  </editor>
);

export const test = (editor) =>
  editorBefore(editor, { path: [1, 0], offset: 0 });

export const output = undefined;
