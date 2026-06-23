import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.set(
    { someKey: true },
    { match: (n) => ElementApi.isElement(n) && Editor.isInline(editor, n) }
  );
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        <anchor />
        word
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline>
        another
        <focus />
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline someKey>
        <anchor />
        word
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline someKey>
        another
        <focus />
      </inline>
      <text />
    </block>
  </editor>
);
