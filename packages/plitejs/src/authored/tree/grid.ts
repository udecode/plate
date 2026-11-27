import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  valueRoot,
} from '../../core/change/document-change';
import type {
  DocumentIndex,
  IndexedNodeRange,
} from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import {
  mapRootChangePositionBackward,
  type RootChange,
} from '../../core/change/root-change';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonNode,
  nodeProps,
} from '../../core/change/tokens';
import type { DraftGuardReplayOrigin } from '../../core/document-recorder';
import { getValueRecords, recordOpsBetween } from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { type GridRoles, gridRolesOf } from '../../core/survival';
import { countCoreWork } from '../../core/work';
import { isEditingChange } from '../facts/editing';
import { factsOf, marksOf, type ReviewFacts } from '../facts/facts';
import { grantCovers } from '../facts/grant';
import { incarnationOf, VERDICTS } from '../facts/records';
import {
  holdsAuthoredRecords,
  ownChangesRemovedBy,
  replaysWithdrawal,
} from '../facts/replay';
import { rootOf } from '../ledger/roots';
import { elementTouches, unrepresentable } from '../refusal';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  isStructureChange,
  readMembers,
} from './marks';
import { mergesUp, removes } from './resolve';

type Claims = (node: unknown) => readonly AuthoredMark[];

const partsOf = (node: JsonNode, gridRoles: GridRoles): JsonNode[] =>
  isElementNode(node)
    ? node.children.flatMap((child) => {
        if (gridRoles.isPart(child)) return [child];

        return gridRoles.roleOf(child) === null
          ? partsOf(child, gridRoles)
          : [];
      })
    : [];

const unplacedPendingGrid = () =>
  unrepresentable(
    'Review cannot hold this table change: a table takes one row, column or format suggestion at a time. Decide its pending change first.',
    'grid'
  );

const unplacedUnsupportedGrid = () =>
  unrepresentable(
    'Review cannot hold this table change: Suggesting cannot move a row, add or remove a single cell, merge or split cells, or edit a table with merged cells yet. Switch to Editing to make it.',
    'grid'
  );

const unplacedReplayGrid = () =>
  unrepresentable(
    'Review cannot hold this table undo or redo because another edit or decision changed the table since that step.',
    'grid'
  );

const unplacedContainerAroundGrid = () =>
  unrepresentable(
    'Review cannot hold adding, deleting, wrapping or unwrapping a block that holds a table. Switch to Editing to change it.',
    'grid'
  );

export const refuseUnrecordableGridStep = ({
  changeId,
  claims,
  frame,
  frameAfter,
  gridRoles,
  moves,
  ownInsertion,
  sameUpdateInsertion,
  stored,
  toStored,
  written,
}: Readonly<{
  changeId: string;
  claims: Claims;
  frame: DocumentIndex;
  frameAfter: DocumentIndex;
  gridRoles: GridRoles;
  moves: boolean;
  ownInsertion: (node: JsonNode) => boolean;
  sameUpdateInsertion: (node: JsonNode) => boolean;
  stored: DocumentIndex;
  toStored: (position: number, assoc: -1 | 1) => number;
  written: RootChange;
}>) => {
  const holders = (place: number) =>
    stored
      .openContextAt(place)
      .filter(
        (range) =>
          range.kind === 'element' && range.from < place && place < range.to
      );
  const touches = elementTouches(written, frame, frameAfter, {
    cutEnclosed: false,
  });

  for (const { at, props, propsAfter, touch } of touches) {
    const role = gridRoles.roleOf(props);
    const changesSpan =
      propsAfter !== undefined &&
      !jsonEqual(gridRoles.spansOf(props), gridRoles.spansOf(propsAfter));
    const reshapes =
      touch === 'boundary' ||
      (propsAfter !== undefined && gridRoles.roleOf(propsAfter) !== role) ||
      changesSpan;

    if ((role === null && touch === 'boundary') || !reshapes) continue;

    const table = holders(toStored(at, 1))
      .map((range) => stored.node(range.path))
      .findLast((node) => gridRoles.roleOf(node) === 'grid');

    if (
      !table ||
      (changesSpan ? !sameUpdateInsertion(table) : !ownInsertion(table))
    ) {
      const hasPending =
        table !== undefined &&
        ([...gridChangesOf(table, gridRoles, claims)].some(
          (change) => change !== changeId
        ) ||
          claims(table).some(
            (mark) => mark.kind === 'delete' && mark.change !== changeId
          ));

      throw hasPending ? unplacedPendingGrid() : unplacedUnsupportedGrid();
    }
  }
  if (!moves) return;

  const landings = touches.flatMap(({ at, inserted, touch }) =>
    inserted && touch === 'whole' ? [toStored(at, 1)] : []
  );

  for (const { at, inserted, touch } of touches) {
    if (inserted || touch !== 'whole') continue;

    const source = holders(toStored(at, 1)).find((range) => {
      const part = stored.node(range.path);

      return (
        gridRoles.isPart(part) &&
        !ownInsertion(part) &&
        claims(part).some(
          (mark) => mark.kind === 'insert' && !isEditingChange(mark.change)
        )
      );
    });

    if (
      source &&
      !landings.some((place) => source.from < place && place < source.to)
    ) {
      throw unplacedPendingGrid();
    }
  }
};

type GridNet = {
  addsRow: boolean;
  after: JsonNode | null;
  before: JsonNode;
  cellsAdded: Map<number, { atEnd: boolean; cellCount: number; count: number }>;
  removedRows: Map<number, JsonNode>;
  resizedRows: Map<number, JsonNode>;
  reshaped: boolean;
  rowsLosingCells: Set<number>;
  tableRange: IndexedNodeRange;
  writesProps: boolean;
};

type GridIntent = 'edit' | 'propose' | 'replay';

const decidesElement = (mark: AuthoredMark) =>
  removes(mark, 'accept') ||
  removes(mark, 'reject') ||
  (isStructureChange(mark) &&
    !mergesUp(mark, 'accept') &&
    !mergesUp(mark, 'reject'));

