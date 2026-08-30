import {
  BaseParagraphPlugin,
  defineBasePlugin,
  ElementApi,
  type ElementOf,
  type Location,
  type NodeKey,
  type NodeSelection,
  PathApi,
  type PlateNodeInsertOptions,
  PLUGINS,
  RangeApi,
  schema,
  TextApi,
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
}).extend(({ editor, plugin, schema: { type }, store }) => ({
  api: () => ({
    setOpen: (key: NodeKey, open: boolean) => {
      if (!open) {
        const detailsEntry = editor.read.nodes.get(key);
        const selection = editor.read.selection();

        if (
          detailsEntry &&
          ElementApi.isElementType(detailsEntry[0], type) &&
          RangeApi.isRange(selection)
        ) {
          const detailsPath = detailsEntry[1];
          const isInBody = [selection.anchor.path, selection.focus.path].some(
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
        const summaryType = editor.plugin(BaseDetailsSummaryPlugin).schema.type;

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
      { select, ...options }: PlateNodeInsertOptions = {}
    ) => {
      const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
      const summaryType = editor.plugin(BaseDetailsSummaryPlugin).schema.type;

      tx.nodes.insert(
        {
          ...data,
          children: [
            { children: [{ text: '' }], type: summaryType },
            { children: [{ text: '' }], type: paragraphType },
          ],
          type,
        },
        options
      );

      const entry = tx.nodes.find({ at: options.at, type: plugin });

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
      const firstIsTextBlock = first[0].children.every(TextApi.isText);
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
}));

export type DetailsElement = ElementOf<typeof BaseDetailsPlugin>;
export type DetailsSummaryElement = ElementOf<typeof BaseDetailsSummaryPlugin>;
