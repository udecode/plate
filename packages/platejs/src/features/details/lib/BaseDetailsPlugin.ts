import {
  BaseParagraphPlugin,
  definePlugin,
  type Editor,
  editorCommands,
  type EditorCoreStateView,
  type EditorUpdateTransaction,
  ElementApi,
  type ElementOf,
  type Location,
  type NamedRootKey,
  type NodeKey,
  NodeApi,
  type NodeSelection,
  PathApi,
  type Path,
  type BlockInsertOptions,
  type BlockUpsertOptions,
  PLUGINS,
  RangeApi,
  property,
  schema,
  SelectionApi,
  txLocate,
  locateAt,
} from '../../../core';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';
import { blockRelease } from '../../../internal/plugin/blockRelease';
import { insertionAnchor } from '../../../internal/plugin/insertionAnchor';
import { inRoot, rootOf } from '../../../internal/utils/inRoot';
import { BaseHeadingPlugin, type HeadingLevel } from '../../basic-nodes';

const extraSummaryToMarkedParagraph = (document: Document, extra: Element) => {
  const paragraph = document.createElement('p');
  const markSpan = document.createElement('span');

  for (const { name, value } of extra.attributes) {
    markSpan.setAttribute(name, value);
  }
  markSpan.append(...extra.childNodes);
  paragraph.append(markSpan);
  extra.replaceWith(paragraph);
};

const getDetailsOfTitle = (
  state: Pick<EditorCoreStateView, 'nodes'>,
  {
    path,
    root,
    type,
  }: Readonly<{ path: Path; root?: NamedRootKey; type: string }>
) => {
  if (path.at(-1) !== 0) return undefined;

  const container = state.nodes.parent(inRoot(path, root), { type });
  const title = container?.[0].children[0];

  return title && state.nodes.isContent(title) ? container : undefined;
};

const isSummaryHeadingLevel = (value: unknown): value is HeadingLevel =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 6;

const getReleasedTitleProps = (editor: Editor, level: unknown) => {
  const heading = editor.plugin(BaseHeadingPlugin);

  return isSummaryHeadingLevel(level) && heading.installed
    ? { level, type: heading.schema.type }
    : { type: editor.plugin(BaseParagraphPlugin).schema.type };
};

const releaseDetails = (
  editor: Editor,
  tx: EditorUpdateTransaction,
  details: NodeKey,
  title: NodeKey | null
) => {
  const node = title && tx.nodes.get(title, { match: ElementApi.isElement });

  if (title && node) {
    tx.nodes.set(getReleasedTitleProps(editor, node[0].level), { at: title });
  }

  return tx.nodes.unwrap({ at: details });
};

export type BaseDetailsPluginState = {
  openKeys: Set<NodeKey>;
};

export const BaseDetailsSummaryPlugin = definePlugin(PLUGINS.detailsSummary, {
  schema: {
    element: {
      ...schema.element.textBlock(),
      blockContent: false,
      type: 'summary',
      properties: {
        level: property.json({
          validate: isSummaryHeadingLevel,
          validationVersion: 1,
        }),
      },
    },
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: ({ element }) => {
          const heading = element.firstElementChild;
          const level =
            heading &&
            /^H[1-6]$/.test(heading.tagName) &&
            [...element.childNodes].every(
              (child) =>
                child === heading ||
                (child.nodeType === child.TEXT_NODE &&
                  !child.textContent?.trim())
            )
              ? Number(heading.tagName.slice(1))
              : undefined;
          return isSummaryHeadingLevel(level) ? { level } : {};
        },
        encode: ({ content, node, preserve }) => {
          preserve('level');
          return {
            children: node.level
              ? [{ tag: `h${node.level}`, children: content }]
              : content,
            tag: 'summary',
          };
        },
        match: [{ tag: 'summary' }],
      },
      markdown: {
        tag: type,
        // GitHub renders a leveled title only as `<summary><h2>…</h2></summary>`.
        decode: ({ caption, decode, node, readTagAttributes, refuse }) => {
          const [paragraph, ...rest] = node.children;
          const phrasing =
            paragraph?.type === 'paragraph' && rest.length === 0
              ? paragraph.children
              : [];
          const open = phrasing[0];
          const close = phrasing.at(-1);
          const level =
            phrasing.length > 1 && open?.type === 'html'
              ? Number(/^<h([1-6])>$/i.exec(open.value)?.[1])
              : undefined;
          const heading =
            isSummaryHeadingLevel(level) &&
            close?.type === 'html' &&
            close.value.toLowerCase() === `</h${level}>`;
          const { properties } = readTagAttributes();
          const children = caption(
            decode(
              heading
                ? [{ children: phrasing.slice(1, -1), type: 'paragraph' }]
                : node.children
            )
          );

          if (!children) {
            return refuse(`<${type}> content must be one Markdown paragraph.`);
          }

          const titleLevel = heading ? level : properties.level;

          return {
            ...(isSummaryHeadingLevel(titleLevel) ? { level: titleLevel } : {}),
            children: [...children],
            type,
          };
        },
        encode: ({
          encodeNodeAttributes,
          encodePhrasing,
          node,
          preserve,
          readPlainInline,
        }) => {
          const content =
            readPlainInline(node.children) === ''
              ? []
              : encodePhrasing(node.children);
          const phrasing = node.level
            ? [
                { type: 'html' as const, value: `<h${node.level}>` },
                ...content,
                { type: 'html' as const, value: `</h${node.level}>` },
              ]
            : content;

          if (node.level) preserve('level');

          return {
            attributes: encodeNodeAttributes().filter(
              (attribute) =>
                !('name' in attribute && attribute.name === 'level')
            ),
            children:
              phrasing.length > 0
                ? [{ children: phrasing, type: 'paragraph' }]
                : [],
            name: type,
            type: 'mdxJsxFlowElement',
          };
        },
      },
    }),
});

