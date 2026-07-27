import {
  createBasePlugin,
  createRuleFactory,
  type InferConfig,
  type PluginReference,
} from '@platejs/core';
import {
  ContentSlice,
  editorCommands,
  ElementApi,
  NodeApi,
  PathApi,
  PointApi,
  property,
  RangeApi,
  schema,
  SelectionApi,
  target,
  TextApi,
  type Descendant,
  type EditorNodesOptions,
  type EditorStateView,
  type Element,
  type ElementEntry,
  type Location,
  type Node,
  type NodeEntry,
  type Path,
  type Point,
  type Range,
} from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

export type ListPluginState = {
  enableResetOnShiftTab?: boolean;
  /** Inherit the checked state of above node after insert break at the end */
  inheritCheckStateOnLineEndBreak?: boolean;
  /** Inherit the checked state of below node after insert break at the start */
  inheritCheckStateOnLineStartBreak?: boolean;
};

export type ListItemPluginState = {
  /** Element plugins allowed as direct list-item children. */
  validLiChildren?: readonly PluginReference[];
};

type ListToggleOptions = { type: string; checked?: boolean };

export type ListPluginTransaction = {
  indent: () => boolean;
  outdent: () => boolean;
  toggle: (options: ListToggleOptions) => void;
};

export const BaseListItemContentPlugin = createBasePlugin({
  key: KEYS.lic,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      slice: { preserveContext: true },
      topLevel: false,
    },
  },
});

export const BaseListItemPlugin = createBasePlugin({
  key: KEYS.li,
  initialState: { validLiChildren: [] } as ListItemPluginState,
  schema: ({ initialState, key, plugins }) => {
    const resolveRequiredElementType = (pluginKey: string) => {
      const [type] = plugins.elementTypesByKey([pluginKey]);

      if (!type) {
        throw new Error(
          `Plate plugin "${key}" schema references missing or disabled plugin "${pluginKey}".`
        );
      }

      return type;
    };
    const contentType = resolveRequiredElementType(KEYS.lic);
    const bulletedType = resolveRequiredElementType(KEYS.ulClassic);
    const numberedType = resolveRequiredElementType(KEYS.olClassic);
    const taskType = resolveRequiredElementType(KEYS.taskList);
    const validLiChildren = plugins.elementTypesByKey(
      (initialState.validLiChildren ?? []).map(({ key }) => key)
    );

    return {
      element: {
        content: schema.content.types(
          [
            contentType,
            bulletedType,
            numberedType,
            taskType,
            ...validLiChildren,
          ],
          {
            default: { type: contentType },
            min: 1,
          }
        ),
        slice: { preserveContext: true },
        topLevel: false,
      },
    };
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        decodeOnly: true,
        match: [{ tag: 'li' }],
      },
    }),

  render: { as: 'li' },
});

export const BaseBulletedListPlugin = createBasePlugin({
  key: KEYS.ulClassic,
  schema: ({ plugins }) => {
    const listItemType = plugins.elementType(BaseListItemPlugin);

    return {
      element: {
        content: schema.content.type(listItemType, {
          default: { type: listItemType },
          min: 1,
        }),
        slice: { preserveContext: true },
      },
    };
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        decodeOnly: true,
        match: [{ tag: 'ul' }],
      },
    }),

  render: { as: 'ul' },
});

export const BaseNumberedListPlugin = createBasePlugin({
  key: KEYS.olClassic,
  schema: ({ plugins }) => {
    const listItemType = plugins.elementType(BaseListItemPlugin);

    return {
      element: {
        content: schema.content.type(listItemType, {
          default: { type: listItemType },
          min: 1,
        }),
        slice: { preserveContext: true },
      },
    };
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        decodeOnly: true,
        match: [{ tag: 'ol' }],
      },
    }),

  render: { as: 'ol' },
});

export const BaseTaskListPlugin = createBasePlugin({
  key: KEYS.taskList,
  initialState: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
  schema: ({ plugins }) => {
    const listItemType = plugins.elementType(BaseListItemPlugin);

    return {
      element: {
        content: schema.content.type(listItemType, {
          default: { type: listItemType },
          min: 1,
        }),
        slice: { preserveContext: true },
      },
    };
  },
  render: { as: 'ul' },
});

/** Enables support for bulleted, numbered and to-do lists. */

export interface TTodoListItemElement extends Element {
  checked?: boolean;
}

export const BaseTodoListPlugin = createBasePlugin({
  extension: ({ store, type }) => ({
    commands: ({ around }) => [
      around(editorCommands.insertBreak, ({ state, next }) => {
        let handled = false;
        const prefix = state.transaction((tx) => {
          const selection = tx.selection();

          if (!selection) return;
          const todoEntry = tx.nodes.above<Element>({
            at: selection,
            match: { type },
          });

          if (!todoEntry) return;

          const [todo, path] = todoEntry;
          const {
            inheritCheckStateOnLineEndBreak,
            inheritCheckStateOnLineStartBreak,
          } = store.get();

          if (!tx.selection.isCollapsed()) {
            tx.text.delete();
          }

          const nextPath = PathApi.next(path);

          if (tx.points.isStart(selection.focus, path)) {
            tx.nodes.insert(
              {
                checked: inheritCheckStateOnLineStartBreak
                  ? todo.checked
                  : false,
                children: [{ text: '' }],
                type,
              },
              { at: path }
            );
            handled = true;

            return;
          }
          if (tx.points.isEnd(selection.focus, path)) {
            tx.nodes.insert(
              {
                checked: inheritCheckStateOnLineEndBreak ? todo.checked : false,
                children: [{ text: '', ...(tx.marks() || {}) }],
                type,
              },
              { at: nextPath }
            );
            tx.selection.set(nextPath);
          } else {
            tx.nodes.split();
          }

          handled = true;
        });

        return handled ? prefix : next.after(prefix);
      }),
    ],
  }),
  key: KEYS.listTodoClassic,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { checked: property.boolean({ default: false }) },
    },
  },
  type: NODES.listTodoClassic,
  initialState: {
    inheritCheckStateOnLineEndBreak: false,
    inheritCheckStateOnLineStartBreak: false,
  },
  update: ({ tx, type }) => ({
    toggle: () => tx.nodes.toggle(type),
  }),
});

