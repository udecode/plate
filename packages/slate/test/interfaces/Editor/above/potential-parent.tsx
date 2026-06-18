import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { ElementApi } from '@platejs/slate';

// `above` can never return the location passed into it, and shouldnt care if it exists, only if its parent exists.

export const input = (
  <editor>
    <block>
      <block>
        <block>one</block>
        {/* path points here */}
      </block>
      <block>two</block>
    </block>
  </editor>
);

const path = [0, 0, 1];

export const test = (editor) =>
  Editor.above(editor, {
    at: path,
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
  });

export const output = [
  <block>
    <block>one</block>
  </block>,
  [0, 0],
];
