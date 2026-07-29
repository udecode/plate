import type { ContentSlice } from '../interfaces/editor';
import type { Node, NodeEntry } from '../interfaces/node';
import { defineRead } from './read-definition';

export const editorReads = Object.freeze({
  nodes: Object.freeze({
    isSelectable: defineRead<Readonly<{ element: Node }>, boolean>(
      'plite:nodes.is-selectable'
    ),
    shouldMergeNodesRemovePrevNode: defineRead<
      Readonly<{
        current: NodeEntry;
        previous: NodeEntry;
      }>,
      boolean
    >('plite:nodes.should-merge-nodes-remove-prev-node'),
  }),
  slice: Object.freeze({
    export: defineRead<Readonly<{ slice: ContentSlice }>, ContentSlice>(
      'plite:slice.export'
    ),
  }),
});
