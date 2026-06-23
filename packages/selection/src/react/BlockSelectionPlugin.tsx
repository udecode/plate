import type { CSSProperties } from 'react';
import type React from 'react';

import { type Element, ElementApi } from '@platejs/slate';
import type {
  NodeEntry,
  OmitFirst,
  Path,
  PluginConfig,
  SlateEditor,
  TIdElement,
} from 'platejs';

import { bindFirst, KEYS, PathApi } from 'platejs';
import { createTPlatePlugin } from 'platejs/react';

import type { PartialSelectionOptions } from '../internal';

import { selectBlocks } from '../internal/transforms/selectBlocks';
import { BlockMenuPlugin } from './BlockMenuPlugin';
import { BlockSelectionAfterEditable } from './components/BlockSelectionAfterEditable';
import {
  addOnContextMenu,
  useBlockSelectable,
} from './hooks/useBlockSelectable';
import { moveSelection } from './internal/api/moveSelection';
import { addSelectedRow, setSelectedIds } from './internal/api/setSelectedIds';
import { shiftSelection } from './internal/api/shiftSelection';
import { duplicateBlockSelectionNodes } from './transforms/duplicateBlockSelectionNodes';
import { insertBlocksAndSelect } from './transforms/insertBlocksAndSelect';
import { removeBlockSelectionNodes } from './transforms/removeBlockSelectionNodes';
import { selectBlockSelectionNodes } from './transforms/selectBlockSelectionNodes';
import {
  setBlockSelectionIndent,
  setBlockSelectionNodes,
  setBlockSelectionTexts,
} from './transforms/setBlockSelectionNodes';

const isBlockSelectionElement = (node: unknown): node is TIdElement =>
  ElementApi.isElement(node) && typeof node.id === 'string';

function* toNodeEntryGenerator<N>(
  entries: NodeEntry<TIdElement>[]
): Generator<NodeEntry<N>, void, undefined> {
  yield* entries as NodeEntry<N>[];
}

export type BlockSelectionConfig = PluginConfig<
  'blockSelection',
  {
    anchorId?: string | null;
    areaOptions?: PartialSelectionOptions;
    editorPaddingRight?: CSSProperties['width'];
    enableContextMenu?: boolean;
    /**
     * Disable the plugin's custom selectAll (Cmd+A) behavior.
     * When true, uses the editor's default selectAll behavior.
     */
    disableSelectAll?: boolean;
    isSelecting?: boolean;
    isSelectionAreaVisible?: boolean;
    rightSelectionAreaClassName?: string;
    selectedIds?: Set<string>;
    shadowInputRef?: React.RefObject<HTMLInputElement | null>;
    /** Check if a block is selectable */
    isSelectable?: (element: Element, path: Path) => boolean;
    onKeyDownSelecting?: (editor: SlateEditor, e: KeyboardEvent) => void;
  },
  {
    blockSelection: {
      /** Add block selection when right click on a block. */
      addOnContextMenu: OmitFirst<typeof addOnContextMenu>;
      /** Set selected block ids */
      setSelectedIds: OmitFirst<typeof setSelectedIds>;
      /** Add a block to the selection. */
      add: (id: string[] | string) => void;
      /**
       * Select a block by id, with optional delay and clear options.
       *
       * @deprecated Use `add` or `set` instead.
       */
      addSelectedRow: (
        id: string,
        options?: { clear?: boolean; delay?: number }
      ) => void;
      /** Clear block selection */
      clear: () => void;
      /** Delete a block from the selection. */
      delete: (id: string[] | string) => void;
      /** Deselect all blocks */
      deselect: () => void;
      /** Get the first selected block */
      first: () => NodeEntry<TIdElement> | null;
      /** Focus block selection – that differs from the editor focus */
      focus: () => void;
      /**
       * Get selected blocks
       *
       * @param options.sort - Sort the nodes by path
       * @param options.collapseTableRows - If all table rows are selected,
       *   return the table node with all selected rows instead, do not return
       *   the table rows anymore.
       */
      getNodes: (options?: {
        collapseTableRows?: boolean;
        /**
         * If no nodes are selected by blockSelection, use the editor's original
         * selection to get blocks
         */
        selectionFallback?: boolean;
        sort?: boolean;
      }) => NodeEntry<TIdElement>[];
      /** Check if a block is selected. */
      has: (id: string[] | string) => boolean;
      /** Check if a block is selectable. */
      isSelectable: (element: Element, path: Path) => boolean;
      /** Arrow-based move selection */
      moveSelection: (direction: 'down' | 'up') => void;
      /** Reset selected block ids. @deprecated Use `clear` instead. */
      resetSelectedIds: () => void;
      /** Select all selectable blocks */
      selectAll: () => void;
      /** Set a block to be selected. */
      set: (id: string[] | string) => void;
      /** Shift-based expand/shrink selection */
      shiftSelection: (direction: 'down' | 'up') => void;
      /** Deselect all blocks. @deprecated Use `deselect` instead. */
      unselect: () => void;
    };
  },
  {},
  {
    /** Check if a block is selected by id */
    isSelected?: (id?: string) => boolean;
    /** Check if any blocks are selected */
    isSelectingSome?: () => boolean;
  },
  {
    blockSelection: {
      /** Duplicate selected blocks */
      duplicate: OmitFirst<typeof duplicateBlockSelectionNodes>;
      /** Insert blocks and select */
      insertBlocksAndSelect: OmitFirst<typeof insertBlocksAndSelect>;
      /** Remove selected blocks */
      removeNodes: OmitFirst<typeof removeBlockSelectionNodes>;
      /** Set selection based on block selection */
      select: OmitFirst<typeof selectBlockSelectionNodes>;
      /** Select blocks by id. */
      selectBlocks: OmitFirst<typeof selectBlocks>;
      /** Set block indent */
      setIndent: OmitFirst<typeof setBlockSelectionIndent>;
      /** Set nodes on selected blocks */
      setNodes: OmitFirst<typeof setBlockSelectionNodes>;
      /** Set texts on selected blocks */
      setTexts: OmitFirst<typeof setBlockSelectionTexts>;
    };
  }
