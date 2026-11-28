import {
  BaseParagraphPlugin,
  ElementApi,
  PLUGINS,
  PathApi,
  RangeApi,
  TextApi,
  definePlugin,
  property,
  transferVeto,
  type Descendant,
  type Element,
  type ElementOf,
  type NodeEntry,
  type Path,
  type NodeInsertOptions,
  txLocate,
  txSelection,
  locateAt,
} from '../../../core';
import {
  MAIN_ROOT_KEY,
  getUpdateStartValue,
  getValueRecords,
  readAuthoredViewKey,
  withStoredAuthoredRead,
} from '../../../facade';
import { getCompiledPlatePlugin } from '../../../internal/plugin/compilePlateModel';
import { selectAfterInline } from '../../../internal/plugin/inlineInsertion';
import { getMarkdownParagraphType } from '../../../internal/plugin/markdownParagraph';
import {
  type StaticReuseKeyReader,
  withStaticReuseKey,
} from '../../../internal/plugin/staticReuseKey.internal';
import type { ComboboxState } from '../../combobox';
import { getFootnoteTarget } from './internal/getFootnoteTarget';

const NUMERIC_REF_REGEX = /^\d+$/;
const isNonBlankRef = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

type FootnoteAnchor = { id: string; target?: string };
type FootnoteNode = Element & { ref: string };
type FootnoteIndex = {
  anchors: Map<string, FootnoteAnchor>;
  definitions: Array<NodeEntry<FootnoteNode>>;
  definitionsByRef: Map<string, Array<NodeEntry<FootnoteNode>>>;
  footnotes: Array<NodeEntry<FootnoteNode>>;
  referencesByRef: Map<string, Array<NodeEntry<FootnoteNode>>>;
};

const unfilteredIndexes = new WeakMap<
  readonly Descendant[],
  Map<string, FootnoteIndex>
>();
const contentIndexes = new WeakMap<
  readonly Descendant[],
  WeakMap<object, Map<string, FootnoteIndex>>
>();

const encodeRef = (ref: string) => {
  let encoded = '';

  for (const character of ref) {
    const code = character.charCodeAt(0);

    encoded +=
      character.length === 1 && code >= 0xd8_00 && code <= 0xdf_ff
        ? [
            0xe0 | (code >> 12),
            0x80 | ((code >> 6) & 0x3f),
            0x80 | (code & 0x3f),
          ]
            .map((byte) => `%${byte.toString(16).toUpperCase()}`)
            .join('')
        : encodeURIComponent(character);
  }

  return encoded;
};

const buildFootnoteIndex = (
  children: readonly Descendant[],
  referenceType: string | undefined,
  definitionType: string | undefined,
  root: string,
  isContent?: (node: Element) => boolean
): FootnoteIndex => {
  const index: FootnoteIndex = {
    anchors: new Map(),
    definitions: [],
    definitionsByRef: new Map(),
    footnotes: [],
    referencesByRef: new Map(),
  };
  const walk = (nodes: readonly Descendant[], parent: Path) => {
    nodes.forEach((node, offset) => {
      if (!ElementApi.isElement(node)) return;
      const path = [...parent, offset];

      if (
        (node.type === referenceType || node.type === definitionType) &&
        (!isContent || isContent(node))
      ) {
        const footnote = node as FootnoteNode;
        const entry: NodeEntry<FootnoteNode> = [footnote, path];
        const isDefinition = node.type === definitionType;

        index.footnotes.push(entry);
        if (isDefinition) index.definitions.push(entry);
        if (footnote.ref) {
          const byRef = isDefinition
            ? index.definitionsByRef
            : index.referencesByRef;
          const entries = byRef.get(footnote.ref) ?? [];
          entries.push(entry);
          byRef.set(footnote.ref, entries);
        }
      }
      walk(node.children, path);
    });
  };
  walk(children, []);

  const encodedRoot = root === MAIN_ROOT_KEY ? undefined : encodeRef(root);
  const definitionCounts = new Map<string, number>();
  const referenceCounts = new Map<string, number>();

  for (const [footnote, path] of index.footnotes) {
    if (!footnote.ref) continue;
    const isDefinition = footnote.type === definitionType;
    const counts = isDefinition ? definitionCounts : referenceCounts;
    const occurrence = (counts.get(footnote.ref) ?? 0) + 1;
    counts.set(footnote.ref, occurrence);

    const encoded = encodeRef(footnote.ref);
    const idPrefix =
      encodedRoot === undefined
        ? `${isDefinition ? 'fn' : 'fnref'}-${encoded}`
        : `${isDefinition ? 'fn' : 'fnref'}@${encodedRoot}@${encoded}`;
    const targetId =
      encodedRoot === undefined
        ? `${isDefinition ? 'fnref' : 'fn'}-${encoded}`
        : `${isDefinition ? 'fnref' : 'fn'}@${encodedRoot}@${encoded}`;
    const hasTarget = isDefinition
      ? occurrence === 1 && index.referencesByRef.has(footnote.ref)
      : index.definitionsByRef.has(footnote.ref);

    index.anchors.set(path.join(','), {
      id: occurrence > 1 ? `${idPrefix}:${occurrence}` : idPrefix,
      ...(hasTarget ? { target: targetId } : {}),
    });
  }

  return index;
};

