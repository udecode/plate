import React from 'react';

import {
  createBasePlugin,
  createRuleFactory,
  getInjectMatch,
  type InferConfig,
} from '@platejs/core';
import {
  isHtmlBlockElement,
  postCleanHtml,
  traverseHtmlElements,
} from '@platejs/core/internal';
import { BaseIndentPlugin } from '@platejs/indent';
import {
  editorCommands,
  ElementApi,
  PathApi,
  property,
  schema,
  target,
  TextApi,
  type Descendant,
  type EditorCoreStateView,
  type Element,
  type Location,
  type NodeEntry,
  type Path,
} from '@platejs/plite';
import {
  getInternalDocumentChangeRootKeys,
  withEditorUpdateRootScope,
} from '@platejs/plite/internal';
import { KEYS, type TListElement } from '@platejs/utils';
import { isDefined } from '@udecode/utils';
import isEqual from 'lodash/isEqual.js';

export const ListStyleType = {
  ArabicIndic: 'arabic-indic',
  Armenian: 'armenian',
  Bengali: 'bengali',
  Cambodian: 'cambodian',
  Circle: 'circle',
  CjkDecimal: 'cjk-decimal',
  CjkEarthlyBranch: 'cjk-earthly-branch',
  CjkHeavenlyStem: 'cjk-heavenly-stem',
  Decimal: 'decimal',
  DecimalLeadingZero: 'decimal-leading-zero',
  Devanagari: 'devanagari',
  Disc: 'disc',
  DisclosureClosed: 'disclosure-closed',
  DisclosureOpen: 'disclosure-open',
  EthiopicNumeric: 'ethiopic-numeric',
  Georgian: 'georgian',
  Gujarati: 'gujarati',
  Gurmukhi: 'gurmukhi',
  Hebrew: 'hebrew',
  Hiragana: 'hiragana',
  HiraganaIroha: 'hiragana-iroha',
  Inherit: 'inherit',
  Initial: 'initial',
  JapaneseFormal: 'japanese-formal',
  JapaneseInformal: 'japanese-informal',
  Kannada: 'kannada',
  Katakana: 'katakana',
  KatakanaIroha: 'katakana-iroha',
  Khmer: 'khmer',
  KoreanHangulFormal: 'korean-hangul-formal',
  KoreanHanjaFormal: 'korean-hanja-formal',
  KoreanHanjaInformal: 'korean-hanja-informal',
  Lao: 'lao',
  LowerAlpha: 'lower-alpha',
  LowerArmenian: 'lower-armenian',
  LowerGreek: 'lower-greek',
  LowerLatin: 'lower-latin',
  LowerRoman: 'lower-roman',
  Malayalam: 'malayalam',
  Mongolian: 'mongolian',
  Myanmar: 'myanmar',
  None: 'none',
  Oriya: 'oriya',
  Persian: 'persian',
  SimpChineseFormal: 'simp-chinese-formal',
  SimpChineseInformal: 'simp-chinese-informal',
  Square: 'square',
  Tamil: 'tamil',
  Telugu: 'telugu',
  Thai: 'thai',
  Tibetan: 'tibetan',
  TradChineseFormal: 'trad-chinese-formal',
  TradChineseInformal: 'trad-chinese-informal',
  UpperAlpha: 'upper-alpha',
  UpperArmenian: 'upper-armenian',
  UpperLatin: 'upper-latin',
  UpperRoman: 'upper-roman',
} as const;

export type ListStyleType = (typeof ListStyleType)[keyof typeof ListStyleType];

export type IndentListOptions = {
  at?: Location;
  listStyleType?: ListStyleType | (string & {});
};

export type OutdentListOptions = {
  at?: Location;
};

export type ToggleListOptions = {
  at?: Location;
  getSiblingListOptions?: GetSiblingListOptions<Element>;
  listRestart?: number;
  listRestartPolite?: number;
  listStyleType: ListStyleType | (string & {});
};

export const ULIST_STYLE_TYPES = [
  ListStyleType.Disc,
  ListStyleType.Circle,
  ListStyleType.Square,
  ListStyleType.DisclosureOpen,
  ListStyleType.DisclosureClosed,
] as const;

export type GetSiblingListOptions<N extends Element = Element> = {
  breakOnEqIndentNeqListStyleType?: boolean;
  breakOnListRestart?: boolean;
  breakOnLowerIndent?: boolean;
  breakQuery?: (
    siblingNode: Element,
    currentNode: Element
  ) => boolean | undefined;
  getNextEntry?: (
    entry: NodeEntry<Element>,
    state?: Pick<EditorCoreStateView, 'nodes'>
  ) => NodeEntry<N> | undefined;
  getPreviousEntry?: (
    entry: NodeEntry<Element>,
    state?: Pick<EditorCoreStateView, 'nodes'>
  ) => NodeEntry<N> | undefined;
  /** Query to break lookup. */
  eqIndent?: boolean;
  /** Query to validate lookup. If false, check the next sibling. */
  query?: (siblingNode: Element, currentNode: Element) => boolean | undefined;
};

export function isOrderedList(element: Element) {
  return (
    !!element.listStyleType &&
    !ULIST_STYLE_TYPES.some(
      (listStyleType) => listStyleType === element.listStyleType
    )
  );
}

const isListItem = (node: Element) => node[KEYS.listType] != null;

/**
 * All list items are normalized to have a listStart prop indicating their
 * position in the list (unless listStart would be 1, in which case it is
 * omitted).
 *
 * ListRestart causes listStart to restart from the given number, regardless of
 * any previous listStart.
 *
 * ListRestartPolite acts like listRestart, except it only takes effect for list
 * items at the start of a list. When not at the start of a list, this prop is
 * ignored, although it is not removed and may take effect in the future.
 */

export type BaseListPluginOptions = {
  getSiblingListOptions?: GetSiblingListOptions<Element>;
};