const withoutMarks = (node: JsonNode) => {
  const { [AUTHORED_MARKS_KEY]: _marks, ...props } = nodeProps(node);

  return props;
};

const holdsGrid = (node: JsonNode, gridRoles: GridRoles): boolean =>
  isElementNode(node) &&
  node.children.some(
    (child) => gridRoles.roleOf(child) === 'grid' || holdsGrid(child, gridRoles)
  );

const marksIn = (value: JsonEditorValue) => {
  let facts: ReviewFacts | undefined;

  return (node: unknown) =>
    marksOf(node, (facts ??= factsOf(value))).filter(
      (mark) => !isEditingChange(mark.change)
    );
};

type Marks = Claims;

const struck = (node: JsonNode, marks: Marks) =>
  marks(node).some((mark) => mark.kind === 'delete');

const ownChangesOf = (table: JsonNode, marks: Marks) =>
  new Set(
    marks(table).flatMap((mark) =>
      mark.kind === 'insert' || mark.kind === 'delete' ? [mark.change] : []
    )
  );

const gridChangesOf = (table: JsonNode, gridRoles: GridRoles, marks: Marks) => {
  const own = ownChangesOf(table, marks);
  const changes = new Set<string>();
  const take = (node: JsonNode, structural: boolean) => {
    for (const { change, kind } of marks(node)) {
      if (
        !own.has(change) &&
        (kind === 'format' ||
          (structural && (kind === 'insert' || kind === 'delete')))
      ) {
        changes.add(change);
      }
    }
  };

  take(table, false);
  for (const row of partsOf(table, gridRoles)) {
    take(row, true);
    for (const cell of partsOf(row, gridRoles)) take(cell, true);
  }

  return changes;
};

const partMarksOf = (table: JsonNode, gridRoles: GridRoles, marks: Marks) => {
  const own = ownChangesOf(table, marks);
  const places = new Map<string, string>();
  const take = (node: JsonNode, place: string) => {
    for (const { change, kind } of marks(node)) {
      if (!own.has(change) && (kind === 'insert' || kind === 'delete')) {
        places.set(change, `${places.get(change) ?? ''} ${kind}@${place}`);
      }
    }
  };

  partsOf(table, gridRoles).forEach((row, at) => {
    take(row, `${at}`);
    partsOf(row, gridRoles).forEach((cell, index) =>
      take(cell, `${at}.${index}`)
    );
  });

  return places;
};

const hasAnyPendingMark = (node: JsonNode, marks: Marks): boolean => {
  if (marks(node).length > 0) return true;

  return isElementNode(node)
    ? node.children.some((child) => hasAnyPendingMark(child, marks))
    : false;
};

const sameNode = (a: JsonNode, b: JsonNode) => a === b || jsonEqual(a, b);

const sameEditorDoc = (a: JsonEditorValue, b: JsonEditorValue): boolean => {
  if (a === b) return true;
  if (!jsonEqual(a, b)) return false;

  const recA = getValueRecords(a);
  const recB = getValueRecords(b);

  if (recA === recB) return true;

  return recordOpsBetween(recA, recB).size === 0;
};

const isOriginWindowClean = (
  origin: DraftGuardReplayOrigin,
  before: JsonEditorValue
): boolean => {
  const { track } = origin;

  if (!track) return true;
  if (track.recordChanged) return false;
  if (!track.seenOther && sameEditorDoc(before, origin.base)) return true;
  if (track.dirty || track.changesRoots) return false;
  if (track.windows.length !== track.initial.length) return false;

  for (let i = 0; i < track.initial.length; i += 1) {
    const init = track.initial[i];
    const current = track.windows[i];

    if (init.root !== current.root) return false;
    if (
      !jsonEqual(
        valueRoot(before, current.root).slice(current.start, current.end),
        valueRoot(origin.base, init.root).slice(init.start, init.end)
      )
    ) {
      return false;
    }
  }

  return true;
};

const originStepHeldGridMark = (
  origin: DraftGuardReplayOrigin,
  originAfter: JsonEditorValue | null,
  gridRoles: GridRoles,
  originMarksBefore: Marks | null,
  originMarksAfter: Marks | null
): boolean => {
  const checkValue = (
    value: JsonEditorValue | null,
    marks: Marks | null,
    root: string,
    from: number,
    to: number
  ): boolean => {
    if (!value || !marks) return false;

    const index = rootOf(value, root);
    const seen = new Set<number>();
    const checkRange = (range: IndexedNodeRange) => {
      if (range.kind !== 'element' || seen.has(range.from)) return false;
      seen.add(range.from);
      const node = index.node(range.path);

      return (
        gridRoles.roleOf(node) === 'grid' && hasAnyPendingMark(node, marks)
      );
    };

    for (const range of index.openContextAt(from)) {
      if (checkRange(range)) return true;
    }
    for (const range of index.nodeRangesTouching(from, to)) {
      if (checkRange(range)) return true;
    }

    return false;
  };

  let found = false;

  origin.change.iterChangedRanges((name, fromA, toA, fromB, toB) => {
    if (found) return;
    const root = name ?? 'main';

    if (
      checkValue(origin.base, originMarksBefore, root, fromA, toA) ||
      checkValue(originAfter, originMarksAfter, root, fromB, toB)
    ) {
      found = true;
    }
  });

  return found;
};

const deletionsOf = (table: JsonNode, gridRoles: GridRoles, marks: Marks) => {
  const counts = new Map<string, number>();

  for (const row of partsOf(table, gridRoles)) {
    for (const part of [row, ...partsOf(row, gridRoles)]) {
      for (const { change, kind } of marks(part)) {
        if (kind === 'delete') {
          counts.set(change, (counts.get(change) ?? 0) + 1);
        }
      }
    }
  }

  return counts;
};

