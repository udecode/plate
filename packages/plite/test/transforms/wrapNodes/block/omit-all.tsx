/** @jsx jsx */

import { NodeApi } from '@platejs/plite';

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.wrap(<block a />, {
    match: (node, currentPath) => {
      // reject all nodes inside blocks tagged `noneditable`. Which is everything.
      if (node.noneditable) return false;
      for (const [innerNode, _] of NodeApi.ancestors(editor, currentPath)) {
        if (innerNode.noneditable) return false;
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
