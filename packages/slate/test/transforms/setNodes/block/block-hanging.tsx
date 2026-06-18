import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/slate';

export const run = (editor) => {
  editor.nodes.set(
    { someKey: true },
    { match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n) }
  );
};
export const input = (
  <editor>
    <block>
      <anchor />
      word
    </block>
    <block>
      <focus />
      another
    </block>
  </editor>
);
export const output = (
  <editor>
    <block someKey>
      <anchor />
      word
    </block>
    <block>
      <focus />
      another
    </block>
  </editor>
);
