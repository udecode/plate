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
  type NodeKey,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

export const ListStyle = {
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

export type ListStyle = (typeof ListStyle)[keyof typeof ListStyle];

export const ListType = {
  Bulleted: 'bulleted',
  Numbered: 'numbered',
  Task: 'task',
} as const;

export type ListType = (typeof ListType)[keyof typeof ListType];

const LIST_TYPES = [
  ListType.Bulleted,
  ListType.Numbered,
  ListType.Task,
] as const;

export type IndentListOptions = {
  at?: Location;
  listStyle?: ListStyle | (string & {});
  type?: ListType;
};

export type OutdentListOptions = {
  at?: Location;
};

export type ToggleListOptions = {
  at?: Location;
  getSiblingListOptions?: GetSiblingListOptions;
  listStyle?: ListStyle | (string & {});
  type: ListType;
} & (
  | {
      /** Apply this start only while the target is first in its list sequence. */
      listStart?: number;
      listRestart?: never;
    }
  | {
      listStart?: never;
      /** Start or restart the numbered sequence unconditionally. */
      listRestart?: number;
    }
);

export const BULLETED_LIST_STYLES = [
  ListStyle.Disc,
  ListStyle.Circle,
  ListStyle.Square,
  ListStyle.DisclosureOpen,
  ListStyle.DisclosureClosed,
] as const;

export type GetSiblingListOptions = {
  breakOnEqIndentNeqList?: boolean;
  breakOnLowerIndent?: boolean;
  breakQuery?: (
    siblingNode: Element,
    currentNode: Element
  ) => boolean | undefined;
  getNextEntry?: (
    entry: NodeEntry<Element>,
    state: ListSiblingState
  ) => NodeEntry<Element> | undefined;
  getPreviousEntry?: (
    entry: NodeEntry<Element>,
    state: ListSiblingState
  ) => NodeEntry<Element> | undefined;
  /** Query to break lookup. */
  eqIndent?: boolean;
  /** Query to validate lookup. If false, check the next sibling. */
  query?: (siblingNode: Element, currentNode: Element) => boolean | undefined;
};

/** Minimal read contract for custom list sibling traversal. */
export type ListSiblingState = {
  nodes: Pick<EditorCoreStateView['nodes'], 'get'>;
};

export function isOrderedList(element: Element) {
  return element.listType === ListType.Numbered;
}

const isListType = (value: unknown): value is ListType =>
  LIST_TYPES.some((type) => type === value);

const isListOrdinal = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value);

const isListItem = (node: Element) => isListType(node.listType);

const getListIndent = (node: Element) =>
  typeof node.indent === 'number' ? node.indent : 1;

const normalizeListStyle = (
  type: ListType,
  style: ListStyle | (string & {}) | undefined
) =>
  (type === ListType.Bulleted && style === ListStyle.Disc) ||
  (type === ListType.Numbered && style === ListStyle.Decimal) ||
  type === ListType.Task
    ? undefined
    : style;

const getElementListStyle = (element: Element) =>
  isListType(element.listType)
    ? normalizeListStyle(
        element.listType,
        element.listStyle as ListStyle | undefined
      )
    : element.listStyle;

const getSequenceSiblingOptions = (
  options: Partial<GetSiblingListOptions> | undefined,
  headingType: string | undefined
): Partial<GetSiblingListOptions> => {
  const { breakQuery, query, ...rest } = options ?? {};
  const isHeading = (node: Element) =>
    headingType !== undefined && node.type === headingType;

  return {
    ...rest,
    breakQuery: (siblingNode, currentNode) =>
      (getListIndent(siblingNode) === getListIndent(currentNode) &&
        siblingNode.listType === currentNode.listType &&
        getElementListStyle(siblingNode) === getElementListStyle(currentNode) &&
        isHeading(siblingNode) !== isHeading(currentNode)) ||
      !!breakQuery?.(siblingNode, currentNode),
    query: (siblingNode, currentNode) =>
      siblingNode.listType === currentNode.listType &&
      getElementListStyle(siblingNode) === getElementListStyle(currentNode) &&
      isHeading(siblingNode) === isHeading(currentNode) &&
      (query ? !!query(siblingNode, currentNode) : true),
  };
};

