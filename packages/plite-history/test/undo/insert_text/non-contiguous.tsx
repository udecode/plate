/** @jsx jsx */

import { jsx } from '../..';

jsx;

export const run = (editor) => {
  editor.update(() => {
    editor.insertText('t');
  });
  editor.update(() => {
    editor.move({ reverse: true });
  });
  editor.update(() => {
    editor.insertText('w');
  });
  editor.update(() => {
    editor.move({ reverse: true });
  });
  editor.update(() => {
    editor.insertText('o');
  });
};
export const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <cursor />
      wt
    </block>
  </editor>
);
