import {
  createTriggerComboboxExtension,
  type TriggerComboboxPluginState,
} from '@platejs/combobox';
import {
  BaseParagraphPlugin,
  type InferConfig,
  createBasePlugin,
} from '@platejs/core';
import {
  type Descendant,
  type Element,
  type NodeInsertNodesOptions,
  type NodeEntry,
  type Path,
  type Point,
  ElementApi,
  PathApi,
  TextApi,
  property,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

const NUMERIC_IDENTIFIER_REGEX = /^\d+$/;

export type TFootnoteElement = Element & {
  identifier?: string;
};

/** Enables support for block footnote definitions. */
export const BaseFootnoteDefinitionPlugin = createBasePlugin({
  key: KEYS.footnoteDefinition,
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: { type: plugins.elementType(BaseParagraphPlugin) },
        min: 1,
      }),
      properties: { identifier: property.string() },
    },
  }),
});

/** Enables support for inline footnote combobox inputs. */
export const BaseFootnoteInputPlugin = createBasePlugin({
  key: KEYS.footnoteInput,
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

export type InsertFootnoteOptions = NodeInsertNodesOptions<TFootnoteElement> & {
  focusDefinition?: boolean;
  identifier?: string;
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

const initialState: FootnotePluginState = {
  createComboboxInput: () => ({
    children: [{ text: '' }],
    type: KEYS.footnoteInput,
  }),
  trigger: '^',
  triggerPreviousCharPattern: /^\[$/,
};

/** Enables footnote references and their document-level operations. */
export const BaseFootnotePlugin = createBasePlugin({
  dependencies: [BaseFootnoteInputPlugin],
  extension: ({ editor, plugin, store, type }) =>
    createTriggerComboboxExtension({
      editor,
      getState: () => store.get(),
      name: plugin.key,
      type,
    }),
  key: 'footnote',
  initialState,
  read: ({ editor, state, type }) => {
    const definitionType = editor.getType(KEYS.footnoteDefinition);
    let registry:
      | {
          children: readonly Descendant[];
          definitions: NodeEntry<TFootnoteElement>[];
          definitionsByIdentifier: Map<string, NodeEntry<TFootnoteElement>[]>;
          footnotes: NodeEntry<TFootnoteElement>[];
          referencesByIdentifier: Map<string, NodeEntry<TFootnoteElement>[]>;
        }
      | undefined;
    const getRegistry = () => {
      const children = state.children();

      if (registry?.children === children) return registry;

      const definitions: NodeEntry<TFootnoteElement>[] = [];
      const footnotes: NodeEntry<TFootnoteElement>[] = [];
      const definitionsByIdentifier = new Map<
        string,
        NodeEntry<TFootnoteElement>[]
      >();
      const referencesByIdentifier = new Map<
        string,
        NodeEntry<TFootnoteElement>[]
      >();

      for (const entry of state.nodes.toArray<TFootnoteElement>({
        at: [],
        match: { type: [definitionType, type] },
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
        const entry = state.nodes.get<TFootnoteElement>(path);

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
      void: 'inline',
    },
  },
  type: KEYS.footnoteReference,
})
  .extend(({ editor, plugin }) => ({
    update: ({ tx }) => {
      const definitionType = editor.getType(KEYS.footnoteDefinition);
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

      return {
        normalizeDuplicateDefinition: ({
          path,
          identifier,
        }: {
          identifier?: string;
          path: Path;
        }) => {
          const entry = tx.nodes.get<TFootnoteElement>(path);

          if (!entry || entry[0].type !== definitionType) return false;
          if (!entry[0].identifier) return false;
          if (!tx[plugin.key].isDuplicateDefinition({ path })) return false;

          const nextIdentifier = identifier ?? tx[plugin.key].nextId();

          if (
            nextIdentifier !== entry[0].identifier &&
            tx[plugin.key].definition({ identifier: nextIdentifier })
          ) {
            return false;
          }

          tx.nodes.set({ identifier: nextIdentifier }, { at: path });

          return nextIdentifier;
        },
        selectDefinition: ({ identifier }: { identifier: string }) => {
          const definition = tx[plugin.key].definition({ identifier });

          if (!definition) return false;

          const point = tx.points.start(definition[1]);

          if (!point) return false;

          tx.selection.set({ anchor: point, focus: point });

          return { point, targetPath: definition[1] };
        },
        selectReference: ({
          identifier,
          index = 0,
        }: {
          identifier: string;
          index?: number;
        }) => {
          const reference = tx[plugin.key].references({ identifier })[index];

          if (!reference) return false;

          const point = referencePoint(reference[1]);

          if (!point) return false;

          tx.selection.set({ anchor: point, focus: point });

          return { point, targetPath: reference[1] };
        },
      };
    },
  }))
  .extend(({ plugin }) => ({
    update: ({ tx }) => ({
      focusDefinition: ({ identifier }: { identifier: string }) =>
        !!tx[plugin.key].selectDefinition({ identifier }),
      focusReference: ({
        identifier,
        index = 0,
      }: {
        identifier: string;
        index?: number;
      }) => !!tx[plugin.key].selectReference({ identifier, index }),
    }),
  }))
  .extend(({ editor, plugin }) => ({
    update: ({ tx }) => {
      const definitionType = editor.getType(KEYS.footnoteDefinition);

      return {
        createDefinition: ({
          focus = true,
          fragment,
          identifier,
        }: CreateFootnoteDefinitionOptions) => {
          const existingDefinition = tx[plugin.key].definition({ identifier });

          if (existingDefinition) {
            if (focus) tx[plugin.key].focusDefinition({ identifier });

            return existingDefinition[1];
          }

          const paragraphType = editor.getType(KEYS.p);
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

          tx.nodes.insert<TFootnoteElement>(
            {
              children,
              identifier,
              type: definitionType,
            },
            { at: path }
          );

          if (focus) tx[plugin.key].focusDefinition({ identifier });

          return path;
        },
      };
    },
  }))
  .extend(({ plugin, type }) => ({
    update: ({ tx }) => ({
      insert: ({
        focusDefinition = true,
        identifier,
        ...options
      }: InsertFootnoteOptions = {}) => {
        const selection = tx.selection();

        if (!selection && options.at === undefined) return;

        const nextIdentifier = identifier ?? tx[plugin.key].nextId();
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

        tx.nodes.insert<TFootnoteElement>(
          {
            children: [{ text: '' }],
            identifier: nextIdentifier,
            type,
          },
          options
        );
        tx[plugin.key].createDefinition({
          focus: focusDefinition,
          fragment,
          identifier: nextIdentifier,
        });

        if (focusDefinition || !referencePath) return;

        const point = { offset: 0, path: PathApi.next(referencePath) };

        tx.nodes.insert({ text: '' }, { at: point.path });
        tx.selection.set({ anchor: point, focus: point });
      },
    }),
  }));

export type FootnoteConfig = InferConfig<typeof BaseFootnotePlugin>;
