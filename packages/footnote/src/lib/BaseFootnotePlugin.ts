import {
  triggerCombobox,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import {
  BaseParagraphPlugin,
  type DefinitionOf,
  defineBasePlugin,
} from '@platejs/core';
import {
  type Descendant,
  type Element,
  type ElementOf,
  type NodeInsertNodesOptions,
  type NodeEntry,
  type Path,
  type Point,
  ElementApi,
  PathApi,
  TextApi,
  property,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

const NUMERIC_IDENTIFIER_REGEX = /^\d+$/;
const TRIGGER_PREVIOUS_CHAR_PATTERN = /^\[$/;

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
        properties: { identifier: property.string() },
      },
    }),
    codecs: ({ defineCodecs, schema: { type } }) =>
      defineCodecs({
        'text/markdown': {
          from: 'footnoteDefinition',
          kind: 'node',
          decode: ({ decodeNodes, decoration, node, registry }) => {
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
              identifier: node.identifier,
              type,
            };
          },
          encode: ({ encodeFlow, node }) => ({
            children: encodeFlow(node.children),
            identifier: node.identifier ?? '',
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
  identifier: string;
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
        decode: ({ node }) => ({
          children: [{ text: '' }],
          identifier: node.identifier ?? '',
          type,
        }),
        encode: ({ node }) => ({
          identifier:
            node.identifier ??
            node.children
              .map((child) => (TextApi.isText(child) ? child.text : ''))
              .join(''),
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
          definitionsByIdentifier: Map<string, NodeEntry<Footnote>[]>;
          footnotes: NodeEntry<Footnote>[];
          referencesByIdentifier: Map<string, NodeEntry<Footnote>[]>;
        }
      | undefined;
    const getRegistry = () => {
      const children = state.children();

      if (registry?.children === children) return registry;

      const definitions: NodeEntry<Footnote>[] = [];
      const footnotes: NodeEntry<Footnote>[] = [];
      const definitionsByIdentifier = new Map<string, NodeEntry<Footnote>[]>();
      const referencesByIdentifier = new Map<string, NodeEntry<Footnote>[]>();

      for (const entry of state.nodes.toArray<Footnote>({
        at: [],
        match: (node) =>
          ElementApi.isElement(node) &&
          (node.type === definitionType || node.type === referenceType),
      })) {
        const [footnote] = entry;

        footnotes.push(entry);
        if (footnote.type === definitionType) {
          definitions.push(entry);
        }
        if (!footnote.identifier) continue;

        const entries =
          footnote.type === definitionType
            ? definitionsByIdentifier
            : referencesByIdentifier;
        const matches = entries.get(footnote.identifier) ?? [];

        matches.push(entry);
        entries.set(footnote.identifier, matches);
      }

      registry = {
        children,
        definitions,
        definitionsByIdentifier,
        footnotes,
        referencesByIdentifier,
      };

      return registry;
    };
    const definitions = ({ identifier }: { identifier?: string } = {}) => {
      const current = getRegistry();

      return (
        (identifier
          ? current.definitionsByIdentifier.get(identifier)
          : current.definitions
        )?.slice() ?? []
      );
    };
    const references = ({ identifier }: { identifier: string }) =>
      getRegistry().referencesByIdentifier.get(identifier)?.slice() ?? [];

    return {
      definition: ({ identifier }: { identifier: string }) =>
        definitions({ identifier })[0],
      definitions,
      definitionText: ({ identifier }: { identifier: string }) => {
        const definition = definitions({ identifier })[0];

        return definition ? state.text.string(definition[1]) : undefined;
      },
      duplicateDefinitions: ({ identifier }: { identifier: string }) =>
        definitions({ identifier }).slice(1),
      duplicateIdentifiers: () => {
        const counts = new Map<string, number>();

        for (const [definition] of definitions()) {
          if (!definition.identifier) continue;

          counts.set(
            definition.identifier,
            (counts.get(definition.identifier) ?? 0) + 1
          );
        }

        return [...counts]
          .filter(([, count]) => count > 1)
          .map(([identifier]) => identifier);
      },
      hasDuplicateDefinitions: ({ identifier }: { identifier: string }) =>
        definitions({ identifier }).length > 1,
      identifiers: () => [
        ...new Set(
          definitions().flatMap(([definition]) =>
            definition.identifier ? [definition.identifier] : []
          )
        ),
      ],
      isDuplicateDefinition: ({ path }: { path: Path }) => {
        const entry = state.nodes.get<Footnote>(path);

        if (!entry || entry[0].type !== definitionType) return false;

        const { identifier } = entry[0];

        if (!identifier) return false;

        return definitions({ identifier }).some(
          ([, definitionPath], index) =>
            index > 0 && PathApi.equals(definitionPath, path)
        );
      },
      isResolved: ({ identifier }: { identifier: string }) =>
        definitions({ identifier }).length > 0,
      nextId: () => {
        const used = new Set<number>();

        for (const [footnote] of getRegistry().footnotes) {
          if (
            footnote.identifier &&
            NUMERIC_IDENTIFIER_REGEX.test(footnote.identifier)
          ) {
            used.add(Number.parseInt(footnote.identifier, 10));
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
      properties: { identifier: property.string() },
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
        const parentEntry = tx.nodes.parent<Element>(path);
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
        identifier,
      }: {
        identifier?: string;
        path: Path;
      }) => {
        const entry =
          tx.nodes.get<
            ElementOf<typeof BaseFootnoteDefinitionPlugin | typeof plugin>
          >(path);

        if (!entry || entry[0].type !== definitionType) return false;
        if (!entry[0].identifier) return false;
        if (!tx[plugin.name].isDuplicateDefinition({ path })) return false;

        const nextIdentifier = identifier ?? tx[plugin.name].nextId();

        if (
          nextIdentifier !== entry[0].identifier &&
          tx[plugin.name].definition({ identifier: nextIdentifier })
        ) {
          return false;
        }

        tx.nodes.set({ identifier: nextIdentifier }, { at: path });

        return nextIdentifier;
      };
      const selectDefinition = ({ identifier }: { identifier: string }) => {
        const definition = tx[plugin.name].definition({ identifier });

        if (!definition) return false;

        const point = tx.points.start(definition[1]);

        if (!point) return false;

        tx.selection.set({ anchor: point, focus: point });

        return { point, targetPath: definition[1] };
      };
      const selectReference = ({
        identifier,
        index = 0,
      }: {
        identifier: string;
        index?: number;
      }) => {
        const reference = tx[plugin.name].references({ identifier })[index];

        if (!reference) return false;

        const point = referencePoint(reference[1]);

        if (!point) return false;

        tx.selection.set({ anchor: point, focus: point });

        return { point, targetPath: reference[1] };
      };
      const focusDefinition = ({ identifier }: { identifier: string }) =>
        !!selectDefinition({ identifier });
      const focusReference = ({
        identifier,
        index = 0,
      }: {
        identifier: string;
        index?: number;
      }) => !!selectReference({ identifier, index });
      const createDefinition = ({
        focus = true,
        fragment,
        identifier,
      }: CreateFootnoteDefinitionOptions) => {
        if (!definitionType) {
          throw new Error(
            'Footnote definition creation requires BaseFootnoteDefinitionPlugin.'
          );
        }

        const existingDefinition = tx[plugin.name].definition({
          identifier,
        });

        if (existingDefinition) {
          if (focus) focusDefinition({ identifier });

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
            ...tx.schema.create(definitionType, { identifier }),
            children,
          },
          { at: path }
        );

        if (focus) focusDefinition({ identifier });

        return path;
      };
      const insert = (
        {
          focusDefinition: shouldFocusDefinition = true,
          identifier,
          trigger,
        }: {
          focusDefinition?: boolean;
          identifier?: string;
          trigger?: string;
        } = {},
        options: NodeInsertNodesOptions<ElementOf<typeof plugin>> = {}
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

        const nextIdentifier = identifier ?? tx[plugin.name].nextId();
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

        tx.nodes.insert(
          tx.schema.create(type, { identifier: nextIdentifier }),
          options
        );
        createDefinition({
          focus: shouldFocusDefinition,
          fragment,
          identifier: nextIdentifier,
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
