import { jsx } from '../../..';
/** @jsx jsx */
import { isEmpty as editorIsEmpty } from '../../../../src/internal';
import { getChildren as editorGetChildren } from '../../../../src/testing';

jsx;

export const input = (
  <editor>
    <block>
      one
      <inline void>
        <text />
      </inline>
      three
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = editorGetChildren(editor)[0].children[1];
  return editorIsEmpty(editor, inline);
};
export const output = false;
