import { jsx } from '../../..';
/** @jsx jsx */
import {
  getChildren as editorGetChildren,
  isVoid as editorIsVoid,
} from '../../../../src/internal';

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
