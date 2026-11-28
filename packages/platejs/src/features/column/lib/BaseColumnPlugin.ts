import {
  BaseParagraphPlugin,
  type BlockInsertOptions,
  type BlockUpsertOptions,
  definePlugin,
  type Descendant,
  type Editor,
  editorCommands,
  editorReads,
  type Element,
  ElementApi,
  type ElementOf,
  type Location,
  locateAt,
  type Node,
  type NodeKey,
  type NodeSelection,
  type NodeTarget,
  type Path,
  PathApi,
  PLUGINS,
  property,
  RangeApi,
  schema,
  SelectionApi,
  transferVeto,
  txLocate,
} from '../../../core';
import { canPlaceBlocksAtPath, hasNonWritableAt } from '../../../facade';
import { applyBlockInsertion } from '../../../internal/plugin/blockInsertion';

const MAX_COLUMNS = 5;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const isValidColumnCount = (value: number): boolean =>
  Number.isSafeInteger(value) && value >= 2;

const resolveRequestedWidths = (
  columns?: number,
  widths?: readonly number[]
): number[] | null => {
  if (widths !== undefined) {
    if (widths.length < 2 || !widths.every(isPositiveFiniteNumber)) {
      return null;
    }

    return [...widths];
  }

  const count = columns ?? 2;

  if (!isValidColumnCount(count)) return null;

  return Array.from({ length: count }, () => 1);
};

const normalizeWeight = (weight: number): number =>
  Math.abs(weight - 1) < 1e-9 ? 1 : weight;

const containsElementTypes = (
  node: Node,
  types: ReadonlySet<string>
): boolean => {
  if (!ElementApi.isElement(node)) return false;
  if (types.has(node.type)) return true;

  return node.children.some((child) => containsElementTypes(child, types));
};

const flattenColumnNodes = (
  nodes: readonly Descendant[],
  groupType: string,
  columnType: string
): Descendant[] => {
  const result: Descendant[] = [];

  for (const node of nodes) {
    if (!ElementApi.isElement(node)) {
      result.push(node);
      continue;
    }
    if (node.type === groupType || node.type === columnType) {
      result.push(...flattenColumnNodes(node.children, groupType, columnType));
      continue;
    }
    if (containsElementTypes(node, new Set([groupType, columnType]))) {
      result.push({
        ...node,
        children: flattenColumnNodes(node.children, groupType, columnType),
      });
      continue;
    }

    result.push(node);
  }

  return result;
};

const hasLockedBlocks = (
  editor: Editor,
  paths: ReadonlyArray<readonly number[]>
) => {
  const [first, ...rest] = paths;

  if (!first) return false;

  const targetPaths: [Path, ...Path[]] = [
    [...first],
    ...rest.map((path): Path => [...path]),
  ];

  return hasNonWritableAt(
    editor,
    SelectionApi.nodes(targetPaths, { mode: 'block' })
  );
};

const isPathInsideColumn = (
  nodesApi: {
    above: (options: {
      at?: Location;
      type: typeof BaseColumnItemPlugin;
    }) => unknown;
    get: (
      at: Location,
      options?: { type: typeof BaseColumnItemPlugin }
    ) => unknown;
  },
  location: Location | undefined
): boolean => {
  if (!location) return false;
  if (nodesApi.above({ at: location, type: BaseColumnItemPlugin })) {
    return true;
  }
  if (PathApi.isPath(location)) {
    if (nodesApi.get(location, { type: BaseColumnItemPlugin })) return true;
    if (location.length > 0) {
      const parent = PathApi.parent(location);

      return Boolean(
        nodesApi.get(parent, { type: BaseColumnItemPlugin }) ||
        nodesApi.above({ at: parent, type: BaseColumnItemPlugin })
      );
    }
  }

  return false;
};

/** Options for updating a column group's column count or flex weights. */
export type SetColumnsOptions = {
  /** Column group location or element target. */
  at?: NodeTarget<Element>;
  /** Target number of equal-weight columns (must be an integer >= 2). */
  columns?: number;
  /** Target positive finite numeric flex weights (length >= 2). */
  widths?: number[];
};

