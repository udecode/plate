import { jsx } from '../../..';
/** @jsx jsx */
import { isInline as editorIsInline } from '../../../../src/internal';
import { getChildren as editorGetChildren } from '../../../../src/testing';

jsx;

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = editorGetChildren(editor)[0].children[1];
  return editorIsInline(editor, inline);
};
export const output = true;
