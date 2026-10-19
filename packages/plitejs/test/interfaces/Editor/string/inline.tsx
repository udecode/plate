import { string as editorString } from '../../../../src/testing';
/** @jsx jsx  */

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => editorString(editor, [0, 1]);
export const output = 'two';
