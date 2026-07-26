import type { CSSProperties } from 'react';
import type React from 'react';

import type {
  Element,
  EditorStateView,
  NodeEntry,
  NodeProps,
  NodeSetNodesOptions,
  Path,
  Text,
} from '@platejs/plite';
import type { BaseEditor, PluginConfig } from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';
import type { TIdElement } from '@platejs/utils';

import { ElementApi, PathApi, editorCommands } from '@platejs/plite';
import { createPlatePlugin, type InferConfig } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import type { PartialSelectionOptions } from '../internal';

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

const BLOCK_SELECTION_PRESERVE_TAG = 'block-selection-preserve';
const BLOCK_SELECTION_DESELECT_TAG = 'block-selection-deselect';

const isBlockMenuOpen = (editor: BaseEditor) =>
  Boolean(
    getPlateRuntime(editor).plugins[KEYS.blockMenu] &&
      editor.plugin(BlockMenuPlugin).getOption('openId')
  );

type BlockSelectionApi = {
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
   * @param options.collapseTableRows - If all table rows are selected, return
   *   the table node with all selected rows instead.
   */
  getNodes: (options?: {
    collapseTableRows?: boolean;
    /** Use the editor selection when block selection is empty. */
    selectionFallback?: boolean;
    sort?: boolean;
  }) => readonly NodeEntry<TIdElement>[];
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

type BlockSelectionTx = {
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
};

export type BlockSelectionConfig = PluginConfig<
  'blockSelection',
  {
    anchorId?: string | null;
    areaOptions?: PartialSelectionOptions;
    editorPaddingRight?: CSSProperties['width'];
    enableContextMenu?: boolean;
    /** Disable the plugin's custom select-all behavior. */
    disableSelectAll?: boolean;
    isSelecting?: boolean;
    isSelectionAreaVisible?: boolean;
    rightSelectionAreaClassName?: string;
    selectedIds?: Set<string>;
    shadowInputRef?: React.RefObject<HTMLInputElement | null>;
    /** Check if a block is selectable. */
    isSelectable?: (element: Element, path: Path) => boolean;
    onKeyDownSelecting?: (editor: BaseEditor, event: KeyboardEvent) => void;
  },
  {},
  BlockSelectionTx,
  {
    /** Check if a block is selected by id. */
    isSelected?: (id?: string) => boolean;
    /** Check if any blocks are selected. */
    isSelectingSome?: () => boolean;
  },
  {},
  readonly [],
  never,
  BlockSelectionApi
>;

export const BlockSelectionPlugin = createPlatePlugin<BlockSelectionConfig>({
  key: KEYS.blockSelection,
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

  editOnly: true,
  inject: {
    isBlock: true,
    nodeProps: {
      transformProps: ({ element, path }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useBlockSelectable({ element, path }).props;
      },
    },
  },
  render: {
    afterEditable: BlockSelectionAfterEditable,
  },
}).extend<{
  api: BlockSelectionConfig['pluginApi'];
  selectors: BlockSelectionConfig['selectors'];
  update: BlockSelectionConfig['tx']['blockSelection'];
}>((context) => {
  const { api, editor, getOption, getOptions, setOption } = context;
  const getSelectedEntries = (state: Pick<EditorStateView, 'nodes'>) => {
    const selectedIds = getOptions().selectedIds;

    if (!selectedIds?.size) return [];

    return state.nodes.toArray<TIdElement>({
      at: [],
      match: (node) =>
        ElementApi.isElement(node) &&
        typeof node.id === 'string' &&
        selectedIds.has(node.id),
    });
  };

  return {
    handlers: {
      onMouseDown: ({ api, editor, event, getOptions }) => {
        const target = event.target as HTMLElement;

        if (target.dataset.platePreventDeselect) return;
        if (
          event.button === 0 &&
          getOptions().selectedIds!.size > 0 &&
          !isBlockMenuOpen(editor)
        ) {
          api.deselect();
        }
      },
    },
    selectors: {
      isSelected: (id?: string) => !!id && getOptions().selectedIds!.has(id),
      isSelectingSome: () => getOptions().selectedIds!.size > 0,
    },
    api: {
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

        const nodes = [
          ...editor.read.nodes.toArray<TIdElement>({
            at: [],
            match: (node) =>
              ElementApi.isElement(node) &&
              !!node.id &&
              !!selectedIds?.has(node.id as string),
          }),
        ];

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
                const [existingTable, existingPath] =
                  collapsedNodes[existingTableIndex];

                collapsedNodes[existingTableIndex] = [
                  {
                    ...existingTable,
                    children: [...existingTable.children, node],
                  },
                  existingPath,
                ];
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
    },
    extension: {
      commands: ({ around }) => [
        around(editorCommands.addMark, ({ state, next }) => {
          if (!getOptions().selectedIds?.size) return next();

          const range = state.ranges.fromEntries(getSelectedEntries(state));

          if (!range) return next();

          return next.after(
            state.transaction((tx) => {
              tx.tags.add(BLOCK_SELECTION_PRESERVE_TAG);
              tx.selection.set(range);
            })
          );
        }),
        around(editorCommands.toggleMark, ({ state, next }) => {
          if (!getOptions().selectedIds?.size) return next();

          const range = state.ranges.fromEntries(getSelectedEntries(state));

          if (!range) return next();

          return next.after(
            state.transaction((tx) => {
              tx.tags.add(BLOCK_SELECTION_PRESERVE_TAG);
              tx.selection.set(range);
            })
          );
        }),
        around(editorCommands.setNodes, ({ state, next }) => {
          if (!getOptions().selectedIds?.size) return next();

          const range = state.ranges.fromEntries(getSelectedEntries(state));

          if (!range) return next();

          return next.after(
            state.transaction((tx) => {
              tx.tags.add(BLOCK_SELECTION_PRESERVE_TAG);
              tx.selection.set(range);
            })
          );
        }),
        around(editorCommands.select, ({ state, next }) => {
          if (!getOptions().selectedIds?.size || isBlockMenuOpen(editor)) {
            return next();
          }

          return next.after(
            state.transaction((tx) => {
              tx.tags.add(BLOCK_SELECTION_DESELECT_TAG);
            })
          );
        }),
        around(editorCommands.setSelection, ({ state, next }) => {
          if (!getOptions().selectedIds?.size || isBlockMenuOpen(editor)) {
            return next();
          }

          return next.after(
            state.transaction((tx) => {
              tx.tags.add(BLOCK_SELECTION_DESELECT_TAG);
            })
          );
        }),
      ],
      onCommit({ commit }) {
        if (
          (commit.tags.includes(BLOCK_SELECTION_DESELECT_TAG) ||
            (commit.selectionChanged &&
              !commit.tags.includes(BLOCK_SELECTION_PRESERVE_TAG))) &&
          getOptions().selectedIds!.size > 0 &&
          !isBlockMenuOpen(editor)
        ) {
          context.api.deselect();
        }
      },
    },
    shortcuts: {
      selectAll: {
        keys: 'mod+a',
        priority: 0,
        handler: () => {
          if (getOptions().disableSelectAll) return false;

          const selection = editor.read.selection();
          const block = editor.read.nodes.block({ mode: 'highest' });

          if (!selection || !block) return false;

          if (
            !editor.read.selection.isWithinBlock() ||
            (editor.read.selection.isAtBlockStart() &&
              editor.read.selection.isAtBlockEnd())
          ) {
            editor.plugin(BlockSelectionPlugin).api.selectAll();
            return true;
          }

          editor.update.selection.set(block[1]);
          return true;
        },
      },
    },
    update: ({ context: updateContext, tx }) => ({
      duplicate: () => duplicateBlockSelectionNodes(editor, tx, updateContext),
      insertBlocksAndSelect: (nodes, { at, insertedCallback }) => {
        insertBlocksAndSelect(editor, tx, updateContext, nodes, {
          at,
          insertedCallback,
        });
      },
      removeNodes: () => removeBlockSelectionNodes(editor, tx),
      select: () => selectBlockSelectionNodes(editor, tx, updateContext),
      setIndent: (indent, options) =>
        setBlockSelectionIndent(editor, tx, indent, options),
      setNodes: (props, options) =>
        setBlockSelectionNodes(editor, tx, props, options),
      setTexts: (props, options) =>
        setBlockSelectionTexts(editor, tx, props, options),
    }),
  };
});

export type BlockSelectionPluginConfig = InferConfig<
  typeof BlockSelectionPlugin
>;