const wholePartKinds = (
  table: JsonNode,
  change: string,
  gridRoles: GridRoles,
  marks: Marks,
  kindsSoFar: ReadonlySet<string> | undefined
): ReadonlySet<string> | null => {
  const kinds = new Set(kindsSoFar);
  const markOf = (node: JsonNode) =>
    marks(node).find(
      (mark) =>
        mark.change === change &&
        (mark.kind === 'insert' || mark.kind === 'delete')
    );
  let rows = 0;
  let columns: string | null = null;
  let lone = false;
  let merged = false;

  for (const row of partsOf(table, gridRoles)) {
    const rowMark = markOf(row);
    const places: number[] = [];

    if (rowMark) {
      rows += 1;
      kinds.add(rowMark.kind);
    }
    partsOf(row, gridRoles).forEach((cell, index) => {
      merged ||= gridRoles
        .spansOf(cell)
        .some((span) => span !== undefined && span !== null && span !== 1);
      const cellMark = rowMark ? undefined : markOf(cell);

      if (cellMark) {
        kinds.add(cellMark.kind);
        places.push(index);
      }
    });
    lone ||= columns !== null && columns !== places.join(',');
    columns = places.join(',');
  }

  const places = columns ? columns.split(',').map(Number) : [];

  if (lone) return null;
  if (rows === 0 && places.length === 0) return kinds;

  return !merged &&
    (rows === 0 || places.length === 0) &&
    places.every((place, index) => place === places[0] + index) &&
    kinds.size === 1
    ? kinds
    : null;
};

const resizesMarkedRow = (net: GridNet, change: string, marks: Marks) =>
  [...net.resizedRows].some(
    ([from, row]) =>
      !net.removedRows.has(from) &&
      marks(row).some(
        (mark) =>
          mark.change === change &&
          (mark.kind === 'insert' || mark.kind === 'delete')
      )
  );

const leavesNewPendingDeletion = (
  before: JsonNode,
  after: JsonNode,
  gridRoles: GridRoles,
  marks: Readonly<{ after: Marks; before: Marks }>
) => {
  const struckBefore = deletionsOf(before, gridRoles, marks.before);

  return [...deletionsOf(after, gridRoles, marks.after)].some(
    ([change, count]) => count > (struckBefore.get(change) ?? 0)
  );
};

const MANY_GRID_CHANGES = Symbol('many-grid-changes');
type RowGridSummary = null | string | typeof MANY_GRID_CHANGES;
type RoleCaches = {
  locked: WeakMap<JsonNode, WeakMap<object, boolean>>;
  rowSummary: WeakMap<JsonNode, WeakMap<object, RowGridSummary>>;
  rowUnmarked: WeakMap<JsonNode, boolean>;
  tableUnmarked: WeakMap<JsonNode, boolean>;
};

const ROLE_CACHES = new WeakMap<GridRoles, RoleCaches>();

const cachesFor = (gridRoles: GridRoles): RoleCaches => {
  let caches = ROLE_CACHES.get(gridRoles);

  if (!caches) {
    caches = {
      locked: new WeakMap(),
      rowSummary: new WeakMap(),
      rowUnmarked: new WeakMap(),
      tableUnmarked: new WeakMap(),
    };
    ROLE_CACHES.set(gridRoles, caches);
  }

  return caches;
};

const isRowUnmarked = (
  row: JsonNode,
  gridRoles: GridRoles,
  caches: RoleCaches
): boolean => {
  const cached = caches.rowUnmarked.get(row);

  if (cached !== undefined) return cached;
  countCoreWork('gridLockNodes');

  let unmarked = readMembers(row).length === 0;

  if (unmarked) {
    for (const cell of partsOf(row, gridRoles)) {
      countCoreWork('gridLockNodes');
      if (readMembers(cell).length > 0) {
        unmarked = false;
        break;
      }
    }
  }
  caches.rowUnmarked.set(row, unmarked);

  return unmarked;
};

const isTableUnmarked = (
  table: JsonNode,
  gridRoles: GridRoles,
  caches: RoleCaches
): boolean => {
  const cached = caches.tableUnmarked.get(table);

  if (cached !== undefined) return cached;
  countCoreWork('gridLockNodes');

  let unmarked = readMembers(table).length === 0;

  if (unmarked) {
    for (const row of partsOf(table, gridRoles)) {
      if (!isRowUnmarked(row, gridRoles, caches)) {
        unmarked = false;
        break;
      }
    }
  }
  caches.tableUnmarked.set(table, unmarked);

  return unmarked;
};

const rowGridSummaryOf = (
  row: JsonNode,
  gridRoles: GridRoles,
  recordKey: object,
  getFacts: () => ReviewFacts,
  caches: RoleCaches
): RowGridSummary => {
  let byRecords = caches.rowSummary.get(row);
  const cached = byRecords?.get(recordKey);

  if (cached !== undefined) return cached;

  const facts = getFacts();
  let summary: RowGridSummary = null;
  const visit = (node: JsonNode): boolean => {
    countCoreWork('gridLockNodes');
    for (const { change, kind } of marksOf(node, facts)) {
      if (
        !isEditingChange(change) &&
        (kind === 'format' || kind === 'insert' || kind === 'delete')
      ) {
        if (summary === null) summary = change;
        else if (summary !== change) {
          summary = MANY_GRID_CHANGES;

          return true;
        }
      }
    }

    return false;
  };

  if (!visit(row)) {
    for (const cell of partsOf(row, gridRoles)) {
      if (visit(cell)) break;
    }
  }
  if (!byRecords) {
    byRecords = new WeakMap();
    caches.rowSummary.set(row, byRecords);
  }
  byRecords.set(recordKey, summary);

  return summary;
};

const rowHasPendingGridChange = (
  row: JsonNode,
  gridRoles: GridRoles,
  recordKey: object,
  getFacts: () => ReviewFacts,
  own: ReadonlySet<string>,
  caches: RoleCaches
): boolean => {
  if (isRowUnmarked(row, gridRoles, caches)) return false;

  const summary = rowGridSummaryOf(row, gridRoles, recordKey, getFacts, caches);

  return (
    summary !== null && (summary === MANY_GRID_CHANGES || !own.has(summary))
  );
};

