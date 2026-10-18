import {
  BaseParagraphPlugin,
  ElementApi,
  PLUGINS,
  PathApi,
  TextApi,
  definePlugin,
  property,
  transferVeto,
  type DefinitionOf,
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
import { registerFirstPartyPlugin } from '../../../internal/plugin/firstPartyPlugin';
import { selectAfterInline } from '../../../internal/plugin/inlineInsertion';
import { getMarkdownParagraphType } from '../../../internal/plugin/markdownParagraph';
import type { ComboboxState } from '../../combobox';
import { getFootnoteTarget } from './internal/getFootnoteTarget';

const NUMERIC_REF_REGEX = /^\d+$/;
const isNonBlankRef = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** The fragment id of a footnote and, when present, its linked fragment id. */
export type FootnoteAnchor = { id: string; target?: string };

type IndexedFootnote = Element & { ref: string };
type FootnoteIndex = {
  anchors: Map<string, FootnoteAnchor>;
  definitions: Array<NodeEntry<IndexedFootnote>>;
  definitionsByRef: Map<string, Array<NodeEntry<IndexedFootnote>>>;
  footnotes: Array<NodeEntry<IndexedFootnote>>;
  referencesByRef: Map<string, Array<NodeEntry<IndexedFootnote>>>;
};

const indexes = new WeakMap<
  readonly Descendant[],
  Map<string | undefined, Map<string | undefined, FootnoteIndex>>
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

const getFootnoteIndex = (
  children: readonly Descendant[],
  referenceType: string | undefined,
  definitionType: string | undefined
): FootnoteIndex => {
  let byReference = indexes.get(children);
  if (!byReference) {
    byReference = new Map();
    indexes.set(children, byReference);
  }
  let byDefinition = byReference.get(referenceType);
  if (!byDefinition) {
    byDefinition = new Map();
    byReference.set(referenceType, byDefinition);
  }
  const cached = byDefinition.get(definitionType);
  if (cached) return cached;

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

      if (node.type === referenceType || node.type === definitionType) {
        const footnote = node as IndexedFootnote;
        const entry: NodeEntry<IndexedFootnote> = [footnote, path];
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
          const encoded = encodeRef(footnote.ref);
          const id = `${isDefinition ? 'fn' : 'fnref'}-${encoded}${entries.length > 1 ? `:${entries.length}` : ''}`;

          index.anchors.set(path.join(','), {
            id,
            ...(!isDefinition || entries.length === 1
              ? { target: `${isDefinition ? 'fnref' : 'fn'}-${encoded}` }
              : {}),
          });
        }
      }
      walk(node.children, path);
    });
  };
  walk(children, []);
  byDefinition.set(definitionType, index);

  return index;
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

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = definePlugin(
  PLUGINS.footnoteDefinition,
  {
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
          encode: ({ content, document, node, path, preserve, registry }) => {
            const anchor = getFootnoteIndex(
              document.children,
              registry.type(PLUGINS.footnote),
              type
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

            // Definitions hold block content; only inline runs need a paragraph.
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
  }
).extend(({ schema: { type } }) => ({
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
}));

export type FootnoteDefinitionElement = ElementOf<
  typeof BaseFootnoteDefinitionPlugin
>;

export type CreateFootnoteDefinitionOptions = {
  focus?: boolean;
  fragment?: readonly Descendant[];
  ref: string;
};

export type FootnotePluginState = ComboboxState;

/** Enables footnote references and their document-level operations. */
export const BaseFootnotePlugin = definePlugin('footnote', {
  initialState: (): FootnotePluginState => ({
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
        match: [{ tag: 'a', attributes: { 'data-editor-footnote-ref': true } }],
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
        encode: ({ content, document, node, path, preserve, registry }) => {
          const anchor = getFootnoteIndex(
            document.children,
            type,
            registry.type(BaseFootnoteDefinitionPlugin)
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
                  href: `#${anchor.target}`,
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
    const definition = editor.plugin(BaseFootnoteDefinitionPlugin);
    const definitionType = definition.installed
      ? definition.schema.type
      : undefined;
    const referenceType = schema.type;
    const getRegistry = () =>
      getFootnoteIndex(state.children(), referenceType, definitionType);
    const definitions = ({ ref }: { ref?: string } = {}) => {
      const current = getRegistry();

      if (ref !== undefined && !isNonBlankRef(ref)) return [];

      return (
        (ref !== undefined
          ? current.definitionsByRef.get(ref)
          : current.definitions
        )?.slice() ?? []
      );
    };
    const references = ({ ref }: { ref: string }) =>
      getRegistry().referencesByRef.get(ref)?.slice() ?? [];

    return {
      anchor: ({ path }: { path: Path }) =>
        getRegistry().anchors.get(path.join(',')),
      definition: ({ ref }: { ref: string }) => definitions({ ref })[0],
      definitions,
      definitionText: ({ ref }: { ref: string }) => {
        const innerDefinition = definitions({ ref })[0];

        return innerDefinition
          ? state.text.string(innerDefinition[1])
          : undefined;
      },
      refs: () => [
        ...new Set(
          definitions().flatMap(([innerDefinition3]) =>
            innerDefinition3.ref ? [innerDefinition3.ref] : []
          )
        ),
      ],
      isDuplicateDefinition: ({ path }: { path: Path }) => {
        const entry = state.nodes.get(path, {
          match: (node): node is FootnoteDefinitionElement =>
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
      isResolved: ({ ref }: { ref: string }) => definitions({ ref }).length > 0,
      nextRef: () => {
        const used = new Set<number>();

        for (const [footnote] of getRegistry().footnotes) {
          if (footnote.ref && NUMERIC_REF_REGEX.test(footnote.ref)) {
            used.add(Number.parseInt(footnote.ref, 10));
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
    const definition = editor.plugin(BaseFootnoteDefinitionPlugin);
    const definitionType = definition.installed
      ? definition.schema.type
      : undefined;
    const normalizeDuplicateDefinition = ({
      path,
      ref,
    }: {
      ref?: string;
      path: Path;
    }) => {
      const entry = tx.nodes.get(path, {
        match: (node): node is FootnoteDefinitionElement =>
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

      if (
        tx.plugin(plugin.name).definition({ ref: nextRef }) ||
        tx.plugin(plugin.name).references({ ref: nextRef }).length > 0
      ) {
        return false;
      }

      tx.nodes.set({ ref: nextRef }, { at: path });

      return nextRef;
    };
    const selectDefinition = ({ ref }: { ref: string }) => {
      const target = getFootnoteTarget(
        tx,
        tx.plugin(plugin.name).definition({ ref })?.[1],
        'definition'
      );

      if (!target) return false;

      const { point } = target;
      tx.selection.set({ anchor: point, focus: point });

      return target;
    };
    const selectReference = ({
      ref,
      index = 0,
    }: {
      ref: string;
      index?: number;
    }) => {
      const target = getFootnoteTarget(
        tx,
        tx.plugin(plugin.name).references({ ref })[index]?.[1],
        'reference'
      );

      if (!target) return false;

      const { point } = target;
      tx.selection.set({ anchor: point, focus: point });

      return target;
    };
    const createDefinition = ({
      focus = true,
      fragment,
      ref,
    }: CreateFootnoteDefinitionOptions) => {
      if (!isNonBlankRef(ref)) {
        throw new TypeError('Footnote ref must be a non-empty string.');
      }

      if (!definitionType) {
        throw new Error(
          'Footnote definition creation requires BaseFootnoteDefinitionPlugin.'
        );
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

      for (const child of clonedFragment) {
        if (ElementApi.isElement(child) && tx.schema.isBlock(child)) {
          flushInlineChildren();
          children.push(child);
        } else {
          inlineChildren.push(child);
        }
      }
      flushInlineChildren();

      if (children.length === 0) {
        children.push({ children: [{ text: '' }], type: paragraphType });
      }
      const path = [tx.children().length];

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
      const fragment =
        selection && tx.selection.isExpanded()
          ? tx.fragment({ at: selection })
          : undefined;

      tx.nodes.insert(tx.schema.create(type, { ref: nextRef }), options);

      const caretInReference = options.at === undefined ? tx.selection() : null;
      const referencePath =
        caretInReference && PathApi.parent(caretInReference.anchor.path);

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
}));

export type FootnoteReferenceElement = ElementOf<typeof BaseFootnotePlugin>;
export type FootnoteElement = ElementOf<
  typeof BaseFootnoteDefinitionPlugin | typeof BaseFootnotePlugin
>;
export type FootnoteDefinition = DefinitionOf<typeof BaseFootnotePlugin>;

registerFirstPartyPlugin(BaseFootnoteDefinitionPlugin);
registerFirstPartyPlugin(BaseFootnotePlugin);
