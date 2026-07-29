import type React from 'react';
import type { CSSProperties } from 'react';

import type {
  Element,
  NodeProps,
  NodeSetNodesOptions,
  Path,
  Text,
} from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type { TIdElement } from '@platejs/utils';

import {
  ContentSlice,
  ElementApi,
  PathApi,
  TextApi,
  editorCommands,
} from '@platejs/plite';
import {
  getDOMClipboardFormatKey,
  writeDOMFragmentData,
  writeDOMRangeData,
} from '@platejs/plite-dom';
import { createPlatePlugin, type InferConfig } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';
import copyToClipboard from 'copy-to-clipboard';

import type { PartialSelectionAreaOptions } from '../SelectionArea';
import { BlockSelectionAfterEditable } from './BlockSelection';
import { BlockMenuPlugin } from './BlockMenuPlugin';

const BLOCK_SELECTION_PRESERVE_TAG = 'block-selection-preserve';
const BLOCK_SELECTION_DESELECT_TAG = 'block-selection-deselect';

type AddOnContextMenuOptions = {
  element: Element;
  event: React.MouseEvent<HTMLDivElement, MouseEvent>;
  disabledWhenFocused?: boolean;
};

type AddSelectedRowOptions = {
  clear?: boolean;
  delay?: number;
};

type SetSelectedIdsOptions = Partial<{
  added: globalThis.Element[];
  removed: globalThis.Element[];
}> & {
  ids?: string[];
};

type BlockSelectionDirection = 'down' | 'up';

type GetBlockSelectionNodesOptions = {
  collapseTableRows?: boolean;
  selectionFallback?: boolean;
  sort?: boolean;
};

type InsertBlocksAndSelectOptions = {
  at: Path;
  insertedCallback?: () => void;
};

type RemoveBlockSelectionNodesOptions = {
  insertText?: string;
  selectPrevious?: boolean;
};

export type BlockSelectionPluginState = {
  anchorId: string | null;
  areaOptions: PartialSelectionAreaOptions;
  editorPaddingRight?: CSSProperties['width'];
  enableContextMenu: boolean;
  /** Disable the plugin's custom select-all behavior. */
  disableSelectAll: boolean;
  isSelecting: boolean;
  isSelectionAreaVisible: boolean;
  rightSelectionAreaClassName?: string;
  selectedIds: Set<string>;
  shadowInputRef: React.RefObject<HTMLInputElement | null>;
  /** Check if a block is selectable. */
  isSelectable: (element: Element, path: Path) => boolean;
  onKeyDownSelecting?: (editor: BaseEditor, event: KeyboardEvent) => void;
};

const initialState: BlockSelectionPluginState = {
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
};

