import type {
  ContentSlice,
  EditorSliceReadOptions,
  NodeKey,
} from '../interfaces/editor';
import type { Node, NodeEntry } from '../interfaces/node';
import type { NodeSelection } from '../interfaces/selection';
import { defineRead } from './read-definition';
import type { SliceLanding, SliceLandingInput } from './slice-landing-types';
import type {
  TransferAdoptInput,
  TransferEdge,
  TransferLandingInput,
  TransferPatch,
  TransferSideInput,
  TransferSourceInput,
  TransferWrap,
} from './transfer-types';

export const editorReads = Object.freeze({
  nodes: Object.freeze({
    isSelectable: defineRead<
      Readonly<{ element: Node; nodeKey: NodeKey | null }>,
      boolean
    >('nodes.is-selectable'),
    shouldMergeNodesRemovePrevNode: defineRead<
      Readonly<{
        current: NodeEntry;
        previous: NodeEntry;
      }>,
      boolean
    >('nodes.should-merge-nodes-remove-prev-node'),
  }),
  transfer: Object.freeze({
    /** Expand a transfer's selected blocks, such as a list item's family. */
    source: defineRead<TransferSourceInput, NodeSelection>('transfer.source'),
    /**
     * Redirect one landing edge, such as past a list item's family; the default
     * keeps the edge. A redirected edge must map to itself. The schema admits
     * the final edge and vetoes refuse it.
     */
    landing: defineRead<TransferLandingInput, TransferEdge>('transfer.landing'),
    /**
     * Properties a block copy takes from where it lands, such as its list; the
     * default, `[]`, keeps the copy as it is. It runs on the final edge, while
     * hovering too, after the landing read and before the schema and vetoes
     * judge the patched copy. A patch may name only properties declared
     * `landing: 'adopt'`, or the transfer refuses with `policy`.
     */
    adopt: defineRead<TransferAdoptInput, readonly TransferPatch[]>(
      'transfer.adopt'
    ),
    /**
     * What a drop at a block's side builds, such as a column group; the
     * default, `null`, refuses. The schema must still admit the wrap, and
     * vetoes can still refuse it.
     */
    side: defineRead<TransferSideInput, TransferWrap | null>('transfer.side'),
  }),
  slice: Object.freeze({
    /**
     * Shape what a paste lands after command handlers delegate, from the target
     * the editor resolved; the default lands `slice` unchanged. Reads the
     * current command draft; raw transaction replacement and fitting bypass it.
     */
    landing: defineRead<SliceLandingInput, SliceLanding>('slice.landing'),
    export: defineRead<
      Readonly<{
        options: EditorSliceReadOptions;
        slice: ContentSlice;
        source: 'assembled' | 'selection';
      }>,
      ContentSlice
    >('slice.export'),
    get: defineRead<
      Readonly<{ options: EditorSliceReadOptions; slice: ContentSlice }>,
      ContentSlice
    >('slice.get'),
  }),
});
