import type { CSSProperties } from 'react';
import type React from 'react';

import type {
  Element,
  EditorUpdateTransaction,
  NodeEntry,
  NodeProps,
  NodeSetNodesOptions,
  Path,
  Text,
} from '@platejs/plite';
import type { BaseEditor, PluginConfig } from '@platejs/core';
import type { TIdElement } from '@platejs/utils';

import { ElementApi, PathApi } from '@platejs/plite';
import { createPlatePlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import type { PartialSelectionOptions } from '../internal';

import { selectBlocks } from '../internal/transforms/selectBlocks';
import { BlockMenuPlugin } from './BlockMenuPlugin';
import { BlockSelectionAfterEditable } from './components/BlockSelectionAfterEditable';
import { useBlockSelectable } from './hooks/useBlockSelectable';
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
    onKeyDownSelecting?: (editor: BaseEditor, e: KeyboardEvent) => void;
  },
  {
    blockSelection: {
      /** Add block selection when right click on a block. */
      addOnContextMenu: (options: {
        element: Element;
        event: React.MouseEvent<HTMLDivElement, MouseEvent>;
        disabledWhenFocused?: boolean;
      }) => void;
      /** Add a selected table row by selectable id. */
      addSelectedRow: (
        id: string,
        options?: { clear?: boolean; delay?: number }
      ) => void;
      /** Set selected block ids */
      setSelectedIds: (
        options: Partial<{
          added: globalThis.Element[];
          removed: globalThis.Element[];
        }> & {
          ids?: string[];
        }
      ) => void;
      /** Add a block to the selection. */
      add: (id: string[] | string) => void;
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
      /** Select all selectable blocks */
      selectAll: () => void;
      /** Set a block to be selected. */
      set: (id: string[] | string) => void;
      /** Shift-based expand/shrink selection */
      shiftSelection: (direction: 'down' | 'up') => void;
    };
  },
  {
    blockSelection: {
      /** Duplicate selected blocks. */
      duplicate: () => void;
      /** Insert blocks and select the inserted range. */
      insertBlocksAndSelect: (
        nodes: Element[],
        options: { at: Path; insertedCallback?: () => void }
      ) => void;
      /** Remove selected blocks. */
      removeNodes: () => void;
      /** Set editor selection from block selection. */
      select: () => void;
      /** Select blocks by path or node. */
      selectBlocks: (at: Path | TIdElement) => void;
      /** Set block indent on selected blocks. */
      setIndent: (indent: number, options?: NodeSetNodesOptions) => void;
      /** Set props on selected blocks. */
      setNodes: (
        props: Partial<NodeProps<Element>>,
        options?: NodeSetNodesOptions
      ) => void;
      /** Set props on selected text nodes. */
      setTexts: (
        props: Partial<NodeProps<Text>>,
        options?: Omit<NodeSetNodesOptions, 'at'>
      ) => void;
    };
  },
  {
    /** Check if a block is selected by id */
    isSelected?: (id?: string) => boolean;
    /** Check if any blocks are selected */
    isSelectingSome?: () => boolean;
  }
>;

