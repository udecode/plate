import {
  BaseParagraphPlugin,
  defineBasePlugin,
  editorCommands,
  ElementApi,
  type ElementOf,
  type Location,
  type NodeKey,
  NodeApi,
  type NodeSelection,
  PathApi,
  type PlateBlockInsertOptions,
  PLUGINS,
  RangeApi,
  schema,
  SelectionApi,
} from '../../../core';

export type BaseDetailsPluginState = {
  openKeys: Set<NodeKey>;
};

export const BaseDetailsSummaryPlugin = defineBasePlugin(
  PLUGINS.detailsSummary,
  {
    schema: {
      element: {
        ...schema.element.textBlock(),
        type: 'summary',
      },
    },
    codecs: ({ defineCodecs, schema: { type } }) =>
      defineCodecs({
        'text/html': {
          decode: () => ({}),
          encode: ({ content }) => ({ children: content, tag: 'summary' }),
          match: [{ tag: 'summary' }],
        },
        'text/markdown': {
          from: type,
          kind: 'node',
          decode: ({ decode, decoration, isInline, node }) => {
            const paragraph =
              node.children.length === 1 &&
              node.children[0]?.type === 'paragraph'
                ? node.children[0]
                : undefined;
            const children = decode(
              paragraph ? paragraph.children : node.children,
              decoration
            );

            if (
              children.some(
                (child) => ElementApi.isElement(child) && !isInline(child)
              )
            ) {
              throw new Error(
                'Summary children must be inline Markdown content.'
              );
            }

            return { children, type };
          },
          encode: ({ encodePhrasing, node }) => ({
            attributes: [],
            children: [
              {
                children: encodePhrasing(node.children),
                type: 'paragraph',
              },
            ],
            name: type,
            type: 'mdxJsxFlowElement',
          }),
        },
      }),
  }
);