export const isGridLocked = (
  value: JsonEditorValue,
  table: JsonNode,
  gridRoles: GridRoles
): boolean => {
  const caches = cachesFor(gridRoles);

  if (isTableUnmarked(table, gridRoles, caches)) return false;

  const recordKey = getValueRecords(value);
  let byRecords = caches.locked.get(table);
  const cached = byRecords?.get(recordKey);

  if (cached !== undefined) return cached;

  let facts: ReviewFacts | undefined;
  const getFacts = () => (facts ??= factsOf(value));

  countCoreWork('gridLockNodes');
  const tableMarks = marksOf(table, getFacts()).filter(
    (mark) => !isEditingChange(mark.change)
  );
  let locked = tableMarks.some((mark) => mark.kind === 'delete');

  if (!locked) {
    const own = new Set(
      tableMarks.flatMap((mark) =>
        mark.kind === 'insert' || mark.kind === 'delete' ? [mark.change] : []
      )
    );

    locked =
      tableMarks.some(
        (mark) => !own.has(mark.change) && mark.kind === 'format'
      ) ||
      partsOf(table, gridRoles).some((row) =>
        rowHasPendingGridChange(
          row,
          gridRoles,
          recordKey,
          getFacts,
          own,
          caches
        )
      );
  }

  if (!byRecords) {
    byRecords = new WeakMap();
    caches.locked.set(table, byRecords);
  }
  byRecords.set(recordKey, locked);

  return locked;
};

const findOriginInsertedTable = (
  originChangeRoot: RootChange | undefined,
  originBeforePos: number,
  originAfterIndex: DocumentIndex,
  gridRoles: GridRoles,
  targetTable: JsonNode
): JsonNode | null => {
  if (!originChangeRoot) return null;

  const { sections } = originChangeRoot;
  let posA = 0;
  let posB = 0;

  for (let i = 0; i < sections.length; i += 2) {
    const length = sections[i];
    const inserted = sections[i + 1];

    if (inserted < 0) {
      posA += length;
      posB += length;
      continue;
    }

    const endA = posA + length;

    if (posA <= originBeforePos && originBeforePos <= endA && inserted > 0) {
      for (const range of originAfterIndex.nodeRangesTouching(
        posB,
        posB + inserted
      )) {
        if (
          range.kind !== 'element' ||
          range.from < posB ||
          range.from >= posB + inserted
        ) {
          continue;
        }
        const node = originAfterIndex.node(range.path);

        if (gridRoles.roleOf(node) === 'grid' && sameNode(node, targetTable)) {
          return node;
        }
      }
    }
    posA = endA;
    posB += inserted;
  }

  return null;
};

const judgeNonReplayGrid = (
  net: GridNet,
  sides: Readonly<{
    after: Marks;
    before: Marks;
    gridRoles: GridRoles;
    intent: 'edit' | 'propose';
    kindsByChange: Map<string, ReadonlySet<string>>;
    updateAddsRows: boolean;
    writer: string | null;
  }>
) => {
  const { after, before } = net;
  const { gridRoles, intent, kindsByChange } = sides;

  if (!after) return;
  countCoreWork('gridChecks');

  const was = gridChangesOf(before, gridRoles, sides.before);
  const now = gridChangesOf(after, gridRoles, sides.after);
  const added = [...now].filter((change) => !was.has(change));
  const held = [...now].some((change) => was.has(change));
  const strikesGridChange =
    struck(after, sides.after) &&
    now.size > 0 &&
    (added.length > 0 || !struck(before, sides.before));

  if ((added.length > 0 && was.size > 0) || strikesGridChange) {
    throw unplacedPendingGrid();
  }

  const placesBefore = partMarksOf(before, gridRoles, sides.before);

  for (const [change, places] of partMarksOf(after, gridRoles, sides.after)) {
    if (placesBefore.get(change) === places) continue;

    const kinds = wholePartKinds(
      after,
      change,
      gridRoles,
      sides.after,
      kindsByChange.get(change)
    );
    const resizesMarked = resizesMarkedRow(net, change, sides.before);

    if (!kinds || resizesMarked) {
      throw was.size > 0 || resizesMarked
        ? unplacedPendingGrid()
        : unplacedUnsupportedGrid();
    }
    kindsByChange.set(change, kinds);
  }

  const writesUnmarked =
    intent !== 'propose' ||
    (now.size > 0 &&
      sides
        .after(after)
        .some(
          (mark) => mark.kind === 'insert' && mark.author === sides.writer
        ));
  const editsHeld = writesUnmarked && held;

  if (
    (intent === 'edit' || editsHeld) &&
    leavesNewPendingDeletion(before, after, gridRoles, sides)
  ) {
    throw unplacedPendingGrid();
  }
  if (net.reshaped && (added.length > 0 || editsHeld)) {
    throw was.size > 0 || editsHeld
      ? unplacedPendingGrid()
      : unplacedUnsupportedGrid();
  }
  if (!editsHeld) return;

  const width = Math.max(
    ...partsOf(before, gridRoles).map((row) => partsOf(row, gridRoles).length)
  );
  const onlyPadsShortRows = [...net.cellsAdded.values()].every(
    ({ atEnd, cellCount, count }) => atEnd && cellCount + count <= width
  );
  const removesColumn = [...net.rowsLosingCells].some(
    (row) => !net.removedRows.has(row)
  );
  const mayMoveRow = net.removedRows.size > 0 && sides.updateAddsRows;

  if (
    net.writesProps ||
    removesColumn ||
    !onlyPadsShortRows ||
    net.addsRow ||
    mayMoveRow
  ) {
    throw unplacedPendingGrid();
  }
};

type ReplayTableMatch = Readonly<{
  originAfterTable: JsonNode | null;
  originBeforeTable: JsonNode | null;
  tableUnchanged: boolean;
}>;

