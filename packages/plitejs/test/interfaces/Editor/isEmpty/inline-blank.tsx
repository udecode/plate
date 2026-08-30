import { jsx } from '../../..';
/** @jsx jsx */
import {
  getChildren as editorGetChildren,
  isEmpty as editorIsEmpty,
} from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>
      one
      <inline>
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
export const output = true;
