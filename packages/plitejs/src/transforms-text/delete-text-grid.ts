import { type Anchor, createAnchor } from '../core/anchor';
import type { ChildRun } from '../core/change/root-change';
import { getEditorSchema } from '../core/editor-runtime';
import {
  getCompiledEditorSchemaFromApi,
  type InternalEditorSchemaApi,
} from '../core/editor-schema';
import { toPublicRoot } from '../core/public-root';
import {
  applyBuiltDocumentChange,
  getActiveUpdateRoot,
} from '../core/public-state';
import type { CompiledEditorSchema } from '../core/schema-compiler';
import {
  canReplaceChildrenWithText,
  holdsWritableText,
  isEditablePath,
  isWritablePoint,
} from '../core/writable-text';
import { nodes as getNodes } from '../editor/nodes';
import { isStructuralEdge, readTextEdge } from '../editor/point';
import {
  type Descendant,
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
} from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';
import {
  after as editorAfter,
  before as editorBefore,
  getChildren as editorGetChildren,
} from '../interfaces/editor';
import { stripLocationRoots } from '../internal/root-location';
import { removeNodes } from '../transforms-node';
import { getCurrentNode } from './delete-text-plan';

export type GridSafeStep =
  | Readonly<{ kind: 'cells'; at: readonly Path[] }>
  | Readonly<{ kind: 'node'; at: Path }>
  | Readonly<{ kind: 'range'; at: Range }>;

type AnchoredStep =
  | Readonly<{ kind: 'cells'; at: ReadonlyArray<Anchor<Path>> }>
  | Readonly<{ kind: 'node'; at: Anchor<Path> }>
  | Readonly<{ kind: 'range'; at: Anchor<Range> }>;

type GridLanding =
  | Readonly<{ kind: 'cell'; at: Path }>
  | Readonly<{ kind: 'emptied-root' }>
  | Readonly<{ kind: 'point'; at: Point }>
  | null;

export type GridRemovalPlan = Readonly<{
  keepsGrid: boolean;
  landing: GridLanding;
  steps: readonly GridSafeStep[];
}>;

type GridRole = 'cell' | 'grid' | 'row';

type GridLevel = Readonly<{ path: Path; role: GridRole }>;

type GridScope = Readonly<{ cell: Path | null; grid: Path | null }>;

const DECLARES_GRID = new WeakMap<CompiledEditorSchema, boolean>();

const declaresGrid = (schema: CompiledEditorSchema) => {
  let declares = DECLARES_GRID.get(schema);

  if (declares === undefined) {
    declares = [...schema.elements.byType.values()].some(
      (element) => element.structure?.kind === 'grid'
    );
    DECLARES_GRID.set(schema, declares);
  }

  return declares;
};

const getGridSchema = (editor: Editor) => {
  const schema = getCompiledEditorSchemaFromApi(getEditorSchema(editor));

  return schema && declaresGrid(schema) ? schema : null;
};

const getGridRole = (
  schema: CompiledEditorSchema,
  node: unknown
): GridRole | null => {
  const structure = NodeApi.isElement(node)
    ? schema.elements.byType.get(node.type)?.structure
    : null;

  return structure?.kind === 'grid' ? structure.role : null;
};

const readLevels = (
  editor: Editor,
  schema: CompiledEditorSchema,
  path: Path
) => {
  const levels: GridLevel[] = [];
  let children: readonly Descendant[] = editorGetChildren(editor);

  for (let depth = 0; depth < path.length; depth += 1) {
    const node = children[path[depth]];

    if (!NodeApi.isElement(node)) break;

    const role = getGridRole(schema, node);

    if (role) levels.push({ path: path.slice(0, depth + 1), role });
    ({ children } = node);
  }

  return levels;
};

export const readGridCell = (editor: Editor, path: Path): Path | null => {
  const schema = getGridSchema(editor);

  return schema
    ? (readLevels(editor, schema, path).findLast(
        (level) => level.role === 'cell'
      )?.path ?? null)
    : null;
};