const getFootnoteIndex = (
  children: readonly Descendant[],
  referenceType: string | undefined,
  definitionType: string | undefined,
  root = MAIN_ROOT_KEY
): FootnoteIndex => {
  let byKey = unfilteredIndexes.get(children);
  if (!byKey) {
    byKey = new Map();
    unfilteredIndexes.set(children, byKey);
  }
  const key = JSON.stringify([
    root,
    referenceType ?? null,
    definitionType ?? null,
  ]);
  const cached = byKey.get(key);
  if (cached) return cached;

  const index = buildFootnoteIndex(
    children,
    referenceType,
    definitionType,
    root
  );
  byKey.set(key, index);

  return index;
};

const getContentFootnoteIndex = (
  children: readonly Descendant[],
  records: object,
  authoredKey: string | undefined,
  referenceType: string | undefined,
  definitionType: string | undefined,
  root: string,
  isContent: (node: Element) => boolean
): FootnoteIndex => {
  let byRecords = contentIndexes.get(children);
  if (!byRecords) {
    byRecords = new WeakMap();
    contentIndexes.set(children, byRecords);
  }
  let byKey = byRecords.get(records);
  if (!byKey) {
    byKey = new Map();
    byRecords.set(records, byKey);
  }
  const key = JSON.stringify([
    authoredKey ?? null,
    root,
    referenceType ?? null,
    definitionType ?? null,
  ]);
  const cached = byKey.get(key);
  if (cached) return cached;

  const index = buildFootnoteIndex(
    children,
    referenceType,
    definitionType,
    root,
    isContent
  );
  byKey.set(key, index);

  return index;
};

const getStoredRootChildren = (
  editor: Parameters<typeof withStoredAuthoredRead>[0],
  root: string
): readonly Descendant[] => {
  const start = getUpdateStartValue(editor);

  if (start) {
    return root === MAIN_ROOT_KEY
      ? start.children
      : (start.roots?.[root] ?? []);
  }

  return withStoredAuthoredRead(editor, () =>
    editor.read((stored) => {
      const value = stored.value();

      return root === MAIN_ROOT_KEY
        ? value.children
        : (value.roots?.[root] ?? []);
    })
  );
};

const getGithubFootnote = (document: Document, href: string | null) => {
  if (!href) return null;
  const hash = href.indexOf('#');
  if (hash === -1) return null;
  const fragment = href.slice(hash + 1);
  if (!fragment.startsWith('fn-') && !fragment.startsWith('user-content-fn-')) {
    return null;
  }
  const fragments = [fragment];
  try {
    const decoded = decodeURIComponent(fragment);
    if (decoded !== fragment) fragments.push(decoded);
  } catch {
    // A malformed escape can still name an item by its literal id.
  }
  for (const id of fragments) {
    const target =
      document.getElementById(id) ??
      document.getElementById(
        id.startsWith('user-content-')
          ? id.slice('user-content-'.length)
          : `user-content-${id}`
      );
    if (target) return target;
  }
  return null;
};