export const BaseDetailsPlugin = defineBasePlugin(PLUGINS.details, {
  dependencies: [BaseDetailsSummaryPlugin, BaseParagraphPlugin],
  initialState: (): BaseDetailsPluginState => ({
    openKeys: new Set(),
  }),
  schema: ({ plugins }) => ({
    element: {
      content: schema.content.any(
        [
          schema.content.type('summary').allowed,
          plugins.blockContent().allowed,
        ],
        { default: { type: 'summary' }, min: 1 }
      ),
    },
  }),
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'details' }),
        match: [{ tag: 'details' }],
      },
      'text/markdown': {
        from: type,
        kind: 'node',
        decode: ({ decode, decoration, node, registry }) => {
          const summaryType = registry.type(PLUGINS.detailsSummary);

          if (!summaryType) {
            throw new Error('DetailsSummary must be installed.');
          }

          return {
            children: decode(node.children, decoration).map((child) => {
              if (
                ElementApi.isElement(child) &&
                child.children.length === 1 &&
                ElementApi.isElementType(child.children[0], summaryType)
              ) {
                return child.children[0];
              }

              return child;
            }),
            type,
          };
        },
        encode: ({ encodeFlow, node }) => ({
          attributes: [],
          children: encodeFlow(node.children),
          name: type,
          type: 'mdxJsxFlowElement',
        }),
      },
    }),
})
  .extend(({ editor, plugin, schema: { type }, store }) => ({
    api: () => ({
      setOpen: (key: NodeKey, open: boolean) => {
        if (!open) {
          const detailsEntry = editor.read.nodes.get(key);
          const selection = editor.read.selection();

          if (detailsEntry && ElementApi.isElementType(detailsEntry[0], type)) {
            const detailsPath = detailsEntry[1];
            const selectedPaths = SelectionApi.isNode(selection)
              ? selection.paths
              : RangeApi.isRange(selection)
                ? [selection.anchor.path, selection.focus.path]
                : [];
            const isInBody = selectedPaths.some(
              (path) =>
                PathApi.isDescendant(path, detailsPath) &&
                path[detailsPath.length] !== 0
            );

            if (isInBody) {
              const point = editor.read.points.end(detailsPath.concat(0));

              if (point) editor.update.selection.set(point);
            }
          }
        }

        store.set((draft) => {
          const openKeys = new Set(draft.openKeys);

          if (open) {
            openKeys.add(key);
          } else {
            openKeys.delete(key);
          }

          draft.openKeys = openKeys;
        });
      },
    }),
    corrections: [
      {
        event: 'content',
        query: { type: plugin },
        correct({ entry: [node, path], tx }) {
          if (!ElementApi.isElement(node)) return;

          const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
          const summaryType = editor.plugin(BaseDetailsSummaryPlugin).schema
            .type;

          if (node.children.some((child) => !ElementApi.isElement(child))) {
            throw new Error(
              `Details at [${path.join(',')}] contains non-block content.`
            );
          }

          const firstSummaryIndex = node.children.findIndex((child) =>
            ElementApi.isElementType(child, summaryType)
          );

          if (firstSummaryIndex === -1) {
            tx.nodes.insert(
              { children: [{ text: '' }], type: summaryType },
              { at: path.concat(0) }
            );
          } else if (firstSummaryIndex !== 0) {
            tx.nodes.move({
              at: path.concat(firstSummaryIndex),
              to: path.concat(0),
            });
          }

          tx.nodes.children(path).forEach((child, index) => {
            if (index > 0 && ElementApi.isElementType(child, summaryType)) {
              tx.nodes.set({ type: paragraphType }, { at: path.concat(index) });
            }
          });
        },
      },
      {
        event: 'content',
        query: { type: BaseDetailsSummaryPlugin },
        correct({ entry: [, path], tx }) {
          const parent = tx.nodes.parent(path);

          if (parent && ElementApi.isElementType(parent[0], type)) return;

          tx.nodes.set(
            { type: editor.plugin(BaseParagraphPlugin).schema.type },
            { at: path }
          );
        },
      },
    ],
    on: {
      commit({ commit, editor: currentEditor, store: currentStore }) {
        if (!commit.changed.hasAny('document')) return;

        const current = currentStore.get().openKeys;
        const next = new Set(
          [...current].filter((key) => {
            const entry = currentEditor.read.nodes.get(key);

            return entry && ElementApi.isElementType(entry[0], type);
          })
        );

        if (next.size !== current.size) currentStore.set({ openKeys: next });
      },
    },
    selectors: {
      isOpen: (state, key: NodeKey) => state.openKeys.has(key),
    },
    update: ({ tx }) => ({
      insert: (
        data: Record<string, never> = {},
        { select, ...options }: PlateBlockInsertOptions = {}
      ) => {
        const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
        const summaryType = editor.plugin(BaseDetailsSummaryPlugin).schema.type;

        const element = {
          ...data,
          children: [
            { children: [{ text: '' }], type: summaryType },
            { children: [{ text: '' }], type: paragraphType },
          ],
          type,
        };
        if (options.at === undefined || options.after !== undefined) {
          tx.blocks.insertAfter(element, { ...options, at: options.after });
        } else {
          tx.nodes.insert(element, options);
        }

        const entry = tx.nodes.get(element, { type: plugin });

        if (!entry) return;

        const key = tx.key(entry[0]);

        store.set((draft) => {
          draft.openKeys = new Set(draft.openKeys).add(key);
        });

        if (select) {
          const point = tx.points.start(entry[1].concat(0));

          if (point) tx.selection.set(point);
        }
      },
      unwrap: ({ at }: { at?: Location | NodeSelection } = {}) => {
        const detailsEntries = [
          ...tx.nodes.toArray({ at, mode: 'highest', type: plugin }),
        ].reverse();
        const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;

        detailsEntries.forEach(([, path]) => {
          tx.nodes.set({ type: paragraphType }, { at: path.concat(0) });
          tx.nodes.unwrap({ at: path, type: plugin });
        });
      },
      wrap: ({ at }: { at?: Location | NodeSelection } = {}) => {
        const blocks = tx.nodes.blocks({ at, mode: 'highest' });
        const first = blocks[0];

        if (!first) return;

        const parentPath = PathApi.parent(first[1]);

        if (
          blocks.some(
            ([, path]) => !PathApi.equals(PathApi.parent(path), parentPath)
          )
        ) {
          return;
        }

        const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
        const summaryType = editor.plugin(BaseDetailsSummaryPlugin).schema.type;
        const firstIsTextBlock = editor.read.schema.isElementTypeInGroup(
          first[0].type,
          'textBlock'
        );
        let paths = blocks.map(([, path]) => path);

        if (firstIsTextBlock) {
          tx.nodes.set({ type: summaryType }, { at: first[1] });

          if (blocks.length === 1) {
            tx.nodes.insert(
              { children: [{ text: '' }], type: paragraphType },
              { at: PathApi.next(first[1]) }
            );
            paths = [first[1], PathApi.next(first[1])];
          }
        } else {
          tx.nodes.insert(
            { children: [{ text: '' }], type: summaryType },
            { at: first[1] }
          );
          paths = [first[1], ...paths.map((path) => PathApi.next(path))];
        }

        const entries = paths.flatMap((path) => {
          const entry = tx.nodes.get(path);

          return entry ? [entry] : [];
        });
        const range = tx.ranges.fromEntries(entries);

        if (!range) return;

        tx.nodes.wrap({ children: [], type }, { at: range, mode: 'highest' });

        const detailsEntry = tx.nodes.get(first[1], { type: plugin });

        if (!detailsEntry) return;

        const key = tx.key(detailsEntry[0]);

        store.set((draft) => {
          draft.openKeys = new Set(draft.openKeys).add(key);
        });
      },
    }),
  }))
  .extend(({ editor, plugin, store }) => ({
    commands: ({ around }) => [
      around(editorCommands.insertBreak, ({ state, next }) => {
        const selection = state.selection();

        if (!selection || !RangeApi.isCollapsed(selection)) return false;

        const summary = state.nodes.above({
          at: selection,
          type: BaseDetailsSummaryPlugin,
        });
        const details = summary
          ? state.nodes.parent(summary[1], { type: plugin })
          : state.nodes.above({ at: selection, type: plugin });

        if (!details) return false;

        const detailsKey = state.key(details[0]);
        const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
        const exitAfterDetails = () =>
          state.transaction((tx) => {
            const nextPath = PathApi.next(details[1]);
            const nextBlock = tx.nodes.get(nextPath);
            const point = nextBlock ? tx.points.start(nextPath) : undefined;

            if (point) {
              tx.selection.set(point);

              return;
            }

            tx.nodes.insert(
              { children: [{ text: '' }], type: paragraphType },
              { at: nextPath, select: true }
            );
          });

        if (summary) {
          if (!store.get('isOpen', detailsKey)) return exitAfterDetails();

          if (state.points.isEnd(selection.anchor, summary[1])) {
            const firstBodyPoint = state.points.start(details[1].concat(1));

            if (!firstBodyPoint) return exitAfterDetails();

            return state.transaction((tx) => {
              tx.selection.set(firstBodyPoint);
            });
          }

          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            const firstBodyPath = details[1].concat(1);
            const firstBody = tx.nodes.get(firstBodyPath)?.[0];

            if (
              firstBody &&
              ElementApi.isElementType(
                firstBody,
                editor.plugin(BaseDetailsSummaryPlugin).schema.type
              )
            ) {
              tx.nodes.set({ type: paragraphType }, { at: firstBodyPath });
            }
          });
        }

        const block = state.nodes.block({ at: selection });
        const childIndex = block?.[1].at(-1);

        if (
          block &&
          childIndex === details[0].children.length - 1 &&
          childIndex > 0 &&
          NodeApi.string(block[0]) === '' &&
          state.points.isEnd(selection.anchor, block[1])
        ) {
          return exitAfterDetails();
        }

        return false;
      }),
      around(editorCommands.delete, ({ input, state }) => {
        const selection = state.selection();

        if (!selection || !RangeApi.isCollapsed(selection)) return false;

        const summary = state.nodes.above({
          at: selection,
          type: BaseDetailsSummaryPlugin,
        });
        const details = summary
          ? state.nodes.parent(summary[1], { type: plugin })
          : state.nodes.above({ at: selection, type: plugin });

        if (!details) return false;

        if (
          input.direction === 'backward' &&
          summary &&
          state.points.isStart(selection.anchor, summary[1])
        ) {
          return state.transaction((tx) => {
            tx.plugin(plugin).unwrap({ at: details[1] });
          });
        }

        const block = state.nodes.block({ at: selection });

        if (
          input.direction === 'backward' &&
          block &&
          PathApi.equals(block[1], details[1].concat(1)) &&
          state.points.isStart(selection.anchor, block[1])
        ) {
          const point = state.points.end(details[1].concat(0));

          if (!point) return false;

          return state.transaction((tx) => {
            tx.selection.set(point);
          });
        }

        if (
          input.direction === 'forward' &&
          summary &&
          !store.get('isOpen', state.key(details[0])) &&
          state.points.isEnd(selection.anchor, summary[1])
        ) {
          const next = state.nodes.next({ at: details[1], from: 'after' });
          const point = next ? state.points.start(next[1]) : undefined;

          return state.transaction((tx) => {
            tx.selection.set(point ?? selection);
          });
        }

        return false;
      }),
    ],
  }));

export type DetailsElement = ElementOf<typeof BaseDetailsPlugin>;
export type DetailsSummaryElement = ElementOf<typeof BaseDetailsSummaryPlugin>;
