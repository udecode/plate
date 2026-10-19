import { ElementApi } from 'plitejs';

/** @jsx jsx */
import { above as editorAbove } from '../../../../src/internal';
import { isBlock as editorIsBlock } from '../../../../src/testing';

export const input = (
  <editor>
    <block>
      <block>one </block>
    </block>
  </editor>
);

export const test = (editor) =>
  editorAbove(editor, {
    at: [0, 0, 0],
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
    mode: 'lowest',
  });

export const output = [<block>one </block>, [0, 0]];