export const isInTextCell = (editor: Editor, path: Path) => {
  const cell = readGridCell(editor, path);

  return (
    !!cell &&
    canReplaceChildrenWithText(
      getEditorSchema(editor),
      getCurrentNode(editor, cell)
    )
  );
};

export const shareGridCellOrNone = (
  editor: Editor,
  left: Path,
  right: Path
) => {
  const schema = getGridSchema(editor);

  if (!schema) return true;

  const leftLevel = readLevels(editor, schema, left).at(-1);
  const rightLevel = readLevels(editor, schema, right).at(-1);

  if (!leftLevel || !rightLevel) return !leftLevel && !rightLevel;

  return (
    leftLevel.role === 'cell' &&
    rightLevel.role === 'cell' &&
    PathApi.equals(leftLevel.path, rightLevel.path)
  );
};

const scopeOf = (
  startLevels: readonly GridLevel[],
  endLevels: readonly GridLevel[]
): GridScope => {
  let cell: Path | null = null;
  let shared = 0;

  while (
    shared < startLevels.length &&
    shared < endLevels.length &&
    PathApi.equals(startLevels[shared].path, endLevels[shared].path)
  ) {
    if (startLevels[shared].role === 'cell') cell = startLevels[shared].path;
    shared += 1;
  }

  const below = cell?.length ?? 0;
  const outermostGrid = (levels: readonly GridLevel[]) =>
    levels.find((level) => level.role === 'grid' && level.path.length > below)
      ?.path ?? null;
  const startGrid = outermostGrid(startLevels);
  const endGrid = outermostGrid(endLevels);

  return {
    cell,
    grid:
      startGrid && (!endGrid || startGrid.length <= endGrid.length)
        ? startGrid
        : endGrid,
  };
};

export const readSharedGridCell = (
  editor: Editor,
  range: Range
): Path | null => {
  const schema = getGridSchema(editor);

  if (!schema) return null;

  const [start, end] = RangeApi.edges(range);

  return scopeOf(
    readLevels(editor, schema, start.path),
    readLevels(editor, schema, end.path)
  ).cell;
};

const getUpdateRoot = (editor: Editor) =>
  toPublicRoot(getActiveUpdateRoot(editor) ?? 'main');

const readTextHolder = (schema: InternalEditorSchemaApi, cell: unknown) => {
  if (!NodeApi.isElement(cell)) return null;

  const [first] = cell.children;

  if (canReplaceChildrenWithText(schema, first)) {
    return { at: [0], node: first, trailing: cell.children.length - 1 };
  }

  return NodeApi.isText(first) && canReplaceChildrenWithText(schema, cell)
    ? { at: [], node: cell, trailing: 0 }
    : null;
};

const readClearedCell = (editor: Editor, path: Path) => {
  const schema = getEditorSchema(editor);
  const holder = readTextHolder(schema, getCurrentNode(editor, path));

  return holder
    ? ({ holder, kind: 'emptied' } as const)
    : ({
        child: schema.createDefaultChild({
          at: [...path, 0],
          root: getUpdateRoot(editor),
        }),
        kind: 'default',
      } as const);
};

const clearedCellHoldsText = (editor: Editor, path: Path) => {
  if (!isEditablePath(editor, path)) return false;

  const cleared = readClearedCell(editor, path);

  return (
    cleared.kind === 'emptied' ||
    (!!cleared.child &&
      holdsWritableText(getEditorSchema(editor), cleared.child))
  );
};

const localPoint = (point: Point | undefined) =>
  point && stripLocationRoots(point);

