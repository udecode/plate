import { jsx } from '../../..';
/** @jsx jsx */
import { before as editorBefore } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);

export const test = (editor) => editorBefore(editor, [0, 0]);

export const output = undefined;