/** Options for wrapping a block in a column group or resizing an existing group. */
export type ToggleColumnGroupOptions = {
  /** Target block or column group location. */
  at?: NodeTarget<Element> | Location | NodeSelection;
  /** Number of columns (must be an integer >= 2). */
  columns?: number;
  /** Positive finite numeric flex weights (length >= 2). */
  widths?: number[];
};

/** Options for inserting a column group with a column count or flex weights. */
export type InsertColumnGroupInput = {
  /** Number of equal-weight columns (must be an integer >= 2). */
  columns?: number;
  /** Positive finite numeric flex weights (length >= 2). */
  widths?: number[];
};

/** Options for resizing two adjacent columns by their live node keys. */
export type ResizeColumnsOptions = {
  /** Live keys of the two adjacent content columns to resize. */
  columns: readonly [NodeKey, NodeKey];
  /** New positive finite numeric flex weights for the pair. */
  widths: readonly [number, number];
};

/** Options for inserting a sibling column beside an existing column. */
export type InsertColumnOptions = {
  /** Column location or element target; defaults to the enclosing column at selection. */
  at?: NodeTarget<Element>;
  /** Side of the target column to insert on (defaults to `'after'`). */
  side?: 'after' | 'before';
};

/** Options for removing a column or unwrapping a column group. */
export type ColumnTargetOptions = {
  /** Target element or location; defaults to the enclosing node at selection. */
  at?: NodeTarget<Element>;
};

/** Schema, selection, HTML/Markdown codecs, and transfer veto for individual columns. */
export const BaseColumnItemPlugin = definePlugin(PLUGINS.column, {
  dependencies: [BaseParagraphPlugin],
  schema: ({ plugins }) => ({
    element: {
      content: plugins.blockContent({
        default: BaseParagraphPlugin,
        min: 1,
      }),
      properties: {
        width: property.number({
          default: 1,
          omitDefault: true,
          validate: isPositiveFiniteNumber,
          validationVersion: 1,
        }),
      },
      blockContent: false,
    },
  }),
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: ({ element, preserve, report }) => {
          preserve('data-column', 'data-column-width');

          const raw = element.dataset.columnWidth;

          if (raw === undefined || raw.trim() === '') return {};

          const parsed = Number(raw);

          if (!isPositiveFiniteNumber(parsed)) {
            report({
              action: 'dropped',
              kind: 'attribute',
              message: `HTML column width "${raw}" is not a positive finite number; it was omitted.`,
            });

            return {};
          }

          return normalizeWeight(parsed) === 1
            ? {}
            : { width: normalizeWeight(parsed) };
        },
        encode: ({ content, node, preserve }) => {
          preserve('width');

          const weight = normalizeWeight(
            isPositiveFiniteNumber(node.width) ? node.width : 1
          );

          return {
            attributes: {
              'data-column': '',
              ...(weight === 1 ? {} : { 'data-column-width': String(weight) }),
            },
            children: content,
            style: { flex: `${weight} 1 0%` },
            tag: 'div',
          };
        },
        match: [{ attributes: { 'data-column': true }, tag: 'div' }],
        priority: 23,
      },
      markdown: { tag: type },
    }),
})
  .extend(({ plugin }) => ({
    update: ({ tx }) => ({
      selectAll: () => {
        const selection = tx.selection();

        if (!selection) return false;

        const column = tx.nodes.above({
          at: selection,
          type: plugin,
        });

        if (!column) return false;

        let targetPath = column[1];
        const [start, end] = RangeApi.edges(selection);

        if (
          tx.points.isStart(start, targetPath) &&
          tx.points.isEnd(end, targetPath)
        ) {
          targetPath = PathApi.parent(targetPath);
        }

        if (targetPath.length === 0) return false;

        tx.selection.set(targetPath);

        return true;
      },
    }),
  }))
  .extend({ shortcuts: { selectAll: { keys: 'mod+a' } } })
  .extend(({ schema: { type } }) => {
    const isColumn = (node: Node) =>
      ElementApi.isElement(node) && node.type === type;

    return {
      contributions: [
        // The schema admits a column in any group; a column lands only beside
        // the columns of its own group in one document.
        transferVeto.of(({ payload, relation, target: [node, path] }, view) => {
          if (payload.kind !== 'nodes' || !payload.nodes.some(isColumn)) {
            return false;
          }
          if (relation !== 'document' || !isColumn(node)) return true;

          const group = view.key(PathApi.parent(path));

          return !payload.nodes.every(
            (column, index) =>
              isColumn(column) && payload.parentKeys[index] === group
          );
        }),
      ],
    };
  });