export const BlockSelectionPlugin = createPlatePlugin<BlockSelectionConfig>({
  key: KEYS.blockSelection,
  editOnly: true,
  handlers: {
    onMouseDown: ({ api, editor, event, getOptions }) => {
      const target = event.target as HTMLElement;

      if (target.dataset.platePreventDeselect) return;
      if (
        event.button === 0 &&
        getOptions().selectedIds!.size > 0 &&
        !editor.plugin(BlockMenuPlugin).getOption('openId')
      ) {
        api.deselect();
      }
    },
  },
  inject: {
    isBlock: true,
    nodeProps: {
      transformProps: ({ element, path }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useBlockSelectable({ element, path }).props;
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
    isSelected: (id?: string) => !!id && getOptions().selectedIds!.has(id),
    isSelectingSome: () => getOptions().selectedIds!.size > 0,
  }))
  .extendApi<Partial<BlockSelectionConfig['api']['blockSelection']>>(
    ({ api, editor, getOption, getOptions, setOption }) => ({
      addOnContextMenu: ({ disabledWhenFocused = true, element, event }) => {
        const { enableContextMenu, selectedIds } = getOptions();

        if (!enableContextMenu) return;

        if (editor.read.selection()?.focus && disabledWhenFocused) {
          const nodeEntry = editor.read.nodes.above<Element>();
          const elementPath = editor.read.nodes.path(element);

          if (
            nodeEntry &&
            elementPath &&
            PathApi.isCommon(elementPath, nodeEntry[1])
          ) {
            const id = nodeEntry[0].id as string | undefined;
            const isSelected = getOption('isSelected', id);
            const isOpenAlways =
              (event.target as HTMLElement).dataset?.plateOpenContextMenu ===
              'true';

            if (
              !isSelected &&
              !editor.read.schema.isVoid(nodeEntry[0]) &&
              !isOpenAlways
            ) {
              return event.stopPropagation();
            }
          }
        }

        const id = element.id as string | undefined;

        if (!id) return;

        if (event?.shiftKey) {
          api.add(id);
          return;
        }

        const clickAlreadySelected = selectedIds?.has(id);

        if (!clickAlreadySelected) {
          setOption('selectedIds', new Set([id]));
        }
      },
      moveSelection: (direction) => moveSelection(editor, direction),
      addSelectedRow: (id, options) => addSelectedRow(editor, id, options),
      setSelectedIds: (options) => setSelectedIds(editor, options),
      shiftSelection: (direction) => shiftSelection(editor, direction),
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

        return editor.read.nodes.find<TIdElement>({
          at: [],
          match: (node) =>
            ElementApi.isElement(node) &&
            !!node.id &&
            selectedIds.has(node.id as string),
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

        const nodes = editor.read.nodes.toArray<TIdElement>({
          at: [],
          match: (node) =>
            ElementApi.isElement(node) &&
            !!node.id &&
            !!selectedIds?.has(node.id as string),
        });

        if (options?.sort) {
          nodes.sort(([, pathA], [, pathB]) => PathApi.compare(pathA, pathB));
        }

        if (options?.collapseTableRows) {
          const collapsedNodes: NodeEntry<TIdElement>[] = [];

          nodes.forEach(([node, path]) => {
            if (node.type === KEYS.tr) {
              const tablePath = PathApi.parent(path);
              const tableNodeEntry =
                editor.read.nodes.get<TIdElement>(tablePath)!;

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
          return editor.read.nodes.toArray({ mode: 'highest' });
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
        editor.read.schema.isBlock(element) &&
        getOptions().isSelectable!(element, path),
      set: (id) => {
        setOption('selectedIds', new Set(Array.isArray(id) ? id : [id]));
      },
    })
  )
  .extendApi<Partial<BlockSelectionConfig['api']['blockSelection']>>(
    ({ api, editor, setOption }) => ({
      selectAll: () => {
        const ids = editor.read.nodes
          .toArray({
            at: [],
            mode: 'highest',
            match: (n, p) =>
              ElementApi.isElement(n) && !!n.id && api.isSelectable(n, p),
          })
          .map((n) => n[0].id as string);

        setOption('selectedIds', new Set(ids));
        api.focus();
      },
    })
  )
  .extendExtension(({ api, editor, getOptions }) => {
    let applyingBlockSelectionTransform = false;
    const withBlockSelection = (
      tx: EditorUpdateTransaction,
      next: () => boolean
    ) => {
      const blocks = api.getNodes();

      if (blocks.length === 0) return next();

      const range = editor.read.ranges.fromEntries(blocks);

      if (!range) return next();

      applyingBlockSelectionTransform = true;

      try {
        tx.selection.set(range);
        const result = next();

        api.set(blocks.map(([node]) => node.id as string));

        return result;
      } finally {
        applyingBlockSelectionTransform = false;
      }
    };

    return {
      transforms: {
        addMark({ next, tx }) {
          if (!getOptions().selectedIds?.size) return next();

          return withBlockSelection(tx, next);
        },
        setNodes({ next, tx }) {
          if (!getOptions().selectedIds?.size) return next();

          return withBlockSelection(tx, next);
        },
        select({ next }) {
          if (
            !applyingBlockSelectionTransform &&
            getOptions().selectedIds!.size > 0 &&
            !editor.plugin(BlockMenuPlugin).getOption('openId')
          ) {
            api.deselect();
          }

          return next();
        },
        setSelection({ next }) {
          if (
            !applyingBlockSelectionTransform &&
            getOptions().selectedIds!.size > 0 &&
            !editor.plugin(BlockMenuPlugin).getOption('openId')
          ) {
            api.deselect();
          }

          return next();
        },
        toggleMark({ next, tx }) {
          if (!getOptions().selectedIds?.size) return next();

          return withBlockSelection(tx, next);
        },
      },
    };
  })
  .extendTx(({ editor }) => (tx) => ({
    duplicate: () => duplicateBlockSelectionNodes(editor, tx),
    insertBlocksAndSelect: (nodes, { at, insertedCallback }) => {
      insertBlocksAndSelect(editor, tx, nodes, {
        at,
        insertedCallback,
      });
    },
    removeNodes: () => removeBlockSelectionNodes(editor, tx),
    select: () => selectBlockSelectionNodes(editor, tx),
    selectBlocks: (at) => selectBlocks(editor, at),
    setIndent: (indent, options) =>
      setBlockSelectionIndent(editor, tx, indent, options),
    setNodes: (props, options) =>
      setBlockSelectionNodes(editor, tx, props, options),
    setTexts: (props, options) =>
      setBlockSelectionTexts(editor, tx, props, options),
  }));