// Keep component rendering in the final capability stage so the component can
// consume the finished API without creating a recursive inference cycle.
export const BlockSelectionPlugin = createPlatePlugin({
  key: KEYS.blockSelection,
  initialState,

  editOnly: true,
  handlers: {
    onMouseDown: ({ editor, event, store }) => {
      if (!(event.target instanceof HTMLElement)) return;

      if (event.target.dataset.platePreventDeselect) return;

      const blockMenu = editor.plugin(BlockMenuPlugin);
      if (
        event.button === 0 &&
        store.get().selectedIds!.size > 0 &&
        (!blockMenu.installed || !blockMenu.store.get('openId'))
      ) {
        store.set({ isSelecting: false, selectedIds: new Set() });
      }
    },
  },
  selectors: {
    has: (state, id: string[] | string) =>
      Array.isArray(id)
        ? id.every((singleId) => state.selectedIds!.has(singleId))
        : state.selectedIds!.has(id),
    isSelected: (state, id?: string) => !!id && state.selectedIds!.has(id),
    isSelectingSome: (state) => state.selectedIds!.size > 0,
  },
  read: ({ store, state }) => {
    const getNodes = (options?: GetBlockSelectionNodesOptions) => {
      const selectedIds = store.get('selectedIds');
      const nodes = selectedIds?.size
        ? [
            ...state.nodes.toArray<TIdElement>({
              at: [],
              match: (node) =>
                ElementApi.isElement(node) &&
                typeof node.id === 'string' &&
                selectedIds.has(node.id),
            }),
          ]
        : [];

      if (options?.sort) {
        nodes.sort(([, pathA], [, pathB]) => PathApi.compare(pathA, pathB));
      }

      if (options?.collapseTableRows) {
        const collapsedNodes: [TIdElement, Path][] = [];

        nodes.forEach(([node, path]) => {
          if (node.type !== KEYS.tr) {
            collapsedNodes.push([node, path]);
            return;
          }

          const tableEntry = state.nodes.get<TIdElement>(PathApi.parent(path));

          if (!tableEntry) return;

          const existingIndex = collapsedNodes.findIndex(
            ([existing]) =>
              existing.type === tableEntry[0].type &&
              existing.id === tableEntry[0].id
          );

          if (existingIndex === -1) {
            collapsedNodes.push([
              { ...tableEntry[0], children: [node] },
              tableEntry[1],
            ]);
            return;
          }

          const [existing, existingPath] = collapsedNodes[existingIndex]!;
          collapsedNodes[existingIndex] = [
            { ...existing, children: [...existing.children, node] },
            existingPath,
          ];
        });

        return collapsedNodes;
      }

      if (nodes.length === 0 && options?.selectionFallback) {
        return state.nodes.toArray<TIdElement>({ mode: 'highest' });
      }

      return nodes;
    };

    return {
      first: () => getNodes()[0] ?? null,
      getNodes,
      isSelecting: () =>
        state.selection.isExpanded() || Boolean(store.get().selectedIds?.size),
    };
  },
})
  .extend(({ editor, read, store }) => {
    const add = (id: string[] | string) => {
      const next = new Set(store.get().selectedIds!);

      if (Array.isArray(id)) {
        for (const singleId of id) {
          next.add(singleId);
        }
      } else {
        next.add(id);
      }

      store.set({ selectedIds: next });
    };
    const focus = () => {
      const shadowInputRef = store.get('shadowInputRef');

      if (shadowInputRef?.current) {
        shadowInputRef.current.focus({ preventScroll: true });
      }
    };
    const isSelectable = (element: Element, path: Path) =>
      typeof element.id === 'string' &&
      editor.read.schema.isBlock(element) &&
      store.get().isSelectable!(element, path);
    const set = (id: string[] | string) => {
      store.set({ selectedIds: new Set(Array.isArray(id) ? id : [id]) });
    };
    const setSelectedIds = ({ added, ids, removed }: SetSelectedIdsOptions) => {
      if (ids) store.set({ selectedIds: new Set(ids) });

      if (added || removed) {
        const next = new Set(store.get().selectedIds);

        if (added) {
          added.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const { blockId } = element.dataset;

            if (blockId) next.add(blockId);
          });
        }
        if (removed) {
          removed.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const { blockId } = element.dataset;

            if (blockId) next.delete(blockId);
          });
        }

        store.set({ selectedIds: next });
      }

      store.set({ isSelecting: true });
    };

    const api = {
      addOnContextMenu: ({
        disabledWhenFocused = true,
        element,
        event,
      }: AddOnContextMenuOptions) => {
        const { enableContextMenu, selectedIds } = store.get();

        if (!enableContextMenu) return;

        if (editor.read.selection()?.focus && disabledWhenFocused) {
          const nodeEntry = editor.read.nodes.above<Element>();
          const elementPath = editor.read.nodes.path(element);

          if (
            nodeEntry &&
            elementPath &&
            PathApi.isCommon(elementPath, nodeEntry[1])
          ) {
            const id =
              typeof nodeEntry[0].id === 'string' ? nodeEntry[0].id : undefined;
            const isSelected = id && selectedIds?.has(id);
            const isOpenAlways =
              event.target instanceof HTMLElement &&
              event.target.dataset.plateOpenContextMenu === 'true';

            if (
              !isSelected &&
              !editor.read.schema.isVoid(nodeEntry[0]) &&
              !isOpenAlways
            ) {
              return event.stopPropagation();
            }
          }
        }

        const id = typeof element.id === 'string' ? element.id : undefined;

        if (!id) return;

        if (event?.shiftKey) {
          add(id);
          return;
        }

        const clickAlreadySelected = selectedIds?.has(id);

        if (!clickAlreadySelected) {
          store.set({ selectedIds: new Set([id]) });
        }
      },
      moveSelection: (direction: BlockSelectionDirection) => {
        const blocks = read.getNodes();

        if (blocks.length === 0) return;

        if (direction === 'up') {
          const [, topPath] = blocks[0]!;
          const previous = editor.read.nodes.previous<TIdElement>({
            at: topPath,
            from: 'parent',
            match: (node, path) =>
              ElementApi.isElement(node) && isSelectable(node, path),
          });
          const id = previous?.[0].id ?? blocks[0]![0].id;

          if (typeof id !== 'string') return;
          if (previous) store.set({ anchorId: id });
          set(id);
          return;
        }

        const [, bottomPath] = blocks.at(-1)!;
        const next = editor.read.nodes.next<TIdElement>({
          at: bottomPath,
          from: 'child',
          match: (node, path) =>
            ElementApi.isElement(node) && isSelectable(node, path),
        });
        const id = next?.[0].id ?? blocks.at(-1)![0].id;

        if (typeof id !== 'string') return;
        if (next) store.set({ anchorId: id });
        set(id);
      },
      addSelectedRow: (
        id: string,
        { clear = true, delay }: AddSelectedRowOptions = {}
      ) => {
        const element = document.querySelector(
          `.plite-selectable[data-block-id="${id}"]`
        );

        if (!element) return;

        if (!store.get().selectedIds?.has(id) && clear) {
          store.set({ selectedIds: new Set() });
        }

        setSelectedIds({ added: [element], removed: [] });

        if (delay) {
          setTimeout(() => {
            setSelectedIds({ added: [], removed: [element] });
          }, delay);
        }
      },
      setSelectedIds,
      shiftSelection: (direction: BlockSelectionDirection) => {
        const blocks = read.getNodes();

        if (blocks.length === 0) return;

        const [topNode, topPath] = blocks[0]!;
        const [bottomNode, bottomPath] = blocks.at(-1)!;
        let anchorId = store.get().anchorId;

        if (!anchorId) {
          const fallback = direction === 'up' ? bottomNode.id : topNode.id;

          if (typeof fallback !== 'string') return;
          anchorId = fallback;
          store.set({ anchorId });
        }

        const anchorIndex = blocks.findIndex(([node]) => node.id === anchorId);

        if (anchorIndex === -1) {
          if (typeof bottomNode.id === 'string') {
            store.set({ anchorId: bottomNode.id });
          }
          return;
        }

        const anchorIsTop = anchorIndex === 0;
        const anchorIsBottom = anchorIndex === blocks.length - 1;
        const selectedIds = new Set(store.get('selectedIds'));

        if (direction === 'down') {
          if (anchorIsTop) {
            const below = editor.read.nodes.next({
              at: bottomPath,
              mode: 'highest',
              match: (node, path) =>
                ElementApi.isElement(node) &&
                isSelectable(node, path) &&
                !PathApi.isAncestor(path, bottomPath),
            });

            if (!below || typeof below[0].id !== 'string') return;
            selectedIds.add(below[0].id);
          } else if (
            typeof topNode.id === 'string' &&
            topNode.id !== anchorId
          ) {
            selectedIds.delete(topNode.id);
          }
        } else if (anchorIsBottom) {
          const above = editor.read.nodes.previous<TIdElement>({
            at: topPath,
            from: 'parent',
            match: (node, path) =>
              ElementApi.isElement(node) && isSelectable(node, path),
          });

          if (!above || typeof above[0].id !== 'string') return;

          if (PathApi.isAncestor(above[1], topPath)) {
            selectedIds.forEach((id) => {
              const entry = editor.read.nodes.find({
                at: above[1],
                match: { id },
              });

              if (entry && PathApi.isDescendant(entry[1], above[1])) {
                selectedIds.delete(id);

                if (id === anchorId) {
                  anchorId = above[0].id;
                  store.set({ anchorId });
                }
              }
            });
          }

          selectedIds.add(above[0].id);
        } else if (
          typeof bottomNode.id === 'string' &&
          bottomNode.id !== anchorId
        ) {
          selectedIds.delete(bottomNode.id);
        }

        selectedIds.add(anchorId);
        store.set({ selectedIds });
      },
      add,
      clear: () => {
        store.set({ selectedIds: new Set() });
      },
      copy: (dataTransfer?: DataTransfer) => {
        const write = (data: Pick<DataTransfer, 'setData'>) => {
          const selectedEntries = read.getNodes({
            collapseTableRows: true,
          });

          if (selectedEntries.length === 0) return false;

          const blocks = editor.read((state) =>
            selectedEntries.flatMap(([node, path]) => {
              if (!state.nodes.get(path) || !ElementApi.isElement(node)) {
                return [];
              }

              const start = state.points.start(path);
              const end = state.points.end(path);

              if (!start || !end) return [];

              return [
                {
                  empty: state.nodes.isEmpty(node),
                  node,
                  range: {
                    anchor: start,
                    focus: end,
                    kind: 'text' as const,
                  },
                },
              ];
            })
          );

          if (blocks.length === 0) return false;

          const textParts: string[] = [];
          const div = document.createElement('div');

          blocks.forEach(({ empty, range }) => {
            const values = new Map<string, string>();
            const blockData = {
              getData: (format: string) => values.get(format) ?? '',
              setData: (format: string, value: string) => {
                values.set(format, value);
              },
            };

            if (!empty) writeDOMRangeData(editor, blockData, range);

            textParts.push(empty ? '' : blockData.getData('text/plain'));

            const child = document.createElement('div');

            child.innerHTML = empty
              ? '<p></p>'
              : blockData.getData('text/html');
            child
              .querySelectorAll('[data-plite-fragment]')
              .forEach((element) => {
                element.removeAttribute('data-plite-fragment');
                element.removeAttribute('data-plite-fragment-format');
              });
            div.append(child);
          });

          writeDOMFragmentData(data, {
            clipboardFormatKey: getDOMClipboardFormatKey(editor),
            html: div.innerHTML,
            slice: ContentSlice.closed(blocks.map(({ node }) => node)),
            text: `${textParts.join('\n')}\n`,
            window: editor.api.dom.getWindow(),
          });

          return true;
        };

        if (dataTransfer) return write(dataTransfer);

        let didWrite = false;
        const didCopy = copyToClipboard(' ', {
          onCopy: (data) => {
            if (
              typeof data !== 'object' ||
              data === null ||
              !('setData' in data) ||
              typeof data.setData !== 'function'
            ) {
              return;
            }
            const setData = data.setData;

            didWrite = write({
              setData: (format, value) => {
                Reflect.apply(setData, data, [format, value]);
              },
            });
          },
        });

        return didCopy && didWrite;
      },
      delete: (id: string[] | string) => {
        const next = new Set(store.get().selectedIds!);

        if (Array.isArray(id)) {
          for (const i of id) {
            next.delete(i);
          }
        } else {
          next.delete(id);
        }

        store.set({ selectedIds: next });
      },
      deselect: () => {
        store.set({ selectedIds: new Set() });
        store.set({ isSelecting: false });
      },
      focus,
      isSelectable,
      set,
      selectAll: () => {
        const ids = editor.read.nodes
          .toArray({
            at: [],
            mode: 'highest',
            match: (n, p) =>
              ElementApi.isElement(n) &&
              typeof n.id === 'string' &&
              isSelectable(n, p),
          })
          .flatMap(([node]) => (typeof node.id === 'string' ? [node.id] : []));

        store.set({ selectedIds: new Set(ids) });
        focus();
      },
      selectInserted: () => {
        const ids = new Set<string>();
        const commit = editor.read.lastCommit();

        if (commit) {
          for (const runtimeId of commit.changed.runtimeIds('node')) {
            if (commit.before.index.pathOf(runtimeId)) continue;

            const path = commit.after.index.pathOf(runtimeId);
            const node = path ? editor.read.nodes.get(path)?.[0] : undefined;

            if (
              node &&
              typeof node.id === 'string' &&
              editor.read.schema.isBlock(node)
            ) {
              ids.add(node.id);
            }
          }
        }

        store.set({ selectedIds: ids });
      },
    };
    const blockMenu = editor.plugin(BlockMenuPlugin);
    const isBlockMenuOpen = () =>
      blockMenu.installed && Boolean(blockMenu.store.get('openId'));

    return {
      api,
      extension: {
        commands: ({ around }) => [
          around(editorCommands.addMark, ({ state, next }) => {
            if (!store.get().selectedIds?.size) return next();

            const range = state.ranges.fromEntries(
              state.blockSelection.getNodes()
            );

            if (!range) return next();

            return next.after(
              state.transaction((tx) => {
                tx.tags.add(BLOCK_SELECTION_PRESERVE_TAG);
                tx.selection.set(range);
              })
            );
          }),
          around(editorCommands.toggleMark, ({ state, next }) => {
            if (!store.get().selectedIds?.size) return next();

            const range = state.ranges.fromEntries(
              state.blockSelection.getNodes()
            );

            if (!range) return next();

            return next.after(
              state.transaction((tx) => {
                tx.tags.add(BLOCK_SELECTION_PRESERVE_TAG);
                tx.selection.set(range);
              })
            );
          }),
          around(editorCommands.setNodes, ({ state, next }) => {
            if (!store.get().selectedIds?.size) return next();

            const range = state.ranges.fromEntries(
              state.blockSelection.getNodes()
            );

            if (!range) return next();

            return next.after(
              state.transaction((tx) => {
                tx.tags.add(BLOCK_SELECTION_PRESERVE_TAG);
                tx.selection.set(range);
              })
            );
          }),
          around(editorCommands.select, ({ state, next }) => {
            if (!store.get().selectedIds?.size || isBlockMenuOpen()) {
              return next();
            }

            return next.after(
              state.transaction((tx) => {
                tx.tags.add(BLOCK_SELECTION_DESELECT_TAG);
              })
            );
          }),
          around(editorCommands.setSelection, ({ state, next }) => {
            if (!store.get().selectedIds?.size || isBlockMenuOpen()) {
              return next();
            }

            return next.after(
              state.transaction((tx) => {
                tx.tags.add(BLOCK_SELECTION_DESELECT_TAG);
              })
            );
          }),
        ],
        on: {
          commit({ commit }) {
            if (
              (commit.tags.includes(BLOCK_SELECTION_DESELECT_TAG) ||
                (commit.selectionChanged &&
                  !commit.tags.includes(BLOCK_SELECTION_PRESERVE_TAG))) &&
              store.get().selectedIds!.size > 0 &&
              !isBlockMenuOpen()
            ) {
              store.set({ isSelecting: false, selectedIds: new Set() });
            }
          },
        },
      },
    };
  })
  .extend(({ api, editor, plugin, store }) => ({
    inject: {
      isBlock: true,
      nodeProps: {
        transformProps: ({ element, path }) => {
          if (!element || !path) return {};

          if (!api.isSelectable(element, path)) return {};

          return {
            className: 'plite-selectable',
            onContextMenu: (
              event: React.MouseEvent<HTMLDivElement, MouseEvent>
            ) => api.addOnContextMenu({ element, event }),
          };
        },
      },
    },
    shortcuts: {
      selectAll: {
        keys: 'mod+a',
        priority: 0,
        handler: ({ editor }) => {
          if (store.get('disableSelectAll')) return false;

          const selection = editor.read.selection();
          const block = editor.read.nodes.block({ mode: 'highest' });

          if (!selection || !block) return false;

          if (
            !editor.read.selection.isWithinBlock() ||
            (editor.read.selection.isAtBlockStart() &&
              editor.read.selection.isAtBlockEnd())
          ) {
            api.selectAll();
            return true;
          }

          editor.update.selection.set(block[1]);
          return true;
        },
      },
    },
    update: ({ context: updateContext, tx }) => {
      const getSelectedBlocks = () => tx[plugin.key].getNodes();

      return {
        duplicate: () => {
          const blocks = getSelectedBlocks();
          const lastBlock = blocks.at(-1);

          if (!lastBlock) return;

          tx.nodes.duplicate(blocks);

          const path = PathApi.next(lastBlock[1]);
          const ids = blocks.flatMap((_, index) => {
            const target = tx.nodes.get([path[0] + index]);

            return typeof target?.[0].id === 'string' ? [target[0].id] : [];
          });

          updateContext.afterCommit(() => {
            store.set({ selectedIds: new Set(ids) });
          });
        },
        insertBlocksAndSelect: (
          nodes: Element[],
          { at, insertedCallback }: InsertBlocksAndSelectOptions
        ) => {
          tx.nodes.insert(nodes, { at });

          const ids: string[] = [];
          let path = at;

          for (const _ of nodes) {
            const entry = tx.nodes.get<Element>(path);

            if (typeof entry?.[0].id === 'string') ids.push(entry[0].id);
            path = PathApi.next(path);
          }

          updateContext.afterCommit(() => {
            insertedCallback?.();
            store.set({ selectedIds: new Set(ids) });
          });
        },
        paste: (data: DataTransfer) => {
          const entry = getSelectedBlocks().at(-1);

          if (!entry) return;

          const [node, path] = entry;

          if (!tx.nodes.isEmpty(node)) {
            tx.nodes.insert(
              {
                children: [{ text: '' }],
                type: editor.getType(KEYS.p),
              },
              { at: PathApi.next(path), select: true }
            );
          }

          tx.clipboard.insertData(data);
          updateContext.afterCommit(() => api.selectInserted());
        },
        removeNodes: (options: RemoveBlockSelectionNodesOptions = {}) => {
          const entries = getSelectedBlocks();

          if (entries.length === 0) return;

          const firstPath = entries[0]![1];

          for (const [, path] of entries.toReversed()) {
            tx.nodes.remove({ at: path });
          }

          if (options.insertText !== undefined) {
            tx.nodes.insert(
              {
                children: [{ text: options.insertText }],
                type: editor.getType(KEYS.p),
              },
              { at: firstPath, select: true }
            );
          }

          const shouldFocus = tx.children().length === 0;
          const deletedIds = entries.flatMap(([node]) =>
            typeof node.id === 'string' ? [node.id] : []
          );
          let previousId: string | undefined;

          if (!shouldFocus && options.selectPrevious) {
            const previousPath = PathApi.previous(firstPath);
            const previous = previousPath
              ? tx.nodes.block({ at: previousPath })
              : undefined;

            if (typeof previous?.[0].id === 'string') {
              previousId = previous[0].id;
            }
          }

          updateContext.afterCommit(() => {
            const selectedIds = new Set(store.get('selectedIds'));

            deletedIds.forEach((id) => {
              selectedIds.delete(id);
            });
            store.set({
              selectedIds: previousId ? new Set([previousId]) : selectedIds,
            });

            if (options.insertText !== undefined || shouldFocus) {
              editor.api.dom.focus();
            }
          });
        },
        select: () => {
          const range = tx.ranges.fromEntries(getSelectedBlocks());

          if (!range) return;

          tx.selection.set(range);
          updateContext.afterCommit(() => api.clear());
        },
        setIndent: (indent: number, options?: NodeSetNodesOptions) => {
          getSelectedBlocks().forEach(([node, path]) => {
            const previous = typeof node.indent === 'number' ? node.indent : 0;

            tx.nodes.set(
              { indent: Math.max(previous + indent, 0) },
              { ...options, at: path }
            );
          });
        },
        setNodes: (
          props: Partial<NodeProps<Element>>,
          options?: NodeSetNodesOptions
        ) => {
          getSelectedBlocks().forEach(([, path]) => {
            tx.nodes.set(props, { ...options, at: path });
          });
        },
        setTexts: (
          props: Partial<NodeProps<Text>>,
          options?: Omit<NodeSetNodesOptions, 'at'>
        ) => {
          getSelectedBlocks().forEach(([, path]) => {
            tx.nodes.set(props, {
              mode: 'all',
              ...options,
              at: path,
              match: TextApi.isText,
            });
          });
        },
      };
    },
  }))
  .extend({
    render: {
      afterEditable: BlockSelectionAfterEditable,
    },
  });

export type BlockSelectionConfig = InferConfig<typeof BlockSelectionPlugin>;
