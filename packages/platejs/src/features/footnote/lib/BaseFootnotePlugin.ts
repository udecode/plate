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
  type Point,
} from '../../../core';
import { selectAfterInline } from '../../../internal/plugin/inlineInsertion';
import type { ComboboxState } from '../../combobox';

const NUMERIC_REF_REGEX = /^\d+$/;
const isNonBlankRef = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = definePlugin(
  PLUGINS.footnoteDefinition,
  {
    schema: ({ plugins }) => ({
      element: {
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
        markdown: {
          node: 'footnoteDefinition',
          decode: ({ decodeNodes, marks, isInline, node, registry }) => {
            // `label` keeps the source spelling; `identifier` is normalized.
            const ref = node.label ?? node.identifier;

            if (!isNonBlankRef(ref)) return undefined;

            const paragraphType =
              registry.type(PLUGINS.paragraph) ?? 'paragraph';
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
  read: ({ editor, plugin, schema, state }) => {
    type Footnote = ElementOf<
      typeof BaseFootnoteDefinitionPlugin | typeof plugin
    >;

    const definition = editor.plugin(BaseFootnoteDefinitionPlugin);
    const definitionType = definition.installed
      ? definition.schema.type
      : undefined;
    const referenceType = schema.type;
    let registry:
      | {
          children: readonly Descendant[];
          definitions: Array<NodeEntry<Footnote>>;
          definitionsByRef: Map<string, Array<NodeEntry<Footnote>>>;
          footnotes: Array<NodeEntry<Footnote>>;
          referencesByRef: Map<string, Array<NodeEntry<Footnote>>>;
        }
      | undefined;
    const getRegistry = () => {
      const children = state.children();

      if (registry?.children === children) return registry;

      const definitions: Array<NodeEntry<Footnote>> = [];
      const footnotes: Array<NodeEntry<Footnote>> = [];
      const definitionsByRef = new Map<string, Array<NodeEntry<Footnote>>>();
      const referencesByRef = new Map<string, Array<NodeEntry<Footnote>>>();

      for (const entry of state.nodes.toArray({
        at: [],
        match: (node): node is Footnote =>
          ElementApi.isElement(node) &&
          (node.type === definitionType || node.type === referenceType),
      })) {
        const [footnote] = entry;

        footnotes.push(entry);
        if (footnote.type === definitionType) {
          definitions.push(entry);
        }
        if (!footnote.ref) continue;

        const entries =
          footnote.type === definitionType ? definitionsByRef : referencesByRef;
        const matches = entries.get(footnote.ref) ?? [];

        matches.push(entry);
        entries.set(footnote.ref, matches);
      }

      registry = {
        children,
        definitions,
        definitionsByRef,
        footnotes,
        referencesByRef,
      };

      return registry;
    };
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
      definition: ({ ref }: { ref: string }) => definitions({ ref })[0],
      definitions,
      definitionText: ({ ref }: { ref: string }) => {
        const innerDefinition = definitions({ ref })[0];

        return innerDefinition
          ? state.text.string(innerDefinition[1])
          : undefined;
      },
      duplicateDefinitions: ({ ref }: { ref: string }) =>
        definitions({ ref }).slice(1),
      duplicateRefs: () => {
        const counts = new Map<string, number>();

        for (const [innerDefinition2] of definitions()) {
          if (!innerDefinition2.ref) continue;

          counts.set(
            innerDefinition2.ref,
            (counts.get(innerDefinition2.ref) ?? 0) + 1
          );
        }

        return [...counts].filter(([, count]) => count > 1).map(([ref]) => ref);
      },
      hasDuplicateDefinitions: ({ ref }: { ref: string }) =>
        definitions({ ref }).length > 1,
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
    const referencePoint = (path: Path) => {
      const parentEntry = tx.nodes.parent(path, {
        match: ElementApi.isElement,
      });
      let point: Point | undefined;

      if (parentEntry) {
        const [parent, parentPath] = parentEntry;
        const childIndex = path.at(-1) ?? -1;
        const nextSibling = parent.children[childIndex + 1];
        const previousSibling = parent.children[childIndex - 1];

        if (TextApi.isText(nextSibling)) {
          point = {
            offset: 0,
            path: parentPath.concat([childIndex + 1]),
          };
        } else if (TextApi.isText(previousSibling)) {
          point = {
            offset: previousSibling.text.length,
            path: parentPath.concat([childIndex - 1]),
          };
        }
      }

      return point ?? tx.points.start(path.concat([0]));
    };

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
      const innerDefinition4 = tx
        .plugin(BaseFootnotePlugin)
        .definition({ ref });

      if (!innerDefinition4) return false;

      const point = tx.points.start(innerDefinition4[1]);

      if (!point) return false;

      tx.selection.set({ anchor: point, focus: point });

      return { point, targetPath: innerDefinition4[1] };
    };
    const selectReference = ({
      ref,
      index = 0,
    }: {
      ref: string;
      index?: number;
    }) => {
      const reference = tx.plugin(plugin.name).references({ ref })[index];

      if (!reference) return false;

      const point = referencePoint(reference[1]);

      if (!point) return false;

      tx.selection.set({ anchor: point, focus: point });

      return { point, targetPath: reference[1] };
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
      const path = [tx.value().children.length];

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
      createDefinition,
      insert,
      normalizeDuplicateDefinition,
      selectDefinition,
      selectReference,
    };
  },
}));

export type FootnoteReferenceElement = ElementOf<typeof BaseFootnotePlugin>;
export type FootnoteElement = ElementOf<
  typeof BaseFootnoteDefinitionPlugin | typeof BaseFootnotePlugin
>;
export type FootnoteDefinition = DefinitionOf<typeof BaseFootnotePlugin>;
