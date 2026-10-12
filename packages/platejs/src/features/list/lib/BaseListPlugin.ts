import {
  BaseParagraphPlugin,
  ContentSlice,
  defineInputRule,
  definePlugin,
  editorCommands,
  editorReads,
  ElementApi,
  getInjectMatch,
  matchBlockStart,
  PathApi,
  PLUGINS,
  property,
  RangeApi,
  schema,
  SelectionApi,
  target,
  TextApi,
  type DefinitionOf,
  type Descendant,
  type Editor,
  type EditorCoreStateView,
  type Element,
  type ElementWith,
  type Location,
  type InsertTextInputRuleReadContext,
  type NodeEntry,
  type NodeKey,
  type NodeSelection,
  type NodeTarget,
  NodeApi,
  type Path,
  type BlockInsertOptions,
  type BlockUpsertOptions,
} from '../../../core';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
import {
  isHtmlBlockElement,
  traverseHtmlElements,
} from '../../../lib/plugins/html/htmlDom';
import { BaseIndentPlugin } from '../../indent';
import {
  createListId,
  findContinuedItem,
  getListRunSiblings,
  hasNeighborInList,
  joinInsertedListItem,
  landListContent,
  readListPosition,
  resolveListIdentity,
} from './listIdentity.internal';
import {
  applyListCommit,
  getDocumentListOrdinal,
  getElementListStyle,
  getHeadingType,
  getListIndent,
  isListItem,
  isListLevels,
  isListType,
  LIST_TYPES,
  normalizeListStyle,
  readListOrdinal,
} from './listIndex.internal';

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

const DEFAULT_LIST_TARGET_PLUGINS = [
  BaseParagraphPlugin,
  PLUGINS.image,
] as const;

export type OutdentListOptions = {
  at?: Location | NodeSelection;
};

export type ToggleListOptions = {
  at?: Location | NodeSelection;
  /** Start for the first target, applied only while that item opens numbering at its level. */
  listStart?: number;
  listStyle?: ListStyle | (string & {});
  type: ListType;
};

export const BULLETED_LIST_STYLES = [
  ListStyle.Disc,
  ListStyle.Circle,
  ListStyle.Square,
  ListStyle.DisclosureOpen,
  ListStyle.DisclosureClosed,
] as const;

export function isOrderedList(element: Element) {
  return element.listType === ListType.Numbered;
}

const LIST_FIELDS = [
  'checked',
  'listId',
  'listLevels',
  'listRestart',
  'listStart',
  'listStyle',
  'listType',
] as const;

const getPluginType = (editor: Editor, key: string) => {
  const descriptor = getCompiledPlatePlugin(editor, key);

  return descriptor ? editor.plugin(descriptor).schema.type : undefined;
};

// A code block outside List's targets still owns Tab, so the check reads the
// whole selection rather than the filtered entries.
const selectsCodeBlock = (editor: Editor) => {
  const codeBlockType = getPluginType(editor, PLUGINS.codeBlock);

  return (
    codeBlockType !== undefined &&
    editor.read.nodes.some({ type: codeBlockType })
  );
};

const handleListTab = (
  editor: Editor,
  match: (node: Descendant, path: Path) => boolean
) => {
  if (!editor.read.selection()) return false;

  const entries = editor.read.nodes.blocks({ match, mode: 'lowest' });

  if (!entries.some(([node]) => isListItem(node)) || selectsCodeBlock(editor)) {
    return false;
  }

  editor.update((tx) => {
    for (const [node, path] of entries) {
      // getListIndent reads an omitted indent as level 1, and Indent as 0.
      if (isListItem(node) && typeof node.indent !== 'number') {
        tx.nodes.set({ indent: 1 }, { at: path });
      }
      tx.plugin(BaseIndentPlugin).increase({ nodes: { at: path } });
    }
  });

  return true;
};

