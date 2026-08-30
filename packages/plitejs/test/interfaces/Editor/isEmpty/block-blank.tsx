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
      <text />
    </block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return editorIsEmpty(editor, block);
};
export const output = true;