const readLanding = (
  editor: Editor,
  { coveredCells, end, start, steps }: GridSteps
): GridLanding => {
  const takenBy = (point: Point) => {
    for (const step of steps) {
      if (step.kind === 'node' && PathApi.isAncestor(step.at, point.path)) {
        return step.at;
      }
      if (step.kind === 'cells') {
        const cell = step.at.find((path) =>
          PathApi.isAncestor(path, point.path)
        );

        if (cell) return cell;
      }
    }

    return null;
  };
  const writable = (point: Point | null | undefined) =>
    point && !takenBy(point) && isWritablePoint(editor, point) ? point : null;
  const nearestKept = (point: Point, edge: 'end' | 'start') => {
    const taken = takenBy(point);

    if (!taken) return point;

    const edgePoint = readTextEdge(editor, taken, edge);

    if (!edgePoint) return null;

    return localPoint(
      edge === 'end'
        ? editorAfter(editor, edgePoint, { voids: true })
        : editorBefore(editor, edgePoint, { voids: true })
    );
  };
  const atStart = writable(start);

  if (atStart) return { at: atStart, kind: 'point' };

  const cell = coveredCells.find((path) => clearedCellHoldsText(editor, path));

  if (cell) return { at: cell, kind: 'cell' };

  const nextTo =
    writable(nearestKept(end, 'end')) ?? writable(nearestKept(start, 'start'));

  if (nextTo) return { at: nextTo, kind: 'point' };

  const removedTopLevel = steps.filter(
    (step) => step.kind === 'node' && step.at.length === 1
  ).length;
  const fill =
    removedTopLevel === editorGetChildren(editor).length &&
    getEditorSchema(editor).createDefaultChild({
      at: [0],
      root: getUpdateRoot(editor),
    });

  return fill && holdsWritableText(getEditorSchema(editor), fill)
    ? { kind: 'emptied-root' }
    : null;
};

type GridSteps = Readonly<{
  coveredCells: readonly Path[];
  end: Point;
  keepsGrid: boolean;
  start: Point;
  steps: readonly GridSafeStep[];
}>;