const handleListUntab = (
  editor: Editor,
  match: (node: Descendant, path: Path) => boolean
) => {
  if (!editor.read.selection()) return false;

  const entries = editor.read.nodes.blocks({ match, mode: 'lowest' });
  const isRootItem = ([node]: NodeEntry<Element>) =>
    isListItem(node) && getListIndent(node) <= 1;

  if (!entries.some(([node]) => isListItem(node)) || selectsCodeBlock(editor)) {
    return false;
  }

  const quoteType = getPluginType(editor, PLUGINS.blockquote);
  const isQuoted = ([, path]: NodeEntry<Element>) =>
    quoteType !== undefined &&
    !!editor.read.nodes.above({
      at: path,
      match: (node, abovePath) =>
        abovePath.length < path.length &&
        ElementApi.isElement(node) &&
        node.type === quoteType,
    });
  const lifted = entries.filter(
    (entry) =>
      (isRootItem(entry) || (!isListItem(entry[0]) && !entry[0].indent)) &&
      isQuoted(entry)
  );
  const outdented = entries.filter(
    (entry) => !isRootItem(entry) && Number(entry[0].indent ?? 0) > 0
  );

  if (lifted.length > 0 || outdented.length > 0) {
    editor.update((tx) => {
      for (const [, path] of outdented) {
        tx.plugin(BaseIndentPlugin).decrease({ nodes: { at: path } });
      }
      for (const [node, path] of lifted.toReversed()) {
        if (isListItem(node)) {
          tx.nodes.unset([...LIST_FIELDS, 'indent'], { at: path });
        }
        tx.nodes.lift({ at: path });
      }
    });
  }

  return true;
};

const isListOrdinal = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value);

// Per sibling array and indent, the index of the last list item deeper than
// the indent in the unbroken run starting at each asked sibling, or -1 when
// that sibling starts no run. A lookup walks a run once and records every
// sibling in it, so hovers and keyboard steps never walk a family twice and
// read at most one sibling past the run they ask about.
const RUN_ENDS = new WeakMap<
  readonly Descendant[],
  Map<number, Map<number, number>>
>();

const runEndAt = (
  siblings: readonly Descendant[],
  indent: number,
  start: number
) => {
  let byIndent = RUN_ENDS.get(siblings);

  if (!byIndent) {
    byIndent = new Map();
    RUN_ENDS.set(siblings, byIndent);
  }

  let ends = byIndent.get(indent);

  if (!ends) {
    ends = new Map();
    byIndent.set(indent, ends);
  }

  const known = ends.get(start);

  if (known !== undefined) return known;

  let index = start;

  while (index < siblings.length && !ends.has(index)) {
    const node = siblings[index];

    if (
      !ElementApi.isElement(node) ||
      !isListItem(node) ||
      getListIndent(node) <= indent
    ) {
      break;
    }
    index += 1;
  }

  if (index === start) {
    ends.set(start, -1);

    return -1;
  }

  const joined = ends.get(index);
  const last = joined !== undefined && joined >= 0 ? joined : index - 1;

  for (let visited = start; visited < index; visited += 1) {
    ends.set(visited, last);
  }

  return last;
};

const expandListFamilies = (
  state: Pick<EditorCoreStateView, 'key' | 'nodes'>,
  entries: ReadonlyArray<NodeEntry<Element>>
) => {
  const expandedEntries: Array<NodeEntry<Element>> = [];
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
};

