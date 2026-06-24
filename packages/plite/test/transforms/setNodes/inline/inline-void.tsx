import { isInline as editorIsInline } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.set(
    { someKey: true },
    { match: (n) => ElementApi.isElement(n) && editorIsInline(editor, n) }
  );
};
export const input = (
  <editor>
    <block>
      <text />
      <inline void>
        <cursor />
        word
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline someKey void>
        <cursor />
        word
      </inline>
      <text />
    </block>
  </editor>
);
