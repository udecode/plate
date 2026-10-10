import {
  BaseParagraphPlugin,
  definePlugin,
  editorCommands,
  ElementApi,
  type ElementOf,
  type Location,
  type NodeKey,
  NodeApi,
  type NodeSelection,
  PathApi,
  type BlockInsertOptions,
  type BlockUpsertOptions,
  PLUGINS,
  RangeApi,
  schema,
  SelectionApi,
  transferVeto,
} from '../../../core';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';

export type BaseDetailsPluginState = {
  openKeys: Set<NodeKey>;
};

export const BaseDetailsSummaryPlugin = definePlugin(PLUGINS.detailsSummary, {
  schema: {
    element: {
      ...schema.element.textBlock(),
      blockContent: false,
      type: 'summary',
    },
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'summary' }),
        match: [{ tag: 'summary' }],
      },
      markdown: { tag: type },
    }),
});

export const BaseDetailsPlugin = definePlugin(PLUGINS.details, {
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
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'details' }),
        match: [{ tag: 'details' }],
      },
      markdown: { tag: type },
    }),
})
  .extend(({ editor, plugin, schema: { type }, store }) => {
    const openViews = new Map<NodeKey, typeof editor>();

    return {
      activate({ onCleanup }) {
        onCleanup(() => openViews.clear());
      },
      contributions: [
        // The details grammar allows a summary anywhere and a correction moves
        // it first; a transfer never takes it or lands before it.
        transferVeto.of(({ edge, payload, target: [, path] }, view) => {
          const summaryType = editor.plugin(BaseDetailsSummaryPlugin).schema
            .type;

          if (
            payload.kind === 'nodes' &&
            payload.nodes.some((node) =>
              ElementApi.isElementType(node, summaryType)
            )
          ) {
            return true;
          }

          const parent =
            path.length > 1
              ? view.read.nodes.get(PathApi.parent(path))?.[0]
              : undefined;

          return (
            !!parent &&
            ElementApi.isElementType(parent, type) &&
            edge === 'before' &&
            path.at(-1) === 0
          );
        }),
      ],
      api: ({ editor: commandEditor }) => ({
        setOpen: (key: NodeKey, open: boolean) => {
          if (!open && !commandEditor.read.view.isReadOnly()) {
            const detailsEntry = commandEditor.read.nodes.get(key);
            const selection = commandEditor.read.selection();

            if (
              detailsEntry &&
              ElementApi.isElementType(detailsEntry[0], type)
            ) {
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
                const point = commandEditor.read.points.end(
                  detailsPath.concat(0)
                );

                if (point) commandEditor.update.selection.set(point);
              }
            }
          }

          if (open) openViews.set(key, commandEditor);
          else openViews.delete(key);

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

            const paragraphType =
              editor.plugin(BaseParagraphPlugin).schema.type;
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
                tx.nodes.set(
                  { type: paragraphType },
                  { at: path.concat(index) }
                );
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
              const view = openViews.get(key) ?? currentEditor;
              const entry = view.read.nodes.get(key);
              const exists =
                !!entry && ElementApi.isElementType(entry[0], type);

              if (!exists) openViews.delete(key);

              return exists;
            })
          );

          if (next.size !== current.size) currentStore.set({ openKeys: next });
        },
      },
      selectors: {
        isOpen: (state, key: NodeKey) => state.openKeys.has(key),
      },
      update: ({ editor: commandEditor, tx }) => {
        const insertDetails = (
          data: Record<string, never> = {},
          { select, ...options }: BlockInsertOptions = {}
        ) => {
          const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
          const summaryType = editor.plugin(BaseDetailsSummaryPlugin).schema
            .type;

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

          openViews.set(key, commandEditor);
          store.set((draft) => {
            draft.openKeys = new Set(draft.openKeys).add(key);
          });

          if (select) {
            const point = tx.points.start(entry[1].concat(0));

            if (point) tx.selection.set(point);
          }
        };
        const applyDetailsInsertion = (
          mode: 'insert' | 'upsert',
          data: Record<string, never> = {},
          options: BlockInsertOptions | BlockUpsertOptions = {}
        ) =>
          applyBlockInsertion({
            insert: (insertOptions) => insertDetails(data, insertOptions),
            matches: (block) => block.type === type,
            mode,
            options,
            tx,
          });

        return {
          insert: (
            data: Record<string, never> = {},
            options: BlockInsertOptions = {}
          ) => applyDetailsInsertion('insert', data, options),
          unwrap: ({ at }: { at?: Location | NodeSelection } = {}) => {
            const detailsEntries = [
              ...tx.nodes.toArray({ at, mode: 'highest', type: plugin }),
            ].reverse();
            const paragraphType =
              editor.plugin(BaseParagraphPlugin).schema.type;

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

            const paragraphType =
              editor.plugin(BaseParagraphPlugin).schema.type;
            const summaryType = editor.plugin(BaseDetailsSummaryPlugin).schema
              .type;
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

            tx.nodes.wrap(
              { children: [], type },
              { at: range, mode: 'highest' }
            );

            const detailsEntry = tx.nodes.get(first[1], { type: plugin });

            if (!detailsEntry) return;

            const key = tx.key(detailsEntry[0]);

            openViews.set(key, commandEditor);
            store.set((draft) => {
              draft.openKeys = new Set(draft.openKeys).add(key);
            });
          },
          upsert: (
            data: Record<string, never> = {},
            options: BlockUpsertOptions = {}
          ) => applyDetailsInsertion('upsert', data, options),
        };
      },
    };
  })
  .extend(({ editor, plugin, store }) => ({
    commands: ({ around, handle }) => [
      around(editorCommands.insertBreak, ({ state, next }) => {
        const selection = state.selection();

        if (!selection || !RangeApi.isCollapsed(selection)) return next();

        const summary = state.nodes.above({
          at: selection,
          type: BaseDetailsSummaryPlugin,
        });
        const details = summary
          ? state.nodes.parent(summary[1], { type: plugin })
          : state.nodes.above({ at: selection, type: plugin });

        if (!details) return next();

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

            return state.transaction((tx) => {
              if (firstBodyPoint) {
                tx.selection.set(firstBodyPoint);
              } else {
                tx.nodes.insert(
                  { children: [{ text: '' }], type: paragraphType },
                  { at: details[1].concat(1), select: true }
                );
              }
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

        return next();
      }),
      handle(editorCommands.delete, ({ input, state }) => {
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
            tx.plugin(plugin.name).unwrap({ at: details[1] });
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