export const BaseListPlugin = definePlugin(PLUGINS.list, {
  dependencies: [BaseIndentPlugin],
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
      listId: schema.elementProperty(property.string(), {
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listLevels: schema.elementProperty(
        property.json({ validate: isListLevels, validationVersion: 1 }),
        {
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
  targetPlugins: DEFAULT_LIST_TARGET_PLUGINS,
  formats: ({ defineFormats }) => {
    const readListLevels = (value: string | undefined) => {
      try {
        const parsed: unknown = JSON.parse(value ?? '');

        return isListLevels(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    };
    const decodeListProperties = ({
      element,
      preserve,
    }: {
      element: HTMLElement;
      preserve: (...attributes: readonly string[]) => void;
    }) => {
      const listParent = element.closest('ul, ol') as HTMLElement | null;
      const readNumber = (value: null | string | undefined) => {
        if (!value) return undefined;
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
      const listStart = readNumber(element.dataset.listStart);
      const listRestart = readNumber(element.dataset.listRestart);
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
      const listLevels = readListLevels(element.dataset.listLevels);

      if (checked !== undefined) preserve('data-checked');
      if (listRestart !== undefined) preserve('data-list-restart');
      if (listStart !== undefined) preserve('data-list-start');
      if (element.dataset.listId !== undefined) preserve('data-list-id');
      if (listLevels !== undefined) preserve('data-list-levels');
      if (element.dataset.listStyle) preserve('data-list-style');
      if (encodedListType) preserve('data-list-type');

      return {
        ...(checked === undefined ? {} : { checked }),
        // prepareDocument gave every list a fresh id for this conversion.
        ...(element.dataset.listId ? { listId: element.dataset.listId } : {}),
        ...(listLevels === undefined ? {} : { listLevels }),
        // An encoded start stays on any kind, latent until the item numbers.
        ...(listRestart === undefined ? {} : { listRestart }),
        ...(listStart === undefined ? {} : { listStart }),
        ...(normalizedListStyle ? { listStyle: normalizedListStyle } : {}),
        ...(listType ? { listType } : {}),
      };
    };

    // One fresh id per source list in each conversion, so a paste never joins
    // an unrelated list that shares an id.
    const assignHtmlListIds = (body: HTMLElement) => {
      const fresh = new Map<string, string>();
      const remapped = (source: string) => {
        let id = fresh.get(source);

        if (!id) {
          id = createListId();
          fresh.set(source, id);
        }

        return id;
      };

      for (const element of Array.from(
        body.querySelectorAll<HTMLElement>('[data-list-id]')
      )) {
        element.dataset.listId = remapped(element.dataset.listId ?? '');
      }

      const nestedOwners = new Set<globalThis.Element>();
      const previousByIndent = new Map<
        string,
        { id: string; next: number; owner: globalThis.Element | null }
      >();

      for (const list of Array.from(
        body.querySelectorAll<HTMLElement>('ol, ul')
      )) {
        const listItems = Array.from(list.children).filter(
          (child): child is HTMLElement => child.tagName === 'LI'
        );

        if (list.dataset.listId !== undefined && listItems.length > 0) {
          for (const { dataset } of listItems) {
            dataset.listId ??= list.dataset.listId;
            if (
              list.dataset.listLevels &&
              dataset.listId === list.dataset.listId
            ) {
              dataset.listLevels ??= list.dataset.listLevels;
            }
          }
          delete list.dataset.listId;
          delete list.dataset.listLevels;
          continue;
        }

        const items = listItems.filter(({ dataset }) => !dataset.listId);

        if (items.length === 0) continue;

        const owner = list.parentElement?.closest('ol, ul')
          ? list.previousElementSibling
          : null;
        const start = Number(list.getAttribute('start') ?? 1);
        const indent = items[0].dataset.indent ?? '1';
        const previous = previousByIndent.get(indent);
        const continues =
          list.tagName === 'OL' &&
          previous?.owner === owner &&
          start === previous.next;
        let id: string | undefined;

        if (owner?.tagName === 'LI' && !nestedOwners.has(owner)) {
          nestedOwners.add(owner);
          id = (owner as HTMLElement).dataset.listId;
        } else if (continues) {
          ({ id } = previous);
        }
        id ??= createListId();
        if (
          list.tagName === 'OL' &&
          !continues &&
          start !== 1 &&
          isListOrdinal(start)
        ) {
          items[0].dataset.listStart ??= String(start);
        }
        for (const listItem of items) listItem.dataset.listId = id;
        if (list.tagName === 'OL') {
          previousByIndent.set(indent, {
            id,
            next: start + items.length,
            owner,
          });
        }
      }
    };

    return defineFormats({
      html: [
        {
          createsElement: true,
          prepareDocument: ({ document }) => {
            const { body } = document;

            if (!body.querySelector('ul, ol, li, [data-list-id]')) return;

            // The registry static kit draws an item's list inside its block,
            // as h2 > ol > li or pre > code > ol > li.
            const moveOut = (list: globalThis.Element) => {
              const host = list.parentElement;
              const item = list.firstElementChild;

              if (
                !host ||
                !item ||
                !(host.tagName === 'CODE'
                  ? host.parentElement?.tagName === 'PRE'
                  : /^(BLOCKQUOTE|H[1-6]|PRE)$/u.test(host.tagName)) ||
                Array.from(host.childNodes).some(
                  (node) =>
                    node !== list &&
                    (node.nodeName !== '#text' || node.textContent?.trim())
                )
              ) {
                return undefined;
              }
              host.replaceWith(list);
              host.replaceChildren(...Array.from(item.childNodes));
              item.append(host);

              return host;
            };

            for (const list of Array.from(
              body.querySelectorAll('ul[data-list-id], ol[data-list-id]')
            )) {
              if (
                list.children.length !== 1 ||
                list.firstElementChild?.tagName !== 'LI'
              ) {
                continue;
              }
              if (
                moveOut(list)?.tagName === 'CODE' &&
                list.parentElement?.tagName === 'PRE'
              ) {
                moveOut(list);
              }
            }

            // First pass: flatten nested UL/OL that are inside LI elements
            // We need to move them to be siblings of their parent LI
            const lisWithNestedLists: Array<{
              li: globalThis.Element;
              nestedLists: globalThis.Element[];
            }> = [];
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
              li.after(...nestedLists);
            });

            // Second pass: process LI elements (now without nested lists inside them)
            traverseHtmlElements(body, (element) => {
              if (element.tagName === 'LI') {
                const htmlElement = element as HTMLElement;
                const { childNodes } = element;
                const blocks = Array.from(element.children).filter(
                  isHtmlBlockElement
                );
                // An item's paragraphs are its text, so they flatten. Another
                // block the item holds alone, such as a heading or an image
                // figure, stays: decoding lists that block when its type can be.
                const holdsBlock =
                  blocks.length === 1 &&
                  blocks[0].tagName !== 'P' &&
                  Array.from(childNodes).every(
                    (child) =>
                      child === blocks[0] ||
                      child.nodeType === 8 ||
                      (child.nodeType === 3 && !child.textContent?.trim())
                  );

                if (!holdsBlock) {
                  // Process li children and flatten block elements
                  const liChildren: globalThis.Node[] = [];
                  childNodes.forEach((child) => {
                    if (child.nodeType === 1) {
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
                }

                // Keep explicit mapping metadata, then honor Google Docs.
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
                      indent += 1;
                    }
                    parent = parent.parentElement;
                  }

                  // Set indent level as data attribute
                  if (indent > 0) {
                    htmlElement.dataset.indent = String(indent);
                  }
                }

                if (htmlElement.dataset.listStyle) return false;

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

            assignHtmlListIds(body);
          },
          decode: decodeListProperties,
          encode: ({ content, document, node, preserve, root }) => {
            preserve(
              'checked',
              'listId',
              'listLevels',
              'listRestart',
              'listStart',
              'listStyle',
              'listType'
            );
            const { checked } = node;
            const { listStart } = node;
            const { listRestart } = node;
            const { listStyle } = node;
            const { listType } = node;
            const ordinal = getDocumentListOrdinal(document, root, node);
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
                    // An empty id marks the root's default list, so a paste keeps
                    // those items in one list instead of regrouping them by element.
                    'data-list-id':
                      typeof node.listId === 'string' ? node.listId : '',
                    'data-list-levels': isListLevels(node.listLevels)
                      ? JSON.stringify(node.listLevels)
                      : undefined,
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
      removeEmpty: ({ node }) => (isListItem(node) ? false : undefined),
    },
  },
})
  .extend(({ defineFormats }) => ({
    formats: defineFormats(BaseParagraphPlugin, {
      plainText: {
        priority: 40,
        encode: ({ children, document, node, root }) => {
          if (!node.listType) return undefined;

          const indent =
            'indent' in node && typeof node.indent === 'number'
              ? node.indent
              : 1;
          const depth = Math.max(0, indent - 1);
          const marker =
            node.listType === ListType.Task
              ? `- [${node.checked ? 'x' : ' '}]`
              : node.listType === ListType.Numbered
                ? `${getDocumentListOrdinal(document, root, node)}.`
                : '-';

          return `${'  '.repeat(depth)}${marker} ${children}`;
        },
      },
      markdown: {
        node: 'list',
        priority: 40,
        decode: ({ build, node, registry }) => {
          const imageType = registry.type(PLUGINS.image);
          const type = registry.type(BaseParagraphPlugin);

          if (!type) {
            throw new Error('List Markdown decoding requires paragraphs.');
          }
          const parseList = (
            list: typeof node,
            indent: number,
            listId: string
          ): Element[] => {
            const items: Element[] = [];
            const ordered = Boolean(list.ordered);
            const start = list.start ?? 1;

            list.children.forEach((listItem, index) => {
              const { checked } = listItem;
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
                      type,
                    },
                  ];

              nodes.forEach((child, childIndex) => {
                const element = TextApi.isText(child)
                  ? {
                      children: [child],
                      type,
                    }
                  : child;
                items.push({
                  ...element,
                  ...(task ? { checked } : {}),
                  indent,
                  listId,
                  listType,
                  ...(ordered && start !== 1 && index === 0 && childIndex === 0
                    ? { listStart: start }
                    : {}),
                  type:
                    imageType && element.type === imageType
                      ? element.type
                      : type,
                });
              });

              let sublists = 0;

              nested.forEach((child) => {
                if (child.type === 'list') {
                  sublists += 1;
                  items.push(
                    ...parseList(
                      child,
                      indent + 1,
                      sublists === 1 ? listId : createListId()
                    )
                  );
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

          return parseList(node, 1, createListId());
        },
      },
    }),
  }))
  .extend(({ editor }) => ({
    on: {
      commit({ commit }) {
        applyListCommit(editor, commit);
      },
    },
    read: ({ state }) => ({
      /**
       * Number shown for a numbered list item: its `listRestart`, or its count in
       * its list at its level, opened at its `listStart`, its level's `listLevels`
       * start, or 1. A shallower item of the list restarts deeper levels unless the
       * level's `restartAfter` says otherwise. Resolves `at` in this editor's root;
       * a known path skips node lookup. Returns `undefined` when `at` is not a
       * numbered list item there.
       */
      ordinal: (at: NodeTarget<Element>) => {
        const entry = state.nodes.get(at, { match: ElementApi.isElement });

        if (!entry) return undefined;

        return readListOrdinal(editor, state, entry[0], entry[1]);
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
    }),
  }))
  .extend(({ editor, plugin }) => ({
    override: {
      [PLUGINS.indent]: {
        targetPlugins: plugin.targetPlugins,
      },
    },
    // Each handler reads the editor the key reached: this plugin's own editor
    // misses the caret of the view that took the key.
    shortcuts: {
      tab: {
        handler: ({ editor: viewEditor }) =>
          handleListTab(viewEditor, getInjectMatch(viewEditor, plugin)),
        keys: 'tab',
        // After the table's cell navigation, and before generic indent.
        priority: 5,
      },
      untab: {
        handler: ({ editor: viewEditor }) =>
          handleListUntab(viewEditor, getInjectMatch(viewEditor, plugin)),
        keys: 'shift+tab',
        // After the table's cell navigation, and before generic indent and
        // the blockquote lift, which would strip a root item's depth.
        priority: 5,
      },
    },
    update: ({ tx }) => {
      const insertList = (
        { type }: { type: ListType },
        options: BlockInsertOptions
      ) => {
        const element = tx.schema.create(
          editor.plugin(BaseParagraphPlugin).schema.type,
          { indent: 1, listType: type }
        );

        if (options.at === undefined || options.after !== undefined) {
          tx.blocks.insertAfter(element, { ...options, at: options.after });
        } else {
          tx.nodes.insert(element, options);
        }

        const entry = tx.nodes.get(element, { match: ElementApi.isElement });

        if (entry) joinInsertedListItem(tx, entry, getHeadingType(editor));
      };
      const applyListInsertion = (
        mode: 'insert' | 'upsert',
        input: { type: ListType },
        options: BlockInsertOptions | BlockUpsertOptions = {}
      ) =>
        applyBlockInsertion({
          insert: (insertOptions) => insertList(input, insertOptions),
          matches: (block) => block.listType === input.type,
          mode,
          options,
          tx,
        });

      return {
        outdent: ({ at }: OutdentListOptions = {}) => {
          tx.indent.decrease({ nodes: { at } });

          for (const [node, path] of tx.nodes.blocks({ at, mode: 'lowest' })) {
            if (ElementApi.isElement(node) && !node.indent) {
              tx.nodes.unset([...LIST_FIELDS], { at: path });
            }
          }
        },
        clear: ({ at }: { at?: Location | NodeSelection } = {}) => {
          for (const [node, path] of tx.nodes.blocks({
            at,
            match: getInjectMatch(editor, plugin),
            mode: 'lowest',
          })) {
            if (!isListItem(node)) continue;
            tx.nodes.unset([...LIST_FIELDS, 'indent'], { at: path });
          }
        },
        insert: (input: { type: ListType }, options: BlockInsertOptions = {}) =>
          applyListInsertion('insert', input, options),
        toggle: ({ at, listStart, listStyle, type }: ToggleListOptions) => {
          if (
            (at === undefined && !tx.selection()) ||
            (PathApi.isPath(at) && at.length === 0)
          ) {
            return false;
          }

          const match = getInjectMatch(editor, plugin);
          const entries = tx.nodes.blocks({
            at,
            match,
            mode: 'lowest',
          });

          if (entries.length === 0) return false;

          const changed = (candidates: ReadonlyArray<NodeEntry<Element>>) =>
            candidates.some(([before, path]) => {
              const after = tx.nodes.get(path)?.[0];

              return (
                ElementApi.isElement(after) &&
                (before.indent !== after.indent ||
                  LIST_FIELDS.some((field) => before[field] !== after[field]))
              );
            });

          const normalizedListStyle = normalizeListStyle(type, listStyle);
          const isSameList = ([node]: NodeEntry<Element>) =>
            node.listType === type &&
            (listStyle === undefined ||
              getElementListStyle(node) === normalizedListStyle);
          const unsetList =
            listStart === undefined && entries.every(isSameList);

          if (unsetList) {
            entries.forEach(([node, path]) => {
              const indent = Number(node.indent ?? 0);

              tx.nodes.unset([...LIST_FIELDS], { at: path });

              if (indent > 1) {
                tx.nodes.set({ indent: indent - 1 }, { at: path });
              } else {
                tx.nodes.unset('indent', { at: path });
              }
            });
            return changed(entries);
          }

          const targets =
            entries.length === 1 && isListItem(entries[0][0])
              ? [
                  entries[0],
                  ...getListRunSiblings(tx, entries[0], getHeadingType(editor)),
                ]
              : [...entries];
          const boundaryPath = entries[0][1];
          const headingType = getHeadingType(editor);
          // Blocks that become list items join one list: the one the first
          // of them joins, or a fresh one.
          let identity: ReturnType<typeof resolveListIdentity> | undefined;

          targets.forEach(([node, path]) => {
            const currentIndent = Number(node.indent ?? 0);
            const indent = isListItem(node)
              ? Math.max(1, currentIndent || 1)
              : currentIndent + 1;
            const isBoundary = PathApi.equals(path, boundaryPath);

            if (!isListItem(node)) {
              identity ??= resolveListIdentity(tx, path, {
                depth: indent,
                heading: headingType !== undefined && node.type === headingType,
                headingType,
                listType: type,
                style: normalizedListStyle,
              });
            }

            tx.nodes.set(
              {
                indent,
                listType: type,
                ...(type === ListType.Task
                  ? {
                      checked:
                        typeof node.checked === 'boolean'
                          ? node.checked
                          : false,
                    }
                  : {}),
                ...(normalizedListStyle === undefined
                  ? {}
                  : { listStyle: normalizedListStyle }),
                ...(type === ListType.Numbered &&
                listStart !== undefined &&
                isBoundary
                  ? { listStart }
                  : {}),
                ...(!isListItem(node) && identity?.listId !== undefined
                  ? { listId: identity.listId }
                  : {}),
                ...(!isListItem(node) && identity?.listLevels !== undefined
                  ? { listLevels: identity.listLevels }
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
            // `listRestart` would outrank the given start, so it goes.
            if (isBoundary && listStart !== undefined) {
              tx.nodes.unset('listRestart', { at: path });
            }
          });
          return changed(targets);
        },
        restart: ({
          at,
          start = 1,
        }: { at?: Location | NodeSelection; start?: number } = {}) => {
          const [entry] = tx.nodes.blocks({
            at,
            match: (node) =>
              ElementApi.isElement(node) && node.listType === ListType.Numbered,
            mode: 'lowest',
          });

          if (!entry || entry[0].listRestart === start) return false;
          tx.nodes.set({ listRestart: start }, { at: entry[1] });

          return true;
        },
        continue: ({ at }: { at?: Location | NodeSelection } = {}) => {
          const [entry] = tx.nodes.blocks({
            at,
            match: (node) =>
              ElementApi.isElement(node) && node.listType === ListType.Numbered,
            mode: 'lowest',
          });

          if (!entry) return false;
          if (Object.hasOwn(entry[0], 'listRestart')) {
            tx.nodes.unset('listRestart', { at: entry[1] });

            return true;
          }

          const root = tx.view.root();
          const position = readListPosition(
            root ? tx.root(root) : tx.children(),
            entry[0],
            getHeadingType(editor)
          );
          const previous = position?.previousCompatible?.[0];

          if (!position || position.index !== 0 || !previous) return false;

          for (const [, path] of position.items) {
            if (typeof previous.listId === 'string') {
              tx.nodes.set({ listId: previous.listId }, { at: path });
            } else {
              tx.nodes.unset('listId', { at: path });
            }
            if (isListLevels(previous.listLevels)) {
              tx.nodes.set({ listLevels: previous.listLevels }, { at: path });
            } else {
              tx.nodes.unset('listLevels', { at: path });
            }
          }

          return true;
        },
        upsert: (input: { type: ListType }, options: BlockUpsertOptions = {}) =>
          applyListInsertion('upsert', input, options),
      };
    },
  }))
  .extend((context) => ({
    commands: ({ around, handle }) => [
      around(editorCommands.replaceSlice, ({ input, next, state }) => {
        const { options, slice } = input;
        const requested = options?.at;
        const at =
          requested === undefined
            ? (state.selection() ?? undefined)
            : NodeApi.isNode(requested)
              ? state.nodes.path(requested)
              : requested;
        const content = landListContent(
          state,
          slice.content,
          {
            block: at
              ? state.nodes.block({
                  at: RangeApi.isRange(at) ? RangeApi.start(at) : at,
                })?.[0]
              : undefined,
            kind: 'kept',
          },
          { headingType: getHeadingType(context.editor), placement: 'keep' }
        );

        return content === slice.content
          ? next()
          : next({
              ...input,
              slice: ContentSlice.withContent(slice, content, {
                open: 'preserve',
              }),
            });
      }),
      handle(editorCommands.delete, ({ input, state }) => {
        if (input.direction !== 'backward') return false;
        const selection = state.selection();
        const hasNodeSelection = state.selection.nodes().length > 0;
        const nodeEntry =
          selection && !hasNodeSelection
            ? state.nodes.block({ at: selection })
            : undefined;
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
          hasNodeSelection ||
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
        const selection = state.selection();
        const hasNodeSelection = state.selection.nodes().length > 0;
        const nodeEntry =
          selection && !hasNodeSelection
            ? state.nodes.block({ at: selection })
            : undefined;

        if (
          !nodeEntry ||
          !selection ||
          hasNodeSelection ||
          !isListItem(nodeEntry[0]) ||
          state.selection.isExpanded()
        ) {
          return next();
        }
        if (state.nodes.isEmpty(nodeEntry[0])) {
          return state.transaction((tx) => {
            tx.list.outdent({ at: nodeEntry[1] });
          });
        }

        return next();
      }),
    ],
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
          if (
            (node.listType === undefined || node.listType === ListType.Task) &&
            Object.hasOwn(node, 'listStyle')
          ) {
            tx.nodes.unset('listStyle', { at: path });
          }
        },
      },
    ],
  })
  .extend({
    readMiddleware: ({ around }) => [
      around(editorReads.transfer.source, ({ next, state }) => {
        const selection = next();
        const entries = selection.paths.flatMap((path) => {
          const entry = state.nodes.get(path, { match: ElementApi.isElement });

          return entry ? [entry] : [];
        });

        return entries.some(([node]) => isListItem(node))
          ? SelectionApi.nodes(
              expandListFamilies(state, entries).map(([, path]) => path) as [
                Path,
                ...Path[],
              ]
            )
          : selection;
      }),
      around(editorReads.transfer.landing, ({ input, next, state }) => {
        const { edge, payload, target: landingTarget } = input;

        if (payload.kind !== 'nodes') return next();

        const [first] = payload.nodes;

        if (!first || !ElementApi.isElement(first) || !isListItem(first)) {
          return next();
        }

        const parent = landingTarget[1].slice(0, -1);
        const siblings = state.nodes.children(parent);
        const indent = getListIndent(first);
        const moving = new Set<Descendant>(payload.nodes);
        let index =
          (landingTarget[1].at(-1) as number) + (edge === 'after' ? 1 : 0);
        let last = -1;

        while (index < siblings.length) {
          if (moving.has(siblings[index])) {
            index += 1;
            continue;
          }
          const end = runEndAt(siblings, indent, index);

          if (end < 0) break;
          last = end;
          index = last + 1;
        }
        while (last >= 0 && moving.has(siblings[last])) last -= 1;

        const key = last >= 0 && state.key([...parent, last]);

        return key ? { edge: 'after' as const, key } : next();
      }),
    ],
  });

export type BaseListDefinition = DefinitionOf<typeof BaseListPlugin>;

type MarkdownListRuleOptions = {
  enabled?: (context: InsertTextInputRuleReadContext) => boolean;
  priority?: number;
};

const isMarkdownListRuleEnabled = (
  context: InsertTextInputRuleReadContext,
  enabled: MarkdownListRuleOptions['enabled']
) => {
  if (enabled && !enabled(context)) return false;

  const codeBlock = context.editor.plugin(PLUGINS.codeBlock);

  if (!codeBlock.installed) return true;

  return !context.editor.read.nodes.some({
    type: [codeBlock.schema.type],
  });
};

export const BulletedListRules = {
  markdown: ({
    enabled,
    priority,
    variant = '-',
  }: MarkdownListRuleOptions & { variant?: '*' | '-' } = {}) =>
    defineInputRule(BaseListPlugin, {
      target: 'insertText',
      trigger: ' ',
      priority,
      enabled: (context) => isMarkdownListRuleEnabled(context, enabled),
      resolve: (context) => matchBlockStart(context, { match: variant }),
      apply: ({ decline, tx }, match) => {
        tx.text.delete({ at: match.range });
        if (!tx.list.toggle({ type: ListType.Bulleted })) return decline();
        return undefined;
      },
    }),
};

const readContinuedList = (
  context: InsertTextInputRuleReadContext,
  start: number
) => {
  const entry = context.getBlockEntry();

  if (!entry) return undefined;

  const [node, path] = entry;
  const indent = Number(node.indent ?? 0);
  const previous = findContinuedItem(context.editor.read, [
    {
      ...node,
      indent: isListItem(node) ? Math.max(1, indent || 1) : indent + 1,
      listType: ListType.Numbered,
    },
    path,
  ]);

  if (
    !previous ||
    context.editor.plugin(BaseListPlugin).read.ordinal(previous) !== start - 1
  ) {
    return undefined;
  }

  return {
    listId: typeof previous.listId === 'string' ? previous.listId : undefined,
    listLevels: isListLevels(previous.listLevels)
      ? previous.listLevels
      : undefined,
  };
};

export const OrderedListRules = {
  markdown: ({
    enabled,
    priority,
    variant = '.',
  }: MarkdownListRuleOptions & { variant?: '.' | ')' } = {}) =>
    defineInputRule(BaseListPlugin, {
      target: 'insertText',
      trigger: ' ',
      priority,
      enabled: (context) => isMarkdownListRuleEnabled(context, enabled),
      resolve: (context) => {
        const match = matchBlockStart(context, {
          match: new RegExp(`^(\\d+)${variant === ')' ? '\\)' : '\\.'}$`),
          resolveMatch: ({ match: digits }) => ({
            start: Number((digits as RegExpMatchArray)[1]),
          }),
        });

        return (
          match && {
            ...match,
            continued: readContinuedList(context, match.start),
          }
        );
      },
      apply: ({ decline, tx }, match) => {
        const start = match.start ?? 1;

        tx.text.delete({ at: match.range });
        if (!tx.list.toggle({ listStart: start, type: ListType.Numbered })) {
          return decline();
        }

        const { continued } = match;
        const [entry] = tx.nodes.blocks({
          match: (node) =>
            ElementApi.isElement(node) && node.listType === ListType.Numbered,
          mode: 'lowest',
        });

        if (!continued || !entry || hasNeighborInList(tx, entry)) {
          return undefined;
        }

        const [, path] = entry;

        tx.nodes.set(
          {
            ...(continued.listId === undefined
              ? {}
              : { listId: continued.listId }),
            ...(continued.listLevels === undefined
              ? {}
              : { listLevels: continued.listLevels }),
          },
          { at: path }
        );
        if (continued.listId === undefined) {
          tx.nodes.unset('listId', { at: path });
        }
        tx.nodes.unset('listStart', { at: path });

        return undefined;
      },
    }),
};

export const TaskListRules = {
  markdown: ({
    checked = false,
    enabled,
    priority,
  }: MarkdownListRuleOptions & { checked?: boolean } = {}) =>
    defineInputRule(BaseListPlugin, {
      target: 'insertText',
      trigger: ' ',
      priority,
      enabled: (context) => isMarkdownListRuleEnabled(context, enabled),
      resolve: (context) =>
        matchBlockStart(context, { match: checked ? '[x]' : '[]' }),
      apply: ({ decline, tx }, match) => {
        tx.text.delete({ at: match.range });
        if (!tx.list.toggle({ type: ListType.Task })) return decline();
        tx.nodes.set({ checked, listType: ListType.Task });
        return undefined;
      },
    }),
};

/** Element carrying the Indent and List schema capabilities. */
export type ListElement = ElementWith<
  typeof BaseIndentPlugin | typeof BaseListPlugin,
  'indent' | 'listType'
>;