export const planGridSteps = (
  editor: Editor,
  range: Range
): GridSteps | null => {
  const editorSchema = getEditorSchema(editor);
  const schema = getGridSchema(editor);

  if (!schema) return null;

  const roleAt = (path: Path) =>
    getGridRole(schema, getCurrentNode(editor, path));
  const isEmptyCell = (cell: Descendant) => {
    const holder = readTextHolder(editorSchema, cell);
    const [text] = holder?.node.children ?? [];

    return (
      !!holder &&
      holder.trailing === 0 &&
      holder.node.children.length === 1 &&
      NodeApi.isText(text) &&
      text.text === ''
    );
  };
  const [rangeStart, rangeEnd] = RangeApi.edges(stripLocationRoots(range));
  const covers = (node: Path, nodeStart: Point, nodeEnd: Point) =>
    (PointApi.isBefore(rangeStart, nodeStart) ||
      isStructuralEdge(NodeApi.get(editor, node), node, rangeStart, 'start')) &&
    (PointApi.isAfter(rangeEnd, nodeEnd) ||
      isStructuralEdge(NodeApi.get(editor, node), node, rangeEnd, 'end'));
  const coveredCells: Path[] = [];
  let keepsGrid = false;

  const plan = (start: Point, end: Point): GridSafeStep[] | null => {
    const { grid } = scopeOf(
      readLevels(editor, schema, start.path),
      readLevels(editor, schema, end.path)
    );

    if (!grid || !isEditablePath(editor, grid)) return null;

    const gridStart = readTextEdge(editor, grid, 'start');
    const gridEnd = readTextEdge(editor, grid, 'end');

    if (!gridStart || !gridEnd) return null;

    const steps: GridSafeStep[] = [];
    const rangeStep = (from: Point, to: Point): GridSafeStep[] =>
      PointApi.isBefore(from, to)
        ? [{ at: { anchor: from, focus: to }, kind: 'range' }]
        : [];
    const pushText = (from: Point, to: Point) => {
      if (!PointApi.isBefore(from, to)) return;

      steps.push(...(plan(from, to) ?? rangeStep(from, to)));
    };
    const pushTextless = (from: Point, to: Point) => {
      for (const [, textless] of getNodes(editor, {
        at: { anchor: from, focus: to },
        match: (_, path) =>
          !PathApi.isCommon(path, from.path) &&
          !PathApi.isCommon(path, to.path) &&
          !PathApi.isCommon(grid, path),
        mode: 'highest',
        voids: true,
      })) {
        steps.push({ at: textless, kind: 'node' });
      }
    };
    const before = PointApi.isBefore(start, gridStart)
      ? localPoint(editorBefore(editor, gridStart, { voids: true }))
      : undefined;
    const after = PointApi.isAfter(end, gridEnd)
      ? localPoint(editorAfter(editor, gridEnd, { voids: true }))
      : undefined;

    if (before) {
      pushText(start, before);
      pushTextless(before, gridStart);
    }

    if (
      covers(grid, gridStart, gridEnd) &&
      (PointApi.isBefore(rangeStart, gridStart) ||
        PointApi.isAfter(rangeEnd, gridEnd))
    ) {
      steps.push({ at: grid, kind: 'node' });
    } else {
      keepsGrid = true;

      const gridNode = getCurrentNode(editor, grid);
      const startsInside = !PointApi.isBefore(start, gridStart);
      const endsInside = !PointApi.isAfter(end, gridEnd);
      const depth = grid.length;
      const firstRow = startsInside ? start.path[depth] : 0;
      const lastRow = endsInside
        ? end.path[depth]
        : NodeApi.isElement(gridNode)
          ? gridNode.children.length - 1
          : -1;
      const clip = (path: Path) => {
        const from = readTextEdge(editor, path, 'start');
        const to = readTextEdge(editor, path, 'end');

        if (!from || !to) return null;

        return {
          covered: covers(path, from, to),
          from: PointApi.isAfter(start, from) ? start : from,
          to: PointApi.isBefore(end, to) ? end : to,
        };
      };
      const leading: GridSafeStep[] = [];
      const cleared: Path[] = [];
      const trailing: GridSafeStep[] = [];

      for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex += 1) {
        const rowPath = [...grid, rowIndex];
        const row = getCurrentNode(editor, rowPath);

        if (roleAt(rowPath) !== 'row' || !NodeApi.isElement(row)) {
          const clipped = clip(rowPath);

          if (clipped) {
            (cleared.length === 0 ? leading : trailing).push(
              ...rangeStep(clipped.from, clipped.to)
            );
          }
          continue;
        }

        const firstCell =
          startsInside && rowIndex === firstRow ? start.path[depth + 1] : 0;
        const lastCell =
          endsInside && rowIndex === lastRow
            ? end.path[depth + 1]
            : row.children.length - 1;

        for (let cellIndex = firstCell; cellIndex <= lastCell; cellIndex += 1) {
          const cellPath = [...rowPath, cellIndex];
          const cell = row.children[cellIndex];
          const holdsStart =
            startsInside && rowIndex === firstRow && cellIndex === firstCell;
          const holdsEnd =
            endsInside && rowIndex === lastRow && cellIndex === lastCell;
          const isCell = roleAt(cellPath) === 'cell';

          if (!isEditablePath(editor, cellPath)) continue;

          const cover = () => {
            coveredCells.push(cellPath);
            if (!isEmptyCell(cell)) cleared.push(cellPath);
          };

          if (isCell && !holdsStart && !holdsEnd) {
            cover();
            continue;
          }

          const clipped = clip(cellPath);

          if (!clipped) continue;

          const { covered, from, to } = clipped;

          if (isCell && covered) {
            cover();
            continue;
          }

          (holdsStart && cleared.length === 0 ? leading : trailing).push(
            ...((isCell && plan(from, to)) || rangeStep(from, to))
          );
        }
      }

      steps.push(...leading);
      if (cleared.length > 0) steps.push({ at: cleared, kind: 'cells' });
      steps.push(...trailing);
    }

    if (after) {
      pushTextless(gridEnd, after);
      pushText(after, end);
    }

    return steps;
  };

  const steps = plan(rangeStart, rangeEnd);

  return (
    steps && {
      coveredCells,
      end: rangeEnd,
      keepsGrid,
      start: rangeStart,
      steps,
    }
  );
};

