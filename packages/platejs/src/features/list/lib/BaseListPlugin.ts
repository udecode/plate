import {
  authoredVeto,
  BaseParagraphPlugin,
  defineInputRule,
  createEditorView,
  definePlugin,
  editorCommands,
  editorReads,
  ElementApi,
  getInjectMatch,
  matchBlockStart,
  PathApi,
  PLUGINS,
  property,
  schema,
  SelectionApi,
  target,
  TextApi,
  type DefinitionOf,
  type Descendant,
  type Editor,
  type Element,
  type ElementWith,
  type Location,
  type InsertTextInputRuleReadContext,
  type NodeEntry,
  type NodeKey,
  type NodeSelection,
  type NodeTarget,
  type Path,
  type BlockInsertOptions,
  type BlockUpsertOptions,
  txLocate,
  locateAt,
} from '../../../core';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';
import {
  applyBlockReleases,
  readBlockReleases,
} from '../../../internal/plugin/blockRelease';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
import { registerFirstPartyPlugin } from '../../../internal/plugin/firstPartyPlugin';
import type { MarkdownMappingDiagnosticInput } from '../../../lib/plugin/PluginFormatContext';
import { traverseHtmlElements } from '../../../lib/plugins/html/htmlDom';
import { BaseBlockquotePlugin } from '../../basic-nodes';
import { BaseIndentPlugin } from '../../indent';
import { planListConversion } from './listConversion.internal';
import {
  deeperRunEnd,
  getListFamilies,
  moveListFamilies,
  shiftListFamilyMember,
} from './listFamily.internal';
import { flattenHtmlListItem, isHtmlList } from './listHtml.internal';
import {
  adoptListBlocks,
  createListId,
  findContinuedItem,
  getListRunSiblings,
  hasNeighborInList,
  joinInsertedListItem,
  readListPosition,
  resolveListIdentity,
} from './listIdentity.internal';
import {
  applyListCommit,
  getDocumentListOrdinal,
  getElementListStyle,
  getHeadingType,
  listItemDepth,
  isListItem,
  isListLevels,
  isListType,
  LIST_FIELDS,
  LIST_TYPES,
  normalizeListStyle,
  readListOrdinal,
} from './listIndex.internal';
import { landListPaste } from './listPaste.internal';

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
  const selection = editor.read.selection();

  if (!selection) return false;

  const root = SelectionApi.root(selection);
  const view = root ? createEditorView(editor, { root }) : editor;
  const entries = view.read.nodes.blocks({ match, mode: 'lowest' });

  if (!entries.some(([node]) => isListItem(node)) || selectsCodeBlock(view)) {
    return false;
  }

  view.update((tx) => {
    moveListFamilies(editor, tx, entries, { offset: 1 });
  });

  return true;
};

