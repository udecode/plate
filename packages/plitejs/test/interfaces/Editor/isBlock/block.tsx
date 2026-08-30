import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import {
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
} from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return ElementApi.isElement(block) && editorIsBlock(editor, block);
};
export const output = true;