export const BaseDetailsPlugin = definePlugin(PLUGINS.details, {
  dependencies: [BaseDetailsSummaryPlugin, BaseParagraphPlugin],
  initialState: (): BaseDetailsPluginState => ({
    openKeys: new Set(),
  }),
  schema: ({ plugins }) => ({
    element: {
      content: schema.content.prefix(
        [{ element: BaseDetailsSummaryPlugin }],
        plugins.blockContent({ default: BaseParagraphPlugin })
      ),
    },
  }),
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        prepareDocument: ({ document }) => {
          for (const details of document.body.querySelectorAll('details')) {
            const summaries = [...details.children].filter(
              (child) => child.tagName === 'SUMMARY'
            );

            if (summaries[0]) details.prepend(summaries[0]);
            for (const extra of summaries.slice(1)) {
              extraSummaryToMarkedParagraph(document, extra);
            }
          }
        },
        decode: () => ({}),
        encode: ({ content }) => ({ children: content, tag: 'details' }),
        match: [{ tag: 'details' }],
      },
      markdown: { tag: type },
    }),
})
  .extend(({ editor, plugin, schema: { type }, store }) => ({
    contributions: [
      blockRelease.of((tx, [node, path], root) => {
        const container = getDetailsOfTitle(tx, { path, root, type });

        if (!container) return null;

        const details = tx.key(inRoot(container[1], root));
        const key = tx.key(inRoot(path, root));

        if (!details || !key) return null;

        const block = { ...node, ...getReleasedTitleProps(editor, node.level) };

        return {
          apply: (writer) => releaseDetails(editor, writer, details, key),
          block,
          container,
          fit: container[0].children.map((child) =>
            child === node ? block : child
          ),
          key,
        };
      }),
      insertionAnchor.of((tx, [, path], root) => {
        const container = getDetailsOfTitle(tx, { path, root, type });
        const key = container && tx.key(inRoot(container[1], root));

        return key && !store.get('openKeys').has(key) ? container : null;
      }),
    ],
    api: ({ editor: commandEditor }) => ({
      setOpen: (key: NodeKey, open: boolean) => {
        // The plugin store holds open state for every view of the document,
        // so a read-only caller moves the owner's selection out of the body
        // it hides. Another authored view keeps its own selection.
        const writable = [commandEditor, editor].find(
          (candidate) => !candidate.read.view.isReadOnly()
        );

        if (!open && writable) {
          const detailsEntry = writable.read.nodes.get(key);
          const selection = writable.read.selection();

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
              const point = writable.read.points.end(detailsPath.concat(0));

              if (point) writable.update.selection.set(point);
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
    selectors: {
      isOpen: (state, key: NodeKey) => state.openKeys.has(key),
    },
    update: ({ tx }) => {
      const insertDetails = (
        data: Record<string, never> = {},
        { select, ...options }: BlockInsertOptions = {}
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

        const inserted = tx.blocks.insert(element, options);

        if (!inserted) return false;

        const [key] = inserted;

        store.set((draft) => {
          draft.openKeys = new Set(draft.openKeys).add(key);
        });

        if (select) {
          const point = tx.points.start(key);

          if (point) tx.selection.set(point);
        }

        return true;
      };
      const applyDetailsInsertion = (
        mode: 'insert' | 'upsert',
        data: Record<string, never> = {},
        options: BlockInsertOptions | BlockUpsertOptions = {}
      ) =>
        applyBlockInsertion({
          editor,
          insert: (insertOptions) => insertDetails(data, insertOptions),
          matches: (block) => block.type === type,
          mode,
          options,
          tx,
        });

      return {
        insert: txLocate(
          locateAt(1, 'at', 'after', 'before'),
          (
            data: Record<string, never> = {},
            options: BlockInsertOptions = {}
          ) => applyDetailsInsertion('insert', data, options)
        ),
        unwrap: txLocate(
          locateAt(0),
          ({ at }: { at?: Location | NodeSelection } = {}) => {
            const selected = at === undefined ? tx.selection.nodes() : [];
            const target = at ?? tx.selection();
            let sources: ReturnType<typeof tx.nodes.toArray>;

            if (SelectionApi.isNode(at) || selected.length > 0) {
              sources = SelectionApi.isNode(at)
                ? tx.nodes.toArray({ at })
                : [...selected];
            } else if (PathApi.isPath(target)) {
              const entry = tx.nodes.get(target);
              sources = entry ? [entry] : [];
            } else {
              sources = target
                ? tx.nodes.blocks({ at: target, mode: 'lowest' })
                : [];
            }
            const root = rootOf(tx, at);
            const keyAt = (path: Path) => tx.key(inRoot(path, root));
            const detailsPaths = new Map<NodeKey, Path>();

            for (const [node, path] of sources) {
              if (!ElementApi.isElement(node)) continue;

              const location = inRoot(path, root);
              const entry = ElementApi.isElementType(node, type)
                ? tx.nodes.get(location, { type: plugin })
                : tx.nodes.above({ at: location, type });
              const key = entry && keyAt(entry[1]);

              if (entry && key) detailsPaths.set(key, entry[1]);
            }

            let outer: Path | undefined;
            const targets = [...detailsPaths]
              .toSorted(
                ([, left], [, right]) =>
                  PathApi.compare(left, right) || left.length - right.length
              )
              .filter(([, path]) => {
                if (outer && PathApi.isAncestor(outer, path)) return false;

                outer = path;

                return true;
              });

            for (const [key, path] of targets.toReversed()) {
              releaseDetails(editor, tx, key, keyAt([...path, 0]) ?? null);
            }
          }
        ),
        wrap: txLocate(
          locateAt(0),
          ({ at }: { at?: Location | NodeSelection } = {}) => {
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
              const heading = editor.plugin(BaseHeadingPlugin);
              const level = heading.installed
                ? heading.read.level(first[0])
                : undefined;

              tx.nodes.set(
                { type: summaryType, ...(level ? { level } : {}) },
                { at: first[1] }
              );

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

            store.set((draft) => {
              draft.openKeys = new Set(draft.openKeys).add(key);
            });
          }
        ),
        upsert: txLocate(
          locateAt(1, 'after', 'before'),
          (
            data: Record<string, never> = {},
            options: BlockUpsertOptions = {}
          ) => applyDetailsInsertion('upsert', data, options)
        ),
      };
    },
  }))
  .extend(({ editor, plugin, store }) => ({
    commands: ({ around, handle }) => [
      ...[editorCommands.delete, editorCommands.deleteFragment].map((command) =>
        around(command, ({ state, next }) => {
          const result = next();
          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            if (tx.selection.nodes().length > 0) return;
            const selection = tx.selection();
            if (!selection || !RangeApi.isCollapsed(selection)) return;

            const closedDetails = tx.nodes.above({
              at: selection,
              type: plugin,
              match: (node, path) => {
                const key = state.key(path);
                return (
                  ElementApi.isElement(node) &&
                  key !== null &&
                  !store.get('isOpen', key)
                );
              },
              mode: 'highest',
            });
            if (
              !closedDetails ||
              selection.focus.path[closedDetails[1].length] === 0
            ) {
              return;
            }

            const point = tx.points.end(closedDetails[1].concat(0));
            if (point) tx.selection.set(point);
          });
        })
      ),
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

          return next();
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
        if (state.selection.nodes().length > 0) return false;
        const selection = state.selection();

        if (!selection || !RangeApi.isCollapsed(selection)) return false;

        const summary = state.nodes.above({
          at: selection,
          type: BaseDetailsSummaryPlugin,
        });
        const block = state.nodes.block({ at: selection });

        if (
          input.direction === 'backward' &&
          !summary &&
          block &&
          state.points.isStart(selection.anchor, block[1])
        ) {
          const previous = state.points.before(selection.anchor);
          const closedDetails =
            previous &&
            state.nodes.above({
              at: previous,
              type: plugin,
              match: (node) =>
                ElementApi.isElement(node) &&
                !store.get('isOpen', state.key(node)),
              mode: 'highest',
            });
          const point =
            closedDetails &&
            PathApi.isAncestor(PathApi.parent(block[1]), closedDetails[1]) &&
            state.points.end(closedDetails[1].concat(0));

          if (point) {
            return state.transaction((tx) => {
              if (
                ElementApi.isElementType(
                  block[0],
                  editor.plugin(BaseParagraphPlugin).schema.type
                ) &&
                state.nodes.isEmpty(block[0])
              ) {
                tx.nodes.remove({ at: block[1] });
              }
              tx.selection.set(point);
            });
          }
        }

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
