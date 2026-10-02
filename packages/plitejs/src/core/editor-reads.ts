import type {
  ContentSlice,
  EditorSliceReadOptions,
  NodeKey,
} from '../interfaces/editor';
import type { Node, NodeEntry } from '../interfaces/node';
import type { NodeSelection } from '../interfaces/selection';
import { defineRead } from './read-definition';
import type {
  TransferEdge,
  TransferLandingInput,
  TransferSourceInput,
} from './transfer-types';

export const editorReads = Object.freeze({
  nodes: Object.freeze({
    isSelectable: defineRead<
      Readonly<{ element: Node; nodeKey: NodeKey | null }>,
      boolean
    >('plite:nodes.is-selectable'),
    shouldMergeNodesRemovePrevNode: defineRead<
      Readonly<{
        current: NodeEntry;
        previous: NodeEntry;
      }>,
      boolean
    >('plite:nodes.should-merge-nodes-remove-prev-node'),
  }),
  transfer: Object.freeze({
    /** Expand a transfer's selected blocks, such as a list item's family. */
    source: defineRead<TransferSourceInput, NodeSelection>(
      'plite:transfer.source'
    ),
    /**
     * Redirect one landing edge, such as past a list item's family; the default
     * keeps the edge. A redirected edge must map to itself. The schema admits
     * the final edge and vetoes refuse it.
     */
    landing: defineRead<TransferLandingInput, TransferEdge>(
      'plite:transfer.landing'
    ),
  }),
  slice: Object.freeze({
    export: defineRead<
      Readonly<{
        options: EditorSliceReadOptions;
        slice: ContentSlice;
        source: 'assembled' | 'selection';
      }>,
      ContentSlice
    >('plite:slice.export'),
    get: defineRead<
      Readonly<{ options: EditorSliceReadOptions; slice: ContentSlice }>,
      ContentSlice
    >('plite:slice.get'),
  }),
});
