import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);

export const test = (editor) =>
  Editor.above(editor, {
    at: [0, 1, 0],
    match: (n) => ElementApi.isElement(n) && Editor.isInline(editor, n),
  });

export const output = [<inline>two</inline>, [0, 1]];
