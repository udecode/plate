import type { BaseEditor, DefinitionOf } from '@platejs/core';
import { definePlatePlugin } from '@platejs/core/react';
import type {
  Element,
  NodeProps,
  NodeSetNodesOptions,
  Path,
  NodeKey,
  Text,
} from '@platejs/plite';
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
import { failInvariant } from '@platejs/plite/internal';
import { PLUGINS } from '@platejs/utils';
import copyToClipboard from 'copy-to-clipboard';
import type React from 'react';
import type { CSSProperties } from 'react';

import type { PartialSelectionAreaOptions } from '../SelectionArea';
import { BlockMenuPlugin } from './BlockMenuPlugin';
import { BlockSelectionAfterEditable } from './BlockSelection.internal';

const BLOCK_SELECTION_PRESERVE_TAG = 'block-selection-preserve';
const BLOCK_SELECTION_DESELECT_TAG = 'block-selection-deselect';

type AddOnContextMenuOptions = {
  element: Element;
  event: React.MouseEvent<HTMLDivElement>;
  disabledWhenFocused?: boolean;
};

type AddSelectedRowOptions = {
  clear?: boolean;
  delay?: number;
};

type SetSelectedKeysOptions = Partial<{
  added: globalThis.Element[];
  removed: globalThis.Element[];
}> & {
  keys?: NodeKey[];
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
  anchorKey: NodeKey | null;
  areaOptions: PartialSelectionAreaOptions;
  editorPaddingRight?: CSSProperties['width'];
  enableContextMenu: boolean;
  /** Disable the plugin's custom select-all behavior. */
  disableSelectAll: boolean;
  isSelecting: boolean;
  isSelectionAreaVisible: boolean;
  /** Class name applied to the portaled selection marquee. */
  selectionAreaClassName: string;
  selectedKeys: Set<NodeKey>;
  shadowInputRef: React.RefObject<HTMLInputElement | null>;
  /** Check if a block is selectable. */
  isSelectable: (element: Element, path: Path) => boolean;
  onKeyDownSelecting?: (editor: BaseEditor, event: KeyboardEvent) => void;
};

const initialState: BlockSelectionPluginState = {
  anchorKey: null,
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
  selectionAreaClassName: '',
  selectedKeys: new Set(),
  shadowInputRef: { current: null },
  isSelectable: () => true,
};

