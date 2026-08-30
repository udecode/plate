import { jsx } from '../../..';
/** @jsx jsx */
import {
  getChildren as editorGetChildren,
  isVoid as editorIsVoid,
} from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block void>one</block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return editorIsVoid(editor, block);
};
export const output = true;