/** Element node shape for a single column inside a column group. */
export type ColumnElement = ElementOf<typeof BaseColumnItemPlugin>;

/** Schema, commands, HTML/Markdown codecs, side-drop, and non-nesting guards for multi-column groups. */
export const BaseColumnGroupPlugin = definePlugin(PLUGINS.columnGroup, {
  dependencies: [BaseColumnItemPlugin],
  schema: {
    element: {
      content: schema.content.element(BaseColumnItemPlugin, { min: 2 }),
    },
  },
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      html: {
        decode: ({ preserve }) => {
          preserve('data-column-group');

          return {};
        },
        encode: ({ content }) => ({
          attributes: { 'data-column-group': '' },
          children: content,
          style: { display: 'flex' },
          tag: 'div',
        }),
        match: [{ attributes: { 'data-column-group': true }, tag: 'div' }],
        priority: 22,
      },
      markdown: { tag: type },
    }),
})
  .extend(({ editor, plugin, schema: { type } }) => {
    const getColumnType = () => editor.plugin(BaseColumnItemPlugin).schema.type;
    const getParagraphType = () =>
      editor.plugin(BaseParagraphPlugin).schema.type;

    return {
      contributions: [
        // Prevent nesting a column group inside any column via drag-and-drop or
        // wrap-shell side-drop landing.
        transferVeto.of((input, view) => {
          if (input.payload.kind !== 'nodes') return false;

          const columnType = getColumnType();
          const groupTypes = new Set([type]);
          const hasGroup = input.payload.nodes.some((node) =>
            containsElementTypes(node, groupTypes)
          );

          if (!hasGroup) return false;

          const [targetNode, targetPath] = input.target;

          if (
            ElementApi.isElementType(targetNode, columnType) ||
            view.read.nodes.above({ at: targetPath, type: columnType })
          ) {
            return true;
          }

          const wrapShell = (input as { wrap?: { shell?: Node } | null }).wrap
            ?.shell;

          if (
            wrapShell &&
            containsElementTypes(wrapShell, new Set([columnType, type]))
          ) {
            return true;
          }

          return false;
        }),
      ],
      readMiddleware: ({ around }) => [
        around(editorReads.transfer.side, ({ input, next, state }) => {
          const {
            payload,
            relation,
            side,
            target: [target, path],
          } = input;
          const columnType = getColumnType();
          const forbidden = new Set([columnType, type]);

          if (
            payload.kind !== 'nodes' ||
            payload.nodes.some((node) =>
              containsElementTypes(node, forbidden)
            ) ||
            containsElementTypes(target, forbidden)
          ) {
            return next();
          }

          const end = side === 'end';
          const makeColumn = (weight?: number) => {
            const normalized =
              weight !== undefined ? normalizeWeight(weight) : 1;

            return {
              children: [],
              type: columnType,
              ...(normalized === 1 ? {} : { width: normalized }),
            };
          };

          if (path.length === 1) {
            return {
              payload: [end ? 1 : 0],
              shell: { children: [makeColumn(), makeColumn()], type },
              target: [end ? 0 : 1],
            };
          }

          const columnPath = PathApi.parent(path);
          const groupPath = PathApi.parent(columnPath);
          const group = state.nodes.get(groupPath)?.[0];

          if (
            !ElementApi.isElementType(group, type) ||
            !ElementApi.isElementType(
              state.nodes.get(columnPath)?.[0],
              columnType
            )
          ) {
            return next();
          }

          const contentColumns = group.children.flatMap((child, index) =>
            ElementApi.isElementType(child, columnType) &&
            state.nodes.isContent(child)
              ? [{ child, index }]
              : []
          );

          if (contentColumns.length >= MAX_COLUMNS) {
            return next();
          }

          const index = columnPath.at(-1) as number;
          const facingEntry = (
            end
              ? contentColumns.filter(({ index: i }) => i > index)
              : contentColumns.filter(({ index: i }) => i < index).reverse()
          )[0];

          if (facingEntry && relation === 'document') {
            const facingKey = state.key(groupPath.concat([facingEntry.index]));
            const facingContentCount = facingEntry.child.children.filter(
              state.nodes.isContent
            ).length;
            const onlyTradesPlaces =
              facingKey !== null &&
              facingContentCount === payload.nodes.length &&
              payload.parentKeys.length === payload.nodes.length &&
              payload.parentKeys.every((parentKey) => parentKey === facingKey);

            if (onlyTradesPlaces) return next();
          }

          const weights = contentColumns.map(({ child }) =>
            isPositiveFiniteNumber(child.width) ? child.width : 1
          );
          const averageWeight =
            weights.reduce((total, weight) => total + weight, 0) /
            weights.length;

          return {
            ancestor: 1,
            edge: end ? ('after' as const) : ('before' as const),
            payload: [],
            shell: makeColumn(averageWeight),
          };
        }),
      ],
      update: ({ tx }) => {
        const columnType = getColumnType();
        const paragraphType = getParagraphType();

        const writeColumnWidth = (
          columnPath: readonly number[],
          currentWidth: unknown,
          rawWeight: number
        ) => {
          const nextWeight = normalizeWeight(rawWeight);

          if (nextWeight === 1) {
            if (currentWidth !== undefined) {
              tx.nodes.unset('width', { at: [...columnPath] });
            }

            return;
          }
          if (currentWidth !== nextWeight) {
            tx.nodes.set({ width: nextWeight }, { at: [...columnPath] });
          }
        };

        const makeColumnNode = (weight: number, children?: Element[]) => {
          const normalized = normalizeWeight(weight);

          return {
            children: children ?? [
              { children: [{ text: '' }], type: paragraphType },
            ],
            type: columnType,
            ...(normalized === 1 ? {} : { width: normalized }),
          };
        };

        const setColumns = ({ at, columns, widths }: SetColumnsOptions) => {
          if (!at) return;

          const nextWidths = resolveRequestedWidths(columns, widths);

          if (!nextWidths) return;

          const columnGroup = tx.nodes.get(at, { type: plugin });

          if (!columnGroup) return;

          const [{ children }, path] = columnGroup;

          if (!children.every((child) => ElementApi.isElement(child))) return;
          if (hasNonWritableAt(editor, path)) return;

          // A column a pending suggestion deletes keeps its place and its width.
          const live = children.flatMap((column, index) =>
            ElementApi.isElement(column) && tx.nodes.isContent(column)
              ? [{ column, index }]
              : []
          );

          const applyWidths = (indexes: readonly number[]) => {
            const lockedSet = new Set(
              indexes.filter((index) =>
                hasNonWritableAt(editor, path.concat([index]))
              )
            );
            let lockedWeightSum = 0;
            let requestedLockedSum = 0;

            for (let position = 0; position < indexes.length; position += 1) {
              const index = indexes[position];

              if (!lockedSet.has(index)) continue;

              const column = tx.nodes.get(path.concat([index]))?.[0];

              lockedWeightSum +=
                ElementApi.isElement(column) &&
                isPositiveFiniteNumber(column.width)
                  ? column.width
                  : 1;
              requestedLockedSum += nextWidths[position];
            }

            const unlockedEntries = indexes
              .map((index, position) => ({ index, position }))
              .filter(({ index }) => !lockedSet.has(index));

            if (unlockedEntries.length === 0) return;

            const scale =
              lockedSet.size > 0 && requestedLockedSum > 0
                ? lockedWeightSum / requestedLockedSum
                : 1;

            for (const { index, position } of unlockedEntries) {
              const colPath = path.concat([index]);
              const column = tx.nodes.get(colPath)?.[0];

              writeColumnWidth(
                colPath,
                ElementApi.isElement(column) ? column.width : undefined,
                nextWidths[position] * scale
              );
            }
          };

          const currentCount = live.length;
          const targetCount = nextWidths.length;

          if (currentCount === targetCount) {
            applyWidths(live.map(({ index }) => index));

            return;
          }

          if (targetCount > currentCount) {
            const addedCount = targetCount - currentCount;

            tx.nodes.insert(
              Array.from({ length: addedCount }, (_, offset) =>
                makeColumnNode(nextWidths[currentCount + offset])
              ),
              { at: path.concat([children.length]) }
            );

            applyWidths([
              ...live.map(({ index }) => index),
              ...Array.from(
                { length: addedCount },
                (_, offset) => children.length + offset
              ),
            ]);

            return;
          }

          const kept = live.slice(0, targetCount);
          const removed = live.slice(targetCount);
          const keepColumnPath = path.concat([kept[targetCount - 1].index]);
          const affectedPaths = [
            keepColumnPath,
            ...removed.map(({ index }) => path.concat([index])),
          ];

          if (hasLockedBlocks(editor, affectedPaths)) return;

          tx.nodes.replaceChildren(
            live
              .slice(targetCount - 1)
              .flatMap(({ column }) => column.children),
            { at: keepColumnPath }
          );

          for (const { index } of removed.reverse()) {
            tx.nodes.remove({ at: path.concat([index]) });
          }

          applyWidths(kept.map(({ index }) => index));
        };

        const getStoredGroupState = (
          at: NodeTarget<Element> | undefined
        ): { hasStruck: boolean; liveCount: number } | null => {
          const target = at ?? editor.read.selection() ?? undefined;

          if (!target) return null;

          const groupEntry =
            editor.read.nodes.get(target, { type: plugin }) ??
            editor.read.nodes.above({ at: target, type: plugin });

          if (!groupEntry || !ElementApi.isElement(groupEntry[0])) return null;

          const { children } = groupEntry[0];
          let liveCount = 0;

          for (const child of children) {
            if (editor.read.nodes.isContent(child)) liveCount += 1;
          }

          return {
            hasStruck: liveCount < children.length,
            liveCount,
          };
        };

        const unwrapGroup = ({ at }: ColumnTargetOptions = {}): boolean => {
          const groupEntry =
            at !== undefined
              ? (tx.nodes.get(at, { type: plugin }) ??
                tx.nodes.above({ at, type: plugin }))
              : tx.nodes.above({ type: plugin });

          if (!groupEntry) return false;

          const [group, groupPath] = groupEntry;

          if (hasLockedBlocks(editor, [groupPath])) return false;

          const groupKey = tx.key(groupPath);

          if (!groupKey) return false;

          // Refuse to destroy pending-deleted columns in authored review.
          if (!group.children.every((child) => tx.nodes.isContent(child))) {
            return false;
          }

          for (let index = group.children.length - 1; index >= 0; index -= 1) {
            const unwrappedColumn = tx.nodes.unwrap({
              at: groupPath.concat([index]),
            });

            if (!unwrappedColumn) return false;
          }

          const refreshedGroup = tx.nodes.get(groupKey);

          if (!refreshedGroup) return false;

          return Boolean(tx.nodes.unwrap({ at: refreshedGroup[1] }));
        };

        const removeColumn = ({ at }: ColumnTargetOptions = {}): boolean => {
          const columnEntry =
            at !== undefined
              ? (tx.nodes.get(at, { type: BaseColumnItemPlugin }) ??
                tx.nodes.above({ at, type: BaseColumnItemPlugin }))
              : tx.nodes.above({ type: BaseColumnItemPlugin });

          if (!columnEntry) return false;

          const [, columnPath] = columnEntry;
          const groupPath = PathApi.parent(columnPath);
          const groupEntry = tx.nodes.get(groupPath, { type: plugin });

          if (!groupEntry) return false;

          const [group] = groupEntry;
          const colIndex = columnPath.at(-1);

          if (colIndex === undefined) return false;

          const groupKey = tx.key(groupPath);

          if (!groupKey) return false;

          if (group.children.length > 2) {
            if (hasLockedBlocks(editor, [columnPath])) return false;

            tx.nodes.remove({ at: columnPath });

            return true;
          }

          // Physical 2-column group with no struck siblings: drop the targeted
          // column and structurally unwrap the surviving column only when live.
          const survivorIndex = colIndex === 0 ? 1 : 0;
          const survivor = group.children[survivorIndex];

          if (!survivor || !tx.nodes.isContent(survivor)) return false;
          if (hasLockedBlocks(editor, [groupPath])) return false;

          tx.nodes.remove({ at: columnPath });

          const refreshedGroup = tx.nodes.get(groupKey);

          if (!refreshedGroup) return false;
          // In suggesting mode, remove strikes the column in place instead of
          // shrinking the group; keep the group intact so the deletion stays reviewable.
          if (
            !ElementApi.isElement(refreshedGroup[0]) ||
            refreshedGroup[0].children.length !== 1
          ) {
            return true;
          }

          const survivorPath = refreshedGroup[1].concat([0]);

          if (!tx.nodes.unwrap({ at: survivorPath })) return false;

          const groupAfterColumnUnwrap = tx.nodes.get(groupKey);

          if (!groupAfterColumnUnwrap) return false;

          return Boolean(tx.nodes.unwrap({ at: groupAfterColumnUnwrap[1] }));
        };

        const insertColumn = ({
          at,
          side = 'after',
        }: InsertColumnOptions = {}): boolean => {
          const columnEntry =
            at !== undefined
              ? (tx.nodes.get(at, { type: BaseColumnItemPlugin }) ??
                tx.nodes.above({ at, type: BaseColumnItemPlugin }))
              : tx.nodes.above({ type: BaseColumnItemPlugin });

          if (!columnEntry) return false;

          const [, columnPath] = columnEntry;
          const groupPath = PathApi.parent(columnPath);
          const groupEntry = tx.nodes.get(groupPath, { type: plugin });

          if (!groupEntry) return false;

          const [group] = groupEntry;

          if (hasNonWritableAt(editor, groupPath)) return false;

          const contentColumns = group.children.filter(
            (child) =>
              ElementApi.isElementType(child, columnType) &&
              tx.nodes.isContent(child)
          );

          if (contentColumns.length >= MAX_COLUMNS) return false;

          const colIndex = columnPath.at(-1);

          if (colIndex === undefined) return false;

          const averageWeight =
            contentColumns.reduce(
              (sum, col) =>
                sum + (isPositiveFiniteNumber(col.width) ? col.width : 1),
              0
            ) / Math.max(contentColumns.length, 1);

          const insertIndex = side === 'before' ? colIndex : colIndex + 1;

          tx.nodes.insert(makeColumnNode(averageWeight), {
            at: groupPath.concat([insertIndex]),
          });

          return true;
        };

        const resizeColumns = ({
          columns: [leftKey, rightKey],
          widths: [leftWidth, rightWidth],
        }: ResizeColumnsOptions): boolean => {
          if (
            !isPositiveFiniteNumber(leftWidth) ||
            !isPositiveFiniteNumber(rightWidth)
          ) {
            return false;
          }

          const leftEntry = tx.nodes.get(leftKey, {
            type: BaseColumnItemPlugin,
          });
          const rightEntry = tx.nodes.get(rightKey, {
            type: BaseColumnItemPlugin,
          });

          if (!leftEntry || !rightEntry) return false;

          const [leftNode, leftPath] = leftEntry;
          const [rightNode, rightPath] = rightEntry;

          if (!tx.nodes.isContent(leftNode) || !tx.nodes.isContent(rightNode)) {
            return false;
          }

          const groupPath = PathApi.parent(leftPath);

          if (!PathApi.equals(groupPath, PathApi.parent(rightPath))) {
            return false;
          }

          const groupEntry = tx.nodes.get(groupPath, { type: plugin });

          if (!groupEntry) return false;

          const [group] = groupEntry;
          const leftIndex = leftPath.at(-1);
          const rightIndex = rightPath.at(-1);

          if (
            leftIndex === undefined ||
            rightIndex === undefined ||
            leftIndex >= rightIndex
          ) {
            return false;
          }

          // Verify left and right are still adjacent content siblings.
          for (let i = leftIndex + 1; i < rightIndex; i += 1) {
            const middle = group.children[i];

            if (middle && tx.nodes.isContent(middle)) return false;
          }

          if (
            hasNonWritableAt(editor, groupPath) ||
            hasNonWritableAt(editor, leftPath) ||
            hasNonWritableAt(editor, rightPath)
          ) {
            return false;
          }

          writeColumnWidth(leftPath, leftNode.width, leftWidth);
          writeColumnWidth(rightPath, rightNode.width, rightWidth);

          return true;
        };

        const isInsertionInsideColumn = (
          options: BlockInsertOptions | BlockUpsertOptions
        ): boolean => {
          const candidates: Array<Location | undefined> = [
            'at' in options ? options.at : undefined,
            options.before as Location | undefined,
            options.after as Location | undefined,
          ];
          const explicit = candidates.filter(Boolean);

          if (explicit.length > 0) {
            return explicit.some((loc) => isPathInsideColumn(tx.nodes, loc));
          }

          return isPathInsideColumn(tx.nodes, tx.selection() ?? undefined);
        };

        const insertColumnGroup = (
          input: InsertColumnGroupInput = {},
          { select, ...options }: BlockInsertOptions = {}
        ) => {
          const nextWidths = resolveRequestedWidths(
            input.columns,
            input.widths
          );

          if (!nextWidths) return false;
          if (isInsertionInsideColumn(options)) return false;

          const element = {
            children: nextWidths.map((weight) => makeColumnNode(weight)),
            type,
          };
          const inserted = tx.blocks.insert(element, options);

          if (!inserted) return false;
          if (select) {
            const point = tx.points.start(inserted[0]);

            if (point) tx.selection.set(point);
          }

          return true;
        };

        const applyColumnInsertion = (
          mode: 'insert' | 'upsert',
          input: InsertColumnGroupInput = {},
          options: BlockInsertOptions | BlockUpsertOptions = {}
        ) => {
          if (!resolveRequestedWidths(input.columns, input.widths)) {
            return false;
          }
          if (isInsertionInsideColumn(options)) return false;

          return applyBlockInsertion({
            editor,
            insert: (insertOptions) => insertColumnGroup(input, insertOptions),
            matches: (block) => block.type === type,
            mode,
            options,
            tx,
          });
        };

        return {
          insert: txLocate(
            locateAt(1, 'at', 'after', 'before'),
            (
              input: InsertColumnGroupInput = {},
              options: BlockInsertOptions = {}
            ) => applyColumnInsertion('insert', input, options)
          ),
          insertColumn: txLocate(locateAt(0), insertColumn),
          removeColumn: txLocate((args: [ColumnTargetOptions?], place) => {
            const state = getStoredGroupState(args[0]?.at);

            if (state?.hasStruck && state.liveCount <= 2) return null;

            return locateAt(0)(args, place);
          }, removeColumn),
          resizeColumns: txLocate(
            (args: [ResizeColumnsOptions]) => args,
            resizeColumns
          ),
          setColumns: txLocate(locateAt(0), setColumns),
          toggle: txLocate(
            locateAt(0),
            ({ at, columns, widths }: ToggleColumnGroupOptions = {}) => {
              const nextWidths = resolveRequestedWidths(columns, widths);

              if (!nextWidths) return;

              const selection = SelectionApi.isNode(at)
                ? tx.nodes.toArray({ at })
                : at === undefined
                  ? tx.selection.nodes()
                  : [];

              if (selection.length > 1) return;

              const [selected] = selection;
              const [node, path] =
                selected ??
                (SelectionApi.isNode(at) ? [] : (tx.nodes.block({ at }) ?? []));

              if (!ElementApi.isElement(node) || !path) return;

              const groupPath = ElementApi.isElementType(node, type)
                ? path
                : tx.nodes.above({
                    at: selected || SelectionApi.isNode(at) ? path : at,
                    type: plugin,
                  })?.[1];

              if (groupPath) {
                setColumns({ at: groupPath, widths: nextWidths });

                return;
              }

              // Refuse nesting inside a standalone column item.
              if (isPathInsideColumn(tx.nodes, path)) return;
              if (hasLockedBlocks(editor, [path])) return;

              const columnGroup = {
                children: nextWidths.map((weight, index) =>
                  makeColumnNode(weight, index === 0 ? [node] : undefined)
                ),
                type,
              };
              const parentPath = PathApi.parent(path);
              const index = path.at(-1);

              if (
                index === undefined ||
                !canPlaceBlocksAtPath(tx.schema, path, [columnGroup], {
                  removing: [index],
                  root: tx.view.root(),
                })
              ) {
                return;
              }

              tx.nodes.replaceChildren([columnGroup], {
                at: parentPath,
                count: 1,
                index,
              });

              const point = tx.points.start(path.concat([0]));

              if (point) tx.selection.set(point);
            }
          ),
          unwrap: txLocate((args: [ColumnTargetOptions?], place) => {
            if (getStoredGroupState(args[0]?.at)?.hasStruck) return null;

            return locateAt(0)(args, place);
          }, unwrapGroup),
          upsert: txLocate(
            locateAt(1, 'after', 'before'),
            (
              input: InsertColumnGroupInput = {},
              options: BlockUpsertOptions = {}
            ) => applyColumnInsertion('upsert', input, options)
          ),
        };
      },
    };
  })
  .extend(({ editor, plugin, schema: { type } }) => {
    const getColumnType = () => editor.plugin(BaseColumnItemPlugin).schema.type;
    const getParagraphType = () =>
      editor.plugin(BaseParagraphPlugin).schema.type;

    return {
      commands: ({ around, handle }) => [
        // Prevent pasting a column group inside a column by flattening pasted
        // column containers into their inner content blocks.
        around(editorCommands.replaceSlice, ({ input, next, state }) => {
          const { options, slice } = input;
          const target = options?.at;
          const currentSelection = state.selection();
          const at =
            target === undefined
              ? (currentSelection ?? undefined)
              : typeof target === 'object' &&
                  target !== null &&
                  'children' in target
                ? state.nodes.path(target)
                : (target as Location | undefined);

          if (!at || !isPathInsideColumn(state.nodes, at)) {
            return next();
          }

          const columnType = getColumnType();
          const forbidden = new Set([type, columnType]);

          if (
            !slice.content.some((node) => containsElementTypes(node, forbidden))
          ) {
            return next();
          }

          const flattened = flattenColumnNodes(slice.content, type, columnType);

          return next({
            ...input,
            slice: {
              ...slice,
              content: flattened,
              openEnd: Math.min(slice.openEnd, 1),
              openStart: Math.min(slice.openStart, 1),
            },
          });
        }),
        // Backspace at offset 0 of a column whose sole content child is an empty
        // plain unstyled paragraph removes the column (unwrapping if 2-col -> 1).
        handle(editorCommands.delete, ({ input, state }) => {
          const selection = state.selection();

          if (
            input.direction !== 'backward' ||
            !selection ||
            state.selection.isExpanded() ||
            state.selection.nodes().length > 0
          ) {
            return false;
          }

          const blockEntry = state.nodes.block();

          if (!blockEntry) return false;

          const [block, blockPath] = blockEntry;
          const paragraphType = getParagraphType();

          if (
            block.type !== paragraphType ||
            block.listType ||
            block.indent ||
            !state.nodes.isEmpty(block) ||
            !state.points.isStart(selection.anchor, blockPath)
          ) {
            return false;
          }

          const columnEntry = state.nodes.above({
            at: blockPath,
            type: BaseColumnItemPlugin,
          });

          if (!columnEntry) return false;

          const [column, columnPath] = columnEntry;

          if (!PathApi.equals(PathApi.parent(blockPath), columnPath)) {
            return false;
          }

          const contentChildren = column.children.filter(state.nodes.isContent);

          if (contentChildren.length !== 1 || contentChildren[0] !== block) {
            return false;
          }

          const groupPath = PathApi.parent(columnPath);
          const groupEntry = state.nodes.get(groupPath, { type: plugin });

          if (!groupEntry) return false;

          const [group] = groupEntry;
          const colIndex = columnPath.at(-1);

          if (colIndex === undefined) return false;

          const collapsingToUnwrap =
            group.children.length === 2 &&
            group.children.every(state.nodes.isContent);

          if (
            collapsingToUnwrap
              ? hasLockedBlocks(editor, [groupPath])
              : hasLockedBlocks(editor, [columnPath])
          ) {
            return false;
          }

          return state.transaction((tx) => {
            const siblingIndex = colIndex > 0 ? colIndex - 1 : colIndex + 1;
            const siblingPath = groupPath.concat([siblingIndex]);
            const siblingKey = tx.key(siblingPath);
            const removed = tx.plugin(plugin).removeColumn({ at: columnPath });

            if (!removed) return;

            if (collapsingToUnwrap) {
              const point =
                colIndex > 0
                  ? tx.points.end(groupPath)
                  : tx.points.start(groupPath);

              if (point) tx.selection.set(point);
            } else if (siblingKey) {
              const nextSibling = tx.nodes.get(siblingKey);

              if (nextSibling) {
                const point =
                  colIndex > 0
                    ? tx.points.end(nextSibling[1])
                    : tx.points.start(nextSibling[1]);

                if (point) tx.selection.set(point);
              }
            }
          });
        }),
      ],
    };
  });

/** Element node shape for a multi-column group container. */
export type ColumnGroupElement = ElementOf<typeof BaseColumnGroupPlugin>;
