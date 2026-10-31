import type {
  AnyEditor as Editor,
  EditorCommandPlace,
  EditorDocumentValue,
  NodeTarget,
  Selection,
  SnapshotIndex,
  TransactionSpec,
} from '../interfaces/editor';
import { LocationApi, type Span } from '../interfaces/location';
import { type Descendant, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { type Point, PointApi } from '../interfaces/point';
import { type Range, RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import { bindNodeKeyOnce, deferNodeKeys } from '../utils/node-keys';
import { enterAnchorScope } from './anchor-state';
import {
  DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  valueRoot,
  valueRootIndex,
  valueRootNodes,
} from './change/document-change';
import { DocumentIndex, type NodeList } from './change/document-index';
import { copyRoot } from './change/lazy-root';
import type { NewLetters } from './change/new-letters';
import { mapRootChangePositionBackward } from './change/root-change';
import type { JsonPoint, JsonToken } from './change/tokens';
import { cloneValue } from './clone';
import {
  type CommandProjection,
  type EditorDocumentState,
  getEditorCommandDocument,
  refusedIn,
  unplacedIn,
} from './command-document';
import {
  type CompositionStamp,
  runStampedFrame,
  stampFrame,
  takeCompositionStamp,
} from './composition-stamp';
import { isInRemovedContent, landTextWrite, nodeAt } from './content-landing';
import {
  getEditorDocumentRecorder,
  type PositionMap,
  runEditorDraftGuards,
} from './document-recorder';
import { getEditorRuntimeOwner, getEditorSchema } from './editor-runtime';
import { MAIN_ROOT_KEY } from './public-root';
import {
  advanceSnapshotIndex,
  assertRootPlaced,
  commitRecordedDraft,
  createEditorDocumentChangeBuilder,
  createTransactionSpecContext,
  disposeTransactionSpecContext,
  finalizeWithoutOrphanedRoots,
  getActiveEditorUpdateTags,
  getCurrentSelection,
  getCurrentSelectionRoot,
  getEditorDocumentValue,
  getEditorUpdateRoot,
  getSnapshot,
  getTransactionSnapshot,
  retainTransactionSnapshotIndex,
  getTransactionSpecContext,
  type RecordedDraft,
  recordedCarets,
  recorderBookmarks,
  resolveNodeTargetLocation,
  runEditorDocumentRecorder,
  type TransactionSpecContext,
  withTransactionSpecDraftRead,
  withEditorUpdateRootScope,
} from './public-state';
import { changedRootsOf } from './root-ownership';
import { mapSelectionThroughChange } from './selection-protocol';
import { mapSnapshotIndexThroughChange } from './snapshot-index';
import { mapEffect } from './transaction-values';
import {
  type CarriedCarets,
  carryCarets,
  getPlacementGeneration,
  mapBookThroughStep,
} from './view-carets';
import { countCoreWork } from './work';

/**
 * The command frame: a command runs on the document every pending change
 * accepts, which the registered command document projects, and its writes
 * record into the stored document.
 *
 * @internal
 */
export const COMMAND_FRAMES = new WeakSet<Editor>();

type FramedOn = Readonly<{
  children: readonly Descendant[];
  generation: number;
}>;

export const FRAMED_SPECS = new WeakMap<
  TransactionSpec,
  Readonly<{ framedOn: FramedOn; ignoresSelection: boolean }>
>();

/**
 * Locates a command's input before its frame opens, while reads still see the
 * stored document, and returns what runs in the frame.
 *
 * @internal
 */
export type EditorFrameBody<T> = (place: EditorCommandPlace) => () => T;

/** @internal */
export const evaluateInEditorCommandFrame = <
  T extends { result: TransactionSpec | false },
>(
  editor: Editor,
  body: EditorFrameBody<T>
): T | null => {
  if (getTransactionSpecContext(editor)) return null;
  const probed = probeInEditorCommandFrame(editor, body);

  if (!probed) return null;
  if (probed.value.result !== false) {
    FRAMED_SPECS.set(probed.value.result, {
      framedOn: {
        children: probed.stored.children,
        generation: getPlacementGeneration(editor),
      },
      ignoresSelection: probed.located,
    });
  }

  return probed.value;
};

/** @internal */
export const commandViewHides = (
  editor: Editor,
  root: string,
  point: Point
) => {
  const owner = getEditorRuntimeOwner(editor);
  const document = getEditorCommandDocument(owner);

  if (!document) return false;

  const stored = (getTransactionSnapshot(owner)?.builder.value ??
    getEditorDocumentValue(owner)) as EditorDocumentValue;
  const projected = document.project(stored);

  return (
    !!projected &&
    projected.map.hides(root, valueRootIndex(stored, root).positionAt(point))
  );
};

/** @internal */
export const probeInEditorCommandFrame = <T>(
  editor: Editor,
  body: EditorFrameBody<T>
): Readonly<{
  located: boolean;
  moved: boolean;
  stored: EditorDocumentValue;
  value: T;
}> | null => {
  const document = getEditorCommandDocument(editor);

  if (!document || COMMAND_FRAMES.has(editor)) return null;

  const stored = (getTransactionSnapshot(editor)?.builder.value ??
    getEditorDocumentValue(editor)) as EditorDocumentValue;
  const projected = document.project(stored);

  if (!projected) return null;

  const storedSelection = getCurrentSelection(editor);
  const selectionRoot = getCurrentSelectionRoot(editor);
  const root = storedSelection
    ? (SelectionApi.root(storedSelection) ?? selectionRoot)
    : selectionRoot;
  const index = valueRootIndex(stored, root);
  // A point strictly inside content the projection removes has no place in
  // the frame, so a write there lands elsewhere.
  const insideRemoved = (point: Point) =>
    projected.map.hides(root, index.positionAt(point));
  let moved =
    storedSelection?.kind === 'text' &&
    (insideRemoved(storedSelection.anchor) ||
      insideRemoved(storedSelection.focus));
  // A probe throws nothing, so a selection its apply would refuse only
  // leaves the native path.
  const placed = createFramePlace(
    editor,
    projected,
    stored,
    selectionRoot,
    () => {
      moved = true;
    }
  );
  const selection = placed.selection(storedSelection);
  const evaluate = body(placed.place);
  const parent = getTransactionSnapshot(editor);
  const published = new Map(
    parent
      ? []
      : projected.map.roots.map((rootName) => [
          rootName,
          withEditorUpdateRootScope(editor, rootName, () =>
            getSnapshot(editor)
          ),
        ])
  );
  const frame = createTransactionSpecContext(editor);
  const { snapshot } = frame;

  COMMAND_FRAMES.add(editor);
  try {
    enterFrameDraft(
      editor,
      frame,
      stored,
      projected,
      (rootName) =>
        parent
          ? retainTransactionSnapshotIndex(editor, parent, rootName)
          : getDefined(published.get(rootName)).index,
      storedSelection,
      selectionRoot,
      selection,
      placed.bookCaret
    );
    snapshot.implicitTarget = null;
    snapshot.implicitTargetResolved = false;
    snapshot.implicitTargetFrame = {
      context: frame,
      storedSelection,
      toFrame: placed.selection,
    };

    const value = withTransactionSpecDraftRead(editor, evaluate);

    return { located: placed.located(), moved, stored, value };
  } finally {
    COMMAND_FRAMES.delete(editor);
    disposeTransactionSpecContext(editor, frame);
  }
};

/** @internal */
export const assertFrameSelectionPlaced = (editor: Editor) => {
  if (!getTransactionSnapshot(editor)?.selectionInDroppedRoot) return;

  throw unplacedIn(editor, 'the selection');
};

const assertWritesPlaced = (
  editor: Editor,
  snapshot: TransactionSpecContext['snapshot']
) => {
  for (const root of changedRootsOf(snapshot.builder.change).keys()) {
    assertRootPlaced(editor, snapshot, root);
  }
};

/** @internal */
export const runSelectionOnlyInEditorUpdate = <T>(
  editor: Editor,
  declaration: string,
  run: () => T
) => {
  const before = getTransactionSnapshot(editor)?.builder.value;
  const applied = run();

  if (getTransactionSnapshot(editor)?.builder.value !== before) {
    throw new Error(`${declaration}, so it cannot change content.`);
  }

  return applied;
};

const LAST_FRAME_INDEXES = new WeakMap<
  Editor,
  Map<string, Readonly<{ index: SnapshotIndex; root: DocumentIndex }>>
>();

const frameIndexOf = (
  editor: Editor,
  stored: EditorDocumentValue,
  projected: CommandProjection,
  rootName: string,
  storedIndex: () => SnapshotIndex
) => {
  const carried = projected.carried?.get(rootName);
  const indexes = LAST_FRAME_INDEXES.get(editor) ?? new Map();
  const last = indexes.get(rootName);
  const root = valueRootIndex(projected.value, rootName);
  // A block the projection shows away from its stored place is deleted and
  // inserted by the change, so its stored key goes on its projected node,
  // which the mapping then keeps as that node's own identity.
  const bindMoved = (index: SnapshotIndex) => {
    for (const path of projected.map.moved(rootName)) {
      const key = index.keyAt(path);
      const placed = projected.map.nodePath(rootName, path);

      if (key && placed) bindNodeKeyOnce(root.node(placed), editor, key);
    }

    return index;
  };
  const index =
    last?.root === root
      ? last.index
      : carried && last?.root === carried.from
        ? advanceSnapshotIndex(
            editor,
            carried.from,
            projectedIndex(projected, rootName),
            carried.change,
            last.index,
            { binding: 'inherited' }
          )
        : mapSnapshotIndexThroughChange(
            DocumentIndex.fromValue(valueRoot(stored, rootName)),
            projectedIndex(projected, rootName),
            getDefined(
              getInternalDocumentRootChange(projected.map.change(), rootName)
            ),
            bindMoved(storedIndex()),
            editor,
            new Set(),
            undefined,
            'inherited'
          );

  indexes.set(rootName, { index, root });
  LAST_FRAME_INDEXES.set(editor, indexes);

  return index;
};

/**
 * Maps the published document's runtime index into its command projection,
 * so the first key advances it as every later key does.
 */
export const prepareCommandFrame = (editor: Editor) => {
  const document = getEditorCommandDocument(editor);
  const stored = getEditorDocumentValue(editor) as EditorDocumentValue;
  const projected = document?.project(stored);

  for (const root of projected?.map.roots ?? []) {
    frameIndexOf(editor, stored, getDefined(projected), root, () =>
      withEditorUpdateRootScope(editor, root, () => getSnapshot(editor).index)
    );
  }
};

const projectedIndex = (projected: CommandProjection, root: string) => {
  const index = projected.indexes.get(root);

  if (index) return index;
  if (projected.map.roots.includes(root)) {
    countCoreWork('projectedIndexes');
  }

  return DocumentIndex.fromValue(valueRoot(projected.value, root));
};

const enterFrameDraft = (
  editor: Editor,
  frame: TransactionSpecContext,
  stored: EditorDocumentValue,
  projected: CommandProjection,
  storedIndex: (root: string) => SnapshotIndex,
  storedSelection: Selection,
  storedSelectionRoot: string,
  selection: Selection,
  bookCaret: (selection: Selection, root: string) => Selection
) => {
  const { snapshot } = frame;

  const roots: Record<string, readonly Descendant[]> = {};

  copyRoot(roots, MAIN_ROOT_KEY, projected.value, 'children');
  snapshot.roots = Object.assign(roots, projected.value.roots);
  snapshot.reservedRoots = new Set(Object.keys(stored.roots ?? {}));
  countCoreWork('snapshotRoots', Object.keys(snapshot.roots).length);
  snapshot.rootIndexes = {};
  snapshot.baseRuntimeIndexes = {};
  snapshot.baseSnapshots = {};
  for (const root of projected.map.roots) {
    let mapped: SnapshotIndex | undefined;
    const settle = () =>
      (mapped ??= frameIndexOf(editor, stored, projected, root, () =>
        storedIndex(root)
      ));

    snapshot.baseRuntimeIndexes[root] = settle;
    deferNodeKeys(getEditorRuntimeOwner(editor), frame.id, root, settle);
  }
  // The accept-all projection of a valid review tree is valid, so the frame
  // adopts it as its validated baseline.
  getEditorSchema(editor).adoptDocumentBaseline(
    projected.value,
    projected.carried
  );
  countCoreWork('baselines');
  snapshot.builder = createEditorDocumentChangeBuilder(
    editor,
    projected.value,
    {
      view: true,
    }
  );
  countCoreWork('builders');
  snapshot.activeChange = { change: snapshot.builder.change };
  const { book } = frame.caret;

  frame.caret = {
    ...frame.caret,
    book:
      book.nodes.size === 0
        ? book
        : mapBookThroughStep(book, {
            before: (root) => valueRootIndex(stored, root),
            deletedRoots: [],
            keys: (root) => ({
              after: retainTransactionSnapshotIndex(editor, snapshot, root),
              before: storedIndex(root),
            }),
            map: bookCaret,
            roots: getInternalDocumentChangeEntries(projected.map.change()),
          }),
    selection,
  };
  frame.baseCaret = frame.caret;
  snapshot.selection = selection;
  const selectedRoot =
    storedSelection &&
    (SelectionApi.root(storedSelection) ?? storedSelectionRoot);

  snapshot.selectionInDroppedRoot =
    selection === null &&
    !!selectedRoot &&
    Object.hasOwn(stored.roots ?? {}, selectedRoot) &&
    !Object.hasOwn(projected.value.roots ?? {}, selectedRoot);
  frame.exitAnchorScope();
  frame.exitAnchorScope = enterAnchorScope(editor, projected.value);
  countCoreWork('anchorScopes');
};

type Refuse = (reason: 'crosses' | 'unaligned') => void;
const keepWhereHeld: Refuse = () => {};

/**
 * Where stored locations land in a frame. A point first lands where a text
 * write lands, then maps. A range places its start forward and its end
 * backward, so stored content at its edges stays out; ends that cross collapse
 * to where the caret would go. A path keeps its node, or has no place when the
 * projection removes it. A location without a root addresses the update's
 * root, and a selection without one its own root.
 */
const createFramePlace = (
  editor: Editor,
  projected: CommandProjection,
  stored: EditorDocumentValue,
  selectionRoot: string,
  refuse: Refuse,
  stamp: CompositionStamp | null = null
) => {
  let heldRefusal: 'crosses' | 'unaligned' | null = null;
  let located = false;
  const compositionRoot = stamp && (stamp.place.root ?? selectionRoot);
  const compositionElement =
    stamp && compositionRoot !== null
      ? projected.map.nodePath(compositionRoot, stamp.place.path.slice(0, -1))
      : null;
  // A node the projection shows away from its stored place maps by its open
  // token, which the change deletes there and inserts where it lands.
  const nodes = (selection: NodeSelection, fallbackRoot: string) => {
    const root = SelectionApi.root(selection) ?? fallbackRoot;

    if (!projected.map.reorders(root)) return null;

    const document = valueRoot(stored, root);
    const place = (at: Path) =>
      nodeAt(document, at) ? projected.map.nodePath(root, at) : null;
    const paths = selection.paths.map(place);
    const anchorPath = place(selection.anchorPath);
    const focusPath = place(selection.focusPath);
    const [first, ...rest] = paths;

    if (!first || !anchorPath || !focusPath || rest.some((at) => !at)) {
      return null;
    }

    return SelectionApi.nodes([first, ...(rest as Path[])], {
      anchorPath,
      focusPath,
      mode: selection.mode,
      ...(selection.root === undefined ? {} : { root: selection.root }),
    });
  };
  const map = (selection: Selection, fallbackRoot: string) =>
    (SelectionApi.isNode(selection) && nodes(selection, fallbackRoot)) ||
    mapSelectionThroughChange(
      editor,
      selection,
      projected.map.change(),
      stored,
      projected.value,
      fallbackRoot
    );
  // A stored point maps to a position in the frame. One at a line's edge,
  // beside a leaf, reads on that leaf, so a point beside hidden content at
  // the edge stays on its line.
  const toFrame = (
    point: Point,
    root: string,
    assoc: -1 | 1,
    mapAssoc: -1 | 1 = assoc
  ) => {
    const position = projected.map.toProjected(
      root,
      valueRootIndex(stored, root).positionAt(point),
      mapAssoc < 0 ? 'backward' : 'forward'
    );

    return position === null ? null : pointIn(point, root, position, assoc);
  };
  // Beside an inline, a point goes to the side that holds the composition's
  // element, so a caret hidden in struck text right before a link stays
  // outside the link.
  const pointOnCompositionSide = (
    after: DocumentIndex,
    root: string,
    position: number,
    side: -1 | 1
  ) => {
    const placed = after.pointAt(position, side);

    if (!compositionElement || root !== compositionRoot || !placed) {
      return placed;
    }

    const inCompositionElement = (at: JsonPoint) =>
      PathApi.equals(at.path.slice(0, -1), compositionElement);

    if (inCompositionElement(placed)) return placed;

    const other = after.pointAt(position, side < 0 ? 1 : -1);

    return other && inCompositionElement(other) ? other : placed;
  };
  const pointIn = (
    point: Point,
    root: string,
    position: number,
    assoc: -1 | 1
  ) => {
    const after = projectedIndex(projected, root);
    const [next] =
      position < after.length ? after.slice(position, position + 1).tokens : [];
    const [previous] =
      position > 0 ? after.slice(position - 1, position).tokens : [];
    const isElement = (token: JsonToken | undefined, kind: 'close' | 'open') =>
      token?.kind === kind && token.nodeKind === 'element';
    const side =
      isElement(next, 'close') &&
      previous?.kind !== 'open' &&
      !isElement(previous, 'close')
        ? -1
        : isElement(previous, 'open') &&
            next?.kind !== 'close' &&
            !isElement(next, 'open')
          ? 1
          : assoc;
    const placed = pointOnCompositionSide(after, root, position, side);

    return (
      placed && { ...point, offset: placed.offset, path: [...placed.path] }
    );
  };
  // A range's edge moves off content only the projection holds, such as the
  // line completion gives a container whose lines are all gone: into the
  // range when text lies that way, else out of it, so the range reaches the
  // lines it covers in the stored document and no others.
  const pastAdded = (point: Point | null, root: string, lean: -1 | 1) => {
    if (!point) return point;

    const index = projectedIndex(projected, root);
    const skip = (direction: -1 | 1) => {
      let at: JsonPoint | null = point;

      for (let span = projected.map.added(root, index.positionAt(at)); span;) {
        const edge = direction > 0 ? span.to : span.from;

        at = index.pointAt(edge, direction);

        const position = at && index.positionAt(at);

        // With no text past the span, the nearest text lies back inside it.
        if (
          position === null ||
          (direction > 0 ? position < edge : position > edge)
        ) {
          return null;
        }
        span = projected.map.added(root, position);
      }

      return at;
    };
    const placed = skip(lean) ?? skip(lean < 0 ? 1 : -1);

    return placed
      ? { ...point, offset: placed.offset, path: [...placed.path] }
      : point;
  };
  // A caret no surviving line can take, as in a container whose every line
  // is gone, stays in what replaces its line, such as the line completion
  // gives that container.
  const caret = (point: Point, fallbackRoot: string, onRefuse: Refuse) => {
    const root = point.root ?? fallbackRoot;
    const document = valueRootNodes(stored, root) as NodeList<Descendant>;
    const landed = landTextWrite(editor, point, document);

    if (projected.map.reorders(root)) {
      const at = valueRootIndex(stored, root).positionAt(landed);
      const placement = projected.map.projectRange(root, at, at);

      if (placement?.kind === 'refused') onRefuse(placement.reason);
    }

    return toFrame(
      landed,
      root,
      1,
      isInRemovedContent(editor, landed, document) ? -1 : 1
    );
  };
  // On a root the projection shows in another order, a range places through
  // the map, which refuses one whose image would not hold its content.
  const rangePlacement = (
    start: Point,
    end: Point,
    root: string,
    onRefuse: Refuse
  ) => {
    const index = valueRootIndex(stored, root);
    const placement = projected.map.projectRange(
      root,
      index.positionAt(start),
      index.positionAt(end)
    );

    if (placement?.kind === 'refused') {
      onRefuse(placement.reason);

      return null;
    }

    return placement;
  };
  const span = (range: Range, fallbackRoot: string, onRefuse: Refuse) => {
    const collapsed = (point: Point) => {
      const placed = caret(point, fallbackRoot, onRefuse);

      return placed && { anchor: placed, focus: placed };
    };

    if (PointApi.equals(range.anchor, range.focus)) {
      return collapsed(range.anchor);
    }

    const root = SelectionApi.root(range) ?? fallbackRoot;
    const backward = RangeApi.isBackward(range);
    const [start, end] = backward
      ? [range.focus, range.anchor]
      : [range.anchor, range.focus];
    const placement = projected.map.reorders(root)
      ? rangePlacement(start, end, root, onRefuse)
      : null;
    const from = pastAdded(
      placement
        ? pointIn(start, root, placement.from, 1)
        : toFrame(start, root, 1),
      root,
      1
    );
    const to = pastAdded(
      placement ? pointIn(end, root, placement.to, -1) : toFrame(end, root, -1),
      root,
      -1
    );
    if (!from || !to || PointApi.compare(from, to) >= 0) {
      return collapsed(start);
    }

    const [anchor, focus] = backward ? [to, from] : [from, to];

    return {
      anchor: {
        ...range.anchor,
        offset: anchor.offset,
        path: [...anchor.path],
      },
      focus: { ...range.focus, offset: focus.offset, path: [...focus.path] },
    };
  };

  const path = (at: Path): Path | null => {
    if (at.length === 0) return at;

    const mapped = map(
      SelectionApi.nodes([at], { mode: 'block' }),
      getEditorUpdateRoot(editor)
    );

    if (mapped?.kind === 'node') return getDefined(mapped.paths[0]);

    const parentPath = at.slice(0, -1);
    const childCount = (value: EditorDocumentValue, parent: Path) => {
      const children = valueRoot(value, getEditorUpdateRoot(editor));

      if (parent.length === 0) return children.length;

      const node = nodeAt(children, parent);

      return node && !NodeApi.isText(node) ? node.children.length : null;
    };

    if (at.at(-1) !== childCount(stored, parentPath)) return null;

    const placed = path(parentPath);
    const count = placed && childCount(projected.value, placed);

    return placed && count !== null ? [...placed, count] : null;
  };

  function location<T extends NodeTarget | NodeSelection | Span>(
    at: T
  ): T | null;
  function location(
    at: NodeTarget | NodeSelection | Span
  ): NodeTarget | NodeSelection | Span | null {
    located = true;
    if (SelectionApi.isNode(at)) {
      const mapped = map(at, getEditorUpdateRoot(editor));

      return mapped?.kind === 'node' ? mapped : null;
    }
    if (PointApi.isPoint(at)) {
      return caret(at, getEditorUpdateRoot(editor), refuse);
    }
    if (LocationApi.isSpan(at)) {
      const from = path(at[0]);
      const to = path(at[1]);

      return from && to && [from, to];
    }
    if (RangeApi.isRange(at)) {
      const placed = span(at, getEditorUpdateRoot(editor), refuse);

      return placed && { ...at, ...placed };
    }

    const resolved = resolveNodeTargetLocation(editor, at);
    const placed = resolved && PathApi.isPath(resolved) ? path(resolved) : null;

    return placed && (typeof at === 'string' || NodeApi.isDescendant(at))
      ? at
      : placed;
  }

  const place: EditorCommandPlace = Object.freeze({ location });
  const placeSelection = (
    selection: Selection,
    root: string,
    onRefuse: Refuse
  ): Selection => {
    if (selection?.kind !== 'text') return map(selection, root);

    const placed = span(selection, root, onRefuse);

    return placed && { ...selection, ...placed };
  };

  return Object.freeze({
    /**
     * Places the selection a frame starts with. One the frame cannot place
     * keeps where it would hold it, and refuses only a body that acts at it.
     */
    held: (selection: Selection): Selection =>
      placeSelection(selection, selectionRoot, (reason) => {
        heldRefusal ??= reason;
      }),
    located: () => located,
    place,
    /**
     * Refuses a body that placed no location, which acts at the selection,
     * when the frame could not place the selection it started with.
     */
    refuseAtHeldSelection: () => {
      if (!located && heldRefusal) refuse(heldRefusal);
    },
    selection: (selection: Selection): Selection =>
      placeSelection(selection, selectionRoot, refuse),
    bookCaret: (selection: Selection, root: string): Selection =>
      placeSelection(selection, root, keepWhereHeld),
  });
};

/**
 * The change from what a frame wrote to the document the update commits, for
 * effects to map through. Composing it costs the whole document, so it is
 * composed only when an effect reads more than an untracked position in a
 * root the frame did not create.
 */
const effectChange = (
  projected: CommandProjection,
  stored: EditorDocumentValue,
  wrote: DocumentChange,
  recorded: DocumentChange | null
): DocumentChange => {
  let whole: DocumentChange | null = null;
  const composed = () => {
    if (!whole) {
      const projection = projected.map.change();

      for (const [, rootChange] of getInternalDocumentChangeEntries(
        projection
      )) {
        countCoreWork(
          'composedProjectionSections',
          rootChange.sections.length / 2
        );
      }

      const out = projection.compose(wrote).invert(stored);

      whole = recorded ? out.compose(recorded) : out;
    }

    return whole;
  };
  const mapPosition: DocumentChange['mapPosition'] = (position, options) => {
    const root = options?.root ?? MAIN_ROOT_KEY;

    // Where the projection moves content, the composed change deletes and
    // inserts it, so a tracked position inside it maps through the map's
    // places instead.
    if (
      (options?.track !== undefined && !projected.map.reorders(root)) ||
      wrote.createRoots.has(root)
    ) {
      return composed().mapPosition(position, options);
    }
    countCoreWork('adapterMappings');

    const assoc = options?.association === 'forward' ? 1 : -1;
    const written = getInternalDocumentRootChange(wrote, root);
    const before = written
      ? mapRootChangePositionBackward(written, position, assoc, options?.track)
      : position;

    if (before === null) return null;

    const at = projected.map.toStored(root, before, assoc);

    if (at === null) return null;

    return recorded ? recorded.mapPosition(at, options) : at;
  };

  return new Proxy(Object.create(DocumentChange.prototype) as DocumentChange, {
    get: (_target, key) => {
      if (key === 'mapPosition') return mapPosition;

      const change = composed();
      const value = Reflect.get(change, key, change);

      return typeof value === 'function' ? value.bind(change) : value;
    },
  });
};

/** @internal */
export const runInEditorCommandFrame = (
  editor: Editor,
  body: EditorFrameBody<boolean>,
  {
    framedOn,
    ignoresSelection = false,
    targetRoot,
  }: Readonly<{
    framedOn?: FramedOn;
    /**
     * The body never acts at the selection, so one the frame cannot place
     * leaves it be, even though it places its locations as it runs.
     */
    ignoresSelection?: boolean;
    targetRoot?: () => string;
  }> = {}
): boolean | null => {
  const document = getEditorCommandDocument(editor);
  const recorder = getEditorDocumentRecorder(editor);
  const outer = getTransactionSpecContext(editor);

  if (
    !document ||
    !recorder ||
    outer?.kind !== 'update' ||
    COMMAND_FRAMES.has(editor)
  ) {
    return null;
  }
  runEditorDocumentRecorder(editor);

  const stamp = takeCompositionStamp(editor);
  const stored = outer.snapshot.builder.value as EditorDocumentValue;

  if (
    framedOn &&
    (stored.children !== framedOn.children ||
      outer.caret.generation !== framedOn.generation)
  ) {
    throw new Error('Cannot apply a stale framed spec.');
  }
  const projected = document.project(stored);

  if (!projected) return null;

  const placed = createFramePlace(
    editor,
    projected,
    stored,
    outer.caret.root,
    (reason) => {
      throw refusedIn(editor, reason);
    },
    stamp
  );
  const stamped = stamp && stampFrame(stamp, placed.place);
  const selection = placed.held(outer.caret.selection);
  const target = outer.snapshot.implicitTarget
    ? placed.held(outer.snapshot.implicitTarget)
    : null;
  const run = body(placed.place);

  if (!ignoresSelection) placed.refuseAtHeldSelection();

  const storedIndex = (root: string) =>
    retainTransactionSnapshotIndex(editor, outer.snapshot, root);
  const runFramed = () => {
    const frame = createTransactionSpecContext(editor);
    const { snapshot } = frame;
    let carried: CarriedCarets | null = null;
    let recorded: RecordedDraft | null = null;
    let written: {
      change: DocumentChange;
      frame: EditorDocumentState;
    } | null = null;
    let storedToWritten: PositionMap | undefined;
    let letters: NewLetters | undefined;

    COMMAND_FRAMES.add(editor);
    try {
      enterFrameDraft(
        editor,
        frame,
        stored,
        projected,
        storedIndex,
        outer.caret.selection,
        outer.caret.root,
        selection,
        placed.bookCaret
      );
      if (snapshot.implicitTargetResolved) {
        snapshot.implicitTarget = target;
      } else {
        snapshot.implicitTargetFrame = {
          context: frame,
          storedSelection: outer.caret.selection,
          toFrame: placed.selection,
        };
      }

      if (
        !runStampedFrame(editor, stamped, () =>
          withTransactionSpecDraftRead(editor, run)
        )
      ) {
        return false;
      }
      assertWritesPlaced(editor, snapshot);
      finalizeWithoutOrphanedRoots(editor);
      const wrote = snapshot.builder.change;

      storedToWritten = (root, position, assoc) => {
        countCoreWork('adapterMappings');
        const association = assoc === 1 ? 'forward' : 'backward';
        const at = projected.map.toProjected(root, position, association);

        return at === null
          ? null
          : wrote.mapPosition(at, {
              association,
              ...(root === MAIN_ROOT_KEY ? {} : { root }),
            });
      };
      if (!wrote.empty) {
        runEditorDraftGuards(
          editor,
          'plain',
          snapshot.builder.value as EditorDocumentValue,
          { mapPosition: storedToWritten, start: projected, stored }
        );
      }

      if (!wrote.empty || frame.selectionWritten) {
        // A root the projection dropped is one the frame cannot write, so its
        // bookmarks keep their stored places.
        const inFrame = (root: string) => Object.hasOwn(snapshot.roots, root);
        const changed = carryCarets(
          editor,
          outer.baseCaret,
          frame.caret,
          (root) =>
            inFrame(root)
              ? retainTransactionSnapshotIndex(editor, snapshot, root)
              : storedIndex(root)
        );
        const framed = changed && {
          ...changed,
          moved: changed.moved.filter(({ root }) => inFrame(root)),
        };

        recorded = recorder({
          after: snapshot.builder.value as EditorDocumentValue,
          before: stored,
          bookmarks: recorderBookmarks(framed),
          change: wrote,
          projection: projected,
          selection: frame.caret.selection,
          selectionBefore: outer.caret.selection,
          selectionBeforeRoot: outer.caret.root,
          selectionRoot: frame.caret.root,
          composition: stamp,
          steps: snapshot.builder.draftSteps,
          tags: getActiveEditorUpdateTags(editor),
          update: outer.id,
        });
        if (!recorded) {
          throw new Error('A command frame needs a recorder that records it.');
        }
        letters = snapshot.builder.newLetters;

        const converted = recordedCarets(framed, recorded);

        carried = converted && {
          ...converted,
          moved: [
            ...converted.moved,
            ...(changed?.moved.filter(({ root }) => !inFrame(root)) ?? []),
          ],
        };
        written = {
          change: wrote,
          frame: {
            selection: frame.caret.selection,
            value: snapshot.builder.value as EditorDocumentValue,
          },
        };
      }
      // Effects name places in the frame's document, so they map to the
      // document the update commits. The state they reduced, like any state the
      // frame wrote, carries over as written.
      if (snapshot.effects.length > 0) {
        const toStored = effectChange(
          projected,
          stored,
          wrote,
          recorded?.change ?? null
        );

        for (const effect of snapshot.effects) {
          const mapped = mapEffect(effect, toStored);

          if (mapped) outer.snapshot.effects.push(mapped);
        }
        outer.changed = true;
      }
      if (snapshot.dirtyStateKeys.size > 0) {
        outer.documentState = frame.documentState;
        for (const key of snapshot.dirtyStateKeys) {
          outer.snapshot.dirtyStateKeys.add(key);
        }
        outer.changed = true;
      }
      outer.snapshot.afterCommitHandlers.push(...snapshot.afterCommitHandlers);
      for (const [key, entry] of snapshot.annotations) {
        const previous = outer.snapshot.annotations.get(key);

        outer.snapshot.annotations.set(
          key,
          previous
            ? {
                type: entry.type,
                value: cloneValue(
                  entry.type.combine(previous.value, entry.value)
                ),
              }
            : entry
        );
        outer.changed = true;
      }
      for (const tag of snapshot.tags) outer.snapshot.tags.add(tag);
    } finally {
      COMMAND_FRAMES.delete(editor);
      disposeTransactionSpecContext(editor, frame);
    }
    if (!recorded) return true;
    commitRecordedDraft(editor, outer, recorded, frame.caret.root, {
      carried,
      letters,
      storedToWritten,
    });
    outer.changed = true;
    if (written) {
      document.recorded?.({
        ...written,
        projection: projected,
        root: frame.caret.root,
        stored: {
          selection: outer.caret.selection,
          value: outer.snapshot.builder.value as EditorDocumentValue,
        },
      });
    }

    return true;
  };
  return targetRoot
    ? withEditorUpdateRootScope(editor, targetRoot(), runFramed)
    : runFramed();
};