export const BaseListPlugin = createBasePlugin({
  api: ({ editor }) => {
    const getSibling = <N extends Element = Element>(
      [node, path]: NodeEntry<Element>,
      {
        breakOnEqIndentNeqListStyleType = true,
        breakOnListRestart = false,
        breakOnLowerIndent = true,
        breakQuery,
        eqIndent = true,
        getNextEntry,
        getPreviousEntry,
        query,
      }: GetSiblingListOptions<N>,
      state: Pick<EditorCoreStateView, 'nodes'> = editor.read
    ): NodeEntry<N> | undefined => {
      if (!getPreviousEntry && !getNextEntry) return;
      const getSiblingEntry = getNextEntry ?? getPreviousEntry!;
      let nextEntry = getSiblingEntry([node, path], state);

      while (nextEntry) {
        const [nextNode, nextPath] = nextEntry;
        const indent = node[KEYS.indent];
        const nextIndent = nextNode[KEYS.indent];

        if (breakQuery?.(nextNode, node)) return;
        if (typeof indent !== 'number' || typeof nextIndent !== 'number')
          return;
        if (
          breakOnListRestart &&
          ((getPreviousEntry && isDefined(node[KEYS.listRestart])) ||
            (getNextEntry && isDefined(nextNode[KEYS.listRestart])))
        ) {
          return;
        }
        if (breakOnLowerIndent && nextIndent < indent) return;
        if (
          breakOnEqIndentNeqListStyleType &&
          nextIndent === indent &&
          nextNode[KEYS.listType] !== node[KEYS.listType]
        ) {
          return;
        }
        if (
          (!query || query(nextNode, node)) &&
          (!eqIndent || nextIndent === indent)
        ) {
          return [nextNode, nextPath];
        }
        nextEntry = getSiblingEntry(nextEntry, state);
      }
    };
    const isHeading = (node: Element) =>
      KEYS.heading.some(
        (headingKey) => node.type === editor.getType(headingKey)
      );
    const isSequenceBoundary = (siblingNode: Element, currentNode: Element) => {
      const siblingListType = siblingNode[KEYS.listType];

      return (
        siblingNode[KEYS.indent] === currentNode[KEYS.indent] &&
        siblingListType != null &&
        siblingListType === currentNode[KEYS.listType] &&
        isHeading(siblingNode) !== isHeading(currentNode)
      );
    };
    const getSequenceSiblingOptions = (
      options?: Partial<GetSiblingListOptions<Element>>
    ): Partial<GetSiblingListOptions<Element>> => {
      const { breakQuery, query, ...rest } = options ?? {};

      return {
        ...rest,
        breakQuery: (siblingNode, currentNode) =>
          isSequenceBoundary(siblingNode, currentNode) ||
          !!breakQuery?.(siblingNode, currentNode),
        query: (siblingNode, currentNode) =>
          siblingNode[KEYS.listType] === currentNode[KEYS.listType] &&
          isHeading(siblingNode) === isHeading(currentNode) &&
          (query ? !!query(siblingNode, currentNode) : true),
      };
    };

    return {
      /** Get the next indent-list item. */
      getNext: <N extends Element = Element>(
        entry: NodeEntry<Element>,
        options?: Partial<GetSiblingListOptions<N>>,
        state: Pick<EditorCoreStateView, 'nodes'> = editor.read
      ): NodeEntry<N> | undefined =>
        getSibling(
          entry,
          {
            getNextEntry: ([, currentPath]) => {
              const nextPath = PathApi.next(currentPath);
              const nextNode = state.nodes.get<N>(nextPath)?.[0];

              if (!nextNode) return;

              return [nextNode, nextPath];
            },
            ...options,
            getPreviousEntry: undefined,
          },
          state
        ),
      /** Get the previous indent-list item. */
      getPrevious: <N extends Element = Element>(
        entry: NodeEntry<Element>,
        options?: Partial<GetSiblingListOptions<N>>,
        state: Pick<EditorCoreStateView, 'nodes'> = editor.read
      ): NodeEntry<N> | undefined =>
        getSibling(
          entry,
          {
            getPreviousEntry: ([, currentPath]) => {
              if (!PathApi.hasPrevious(currentPath)) return;
              const previousPath = PathApi.previous(currentPath);
              const previousNode = state.nodes.get<N>(previousPath)?.[0];

              if (!previousNode) return;

              return [previousNode, previousPath];
            },
            ...options,
            getNextEntry: undefined,
          },
          state
        ),
      expandItemsWithChildren: <N extends Element = Element>(
        entries: readonly NodeEntry<N>[]
      ) => {
        const expandedEntries: NodeEntry<N>[] = [];
        const processedIds = new Set<string>();

        entries.forEach((entry) => {
          const [node, path] = entry;
          const id = typeof node.id === 'string' ? node.id : undefined;

          if (id && processedIds.has(id)) return;
          expandedEntries.push(entry);
          if (id) processedIds.add(id);
          const parentIndent = node[KEYS.indent];

          if (
            typeof parentIndent !== 'number' ||
            !isDefined(node[KEYS.listType])
          ) {
            return;
          }
          let currentPath = path;

          while (true) {
            const nextPath = PathApi.next(currentPath);
            const nextNode = editor.read.nodes.get<N>(nextPath)?.[0];

            if (!nextNode) break;
            const nextIndent = nextNode[KEYS.indent];

            if (
              typeof nextIndent !== 'number' ||
              !isDefined(nextNode[KEYS.listType]) ||
              nextIndent <= parentIndent
            ) {
              break;
            }
            const childId =
              typeof nextNode.id === 'string' ? nextNode.id : undefined;

            if (!childId || !processedIds.has(childId)) {
              expandedEntries.push([nextNode, nextPath]);
              if (childId) processedIds.add(childId);
            }
            currentPath = nextPath;
          }
        });

        return expandedEntries;
      },
      getSequenceSiblingOptions,
      isActive: (
        style: ListStyleType | string | readonly string[]
      ): boolean => {
        const selection = editor.read.selection();

        if (!selection) return false;
        const styles = Array.isArray(style) ? style : [style];

        return editor.read.nodes.some({
          match: (node) => {
            if (!ElementApi.isElement(node)) return false;
            const isTodo = Object.hasOwn(node, KEYS.listChecked);

            return (
              styles.includes(node[KEYS.listType] as string) &&
              (styles.includes(KEYS.listTodo) ? isTodo : !isTodo)
            );
          },
        });
      },
      isSequenceBoundary,
    };
  },
  dependencies: [BaseIndentPlugin],
  key: KEYS.list,
  options: {} as BaseListPluginOptions,
  schema: ({ plugins, targetPluginKeys }) => ({
    properties: [
      schema.elementProperty(KEYS.listChecked, property.boolean(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(KEYS.listRestart, property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(KEYS.listRestartPolite, property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(KEYS.listStart, property.number(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(KEYS.listType, property.string(), {
        target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        typeChange: 'preserve-if-allowed',
      }),
    ],
  }),
  targetPluginKeys: [KEYS.p],
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        createsElement: true,
        decode: ({ element }) => {
          const listParent = element.closest('ul, ol') as HTMLElement | null;
          const readNumber = (value: null | string | undefined) => {
            if (!value) return;
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : undefined;
          };
          const checkedValue = element.dataset.checked;
          const checked =
            checkedValue === '' || checkedValue === 'true'
              ? true
              : checkedValue === 'false'
                ? false
                : undefined;
          const listRestart = readNumber(element.dataset.listRestart);
          const listRestartPolite = readNumber(
            element.dataset.listRestartPolite
          );
          const explicitListStart = readNumber(element.dataset.listStart);
          const parentListStart = readNumber(listParent?.getAttribute('start'));
          const listIndex = listParent
            ? [...listParent.children]
                .filter((child) => child.tagName === 'LI')
                .indexOf(element)
            : -1;
          const listStart =
            explicitListStart ??
            (parentListStart === undefined || listIndex < 0
              ? undefined
              : parentListStart + listIndex);
          const listStyleType =
            element.dataset.listStyleType ||
            element.style.listStyleType ||
            listParent?.style.listStyleType ||
            (listParent?.tagName === 'UL'
              ? ListStyleType.Disc
              : listParent?.tagName === 'OL'
                ? ListStyleType.Decimal
                : undefined);
          return {
            ...(checked === undefined
              ? {}
              : {
                  [KEYS.listChecked]: checked,
                }),
            ...(listRestart === undefined
              ? {}
              : {
                  [KEYS.listRestart]: listRestart,
                }),
            ...(listRestartPolite === undefined
              ? {}
              : {
                  [KEYS.listRestartPolite]: listRestartPolite,
                }),
            ...(listStart === undefined
              ? {}
              : {
                  [KEYS.listStart]: listStart,
                }),
            ...(listStyleType
              ? {
                  [KEYS.listType]: listStyleType,
                }
              : {}),
          };
        },
        encode: ({ content, node }) => {
          const checked = node[KEYS.listChecked];
          const listRestart = node[KEYS.listRestart];
          const listRestartPolite = node[KEYS.listRestartPolite];
          const listStart = node[KEYS.listStart];
          const listStyleType = node[KEYS.listType];
          return {
            attributes: {
              start: listStart,
            },
            children: [
              {
                attributes: {
                  'data-checked':
                    checked === undefined ? undefined : String(checked),
                  'data-list-restart': listRestart,
                  'data-list-restart-polite': listRestartPolite,
                  'data-list-start': listStart,
                  'data-list-style-type': listStyleType,
                },
                children: content,
                patchTarget: true,
                tag: 'li',
              },
            ],
            style: {
              listStyleType,
            },
            tag: isOrderedList(node) ? 'ol' : 'ul',
          };
        },
        match: [
          {
            tag: 'li',
          },
        ],
        priority: 40,
      },
    }),

  parsers: {
    html: {
      transformData: ({ data }) => {
        const document = new DOMParser().parseFromString(data, 'text/html');
        const { body } = document;

        // First pass: flatten nested UL/OL that are inside LI elements
        // We need to move them to be siblings of their parent LI
        const lisWithNestedLists: {
          li: globalThis.Element;
          nestedLists: globalThis.Element[];
        }[] = [];
        traverseHtmlElements(body, (element) => {
          if (element.tagName === 'LI') {
            const nestedLists: globalThis.Element[] = [];
            // Find nested UL/OL elements
            Array.from(element.children).forEach((child) => {
              if (child.tagName === 'UL' || child.tagName === 'OL') {
                nestedLists.push(child);
              }
            });
            if (nestedLists.length > 0) {
              lisWithNestedLists.push({
                li: element,
                nestedLists,
              });
            }
          }
          return true;
        });

        // Move nested lists to be after their parent LI
        lisWithNestedLists.forEach(({ li, nestedLists }) => {
          nestedLists.forEach((nestedList) => {
            // Remove the nested list from inside the LI
            nestedList.remove();
            // Insert it after the LI in the parent container
            if (li.parentNode) {
              li.parentNode.insertBefore(nestedList, li.nextSibling);
            }
          });
        });

        // Second pass: process LI elements (now without nested lists inside them)
        traverseHtmlElements(body, (element) => {
          if (element.tagName === 'LI') {
            const htmlElement = element as HTMLElement;
            const { childNodes } = element;

            // Process li children and flatten block elements
            const liChildren: globalThis.Node[] = [];
            childNodes.forEach((child) => {
              if (child.nodeType === Node.ELEMENT_NODE) {
                const childElement = child as globalThis.Element;
                if (isHtmlBlockElement(childElement)) {
                  // Replace block elements (e.g. p) with their children
                  liChildren.push(...childElement.childNodes);
                  return;
                }
              }
              liChildren.push(child);
            });
            element.replaceChildren(...liChildren);

            // Keep explicit codec metadata, then honor Google Docs.
            const dataIndent = htmlElement.dataset.indent;
            const ariaLevel = element.getAttribute('aria-level');
            if (dataIndent) {
              htmlElement.dataset.indent = dataIndent;
            } else if (ariaLevel) {
              htmlElement.dataset.indent = ariaLevel;
            } else if (!htmlElement.style.marginLeft) {
              // Calculate indent level based on nested UL/OL parents
              let indent = 0;
              let parent = element.parentElement;
              while (parent && parent !== body) {
                if (parent.tagName === 'UL' || parent.tagName === 'OL') {
                  indent++;
                }
                parent = parent.parentElement;
              }

              // Set indent level as data attribute
              if (indent > 0) {
                htmlElement.dataset.indent = String(indent);
              }
            }

            // Set list style type from inline style or parent list type
            const listStyleType = htmlElement.style.listStyleType;
            if (listStyleType) {
              htmlElement.dataset.listStyleType = listStyleType;
            } else {
              // Fallback to parent list type
              const listParent = element.closest('ul, ol');
              if (listParent) {
                const parentListStyleType = (listParent as HTMLElement).style
                  .listStyleType;
                if (parentListStyleType) {
                  htmlElement.dataset.listStyleType = parentListStyleType;
                } else if (listParent.tagName === 'UL') {
                  htmlElement.dataset.listStyleType = 'disc';
                } else if (listParent.tagName === 'OL') {
                  htmlElement.dataset.listStyleType = 'decimal';
                }
              }
            }
            return false;
          }
          return true;
        });
        return postCleanHtml(body.innerHTML);
      },
    },
  },
  render: {
    belowNodes: (props) => {
      if (!props.element.listStyleType) return;
      return (props) => {
        const { listStart, listStyleType } = props.element as TListElement;
        const List = isOrderedList(props.element) ? 'ol' : 'ul';
        return (
          <List
            style={{
              listStyleType,
              margin: 0,
              padding: 0,
              position: 'relative',
            }}
            start={listStart}
          >
            <li>{props.children}</li>
          </List>
        );
      };
    },
  },
  rules: {
    break: {
      empty: 'reset',
      splitReset: false,
    },
    delete: {
      start: 'reset',
    },
    merge: {
      removeEmpty: false,
    },
    match: ({ node }) => isDefined(node[KEYS.listType]),
  },
})
  .extend(({ plugin }) => ({
    override: {
      plugins: {
        [KEYS.indent]: {
          targetPluginKeys: plugin.targetPluginKeys,
        },
      },
    },
  }))
  .extend<{
    update: {
      indent: (options?: IndentListOptions) => void;
      outdent: (options?: OutdentListOptions) => void;
      toggle: (options: ToggleListOptions) => void;
    };
  }>(({ api, editor, getOptions }) => ({
    update: ({ tx }) => ({
      indent: ({
        listStyleType = ListStyleType.Disc,
        ...options
      }: IndentListOptions = {}) => {
        tx.indent.set({
          nodes: {
            at: options.at,
          },
          offset: 1,
          setNodeProps: () => ({
            [KEYS.listType]: listStyleType,
          }),
        });
      },
      outdent: (options: OutdentListOptions = {}) => {
        tx.indent.set({
          nodes: {
            at: options.at,
          },
          offset: -1,
          unsetNodeProps: [
            KEYS.listType,
            KEYS.listChecked,
            KEYS.listRestart,
            KEYS.listRestartPolite,
            KEYS.listStart,
          ],
        });
      },
      toggle: (options: ToggleListOptions) => {
        const {
          at = tx.selection(),
          listRestart,
          listRestartPolite,
          listStyleType,
        } = options;
        if (!at || (PathApi.isPath(at) && at.length === 0)) return;
        const mergedGetSiblingListOptions = {
          ...getOptions().getSiblingListOptions,
          ...options.getSiblingListOptions,
        };
        const match = getInjectMatch(
          editor,
          editor.getPlugin({
            key: KEYS.list,
          })
        );
        const entries = tx.nodes.toArray<Element>({
          at,
          match: (node, path) =>
            ElementApi.isElement(node) &&
            tx.schema.isBlock(node) &&
            match(node, path),
          mode: 'lowest',
        });
        if (entries.length === 0) return;

        /**
         * True - One or more blocks were converted to lists or changed such that
         * they remain lists.
         *
         * False - One or more list blocks were unset.
         *
         * Null - No action was taken.
         */
        const setList = ((): boolean | null => {
          if (entries.length === 1) {
            const entry = entries[0];
            const [node, path] = entry;
            const indent = Number(node[KEYS.indent] ?? 0);
            const isTodo = listStyleType === KEYS.listTodo;
            if (
              !Object.hasOwn(node, KEYS.listChecked) &&
              !node[KEYS.listType]
            ) {
              tx.nodes.set(
                {
                  [KEYS.indent]: indent + 1,
                  ...(isTodo
                    ? {
                        [KEYS.listChecked]: false,
                      }
                    : {}),
                  [KEYS.listType]: listStyleType,
                },
                {
                  at: path,
                }
              );
              return true;
            }
            if (
              (isTodo && Object.hasOwn(node, KEYS.listChecked)) ||
              listStyleType === node[KEYS.listType]
            ) {
              tx.nodes.unset(isTodo ? KEYS.listChecked : KEYS.listType, {
                at: path,
              });
              if (indent > 1) {
                tx.nodes.set(
                  {
                    [KEYS.indent]: indent - 1,
                  },
                  {
                    at: path,
                  }
                );
              } else {
                tx.nodes.unset([KEYS.indent, KEYS.listChecked, KEYS.listType], {
                  at: path,
                });
              }
              return false;
            }
            const siblings: NodeEntry<Element>[] = [];
            let siblingEntry: NodeEntry<Element> | undefined = entry;
            while (siblingEntry) {
              siblingEntry = api.getPrevious(
                siblingEntry,
                mergedGetSiblingListOptions,
                tx
              );
              if (siblingEntry) siblings.push(siblingEntry);
            }
            siblings.push(entry);
            siblingEntry = entry;
            while (siblingEntry) {
              siblingEntry = api.getNext(
                siblingEntry,
                mergedGetSiblingListOptions,
                tx
              );
              if (siblingEntry) siblings.push(siblingEntry);
            }
            siblings.forEach(([sibling, siblingPath]) => {
              const siblingIndent =
                (sibling[KEYS.indent] as number | undefined) ?? 0;
              if (isTodo) {
                tx.nodes.unset(KEYS.listType, {
                  at: siblingPath,
                });
                tx.nodes.set(
                  {
                    [KEYS.indent]: siblingIndent || siblingIndent + 1,
                    [KEYS.listChecked]: false,
                    [KEYS.listType]: listStyleType,
                  },
                  {
                    at: siblingPath,
                  }
                );
                return;
              }
              tx.nodes.unset(KEYS.listChecked, {
                at: siblingPath,
              });
              tx.nodes.set(
                {
                  [KEYS.indent]: siblingIndent || siblingIndent + 1,
                  [KEYS.listType]: listStyleType,
                },
                {
                  at: siblingPath,
                }
              );
            });
            return true;
          }
          if (entries.length > 1) {
            const eqListStyleType = entries.every(([block]) =>
              listStyleType === KEYS.listTodo
                ? Object.hasOwn(block, KEYS.listChecked)
                : !!block[KEYS.listType] &&
                  block[KEYS.listType] === listStyleType
            );
            if (eqListStyleType) {
              entries.forEach(([node, path]) => {
                const indent = node[KEYS.indent] as number;
                tx.nodes.unset(KEYS.listType, {
                  at: path,
                });
                if (indent > 1) {
                  tx.nodes.set(
                    {
                      [KEYS.indent]: indent - 1,
                    },
                    {
                      at: path,
                    }
                  );
                } else {
                  tx.nodes.unset([KEYS.indent, KEYS.listChecked], {
                    at: path,
                  });
                }
              });
              return false;
            }
            entries.forEach(([node, path]) => {
              const currentIndent =
                (node[KEYS.indent] as number | undefined) ?? 0;
              const indent =
                node[KEYS.listType] || Object.hasOwn(node, KEYS.listChecked)
                  ? currentIndent
                  : currentIndent + 1;
              if (listStyleType === KEYS.listTodo) {
                tx.nodes.unset(KEYS.listType, {
                  at: path,
                });
                tx.nodes.set(
                  {
                    [KEYS.indent]: indent || indent + 1,
                    [KEYS.listChecked]: false,
                    [KEYS.listType]: listStyleType,
                  },
                  {
                    at: path,
                  }
                );
                return;
              }
              tx.nodes.unset(KEYS.listChecked, {
                at: path,
              });
              tx.nodes.set(
                {
                  [KEYS.indent]: indent || indent + 1,
                  [KEYS.listType]: listStyleType,
                },
                {
                  at: path,
                }
              );
            });
            return true;
          }
          return null;
        })();
        const restartValue = listRestart || listRestartPolite;
        const isRestart = !!listRestart;
        if (setList && restartValue) {
          const [targetNode, targetPath] = entries[0];
          const entry = tx.nodes.above<Element>({
            at: targetPath,
            match: (candidate) =>
              ElementApi.isElement(candidate) &&
              candidate[KEYS.listType] !== undefined,
          }) ?? [
            {
              ...targetNode,
              [KEYS.indent]:
                Number(targetNode[KEYS.indent] ?? 0) +
                (targetNode[KEYS.listType] ? 0 : 1),
              [KEYS.listType]: listStyleType,
            },
            targetPath,
          ];
          const isFirst = !api.getPrevious(
            entry,
            api.getSequenceSiblingOptions({
              breakOnEqIndentNeqListStyleType: false,
              ...mergedGetSiblingListOptions,
            }),
            tx
          );

          /**
           * Only apply listRestartPolite if this is the first item and
           * restartValue > 1.
           */
          if (!isRestart && (!isFirst || restartValue <= 0)) return;

          // If restartValue is 1, only apply listRestart if this is not the first
          if (isRestart && restartValue === 1 && isFirst) return;
          const prop = isRestart ? KEYS.listRestart : KEYS.listRestartPolite;
          tx.nodes.set(
            {
              [prop]: restartValue,
            },
            {
              at: entry[1],
            }
          );
        }
      },
    }),
  }))
  .extend((context) => {
    const { editor, getOptions } = context;
    const changeGuard = new WeakSet<object>();
    const getListExpectedListStart = (
      entry: NodeEntry<Element>,
      previousEntry?: NodeEntry<Element>
    ) => {
      const [node] = entry;
      const [previousNode] = previousEntry ?? [null];
      const restart = (node[KEYS.listRestart] as number | null) ?? null;
      const politeRestart =
        (node[KEYS.listRestartPolite] as number | null) ?? null;
      if (restart) return restart;
      if (politeRestart && !previousNode) return politeRestart;
      return previousNode
        ? ((previousNode[KEYS.listStart] as number) ?? 1) + 1
        : 1;
    };
    const getSequenceKey = (node: Element) => {
      const isHeading = KEYS.heading.some(
        (headingKey) => node.type === editor.getType(headingKey)
      );
      return `${node[KEYS.indent]}:${node[KEYS.listType]}:${isHeading}`;
    };
    const resolveAmbiguousListStyleType = (
      listStyleType: unknown,
      previousListStyleType: unknown
    ) => {
      if (
        previousListStyleType === ListStyleType.LowerAlpha &&
        listStyleType === ListStyleType.LowerRoman
      ) {
        return ListStyleType.LowerAlpha;
      }
      if (
        previousListStyleType === ListStyleType.UpperAlpha &&
        listStyleType === ListStyleType.UpperRoman
      ) {
        return ListStyleType.UpperAlpha;
      }
      return listStyleType;
    };
    const getListStartUpdate = (
      state: Pick<EditorCoreStateView, 'nodes'>,
      entry: NodeEntry<Element>,
      options?: Partial<GetSiblingListOptions<Element>>,
      previousEntry?: NodeEntry<Element> | null
    ) => {
      const [node] = entry;
      const listStyleType = node[KEYS.listType];
      const listStart = node[KEYS.listStart] as number | undefined;
      if (typeof listStyleType !== 'string') return;
      if (
        ULIST_STYLE_TYPES.some(
          (unorderedListStyleType) => unorderedListStyleType === listStyleType
        )
      ) {
        return isDefined(listStart)
          ? ({
              type: 'unset',
            } as const)
          : undefined;
      }
      const resolvedPreviousEntry =
        previousEntry === undefined
          ? context.api.getPrevious(
              entry,
              context.api.getSequenceSiblingOptions({
                breakOnEqIndentNeqListStyleType: false,
                ...options,
              }),
              state
            )
          : (previousEntry ?? undefined);
      const expectedListStart = getListExpectedListStart(
        entry,
        resolvedPreviousEntry
      );
      if (isDefined(listStart) && expectedListStart === 1) {
        return {
          type: 'unset',
        } as const;
      }
      if (listStart !== expectedListStart && expectedListStart > 1) {
        return {
          type: 'set',
          value: expectedListStart,
        } as const;
      }
    };
    return {
      extension: {
        commands: ({ around, handle }) => [
          handle(editorCommands.delete, ({ input, state }) => {
            if (input.direction !== 'backward') return false;
            const nodeEntry = state.nodes.block<Element>();
            const selection = state.selection();
            const blockStart = nodeEntry
              ? state.points.start(nodeEntry[1])
              : undefined;
            const isAtBlockStart =
              !!nodeEntry &&
              !!selection &&
              (state.points.isStart(selection.anchor, nodeEntry[1]) ||
                (!!blockStart &&
                  state.text.string({
                    anchor: blockStart,
                    focus: selection.anchor,
                  }) === ''));
            if (
              !nodeEntry ||
              !selection ||
              !nodeEntry[0][KEYS.listType] ||
              state.selection.isExpanded() ||
              !isAtBlockStart
            ) {
              return false;
            }
            return state.transaction((tx) => {
              tx.list.outdent({
                at: nodeEntry[1],
              });
            });
          }),
          around(editorCommands.insertBreak, ({ state, next }) => {
            const nodeEntry = state.nodes.block<Element>();
            const selection = state.selection();
            if (
              !nodeEntry ||
              !selection ||
              !nodeEntry[0][KEYS.listType] ||
              state.selection.isExpanded()
            ) {
              return false;
            }
            if (state.nodes.isEmpty(nodeEntry[0])) {
              return state.transaction((tx) => {
                tx.list.outdent({
                  at: nodeEntry[1],
                });
              });
            }
            const inserted = next();
            if (inserted === false) return false;
            return state.transaction.extend(inserted, (tx) => {
              const nextPath = PathApi.next(nodeEntry[1]);
              const nextNode = tx.nodes.get<Element>(nextPath)?.[0];
              const staleRestartKeys = [
                KEYS.listRestart,
                KEYS.listRestartPolite,
              ].filter((key) => nextNode && Object.hasOwn(nextNode, key));
              if (staleRestartKeys.length > 0) {
                tx.nodes.unset(staleRestartKeys, {
                  at: nextPath,
                });
              }
            });
          }),
          around(editorCommands.insertBreak, ({ state, next }) => {
            const nodeEntry = state.nodes.block<Element>();
            if (!nodeEntry) return false;
            const [node, path] = nodeEntry;
            const selection = state.selection();
            if (
              node[KEYS.listType] !== KEYS.listTodo ||
              !selection ||
              state.selection.isExpanded() ||
              !state.points.isEnd(selection.focus, path)
            ) {
              return false;
            }
            const result = next();
            if (result === false) return false;
            return state.transaction.extend(result, (tx) => {
              const newEntry = tx.nodes.above<Element>();
              if (newEntry) {
                tx.nodes.set(
                  {
                    checked: false,
                  },
                  {
                    at: newEntry[1],
                  }
                );
              }
            });
          }),
        ],
        key: 'behavior',
        priority: 100,
        onTransactionChange({ after, before, change, changed, tx }) {
          if (editor.runtime.isNormalizing || changeGuard.has(tx)) return;
          changeGuard.add(tx);
          try {
            const { getSiblingListOptions } = getOptions();
            const roots = new Set<string | null>([
              ...getInternalDocumentChangeRootKeys(change).map((root) =>
                root === 'main' ? null : root
              ),
              ...change.createRoots,
            ]);
            for (const root of roots) {
              const namedRoot = root ?? undefined;
              const propertiesChanged = changed.has('properties', namedRoot);
              const structureChanged = changed.has('structure', namedRoot);
              if (!propertiesChanged && !structureChanged) continue;
              const beforeChildren = (
                root === null ? before.children : (before.roots?.[root] ?? [])
              ) as readonly Descendant[];
              const afterChildren = (
                root === null ? after.children : (after.roots?.[root] ?? [])
              ) as readonly Descendant[];
              const paths = changed.paths(namedRoot);
              const insertedIndices = new Set<number>();
              if (structureChanged) {
                const ranges = changed.topLevelRanges(namedRoot);
                const windows =
                  ranges.length > 0
                    ? ranges
                    : [
                        {
                          after:
                            afterChildren.length > 0
                              ? ([0, afterChildren.length - 1] as const)
                              : null,
                          before:
                            beforeChildren.length > 0
                              ? ([0, beforeChildren.length - 1] as const)
                              : null,
                        },
                      ];
                const getStructuralKey = (value: unknown): string => {
                  if (Array.isArray(value)) {
                    return `[${value.map(getStructuralKey).join(',')}]`;
                  }
                  if (value && typeof value === 'object') {
                    return `{${Object.keys(value)
                      .sort()
                      .map(
                        (key) =>
                          `${JSON.stringify(key)}:${getStructuralKey((value as Record<string, unknown>)[key])}`
                      )
                      .join(',')}}`;
                  }
                  return JSON.stringify(value) ?? 'undefined';
                };
                for (const range of windows) {
                  if (!range.after) continue;
                  const beforeIndices = range.before
                    ? Array.from(
                        {
                          length: range.before[1] - range.before[0] + 1,
                        },
                        (_, offset) => range.before![0] + offset
                      )
                    : [];
                  const afterIndices = Array.from(
                    {
                      length: range.after[1] - range.after[0] + 1,
                    },
                    (_, offset) => range.after![0] + offset
                  );
                  const availableBefore = new Set(beforeIndices);
                  const unmatchedAfter = new Set(afterIndices);
                  const claimByKey = (
                    keyOf: (node: Descendant) => object | string | undefined
                  ) => {
                    const beforeByKey = new Map<object | string, number[]>();
                    for (const beforeIndex of availableBefore) {
                      const key = keyOf(beforeChildren[beforeIndex]!);
                      if (key === undefined) continue;
                      const candidates = beforeByKey.get(key) ?? [];
                      candidates.push(beforeIndex);
                      beforeByKey.set(key, candidates);
                    }
                    for (const afterIndex of unmatchedAfter) {
                      const key = keyOf(afterChildren[afterIndex]!);
                      const beforeIndex =
                        key === undefined
                          ? undefined
                          : beforeByKey.get(key)?.shift();
                      if (beforeIndex === undefined) continue;
                      availableBefore.delete(beforeIndex);
                      unmatchedAfter.delete(afterIndex);
                    }
                  };
                  claimByKey((node) => node);
                  claimByKey((node) => {
                    const id = (node as Record<string, unknown>).id;
                    return id === undefined
                      ? undefined
                      : `${ElementApi.isElement(node) ? node.type : 'text'}:${String(id)}`;
                  });
                  claimByKey(getStructuralKey);
                  for (const afterIndex of [...unmatchedAfter]) {
                    if (!availableBefore.has(afterIndex)) continue;
                    const afterNode = afterChildren[afterIndex]!;
                    const beforeNode = beforeChildren[afterIndex]!;
                    const sameNodeKind = TextApi.isText(afterNode)
                      ? TextApi.isText(beforeNode)
                      : ElementApi.isElement(beforeNode) &&
                        afterNode.type === beforeNode.type;
                    if (sameNodeKind) {
                      availableBefore.delete(afterIndex);
                      unmatchedAfter.delete(afterIndex);
                    }
                  }
                  unmatchedAfter.forEach((index) => {
                    insertedIndices.add(index);
                  });
                }
              }
              const sortedInsertedIndices = [...insertedIndices].sort(
                (left, right) => left - right
              );
              const affectedIndices = new Set<number>();
              const affectAll =
                paths.length === 0 || paths.some((path) => path.length === 0);
              if (affectAll) {
                afterChildren.forEach((_, index) => {
                  affectedIndices.add(index);
                });
              } else {
                paths.forEach((path) => {
                  const index = path[0];
                  if (index === undefined) return;
                  affectedIndices.add(index);
                  if (index > 0) affectedIndices.add(index - 1);
                  if (index + 1 < afterChildren.length) {
                    affectedIndices.add(index + 1);
                  }
                });
              }
              sortedInsertedIndices.forEach((index) => {
                affectedIndices.add(index);
              });
              withEditorUpdateRootScope(editor, root, () => {
                if (getSiblingListOptions) {
                  const changedPaths: Path[] =
                    paths.length && !paths.some((path) => path.length === 0)
                      ? paths.map((path) => [...path])
                      : [[]];
                  for (const path of changedPaths) {
                    const nodeEntry = tx.nodes.get(path);
                    let entry =
                      nodeEntry && ElementApi.isElement(nodeEntry[0])
                        ? ([nodeEntry[0], nodeEntry[1]] as NodeEntry<Element>)
                        : undefined;
                    if (!entry || !isListItem(entry[0])) {
                      entry = tx.nodes.find<Element>({
                        at: path,
                        match: (node): node is Element =>
                          ElementApi.isElement(node) && isListItem(node),
                      });
                    }
                    while (entry && isListItem(entry[0])) {
                      const update = getListStartUpdate(
                        tx,
                        entry,
                        getSiblingListOptions
                      );
                      if (update?.type === 'unset') {
                        tx.nodes.unset(KEYS.listStart, {
                          at: entry[1],
                        });
                      } else if (update?.type === 'set') {
                        tx.nodes.set(
                          {
                            [KEYS.listStart]: update.value,
                          },
                          {
                            at: entry[1],
                          }
                        );
                      }
                      entry = context.api.getNext<Element>(
                        entry,
                        {
                          ...getSiblingListOptions,
                          breakOnEqIndentNeqListStyleType: false,
                          breakOnLowerIndent: false,
                          eqIndent: false,
                        },
                        tx
                      );
                    }
                  }
                  return;
                }
                for (const index of sortedInsertedIndices) {
                  if (index === 0) continue;
                  const beforeNode = beforeChildren[index - 1];
                  const leftNode = afterChildren[index - 1];
                  const rightNode = afterChildren[index];
                  const isSplit =
                    !!beforeNode &&
                    !!leftNode &&
                    !!rightNode &&
                    ElementApi.isElement(beforeNode) &&
                    ElementApi.isElement(leftNode) &&
                    ElementApi.isElement(rightNode) &&
                    beforeNode.type === leftNode.type &&
                    beforeNode.type === rightNode.type &&
                    !isEqual(beforeNode, leftNode) &&
                    isEqual(
                      [...leftNode.children, ...rightNode.children],
                      beforeNode.children
                    );
                  if (!isSplit) continue;
                  const path: Path = [index];
                  const node = tx.nodes.get<Element>(path)?.[0];
                  const staleRestartKeys = [
                    KEYS.listRestart,
                    KEYS.listRestartPolite,
                  ].filter((key) => node && Object.hasOwn(node, key));
                  if (staleRestartKeys.length > 0) {
                    tx.nodes.unset(staleRestartKeys, {
                      at: path,
                    });
                  }
                }

                /**
                 * Roman and alpha markers overlap. Resolve only canonical insertions
                 * against the preceding sequence; existing nodes retain their style.
                 */
                for (const index of sortedInsertedIndices) {
                  const path: Path = [index];
                  const entry = tx.nodes.get<Element>(path);
                  const listStyleType = entry?.[0][KEYS.listType];
                  if (
                    !entry ||
                    typeof listStyleType !== 'string' ||
                    !['lower-roman', 'upper-roman'].includes(listStyleType)
                  ) {
                    continue;
                  }
                  const previousEntry = context.api.getPrevious<Element>(
                    entry,
                    {
                      breakOnEqIndentNeqListStyleType: false,
                      eqIndent: false,
                    },
                    tx
                  );
                  const resolvedListStyleType = resolveAmbiguousListStyleType(
                    listStyleType,
                    previousEntry?.[0][KEYS.listType]
                  );
                  if (resolvedListStyleType !== listStyleType) {
                    tx.nodes.set(
                      {
                        [KEYS.listType]: resolvedListStyleType,
                      },
                      {
                        at: path,
                      }
                    );
                  }
                }
                for (const index of [...affectedIndices].sort(
                  (left, right) => left - right
                )) {
                  const affectedPath: Path = [index];
                  let entry = tx.nodes.get<Element>(affectedPath);
                  if (entry && !isListItem(entry[0])) {
                    const [affectedNode] = entry;
                    const staleListKeys = [
                      KEYS.listChecked,
                      KEYS.listRestart,
                      KEYS.listRestartPolite,
                      KEYS.listStart,
                      KEYS.listType,
                    ].filter((key) => Object.hasOwn(affectedNode, key));
                    if (staleListKeys.length > 0) {
                      tx.nodes.unset(staleListKeys, {
                        at: affectedPath,
                      });
                    }
                  }
                  if (!entry || !isListItem(entry[0])) {
                    entry = tx.nodes.get<Element>(PathApi.next(affectedPath));
                  }
                  if (entry) {
                    const firstEntry = entry;
                    const previousBySequence = new Map<
                      string,
                      {
                        entry: NodeEntry<Element>;
                        indent: number;
                      }
                    >();
                    let previousPath = firstEntry[1];
                    let minimumIndent = Number.POSITIVE_INFINITY;
                    const [firstNode] = firstEntry;
                    let previousStyleEntry = context.api.getPrevious<Element>(
                      firstEntry,
                      {
                        breakOnEqIndentNeqListStyleType: false,
                        eqIndent: false,
                      },
                      tx
                    );
                    while (PathApi.hasPrevious(previousPath)) {
                      previousPath = PathApi.previous(previousPath);
                      const previousEntry = tx.nodes.get<Element>(previousPath);
                      if (!previousEntry) break;
                      const previousIndent = Number(
                        previousEntry[0][KEYS.indent]
                      );
                      if (!Number.isFinite(previousIndent)) break;
                      if (
                        context.api.isSequenceBoundary(
                          previousEntry[0],
                          firstNode
                        )
                      ) {
                        break;
                      }
                      if (
                        isListItem(previousEntry[0]) &&
                        previousIndent <= minimumIndent
                      ) {
                        const key = getSequenceKey(previousEntry[0]);
                        if (!previousBySequence.has(key)) {
                          previousBySequence.set(key, {
                            entry: previousEntry,
                            indent: previousIndent,
                          });
                        }
                      }
                      minimumIndent = Math.min(minimumIndent, previousIndent);
                    }
                    let suffixEntry: NodeEntry<Element> | undefined =
                      firstEntry;
                    while (suffixEntry) {
                      let node = suffixEntry[0];
                      const path: Path = suffixEntry[1];
                      const indent = Number(node[KEYS.indent]);
                      if (!Number.isFinite(indent)) break;
                      const previousStyleNode = previousStyleEntry?.[0];
                      const previousStyleIndent = Number(
                        previousStyleNode?.[KEYS.indent]
                      );
                      const resolvedListStyleType =
                        resolveAmbiguousListStyleType(
                          node[KEYS.listType],
                          previousStyleIndent >= indent
                            ? previousStyleNode?.[KEYS.listType]
                            : undefined
                        );
                      if (resolvedListStyleType !== node[KEYS.listType]) {
                        tx.nodes.set(
                          {
                            [KEYS.listType]: resolvedListStyleType,
                          },
                          {
                            at: path,
                          }
                        );
                        node = {
                          ...node,
                          [KEYS.listType]: resolvedListStyleType,
                        };
                      }
                      const currentEntry: NodeEntry<Element> = [node, path];
                      for (const [key, previous] of previousBySequence) {
                        if (
                          previous.indent > indent ||
                          (isListItem(node) &&
                            context.api.isSequenceBoundary(
                              previous.entry[0],
                              node
                            ))
                        ) {
                          previousBySequence.delete(key);
                        }
                      }
                      if (!isListItem(node)) {
                        previousStyleEntry = currentEntry;
                        suffixEntry = tx.nodes.get<Element>(PathApi.next(path));
                        continue;
                      }
                      const key = getSequenceKey(node);
                      const previousEntry = previousBySequence.get(key)?.entry;
                      const expectedListStart = getListExpectedListStart(
                        suffixEntry,
                        previousEntry
                      );
                      const listStyleType = node[KEYS.listType];
                      const listStart = node[KEYS.listStart] as
                        | number
                        | undefined;
                      const isUnordered = ULIST_STYLE_TYPES.some(
                        (unorderedListStyleType) =>
                          unorderedListStyleType === listStyleType
                      );
                      if (
                        isUnordered ||
                        (isDefined(listStart) && expectedListStart === 1)
                      ) {
                        if (isDefined(listStart)) {
                          tx.nodes.unset(KEYS.listStart, {
                            at: path,
                          });
                        }
                      } else if (
                        typeof listStyleType === 'string' &&
                        listStart !== expectedListStart &&
                        expectedListStart > 1
                      ) {
                        tx.nodes.set(
                          {
                            [KEYS.listStart]: expectedListStart,
                          },
                          {
                            at: path,
                          }
                        );
                      }
                      previousBySequence.set(key, {
                        entry: [
                          {
                            ...node,
                            [KEYS.listStart]: isUnordered
                              ? undefined
                              : expectedListStart > 1
                                ? expectedListStart
                                : undefined,
                          },
                          path,
                        ],
                        indent,
                      });
                      previousStyleEntry = currentEntry;
                      suffixEntry = tx.nodes.get<Element>(PathApi.next(path));
                    }
                  }
                }
              });
            }
          } finally {
            changeGuard.delete(tx);
          }
        },
        corrections: [
          {
            event: 'content',
            correct({ entry, tx }) {
              if (!ElementApi.isElement(entry[0])) return;
              if (
                !isDefined(entry[0][KEYS.indent]) &&
                (entry[0][KEYS.listType] || entry[0][KEYS.listStart])
              ) {
                tx.nodes.unset([KEYS.listType, KEYS.listStart], {
                  at: entry[1],
                });
                return;
              }
              const update = getListStartUpdate(
                tx,
                [entry[0], entry[1]],
                getOptions().getSiblingListOptions
              );
              if (update?.type === 'unset') {
                tx.nodes.unset(KEYS.listStart, {
                  at: entry[1],
                });
              } else if (update?.type === 'set') {
                tx.nodes.set(
                  {
                    [KEYS.listStart]: update.value,
                  },
                  {
                    at: entry[1],
                  }
                );
              }
            },
          },
        ],
      },
    };
  });

export type BaseListConfig = InferConfig<typeof BaseListPlugin>;

const createListRule = createRuleFactory(BaseListPlugin);

export const BulletedListRules = {
  markdown: createListRule<{}, { variant: '*' | '-' }>({
    type: 'blockStart',
    variant: '-',
    enabled: ({ editor }) =>
      !editor.read.nodes.some({
        match: { type: [editor.getType(KEYS.codeBlock)] },
      }),
    trigger: ' ',
    match: ({ variant }) => variant,
    apply: ({ tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.list.toggle({ listStyleType: KEYS.ul });

      return true;
    },
  }),
};

export const OrderedListRules = {
  markdown: createListRule<{}, { variant: '.' | ')' }, { start: number }>({
    type: 'blockStart',
    variant: '.',
    enabled: ({ editor }) =>
      !editor.read.nodes.some({
        match: { type: [editor.getType(KEYS.codeBlock)] },
      }),
    trigger: ' ',
    match: ({ variant }) =>
      new RegExp(`^(\\d+)${variant === ')' ? '\\)' : '\\.'}$`),
    resolveMatch: ({ match }) => ({
      start: Number((match as RegExpMatchArray)[1]),
    }),
    apply: ({ tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.list.toggle({
        listRestartPolite: match.start || 1,
        listStyleType: KEYS.ol,
      });

      return true;
    },
  }),
};

export const TaskListRules = {
  markdown: createListRule<{}, { checked: boolean }>({
    type: 'blockStart',
    checked: false,
    enabled: ({ editor }) =>
      !editor.read.nodes.some({
        match: { type: [editor.getType(KEYS.codeBlock)] },
      }),
    trigger: ' ',
    match: ({ checked }) => (checked ? '[x]' : '[]'),
    apply: ({ checked, tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.list.toggle({ listStyleType: KEYS.listTodo });
      tx.nodes.set({
        checked,
        listStyleType: KEYS.listTodo,
      });

      return true;
    },
  }),
};
