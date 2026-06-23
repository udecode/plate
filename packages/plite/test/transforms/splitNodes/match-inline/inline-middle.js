import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.split({
    match: (n) => ElementApi.isElement(n) && Editor.isInline(editor, n),
  });
};

export const input = (
  <editor>
    <block>
      <text />
      <inline>
        wo
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
);

export const output = (
  <editor>
    <block>
      <text />
      <inline>wo</inline>
      <text />
      <inline>
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
);
