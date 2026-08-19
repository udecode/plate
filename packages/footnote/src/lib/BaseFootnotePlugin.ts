import {
  triggerCombobox,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import {
  BaseParagraphPlugin,
  type DefinitionOf,
  defineBasePlugin,
  type PlateNodeInsertOptions,
} from '@platejs/core';
import {
  type Descendant,
  type Element,
  type ElementOf,
  type NodeEntry,
  type Path,
  type Point,
  ElementApi,
  PathApi,
  TextApi,
  property,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

const NUMERIC_REF_REGEX = /^\d+$/;
const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\[$/;
const isNonBlankRef = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = defineBasePlugin(
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
    codecs: ({ defineCodecs, schema: { type } }) =>
      defineCodecs({
        'text/markdown': {
          from: 'footnoteDefinition',
          kind: 'node',
          decode: ({ decodeNodes, decoration, node, registry }) => {
            if (!isNonBlankRef(node.identifier)) return;

            const paragraphType =
              registry.type(PLUGINS.paragraph) ?? 'paragraph';
            const children = decodeNodes(node.children, decoration);
            const blocks = children.map((child) =>
              !TextApi.isText(child) && child.type === paragraphType
                ? child
                : {
                    children: [child],
                    type: paragraphType,
                  }
            );

            return {
              children:
                blocks.length > 0
                  ? blocks
                  : [{ children: [{ text: '' }], type: paragraphType }],
              ref: node.identifier,
              type,
            };
          },
          encode: ({ encodeFlow, node }) => ({
            children: encodeFlow(node.children),
            identifier: node.ref,
            type: 'footnoteDefinition',
          }),
        },
      }),
  }
);

export type FootnoteDefinitionElement = ElementOf<
  typeof BaseFootnoteDefinitionPlugin
>;

/** Enables support for inline footnote combobox inputs. */
export const BaseFootnoteInputPlugin = defineBasePlugin(PLUGINS.footnoteInput, {
  schema: {
    element: {
      properties: {
        trigger: property.string(),
        userId: property.string(),
        value: property.string(),
      },
      void: 'inline',
    },
  },
  editOnly: true,
});

export type CreateFootnoteDefinitionOptions = {
  focus?: boolean;
  fragment?: readonly Descendant[];
  ref: string;
};

export type FootnotePluginState = TriggerComboboxPluginState & {
  createComboboxInput: NonNullable<
    TriggerComboboxPluginState['createComboboxInput']
  >;
  trigger: NonNullable<TriggerComboboxPluginState['trigger']>;
  triggerPreviousCharPattern: NonNullable<
    TriggerComboboxPluginState['triggerPreviousCharPattern']
  >;
};

/** Enables footnote references and their document-level operations. */
export const BaseFootnotePlugin = defineBasePlugin('footnote', {
  dependencies: [BaseFootnoteInputPlugin],
  initialState: ({ editor }): FootnotePluginState => ({
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: editor.plugin(BaseFootnoteInputPlugin).schema.type,
    }),
    trigger: '^',
    triggerPreviousCharPattern: TRIGGER_PREVIOUS_CHAR_PATTERN,
  }),
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/markdown': {
        from: 'footnoteReference',
        kind: 'node',
        decode: ({ node }) =>
          isNonBlankRef(node.identifier)
            ? {
                children: [{ text: '' }],
                ref: node.identifier,
                type,
              }
            : undefined,
        encode: ({ node }) => ({
          identifier: node.ref,
          type: 'footnoteReference',
        }),
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
          definitions: NodeEntry<Footnote>[];
          definitionsByRef: Map<string, NodeEntry<Footnote>[]>;
          footnotes: NodeEntry<Footnote>[];
          referencesByRef: Map<string, NodeEntry<Footnote>[]>;
        }
      | undefined;
    const getRegistry = () => {
      const children = state.children();

      if (registry?.children === children) return registry;

      const definitions: NodeEntry<Footnote>[] = [];
      const footnotes: NodeEntry<Footnote>[] = [];
      const definitionsByRef = new Map<string, NodeEntry<Footnote>[]>();
      const referencesByRef = new Map<string, NodeEntry<Footnote>[]>();

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
        const definition = definitions({ ref })[0];

        return definition ? state.text.string(definition[1]) : undefined;
      },
      duplicateDefinitions: ({ ref }: { ref: string }) =>
        definitions({ ref }).slice(1),
      duplicateRefs: () => {
        const counts = new Map<string, number>();

        for (const [definition] of definitions()) {
          if (!definition.ref) continue;

          counts.set(definition.ref, (counts.get(definition.ref) ?? 0) + 1);
        }

        return [...counts].filter(([, count]) => count > 1).map(([ref]) => ref);
      },
      hasDuplicateDefinitions: ({ ref }: { ref: string }) =>
        definitions({ ref }).length > 1,
      refs: () => [
        ...new Set(
          definitions().flatMap(([definition]) =>
            definition.ref ? [definition.ref] : []
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
  render: { as: 'sup' },
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
})
  .extend(({ editor, store, schema: { type } }) => ({
    commands: (context) =>
      triggerCombobox(context, {
        editor,
        getState: () => store.get(),
        type,
      }),
  }))
  .extend(({ editor, plugin, schema: { type } }) => ({
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
        if (!tx.plugin(plugin).isDuplicateDefinition({ path })) return false;

        if (ref !== undefined && !isNonBlankRef(ref)) {
          throw new TypeError('Footnote ref must be a non-empty string.');
        }

        const nextRef = ref ?? tx.plugin(plugin).nextRef();

        if (nextRef === entry[0].ref) return false;

        if (
          tx.plugin(plugin).definition({ ref: nextRef }) ||
          tx.plugin(plugin).references({ ref: nextRef }).length > 0
        ) {
          return false;
        }

        tx.nodes.set({ ref: nextRef }, { at: path });

        return nextRef;
      };
      const selectDefinition = ({ ref }: { ref: string }) => {
        const definition = tx.plugin(plugin).definition({ ref });

        if (!definition) return false;

        const point = tx.points.start(definition[1]);

        if (!point) return false;

        tx.selection.set({ anchor: point, focus: point });

        return { point, targetPath: definition[1] };
      };
      const selectReference = ({
        ref,
        index = 0,
      }: {
        ref: string;
        index?: number;
      }) => {
        const reference = tx.plugin(plugin).references({ ref })[index];

        if (!reference) return false;

        const point = referencePoint(reference[1]);

        if (!point) return false;

        tx.selection.set({ anchor: point, focus: point });

        return { point, targetPath: reference[1] };
      };
      const focusDefinition = ({ ref }: { ref: string }) =>
        !!selectDefinition({ ref });
      const focusReference = ({
        ref,
        index = 0,
      }: {
        ref: string;
        index?: number;
      }) => !!selectReference({ ref, index });
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

        const existingDefinition = tx.plugin(plugin).definition({
          ref,
        });

        if (existingDefinition) {
          if (focus) focusDefinition({ ref });

          return existingDefinition[1];
        }

        const paragraphType = editor.plugin(PLUGINS.paragraph).schema.type;
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

        if (focus) focusDefinition({ ref });

        return path;
      };
      const insert = (
        {
          focusDefinition: shouldFocusDefinition = true,
          ref,
          trigger,
        }: {
          focusDefinition?: boolean;
          ref?: string;
          trigger?: string;
        } = {},
        options: PlateNodeInsertOptions = {}
      ) => {
        let selection = tx.selection();

        if (!selection && options.at === undefined) return;

        if (selection && trigger) {
          const before = tx.points.before(selection);
          const range = before ? tx.ranges.get(before, selection) : undefined;

          if (range && tx.text.string(range) === trigger) {
            tx.text.deleteBackward({ unit: 'character' });
            selection = tx.selection();
          }
        }

        if (ref !== undefined && !isNonBlankRef(ref)) {
          throw new TypeError('Footnote ref must be a non-empty string.');
        }

        const nextRef = ref ?? tx.plugin(plugin).nextRef();
        const fragment =
          selection && tx.selection.isExpanded()
            ? tx.fragment({ at: selection })
            : undefined;
        let referencePath: Path | undefined;

        if (selection && options.at === undefined) {
          const childIndex = selection.anchor.path.at(-1);

          if (childIndex !== undefined) {
            referencePath = selection.anchor.path
              .slice(0, -1)
              .concat(childIndex + 1);
          }
        }

        tx.nodes.insert(tx.schema.create(type, { ref: nextRef }), options);
        createDefinition({
          focus: shouldFocusDefinition,
          fragment,
          ref: nextRef,
        });

        if (shouldFocusDefinition || !referencePath) return;

        const point = { offset: 0, path: PathApi.next(referencePath) };

        tx.nodes.insert({ text: '' }, { at: point.path });
        tx.selection.set({ anchor: point, focus: point });
      };

      return {
        createDefinition,
        focusDefinition,
        focusReference,
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