const getListSibling = (
  state: Pick<EditorCoreStateView, 'nodes'>,
  [node, path]: NodeEntry<Element>,
  {
    breakOnEqIndentNeqList = true,
    breakOnLowerIndent = true,
    breakQuery,
    eqIndent = true,
    getNextEntry,
    getPreviousEntry,
    query,
  }: GetSiblingListOptions
): NodeEntry<Element> | undefined => {
  const getSiblingEntry = getNextEntry ?? getPreviousEntry;

  if (!getSiblingEntry) return;

  let nextEntry = getSiblingEntry([node, path], state);

  while (nextEntry) {
    const [nextNode, nextPath] = nextEntry;
    const indent = getListIndent(node);
    const nextIndent = getListIndent(nextNode);

    if (breakQuery?.(nextNode, node)) return;
    if (breakOnLowerIndent && nextIndent < indent) return;
    if (
      breakOnEqIndentNeqList &&
      nextIndent === indent &&
      (nextNode.listType !== node.listType ||
        getElementListStyle(nextNode) !== getElementListStyle(node))
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

const listOrdinalsByState = new WeakMap<
  object,
  {
    headingType: string | undefined;
    options: Partial<GetSiblingListOptions> | undefined;
    values: WeakMap<Element, number>;
  }
>();

const getListOrdinal = (
  state: Pick<EditorCoreStateView, 'nodes' | 'runtime'>,
  element: Element,
  options: Partial<GetSiblingListOptions> | undefined,
  headingType: string | undefined
): number | undefined => {
  if (element.listType !== ListType.Numbered) return;

  const stateKey = state.runtime.snapshot().index;
  let cache = listOrdinalsByState.get(stateKey);

  if (
    !cache ||
    cache.options !== options ||
    cache.headingType !== headingType
  ) {
    cache = {
      headingType,
      options,
      values: new WeakMap(),
    };
    listOrdinalsByState.set(stateKey, cache);
  }
  const ordinals = cache.values;

  const cached = ordinals.get(element);

  if (cached !== undefined) return cached;

  if (typeof element.listRestart === 'number') {
    ordinals.set(element, element.listRestart);
    return element.listRestart;
  }

  const path = state.nodes.path(element);

  if (!path) {
    const ordinal =
      typeof element.listStart === 'number' ? element.listStart : 1;

    ordinals.set(element, ordinal);
    return ordinal;
  }

  const sequenceOptions = getSequenceSiblingOptions(options, headingType);
  const getPreviousEntry =
    sequenceOptions.getPreviousEntry ??
    (([, currentPath]: NodeEntry<Element>) => {
      if (!PathApi.hasPrevious(currentPath)) return;
      const previousPath = PathApi.previous(currentPath);
      const previousNode = state.nodes.get(previousPath, {
        match: ElementApi.isElement,
      })?.[0];

      return previousNode
        ? ([previousNode, previousPath] as NodeEntry<Element>)
        : undefined;
    });
  const pending: Element[] = [];
  let entry: NodeEntry<Element> = [element, path];
  let ordinal = 0;

  while (true) {
    const entryCached = ordinals.get(entry[0]);

    if (entryCached !== undefined) {
      ordinal = entryCached;
      break;
    }
    if (typeof entry[0].listRestart === 'number') {
      ordinal = entry[0].listRestart;
      ordinals.set(entry[0], ordinal);
      break;
    }

    pending.push(entry[0]);

    const previous = getListSibling(state, entry, {
      ...sequenceOptions,
      getNextEntry: undefined,
      getPreviousEntry,
    });

    if (!previous) {
      if (typeof entry[0].listStart === 'number') {
        ordinal = entry[0].listStart - 1;
      }
      break;
    }

    entry = previous;
  }

  for (const pendingElement of pending.reverse()) {
    ordinal++;
    ordinals.set(pendingElement, ordinal);
  }

  return ordinals.get(element);
};

export type BaseListPluginState = {
  getSiblingListOptions?: GetSiblingListOptions;
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
      listStart: schema.elementProperty(
        property.number({
          validate: isListOrdinal,
          validationVersion: 1,
        }),
        {
          split: 'drop',
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
      listRestart: schema.elementProperty(
        property.number({
          validate: isListOrdinal,
          validationVersion: 1,
        }),
        {
          split: 'drop',
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
      listStyle: schema.elementProperty(property.string(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listType: schema.elementProperty(property.enum(LIST_TYPES), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
    },
  }),
  targetPlugins: [BaseParagraphPlugin],
  codecs: ({ defineCodecs, editor, store }) => {
    const heading = editor.plugin(PLUGINS.heading);
    const headingType = heading.installed ? heading.schema.type : undefined;
    const decodeListProperties = ({ element }: { element: HTMLElement }) => {
      const listParent = element.closest('ul, ol') as HTMLElement | null;
      const readNumber = (value: null | string | undefined) => {
        if (!value) return;
        const parsed = Number(value);
        return isListOrdinal(parsed) ? parsed : undefined;
      };
      const checkedValue = element.dataset.checked;
      const checked =
        checkedValue === '' || checkedValue === 'true'
          ? true
          : checkedValue === 'false'
            ? false
            : undefined;
      const encodedListType = isListType(element.dataset.listType)
        ? element.dataset.listType
        : undefined;
      const encodedListStart = readNumber(element.dataset.listStart);
      const encodedListRestart = readNumber(element.dataset.listRestart);
      const parentStartAttribute = readNumber(
        listParent?.getAttribute('start')
      );
      const parentListStart =
        parentStartAttribute ?? (listParent?.tagName === 'OL' ? 1 : undefined);
      const currentIndent = readNumber(element.dataset.indent) ?? 1;
      const listStyle =
        element.dataset.listStyle ||
        element.style.listStyleType ||
        listParent?.style.listStyleType ||
        undefined;
      const standaloneListType = listParent
        ? undefined
        : listStyle === undefined ||
            BULLETED_LIST_STYLES.some((style) => style === listStyle)
          ? ListType.Bulleted
          : ListType.Numbered;
      const listType = encodedListType
        ? encodedListType
        : checked !== undefined
          ? ListType.Task
          : listParent?.tagName === 'OL'
            ? ListType.Numbered
            : listParent?.tagName === 'UL'
              ? ListType.Bulleted
              : standaloneListType;
      const normalizedListStyle =
        (listType === ListType.Bulleted && listStyle === ListStyle.Disc) ||
        (listType === ListType.Numbered && listStyle === ListStyle.Decimal) ||
        listType === ListType.Task
          ? undefined
          : listStyle;
      let previousList = listParent?.previousElementSibling ?? null;
      let previousItem: HTMLElement | null = null;
      let previousItemCount = 0;

      while (
        previousList instanceof HTMLElement &&
        (previousList.tagName === 'OL' || previousList.tagName === 'UL')
      ) {
        const candidates = Array.from(
          previousList.querySelectorAll<HTMLElement>(':scope > li')
        );
        const candidate = candidates.at(-1);

        if (!candidate) break;

        const previousIndent = readNumber(candidate.dataset.indent) ?? 1;

        if (previousIndent > currentIndent) {
          previousList = previousList.previousElementSibling;
          continue;
        }
        if (previousIndent === currentIndent) {
          previousItem = candidate;
          previousItemCount = candidates.length;
        }
        break;
      }
      const previousStart =
        previousList instanceof HTMLElement
          ? readNumber(previousList.getAttribute('start'))
          : undefined;
      const previousEncodedListType = isListType(previousItem?.dataset.listType)
        ? previousItem.dataset.listType
        : undefined;
      const previousChecked = previousItem?.dataset.checked;
      const previousListType = previousEncodedListType
        ? previousEncodedListType
        : previousChecked === '' ||
            previousChecked === 'true' ||
            previousChecked === 'false'
          ? ListType.Task
          : previousList instanceof HTMLElement && previousList.tagName === 'OL'
            ? ListType.Numbered
            : previousList instanceof HTMLElement &&
                previousList.tagName === 'UL'
              ? ListType.Bulleted
              : undefined;
      const previousListStyle =
        previousItem?.dataset.listStyle ||
        previousItem?.style.listStyleType ||
        (previousList instanceof HTMLElement
          ? previousList.style.listStyleType
          : undefined) ||
        undefined;
      const hasPreviousCompatibleItem =
        previousItem !== null &&
        previousListType !== undefined &&
        listType !== undefined &&
        previousListType === listType &&
        normalizeListStyle(previousListType, previousListStyle) ===
          normalizeListStyle(listType, listStyle) &&
        (readNumber(previousItem.dataset.indent) ?? 1) === currentIndent;
      const isPlateContinuation =
        hasPreviousCompatibleItem &&
        encodedListType !== undefined &&
        previousEncodedListType === encodedListType &&
        parentListStart !== undefined &&
        previousStart !== undefined &&
        parentListStart === previousStart + previousItemCount;
      const isFirstItem = listParent
        ? [...listParent.children]
            .filter((child) => child.tagName === 'LI')
            .indexOf(element) === 0
        : false;
      const structuralStart =
        encodedListStart === undefined &&
        encodedListRestart === undefined &&
        isFirstItem &&
        !isPlateContinuation &&
        (parentStartAttribute !== undefined || hasPreviousCompatibleItem)
          ? parentListStart
          : undefined;
      const listStart =
        encodedListStart ??
        (hasPreviousCompatibleItem ? undefined : structuralStart);
      const listRestart =
        encodedListRestart ??
        (hasPreviousCompatibleItem ? structuralStart : undefined);
      return {
        ...(checked === undefined ? {} : { checked }),
        ...(listType !== ListType.Numbered || listStart === undefined
          ? {}
          : { listStart }),
        ...(listType !== ListType.Numbered || listRestart === undefined
          ? {}
          : { listRestart }),
        ...(normalizedListStyle ? { listStyle: normalizedListStyle } : {}),
        ...(listType ? { listType } : {}),
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
                const listStyle = htmlElement.style.listStyleType;
                if (listStyle) {
                  htmlElement.dataset.listStyle = listStyle;
                } else {
                  // Fallback to parent list type
                  const listParent = element.closest('ul, ol');
                  if (listParent) {
                    const parentListStyle = (listParent as HTMLElement).style
                      .listStyleType;
                    if (parentListStyle) {
                      htmlElement.dataset.listStyle = parentListStyle;
                    } else if (listParent.tagName === 'UL') {
                      delete htmlElement.dataset.listStyle;
                    } else if (listParent.tagName === 'OL') {
                      delete htmlElement.dataset.listStyle;
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
          encode: ({ content, node, state }) => {
            const checked = node.checked;
            const listStart = node.listStart;
            const listRestart = node.listRestart;
            const listStyle = node.listStyle;
            const listType = node.listType;
            const ordinal = getListOrdinal(
              state,
              node,
              store.get().getSiblingListOptions,
              headingType
            );
            return {
              attributes: {
                start:
                  listType === ListType.Numbered
                    ? (ordinal ?? listRestart ?? listStart)
                    : undefined,
              },
              children: [
                {
                  attributes: {
                    'data-checked':
                      checked === undefined ? undefined : String(checked),
                    'data-indent':
                      typeof node.indent === 'number' ? node.indent : undefined,
                    'data-list-restart': listRestart,
                    'data-list-start': listStart,
                    'data-list-style': listStyle,
                    'data-list-type': listType,
                  },
                  children: content,
                  patchTarget: true,
                  tag: 'li',
                },
              ],
              style: {
                listStyleType: listStyle,
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
              attributes: { 'data-list-type': true },
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
    match: ({ node }) => isListItem(node),
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

            list.children.forEach((listItem, index) => {
              const checked = listItem.checked;
              const task = typeof checked === 'boolean';
              const listType = task
                ? ListType.Task
                : ordered
                  ? ListType.Numbered
                  : ListType.Bulleted;

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
                  ...(task ? { checked } : {}),
                  indent,
                  listType,
                  ...(ordered &&
                  index === 0 &&
                  childIndex === 0 &&
                  startIndex !== 1
                    ? { listRestart: startIndex }
                    : {}),
                  type:
                    image.installed && element.type === image.schema.type
                      ? element.type
                      : type,
                });
              });

              nested.forEach((child) => {
                if (child.type === 'list') {
                  items.push(...parseList(child, indent + 1, child.start ?? 1));
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

          return parseList(node, 1, node.start ?? 1);
        },
      },
    }),
  }))
  .extend(({ editor }) => ({
    api: () => {
      const heading = editor.plugin(PLUGINS.heading);
      const headingType = heading.installed ? heading.schema.type : undefined;
      const isSequenceBoundary = (siblingNode: Element, currentNode: Element) =>
        !!getSequenceSiblingOptions(undefined, headingType).breakQuery?.(
          siblingNode,
          currentNode
        );

      return {
        getSequenceSiblingOptions: (options?: Partial<GetSiblingListOptions>) =>
          getSequenceSiblingOptions(options, headingType),
        isSequenceBoundary,
      };
    },
    read: ({ state, store }) => {
      const getSibling = (
        entry: NodeEntry<Element>,
        options: GetSiblingListOptions
      ) => getListSibling(state, entry, options);

      const getPrevious = (
        entry: NodeEntry<Element>,
        options?: Partial<GetSiblingListOptions>
      ): NodeEntry<Element> | undefined =>
        getSibling(entry, {
          getPreviousEntry: ([, currentPath]) => {
            if (!PathApi.hasPrevious(currentPath)) return;
            const previousPath = PathApi.previous(currentPath);
            const previousNode = state.nodes.get(previousPath, {
              match: ElementApi.isElement,
            })?.[0];

            if (!previousNode) return;

            return [previousNode, previousPath];
          },
          ...options,
          getNextEntry: undefined,
        });

      return {
        /** Get the next indent-list item. */
        getNext: (
          entry: NodeEntry<Element>,
          options?: Partial<GetSiblingListOptions>
        ): NodeEntry<Element> | undefined =>
          getSibling(entry, {
            getNextEntry: ([, currentPath]) => {
              const nextPath = PathApi.next(currentPath);
              const nextNode = state.nodes.get(nextPath, {
                match: ElementApi.isElement,
              })?.[0];

              if (!nextNode) return;

              return [nextNode, nextPath];
            },
            ...options,
            getPreviousEntry: undefined,
          }),
        /** Get the previous indent-list item. */
        getPrevious,
        ordinal: (element: Element) => {
          const heading = editor.plugin(PLUGINS.heading);

          return getListOrdinal(
            state,
            element,
            store.get().getSiblingListOptions,
            heading.installed ? heading.schema.type : undefined
          );
        },
        expandItemsWithChildren: (entries: readonly NodeEntry<Element>[]) => {
          const expandedEntries: NodeEntry<Element>[] = [];
          const processedKeys = new Set<NodeKey>();

          entries.forEach(([, path]) => {
            const liveEntry = state.nodes.get(path, {
              match: ElementApi.isElement,
            });

            if (!liveEntry) return;
            const [node] = liveEntry;
            const key = state.key(path);

            if (!key || processedKeys.has(key)) return;
            expandedEntries.push(liveEntry);
            processedKeys.add(key);
            const parentIndent = getListIndent(node);

            if (!isListItem(node)) return;
            let currentPath = path;

            while (true) {
              const nextPath = PathApi.next(currentPath);
              const nextNode = state.nodes.get(nextPath, {
                match: ElementApi.isElement,
              })?.[0];

              if (!nextNode) break;
              const nextIndent = getListIndent(nextNode);

              if (!isListItem(nextNode) || nextIndent <= parentIndent) {
                break;
              }
              const childKey = state.key(nextPath);

              if (childKey && !processedKeys.has(childKey)) {
                expandedEntries.push([nextNode, nextPath]);
                processedKeys.add(childKey);
              }
              currentPath = nextPath;
            }
          });

          return expandedEntries;
        },
        isActive: ({
          style,
          type,
        }: {
          style?: ListStyle | (string & {});
          type: ListType;
        }): boolean => {
          const selection = state.selection();

          if (!selection) return false;
          const normalizedStyle = normalizeListStyle(type, style);

          return state.nodes.some({
            match: (node) => {
              if (!ElementApi.isElement(node)) return false;

              return (
                node.listType === type &&
                (style === undefined ||
                  getElementListStyle(node) === normalizedStyle)
              );
            },
          });
        },
      };
    },
  }))
  .extend(({ editor, plugin, store }) => ({
    override: {
      plugins: {
        [PLUGINS.indent]: {
          targetPlugins: plugin.targetPlugins,
        },
      },
    },
    update: ({ tx }) => ({
      indent: ({
        type = ListType.Bulleted,
        ...options
      }: IndentListOptions = {}) => {
        const listStyle = normalizeListStyle(type, options.listStyle);
        const at = options.at ?? tx.selection() ?? undefined;

        tx.indent.change({
          nodes: {
            at,
          },
          offset: 1,
          setNodeProps: () => ({
            ...(listStyle === undefined ? {} : { listStyle }),
            listType: type,
          }),
        });

        const match = getInjectMatch(editor, plugin);
        const entries = tx.nodes.toArray({
          at,
          match: (node, path): node is Element =>
            ElementApi.isElement(node) &&
            tx.schema.isBlock(node) &&
            match(node, path),
          mode: 'lowest',
        });

        entries.forEach(([node, path]) => {
          if (type === ListType.Task) {
            tx.nodes.set(
              {
                checked:
                  typeof node.checked === 'boolean' ? node.checked : false,
              },
              { at: path }
            );
            tx.nodes.unset(['listRestart', 'listStart', 'listStyle'], {
              at: path,
            });
            return;
          }

          if (Object.hasOwn(node, 'checked')) {
            tx.nodes.unset('checked', { at: path });
          }
          if (listStyle === undefined && Object.hasOwn(node, 'listStyle')) {
            tx.nodes.unset('listStyle', { at: path });
          }
          if (type === ListType.Bulleted) {
            tx.nodes.unset(['listRestart', 'listStart'], { at: path });
          }
        });
      },
      outdent: (options: OutdentListOptions = {}) => {
        tx.indent.change({
          nodes: {
            at: options.at,
          },
          offset: -1,
          unsetNodeProps: [
            'checked',
            'listRestart',
            'listStart',
            'listStyle',
            'listType',
          ],
        });
      },
      toggle: ({
        at = tx.selection() ?? undefined,
        getSiblingListOptions,
        listRestart,
        listStart,
        listStyle,
        type,
      }: ToggleListOptions) => {
        if (!at || (PathApi.isPath(at) && at.length === 0)) return;
        if (listStart !== undefined && listRestart !== undefined) {
          throw new Error(
            'List toggle accepts either listStart or listRestart, not both.'
          );
        }

        const match = getInjectMatch(editor, plugin);
        const entries = tx.nodes.toArray({
          at,
          match: (node, path): node is Element =>
            ElementApi.isElement(node) &&
            tx.schema.isBlock(node) &&
            match(node, path),
          mode: 'lowest',
        });

        if (entries.length === 0) return;

        const normalizedListStyle = normalizeListStyle(type, listStyle);
        const isSameList = ([node]: NodeEntry<Element>) =>
          node.listType === type &&
          (listStyle === undefined ||
            getElementListStyle(node) === normalizedListStyle);
        const unsetList =
          listStart === undefined &&
          listRestart === undefined &&
          entries.every(isSameList);

        if (unsetList) {
          entries.forEach(([node, path]) => {
            const indent = Number(node.indent ?? 0);

            tx.nodes.unset(
              ['checked', 'listRestart', 'listStart', 'listStyle', 'listType'],
              { at: path }
            );

            if (indent > 1) {
              tx.nodes.set({ indent: indent - 1 }, { at: path });
            } else {
              tx.nodes.unset('indent', { at: path });
            }
          });
          return;
        }

        const targets = [...entries];
        const boundaryPath = entries[0][1];
        if (entries.length === 1 && isListItem(entries[0][0])) {
          const heading = editor.plugin(PLUGINS.heading);
          const siblingOptions = getSequenceSiblingOptions(
            {
              ...store.get().getSiblingListOptions,
              ...getSiblingListOptions,
            },
            heading.installed ? heading.schema.type : undefined
          );
          let sibling = Object.hasOwn(entries[0][0], 'listRestart')
            ? undefined
            : tx.list.getPrevious(entries[0], siblingOptions);

          while (sibling) {
            targets.unshift(sibling);
            if (Object.hasOwn(sibling[0], 'listRestart')) break;
            sibling = tx.list.getPrevious(sibling, siblingOptions);
          }

          sibling = tx.list.getNext(entries[0], siblingOptions);
          while (sibling) {
            if (Object.hasOwn(sibling[0], 'listRestart')) break;
            targets.push(sibling);
            sibling = tx.list.getNext(sibling, siblingOptions);
          }
        }

        targets.forEach(([node, path]) => {
          const currentIndent = Number(node.indent ?? 0);
          const indent = isListItem(node)
            ? Math.max(1, currentIndent || 1)
            : currentIndent + 1;
          const isBoundary = PathApi.equals(path, boundaryPath);

          tx.nodes.set(
            {
              indent,
              listType: type,
              ...(type === ListType.Task
                ? {
                    checked:
                      typeof node.checked === 'boolean' ? node.checked : false,
                  }
                : {}),
              ...(normalizedListStyle === undefined
                ? {}
                : { listStyle: normalizedListStyle }),
              ...(type === ListType.Numbered &&
              listRestart !== undefined &&
              isBoundary
                ? { listRestart }
                : {}),
              ...(type === ListType.Numbered &&
              listStart !== undefined &&
              isBoundary
                ? { listStart }
                : {}),
            },
            { at: path }
          );

          if (type !== ListType.Task && Object.hasOwn(node, 'checked')) {
            tx.nodes.unset('checked', { at: path });
          }
          if (
            normalizedListStyle === undefined &&
            Object.hasOwn(node, 'listStyle')
          ) {
            tx.nodes.unset('listStyle', { at: path });
          }
          if (type !== ListType.Numbered) {
            tx.nodes.unset(['listRestart', 'listStart'], { at: path });
          } else if (isBoundary && listRestart !== undefined) {
            tx.nodes.unset('listStart', { at: path });
          } else if (isBoundary && listStart !== undefined) {
            tx.nodes.unset('listRestart', { at: path });
          }
        });
      },
    }),
  }))
  .extend((context) => ({
    commands: ({ around, handle }) => {
      void context;

      return [
        handle(editorCommands.delete, ({ input, state }) => {
          if (input.direction !== 'backward') return false;
          const nodeEntry = state.nodes.block();
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
            !isListItem(nodeEntry[0]) ||
            state.selection.isExpanded() ||
            !isAtBlockStart
          ) {
            return false;
          }

          return state.transaction((tx) => {
            tx.list.outdent({ at: nodeEntry[1] });
          });
        }),
        around(editorCommands.insertBreak, ({ state, next }) => {
          const nodeEntry = state.nodes.block();
          const selection = state.selection();

          if (
            !nodeEntry ||
            !selection ||
            !isListItem(nodeEntry[0]) ||
            state.selection.isExpanded()
          ) {
            return false;
          }
          if (state.nodes.isEmpty(nodeEntry[0])) {
            return state.transaction((tx) => {
              tx.list.outdent({ at: nodeEntry[1] });
            });
          }

          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            const nextPath = PathApi.next(nodeEntry[1]);
            const nextNode = tx.nodes.get(nextPath, {
              match: ElementApi.isElement,
            })?.[0];

            if (
              nextNode &&
              (Object.hasOwn(nextNode, 'listRestart') ||
                Object.hasOwn(nextNode, 'listStart'))
            ) {
              tx.nodes.unset(['listRestart', 'listStart'], {
                at: nextPath,
              });
            }
          });
        }),
        around(editorCommands.insertBreak, ({ state, next }) => {
          const nodeEntry = state.nodes.block();

          if (!nodeEntry) return false;

          const [node, path] = nodeEntry;
          const selection = state.selection();

          if (
            node.listType !== ListType.Task ||
            !selection ||
            state.selection.isExpanded() ||
            !state.points.isEnd(selection.focus, path)
          ) {
            return false;
          }

          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            const newEntry = tx.nodes.above();

            if (newEntry) tx.nodes.set({ checked: false }, { at: newEntry[1] });
          });
        }),
      ];
    },
  }))
  .extend({
    corrections: [
      {
        event: 'properties',
        correct({ entry: [node, path], tx }) {
          if (!ElementApi.isElement(node)) return;

          if (
            node.listType !== ListType.Task &&
            Object.hasOwn(node, 'checked')
          ) {
            tx.nodes.unset('checked', { at: path });
          }
          if (node.listType !== ListType.Numbered) {
            tx.nodes.unset(['listRestart', 'listStart'], { at: path });
          } else if (
            Object.hasOwn(node, 'listRestart') &&
            Object.hasOwn(node, 'listStart')
          ) {
            tx.nodes.unset('listStart', { at: path });
          }
          if (
            (node.listType === undefined || node.listType === ListType.Task) &&
            Object.hasOwn(node, 'listStyle')
          ) {
            tx.nodes.unset('listStyle', { at: path });
          }
        },
      },
    ],
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
        type: [codeBlock.schema.type],
      });
    },
    trigger: ' ',
    match: ({ variant }) => variant,
    apply: ({ tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.list.toggle({ type: ListType.Bulleted });

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
        type: [codeBlock.schema.type],
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
        listStart: match.start ?? 1,
        type: ListType.Numbered,
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
        type: [codeBlock.schema.type],
      });
    },
    trigger: ' ',
    match: ({ checked }) => (checked ? '[x]' : '[]'),
    apply: ({ checked, tx }, match) => {
      tx.text.delete({ at: match.range });
      tx.list.toggle({ type: ListType.Task });
      tx.nodes.set({
        checked,
        listType: ListType.Task,
      });

      return true;
    },
  }),
};

/** Element carrying the Indent and List schema capabilities. */
export type ListElement = ElementWith<
  typeof BaseIndentPlugin | typeof BaseListPlugin,
  'indent' | 'listType'
>;
