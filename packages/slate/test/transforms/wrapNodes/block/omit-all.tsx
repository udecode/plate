/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { NodeApi } from '@platejs/slate';

export const run = (editor) => {
  editor.nodes.wrap(<block a />, {
    match: (node, currentPath) => {
      // reject all nodes inside blocks tagged `noneditable`. Which is everything.
      if (node.noneditable) return false;
      for (const [node, _] of NodeApi.ancestors(editor, currentPath)) {
        if (node.noneditable) return false;
      }
      return true;
    },
  });
};
export const input = (
  <editor>
    <block noneditable>
      <cursor />
      word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block noneditable>
      <cursor />
      word
    </block>
  </editor>
);
