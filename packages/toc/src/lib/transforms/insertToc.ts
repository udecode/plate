import type { Element, NodeInsertNodesOptions } from '@platejs/plite';

import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

export type InsertTocOptions = NonNullable<NodeInsertNodesOptions<Element>>;

export const insertToc = (
  editor: BasePlateEditor,
  options?: InsertTocOptions
) => {
  editor.update((tx) => {
    tx.nodes.insert<Element>(
      {
        children: [{ text: '' }],
        type: editor.getType(KEYS.toc),
      },
      options
    );
  });
};