const matchReplayTable = (
  input: Readonly<{
    afterTable: JsonNode | null;
    beforeRange: IndexedNodeRange | null;
    beforeTable: JsonNode | null;
    beforeValue: JsonEditorValue;
    gridRoles: GridRoles;
    insertPosBefore: number | null;
    originAfterIndex: () => DocumentIndex | null;
    originBeforeIndex: () => DocumentIndex | null;
    originChangeRoot: RootChange | undefined;
    outsideRoot: RootChange | undefined;
    replayOrigin: DraftGuardReplayOrigin | null | undefined;
  }>
): ReplayTableMatch => {
  const {
    afterTable,
    beforeRange,
    beforeTable,
    beforeValue,
    gridRoles,
    insertPosBefore,
    originAfterIndex,
    originBeforeIndex,
    originChangeRoot,
    outsideRoot,
    replayOrigin,
  } = input;

  let originBeforeTable: JsonNode | null = null;
  let originAfterTable: JsonNode | null = null;
  let tableUnchanged = false;

  if (replayOrigin) {
    const windowClean = isOriginWindowClean(replayOrigin, beforeValue);
    const originBeforeIdx = originBeforeIndex();
    const originAfterIdx = originAfterIndex();

    if (beforeRange && beforeTable && originBeforeIdx && originAfterIdx) {
      const originFrom = outsideRoot
        ? mapRootChangePositionBackward(
            outsideRoot,
            beforeRange.from,
            1,
            'around'
          )
        : beforeRange.from;
      const originRange =
        originFrom === null
          ? undefined
          : originBeforeIdx.nodeStartingAt(originFrom);
      const candidate = originRange && originBeforeIdx.node(originRange.path);

      if (originRange && candidate && gridRoles.roleOf(candidate) === 'grid') {
        originBeforeTable = candidate;
        if (afterTable) {
          const originAfterFrom = originChangeRoot
            ? originChangeRoot.mapPos(originRange.from, 1)
            : originRange.from;
          const originAfterRange =
            originAfterFrom === null
              ? undefined
              : originAfterIdx.nodeStartingAt(originAfterFrom);
          const afterCandidate =
            originAfterRange && originAfterIdx.node(originAfterRange.path);

          if (afterCandidate && gridRoles.roleOf(afterCandidate) === 'grid') {
            originAfterTable = afterCandidate;
            tableUnchanged =
              windowClean &&
              sameNode(beforeTable, originBeforeTable) &&
              sameNode(afterTable, originAfterTable);
          }
        } else {
          tableUnchanged =
            windowClean && sameNode(beforeTable, originBeforeTable);
        }
      }
    } else if (
      !beforeTable &&
      afterTable &&
      insertPosBefore !== null &&
      originAfterIdx
    ) {
      const originPos = outsideRoot
        ? mapRootChangePositionBackward(outsideRoot, insertPosBefore, 1)
        : insertPosBefore;
      let found =
        originPos === null
          ? null
          : findOriginInsertedTable(
              originChangeRoot,
              originPos,
              originAfterIdx,
              gridRoles,
              afterTable
            );

      if (!found && outsideRoot) {
        const leftOriginPos = mapRootChangePositionBackward(
          outsideRoot,
          insertPosBefore,
          -1
        );

        if (leftOriginPos !== null && leftOriginPos !== originPos) {
          found = findOriginInsertedTable(
            originChangeRoot,
            leftOriginPos,
            originAfterIdx,
            gridRoles,
            afterTable
          );
        }
      }

      if (found) {
        originAfterTable = found;
        tableUnchanged = windowClean;
      }
    }
  }

  return { originAfterTable, originBeforeTable, tableUnchanged };
};

const leavesWholeGridChange = (
  afterTable: JsonNode | null,
  gridRoles: GridRoles,
  marksAfter: Marks,
  kindsByChange: Map<string, ReadonlySet<string>>
): boolean => {
  if (!afterTable) return true;

  const now = gridChangesOf(afterTable, gridRoles, marksAfter);

  if (now.size > 1 || (struck(afterTable, marksAfter) && now.size > 0)) {
    return false;
  }
  for (const change of now) {
    const kinds = wholePartKinds(
      afterTable,
      change,
      gridRoles,
      marksAfter,
      kindsByChange.get(change)
    );

    if (!kinds) return false;
    kindsByChange.set(change, kinds);
  }

  return true;
};

const changesVerdictRecords = (
  before: JsonEditorValue,
  after: JsonEditorValue
): boolean => {
  const recA = getValueRecords(before);
  const recB = getValueRecords(after);

  if (recA === recB) return false;

  return (recordOpsBetween(recA, recB).get(VERDICTS)?.size ?? 0) > 0;
};

const hasDecidedRawMemberInSubtree = (
  node: JsonNode,
  factsBefore: ReviewFacts
): boolean => {
  for (const member of readMembers(node)) {
    if (
      'change' in member &&
      !isEditingChange(member.change) &&
      factsBefore.hasVerdict(incarnationOf(member))
    ) {
      return true;
    }
  }

  return isElementNode(node)
    ? node.children.some((child) =>
        hasDecidedRawMemberInSubtree(child, factsBefore)
      )
    : false;
};

const admitsOwnSuggestionReplay = (
  input: Readonly<{
    afterTable: JsonNode | null;
    beforeTable: JsonNode | null;
    factsBefore: () => ReviewFacts;
    gridRoles: GridRoles;
    isOwnReproposal: () => boolean;
    isOwnWithdrawal: () => boolean;
    kindsByChange: Map<string, ReadonlySet<string>>;
    marksAfter: Marks;
    originAfterTable: JsonNode | null;
    originBeforeTable: JsonNode | null;
    replayOrigin: DraftGuardReplayOrigin | null | undefined;
  }>
): boolean => {
  const {
    afterTable,
    beforeTable,
    factsBefore,
    gridRoles,
    isOwnReproposal,
    isOwnWithdrawal,
    kindsByChange,
    marksAfter,
    originAfterTable,
    originBeforeTable,
    replayOrigin,
  } = input;

  if (beforeTable) {
    if (afterTable && sameNode(beforeTable, afterTable)) return false;
    if (
      isOwnWithdrawal() &&
      leavesWholeGridChange(afterTable, gridRoles, marksAfter, kindsByChange)
    ) {
      return true;
    }
  }

  if (!replayOrigin || !afterTable) return false;

  const matchesUnchangedOrigin =
    beforeTable !== null
      ? originBeforeTable !== null &&
        originAfterTable !== null &&
        sameNode(beforeTable, originBeforeTable) &&
        sameNode(afterTable, originAfterTable)
      : originAfterTable !== null && sameNode(afterTable, originAfterTable);

  return (
    matchesUnchangedOrigin &&
    !hasDecidedRawMemberInSubtree(afterTable, factsBefore()) &&
    isOwnReproposal() &&
    leavesWholeGridChange(afterTable, gridRoles, marksAfter, kindsByChange)
  );
};