const handleListUntab = (
  editor: Editor,
  match: (node: Descendant, path: Path) => boolean
) => {
  const selection = editor.read.selection();

  if (!selection) return false;

  const root = SelectionApi.root(selection);
  const view = root ? createEditorView(editor, { root }) : editor;
  const entries = view.read.nodes.blocks({ match, mode: 'lowest' });
  const isRootItem = ([node]: NodeEntry<Element>) =>
    isListItem(node) && listItemDepth(node) <= 1;

  if (!entries.some(([node]) => isListItem(node)) || selectsCodeBlock(view)) {
    return false;
  }

  const quote = editor.plugin(BaseBlockquotePlugin);
  const quoteType = quote.installed ? quote.schema.type : undefined;
  const isQuoted = ([, path]: NodeEntry<Element>) =>
    quoteType !== undefined &&
    !!view.read.nodes.above({
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
    view.update((tx) => {
      const liftedFamilies = getListFamilies(tx, lifted);
      const lifting = new Set(
        liftedFamilies.flatMap((family) => family.map(({ node }) => node))
      );

      moveListFamilies(
        editor,
        tx,
        outdented.filter(([node]) => !lifting.has(node)),
        { offset: -1 }
      );
      // A lifted root item takes its family out of the quote, each member one
      // level shallower, so the family keeps its shape.
      for (const [head, ...members] of liftedFamilies.toReversed()) {
        for (const member of members.toReversed()) {
          shiftListFamilyMember(tx, member, -1);
          tx.nodes.lift({ at: member.key });
        }
        if (isListItem(head.node)) {
          tx.nodes.unset([...LIST_FIELDS, 'indent'], { at: head.key });
        }
        tx.nodes.lift({ at: head.key });
      }
    });
  }

  return true;
};

const isListOrdinal = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value);

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
          landing: 'adopt',
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
          landing: 'adopt',
          split: 'drop',
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
      listId: schema.elementProperty(property.string(), {
        landing: 'adopt',
        target: target.types(targetElementTypes),
        typeChange: 'preserve-if-allowed',
      }),
      listLevels: schema.elementProperty(
        property.json({ validate: isListLevels, validationVersion: 1 }),
        {
          landing: 'adopt',
          target: target.types(targetElementTypes),
          typeChange: 'preserve-if-allowed',
        }
      ),
      listStyle: schema.elementProperty(property.string(), {
        landing: 'adopt',
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

        let owner = list.parentElement?.closest('ol, ul')
          ? list.previousElementSibling
          : null;

        // The item's later blocks sit between it and its nested list.
        while (owner && owner.tagName !== 'LI' && !isHtmlList(owner)) {
          owner = owner.previousElementSibling;
        }

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
          prepareDocument: ({ document, registry, report }) => {
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

            const imagesAreBlocks = registry.has(PLUGINS.image);
            const listItems: HTMLElement[] = [];
            traverseHtmlElements(body, (element) => {
              if (element.tagName === 'LI') {
                listItems.push(element as HTMLElement);
              }
              return true;
            });
            listItems.forEach((listItem) =>
              flattenHtmlListItem(listItem, imagesAreBlocks, report)
            );

            traverseHtmlElements(body, (element) => {
              if (element.tagName === 'LI') {
                const htmlElement = element as HTMLElement;

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
        decode: ({
          build,
          isInline,
          node,
          registry,
          report,
          schema: schemaView,
        }) => {
          const type = registry.type(BaseParagraphPlugin);

          if (!type) {
            throw new Error('List Markdown decoding requires paragraphs.');
          }
          // One report per lost property and block type in a list: every
          // report carries the whole list's source.
          const reported = new Set<string>();
          const reportOnce = (
            loss: string,
            diagnostic: MarkdownMappingDiagnosticInput
          ) => {
            if (reported.has(loss)) return;
            reported.add(loss);
            report(diagnostic);
          };
          const fits = (key: string, blockType: string) =>
            schemaView.property({
              key,
              placement: 'element',
              type: blockType,
            }) !== null;
          const toBlocks = (nodes: readonly Descendant[]) => {
            const blocks: Element[] = [];
            let run: Descendant[] = [];
            const flushRun = () => {
              if (run.length > 0) blocks.push({ children: run, type });
              run = [];
            };

            nodes.forEach((child) => {
              if (TextApi.isText(child) || isInline(child)) {
                run.push(child);
                return;
              }
              flushRun();
              blocks.push(child);
            });
            flushRun();

            return blocks;
          };
          const withAllowedProperties = (
            block: Element,
            properties: Readonly<Record<string, unknown>>
          ): Element => ({
            ...block,
            ...Object.fromEntries(
              Object.entries(properties).filter(([key]) => {
                if (fits(key, block.type)) return true;
                reportOnce(`${key}:${block.type}`, {
                  action: 'dropped',
                  kind: 'property',
                  message: `List Markdown omitted property "${key}" on "${block.type}": the schema does not allow it.`,
                  nodeType: node.type,
                });

                return false;
              })
            ),
          });
          // A text block the list cannot hold becomes the item's paragraph, as
          // HTML reads it, so the item keeps its place and number. Any other
          // block leaves the list and stays among its parent item's blocks.
          const toItem = (
            block: Element,
            indent: number,
            listProperties: Readonly<Record<string, unknown>>
          ): Element => {
            const properties = { indent, ...listProperties };

            if (block.type === type || fits('listType', block.type)) {
              return withAllowedProperties(block, properties);
            }

            const behavior = schemaView.element(block.type)?.behavior;
            const textBlock =
              behavior !== undefined &&
              !behavior.object &&
              !behavior.void &&
              block.children.every(
                (child) => TextApi.isText(child) || isInline(child)
              );

            if (textBlock) {
              reportOnce(`item:${block.type}`, {
                action: 'replaced',
                kind: 'element',
                message: `List Markdown replaced "${block.type}" with "${type}": the list cannot hold it.`,
                nodeType: node.type,
              });

              return withAllowedProperties(
                { children: block.children, type },
                properties
              );
            }
            reportOnce(`item:${block.type}`, {
              action: 'unwrapped',
              kind: 'element',
              message: `List Markdown unwrapped "${block.type}" from its list item: the list cannot hold it.`,
              nodeType: node.type,
            });

            return indent > 1
              ? withAllowedProperties(block, { indent })
              : block;
          };
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

              const [first, ...rest] = listItem.children;
              const opensWithList = first?.type === 'list';
              const nested = opensWithList ? listItem.children : rest;
              const [
                head = { children: [{ text: '' }], type },
                ...continuation
              ] = first && !opensWithList ? toBlocks(build(first)) : [];

              items.push(
                toItem(head, indent, {
                  ...(task ? { checked } : {}),
                  listId,
                  listType,
                  ...(ordered && start !== 1 && index === 0
                    ? { listStart: start }
                    : {}),
                })
              );
              continuation.forEach((block) => {
                items.push(
                  withAllowedProperties(block, { indent: indent + 1 })
                );
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

                toBlocks(build(child)).forEach((block) => {
                  items.push(
                    withAllowedProperties(block, { indent: indent + 1 })
                  );
                });
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

        if (!tx.blocks.insert(element, options)) return false;

        const entry = tx.nodes.get(element, { match: ElementApi.isElement });

        if (entry) joinInsertedListItem(tx, entry, getHeadingType(editor));

        return true;
      };
      const applyListInsertion = (
        mode: 'insert' | 'upsert',
        input: { type: ListType },
        options: BlockInsertOptions | BlockUpsertOptions = {}
      ) =>
        applyBlockInsertion({
          editor,
          insert: (insertOptions) => insertList(input, insertOptions),
          matches: (block) => block.listType === input.type,
          mode,
          options,
          tx,
        });

      return {
        outdent: txLocate(locateAt(0), ({ at }: OutdentListOptions = {}) => {
          const entries = tx.nodes.blocks({ at, mode: 'lowest' });
          const keys = entries.flatMap(([, path]) => tx.key(path) ?? []);

          moveListFamilies(editor, tx, entries, { offset: -1 });

          for (const key of keys) {
            const node = tx.nodes.get(key)?.[0];

            if (ElementApi.isElement(node) && !node.indent) {
              tx.nodes.unset([...LIST_FIELDS], { at: key });
            }
          }
        }),
        clear: txLocate(
          locateAt(0),
          ({ at }: { at?: Location | NodeSelection } = {}) => {
            for (const [node, path] of tx.nodes.blocks({
              at,
              match: getInjectMatch(editor, plugin),
              mode: 'lowest',
            })) {
              if (!isListItem(node)) continue;
              tx.nodes.unset([...LIST_FIELDS, 'indent'], { at: path });
            }
          }
        ),
        insert: txLocate(
          locateAt(1, 'at', 'after', 'before'),
          (input: { type: ListType }, options: BlockInsertOptions = {}) =>
            applyListInsertion('insert', input, options)
        ),
        toggle: txLocate(
          locateAt(0),
          ({ at, listStart, listStyle, type }: ToggleListOptions) => {
            if (
              (at === undefined && !tx.selection()) ||
              (PathApi.isPath(at) && at.length === 0)
            ) {
              return false;
            }

            const keyAt = (path: Path) => tx.key(path);
            const match = getInjectMatch(editor, plugin);
            const releases = readBlockReleases(
              editor,
              tx,
              tx.nodes.blocks({ at, mode: 'lowest' }),
              (block, [, path]) => match(block, path)
            );
            const holdsRelease = ([, path]: NodeEntry<Element>) =>
              releases.some(({ container: [, containerPath] }) =>
                PathApi.isCommon(path, containerPath)
              );
            const matched = tx.nodes
              .blocks({ at, match, mode: 'lowest' })
              .filter((entry) => !holdsRelease(entry));

            if (matched.length === 0 && releases.length === 0) return false;

            const depths =
              releases.length > 0
                ? planListConversion(editor, tx, releases, {
                    listType: type,
                  })
                : new Map<NodeKey, number>();

            if (!depths) return false;

            const keys = [
              ...matched.flatMap(([, path]) => keyAt(path) ?? []),
              ...releases.map((release) => release.key),
            ];

            applyBlockReleases(tx, releases);

            const entries = keys
              .flatMap((key) => {
                const entry = tx.nodes.get(key, {
                  match: ElementApi.isElement,
                });

                return entry ? [entry] : [];
              })
              .toSorted(([, left], [, right]) => PathApi.compare(left, right));

            if (entries.length === 0) return false;

            const keyed = (list: ReadonlyArray<NodeEntry<Element>>) =>
              list.flatMap(([node, path]) => {
                const key = keyAt(path);

                return key ? [{ key, node, path }] : [];
              });
            const changed = (
              candidates: ReadonlyArray<
                Readonly<{ key: NodeKey; node: Element }>
              >
            ) =>
              candidates.some(({ key, node: before }) => {
                const after = tx.nodes.get(key)?.[0];

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
              const unset = keyed(entries);

              unset.forEach(({ key, node }) => {
                const indent = Number(node.indent ?? 0);

                tx.nodes.unset([...LIST_FIELDS], { at: key });

                if (indent > 1) {
                  tx.nodes.set({ indent: indent - 1 }, { at: key });
                } else {
                  tx.nodes.unset('indent', { at: key });
                }
              });
              return changed(unset);
            }

            const targets =
              entries.length === 1 && isListItem(entries[0][0])
                ? [
                    entries[0],
                    ...getListRunSiblings(
                      tx,
                      entries[0],
                      getHeadingType(editor)
                    ),
                  ]
                : [...entries];
            const boundary = entries[0][0];
            const written = keyed(targets);
            const headingType = getHeadingType(editor);
            // Blocks that become list items join one list: the one the first
            // of them joins, or a fresh one.
            let identity: ReturnType<typeof resolveListIdentity> | undefined;

            written.forEach(({ key, node, path }) => {
              const currentIndent = Number(node.indent ?? 0);
              const indent =
                depths.get(key) ??
                (isListItem(node)
                  ? Math.max(1, currentIndent || 1)
                  : currentIndent + 1);
              const isBoundary = node === boundary;

              if (!isListItem(node)) {
                identity ??= resolveListIdentity(tx, path, {
                  depth: indent,
                  heading:
                    headingType !== undefined && node.type === headingType,
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
                { at: key }
              );

              if (type !== ListType.Task && Object.hasOwn(node, 'checked')) {
                tx.nodes.unset('checked', { at: key });
              }
              if (
                normalizedListStyle === undefined &&
                Object.hasOwn(node, 'listStyle')
              ) {
                tx.nodes.unset('listStyle', { at: key });
              }
              // `listRestart` would outrank the given start, so it goes.
              if (isBoundary && listStart !== undefined) {
                tx.nodes.unset('listRestart', { at: key });
              }
            });
            for (const [key, depth] of depths) {
              tx.nodes.set({ indent: depth }, { at: key });
            }
            return changed(written) || releases.length > 0;
          }
        ),
        restart: txLocate(
          locateAt(0),
          ({
            at,
            start = 1,
          }: { at?: Location | NodeSelection; start?: number } = {}) => {
            const [entry] = tx.nodes.blocks({
              at,
              match: (node) =>
                ElementApi.isElement(node) &&
                node.listType === ListType.Numbered,
              mode: 'lowest',
            });

            if (!entry || entry[0].listRestart === start) return false;
            tx.nodes.set({ listRestart: start }, { at: entry[1] });

            return true;
          }
        ),
        continue: txLocate(
          locateAt(0),
          ({ at }: { at?: Location | NodeSelection } = {}) => {
            const [entry] = tx.nodes.blocks({
              at,
              match: (node) =>
                ElementApi.isElement(node) &&
                node.listType === ListType.Numbered,
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
          }
        ),
        upsert: txLocate(
          locateAt(1, 'after', 'before'),
          (input: { type: ListType }, options: BlockUpsertOptions = {}) =>
            applyListInsertion('upsert', input, options)
        ),
      };
    },
  }))
  .extend(() => ({
    contributions: [
      authoredVeto.of((element, touch) =>
        element.listType && touch !== 'content' ? 'list' : null
      ),
    ],
    readMiddleware: ({ around }) => [
      around(editorReads.slice.landing, ({ editor, input, next, state }) =>
        landListPaste(state, input, next(), {
          headingType: getHeadingType(editor),
          paragraphType: editor.plugin(BaseParagraphPlugin).schema.type,
        })
      ),
      around(editorReads.transfer.adopt, ({ editor, input, next, state }) =>
        adoptListBlocks(state, input, next(), {
          headingType: getHeadingType(editor),
        })
      ),
      around(editorReads.transfer.source, ({ next, state }) => {
        const selection = next();
        const entries = selection.paths.flatMap((path) => {
          const entry = state.nodes.get(path, { match: ElementApi.isElement });

          return entry ? [entry] : [];
        });

        return entries.some(([node]) => isListItem(node))
          ? SelectionApi.nodes(
              getListFamilies(state, entries).flatMap((family) =>
                family.map(({ path }) => path)
              ) as [Path, ...Path[]],
              { mode: 'block' }
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
        const indent = listItemDepth(first);
        const moving = new Set<Descendant>(payload.nodes);
        let index =
          (landingTarget[1].at(-1) as number) + (edge === 'after' ? 1 : 0);
        let last = -1;

        while (index < siblings.length) {
          if (moving.has(siblings[index])) {
            index += 1;
            continue;
          }
          const end = deeperRunEnd(siblings, indent, index);

          if (end < 0) break;
          last = end;
          index = last + 1;
        }
        while (last >= 0 && moving.has(siblings[last])) last -= 1;

        const key = last >= 0 && state.key([...parent, last]);

        return key ? { edge: 'after' as const, key } : next();
      }),
    ],
    commands: ({ around, handle }) => [
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
  });

export type BaseListDefinition = DefinitionOf<typeof BaseListPlugin>;

type MarkdownListRuleOptions = {
  enabled?: (context: InsertTextInputRuleReadContext) => boolean;
  priority?: number;
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
      enabled,
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
      enabled,
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
      enabled,
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

registerFirstPartyPlugin(BaseListPlugin);
