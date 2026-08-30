import { ElementApi } from 'plitejs';

/** @jsx jsx */
import {
  above as editorAbove,
  isBlock as editorIsBlock,
} from '../../../../src/internal';

export const input = (
  <editor>
    <block>
      <block>one</block>
    </block>
  </editor>
);
export const test = (editor) =>
  editorAbove(editor, {
    at: [0, 0, 0],
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
    mode: 'highest',
  });
export const output = [
  <block>
    <block>one</block>
  </block>,
  [0],
];
