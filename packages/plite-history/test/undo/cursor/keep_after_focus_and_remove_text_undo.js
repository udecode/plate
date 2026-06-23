/** @jsx jsx */

import { Editor } from '@platejs/plite/internal';
import { jsx } from '../..';

jsx;

export const run = (editor) => {
  // focus at the end
  editor.update(() => {
    editor.select({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
  });
  // select all
  editor.update(() => {
    editor.select({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 0 },
    });
  });
  // remove
  editor.update(() => {
    Editor.deleteFragment(editor);
  });
  // blur
  editor.update(() => {
    editor.deselect();
  });
  // focus back
  editor.update(() => {
    editor.select({
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
    },
  ],
  selection: {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 0 },
  },
};
