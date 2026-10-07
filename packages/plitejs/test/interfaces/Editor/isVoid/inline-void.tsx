import { jsx } from '../../..';
/** @jsx jsx */
import { isVoid as editorIsVoid } from '../../../../src/internal';
import { getChildren as editorGetChildren } from '../../../../src/testing';

jsx;

export const input = (
  <editor>
    <block>
      one<inline void>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = editorGetChildren(editor)[0].children[1];
  return editorIsVoid(editor, inline);
};
export const output = true;