export const BaseListPlugin = createBasePlugin({
  api: ({ editor }) => {
    const getListTypes = () => [
      editor.getType(KEYS.olClassic),
      editor.getType(KEYS.ulClassic),
      editor.getType(KEYS.taskList),
    ];
    const getPropsIfTaskListLiNode = ({
      inherit = false,
      liNode: node,
    }: {
      liNode: Element;
      inherit?: boolean;
    }) =>
      editor.getType(KEYS.li) === node.type && 'checked' in node
        ? { checked: inherit ? (node.checked as boolean) : false }
        : undefined;
    const hasListChild = (node: Element) =>
      node.children.some(
        (child) =>
          ElementApi.isElement(child) && getListTypes().includes(child.type)
      );
    const isListRoot = (node: Descendant): boolean =>
      ElementApi.isElement(node) && getListTypes().includes(node.type);

    return {
      getListTypes,
      getPropsIfTaskListLiNode,
      hasListChild,
      isListRoot,
    };
  },
  dependencies: [
    BaseBulletedListPlugin,
    BaseNumberedListPlugin,
    BaseTaskListPlugin,
    BaseListItemPlugin,
    BaseListItemContentPlugin,
  ],
  key: KEYS.listClassic,
  initialState: {} as ListPluginState,
  schema: ({ plugins }) => {
    const listItemType = plugins.elementType(BaseListItemPlugin);
    const taskListType = plugins.elementType(BaseTaskListPlugin);

    return {
      properties: [
        schema.elementProperty(
          'checked',
          property.boolean({ default: false }),
          {
            target: target.and(
              target.type(listItemType),
              target.parent(target.type(taskListType))
            ),
            typeChange: 'preserve-if-allowed',
          }
        ),
      ],
    };
  },
})
  .extend(({ api, editor }) => ({
    read: ({ state }) => {
      /**
       * Returns the nearest li and ul / ol wrapping node entries for a given path
       * (default = selection)
       */
      const getListItemEntry = ({
        at,
      }: {
        at?: Location | null;
      } = {}): { list: ElementEntry; listItem: ElementEntry } | undefined => {
        const liType = editor.getType(KEYS.li);
        const location = at === undefined ? state.selection() : at;

        let _at: Path;

        if (RangeApi.isRange(location) && !RangeApi.isCollapsed(location)) {
          _at = location.focus.path;
        } else if (RangeApi.isRange(location)) {
          _at = location.anchor.path;
        } else {
          _at = location as Path;
        }
        if (_at) {
          const node = state.nodes.get<Element>(_at);

          if (node) {
            const listItem = state.nodes.above<Element>({
              at: _at,
              match: { type: liType },
            });

            if (listItem) {
              const list = state.nodes.parent<Element>(listItem[1]);

              if (!list || !api.getListTypes().includes(list[0].type)) return;

              return { list, listItem };
            }
          }
        }
      };

      /** Searches upward for the root list element */
      const getListRoot = (
        at: Path | Point | Range | null | undefined
      ): ElementEntry | undefined => {
        const location = at === undefined ? state.selection() : at;

        if (!location) return;

        const parentList = state.nodes.above<Element>({
          at: location,
          match: {
            type: api.getListTypes(),
          },
        });

        if (parentList) {
          const [, parentListPath] = parentList;

          return getListRoot(parentListPath) ?? parentList;
        }
      };

      /** Is the list nested, i.e. its parent is a list item. */
      const isListNested = (listPath: Path) => {
        const listParentNode = state.nodes.parent<Element>(listPath)?.[0];

        return listParentNode?.type === editor.getType(KEYS.li);
      };

      return {
        getListItemEntry,
        getListRoot,
        isListNested,
      };
    },
  }))
  .extend(({ api, editor, store }) => ({
    update: ({ tx }) => {
      type MoveListItemUpOptions = {
        list: ElementEntry;
        listItem: ElementEntry;
      };

      /** Move a list item up. */
      const moveListItemUp = ({ list, listItem }: MoveListItemUpOptions) => {
        const move = () => {
          const [listNode, listPath] = list;
          const [liNode, liPath] = listItem;
          const listItemIndex = liPath.at(-1);

          if (listItemIndex === undefined) return;

          const liParent = tx.nodes.above<Element>({
            at: listPath,
            match: { type: editor.getType(KEYS.li) },
          });

          if (!liParent) {
            let toListPath: Path;

            try {
              toListPath = PathApi.next(listPath);
            } catch (_error) {
              return;
            }

            const condA = api.hasListChild(liNode);
            const listParent = tx.nodes.parent<Element>(liPath);
            const condB =
              !!listParent && listItemIndex < listParent[0].children.length - 1;

            if (condA || condB) {
              // Insert a new list next to `list`
              tx.nodes.insert(
                {
                  children: [],
                  type: listNode.type,
                },
                { at: toListPath }
              );
            }
            if (condA) {
              const toListNode = tx.nodes.get<Element>(toListPath)?.[0];

              if (!toListNode) return;

              // Move li sub-lis to the new list
              moveListItemsToList({
                fromListItem: listItem,
                toList: [toListNode, toListPath],
              });
            }
            // If there is siblings li, move them to the new list
            if (condB) {
              const toListNode = tx.nodes.get<Element>(toListPath)?.[0];

              if (!toListNode) return;

              // Move next lis to the new list
              moveListItemsToList({
                deleteFromList: false,
                fromList: list,
                fromStartIndex: listItemIndex + 1,
                toList: [toListNode, toListPath],
              });
            }

            // Finally, unwrap the list
            unwrapList({ at: liPath.concat(0) });

            return true;
          }

          const [, liParentPath] = liParent;

          const toListPath = liPath.concat([1]);

          // If li has next siblings, we need to move them.
          const listParent = tx.nodes.parent<Element>(liPath);

          if (listParent && listItemIndex < listParent[0].children.length - 1) {
            // If li has no sublist, insert one.
            if (!api.hasListChild(liNode)) {
              tx.nodes.insert(
                {
                  children: [],
                  type: listNode.type,
                },
                { at: toListPath }
              );
            }

            const toListNode = tx.nodes.get<Element>(toListPath)?.[0];

            if (!toListNode) return;

            // Move next siblings to li sublist.
            moveListItemsToList({
              deleteFromList: false,
              fromListItem: liParent,
              fromStartIndex: listItemIndex + 1,
              toList: [toListNode, toListPath],
            });
          }

          const movedUpLiPath = PathApi.next(liParentPath);
          const removeSourceList =
            tx.nodes.get<Element>(listPath)?.[0].children.length === 1;

          // Move li one level up: next to the li parent.
          tx.nodes.move({
            at: liPath,
            to: movedUpLiPath,
          });

          if (removeSourceList) {
            tx.nodes.remove({ at: listPath });
          }

          return true;
        };

        return move();
      };

      type MergeListItemIntoListOptions = {
        /**
         * Delete `fromListItem` sublist if true.
         *
         * @default true
         */
        deleteFromList?: boolean;

        /** List items of the list will be moved. */
        fromList?: ElementEntry;

        /** List items of the sublist of this node will be moved. */
        fromListItem?: ElementEntry;

        fromStartIndex?: number;

        to?: Path;

        /** List items will be moved in this list. */
        toList?: ElementEntry;

        /** List position where to move the list items. */
        toListIndex?: number | null;
      };

      /**
       * Move the list items of the sublist of `fromListItem` to `toList` (if
       * `fromListItem` is defined). Move the list items of `fromList` to `toList` (if
       * `fromList` is defined).
       */
      const moveListItemsToList = ({
        deleteFromList = true,
        fromList,
        fromListItem,
        fromStartIndex,
        to: _to,
        toList,
        toListIndex = null,
      }: MergeListItemIntoListOptions) => {
        let fromListPath: Path;
        let moved: boolean | void = false;

        if (fromListItem) {
          const sublistIndex = fromListItem[0].children.findIndex(
            (node) =>
              ElementApi.isElement(node) &&
              api.getListTypes().includes(node.type)
          );

          if (sublistIndex === -1) return;

          fromListPath = fromListItem[1].concat(sublistIndex);
        } else if (fromList) {
          fromListPath = fromList[1];
        } else {
          return;
        }

        let to: Path | null = null;

        if (_to) to = _to;
        if (toList) {
          if (toListIndex === null) {
            to = toList[1].concat([toList[0].children.length]);
          } else {
            to = toList[1].concat([toListIndex]);
          }
        }
        if (!to) return;

        const fromListNode = tx.nodes.get<Element>(fromListPath)?.[0];

        if (!fromListNode) return;

        const childRefs = fromListNode.children
          .map((_, index) => fromListPath.concat(index))
          .slice(fromStartIndex)
          .map((path) =>
            tx.refs.path(path, {
              association: 'forward',
              deletion: 'drop',
            })
          );

        for (const childRef of childRefs.reverse()) {
          const at = childRef.resolve();

          if (at) tx.nodes.move({ at, to });
        }

        moved = childRefs.length > 0;

        // Remove the empty list
        if (deleteFromList) {
          tx.nodes.remove({ at: fromListPath });
        }

        return moved;
      };

      /** If list is not nested and if li is not the first child, move li up. */
      const removeFirstListItem = ({
        list,
        listItem,
      }: {
        list: ElementEntry;
        listItem: ElementEntry;
      }) => {
        const [, listPath] = list;

        if (!tx.listClassic.isListNested(listPath)) {
          moveListItemUp({ list, listItem });

          return true;
        }

        return false;
      };

      type RemoveListItemOptions = {
        list: ElementEntry;
        listItem: ElementEntry;
        reverse?: boolean;
      };

      /** Remove list item and move its sublist to list if any. */
      const removeListItem = ({
        list,
        listItem,
        reverse = true,
      }: RemoveListItemOptions) => {
        const moveSublistItems = ({
          fromListItem,
          start,
          toListItem,
        }: {
          fromListItem: ElementEntry;
          toListItem: ElementEntry;
          start?: boolean;
        }) => {
          const fromSublistIndex = fromListItem[0].children.findIndex(
            (node) =>
              ElementApi.isElement(node) &&
              api.getListTypes().includes(node.type)
          );

          if (fromSublistIndex === -1) return false;

          const fromSublist = fromListItem[0].children[fromSublistIndex];

          if (!ElementApi.isElement(fromSublist)) return false;

          const fromListItemSublist = [
            fromSublist,
            fromListItem[1].concat(fromSublistIndex),
          ] satisfies ElementEntry;
          const toSublistIndex = toListItem[0].children.findIndex(
            (node) =>
              ElementApi.isElement(node) &&
              api.getListTypes().includes(node.type)
          );
          const toSublist = toListItem[0].children[toSublistIndex];
          const toListItemSublist = ElementApi.isElement(toSublist)
            ? ([
                toSublist,
                toListItem[1].concat(toSublistIndex),
              ] satisfies ElementEntry)
            : undefined;
          let to: Path;

          if (toListItemSublist) {
            to = toListItemSublist[1].concat(
              start ? 0 : toListItemSublist[0].children.length
            );
          } else {
            const fromList = tx.nodes.parent<Element>(fromListItem[1]);

            if (!fromList) return false;

            const sublistPath = toListItem[1].concat(1);

            tx.nodes.insert(
              { children: [], type: fromList[0].type },
              { at: sublistPath }
            );
            to = sublistPath.concat(0);
          }

          return moveListItemsToList({
            fromList: fromListItemSublist,
            to,
          });
        };
        const [liNode, liPath] = listItem;

        // Stop if the list item has no sublist
        if (tx.selection.isExpanded() || !api.hasListChild(liNode)) {
          return false;
        }

        const previousLiPath = PathApi.hasPrevious(liPath)
          ? PathApi.previous(liPath)
          : undefined;

        let success = false;
        /**
         * If there is a previous li, we need to move sub-lis to the previous li. As
         * we need to delete first, we will:
         *
         * 1. Insert a temporary li: tempLi
         * 2. Move sub-lis to tempLi
         * 3. Delete
         * 4. Move sub-lis from tempLi to the previous li.
         * 5. Remove tempLi
         */
        if (previousLiPath) {
          const previousLi = tx.nodes.get<Element>(previousLiPath);

          if (!previousLi) return;

          // 1
          let tempLiPath = PathApi.next(liPath);
          tx.nodes.insert(
            {
              children: [
                {
                  children: [{ text: '' }],
                  type: editor.getType(KEYS.lic),
                },
              ],
              ...api.getPropsIfTaskListLiNode({
                inherit: true,
                liNode: previousLi[0],
              }),
              type: editor.getType(KEYS.li),
            },
            { at: tempLiPath }
          );

          const tempLi = tx.nodes.get<Element>(tempLiPath);

          if (!tempLi) return;

          const tempLiRef = tx.refs.path(tempLi[1], {
            association: 'forward',
            deletion: 'drop',
          });

          // 2
          moveSublistItems({
            fromListItem: listItem,
            toListItem: tempLi,
          });

          // 3
          tx.text.delete({ reverse });

          const currentTempLiPath = tempLiRef.resolve();

          if (!currentTempLiPath) return;

          tempLiPath = currentTempLiPath;
          const currentTempLi = tx.nodes.get<Element>(tempLiPath);
          const currentPreviousLi = tx.nodes.get<Element>(previousLiPath);

          if (!currentTempLi || !currentPreviousLi) return;

          // 4
          moveSublistItems({
            fromListItem: currentTempLi,
            toListItem: currentPreviousLi,
          });

          // 5
          tx.nodes.remove({ at: tempLiPath });

          success = true;

          return true;
        }

        // If it's the first li, move the sublist to the parent list
        moveListItemsToList({
          fromListItem: listItem,
          toList: list,
          toListIndex: 1,
        });

        return success;
      };

      const unwrapList = ({ at }: { at?: Path } = {}) => {
        const selection = tx.selection();
        const selectedListItem =
          !at && selection && tx.selection.isCollapsed()
            ? tx.nodes.above<Element>({
                at: selection.focus,
                match: { type: editor.getType(KEYS.li) },
                mode: 'lowest',
              })
            : undefined;

        if (selection && selectedListItem && selectedListItem[1].at(-1) === 0) {
          const list = tx.nodes.parent<Element>(selectedListItem[1]);
          const content = tx.nodes.get<Element>([...selectedListItem[1], 0]);
          const sublist = tx.nodes.get<Element>([...selectedListItem[1], 1]);

          if (list && content && sublist && list[0].children.length > 1) {
            const paragraph = {
              ...content[0],
              type: editor.getType(KEYS.p),
            };
            const nextList = {
              ...list[0],
              children: [...sublist[0].children, ...list[0].children.slice(1)],
            };
            const paragraphPath = list[1];
            const point = {
              offset: selection.focus.offset,
              path: [
                ...paragraphPath,
                ...selection.focus.path.slice(content[1].length),
              ],
            };

            tx.nodes.replace([paragraph, nextList], { at: list[1] });
            tx.selection.set({ anchor: point, focus: point });

            return;
          }
        }

        const ancestorListTypeCheck = () => {
          if (
            tx.nodes.above({
              at,
              match: { type: api.getListTypes() },
            })
          ) {
            return true;
          }
          // The selection's common node might be a list type
          const selection = tx.selection();

          if (!at && selection) {
            const commonPath = PathApi.common(
              selection.anchor.path,
              selection.focus.path
            );
            const commonNode = tx.nodes.get(commonPath);

            if (
              commonNode &&
              ElementApi.isElement(commonNode[0]) &&
              api.getListTypes().includes(commonNode[0].type)
            ) {
              return true;
            }
          }

          return false;
        };

        const unwrap = () => {
          const contentRefs = Array.from(
            tx.nodes.entries<Element>({
              at,
              match: { type: editor.getType(KEYS.lic) },
              mode: 'all',
            }),
            ([, path]) =>
              tx.refs.path(path, {
                association: 'forward',
                deletion: 'nearest',
              })
          );

          do {
            tx.nodes.unwrap({
              at,
              match: { type: editor.getType(KEYS.li) },
              split: true,
            });

            tx.nodes.unwrap({
              at,
              match: {
                type: api.getListTypes(),
              },
              split: true,
            });
          } while (ancestorListTypeCheck());

          for (const ref of contentRefs) {
            const path = ref.resolve();

            if (!path) continue;

            const entry = tx.nodes.get<Element>(path);
            const parent = tx.nodes.parent<Element>(path);

            if (
              entry?.[0].type === editor.getType(KEYS.lic) &&
              parent?.[0].type !== editor.getType(KEYS.li)
            ) {
              tx.nodes.set({ type: editor.getType(KEYS.p) }, { at: path });
            }
          }
        };

        unwrap();
      };

      const moveListItems = ({
        at = tx.selection() ?? undefined,
        enableResetOnShiftTab,
        increase = true,
      }: {
        at?: EditorNodesOptions<Element>['at'];
        enableResetOnShiftTab?: boolean;
        increase?: boolean;
      } = {}) => {
        const moveListItemDown = ({
          list,
          listItem,
        }: {
          list: ElementEntry;
          listItem: ElementEntry;
        }) => {
          const [listNode] = list;
          const [, listItemPath] = listItem;
          const previousListItemPath = PathApi.previous(listItemPath);

          if (!previousListItemPath) return false;

          const previousSiblingItem = tx.nodes.get(previousListItemPath);

          if (!previousSiblingItem) return false;

          const [previousNode, previousPath] = previousSiblingItem;

          if (!ElementApi.isElement(previousNode)) return false;

          const sublist = previousNode.children.find(
            (node): node is Element =>
              ElementApi.isElement(node) &&
              api.getListTypes().includes(node.type)
          );
          const newPath = previousPath.concat(
            sublist ? [1, sublist.children.length] : [1]
          );

          if (!sublist) {
            tx.nodes.wrap(
              { children: [], type: listNode.type },
              { at: listItemPath }
            );
          }

          tx.nodes.move({ at: listItemPath, to: newPath });

          return true;
        };
        const lics = Array.from(
          tx.nodes.entries<Element>({
            at,
            match: { type: editor.getType(KEYS.lic) },
          })
        );

        if (lics.length === 0) return false;

        const highestLicPaths: Path[] = [];

        for (const [, licPath] of lics) {
          const liPath = PathApi.parent(licPath);
          const isNested = highestLicPaths.some((path) =>
            PathApi.isAncestor(PathApi.parent(path), liPath)
          );

          if (!isNested) highestLicPaths.push(licPath);
        }

        const refs = highestLicPaths.map((path) =>
          tx.refs.path(path, {
            association: 'forward',
            deletion: 'drop',
          })
        );
        let moved = false;

        for (const ref of increase ? refs : refs.reverse()) {
          const contentPath = ref.resolve();

          if (!contentPath) continue;

          const listItem = tx.nodes.parent<Element>(contentPath);
          const parentList = listItem
            ? tx.nodes.parent<Element>(listItem[1])
            : undefined;

          if (!listItem || !parentList) continue;

          const itemMoved = increase
            ? moveListItemDown({ list: parentList, listItem })
            : tx.listClassic.isListNested(parentList[1])
              ? moveListItemUp({ list: parentList, listItem })
              : enableResetOnShiftTab
                ? removeFirstListItem({
                    list: parentList,
                    listItem,
                  })
                : false;

          moved = !!itemMoved || moved;
        }

        return moved;
      };
      const move = (increase: boolean) => {
        const selection = tx.selection();

        if (!selection) return false;

        let at = selection;

        if (!tx.selection.isCollapsed()) {
          const { anchor, focus } = RangeApi.isBackward(selection)
            ? {
                anchor: { ...selection.focus },
                focus: { ...selection.anchor },
              }
            : {
                anchor: { ...selection.anchor },
                focus: { ...selection.focus },
              };
          const unhangRange = tx.ranges.unhang({ anchor, focus });

          if (unhangRange) {
            at = SelectionApi.text(unhangRange);
            tx.selection.set(at);
          }
        }

        if (
          !tx.nodes.some({
            at,
            match: { type: editor.getType(KEYS.li) },
          })
        ) {
          return false;
        }

        moveListItems({
          at,
          enableResetOnShiftTab: store.get().enableResetOnShiftTab,
          increase,
        });

        return true;
      };

      return {
        moveListItemUp,
        moveListItemsToList,
        removeFirstListItem,
        removeListItem,
        unwrapList,
        indent: () => move(true),
        outdent: () => move(false),
        toggle: ({ checked = false, type }: ListToggleOptions) => {
          const getPropsIfTaskList = (partial: { checked?: boolean } = {}) =>
            editor.getType(KEYS.taskList) === type
              ? { checked: false, ...partial }
              : undefined;
          const setListType = (
            [list, path]: ElementEntry,
            options: Required<ListToggleOptions>
          ) => {
            const listItemType = editor.getType(KEYS.li);
            const taskListType = editor.getType(KEYS.taskList);
            const listItemPaths = list.children.flatMap((child, index) =>
              ElementApi.isElement(child) && child.type === listItemType
                ? [path.concat(index)]
                : []
            );

            if (list.type === taskListType && options.type !== taskListType) {
              for (const itemPath of listItemPaths) {
                tx.nodes.unset('checked', { at: itemPath });
              }
            }

            tx.nodes.set({ type: options.type }, { at: path });

            if (options.type === taskListType) {
              for (const itemPath of listItemPaths) {
                tx.nodes.set({ checked: options.checked }, { at: itemPath });
              }
            }
          };
          const setListTreeType = (
            at: Location,
            options: Required<ListToggleOptions>
          ) => {
            const listItemType = editor.getType(KEYS.li);
            const taskListType = editor.getType(KEYS.taskList);
            const isTaskListItem = (node: Node, path: Path) =>
              ElementApi.isElement(node) &&
              node.type === listItemType &&
              tx.nodes.parent<Element>(path)?.[0].type === taskListType;

            if (options.type !== taskListType) {
              tx.nodes.unset('checked', {
                at,
                match: isTaskListItem,
                mode: 'all',
              });
            }

            tx.nodes.set(
              { type: options.type },
              {
                at,
                match: { type: api.getListTypes() },
                mode: 'all',
              }
            );

            if (options.type === taskListType) {
              tx.nodes.set(
                { checked: options.checked },
                { at, match: isTaskListItem, mode: 'all' }
              );
            }
          };
          const selection = tx.selection();

          if (!selection) return;

          const { validLiChildren } = editor
            .plugin(BaseListItemPlugin)
            .store.get();
          const validLiChildrenTypes = validLiChildren?.map(({ key }) =>
            editor.getType(key)
          );

          if (tx.selection.isCollapsed() || !tx.selection.isAcrossBlocks()) {
            const res = tx.listClassic.getListItemEntry({ at: selection });

            if (res) {
              if (res.list[0].type === type) {
                unwrapList();
              } else {
                setListType(res.list, { checked, type });
              }

              return;
            }

            tx.nodes.wrap({ children: [], type });

            const nodes = Array.from(
              tx.nodes.entries({ match: { type: editor.getType(KEYS.p) } })
            );
            const blockAbove = tx.nodes.block({
              match: { type: validLiChildrenTypes },
            });

            if (blockAbove) {
              tx.nodes.wrap(
                {
                  children: [],
                  ...getPropsIfTaskList({ checked }),
                  type: editor.getType(KEYS.li),
                },
                { at: blockAbove[1] }
              );

              return;
            }

            tx.nodes.set({ type: editor.getType(KEYS.lic) });

            for (const [, path] of nodes) {
              tx.nodes.wrap(
                {
                  children: [],
                  ...getPropsIfTaskList({ checked }),
                  type: editor.getType(KEYS.li),
                },
                { at: path }
              );
            }

            return;
          }

          const [startPoint, endPoint] = RangeApi.edges(selection);
          const commonEntry = tx.nodes.get(
            PathApi.common(startPoint.path, endPoint.path)
          );

          if (!commonEntry) return;

          if (
            ElementApi.isElement(commonEntry[0]) &&
            (api.getListTypes().includes(commonEntry[0].type) ||
              commonEntry[0].type === editor.getType(KEYS.li))
          ) {
            const startList = tx.nodes.find({
              at: RangeApi.start(selection),
              match: { type: api.getListTypes() },
              mode: 'lowest',
            });
            const endList = tx.nodes.find({
              at: RangeApi.end(selection),
              match: { type: api.getListTypes() },
              mode: 'lowest',
            });

            if (!startList || !endList) return;
            if (
              commonEntry[0].type === type ||
              (ElementApi.isElement(startList[0]) &&
                startList[0].type === type &&
                ElementApi.isElement(endList[0]) &&
                endList[0].type === type)
            ) {
              unwrapList();
              return;
            }

            setListTreeType(selection, { checked, type });

            return;
          }

          const rootPathLength = commonEntry[1].length;
          const nodes = Array.from(
            tx.nodes.entries<Element>({ mode: 'all' })
          ).filter(([, path]) => path.length === rootPathLength + 1);

          for (const [node, path] of nodes) {
            if (api.getListTypes().includes(node.type)) {
              setListTreeType(path, { checked, type });
              continue;
            }

            if (!validLiChildrenTypes?.includes(node.type)) {
              tx.nodes.set({ type: editor.getType(KEYS.lic) }, { at: path });
            }

            tx.nodes.wrap(
              {
                children: [],
                ...getPropsIfTaskList({ checked }),
                type: editor.getType(KEYS.li),
              },
              { at: path }
            );
            tx.nodes.wrap({ children: [], type }, { at: path });
          }
        },
      };
    },
  }))
  .extend(({ api, editor, store }) => {
    return {
      extension: [
        {
          commands: ({ around }) => [
            around(editorCommands.insertBreak, ({ state, next }) => {
              let handled = false;
              const prefix = state.transaction((tx) => {
                const selection = tx.selection();

                if (!selection) return;

                const res = tx.listClassic.getListItemEntry({ at: selection });

                if (res) {
                  const block = tx.nodes.block();

                  if (
                    block &&
                    tx.nodes.isEmpty(block[0]) &&
                    tx.listClassic.moveListItemUp(res)
                  ) {
                    handled = true;
                    return;
                  }
                }

                const listItem = tx.nodes.above({
                  match: { type: editor.getType(KEYS.li) },
                });

                if (listItem && tx.text.string(listItem[1]) === '') {
                  tx.nodes.replace(
                    {
                      children: [{ text: '' }],
                      type: editor.getType(KEYS.p),
                    },
                    { at: listItem[1], select: true }
                  );
                  handled = true;
                  return;
                }

                const liType = editor.getType(KEYS.li);
                const licType = editor.getType(KEYS.lic);
                const licEntry = tx.nodes.above<Element>({
                  match: { type: licType },
                });

                if (!licEntry) return;

                const [, contentPath] = licEntry;
                const listItemEntry = tx.nodes.parent<Element>(contentPath);

                if (!listItemEntry) return;

                const [listItemNode, listItemPath] = listItemEntry;

                if (listItemNode.type !== liType) return;

                const taskProps =
                  'checked' in listItemNode ? { checked: false } : undefined;
                const options = store.get();

                if (!tx.selection.isCollapsed()) {
                  tx.text.delete();
                }

                const isStart = tx.points.isStart(selection.focus, contentPath);
                const isEnd = tx.points.isEnd(selection.focus, contentPath);
                const nextContentPath = PathApi.next(contentPath);
                const nextListItemPath = PathApi.next(listItemPath);

                if (isStart) {
                  if (taskProps && options.inheritCheckStateOnLineStartBreak) {
                    taskProps.checked = listItemNode.checked as boolean;
                  }

                  tx.nodes.insert(
                    {
                      children: [{ children: [{ text: '' }], type: licType }],
                      ...taskProps,
                      type: liType,
                    },
                    { at: listItemPath }
                  );
                  handled = true;
                  return;
                }

                if (isEnd) {
                  if (taskProps && options.inheritCheckStateOnLineEndBreak) {
                    taskProps.checked = listItemNode.checked as boolean;
                  }

                  tx.nodes.insert(
                    {
                      children: [
                        {
                          children: [{ text: '', ...(tx.marks() || {}) }],
                          type: licType,
                        },
                      ],
                      ...taskProps,
                      type: liType,
                    },
                    { at: nextListItemPath }
                  );
                  tx.selection.set(nextListItemPath);
                } else {
                  tx.nodes.split();
                  tx.nodes.wrap(
                    {
                      children: [],
                      ...taskProps,
                      type: liType,
                    },
                    { at: nextContentPath }
                  );
                  tx.nodes.move({
                    at: nextContentPath,
                    to: nextListItemPath,
                  });
                  tx.selection.set(nextListItemPath);
                  tx.selection.collapse({ edge: 'start' });
                }

                if (listItemNode.children.length > 1) {
                  tx.nodes.move({
                    at: nextContentPath,
                    to: nextListItemPath.concat(1),
                  });
                }

                handled = true;
              });

              return handled ? prefix : next.after(prefix);
            }),
          ],
        },
        {
          commands: ({ around }) => [
            around(editorCommands.delete, ({ input, state, next }) => {
              if (input.direction !== 'backward') return next();

              let handled = false;
              const prefix = state.transaction((tx) => {
                const selection = tx.selection();

                if (!selection) return;

                const res = tx.listClassic.getListItemEntry({ at: selection });

                if (
                  !res ||
                  !tx.selection.isAtBlockStart({
                    match: { type: editor.getType(KEYS.li) },
                  })
                ) {
                  return;
                }

                const { list, listItem } = res;

                if (
                  !PathApi.hasPrevious(listItem[1]) &&
                  tx.listClassic.isListNested(list[1])
                ) {
                  const parentListItem = tx.nodes.parent<Element>(list[1]);
                  const currentContent = tx.nodes.get<Element>([
                    ...listItem[1],
                    0,
                  ]);
                  const parentContent = parentListItem
                    ? tx.nodes.get<Element>([...parentListItem[1], 0])
                    : undefined;

                  if (parentListItem && currentContent && parentContent) {
                    const children = [
                      ...structuredClone(parentContent[0].children),
                    ];

                    for (const child of currentContent[0].children) {
                      const previous = children.at(-1);

                      if (
                        previous &&
                        TextApi.isText(previous) &&
                        TextApi.isText(child) &&
                        TextApi.equals(previous, child, { loose: true })
                      ) {
                        children[children.length - 1] = {
                          ...previous,
                          text: previous.text + child.text,
                        };
                      } else {
                        children.push(structuredClone(child));
                      }
                    }

                    const [lastText, lastPath] = NodeApi.last(
                      { ...parentContent[0], children },
                      []
                    );
                    const point = {
                      offset: NodeApi.string(lastText).length,
                      path: [...parentContent[1], ...lastPath],
                    };

                    tx.nodes.replaceChildren(children, {
                      at: parentContent[1],
                      newSelection: {
                        kind: 'text',
                        anchor: point,
                        focus: point,
                      },
                    });
                    tx.nodes.remove({ at: list[1] });
                    handled = true;
                    return;
                  }
                }

                if (tx.listClassic.removeFirstListItem({ list, listItem })) {
                  handled = true;
                  return;
                }
                if (tx.listClassic.removeListItem({ list, listItem })) {
                  handled = true;
                  return;
                }

                if (
                  !PathApi.hasPrevious(listItem[1]) &&
                  !tx.listClassic.isListNested(list[1])
                ) {
                  tx.listClassic.unwrapList({ at: listItem[1] });
                  handled = true;
                  return;
                }

                if (PathApi.hasPrevious(listItem[1])) {
                  const previousListItem = tx.nodes.get<Element>(
                    PathApi.previous(listItem[1])
                  );
                  const previousContent = previousListItem
                    ? tx.nodes.get<Element>([...previousListItem[1], 0])
                    : undefined;
                  const currentContent = tx.nodes.get<Element>([
                    ...listItem[1],
                    0,
                  ]);

                  if (previousContent && currentContent) {
                    const children = [
                      ...structuredClone(previousContent[0].children),
                    ];
                    const [lastText, lastPath] = NodeApi.last(
                      previousContent[0],
                      []
                    );
                    const point = {
                      offset: NodeApi.string(lastText).length,
                      path: [...previousContent[1], ...lastPath],
                    };

                    for (const child of currentContent[0].children) {
                      const previous = children.at(-1);

                      if (
                        previous &&
                        TextApi.isText(previous) &&
                        TextApi.isText(child) &&
                        TextApi.equals(previous, child, { loose: true })
                      ) {
                        children[children.length - 1] = {
                          ...previous,
                          text: previous.text + child.text,
                        };
                      } else {
                        children.push(structuredClone(child));
                      }
                    }

                    tx.nodes.replaceChildren(children, {
                      at: previousContent[1],
                      newSelection: {
                        kind: 'text',
                        anchor: point,
                        focus: point,
                      },
                    });
                    tx.nodes.remove({ at: listItem[1] });
                    handled = true;
                  }
                }
              });

              if (handled) return prefix;

              return next.after(prefix);
            }),
          ],
        },
        {
          commands: ({ around }) => [
            around(editorCommands.delete, ({ input, state, next }) => {
              if (
                input.direction !== 'forward' ||
                !state.selection.isAtBlockEnd()
              ) {
                return next();
              }

              let handled = false;
              const prefix = state.transaction((tx) => {
                const handleOutsideList = (): boolean => {
                  const selection = tx.selection();

                  if (!selection) return false;

                  const pointAfterSelection = tx.points.after(selection.focus);

                  if (pointAfterSelection) {
                    // there is a block after it
                    const nextSiblingListRes = tx.listClassic.getListItemEntry({
                      at: pointAfterSelection,
                    });

                    if (nextSiblingListRes) {
                      // the next block is a list
                      const { listItem } = nextSiblingListRes;
                      const parentBlockEntity = tx.nodes.block({
                        at: selection.anchor,
                      });

                      if (
                        parentBlockEntity &&
                        !tx.text.string(parentBlockEntity[1])
                      ) {
                        // the selected block is empty
                        tx.nodes.remove();

                        return true;
                      }
                      if (api.hasListChild(listItem[0])) {
                        // the next block has children, so we have to move the first item up
                        const sublistRes = tx.listClassic.getListItemEntry({
                          at: [...listItem[1], 1, 0, 0],
                        });

                        if (sublistRes)
                          tx.listClassic.moveListItemUp(sublistRes);
                      }
                    }
                  }

                  return false;
                };

                const handleInsideList = (res: {
                  list: NodeEntry<Element>;
                  listItem: NodeEntry<Element>;
                }): boolean => {
                  const { list, listItem } = res;
                  const listItemIndex = listItem[1].at(-1);

                  if (listItemIndex === undefined) return false;

                  const mergeContent = (
                    from: Element,
                    to: NodeEntry<Element>
                  ) => {
                    const children = [...structuredClone(to[0].children)];

                    for (const child of from.children) {
                      const previous = children.at(-1);

                      if (
                        previous &&
                        TextApi.isText(previous) &&
                        TextApi.isText(child) &&
                        TextApi.equals(previous, child, { loose: true })
                      ) {
                        children[children.length - 1] = {
                          ...previous,
                          text: previous.text + child.text,
                        };
                      } else {
                        children.push(structuredClone(child));
                      }
                    }

                    tx.nodes.replaceChildren(children, { at: to[1] });
                  };

                  const currentContent = tx.nodes.get<Element>([
                    ...listItem[1],
                    0,
                  ]);
                  const currentSublist = tx.nodes.get<Element>([
                    ...listItem[1],
                    1,
                  ]);

                  if (currentContent && currentSublist) {
                    const firstChild = tx.nodes.get<Element>([
                      ...currentSublist[1],
                      0,
                    ]);
                    const firstChildContent = firstChild
                      ? tx.nodes.get<Element>([...firstChild[1], 0])
                      : undefined;

                    if (firstChild && firstChildContent) {
                      mergeContent(firstChildContent[0], currentContent);

                      const childSublist = tx.nodes.get<Element>([
                        ...firstChild[1],
                        1,
                      ]);
                      const replacements = [
                        ...(childSublist?.[0].children ?? []).flatMap(
                          (child) =>
                            ElementApi.isElement(child) ? [child] : []
                        ),
                        ...currentSublist[0].children
                          .slice(1)
                          .flatMap((child) =>
                            ElementApi.isElement(child) ? [child] : []
                          ),
                      ];

                      if (replacements.length > 0) {
                        tx.nodes.replaceChildren(replacements, {
                          at: currentSublist[1],
                        });
                      } else {
                        tx.nodes.remove({ at: currentSublist[1] });
                      }

                      return true;
                    }
                  }

                  if (currentContent) {
                    const pointAfterListItem = tx.points.after(listItem[1]);
                    const nextItem = pointAfterListItem
                      ? tx.listClassic.getListItemEntry({
                          at: pointAfterListItem,
                        })
                      : undefined;
                    const nextContent = nextItem
                      ? tx.nodes.get<Element>([...nextItem.listItem[1], 0])
                      : undefined;
                    const nextSublist = nextItem
                      ? tx.nodes.get<Element>([...nextItem.listItem[1], 1])
                      : undefined;

                    if (
                      nextItem &&
                      nextContent &&
                      PathApi.equals(list[1], nextItem.list[1]) &&
                      !nextSublist
                    ) {
                      mergeContent(nextContent[0], currentContent);
                      tx.nodes.remove({ at: nextItem.listItem[1] });

                      return true;
                    }

                    if (
                      nextItem &&
                      nextContent &&
                      !PathApi.equals(list[1], nextItem.list[1])
                    ) {
                      mergeContent(nextContent[0], currentContent);

                      if (nextSublist) {
                        const children = nextSublist[0].children.flatMap(
                          (child) =>
                            ElementApi.isElement(child) ? [child] : []
                        );

                        tx.nodes.insert(children, {
                          at: [...list[1], listItemIndex + 1],
                        });
                      }

                      tx.nodes.remove({ at: nextItem.listItem[1] });

                      return true;
                    }
                  }

                  // if it has no children
                  if (!api.hasListChild(listItem[0])) {
                    const liType = editor.getType(KEYS.li);
                    const _nodes = tx.nodes.entries({
                      at: listItem[1],
                      mode: 'lowest',
                      match: (node, path) => {
                        if (path.length === 0) {
                          return false;
                        }

                        const isNodeLi =
                          ElementApi.isElement(node) && node.type === liType;
                        const isSiblingOfNodeLi =
                          tx.nodes.get<Element>(PathApi.next(path))?.[0]
                            .type === liType;

                        return isNodeLi && isSiblingOfNodeLi;
                      },
                    });
                    const liWithSiblings = Array.from(
                      _nodes,
                      (entry) => entry[1]
                    )[0];

                    if (!liWithSiblings) {
                      // there are no more list item in the list
                      const pointAfterListItem = tx.points.after(listItem[1]);

                      if (pointAfterListItem) {
                        // there is a block after it
                        const nextSiblingListRes =
                          tx.listClassic.getListItemEntry({
                            at: pointAfterListItem,
                          });

                        if (nextSiblingListRes) {
                          // it is a list so we merge the lists
                          const listRoot = tx.listClassic.getListRoot(
                            listItem[1]
                          );

                          if (!listRoot) return false;

                          tx.listClassic.moveListItemsToList({
                            deleteFromList: true,
                            fromList: nextSiblingListRes.list,
                            toList: listRoot,
                          });

                          return true;
                        }
                      }

                      return false;
                    }

                    const siblingListItem = tx.nodes.get<Element>(
                      PathApi.next(liWithSiblings)
                    );

                    if (!siblingListItem) return false;

                    const siblingList = tx.nodes.parent<Element>(
                      siblingListItem[1]
                    );

                    if (
                      siblingList &&
                      tx.listClassic.removeListItem({
                        list: siblingList,
                        listItem: siblingListItem,
                        reverse: false,
                      })
                    ) {
                      return true;
                    }

                    return false;
                  }

                  // if it has children
                  const nestedList = tx.nodes.get<Element>(
                    PathApi.next([...listItem[1], 0])
                  );

                  if (!nestedList) return false;

                  const nestedListItem = tx.nodes.get<Element>([
                    ...nestedList[1],
                    0,
                  ]);

                  if (!nestedListItem) return false;

                  if (
                    tx.listClassic.removeFirstListItem({
                      list: nestedList,
                      listItem: nestedListItem,
                    })
                  ) {
                    return true;
                  }
                  if (
                    tx.listClassic.removeListItem({
                      list: nestedList,
                      listItem: nestedListItem,
                    })
                  ) {
                    return true;
                  }

                  return false;
                };

                const selection = tx.selection();

                if (!selection) return;

                const res = tx.listClassic.getListItemEntry({ at: selection });

                if (!res) {
                  handled = handleOutsideList();
                  return;
                }

                handled = handleInsideList(res);
              });

              if (handled) return prefix;

              return next.after(prefix);
            }),
          ],
        },
        (() => {
          const getHighestEmptyList = (
            {
              diffListPath,
              liPath,
            }: {
              liPath: Path;
              diffListPath?: Path;
            },
            state: Pick<EditorStateView, 'nodes'>
          ): Path | undefined => {
            const list = state.nodes.above<Element>({
              at: liPath,
              match: { type: api.getListTypes() },
            });

            if (!list) return;

            const [listNode, listPath] = list;

            if (!diffListPath || !PathApi.equals(listPath, diffListPath)) {
              if (listNode.children.length < 2) {
                const liParent = state.nodes.above({
                  at: listPath,
                  match: { type: editor.getType(KEYS.li) },
                });

                if (liParent) {
                  return (
                    getHighestEmptyList(
                      { diffListPath, liPath: liParent[1] },
                      state
                    ) || listPath
                  );
                }
              }

              return liPath;
            }
          };
          const getLiStart = (
            selection: Range,
            state: Pick<EditorStateView, 'nodes' | 'points'>
          ) => {
            const start = state.points.start(selection);

            return start
              ? state.nodes.above({
                  at: start,
                  match: { type: editor.getType(KEYS.li) },
                })
              : undefined;
          };
          return {
            commands: ({ around }) => [
              around(
                editorCommands.deleteFragment,
                ({ input, state, next }) => {
                  const selection =
                    input.at === undefined
                      ? state.selection()
                      : state.ranges.get(input.at);

                  if (
                    !selection ||
                    RangeApi.isCollapsed(selection) ||
                    !state.selection.isAcrossBlocks({ at: selection }) ||
                    !state.nodes.some({
                      at: selection,
                      match: { type: editor.getType(KEYS.li) },
                    })
                  ) {
                    return false;
                  }

                  const end = state.points.end(selection);
                  const liEnd = end
                    ? state.nodes.above<Element>({
                        at: end,
                        match: { type: editor.getType(KEYS.li) },
                      })
                    : undefined;
                  const liStartBeforeDelete = getLiStart(selection, state);

                  if (!liStartBeforeDelete || !liEnd) return false;

                  if (PathApi.isAncestor(liStartBeforeDelete[1], liEnd[1])) {
                    const startContent = state.nodes.get<Element>([
                      ...liStartBeforeDelete[1],
                      0,
                    ]);
                    const endContent = state.nodes.get<Element>([
                      ...liEnd[1],
                      0,
                    ]);

                    if (startContent && endContent) {
                      const children = [
                        ...structuredClone(startContent[0].children),
                      ];

                      for (const child of endContent[0].children) {
                        const previous = children.at(-1);

                        if (
                          previous &&
                          TextApi.isText(previous) &&
                          TextApi.isText(child) &&
                          TextApi.equals(previous, child, { loose: true })
                        ) {
                          children[children.length - 1] = {
                            ...previous,
                            text: previous.text + child.text,
                          };
                        } else {
                          children.push(structuredClone(child));
                        }
                      }

                      const [lastText, lastPath] = NodeApi.last(
                        { ...startContent[0], children },
                        []
                      );
                      const point = {
                        offset: NodeApi.string(lastText).length,
                        path: [...startContent[1], ...lastPath],
                      };

                      return state.transaction((tx) => {
                        tx.nodes.replaceChildren(children, {
                          at: startContent[1],
                          newSelection: {
                            kind: 'text',
                            anchor: point,
                            focus: point,
                          },
                        });
                        tx.nodes.remove({ at: PathApi.parent(liEnd[1]) });
                      });
                    }
                  }

                  const liEndRuntimeId = !api.hasListChild(liEnd[0])
                    ? state.runtime.idAt(liEnd[1])
                    : undefined;
                  const result = next();

                  if (result === false || !liEndRuntimeId) return result;

                  return state.transaction.extend(result, (tx) => {
                    const liEndPath = tx.runtime.pathOf(liEndRuntimeId);
                    const nextSelection = tx.selection();

                    if (!liEndPath || !nextSelection) return;

                    const liStart = getLiStart(nextSelection, tx);
                    const listStart = liStart
                      ? tx.nodes.parent(liStart[1])
                      : undefined;
                    const deletePath = getHighestEmptyList(
                      {
                        diffListPath: listStart?.[1],
                        liPath: liEndPath,
                      },
                      tx
                    );

                    if (deletePath) tx.nodes.remove({ at: deletePath });
                  });
                }
              ),
            ],
          };
        })(),
        (() => {
          const listItemType = editor.getType(KEYS.li);
          const listItemContentType = editor.getType(KEYS.lic);
          const { validLiChildren } = editor
            .plugin(BaseListItemPlugin)
            .store.get();
          const validListItemContentTypes = new Set([
            listItemContentType,
            ...(validLiChildren ?? []).map(({ key }) => editor.getType(key)),
          ]);

          const prepareListRoot = (node: Element): Element => ({
            ...node,
            children: node.children.map((child) =>
              ElementApi.isElement(child) && child.type === listItemType
                ? prepareListItem(child)
                : child
            ),
          });

          const prepareListItem = (node: Element): Element => ({
            ...node,
            children: node.children.map((child) => {
              if (NodeApi.isText(child)) {
                return { children: [child], type: listItemContentType };
              }
              if (api.isListRoot(child)) return prepareListRoot(child);
              if (validListItemContentTypes.has(child.type)) return child;

              return { children: child.children, type: listItemContentType };
            }),
          });

          const preparePastedNode = (node: Descendant): Descendant => {
            if (!ElementApi.isElement(node)) return node;
            if (node.type === listItemType) return prepareListItem(node);
            if (api.isListRoot(node)) return prepareListRoot(node);

            return node;
          };

          const getFirstAncestorOfType = (
            root: Descendant,
            entry: NodeEntry<Descendant>,
            type: string
          ): NodeEntry<Element> => {
            let ancestor: Path = PathApi.parent(entry[1]);

            while (true) {
              const node = NodeApi.get(root, ancestor);

              if (ElementApi.isElement(node) && node.type === type) break;
              ancestor = PathApi.parent(ancestor);
            }

            return [NodeApi.get(root, ancestor) as Element, ancestor];
          };

          const findListItemsWithContent = (first: Element): Element[] => {
            let previous: Element | null = null;
            let node = first;

            while (
              api.isListRoot(node) ||
              (ElementApi.isElement(node) &&
                node.type === listItemType &&
                (node.children as Element[])[0].type !== listItemContentType)
            ) {
              previous = node;
              [node] = node.children as Element[];
            }

            return previous ? (previous.children as Element[]) : [node];
          };

          /**
           * Removes the "empty" leading lis. Empty in this context means lis only with
           * other lis as children.
           *
           * @returns If argument is not a list root, returns it, otherwise returns ul[]
           *   or li[].
           */
          const trimList = (listRoot: Descendant): Element[] => {
            if (!api.isListRoot(listRoot)) {
              return [listRoot as Element];
            }

            const _texts = NodeApi.texts(listRoot);
            const textEntries = Array.from(_texts);

            const commonAncestorEntry = textEntries.reduce(
              (commonAncestor, textEntry) =>
                PathApi.isAncestor(commonAncestor[1], textEntry[1])
                  ? commonAncestor
                  : (NodeApi.common(
                      listRoot,
                      textEntry[1],
                      commonAncestor[1]
                    ) as NodeEntry<Element>),
              // any list item would do, we grab the first one
              getFirstAncestorOfType(listRoot, textEntries[0], listItemType)
            );

            const [first, ...rest] = api.isListRoot(commonAncestorEntry[0])
              ? (commonAncestorEntry[0].children as Element[])
              : [commonAncestorEntry[0]];

            return [...findListItemsWithContent(first), ...rest];
          };

          const wrapNodeIntoListItem = (
            node: Descendant,
            props?: Record<string, unknown>
          ): Element => {
            if (ElementApi.isElement(node) && node.type === listItemType) {
              return prepareListItem(node);
            }

            const child =
              NodeApi.isText(node) ||
              (ElementApi.isElement(node) &&
                !api.isListRoot(node) &&
                !validListItemContentTypes.has(node.type))
                ? {
                    children: NodeApi.isText(node) ? [node] : node.children,
                    type: listItemContentType,
                  }
                : node;

            return {
              children: [child],
              ...props,
              type: listItemType,
            } as Element;
          };

          const sliceElementAtPoint = (
            element: Element,
            relativePath: Path,
            offset: number,
            side: 'after' | 'before'
          ): Element => {
            const sliceNode = (node: Descendant, path: Path): Descendant => {
              if (NodeApi.isText(node)) {
                return {
                  ...node,
                  text:
                    side === 'before'
                      ? node.text.slice(0, offset)
                      : node.text.slice(offset),
                };
              }

              const [index, ...rest] = path;

              if (index === undefined) return structuredClone(node);

              const edgeChild = sliceNode(
                node.children[index] as Descendant,
                rest
              );
              const children =
                side === 'before'
                  ? [...node.children.slice(0, index), edgeChild]
                  : [edgeChild, ...node.children.slice(index + 1)];

              return { ...node, children } as Element;
            };

            return sliceNode(element, relativePath) as Element;
          };

          /**
           * Checks if the fragment only consists of a single LIC in which case it is
           * considered the user's intention was to copy a text, not a list
           */
          const isSingleLic = (fragment: Descendant[]) => {
            const isFragmentOnlyListRoot =
              fragment.length === 1 && api.isListRoot(fragment[0]);

            return (
              isFragmentOnlyListRoot &&
              [...NodeApi.nodes({ children: fragment, type: 'fragment' })]
                .filter((entry): entry is ElementEntry =>
                  ElementApi.isElement(entry[0])
                )
                .filter(([node]) => node.type === listItemContentType)
                .length === 1
            );
          };

          const getTextAndListItemNodes = (
            fragment: Descendant[],
            liEntry: NodeEntry<Element>,
            isEmptyNode: boolean
          ) => {
            const [first, ...rest] = fragment.flatMap(trimList).map((v) =>
              wrapNodeIntoListItem(
                v,
                api.getPropsIfTaskListLiNode({
                  inherit: true,
                  liNode: liEntry[0],
                })
              )
            );
            let sublists: Element[] = [];
            let textNodes: Descendant[];
            let listItemNodes: Element[];

            if (api.isListRoot(fragment[0])) {
              if (isSingleLic(fragment)) {
                textNodes = (first.children[0] as Element)
                  .children as Descendant[];
                listItemNodes = rest as Element[];
              } else if (isEmptyNode) {
                const [newLic, ...newSublists] = first.children as Element[];
                sublists = newSublists;
                textNodes = newLic.children as Descendant[];
                listItemNodes = rest as Element[];
              } else {
                textNodes = [{ text: '' }];
                listItemNodes = [first as Element, ...(rest as Element[])];
              }
            } else {
              textNodes = (first.children[0] as Element)
                .children as Descendant[];
              listItemNodes = rest as Element[];
            }

            return { listItemNodes, sublists, textNodes };
          };

          return {
            commands: ({ around }) => [
              around(editorCommands.replaceSlice, ({ input, state, next }) => {
                const { slice } = input;
                const fragment = [...slice.content].map(preparePastedNode);
                const selection = state.selection();
                const insertionPoint = selection
                  ? RangeApi.edges(selection)[0]
                  : undefined;
                const liEntry = state.nodes.above<Element>({
                  at: insertionPoint,
                  match: { type: listItemType },
                  mode: 'lowest',
                });

                // not inserting into a list item, delegate to other plugins
                if (!liEntry) return next();

                if (
                  selection &&
                  RangeApi.isExpanded(selection) &&
                  api.isListRoot(fragment[0])
                ) {
                  const [start, end] = RangeApi.edges(selection);
                  const startLi = state.nodes.above<Element>({
                    at: start,
                    match: { type: listItemType },
                    mode: 'lowest',
                  });
                  const endLi = state.nodes.above<Element>({
                    at: end,
                    match: { type: listItemType },
                    mode: 'lowest',
                  });
                  const startList = startLi
                    ? state.nodes.parent<Element>(startLi[1])
                    : undefined;
                  const startIndex = startLi?.[1].at(-1);
                  const endIndex = endLi?.[1].at(-1);

                  if (
                    startLi &&
                    endLi &&
                    startList &&
                    startIndex !== undefined &&
                    endIndex !== undefined &&
                    startIndex !== endIndex &&
                    PathApi.equals(startList[1], PathApi.parent(endLi[1]))
                  ) {
                    const prefix = sliceElementAtPoint(
                      startLi[0],
                      start.path.slice(startLi[1].length),
                      start.offset,
                      'before'
                    );
                    const suffix = sliceElementAtPoint(
                      endLi[0],
                      end.path.slice(endLi[1].length),
                      end.offset,
                      'after'
                    );
                    const pastedItems = fragment.flatMap(trimList);
                    const lastPastedItem = pastedItems.at(-1);

                    if (!lastPastedItem) return next();

                    const replacements = [
                      ...(NodeApi.string(prefix) ? [prefix] : []),
                      ...pastedItems,
                      ...(NodeApi.string(suffix) ? [suffix] : []),
                    ];
                    const pastedEndIndex =
                      startIndex +
                      (NodeApi.string(prefix) ? 1 : 0) +
                      pastedItems.length -
                      1;
                    const [lastText, lastPath] = NodeApi.last(
                      lastPastedItem,
                      []
                    );
                    const point = {
                      offset: NodeApi.string(lastText).length,
                      path: [...startList[1], pastedEndIndex, ...lastPath],
                    };

                    return state.transaction((tx) => {
                      tx.nodes.replaceChildren(replacements, {
                        at: startList[1],
                        count: endIndex - startIndex + 1,
                        index: startIndex,
                        newSelection: {
                          kind: 'text',
                          anchor: point,
                          focus: point,
                        },
                      });
                    });
                  }
                }

                const licEntry = state.nodes.above<Element>({
                  at: insertionPoint,
                  match: { type: listItemContentType },
                  mode: 'lowest',
                });

                if (!licEntry) return next();

                const licStart = state.points.start(licEntry[1]);
                const licEnd = state.points.end(licEntry[1]);
                const [selectionStart, selectionEnd] = selection
                  ? RangeApi.edges(selection)
                  : [];
                const isEmptyNode =
                  !NodeApi.string(licEntry[0]) ||
                  (!!licStart &&
                    !!licEnd &&
                    !!selectionStart &&
                    !!selectionEnd &&
                    PointApi.compare(selectionStart, licStart) <= 0 &&
                    PointApi.compare(selectionEnd, licEnd) >= 0);
                const { listItemNodes, sublists, textNodes } =
                  getTextAndListItemNodes(fragment, liEntry, isEmptyNode);
                const continuation = {
                  ...input,
                  slice: ContentSlice.withContent(slice, textNodes, {
                    open: 'closed',
                  }),
                };
                const delegated =
                  selection &&
                  RangeApi.isExpanded(selection) &&
                  !api.isListRoot(fragment[0])
                    ? next.after(
                        state.transaction((tx) => {
                          tx.fragment.delete();
                        }),
                        continuation
                      )
                    : next(continuation);

                if (delegated === false) return false;

                return state.transaction.extend(delegated, (tx) => {
                  const nextLiEntry = tx.nodes.get<Element>(liEntry[1]);

                  if (!nextLiEntry) return;

                  const [, liPath] = nextLiEntry;

                  if (sublists.length > 0) {
                    const li = tx.nodes.get<Element>(liPath)?.[0];
                    const currentSublist = li?.children[1];

                    if (ElementApi.isElement(currentSublist)) {
                      tx.nodes.insert(sublists[0].children as Element[], {
                        at: [...liPath, 1, 0],
                        select: true,
                      });
                    } else {
                      tx.nodes.insert(sublists, {
                        at: [...liPath, 1],
                        select: true,
                      });
                    }
                  }

                  tx.nodes.insert(listItemNodes, {
                    at: PathApi.next(liPath),
                    select: true,
                  });
                });
              }),
            ],
          };
        })(),
        {
          corrections: [
            {
              event: 'content',
              correct({ entry: [node, path], tx }) {
                if (!ElementApi.isElement(node)) {
                  return;
                }

                const mergeAdjacentList = (
                  fromList: ElementEntry,
                  toList: ElementEntry
                ) => {
                  const fromPath = fromList[1];

                  if (fromList[0].children.length === 0) {
                    tx.nodes.remove({ at: fromPath });
                    return;
                  }

                  tx.nodes.move({
                    at: [...fromPath, 0],
                    to: [...toList[1], toList[0].children.length],
                  });
                };
                const listTypes = api.getListTypes();

                if (listTypes.includes(node.type)) {
                  const nextPath = PathApi.next(path);
                  const nextNode = tx.nodes.get<Element>(nextPath);

                  if (nextNode?.[0].type === node.type) {
                    mergeAdjacentList(nextNode, [node, path]);
                    return;
                  }

                  if (PathApi.hasPrevious(path)) {
                    const prevNode = tx.nodes.get<Element>(
                      PathApi.previous(path)
                    );

                    if (prevNode?.[0].type === node.type) {
                      mergeAdjacentList([node, path], prevNode);
                      return;
                    }
                  }
                }
              },
            },
          ],
        },
      ],
    };
  });