>;

export const BlockSelectionPlugin = createTPlatePlugin<BlockSelectionConfig>({
  key: KEYS.blockSelection,
  editOnly: true,
  handlers: {
    onMouseDown: ({ api, editor, event, getOptions }) => {
      const target = event.target as HTMLElement;

      if (
        // deprecated
        target.dataset.platePreventUnselect ||
        target.dataset.platePreventDeselect
      )
        return;
      if (
        event.button === 0 &&
        getOptions().selectedIds!.size > 0 &&
        !editor.getOption(BlockMenuPlugin, 'openId')
      ) {
        api.blockSelection.deselect();
      }
    },
  },
  inject: {
    isBlock: true,
    nodeProps: {
      transformProps: () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useBlockSelectable().props;
      },
    },
  },
  options: {
    anchorId: null,
    areaOptions: {
      features: {
        singleTap: {
          allow: false,
        },
      },
    },
    enableContextMenu: false,
    disableSelectAll: false,
    isSelecting: false,
    isSelectionAreaVisible: false,
    selectedIds: new Set(),
    shadowInputRef: { current: null },
    isSelectable: () => true,
  },
  plugins: [BlockMenuPlugin],
  render: {
    afterEditable: BlockSelectionAfterEditable,
  },
})
  .extendSelectors<BlockSelectionConfig['selectors']>(({ getOptions }) => ({
    isSelected: (id) => !!id && getOptions().selectedIds!.has(id),
    isSelectingSome: () => getOptions().selectedIds!.size > 0,
  }))
  .extendApi<Partial<BlockSelectionConfig['api']['blockSelection']>>(
    ({ editor, getOption, getOptions, setOption }) => ({
      addOnContextMenu: bindFirst(addOnContextMenu, editor),
      moveSelection: bindFirst(moveSelection, editor),
      setSelectedIds: bindFirst(setSelectedIds, editor),
      shiftSelection: bindFirst(shiftSelection, editor),
      add: (id) => {
        const next = new Set(getOptions().selectedIds!);

        if (Array.isArray(id)) {
          for (const singleId of id) {
            next.add(singleId);
          }
        } else {
          next.add(id);
        }

        setOption('selectedIds', next);
      },
      clear: () => {
        setOption('selectedIds', new Set());
      },
      delete: (id) => {
        const next = new Set(getOptions().selectedIds!);

        if (Array.isArray(id)) {
          for (const i of id) {
            next.delete(i);
          }
        } else {
          next.delete(id);
        }

        setOption('selectedIds', next);
      },
      deselect: () => {
        setOption('selectedIds', new Set());
        setOption('isSelecting', false);
      },
      first: () => {
        const selectedIds = getOption('selectedIds');

        if (!selectedIds || selectedIds.size === 0) return null;

        return editor.api.node({
          at: [],
          match: (n) => selectedIds.has(n.id as string),
        })!;
      },
      focus: () => {
        const shadowInputRef = getOption('shadowInputRef');

        if (shadowInputRef?.current) {
          shadowInputRef.current.focus({ preventScroll: true });
        }
      },
      getNodes: (options) => {
        const selectedIds = getOption('selectedIds');

        const nodes = editor.api.blocks<TIdElement>({
          at: [],
          match: (n) => !!n.id && selectedIds?.has(n.id as string),
        });

        if (options?.sort) {
          nodes.sort(([, pathA], [, pathB]) => PathApi.compare(pathA, pathB));
        }

        if (options?.collapseTableRows) {
          const collapsedNodes: NodeEntry<TIdElement>[] = [];

          nodes.forEach(([node, path]) => {
            if (node.type === KEYS.tr) {
              const tablePath = PathApi.parent(path);
              const tableNodeEntry = editor.api.node<TIdElement>(tablePath)!;

              // Check if table already exists in collapsedNodes
              const existingTableIndex = collapsedNodes.findIndex(
                ([existingNode]) =>
                  existingNode.type === tableNodeEntry[0].type &&
                  existingNode.id === tableNodeEntry[0].id
              );

              if (existingTableIndex === -1) {
                // Create new table with this row
                const tableNodeCopy = {
                  ...tableNodeEntry[0],
                  children: [node],
                };

                collapsedNodes.push([tableNodeCopy, tableNodeEntry[1]]);
              } else {
                // Add the row to existing table
                const existingTable = collapsedNodes[existingTableIndex][0];
                existingTable.children.push(node);
              }
              return;
            }

            collapsedNodes.push([node, path]);
          });

          return collapsedNodes;
        }

        if (nodes.length === 0 && options?.selectionFallback) {
          return editor.api.blocks({ mode: 'highest' });
        }

        return nodes;
      },
      has: (id) => {
        if (Array.isArray(id)) {
          return id.every((i) => getOptions().selectedIds!.has(i));
        }

        return getOptions().selectedIds!.has(id);
      },
      isSelectable: (element, path) =>
        !!element.id &&
        editor.api.isBlock(element) &&
        getOptions().isSelectable!(element, path),
      resetSelectedIds: () => {
        setOption('selectedIds', new Set());
      },
      set: (id) => {
        setOption('selectedIds', new Set(Array.isArray(id) ? id : [id]));
      },
      unselect: () => {
        setOption('selectedIds', new Set());
        setOption('isSelecting', false);
      },
    })
  )
  .extendApi<Partial<BlockSelectionConfig['api']['blockSelection']>>(
    ({ api, editor, setOption }) => ({
      addSelectedRow: bindFirst(addSelectedRow, editor),
      selectAll: () => {
        const ids = api
          .blocks<TIdElement>({
            at: [],
            mode: 'highest',
            match: (n, p) =>
              isBlockSelectionElement(n) &&
              api.blockSelection.isSelectable(n, p),
          })
          .map((n) => n[0].id as string);

        setOption('selectedIds', new Set(ids));
        api.blockSelection.focus();
      },
    })
  )
  .extendTxGroup('blockSelection', ({ editor }) => () => ({
    /** Duplicate selected blocks */
    duplicate: bindFirst(duplicateBlockSelectionNodes, editor),
    /** Insert blocks and select */
    insertBlocksAndSelect: bindFirst(insertBlocksAndSelect, editor),
    /** Remove selected blocks */
    removeNodes: bindFirst(removeBlockSelectionNodes, editor),
    /** Set selection based on block selection */
    select: bindFirst(selectBlockSelectionNodes, editor),
    /**
     * Selects blocks in the editor based on the provided block ID.
     *
     * Uses block selection if any blocks are selected, otherwise falls back to
     * editor selection. If the provided block ID is already in the current
     * selection, maintains the existing selection. Otherwise, clears the
     * current selection and selects only the specified block.
     */
    selectBlocks: bindFirst(selectBlocks, editor),
    /** Set block indent */
    setIndent: bindFirst(setBlockSelectionIndent, editor),
    /** Set nodes on selected blocks */
    setNodes: bindFirst(setBlockSelectionNodes, editor),
    /** Set texts on selected blocks */
    setTexts: bindFirst(setBlockSelectionTexts, editor),
  }))
  .overrideEditor((ctx) => {
    const {
      api,
      api: { nodes },
      getOption,
    } = ctx;

    return {
      api: {
        // turn-into-dropdown-menu
        nodes(options) {
          if (!options?.at && getOption('isSelectingSome')) {
            return toNodeEntryGenerator(api.blockSelection.getNodes());
          }

          return nodes(options);
        },
      },
    };
  });
