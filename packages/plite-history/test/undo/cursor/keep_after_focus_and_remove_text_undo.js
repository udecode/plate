/** @jsx jsx */

import { deleteFragment as editorDeleteFragment } from '@platejs/plite/internal';
import { jsx } from '../..';

void jsx;

export const run = (editor) => {
  // focus at the end
  editor.update(() => {
    editor.select({
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
  });
  // select all
  editor.update(() => {
    editor.select({
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 0 },
    });
  });
  // remove
  editor.update(() => {
    editorDeleteFragment(editor);
  });
  // blur
  editor.update(() => {
    editor.deselect();
  });
  // focus back
  editor.update(() => {
    editor.select({
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });
};

export const input = (
  <editor>
    <block>Hello</block>
  </editor>
);

export const output = {
  children: [
    {
      children: [
        {
          text: 'Hello',
        },
      ],
      type: 'fixture-block',
    },
  ],
  selection: {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 0 },
  },
};
