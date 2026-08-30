import { ElementApi } from 'plitejs';

/** @jsx jsx */
import {
  above as editorAbove,
  isBlock as editorIsBlock,
} from '../../../../src/internal';

export const input = (
  <editor>
    <block>
      <block>
        <block>one</block>
      </block>
      <block>two</block>
    </block>
  </editor>
);
const range = {
  kind: 'text',
  anchor: { offset: 0, path: [0, 0, 0, 0] },
  focus: { offset: 0, path: [0, 1, 0] },
};
export const test = (editor) =>
  editorAbove(editor, {
    at: range,
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
  });
export const output = [
  <block>
    <block>
      <block>one</block>
    </block>
    <block>two</block>
  </block>,
  [0],
];