const judgeReplayGrid = (
  input: Readonly<{
    afterTable: JsonNode | null;
    beforeRange: IndexedNodeRange | null;
    beforeTable: JsonNode | null;
    beforeValue: JsonEditorValue;
    factsBefore: () => ReviewFacts;
    gridRoles: GridRoles;
    holdsAuthored: () => boolean;
    insertPosBefore: number | null;
    isOwnReproposal: () => boolean;
    isOwnWithdrawal: () => boolean;
    kindsByChange: Map<string, ReadonlySet<string>>;
    marksAfter: Marks;
    marksBefore: Marks;
    originAfterIndex: () => DocumentIndex | null;
    originAfterValue: () => JsonEditorValue | null;
    originBeforeIndex: () => DocumentIndex | null;
    originChangeRoot: RootChange | undefined;
    originMarksAfter: () => Marks | null;
    originMarksBefore: () => Marks | null;
    outsideRoot: RootChange | undefined;
    replayOrigin: DraftGuardReplayOrigin | null | undefined;
  }>
) => {
  countCoreWork('gridChecks');
  const {
    afterTable,
    beforeTable,
    gridRoles,
    kindsByChange,
    marksAfter,
    marksBefore,
    originAfterValue,
    originMarksAfter,
    originMarksBefore,
    holdsAuthored,
    replayOrigin,
  } = input;
  const { originAfterTable, originBeforeTable, tableUnchanged } =
    matchReplayTable(input);

  if (tableUnchanged) {
    if (
      !leavesWholeGridChange(afterTable, gridRoles, marksAfter, kindsByChange)
    ) {
      throw unplacedPendingGrid();
    }

    return;
  }

  if (
    admitsOwnSuggestionReplay({
      ...input,
      originAfterTable,
      originBeforeTable,
    })
  ) {
    return;
  }

  if (beforeTable && hasAnyPendingMark(beforeTable, marksBefore)) {
    throw unplacedPendingGrid();
  }
  if (afterTable && hasAnyPendingMark(afterTable, marksAfter)) {
    throw unplacedPendingGrid();
  }
  if (!replayOrigin) {
    if (holdsAuthored()) throw unplacedReplayGrid();

    return;
  }

  const oMarksBefore = originMarksBefore();
  const oMarksAfter = originMarksAfter();

  if (
    originBeforeTable &&
    oMarksBefore &&
    hasAnyPendingMark(originBeforeTable, oMarksBefore)
  ) {
    throw unplacedReplayGrid();
  }
  if (
    originAfterTable &&
    oMarksAfter &&
    hasAnyPendingMark(originAfterTable, oMarksAfter)
  ) {
    throw unplacedReplayGrid();
  }
  if (
    !originBeforeTable &&
    !originAfterTable &&
    originStepHeldGridMark(
      replayOrigin,
      originAfterValue(),
      gridRoles,
      oMarksBefore,
      oMarksAfter
    )
  ) {
    throw unplacedReplayGrid();
  }
};

const lazy = <T>(compute: () => T) => {
  let box: { value: T } | null = null;

  return () => (box ??= { value: compute() }).value;
};