export type ListConfig = InferConfig<typeof BaseListPlugin>;

/** Maintain list-specific relationships not expressible by schema grammar. */

const createListRule = createRuleFactory(BaseListPlugin);

export const BulletedListRules = {
  markdown: createListRule<{}, { variant: '*' | '-' }>({
    type: 'blockStart',
    variant: '-',
    enabled: ({ editor, tx }) =>
      !tx.nodes.some({
        match: { type: [editor.getType(KEYS.codeBlock)] },
      }),
    trigger: ' ',
    match: ({ variant }) => variant,
    apply: ({ editor, tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.listClassic.toggle({
        type: editor.getType(KEYS.ulClassic),
      });

      return true;
    },
  }),
};

export const OrderedListRules = {
  markdown: createListRule<{}, { variant: '.' | ')' }>({
    type: 'blockStart',
    variant: '.',
    enabled: ({ editor, tx }) =>
      !tx.nodes.some({
        match: { type: [editor.getType(KEYS.codeBlock)] },
      }),
    trigger: ' ',
    match: ({ variant }) => new RegExp(`^\\d+\\${variant}$`),
    apply: ({ editor, tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.listClassic.toggle({
        type: editor.getType(KEYS.olClassic),
      });

      return true;
    },
  }),
};

export const TaskListRules = {
  markdown: createListRule<{}, { checked: boolean }>({
    type: 'blockStart',
    checked: false,
    enabled: ({ editor, tx }) =>
      !tx.nodes.some({
        match: { type: [editor.getType(KEYS.codeBlock)] },
      }),
    trigger: ' ',
    match: ({ checked }) => (checked ? '[x]' : '[]'),
    apply: ({ editor, checked, tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.listClassic.toggle({
        checked,
        type: editor.getType(KEYS.taskList),
      });

      return true;
    },
  }),
};
