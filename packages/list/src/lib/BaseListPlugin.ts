import {
  BaseParagraphPlugin,
  defineBasePlugin,
  createRuleFactory,
  getInjectMatch,
  type DefinitionOf,
  type ElementWith,
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
import { PLUGINS } from '@platejs/utils';
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
    state: Pick<EditorCoreStateView, 'nodes'>
  ) => NodeEntry<N> | undefined;
  getPreviousEntry?: (
    entry: NodeEntry<Element>,
    state: Pick<EditorCoreStateView, 'nodes'>
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

const isListItem = (node: Element) => node.listStyleType != null;

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

export type BaseListPluginState = {
  getSiblingListOptions?: GetSiblingListOptions<Element>;
};

export const BaseListPlugin = defineBasePlugin(PLUGINS.list, {
  dependencies: [BaseIndentPlugin],
  initialState: (): BaseListPluginState => ({}),
  schema: ({ targetElementTypes }) => ({
    properties: {
      checked: schema.elementProperty(property.boolean(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listRestart: schema.elementProperty(property.number(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listRestartPolite: schema.elementProperty(property.number(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listStart: schema.elementProperty(property.number(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listStyleType: schema.elementProperty(property.string(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    },
  }),
  targetPlugins: [BaseParagraphPlugin],
  codecs: ({ defineCodecs }) => {
    const decodeListProperties = ({ element }: { element: HTMLElement }) => {
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
      const listRestartPolite = readNumber(element.dataset.listRestartPolite);
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
        ...(checked === undefined ? {} : { checked }),
        ...(listRestart === undefined ? {} : { listRestart }),
        ...(listRestartPolite === undefined ? {} : { listRestartPolite }),
        ...(listStart === undefined ? {} : { listStart }),
        ...(listStyleType ? { listStyleType } : {}),
      };
    };

    return defineCodecs({
      'text/html': [
        {
          createsElement: true,
          transformData: ({ data }) => {
            const document = new DOMParser().parseFromString(data, 'text/html');
            const { body } = document;

            if (!body.querySelector('ul, ol, li')) return data;

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
                    const parentListStyleType = (listParent as HTMLElement)
                      .style.listStyleType;
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
          decode: decodeListProperties,
          encode: ({ content, node }) => {
            const checked = node.checked;
            const listRestart = node.listRestart;
            const listRestartPolite = node.listRestartPolite;
            const listStart = node.listStart;
            const listStyleType = node.listStyleType;
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
          priority: 50,
        },
        {
          decode: decodeListProperties,
          decodeOnly: true,
          match: [
            {
              attributes: { 'data-list-style-type': true },
            },
          ],
          priority: 40,
        },
      ],
    });
  },

  rules: {
    merge: {
      removeEmpty: false,
    },
    match: ({ node }) => isDefined(node.listStyleType),
  },
})
  .extend(({ defineCodecs, editor }) => ({
    codecs: defineCodecs(BaseParagraphPlugin, {
      'text/markdown': {
        from: 'list',
        kind: 'node',
        priority: 40,
        decode: ({ build, node, schema: { type } }) => {
          const parseList = (
            list: typeof node,
            indent = 1,
            startIndex = 1
          ): Element[] => {
            const items: Element[] = [];
            const ordered = Boolean(list.ordered);
            let listStyleType = ordered ? 'decimal' : 'disc';

            list.children.forEach((listItem, index) => {
              const checked = listItem.checked;
              const todo = typeof checked === 'boolean';

              if (todo) listStyleType = 'todo';

              const [paragraph, ...nested] = listItem.children;
              const nodes: Descendant[] = paragraph
                ? build(paragraph)
                : [
                    {
                      children: [{ text: '' }],
                      type: 'paragraph',
                    },
                  ];

              nodes.forEach((child, childIndex) => {
                const element = TextApi.isText(child)
                  ? {
                      children: [child],
                      type: 'paragraph',
                    }
                  : child;
                const image = editor.plugin(PLUGINS.image);

                items.push({
                  ...element,
                  ...(todo ? { checked } : {}),
                  indent,
                  listStyleType,
                  ...(ordered
                    ? {
                        listStart: startIndex + index,
                        ...(index === 0 &&
                        childIndex === 0 &&
                        startIndex + index > 1
                          ? { listRestartPolite: startIndex + index }
                          : {}),
                      }
                    : {}),
                  type:
                    image.installed && element.type === image.schema.type
                      ? element.type
                      : type,
                });
              });

              nested.forEach((child) => {
                if (child.type === 'list') {
                  items.push(...parseList(child, indent + 1, child.start || 1));
                  return;
                }

                items.push(
                  ...build(child)
                    .filter((item): item is Element => !TextApi.isText(item))
                    .map((item) => ({ ...item, indent: indent + 1 }))
                );
              });
            });

            return items;
          };

          return parseList(node, 1, node.start || 1);
        },
      },
    }),
  }))
  .extend(({ editor }) => ({
    api: () => {
      const isHeading = (node: Element) =>
        [
          PLUGINS.h1,
          PLUGINS.h2,
          PLUGINS.h3,
          PLUGINS.h4,
          PLUGINS.h5,
          PLUGINS.h6,
        ].some((headingName) => {
          const heading = editor.plugin(headingName);

          return heading.installed && node.type === heading.schema.type;
        });
      const isSequenceBoundary = (
        siblingNode: Element,
        currentNode: Element
      ) => {
        const siblingListType = siblingNode.listStyleType;

        return (
          siblingNode.indent === currentNode.indent &&
          siblingListType != null &&
          siblingListType === currentNode.listStyleType &&
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
            siblingNode.listStyleType === currentNode.listStyleType &&
            isHeading(siblingNode) === isHeading(currentNode) &&
            (query ? !!query(siblingNode, currentNode) : true),
        };
      };

      return {
        getSequenceSiblingOptions,
        isSequenceBoundary,
      };
    },
    read: ({ state }) => {
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
        }: GetSiblingListOptions<N>
      ): NodeEntry<N> | undefined => {
        const getSiblingEntry = getNextEntry ?? getPreviousEntry;

        if (!getSiblingEntry) return;

        let nextEntry = getSiblingEntry([node, path], state);

        while (nextEntry) {
          const [nextNode, nextPath] = nextEntry;
          const indent = node.indent;
          const nextIndent = nextNode.indent;

          if (breakQuery?.(nextNode, node)) return;
          if (typeof indent !== 'number' || typeof nextIndent !== 'number')
            return;
          if (
            breakOnListRestart &&
            ((getPreviousEntry && isDefined(node.listRestart)) ||
              (getNextEntry && isDefined(nextNode.listRestart)))
          ) {
            return;
          }
          if (breakOnLowerIndent && nextIndent < indent) return;
          if (
            breakOnEqIndentNeqListStyleType &&
            nextIndent === indent &&
            nextNode.listStyleType !== node.listStyleType
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

      return {
        /** Get the next indent-list item. */
        getNext: <N extends Element = Element>(
          entry: NodeEntry<Element>,
          options?: Partial<GetSiblingListOptions<N>>
        ): NodeEntry<N> | undefined =>
          getSibling(entry, {
            getNextEntry: ([, currentPath]) => {
              const nextPath = PathApi.next(currentPath);
              const nextNode = state.nodes.get<N>(nextPath)?.[0];

              if (!nextNode) return;

              return [nextNode, nextPath];
            },
            ...options,
            getPreviousEntry: undefined,
          }),
        /** Get the previous indent-list item. */
        getPrevious: <N extends Element = Element>(
          entry: NodeEntry<Element>,
          options?: Partial<GetSiblingListOptions<N>>
        ): NodeEntry<N> | undefined =>
          getSibling(entry, {
            getPreviousEntry: ([, currentPath]) => {
              if (!PathApi.hasPrevious(currentPath)) return;
              const previousPath = PathApi.previous(currentPath);
              const previousNode = state.nodes.get<N>(previousPath)?.[0];

              if (!previousNode) return;

              return [previousNode, previousPath];
            },
            ...options,
            getNextEntry: undefined,
          }),
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
            const parentIndent = node.indent;

            if (
              typeof parentIndent !== 'number' ||
              !isDefined(node.listStyleType)
            ) {
              return;
            }
            let currentPath = path;

            while (true) {
              const nextPath = PathApi.next(currentPath);
              const nextNode = state.nodes.get<N>(nextPath)?.[0];

              if (!nextNode) break;
              const nextIndent = nextNode.indent;

              if (
                typeof nextIndent !== 'number' ||
                !isDefined(nextNode.listStyleType) ||
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
        isActive: (
          style: ListStyleType | string | readonly string[]
        ): boolean => {
          const selection = state.selection();

          if (!selection) return false;
          const styles = Array.isArray(style) ? style : [style];

          return state.nodes.some({
            match: (node) => {
              if (!ElementApi.isElement(node)) return false;
              const isTodo = Object.hasOwn(node, 'checked');

              return (
                styles.includes(node.listStyleType as string) &&
                (styles.includes('todo') ? isTodo : !isTodo)
              );
            },
          });
        },
      };
    },
  }))
  .extend(({ api, editor, store, plugin }) => ({
    override: {
      plugins: {
        indent: {
          targetPlugins: plugin.targetPlugins,
        },
      },
    },
    update: ({ tx }) => ({
      indent: ({
        listStyleType = ListStyleType.Disc,
        ...options
      }: IndentListOptions = {}) => {
        tx.indent.change({
          nodes: {
            at: options.at,
          },
          offset: 1,
          setNodeProps: () => ({
            listStyleType,
          }),
        });
      },
      outdent: (options: OutdentListOptions = {}) => {
        tx.indent.change({
          nodes: {
            at: options.at,
          },
          offset: -1,
          unsetNodeProps: [
            'listStyleType',
            'checked',
            'listRestart',
            'listRestartPolite',
            'listStart',
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
          ...store.get().getSiblingListOptions,
          ...options.getSiblingListOptions,
        };
        const match = getInjectMatch(editor, plugin);
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
            const indent = Number(node.indent ?? 0);
            const isTodo = listStyleType === 'todo';
            if (!Object.hasOwn(node, 'checked') && !node.listStyleType) {
              tx.nodes.set(
                {
                  indent: indent + 1,
                  ...(isTodo
                    ? {
                        checked: false,
                      }
                    : {}),
                  listStyleType,
                },
                {
                  at: path,
                }
              );
              return true;
            }
            if (
              (isTodo && Object.hasOwn(node, 'checked')) ||
              listStyleType === node.listStyleType
            ) {
              tx.nodes.unset(isTodo ? 'checked' : 'listStyleType', {
                at: path,
              });
              if (indent > 1) {
                tx.nodes.set('indent', indent - 1, {
                  at: path,
                });
              } else {
                tx.nodes.unset(['indent', 'checked', 'listStyleType'], {
                  at: path,
                });
              }
              return false;
            }
            const siblings: NodeEntry<Element>[] = [];
            let siblingEntry: NodeEntry<Element> | undefined = entry;
            while (siblingEntry) {
              siblingEntry = tx.list.getPrevious(
                siblingEntry,
                mergedGetSiblingListOptions
              );
              if (siblingEntry) siblings.push(siblingEntry);
            }
            siblings.push(entry);
            siblingEntry = entry;
            while (siblingEntry) {
              siblingEntry = tx.list.getNext(
                siblingEntry,
                mergedGetSiblingListOptions
              );
              if (siblingEntry) siblings.push(siblingEntry);
            }
            siblings.forEach(([sibling, siblingPath]) => {
              const siblingIndent = (sibling.indent as number | undefined) ?? 0;
              if (isTodo) {
                tx.nodes.unset('listStyleType', {
                  at: siblingPath,
                });
                tx.nodes.set(
                  {
                    indent: siblingIndent || siblingIndent + 1,
                    checked: false,
                    listStyleType,
                  },
                  {
                    at: siblingPath,
                  }
                );
                return;
              }
              tx.nodes.unset('checked', {
                at: siblingPath,
              });
              tx.nodes.set(
                {
                  indent: siblingIndent || siblingIndent + 1,
                  listStyleType,
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
              listStyleType === 'todo'
                ? Object.hasOwn(block, 'checked')
                : !!block.listStyleType && block.listStyleType === listStyleType
            );
            if (eqListStyleType) {
              entries.forEach(([node, path]) => {
                const indent = node.indent as number;
                tx.nodes.unset('listStyleType', {
                  at: path,
                });
                if (indent > 1) {
                  tx.nodes.set('indent', indent - 1, {
                    at: path,
                  });
                } else {
                  tx.nodes.unset(['indent', 'checked'], {
                    at: path,
                  });
                }
              });
              return false;
            }
            entries.forEach(([node, path]) => {
              const currentIndent = (node.indent as number | undefined) ?? 0;
              const indent =
                node.listStyleType || Object.hasOwn(node, 'checked')
                  ? currentIndent
                  : currentIndent + 1;
              if (listStyleType === 'todo') {
                tx.nodes.unset('listStyleType', {
                  at: path,
                });
                tx.nodes.set(
                  {
                    indent: indent || indent + 1,
                    checked: false,
                    listStyleType,
                  },
                  {
                    at: path,
                  }
                );
                return;
              }
              tx.nodes.unset('checked', {
                at: path,
              });
              tx.nodes.set(
                {
                  indent: indent || indent + 1,
                  listStyleType,
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
              candidate.listStyleType !== undefined,
          }) ?? [
            {
              ...targetNode,
              indent:
                Number(targetNode.indent ?? 0) +
                (targetNode.listStyleType ? 0 : 1),
              listStyleType,
            },
            targetPath,
          ];
          const isFirst = !tx.list.getPrevious(
            entry,
            api.getSequenceSiblingOptions({
              breakOnEqIndentNeqListStyleType: false,
              ...mergedGetSiblingListOptions,
            })
          );

          /**
           * Only apply listRestartPolite if this is the first item and
           * restartValue > 1.
           */
          if (!isRestart && (!isFirst || restartValue <= 0)) return;

          // If restartValue is 1, only apply listRestart if this is not the first
          if (isRestart && restartValue === 1 && isFirst) return;
          const prop = isRestart ? 'listRestart' : 'listRestartPolite';
          tx.nodes.set(prop, restartValue, {
            at: entry[1],
          });
        }
      },
    }),
  }))
  .extend((context) => {
    const { editor, store } = context;
    const listStyleTypeProperty = context.schema.properties.listStyleType;
    const changeGuard = new WeakSet<object>();
    const getListExpectedListStart = (
      entry: NodeEntry<Element>,
      previousEntry?: NodeEntry<Element>
    ) => {
      const [node] = entry;
      const [previousNode] = previousEntry ?? [null];
      const restart = (node.listRestart as number | null) ?? null;
      const politeRestart = (node.listRestartPolite as number | null) ?? null;
      if (restart) return restart;
      if (politeRestart && !previousNode) return politeRestart;
      return previousNode ? ((previousNode.listStart as number) ?? 1) + 1 : 1;
    };
    const getSequenceKey = (node: Element) => {
      const isHeading = [
        PLUGINS.h1,
        PLUGINS.h2,
        PLUGINS.h3,
        PLUGINS.h4,
        PLUGINS.h5,
        PLUGINS.h6,
      ].some((headingName) => {
        const heading = editor.plugin(headingName);

        return heading.installed && node.type === heading.schema.type;
      });
      return `${node.indent}:${node.listStyleType}:${isHeading}`;
    };
    const resolveAmbiguousListStyleType = (
      listStyleType: unknown,
      previousListStyleType: unknown
    ): string | undefined => {
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
      return typeof listStyleType === 'string' ? listStyleType : undefined;
    };
    const getListStartUpdate = (
      entry: NodeEntry<Element>,
      previousEntry: NodeEntry<Element> | undefined
    ) => {
      const [node] = entry;
      const listStyleType = node.listStyleType;
      const listStart = node.listStart as number | undefined;
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
      const expectedListStart = getListExpectedListStart(entry, previousEntry);
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
            !nodeEntry[0].listStyleType ||
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
            !nodeEntry[0].listStyleType ||
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
              'listRestart',
              'listRestartPolite',
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
            node.listStyleType !== 'todo' ||
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
              tx.nodes.set('checked', false, {
                at: newEntry[1],
              });
            }
          });
        }),
      ],
      on: {
        transactionChange({ after, before, change, changed, tx }) {
          if (editor.runtime.isNormalizing || changeGuard.has(tx)) return;
          changeGuard.add(tx);
          try {
            const { getSiblingListOptions } = store.get();
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
                        entry,
                        tx.list.getPrevious(
                          entry,
                          context.api.getSequenceSiblingOptions({
                            breakOnEqIndentNeqListStyleType: false,
                            ...getSiblingListOptions,
                          })
                        )
                      );
                      if (update?.type === 'unset') {
                        tx.nodes.unset('listStart', {
                          at: entry[1],
                        });
                      } else if (update?.type === 'set') {
                        tx.nodes.set('listStart', update.value, {
                          at: entry[1],
                        });
                      }
                      entry = tx.list.getNext<Element>(entry, {
                        ...getSiblingListOptions,
                        breakOnEqIndentNeqListStyleType: false,
                        breakOnLowerIndent: false,
                        eqIndent: false,
                      });
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
                    'listRestart',
                    'listRestartPolite',
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
                  const listStyleType = entry?.[0].listStyleType;
                  if (
                    !entry ||
                    typeof listStyleType !== 'string' ||
                    !['lower-roman', 'upper-roman'].includes(listStyleType)
                  ) {
                    continue;
                  }
                  const previousEntry = tx.list.getPrevious<Element>(entry, {
                    breakOnEqIndentNeqListStyleType: false,
                    eqIndent: false,
                  });
                  const resolvedListStyleType = resolveAmbiguousListStyleType(
                    listStyleType,
                    previousEntry?.[0].listStyleType
                  );
                  if (resolvedListStyleType !== listStyleType) {
                    if (resolvedListStyleType === undefined) {
                      tx.nodes.unset(listStyleTypeProperty, { at: path });
                    } else {
                      tx.nodes.set(
                        listStyleTypeProperty,
                        resolvedListStyleType,
                        { at: path }
                      );
                    }
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
                      'checked',
                      'listRestart',
                      'listRestartPolite',
                      'listStart',
                      'listStyleType',
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
                    let previousStyleEntry = tx.list.getPrevious<Element>(
                      firstEntry,
                      {
                        breakOnEqIndentNeqListStyleType: false,
                        eqIndent: false,
                      }
                    );
                    while (PathApi.hasPrevious(previousPath)) {
                      previousPath = PathApi.previous(previousPath);
                      const previousEntry = tx.nodes.get<Element>(previousPath);
                      if (!previousEntry) break;
                      const previousIndent = Number(previousEntry[0].indent);
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
                      const indent = Number(node.indent);
                      if (!Number.isFinite(indent)) break;
                      const previousStyleNode = previousStyleEntry?.[0];
                      const previousStyleIndent = Number(
                        previousStyleNode?.indent
                      );
                      const resolvedListStyleType =
                        resolveAmbiguousListStyleType(
                          node.listStyleType,
                          previousStyleIndent >= indent
                            ? previousStyleNode?.listStyleType
                            : undefined
                        );
                      if (resolvedListStyleType !== node.listStyleType) {
                        if (resolvedListStyleType === undefined) {
                          tx.nodes.unset(listStyleTypeProperty, { at: path });
                        } else {
                          tx.nodes.set(
                            listStyleTypeProperty,
                            resolvedListStyleType,
                            { at: path }
                          );
                        }
                        node = {
                          ...node,
                          listStyleType: resolvedListStyleType,
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
                      const listStyleType = node.listStyleType;
                      const listStart = node.listStart as number | undefined;
                      const isUnordered = ULIST_STYLE_TYPES.some(
                        (unorderedListStyleType) =>
                          unorderedListStyleType === listStyleType
                      );
                      if (
                        isUnordered ||
                        (isDefined(listStart) && expectedListStart === 1)
                      ) {
                        if (isDefined(listStart)) {
                          tx.nodes.unset('listStart', {
                            at: path,
                          });
                        }
                      } else if (
                        typeof listStyleType === 'string' &&
                        listStart !== expectedListStart &&
                        expectedListStart > 1
                      ) {
                        tx.nodes.set('listStart', expectedListStart, {
                          at: path,
                        });
                      }
                      previousBySequence.set(key, {
                        entry: [
                          {
                            ...node,
                            listStart: isUnordered
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
      },
      corrections: [
        {
          event: 'content',
          correct({ entry, tx }) {
            if (!ElementApi.isElement(entry[0])) return;
            if (
              !isDefined(entry[0].indent) &&
              (entry[0].listStyleType || entry[0].listStart)
            ) {
              tx.nodes.unset(['listStyleType', 'listStart'], {
                at: entry[1],
              });
              return;
            }
            const update = getListStartUpdate(
              [entry[0], entry[1]],
              tx.list.getPrevious(
                [entry[0], entry[1]],
                context.api.getSequenceSiblingOptions({
                  breakOnEqIndentNeqListStyleType: false,
                  ...store.get().getSiblingListOptions,
                })
              )
            );
            if (update?.type === 'unset') {
              tx.nodes.unset('listStart', {
                at: entry[1],
              });
            } else if (update?.type === 'set') {
              tx.nodes.set('listStart', update.value, {
                at: entry[1],
              });
            }
          },
        },
      ],
    };
  });

export type BaseListDefinition = DefinitionOf<typeof BaseListPlugin>;

export const BulletedListRules = {
  markdown: createRuleFactory(BaseListPlugin)<{}, { variant: '*' | '-' }>({
    type: 'blockStart',
    variant: '-',
    enabled: ({ editor, tx }) => {
      const codeBlock = editor.plugin(PLUGINS.codeBlock);

      if (!codeBlock.installed) return true;

      return !tx.nodes.some({
        match: {
          type: [codeBlock.schema.type],
        },
      });
    },
    trigger: ' ',
    match: ({ variant }) => variant,
    apply: ({ tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.list.toggle({ listStyleType: 'disc' });

      return true;
    },
  }),
};

export const OrderedListRules = {
  markdown: createRuleFactory(BaseListPlugin)<
    {},
    { variant: '.' | ')' },
    { start: number }
  >({
    type: 'blockStart',
    variant: '.',
    enabled: ({ editor, tx }) => {
      const codeBlock = editor.plugin(PLUGINS.codeBlock);

      if (!codeBlock.installed) return true;

      return !tx.nodes.some({
        match: {
          type: [codeBlock.schema.type],
        },
      });
    },
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
        listStyleType: 'decimal',
      });

      return true;
    },
  }),
};

export const TaskListRules = {
  markdown: createRuleFactory(BaseListPlugin)<{}, { checked: boolean }>({
    type: 'blockStart',
    checked: false,
    enabled: ({ editor, tx }) => {
      const codeBlock = editor.plugin(PLUGINS.codeBlock);

      if (!codeBlock.installed) return true;

      return !tx.nodes.some({
        match: {
          type: [codeBlock.schema.type],
        },
      });
    },
    trigger: ' ',
    match: ({ checked }) => (checked ? '[x]' : '[]'),
    apply: ({ checked, tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.list.toggle({ listStyleType: 'todo' });
      tx.nodes.set({
        checked,
        listStyleType: 'todo',
      });

      return true;
    },
  }),
};

/** Element carrying the Indent and List schema capabilities. */
export type ListElement = ElementWith<
  typeof BaseIndentPlugin | typeof BaseListPlugin,
  'indent' | 'listStyleType'
>;