// Keep component rendering in the final capability stage so the component can
// consume the finished API without creating a recursive inference cycle.
export const BlockSelectionPlugin = definePlatePlugin(PLUGINS.blockSelection, {
  initialState,

  editOnly: true,
  on: {
    mouseDown: ({ editor, event, store }) => {
      if (!(event.target instanceof HTMLElement)) return;

      if (event.target.dataset.platePreventDeselect) return;

      const blockMenu = editor.plugin(BlockMenuPlugin);
      if (
        event.button === 0 &&
        store.get().selectedKeys.size > 0 &&
        (!blockMenu.installed || !blockMenu.store.get('openKey'))
      ) {
        store.set({ isSelecting: false, selectedKeys: new Set() });
      }
    },
  },
  selectors: {
    has: (state, key: NodeKey[] | NodeKey) =>
      Array.isArray(key)
        ? key.every((singleKey) => state.selectedKeys.has(singleKey))
        : state.selectedKeys.has(key),
    isSelected: (state, key?: NodeKey) => !!key && state.selectedKeys.has(key),
    isSelectingSome: (state) => state.selectedKeys.size > 0,
  },
  read: ({ editor, store, state }) => {
    const getNodes = (options?: GetBlockSelectionNodesOptions) => {
      const selectedKeys = store.get('selectedKeys');
      const nodes = selectedKeys?.size
        ? [
            ...state.nodes.toArray({
              at: [],
              match: (node): node is Element =>
                ElementApi.isElement(node) && selectedKeys.has(state.key(node)),
            }),
          ]
        : [];

      if (options?.sort) {
        nodes.sort(([, pathA], [, pathB]) => PathApi.compare(pathA, pathB));
      }

      if (options?.collapseTableRows) {
        const collapsedNodes: Array<[Element, Path]> = [];
        const tableRow = editor.plugin(PLUGINS.tableRow);

        nodes.forEach(([node, path]) => {
          if (!tableRow.installed || node.type !== tableRow.schema.type) {
            collapsedNodes.push([node, path]);
            return;
          }

          const tableEntry = state.nodes.get(PathApi.parent(path), {
            match: ElementApi.isElement,
          });

          if (!tableEntry) return;

          const existingIndex = collapsedNodes.findIndex(([, existingPath]) =>
            PathApi.equals(existingPath, tableEntry[1])
          );

          if (existingIndex === -1) {
            collapsedNodes.push([
              { ...tableEntry[0], children: [node] },
              tableEntry[1],
            ]);
            return;
          }

          const [existing, existingPath] = collapsedNodes[existingIndex];
          collapsedNodes[existingIndex] = [
            { ...existing, children: [...existing.children, node] },
            existingPath,
          ];
        });

        return collapsedNodes;
      }

      if (nodes.length === 0 && options?.selectionFallback) {
        return state.nodes.toArray({
          match: ElementApi.isElement,
          mode: 'highest',
        });
      }

      return nodes;
    };

    return {
      first: () => getNodes()[0] ?? null,
      getNodes,
      isSelecting: () =>
        state.selection.isExpanded() || Boolean(store.get().selectedKeys?.size),
    };
  },
})
  .extend(({ editor, read, store }) => {
    const add = (key: NodeKey[] | NodeKey) => {
      const next = new Set(store.get().selectedKeys);

      if (Array.isArray(key)) {
        for (const singleKey of key) {
          next.add(singleKey);
        }
      } else {
        next.add(key);
      }

      store.set({ selectedKeys: next });
    };
    const focus = () => {
      const shadowInputRef = store.get('shadowInputRef');

      if (shadowInputRef?.current) {
        shadowInputRef.current.focus({ preventScroll: true });
      }
    };
    const isSelectable = (element: Element, path: Path) =>
      editor.read.schema.isBlock(element) &&
      store.get().isSelectable(element, path);
    const set = (key: NodeKey[] | NodeKey) => {
      store.set({ selectedKeys: new Set(Array.isArray(key) ? key : [key]) });
    };
    const setSelectedKeys = ({
      added,
      keys,
      removed,
    }: SetSelectedKeysOptions) => {
      if (keys) store.set({ selectedKeys: new Set(keys) });

      if (added || removed) {
        const next = new Set(store.get().selectedKeys);

        if (added) {
          added.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const nodeKey = element.dataset.pliteNodeKey as NodeKey | undefined;

            if (nodeKey) next.add(nodeKey);
          });
        }
        if (removed) {
          removed.forEach((element) => {
            if (!(element instanceof HTMLElement)) return;

            const nodeKey = element.dataset.pliteNodeKey as NodeKey | undefined;

            if (nodeKey) next.delete(nodeKey);
          });
        }

        store.set({ selectedKeys: next });
      }

      store.set({ isSelecting: true });
    };

    const api = {
      addOnContextMenu: ({
        disabledWhenFocused = true,
        element,
        event,
      }: AddOnContextMenuOptions) => {
        const { enableContextMenu, selectedKeys } = store.get();

        if (!enableContextMenu) return;

        if (editor.read.selection()?.focus && disabledWhenFocused) {
          const nodeEntry = editor.read.nodes.above({
            match: ElementApi.isElement,
          });
          const elementPath = editor.read.nodes.path(element);

          if (
            nodeEntry &&
            elementPath &&
            PathApi.isCommon(elementPath, nodeEntry[1])
          ) {
            const key = editor.key(nodeEntry[0]);
            const isSelected = key && selectedKeys?.has(key);
            const isOpenAlways =
              event.target instanceof HTMLElement &&
              event.target.dataset.plateOpenContextMenu === 'true';

            if (
              !isSelected &&
              !editor.read.schema.isVoid(nodeEntry[0]) &&
              !isOpenAlways
            ) {
              event.stopPropagation();
              return;
            }
          }
        }

        const key = editor.key(element);

        if (!key) return;

        if (event?.shiftKey) {
          add(key);
          return;
        }

        const clickAlreadySelected = selectedKeys?.has(key);

        if (!clickAlreadySelected) {
          store.set({ selectedKeys: new Set([key]) });
        }
      },
      moveSelection: (direction: BlockSelectionDirection) => {
        const blocks = read.getNodes();

        if (blocks.length === 0) return;

        if (direction === 'up') {
          const [, topPath] = blocks[0];
          const previous = editor.read.nodes.previous({
            at: topPath,
            from: 'parent',
            match: (node, path): node is Element =>
              ElementApi.isElement(node) && isSelectable(node, path),
          });
          const key = editor.key(previous?.[0] ?? blocks[0][0]);

          if (!key) return;
          if (previous) store.set({ anchorKey: key });
          set(key);
          return;
        }

        const [, bottomPath] =
          blocks.at(-1) ?? failInvariant('Expected value to be defined');
        const next = editor.read.nodes.next({
          at: bottomPath,
          from: 'child',
          match: (node, path): node is Element =>
            ElementApi.isElement(node) && isSelectable(node, path),
        });
        const key = editor.key(
          next?.[0] ??
            (blocks.at(-1) ?? failInvariant('Expected value to be defined'))[0]
        );

        if (!key) return;
        if (next) store.set({ anchorKey: key });
        set(key);
      },
      addSelectedRow: (
        key: NodeKey,
        { clear = true, delay }: AddSelectedRowOptions = {}
      ) => {
        const element = document.querySelector(
          `.plite-selectable[data-plite-node-key="${key}"]`
        );

        if (!element) return;

        if (!store.get().selectedKeys?.has(key) && clear) {
          store.set({ selectedKeys: new Set() });
        }

        setSelectedKeys({ added: [element], removed: [] });

        if (delay) {
          setTimeout(() => {
            setSelectedKeys({ added: [], removed: [element] });
          }, delay);
        }
      },
      setSelectedKeys,
      shiftSelection: (direction: BlockSelectionDirection) => {
        const blocks = read.getNodes();

        if (blocks.length === 0) return;

        const [topNode, topPath] = blocks[0];
        const [bottomNode, bottomPath] =
          blocks.at(-1) ?? failInvariant('Expected value to be defined');
        let { anchorKey } = store.get();

        if (!anchorKey) {
          const fallback = editor.key(
            direction === 'up' ? bottomNode : topNode
          );

          if (!fallback) return;
          anchorKey = fallback;
          store.set({ anchorKey });
        }

        const anchorIndex = blocks.findIndex(
          ([node]) => editor.key(node) === anchorKey
        );

        if (anchorIndex === -1) {
          const bottomKey = editor.key(bottomNode);

          if (bottomKey) store.set({ anchorKey: bottomKey });
          return;
        }

        const anchorIsTop = anchorIndex === 0;
        const anchorIsBottom = anchorIndex === blocks.length - 1;
        const selectedKeys = new Set(store.get('selectedKeys'));

        if (direction === 'down') {
          if (anchorIsTop) {
            const below = editor.read.nodes.next({
              at: bottomPath,
              mode: 'highest',
              match: (node, path): node is Element =>
                ElementApi.isElement(node) &&
                isSelectable(node, path) &&
                !PathApi.isAncestor(path, bottomPath),
            });

            if (!below) return;
            selectedKeys.add(editor.key(below[0]));
          } else {
            const topKey = editor.key(topNode);

            if (topKey && topKey !== anchorKey) selectedKeys.delete(topKey);
          }
        } else if (anchorIsBottom) {
          const above = editor.read.nodes.previous({
            at: topPath,
            from: 'parent',
            match: (node, path): node is Element =>
              ElementApi.isElement(node) && isSelectable(node, path),
          });

          if (!above) return;
          const aboveKey = editor.key(above[0]);

          if (!aboveKey) return;

          if (PathApi.isAncestor(above[1], topPath)) {
            selectedKeys.forEach((key) => {
              const entry = editor.read.nodes.get(key, {
                match: ElementApi.isElement,
              });

              if (entry && PathApi.isDescendant(entry[1], above[1])) {
                selectedKeys.delete(key);

                if (key === anchorKey) {
                  anchorKey = aboveKey;
                  store.set({ anchorKey });
                }
              }
            });
          }

          selectedKeys.add(aboveKey);
        } else {
          const bottomKey = editor.key(bottomNode);

          if (bottomKey && bottomKey !== anchorKey) {
            selectedKeys.delete(bottomKey);
          }
        }

        selectedKeys.add(anchorKey);
        store.set({ selectedKeys });
      },
      add,
      clear: () => {
        store.set({ selectedKeys: new Set() });
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
                  node: state.schema.copy(node, { at: path }),
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
            const { setData } = data;

            didWrite = write({
              setData: (format, value) => {
                Reflect.apply(setData, data, [format, value]);
              },
            });
          },
        });

        return didCopy && didWrite;
      },
      delete: (key: NodeKey[] | NodeKey) => {
        const next = new Set(store.get().selectedKeys);

        if (Array.isArray(key)) {
          for (const singleKey of key) {
            next.delete(singleKey);
          }
        } else {
          next.delete(key);
        }

        store.set({ selectedKeys: next });
      },
      deselect: () => {
        store.set({ selectedKeys: new Set() });
        store.set({ isSelecting: false });
      },
      focus,
      isSelectable,
      set,
      selectAll: () => {
        const keys = editor.read.nodes
          .toArray({
            at: [],
            mode: 'highest',
            match: (node, path): node is Element =>
              ElementApi.isElement(node) && isSelectable(node, path),
          })
          .flatMap(([node]) => {
            const key = editor.key(node);

            return key ? [key] : [];
          });

        store.set({ selectedKeys: new Set(keys) });
        focus();
      },
      selectInserted: () => {
        const keys = new Set<NodeKey>();
        const commit = editor.read.lastCommit();

        if (commit) {
          for (const nodeKey of commit.changed.nodeKeys('node')) {
            if (commit.before.index.pathOf(nodeKey)) continue;

            const path = commit.after.index.pathOf(nodeKey);
            const node = path
              ? editor.read.nodes.get(path, {
                  match: ElementApi.isElement,
                })?.[0]
              : undefined;

            if (node && editor.read.schema.isBlock(node)) {
              keys.add(nodeKey);
            }
          }
        }

        store.set({ selectedKeys: keys });
      },
    };
    const blockMenu = editor.plugin(BlockMenuPlugin);
    const isBlockMenuOpen = () =>
      blockMenu.installed && Boolean(blockMenu.store.get('openKey'));

    return {
      api: () => api,
      commands: ({ around }) => [
        around(editorCommands.addMark, ({ state, next }) => {
          if (!store.get().selectedKeys?.size) return next();

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
          if (!store.get().selectedKeys?.size) return next();

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
          if (!store.get().selectedKeys?.size) return next();

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
          if (!store.get().selectedKeys?.size || isBlockMenuOpen()) {
            return next();
          }

          return next.after(
            state.transaction((tx) => {
              tx.tags.add(BLOCK_SELECTION_DESELECT_TAG);
            })
          );
        }),
        around(editorCommands.setSelection, ({ state, next }) => {
          if (!store.get().selectedKeys?.size || isBlockMenuOpen()) {
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
            !commit.tags.includes(BLOCK_SELECTION_PRESERVE_TAG) &&
            (commit.tags.includes(BLOCK_SELECTION_DESELECT_TAG) ||
              commit.selectionChanged) &&
            store.get().selectedKeys.size > 0 &&
            !store.get().isSelectionAreaVisible &&
            !isBlockMenuOpen()
          ) {
            store.set({ isSelecting: false, selectedKeys: new Set() });
          }
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
            onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => {
              api.addOnContextMenu({ element, event });
            },
          };
        },
      },
    },
    shortcuts: {
      selectAll: {
        keys: 'mod+a',
        priority: 0,
        handler: ({ editor: innerEditor }) => {
          if (store.get('disableSelectAll')) return false;

          const selection = innerEditor.read.selection();
          const block = innerEditor.read.nodes.block({ mode: 'highest' });

          if (!selection || !block) return false;

          if (
            !innerEditor.read.selection.isWithinBlock() ||
            (innerEditor.read.selection.isAtBlockStart() &&
              innerEditor.read.selection.isAtBlockEnd())
          ) {
            api.selectAll();
            return true;
          }

          innerEditor.update.selection.set(block[1]);
          return true;
        },
      },
    },
    update: ({ context: updateContext, tx }) => {
      const getSelectedBlocks = () => tx.plugin(plugin).getNodes();

      return {
        duplicate: () => {
          const blocks = getSelectedBlocks();
          const lastBlock = blocks.at(-1);

          if (!lastBlock) return;

          tx.nodes.duplicate(blocks);

          const path = PathApi.next(lastBlock[1]);
          const keys = blocks.flatMap((_, index) => {
            const key = tx.key([path[0] + index]);

            return key ? [key] : [];
          });

          updateContext.afterCommit(() => {
            store.set({ selectedKeys: new Set(keys) });
          });
        },
        insertBlocksAndSelect: (
          nodes: Element[],
          { at, insertedCallback }: InsertBlocksAndSelectOptions
        ) => {
          tx.nodes.insert(nodes, { at });

          const keys: NodeKey[] = [];
          let path = at;

          for (const _ of nodes) {
            const key = tx.key(path);

            if (key) keys.push(key);
            path = PathApi.next(path);
          }

          updateContext.afterCommit(() => {
            insertedCallback?.();
            store.set({ selectedKeys: new Set(keys) });
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
                type: editor.plugin(PLUGINS.paragraph).schema.type,
              },
              { at: PathApi.next(path), select: true }
            );
          }

          tx.dom.insertData(data);
          updateContext.afterCommit(() => {
            api.selectInserted();
          });
        },
        removeNodes: (options: RemoveBlockSelectionNodesOptions = {}) => {
          const entries = getSelectedBlocks();

          if (entries.length === 0) return;

          const firstPath = entries[0][1];

          for (const [, path] of entries.toReversed()) {
            tx.nodes.remove({ at: path });
          }

          if (options.insertText !== undefined) {
            tx.nodes.insert(
              {
                children: [{ text: options.insertText }],
                type: editor.plugin(PLUGINS.paragraph).schema.type,
              },
              { at: firstPath, select: true }
            );
          }

          const shouldFocus = tx.children().length === 0;
          const deletedKeys = entries.flatMap(([, path]) => {
            const key = tx.key(path);

            return key ? [key] : [];
          });
          let previousKey: NodeKey | undefined;

          if (!shouldFocus && options.selectPrevious) {
            const previousPath = PathApi.previous(firstPath);
            const previous = previousPath
              ? tx.nodes.block({ at: previousPath })
              : undefined;

            if (previous) previousKey = tx.key(previous[1]) ?? undefined;
          }

          updateContext.afterCommit(() => {
            const selectedKeys = new Set(store.get('selectedKeys'));

            deletedKeys.forEach((key) => {
              selectedKeys.delete(key);
            });
            store.set({
              selectedKeys: previousKey ? new Set([previousKey]) : selectedKeys,
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
          updateContext.afterCommit(() => {
            api.clear();
          });
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

export type BlockSelectionDefinition = DefinitionOf<
  typeof BlockSelectionPlugin
>;
