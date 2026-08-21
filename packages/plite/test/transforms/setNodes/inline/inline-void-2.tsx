import { ElementApi } from '@platejs/plite';
/** @jsx jsx */
import { isInline as editorIsInline } from '@platejs/plite/internal';

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.set(
    { someKey: true },
    { match: (n) => ElementApi.isElement(n) && editorIsInline(editor, n) }
  );
};
export const input = (
  <editor>
    <block>
      <text>word</text>
      <inline alreadyHasAKey void>
        <text />
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text>word</text>
      <inline alreadyHasAKey someKey void>
        <text />
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
