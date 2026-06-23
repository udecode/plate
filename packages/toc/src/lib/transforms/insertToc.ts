import type { Element, NodeInsertNodesOptions } from '@platejs/slate';

import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

export type InsertTocOptions = NonNullable<NodeInsertNodesOptions<Element>>;

export const insertToc = (editor: SlateEditor, options?: InsertTocOptions) => {
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