const readFootnoteStaticReuseKey: StaticReuseKeyReader = ({ editor, path }) => {
  if (!getCompiledPlatePlugin(editor, PLUGINS.footnote)) return undefined;

  const anchor = editor.plugin(BaseFootnotePlugin).read.anchor({ path });

  return anchor ? `${anchor.id}|${anchor.target ?? ''}` : '';
};

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = withStaticReuseKey(
  definePlugin(PLUGINS.footnoteDefinition, {
    dependencies: [BaseParagraphPlugin],
    schema: ({ plugins }) => ({
      element: {
        slice: { endMatter: true },
        content: plugins.blockContent({
          default: BaseParagraphPlugin,
          min: 1,
        }),
        properties: {
          ref: property.string({
            required: true,
            validate: isNonBlankRef,
            validationVersion: 1,
          }),
        },
      },
    }),
    formats: ({ defineFormats, schema: { type } }) =>
      defineFormats({
        html: {
          priority: 70,
          match: [
            {
              tag: 'div',
              attributes: { 'data-editor-footnote-definition': true },
            },
          ],
          prepareDocument: ({ document }) => {
            const labels = new Map<HTMLElement, string>();
            for (const anchor of document.querySelectorAll(
              'a[data-footnote-ref]'
            )) {
              const target = getGithubFootnote(
                document,
                anchor.getAttribute('href')
              );
              const label = anchor.textContent?.trim();
              if (target && label && !labels.has(target)) {
                labels.set(target, label);
              }
            }
            const used = new Set<string>();
            for (const section of document.querySelectorAll(
              'section[data-footnotes]'
            )) {
              const definitions: HTMLElement[] = [];
              for (const list of [...section.children].filter(
                (child) => child.tagName === 'OL'
              )) {
                [...list.children].forEach((item, position) => {
                  if (item.tagName !== 'LI' || !item.id) return;
                  const label =
                    labels.get(item as HTMLElement) ?? `${position + 1}`;
                  let ref = label;
                  let suffix = 2;
                  while (used.has(ref)) {
                    ref = `${label}-${suffix}`;
                    suffix += 1;
                  }
                  used.add(ref);
                  const definition = document.createElement('div');
                  definition.id = item.id;
                  definition.setAttribute(
                    'data-editor-footnote-definition',
                    ref
                  );
                  definition.append(...item.childNodes);
                  definitions.push(definition);
                });
              }
              section.replaceWith(...definitions);
            }
            for (const definition of document.querySelectorAll(
              'div[data-editor-footnote-definition]'
            )) {
              for (const chrome of definition.querySelectorAll(
                '[data-footnote-backref], [data-editor-footnote-chrome]'
              )) {
                chrome.remove();
              }
            }
          },
          decode: ({ element, preserve }) => {
            const ref = element.getAttribute('data-editor-footnote-definition');
            if (!isNonBlankRef(ref)) return undefined;
            preserve('data-editor-footnote-definition');
            return { ref };
          },
          encode: ({
            content,
            document,
            node,
            path,
            preserve,
            registry,
            root = MAIN_ROOT_KEY,
          }) => {
            const anchor = getFootnoteIndex(
              root === MAIN_ROOT_KEY
                ? document.children
                : (document.roots?.[root] ?? []),
              registry.type(PLUGINS.footnote),
              type,
              root
            ).anchors.get(path.join(','));
            if (!anchor) {
              throw new Error(
                'Footnote definition is missing from the document index.'
              );
            }
            preserve('ref');
            return {
              tag: 'div',
              attributes: {
                'data-editor-footnote-definition': node.ref,
                id: anchor.id,
              },
              children: [
                content,
                ...(anchor.target
                  ? [
                      {
                        tag: 'a',
                        attributes: {
                          'data-editor-footnote-chrome': '',
                          href: `#${anchor.target}`,
                        },
                        children: [{ text: '↩' }],
                      },
                    ]
                  : []),
              ],
            };
          },
        },
        markdown: {
          node: 'footnoteDefinition',
          decode: ({ decodeNodes, marks, isInline, node, registry }) => {
            // `label` keeps the source spelling; `identifier` is normalized.
            const ref = node.label ?? node.identifier;

            if (!isNonBlankRef(ref)) return undefined;

            const paragraphType = getMarkdownParagraphType(registry);
            const blocks: Descendant[] = [];
            let inline: Descendant[] = [];
            const flush = () => {
              if (inline.length === 0) return;
              blocks.push({ children: inline, type: paragraphType });
              inline = [];
            };

            for (const child of decodeNodes(node.children, marks)) {
              if (TextApi.isText(child) || isInline(child)) {
                inline.push(child);
              } else {
                flush();
                blocks.push(child);
              }
            }
            flush();

            return {
              children:
                blocks.length > 0
                  ? blocks
                  : [{ children: [{ text: '' }], type: paragraphType }],
              ref,
              type,
            };
          },
          encode: ({ encodeFlow, node, preserve }) => {
            preserve('ref');

            return {
              children: encodeFlow(node.children),
              identifier: node.ref,
              type: 'footnoteDefinition',
            };
          },
        },
      }),
  }).extend(({ schema: { type } }) => ({
    contributions: [
      // Definitions are end matter: a transfer lands them only at a root, and a
      // side wrap lands its blocks inside the wrap.
      transferVeto.of(
        ({ payload, target: [, path], wrap }) =>
          payload.kind === 'nodes' &&
          (path.length > 1 || wrap !== undefined) &&
          payload.nodes.some((node) => ElementApi.isElementType(node, type))
      ),
    ],
  })),
  readFootnoteStaticReuseKey
);