export const planGridRemoval = (
  editor: Editor,
  range: Range
): GridRemovalPlan | null => {
  const planned = planGridSteps(editor, range);

  return (
    planned && {
      keepsGrid: planned.keepsGrid,
      landing: readLanding(editor, planned),
      steps: planned.steps,
    }
  );
};

const clearCells = (editor: Editor, paths: readonly Path[]) => {
  const runs = paths.flatMap((path): ChildRun[] => {
    const cell = getCurrentNode(editor, path);

    if (!NodeApi.isElement(cell)) return [];

    const cleared = readClearedCell(editor, path);

    if (cleared.kind === 'default') {
      return [
        {
          children: cleared.child ? [cleared.child] : [],
          index: 0,
          path,
          removeCount: cell.children.length,
        },
      ];
    }

    const { at, node, trailing } = cleared.holder;

    return [
      {
        children: [{ ...node.children.find(NodeApi.isText), text: '' }],
        index: 0,
        path: [...path, ...at],
        removeCount: node.children.length,
      },
      ...(trailing > 0
        ? [{ children: [], index: 1, path, removeCount: trailing }]
        : []),
    ];
  });

  if (runs.length === 0) return;
  applyBuiltDocumentChange(editor, (builder, root) =>
    builder.replaceChildRuns(root, runs)
  );
};

export const removeGridSteps = (
  editor: Editor,
  plan: GridRemovalPlan,
  removePlainRange: (range: Range) => Point | null
): Point | null => {
  const { landing, steps } = plan;
  const anchorPoint = (point: Point) =>
    createAnchor(editor, point, {
      association: 'backward',
      deletion: 'nearest',
    });
  const anchorPath = (path: Path) =>
    createAnchor(editor, path, { association: 'forward', deletion: 'drop' });
  const targets = steps.map((step): AnchoredStep =>
    step.kind === 'range'
      ? {
          at: createAnchor(editor, step.at, {
            association: 'inward',
            deletion: 'nearest',
          }),
          kind: 'range',
        }
      : step.kind === 'node'
        ? { at: anchorPath(step.at), kind: 'node' }
        : { at: step.at.map(anchorPath), kind: 'cells' }
  );
  let pointLanding = landing?.kind === 'point' ? anchorPoint(landing.at) : null;
  const cellLanding = landing?.kind === 'cell' ? anchorPath(landing.at) : null;

  for (const step of targets.toReversed()) {
    if (step.kind === 'node') {
      const at = step.at.release();

      if (at) removeNodes(editor, { at, voids: true });
      continue;
    }
    if (step.kind === 'cells') {
      clearCells(
        editor,
        step.at.flatMap((anchor) => {
          const path = anchor.release();

          return path ? [path] : [];
        })
      );
      continue;
    }

    const range = step.at.release();

    if (!range || RangeApi.isCollapsed(range)) continue;

    const landingBefore = pointLanding?.resolve();
    const resolved = removePlainRange(range);

    if (
      pointLanding &&
      resolved &&
      landingBefore &&
      PointApi.equals(RangeApi.start(range), landingBefore)
    ) {
      pointLanding.release();
      pointLanding = anchorPoint(resolved);
    }
  }

  if (editorGetChildren(editor).length === 0) {
    const child = getEditorSchema(editor).createDefaultChild({
      at: [0],
      root: getUpdateRoot(editor),
    });

    if (child) {
      applyBuiltDocumentChange(editor, (builder, root) =>
        builder.replaceChildren(root, [], 0, 0, [child])
      );
    }
  }

  if (pointLanding) return pointLanding.release();

  const cell = cellLanding?.release();

  if (cell) return readTextEdge(editor, cell, 'start');

  return landing?.kind === 'emptied-root'
    ? readTextEdge(editor, [], 'start')
    : null;
};