export const refuseGridUpdate = ({
  after,
  before,
  change,
  intent,
  replayOrigin,
  schema,
  writer,
}: Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
  intent: GridIntent;
  replayOrigin?: DraftGuardReplayOrigin | null;
  schema: CompiledEditorSchema;
  writer: string | null;
}>) => {
  const gridRoles = gridRolesOf(schema);
  const kindsByChange = new Map<string, ReadonlySet<string>>();
  const getFactsBefore = lazy(() => factsOf(before));
  const getFactsAfter = lazy(() => factsOf(after));
  const marksBefore: Marks = (node) =>
    marksOf(node, getFactsBefore()).filter(
      (mark) => !isEditingChange(mark.change)
    );
  const marksAfter: Marks = (node) =>
    marksOf(node, getFactsAfter()).filter(
      (mark) => !isEditingChange(mark.change)
    );
  const verdictsChanged =
    intent === 'replay' && changesVerdictRecords(before, after);

  const isOwnWithdrawal = lazy(() => {
    if (!writer || verdictsChanged) return false;

    const withdrawn = ownChangesRemovedBy({ after, before }, writer);

    return (
      withdrawn.length > 0 &&
      replaysWithdrawal({ after, before }, withdrawn, schema) !== null
    );
  });
  const isOwnReproposal = lazy(() => {
    if (!writer || verdictsChanged) return false;

    const added = ownChangesRemovedBy({ after: before, before: after }, writer);

    return (
      added.length > 0 &&
      grantCovers(
        { after, before, change },
        { access: 'suggest', actor: writer, decide: false },
        schema
      ).kind === 'covered'
    );
  });
  const getHoldsAuthored = lazy(() => holdsAuthoredRecords(before));
  const getOriginAfterValue = lazy(() =>
    replayOrigin ? replayOrigin.change.apply(replayOrigin.base) : null
  );
  const getOriginMarksBefore = lazy(() =>
    replayOrigin ? marksIn(replayOrigin.base) : null
  );
  const getOriginMarksAfter = lazy(() => {
    const value = getOriginAfterValue();

    return value ? marksIn(value) : null;
  });

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const stored = rootOf(before, root);
    const written = rootOf(after, root);
    const nets = new Map<number, GridNet>();
    const insertedTables: Array<{ insertPosBefore: number; node: JsonNode }> =
      [];
    const removedTables = new Map<
      number,
      { node: JsonNode; range: IndexedNodeRange }
    >();
    const replacedTables: Array<{
      afterTable: JsonNode;
      beforeRange: IndexedNodeRange;
      beforeTable: JsonNode;
    }> = [];

    const getOriginBeforeIndex = lazy(() =>
      replayOrigin
        ? replayOrigin.base === before
          ? stored
          : rootOf(replayOrigin.base, root)
        : null
    );
    const getOriginAfterIndex = lazy(() => {
      const value = getOriginAfterValue();

      return value ? (value === after ? written : rootOf(value, root)) : null;
    });

    const outsideRoot = replayOrigin?.outside
      ? getInternalDocumentRootChange(replayOrigin.outside, root)
      : undefined;
    const originChangeRoot = replayOrigin
      ? getInternalDocumentRootChange(replayOrigin.change, root)
      : undefined;

    const innermost = (
      index: DocumentIndex,
      at: number,
      role: 'grid' | 'row'
    ) =>
      index
        .openContextAt(at)
        .findLast(
          (range) =>
            range.kind === 'element' &&
            range.from < at &&
            gridRoles.roleOf(index.node(range.path)) === role
        );

    const unchangedTables = new Map<number, boolean>();
    const enclosingTableUnchanged = (at: number): boolean => {
      const tableRange = innermost(stored, at, 'grid');

      if (!tableRange) return false;
      const cached = unchangedTables.get(tableRange.from);

      if (cached !== undefined) return cached;

      const beforeTable = stored.node(tableRange.path);
      const atAfter = rootChange.mapPos(tableRange.from, 1);
      const afterRange =
        atAfter === null ? undefined : written.nodeStartingAt(atAfter);
      const afterNode = afterRange ? written.node(afterRange.path) : null;
      const afterTable =
        afterNode && gridRoles.roleOf(afterNode) === 'grid' ? afterNode : null;
      const matched = matchReplayTable({
        afterTable,
        beforeRange: tableRange,
        beforeTable,
        beforeValue: before,
        gridRoles,
        insertPosBefore: null,
        originAfterIndex: getOriginAfterIndex,
        originBeforeIndex: getOriginBeforeIndex,
        originChangeRoot,
        outsideRoot,
        replayOrigin,
      });
      const ok = matched.tableUnchanged;

      unchangedTables.set(tableRange.from, ok);

      return ok;
    };

    const hasStruckGridAncestor = (at: number): boolean => {
      for (const range of stored.openContextAt(at)) {
        if (range.kind !== 'element' || !(range.from < at && at < range.to)) {
          continue;
        }
        const node = stored.node(range.path);
        const role = gridRoles.roleOf(node);

        if (role === null) continue;
        if (struck(node, marksBefore)) {
          const atAfter = rootChange.mapPos(range.from, 1);
          const afterRange =
            atAfter === null ? undefined : written.nodeStartingAt(atAfter);
          const afterNode = afterRange ? written.node(afterRange.path) : null;

          if (!afterNode || struck(afterNode, marksAfter)) {
            return !enclosingTableUnchanged(at);
          }
        }
      }

      return false;
    };

    const netOf = (table: IndexedNodeRange) => {
      let net = nets.get(table.from);

      if (!net) {
        const at = rootChange.mapPos(table.from, 1);
        const range = at === null ? undefined : written.nodeStartingAt(at);
        const node = range && written.node(range.path);

        net = {
          addsRow: false,
          after: node && gridRoles.roleOf(node) === 'grid' ? node : null,
          before: stored.node(table.path),
          cellsAdded: new Map(),
          removedRows: new Map(),
          reshaped: false,
          resizedRows: new Map(),
          rowsLosingCells: new Set(),
          tableRange: table,
          writesProps: false,
        };
        nets.set(table.from, net);
      }

      return net;
    };

    const refuseContainer = (node: JsonNode, was: JsonNode | null) => {
      if (intent === 'replay') return;
      const had = was ? marksBefore(was) : [];

      if (
        marksAfter(node).some(
          (mark) =>
            decidesElement(mark) &&
            !had.some(
              (old) => old.kind === mark.kind && old.change === mark.change
            )
        ) &&
        holdsGrid(node, gridRoles)
      ) {
        throw unplacedContainerAroundGrid();
      }
    };

    const { sections } = rootChange;
    let from = 0;
    let to = 0;

    for (let section = 0; section < sections.length; section += 2) {
      const length = sections[section];
      const inserted = sections[section + 1];

      if (inserted < 0) {
        const propsWritten = inserted === -2 ? length : 0;

        for (let at = from; at < from + propsWritten; at += 1) {
          const range = stored.nodeStartingAt(at);
          const now = written.nodeStartingAt(to + at - from);

          if (!range || !now) continue;

          if (range.kind !== 'element' || now.kind !== 'element') {
            if (intent === 'replay' && hasStruckGridAncestor(at)) {
              throw unplacedPendingGrid();
            }
            continue;
          }

          const node = stored.node(range.path);
          const changed = written.node(now.path);
          const role = gridRoles.roleOf(node) ?? gridRoles.roleOf(changed);
          const table = role === 'grid' ? range : innermost(stored, at, 'grid');

          refuseContainer(changed, node);
          if (role === null) {
            if (intent === 'replay' && hasStruckGridAncestor(at)) {
              throw unplacedPendingGrid();
            }
            continue;
          }
          if (!table) continue;

          const net = netOf(table);

          net.reshaped ||=
            gridRoles.roleOf(changed) !== gridRoles.roleOf(node) ||
            !jsonEqual(gridRoles.spansOf(node), gridRoles.spansOf(changed));
          net.writesProps ||= !jsonEqual(
            withoutMarks(node),
            withoutMarks(changed)
          );
        }
        from += length;
        to += length;
        continue;
      }

      const end = from + length;
      let touchesGridInSection = false;
      const sectionRemovedTables: Array<{
        node: JsonNode;
        range: IndexedNodeRange;
      }> = [];
      const sectionInsertedTables: Array<{
        insertPosBefore: number;
        node: JsonNode;
        range: IndexedNodeRange;
      }> = [];

      for (const range of stored.nodeRangesTouching(from, end)) {
        if (range.kind !== 'element') continue;
        const node = stored.node(range.path);
        const role = gridRoles.roleOf(node);
        const whole = from <= range.from && range.to <= end;
        const crossed =
          !whole &&
          ((from <= range.from && range.from < end) ||
            (from < range.to && range.to <= end));
        const table =
          role === 'grid' && crossed
            ? range
            : innermost(stored, range.from, 'grid');

        if (whole && role === 'grid') {
          touchesGridInSection = true;
          if (intent === 'replay') {
            sectionRemovedTables.push({ node, range });
          }
          continue;
        }
        if (role === null || !table) continue;
        if (from <= table.from && table.to <= end) continue;
        if (crossed) {
          touchesGridInSection = true;
          netOf(table).reshaped = true;
        } else if (whole && role === 'row') {
          touchesGridInSection = true;
          netOf(table).removedRows.set(range.from, node);
        } else if (whole) {
          touchesGridInSection = true;
          const row = innermost(stored, range.from, 'row');

          if (row) {
            netOf(table).rowsLosingCells.add(row.from);
            netOf(table).resizedRows.set(row.from, stored.node(row.path));
          }
        }
      }

      for (const range of written.nodeRangesTouching(to, to + inserted)) {
        if (
          range.kind !== 'element' ||
          range.from < to ||
          range.from >= to + inserted
        ) {
          continue;
        }
        const node = written.node(range.path);
        const role = gridRoles.roleOf(node);

        refuseContainer(node, null);
        if (role === 'grid') {
          touchesGridInSection = true;
          if (intent === 'replay') {
            sectionInsertedTables.push({ insertPosBefore: from, node, range });
          }
          continue;
        }
        if (role === null) continue;
        touchesGridInSection = true;

        const table = innermost(stored, from, 'grid');
        const nested = written
          .openContextAt(range.from)
          .some(
            (around) =>
              around.from >= to &&
              around.from < range.from &&
              gridRoles.isPart(written.node(around.path))
          );

        if (!table || nested) continue;

        const net = netOf(table);
        const row =
          role === 'cell' ? innermost(stored, from, 'row') : undefined;

        if (
          range.to > to + inserted ||
          (role === 'cell' && !(row && row.from > table.from))
        ) {
          net.reshaped = true;
        } else if (role === 'row') net.addsRow = true;
        else if (row) {
          const cells = net.cellsAdded.get(row.from) ?? {
            atEnd: true,
            cellCount: partsOf(stored.node(row.path), gridRoles).length,
            count: 0,
          };

          cells.atEnd &&= from === row.contentTo;
          cells.count += 1;
          net.cellsAdded.set(row.from, cells);
          net.resizedRows.set(row.from, stored.node(row.path));
        }
      }

      if (intent === 'replay') {
        const pairedInserted = new Set<number>();

        for (const rem of sectionRemovedTables) {
          const matchedIndex = sectionInsertedTables.findIndex(
            (ins, index) =>
              !pairedInserted.has(index) &&
              jsonEqual(rem.range.path, ins.range.path)
          );

          if (matchedIndex !== -1) {
            pairedInserted.add(matchedIndex);
            const ins = sectionInsertedTables[matchedIndex];

            if (!verdictsChanged && sameNode(rem.node, ins.node)) {
              continue;
            }
            replacedTables.push({
              afterTable: ins.node,
              beforeRange: rem.range,
              beforeTable: rem.node,
            });
            continue;
          }
          removedTables.set(rem.range.from, rem);
        }
        for (let i = 0; i < sectionInsertedTables.length; i += 1) {
          if (pairedInserted.has(i)) continue;
          const ins = sectionInsertedTables[i];

          insertedTables.push({
            insertPosBefore: ins.insertPosBefore,
            node: ins.node,
          });
        }
      }

      if (
        intent === 'replay' &&
        !touchesGridInSection &&
        hasStruckGridAncestor(from)
      ) {
        throw unplacedPendingGrid();
      }

      from = end;
      to += inserted;
    }

    const updateAddsRows = [...nets.values()].some((net) => net.addsRow);

    if (intent === 'replay') {
      const shared = {
        beforeValue: before,
        factsBefore: getFactsBefore,
        gridRoles,
        holdsAuthored: getHoldsAuthored,
        isOwnReproposal,
        isOwnWithdrawal,
        kindsByChange,
        marksAfter,
        marksBefore,
        originAfterIndex: getOriginAfterIndex,
        originAfterValue: getOriginAfterValue,
        originBeforeIndex: getOriginBeforeIndex,
        originChangeRoot,
        originMarksAfter: getOriginMarksAfter,
        originMarksBefore: getOriginMarksBefore,
        outsideRoot,
        replayOrigin,
      };

      for (const net of nets.values()) {
        judgeReplayGrid({
          ...shared,
          afterTable: net.after,
          beforeRange: net.tableRange,
          beforeTable: net.before,
          insertPosBefore: null,
        });
      }
      for (const { afterTable, beforeRange, beforeTable } of replacedTables) {
        if (nets.has(beforeRange.from)) continue;
        judgeReplayGrid({
          ...shared,
          afterTable,
          beforeRange,
          beforeTable,
          insertPosBefore: null,
        });
      }
      for (const { node, range } of removedTables.values()) {
        if (nets.has(range.from)) continue;
        judgeReplayGrid({
          ...shared,
          afterTable: null,
          beforeRange: range,
          beforeTable: node,
          insertPosBefore: null,
        });
      }
      for (const { insertPosBefore, node } of insertedTables) {
        judgeReplayGrid({
          ...shared,
          afterTable: node,
          beforeRange: null,
          beforeTable: null,
          insertPosBefore,
        });
      }
      continue;
    }

    for (const net of nets.values()) {
      judgeNonReplayGrid(net, {
        after: marksAfter,
        before: marksBefore,
        gridRoles,
        intent,
        kindsByChange,
        updateAddsRows,
        writer,
      });
    }
  }
};