type FootnoteDefinitionNode = ElementOf<typeof BaseFootnoteDefinitionPlugin>;

type CreateFootnoteDefinitionOptions = {
  focus?: boolean;
  fragment?: readonly Descendant[];
  ref: string;
};

/** Enables footnote references and their document-level operations. */
export const BaseFootnotePlugin = withStaticReuseKey(
  definePlugin('footnote', {
    dependencies: [BaseFootnoteDefinitionPlugin],
    initialState: (): ComboboxState => ({
      maxQueryLength: 75,
      queryPattern: null,
      trigger: '[^',
      triggerQuery: null,
      triggerPreviousCharPattern: null,
    }),
    formats: ({ defineFormats, schema: { type } }) =>
      defineFormats({
        html: {
          priority: 10,
          match: [
            { tag: 'a', attributes: { 'data-editor-footnote-ref': true } },
          ],
          prepareDocument: ({ document }) => {
            for (const anchor of document.querySelectorAll(
              'a[data-footnote-ref]'
            )) {
              const href = anchor.getAttribute('href');
              const fragment = href?.slice(href.indexOf('#') + 1);
              if (
                !href?.includes('#') ||
                (!fragment?.startsWith('fn-') &&
                  !fragment?.startsWith('user-content-fn-'))
              ) {
                continue;
              }
              const target = getGithubFootnote(document, href);
              const ref =
                target?.getAttribute('data-editor-footnote-definition') ??
                anchor.textContent?.trim();
              if (isNonBlankRef(ref)) {
                anchor.setAttribute('data-editor-footnote-ref', ref);
              }
            }
            for (const sup of document.querySelectorAll('sup')) {
              const significant = [...sup.childNodes].filter((child) =>
                child.nodeType === 3
                  ? !!child.textContent?.trim()
                  : child.nodeType === 1 &&
                    !(child as HTMLElement).hasAttribute('data-editor-spacer')
              );
              const anchor = significant[0];
              if (
                significant.length === 1 &&
                anchor?.nodeType === 1 &&
                (anchor as HTMLElement).matches('a[data-editor-footnote-ref]')
              ) {
                sup.replaceWith(anchor);
              }
            }
          },
          decode: ({ element, preserve }) => {
            const ref = element.getAttribute('data-editor-footnote-ref');
            if (!isNonBlankRef(ref)) return undefined;
            preserve('data-editor-footnote-ref');
            return { children: [{ text: '' }], ref };
          },
          encode: ({
            content,
            document,
            node,
            path,
            preserve,
            registry,
            root = MAIN_ROOT_KEY,
          }) => {
            const anchor = getFootnoteIndex(
              root === MAIN_ROOT_KEY
                ? document.children
                : (document.roots?.[root] ?? []),
              type,
              registry.type(BaseFootnoteDefinitionPlugin),
              root
            ).anchors.get(path.join(','));
            if (!anchor) {
              throw new Error(
                'Footnote reference is missing from the document index.'
              );
            }
            preserve('ref');
            return {
              tag: 'sup',
              children: [
                {
                  tag: 'a',
                  attributes: {
                    'data-editor-footnote-ref': node.ref,
                    ...(anchor.target ? { href: `#${anchor.target}` } : {}),
                    id: anchor.id,
                  },
                  children: [content, { text: `${node.ref}` }],
                },
              ],
            };
          },
        },
        markdown: {
          node: 'footnoteReference',
          decode: ({ node }) => {
            const ref = node.label ?? node.identifier;

            return isNonBlankRef(ref)
              ? { children: [{ text: '' }], ref, type }
              : undefined;
          },
          encode: ({ node, preserve }) => {
            preserve('ref');

            return { identifier: node.ref, type: 'footnoteReference' };
          },
        },
      }),
    read: ({ editor, schema, state }) => {
      const definitionType = editor.plugin(BaseFootnoteDefinitionPlugin).schema
        .type;
      const referenceType = schema.type;
      const getRegistry = () =>
        getContentFootnoteIndex(
          state.children(),
          getValueRecords(state.value()),
          readAuthoredViewKey(editor),
          referenceType,
          definitionType,
          state.view.root() ?? MAIN_ROOT_KEY,
          state.nodes.isContent
        );
      const getUnfilteredRegistries = () => {
        const root = state.view.root() ?? MAIN_ROOT_KEY;
        const currentChildren = state.children();
        const storedChildren = getStoredRootChildren(editor, root);
        const current = getFootnoteIndex(
          currentChildren,
          referenceType,
          definitionType,
          root
        );

        return storedChildren === currentChildren
          ? [current]
          : [
              current,
              getFootnoteIndex(
                storedChildren,
                referenceType,
                definitionType,
                root
              ),
            ];
      };
      const definitions = ({ ref }: { ref?: string } = {}): Array<
        NodeEntry<FootnoteDefinitionNode>
      > => {
        const current = getRegistry();

        if (ref !== undefined && !isNonBlankRef(ref)) return [];

        return (
          ((ref !== undefined
            ? current.definitionsByRef.get(ref)
            : current.definitions
          )?.slice() as Array<NodeEntry<FootnoteDefinitionNode>> | undefined) ??
          []
        );
      };
      const references = ({
        ref,
      }: {
        ref: string;
      }): Array<NodeEntry<Element & { ref: string }>> =>
        getRegistry().referencesByRef.get(ref)?.slice() ?? [];

      return {
        anchor: ({ path }: { path: Path }) =>
          getRegistry().anchors.get(path.join(',')),
        definition: ({
          ref,
        }: {
          ref: string;
        }): NodeEntry<FootnoteDefinitionNode> | undefined =>
          definitions({ ref })[0],
        definitions,
        refs: () => [
          ...new Set(
            definitions().flatMap(([innerDefinition3]) =>
              innerDefinition3.ref ? [innerDefinition3.ref] : []
            )
          ),
        ],
        isDuplicateDefinition: ({ path }: { path: Path }) => {
          const entry = state.nodes.get(path, {
            match: (node): node is FootnoteDefinitionNode =>
              ElementApi.isElement(node) && node.type === definitionType,
          });

          if (!entry || entry[0].type !== definitionType) return false;

          const { ref } = entry[0];

          if (!ref) return false;

          return definitions({ ref }).some(
            ([, definitionPath], index) =>
              index > 0 && PathApi.equals(definitionPath, path)
          );
        },
        nextRef: () => {
          const used = new Set<number>();

          for (const registry of getUnfilteredRegistries()) {
            for (const [footnote] of registry.footnotes) {
              if (footnote.ref && NUMERIC_REF_REGEX.test(footnote.ref)) {
                used.add(Number.parseInt(footnote.ref, 10));
              }
            }
          }

          let next = 1;

          while (used.has(next)) next += 1;

          return `${next}`;
        },
        references,
      };
    },
    component: 'sup',
    schema: {
      element: {
        properties: {
          ref: property.string({
            required: true,
            validate: isNonBlankRef,
            validationVersion: 1,
          }),
        },
        type: 'footnoteReference',
        void: 'inline',
      },
    },
  }).extend(({ editor, plugin, schema: { type } }) => ({
    update: ({ tx }) => {
      const definitionType = editor.plugin(BaseFootnoteDefinitionPlugin).schema
        .type;
      const normalizeDuplicateDefinition = ({
        path,
        ref,
      }: {
        ref?: string;
        path: Path;
      }) => {
        const entry = tx.nodes.get(path, {
          match: (node): node is FootnoteDefinitionNode =>
            ElementApi.isElement(node) && node.type === definitionType,
        });

        if (!entry || entry[0].type !== definitionType) return false;
        if (!entry[0].ref) return false;
        if (!tx.plugin(plugin.name).isDuplicateDefinition({ path })) {
          return false;
        }

        if (ref !== undefined && !isNonBlankRef(ref)) {
          throw new TypeError('Footnote ref must be a non-empty string.');
        }

        const nextRef = ref ?? tx.plugin(plugin.name).nextRef();

        if (nextRef === entry[0].ref) return false;

        const root = tx.view.root() ?? MAIN_ROOT_KEY;
        const currentChildren = tx.children();
        const storedChildren = getStoredRootChildren(editor, root);
        const hasRefCollision = (children: readonly Descendant[]) => {
          const unfiltered = getFootnoteIndex(
            children,
            type,
            definitionType,
            root
          );

          return (
            unfiltered.definitionsByRef.has(nextRef) ||
            unfiltered.referencesByRef.has(nextRef)
          );
        };

        if (
          hasRefCollision(currentChildren) ||
          (storedChildren !== currentChildren &&
            hasRefCollision(storedChildren))
        ) {
          return false;
        }

        tx.nodes.set({ ref: nextRef }, { at: path });

        return nextRef;
      };
      const selectDefinition = ({ ref }: { ref: string }): boolean => {
        const target = getFootnoteTarget(
          tx,
          tx.plugin(plugin.name).definition({ ref })?.[1],
          'definition'
        );

        if (!target) return false;

        const { point } = target;
        tx.selection.set({ anchor: point, focus: point });

        return true;
      };
      const selectReference = ({
        ref,
        index = 0,
      }: {
        ref: string;
        index?: number;
      }): boolean => {
        const target = getFootnoteTarget(
          tx,
          tx.plugin(plugin.name).references({ ref })[index]?.[1],
          'reference'
        );

        if (!target) return false;

        const { point } = target;
        tx.selection.set({ anchor: point, focus: point });

        return true;
      };
      const getTrailingInsertIndex = () => {
        const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
        const rootChildren = tx.children();
        let insertIndex = rootChildren.length;

        while (insertIndex > 1) {
          const last = rootChildren[insertIndex - 1];

          if (
            !ElementApi.isElement(last) ||
            last.type !== paragraphType ||
            last.children.length !== 1 ||
            !TextApi.isText(last.children[0]) ||
            last.children[0].text !== '' ||
            Object.keys(last.children[0]).length !== 1 ||
            Object.keys(last).some(
              (key) => key !== 'type' && key !== 'children' && key !== 'id'
            )
          ) {
            break;
          }

          insertIndex -= 1;
        }

        return insertIndex;
      };
      const createDefinition = ({
        focus = true,
        fragment,
        ref,
      }: CreateFootnoteDefinitionOptions) => {
        if (!isNonBlankRef(ref)) {
          throw new TypeError('Footnote ref must be a non-empty string.');
        }

        const existingDefinition = tx.plugin(plugin.name).definition({
          ref,
        });

        if (existingDefinition) {
          if (focus) selectDefinition({ ref });

          return existingDefinition[1];
        }

        const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
        const clonedFragment = fragment ? structuredClone(fragment) : [];
        const children: Element[] = [];
        let inlineChildren: Descendant[] = [];
        const flushInlineChildren = () => {
          if (inlineChildren.length === 0) return;

          children.push({
            children: inlineChildren,
            type: paragraphType,
          });
          inlineChildren = [];
        };
        const appendFragmentNodes = (nodes: readonly Descendant[]) => {
          for (const child of nodes) {
            if (ElementApi.isElement(child) && child.type === definitionType) {
              appendFragmentNodes(child.children);
            } else if (
              ElementApi.isElement(child) &&
              tx.schema.isBlock(child)
            ) {
              flushInlineChildren();
              children.push(child);
            } else {
              inlineChildren.push(child);
            }
          }
        };

        appendFragmentNodes(clonedFragment);
        flushInlineChildren();

        if (children.length === 0) {
          children.push({ children: [{ text: '' }], type: paragraphType });
        }

        const path = [getTrailingInsertIndex()];

        tx.nodes.insert(
          {
            ...tx.schema.create(definitionType, { ref }),
            children,
          },
          { at: path }
        );

        if (focus) selectDefinition({ ref });

        return path;
      };
      const insert = (
        {
          focusDefinition: shouldFocusDefinition = true,
          ref,
        }: {
          focusDefinition?: boolean;
          ref?: string;
        } = {},
        options: NodeInsertOptions = {}
      ) => {
        const selection = tx.selection();

        if (!selection && options.at === undefined) return;

        if (ref !== undefined && !isNonBlankRef(ref)) {
          throw new TypeError('Footnote ref must be a non-empty string.');
        }

        const nextRef = ref ?? tx.plugin(plugin.name).nextRef();
        const explicitRange =
          options.at !== undefined && RangeApi.isRange(options.at)
            ? options.at
            : undefined;
        const targetRange =
          explicitRange ??
          (options.at === undefined ? (selection ?? undefined) : undefined);
        const isExpandedTarget = Boolean(
          targetRange && RangeApi.isExpanded(targetRange)
        );
        const existingDefinition = tx.plugin(plugin.name).definition({
          ref: nextRef,
        });

        let insertOptions = options;
        let fragment: Descendant[] | undefined;
        const preservedDefinitions: FootnoteDefinitionNode[] = [];

        if (isExpandedTarget && targetRange) {
          if (existingDefinition) {
            insertOptions = { ...options, at: RangeApi.end(targetRange) };
          } else {
            const rawFragment = tx.fragment({ at: targetRange });
            const flowFragment: Descendant[] = [];

            for (const node of rawFragment) {
              if (ElementApi.isElement(node) && node.type === definitionType) {
                preservedDefinitions.push(
                  structuredClone(node) as FootnoteDefinitionNode
                );
              } else {
                flowFragment.push(node);
              }
            }
            fragment = flowFragment;
          }
        }

        tx.nodes.insert(
          tx.schema.create(type, { ref: nextRef }),
          insertOptions
        );

        const caretInReference =
          options.at === undefined || options.select ? tx.selection() : null;
        const referencePath =
          caretInReference && PathApi.parent(caretInReference.anchor.path);

        for (const preserved of preservedDefinitions) {
          const stillPresent = tx
            .children()
            .some(
              (child) =>
                ElementApi.isElement(child) &&
                child.type === definitionType &&
                child.id === preserved.id
            );

          if (!stillPresent) {
            tx.nodes.insert(preserved, { at: [getTrailingInsertIndex()] });
          }
        }

        createDefinition({
          focus: shouldFocusDefinition,
          fragment,
          ref: nextRef,
        });

        const reference = referencePath && tx.nodes.get(referencePath)?.[0];

        if (
          shouldFocusDefinition ||
          !referencePath ||
          !ElementApi.isElement(reference) ||
          reference.type !== type
        ) {
          return;
        }

        selectAfterInline(tx, referencePath);
      };

      return {
        createDefinition: txLocate(false, createDefinition),
        insert: txLocate(locateAt(1), insert),
        normalizeDuplicateDefinition: txLocate(
          locateAt(0, 'path'),
          normalizeDuplicateDefinition
        ),
        selectDefinition: txSelection(selectDefinition),
        selectReference: txSelection(selectReference),
      };
    },
  })),
  readFootnoteStaticReuseKey
);
