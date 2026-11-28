import type {
  AnyEditor as Editor,
  EditorCommandPlace,
  EditorDocumentValue,
  EditorMarks,
  EditorUniqueHolder,
  NodeTarget,
  PlacedTarget,
  TextTarget,
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
import type { DraftStep } from './change/builder';
import {
  DocumentChange,
  getInternalDocumentChangeEntries,
  getInternalDocumentRootChange,
  valueRootIndex,
  valueRootNodes,
} from './change/document-change';
import type { DocumentIndex, NodeList } from './change/document-index';
import { copyRoot, copyRoots, visitRootNames } from './change/lazy-root';
import type { NewLetters } from './change/new-letters';
import { mapRootChangePositionBackward } from './change/root-change';
import type { JsonPoint, JsonToken } from './change/tokens';
import { cloneValue } from './clone';
import {
  type CommandProjection,
  type EditorDocumentState,
  type FrameRefusalReason,
  getEditorCommandDocument,
  refusedIn,
  unplacedIn,
} from './command-document';
import {
  type CompositionStamp,
  runStampedFrame,
  setFrameStamp,
  stampFrame,
  takeCompositionStamp,
} from './composition-stamp';
import { hasEditorContent, isEditorContent } from './content';
import {
  isInRemovedContent,
  landTextWrite,
  nodeAt,
  struckGridPartAt,
  struckOneTextAt,
} from './content-landing';
import {
  getEditorDocumentRecorder,
  type PositionMap,
  runEditorDraftGuards,
} from './document-recorder';
import { type DraftSpan, settleDraftTrack } from './draft-track';
import { getEditorRuntimeOwner, getEditorSchema } from './editor-runtime';
import { topologyHolding } from './identity-owner';
import { MAIN_ROOT_KEY } from './public-root';
import {
  advanceSnapshotIndex,
  assertRootPlaced,
  carryDraftNodeKeys,
  commitRecordedDraft,
  keysReadIn,
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
  getTypedMarks,
  type RecordedDraft,
  recordedCarets,
  recorderBookmarks,
  carryCurrentCaret,
  elementIdOf,
  getNodeTargetRoot,
  lookupElementId,
  resolveNodeTargetLocation,
  UNPLACED_TARGET,
  runEditorDocumentRecorder,
  setTypedMarks,
  type TransactionSpecContext,
  withTransactionSpecDraftRead,
  withEditorUpdateRootScope,
} from './public-state';
import { changedRootsOf } from './root-ownership';
import { mapSelectionThroughChange } from './selection-protocol';
import {
  mapSnapshotIndexThroughChange,
  snapshotIndexOf,
  uniqueTopologyOf,
} from './snapshot-index';
import { mapEffect } from './transaction-values';
import { applyEditorUpdateTag, HISTORY_BOUNDARY_TAG } from './update-policy';
import {
  type CarriedCarets,
  carryCarets,
  getPlacementGeneration,
  mapBookThroughStep,
  withViewPlacement,
} from './view-carets';
import { countCoreWork } from './work';

/**
 * The command frame: a command runs on the document every pending change
 * accepts, which the registered command document projects, and its writes
 * record into the stored document.
 *
 * @internal
 */
const COMMAND_FRAMES = new WeakSet<Editor>();

/** @internal */
export const isInCommandFrame = (editor: Editor): boolean =>
  COMMAND_FRAMES.has(getEditorRuntimeOwner(editor));

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

  if (!document || isInCommandFrame(editor)) return null;

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
  const storedIndex = (rootName: string) =>
    parent
      ? retainTransactionSnapshotIndex(editor, parent, rootName)
      : (published.get(rootName)?.index ??
        snapshotIndexOf(
          getEditorRuntimeOwner(editor),
          valueRootNodes(stored, rootName)
        ));
  // A probe throws nothing, so a selection its apply would refuse only
  // leaves the native path.
  const placed = createFramePlace(
    editor,
    projected,
    stored,
    storedIndex,
    selectionRoot,
    () => {
      moved = true;
    }
  );
  const selection = placed.selection(storedSelection);
  const evaluate = body(placed.place);
  const typed = getTypedMarks(editor);
  const frame = createTransactionSpecContext(editor);
  const { snapshot } = frame;

  const frameOwner = getEditorRuntimeOwner(editor);

  COMMAND_FRAMES.add(frameOwner);
  try {
    enterFrameDraft(
      editor,
      frame,
      stored,
      projected,
      storedIndex,
      storedSelection,
      selectionRoot,
      selection,
      placed.bookCaret
    );
    setTypedMarks(editor, typed);
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
    COMMAND_FRAMES.delete(frameOwner);
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

const TEXT_STARTS = new WeakMap<
  EditorCommandPlace,
  (at: TextTarget | NodeSelection) => boolean
>();

const ELEMENT_ID_PLACES = new WeakMap<
  EditorCommandPlace,
  (id: string) => EditorUniqueHolder | null
>();

const OPTION_PLACES = new WeakMap<
  EditorCommandPlace,
  (options: Readonly<Record<string, unknown>>) => Record<string, unknown> | null
>();

const REMOVALS = new WeakMap<EditorCommandPlace, (at: unknown) => void>();

/**
 * Tells a frame that its command removes `at`, or the selection without one,
 * so a removal of content the frame hides still reaches the recorder.
 *
 * @internal
 */
export const removesAtPlace = (place: EditorCommandPlace, at: unknown) =>
  REMOVALS.get(place)?.(at);

/** @internal */
export const placeElementIdIn = (place: EditorCommandPlace, id: string) =>
  getDefined(ELEMENT_ID_PLACES.get(place))(id);

const TARGET_OPTIONS = ['at', 'after', 'before'] as const;

const isOptions = (arg: unknown): arg is Readonly<Record<string, unknown>> =>
  typeof arg === 'object' &&
  arg !== null &&
  !Array.isArray(arg) &&
  !NodeApi.isDescendant(arg);

const namesElementId = (args: readonly unknown[]) => {
  const options = args.at(-1);

  return (
    isOptions(options) &&
    TARGET_OPTIONS.some((name) => elementIdOf(options[name]) !== undefined)
  );
};

/** @internal */
export const callAtElementIds = (
  caller: Editor,
  args: readonly unknown[],
  call: (args: readonly unknown[], framed: boolean) => unknown
): unknown => {
  if (!namesElementId(args)) return call(args, false);

  const owner = getEditorRuntimeOwner(caller);
  let result: unknown;
  const framed = withViewPlacement(caller, () =>
    runInEditorCommandFrame(owner, (place) => {
      const last = args.length - 1;
      const options = getDefined(OPTION_PLACES.get(place))(
        args[last] as Readonly<Record<string, unknown>>
      );
      const placed = args.with(last, options ?? missedOptions(args[last]));

      return () => {
        result = call(placed, true);

        return true;
      };
    })
  );

  return framed === null ? call(args, false) : result;
};

const missedOptions = (options: unknown) =>
  Object.fromEntries(
    Object.entries(options as Record<string, unknown>).map(([name, value]) => [
      name,
      (TARGET_OPTIONS as readonly string[]).includes(name) &&
      value !== undefined
        ? UNPLACED_TARGET
        : value,
    ])
  );

/** @internal */
export const unframedPlace = (editor: Editor): EditorCommandPlace =>
  Object.freeze({
    location: ((at: NodeTarget | NodeSelection | Span) => {
      const id = elementIdOf(at);

      if (id !== undefined) return lookupElementId(editor, id)?.key ?? null;

      const hiddenFromFrame =
        isInCommandFrame(editor) &&
        (typeof at === 'string' || NodeApi.isDescendant(at)) &&
        getNodeTargetRoot(editor, at) === undefined;

      return hiddenFromFrame ? null : at;
    }) as EditorCommandPlace['location'],
  });

/** @internal */
export const refusesTextStartInStruck = (
  place: EditorCommandPlace,
  at: TextTarget | NodeSelection
) => TEXT_STARTS.get(place)?.(at) ?? false;

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
            valueRootIndex(stored, rootName),
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

  return valueRootIndex(projected.value, root);
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
  copyRoots(roots, projected.value.roots ?? {});
  snapshot.roots = roots;
  snapshot.reservedRoots = new Set(visitRootNames(stored.roots));
  countCoreWork('snapshotRoots', visitRootNames(snapshot.roots).length);
  snapshot.rootIndexes = new Map();
  snapshot.baseRuntimeIndexes = new Map();
  snapshot.baseSnapshots = new Map();
  for (const root of projected.map.roots) {
    let mapped: SnapshotIndex | undefined;
    const settle = () =>
      (mapped ??= frameIndexOf(editor, stored, projected, root, () =>
        storedIndex(root)
      ));

    snapshot.baseRuntimeIndexes.set(root, settle);
    deferNodeKeys(getEditorRuntimeOwner(editor), frame.id, root, settle);
  }
  for (const root of visitRootNames(roots)) {
    if (!snapshot.baseRuntimeIndexes.has(root)) {
      snapshot.baseRuntimeIndexes.set(root, () => storedIndex(root));
    }
  }
  // The accept-all projection of a valid review tree is valid, so the frame
  // adopts it as its validated baseline.
  getEditorSchema(editor).adoptDocumentBaseline(projected.value);
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
    ...carryCurrentCaret(editor, frame.caret, {
      root: frame.caret.root,
      selection,
    }),
  };
  frame.baseCaret = frame.caret;
  snapshot.selection = selection;
  snapshot.frameSelection = (at) => bookCaret(at, storedSelectionRoot);
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

type Refuse = (reason: FrameRefusalReason) => void;
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
  storedIndex: (root: string) => SnapshotIndex,
  selectionRoot: string,
  refuse: Refuse,
  stamp: CompositionStamp | null = null,
  refusesStruckTargets = true
) => {
  let heldRefusal: FrameRefusalReason | null = null;
  let located = false;
  let removal: Readonly<{ at: unknown }> | null = null;
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

    const document = valueRootNodes(stored, root) as NodeList<Descendant>;
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
    ).selection;
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
  const pointOnStoredSide = (
    after: DocumentIndex,
    root: string,
    position: number,
    side: -1 | 1,
    point: Point
  ) => {
    const placed = after.pointAt(position, side);

    if (!placed) return placed;

    const element =
      compositionElement && root === compositionRoot
        ? compositionElement
        : hiddenCaretStamp(editor, stored, projected, point, root)
          ? projected.map.nodePath(root, point.path.slice(0, -1))
          : null;

    if (!element) return placed;

    const inElement = (at: JsonPoint) =>
      PathApi.equals(at.path.slice(0, -1), element);

    if (inElement(placed)) return placed;

    const other = after.pointAt(position, side < 0 ? 1 : -1);

    return other && inElement(other) ? other : placed;
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
    const placed = pointOnStoredSide(after, root, position, side, point);

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
  const inStruckGridPart = (
    path: Path,
    root: string,
    document: NodeList<Descendant>
  ) => {
    const part = struckGridPartAt(editor, path, document);

    return (
      part !== null &&
      projected.map.hides(
        root,
        valueRootIndex(stored, root).nodeRange(part).from + 1
      )
    );
  };
  const refusesStruck = (
    paths: readonly Path[],
    root: string,
    onRefuse: Refuse = refuse
  ) => {
    if (!refusesStruckTargets) return false;

    const document = valueRootNodes(stored, root) as NodeList<Descendant>;

    if (!paths.some((at) => inStruckGridPart(at, root, document))) {
      return false;
    }
    onRefuse('grid');

    return true;
  };
  const refusesStruckText = (
    paths: readonly Path[],
    document: NodeList<Descendant>,
    onRefuse: Refuse
  ) => {
    if (paths.some((at) => struckOneTextAt(editor, at, document))) {
      onRefuse('one-text');
    }
  };
  const insideStruckText = (paths: readonly Path[], root: string) => {
    if (!refusesStruckTargets) return false;

    const document = valueRootNodes(stored, root) as NodeList<Descendant>;

    const inside = (at: Path) => {
      const holder = struckOneTextAt(editor, at, document);

      return holder !== null && holder.length < at.length;
    };

    if (!paths.some(inside)) return false;
    refuse('one-text');

    return true;
  };
  // A caret no surviving line can take, as in a container whose every line
  // is gone, stays in what replaces its line, such as the line completion
  // gives that container.
  const caret = (point: Point, fallbackRoot: string, onRefuse: Refuse) => {
    const root = point.root ?? fallbackRoot;
    const document = valueRootNodes(stored, root) as NodeList<Descendant>;
    const landed = landTextWrite(editor, point, document);

    if (
      inStruckGridPart(point.path, root, document) ||
      inStruckGridPart(landed.path, root, document)
    ) {
      onRefuse('grid');
    }
    refusesStruckText([point.path, landed.path], document, onRefuse);
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
  const storedPathOf = (point: JsonPoint, root: string, assoc: -1 | 1) => {
    const at = projected.map.toStored(
      root,
      projectedIndex(projected, root).positionAt(point),
      assoc
    );

    return at === null
      ? null
      : (valueRootIndex(stored, root).pointAt(at, assoc)?.path ?? null);
  };
  const lastLetterBeforeHungEnd = (from: Point, to: Point, root: string) => {
    if (from.offset !== 0 || to.offset !== 0 || PathApi.hasPrevious(to.path)) {
      return null;
    }

    const index = projectedIndex(projected, root);

    return index.pointAt(index.nodeRange(PathApi.parent(to.path)).from, -1);
  };
  const writtenEnds = (from: Point, to: Point, root: string) => {
    const hung = lastLetterBeforeHungEnd(from, to, root);

    return [
      storedPathOf(from, root, 1),
      storedPathOf(to, root, -1),
      hung && storedPathOf(hung, root, -1),
    ].filter((at) => at !== null);
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

    refusesStruck([range.anchor.path, range.focus.path], root, onRefuse);
    refusesStruckText(
      [range.anchor.path, range.focus.path],
      valueRootNodes(stored, root) as NodeList<Descendant>,
      onRefuse
    );

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

    refusesStruckText(
      writtenEnds(from, to, root),
      valueRootNodes(stored, root) as NodeList<Descendant>,
      onRefuse
    );

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

  const showsEveryLetter = (root: string, at: Path, text: string) => {
    const index = valueRootIndex(stored, root);
    const from = index.positionAt({ offset: 0, path: at });
    const to = index.positionAt({ offset: text.length, path: at });
    const start = projected.map.toProjected(root, from, 'forward');
    const end = projected.map.toProjected(root, to, 'backward');

    return start !== null && end !== null && end - start === to - from;
  };
  const hidesPartOf = (root: string, at: Path, text: string) =>
    text.length === 0 || !showsEveryLetter(root, at, text);
  const path = (at: Path): Path | null => {
    if (at.length === 0) return at;

    const root = getEditorUpdateRoot(editor);
    const node = nodeAt(
      valueRootNodes(stored, root) as NodeList<Descendant>,
      at
    );
    const shown =
      node && !(NodeApi.isText(node) && hidesPartOf(root, at, node.text))
        ? projected.map.nodePath(root, at)
        : null;

    return shown ?? mappedPath(at);
  };
  const mappedPath = (at: Path): Path | null => {
    const mapped = map(
      SelectionApi.nodes([at], { mode: 'block' }),
      getEditorUpdateRoot(editor)
    );

    if (mapped?.kind === 'node') return getDefined(mapped.paths[0]);

    const parentPath = at.slice(0, -1);
    const childCount = (value: EditorDocumentValue, parent: Path) => {
      const rootNodes = valueRootNodes(
        value,
        getEditorUpdateRoot(editor)
      ) as NodeList<Descendant>;

      if (parent.length === 0) return rootNodes.length;

      const node = nodeAt(rootNodes, parent);

      return node && !NodeApi.isText(node) ? node.children.length : null;
    };

    if (at.at(-1) !== childCount(stored, parentPath)) return null;

    const placed = path(parentPath);
    const count = placed && childCount(projected.value, placed);

    return placed && count !== null ? [...placed, count] : null;
  };

  function location<T extends NodeTarget | NodeSelection | Span>(
    at: T
  ): PlacedTarget<T> | null;
  function location(
    at: NodeTarget | NodeSelection | Span
  ): NodeTarget | NodeSelection | Span | null {
    located = true;
    const id = elementIdOf(at);

    if (id !== undefined) return placeElementId(id)?.key ?? null;
    const isNode = NodeApi.isDescendant(at);

    if (SelectionApi.isNode(at)) {
      const root = SelectionApi.root(at) ?? getEditorUpdateRoot(editor);

      if (refusesStruck(at.paths, root) || insideStruckText(at.paths, root)) {
        return null;
      }

      const mapped = map(at, getEditorUpdateRoot(editor));

      return mapped?.kind === 'node' ? mapped : null;
    }
    if (!isNode && PointApi.isPoint(at)) {
      return caret(at, getEditorUpdateRoot(editor), refuse);
    }
    if (LocationApi.isSpan(at)) {
      const root = getEditorUpdateRoot(editor);

      if (refusesStruck(at, root) || insideStruckText(at, root)) return null;

      const from = path(at[0]);
      const to = path(at[1]);

      return from && to && [from, to];
    }
    if (!isNode && RangeApi.isRange(at)) {
      const placed = span(at, getEditorUpdateRoot(editor), refuse);

      return placed && { ...at, ...placed };
    }

    const resolved = resolveNodeTargetLocation(editor, at as TextTarget);
    const target = resolved && PathApi.isPath(resolved) ? resolved : null;
    const root = getEditorUpdateRoot(editor);

    if (
      target &&
      (refusesStruck([target], root) || insideStruckText([target], root))
    ) {
      return null;
    }

    const placed = target ? path(target) : null;

    return placed && (typeof at === 'string' || isNode) ? at : placed;
  }

  const startsInStruckText = (at: TextTarget | NodeSelection) => {
    if (SelectionApi.isNode(at)) return false;

    const resolved = resolveNodeTargetLocation(editor, at);

    if (!resolved || !PathApi.isPath(resolved)) return false;

    const root = getEditorUpdateRoot(editor);
    const node = nodeAt(
      valueRootNodes(stored, root) as NodeList<Descendant>,
      resolved
    );

    return (
      node !== undefined &&
      insideStruckText([[...resolved, ...NodeApi.first(node, [])[1]]], root)
    );
  };
  // An id names the element that holds it in the frame's document: the copy a
  // pending move shows, never its struck original. A root the projection
  // leaves alone shows what it stores. A holder only the stored document
  // shows refuses as its key does, then places nowhere.
  const storedHolders = new Map<string, EditorUniqueHolder | null>();
  const storedHolder = (id: string) => {
    const known = storedHolders.get(id);

    if (known !== undefined) return known;

    const held = lookupElementId(editor, id);

    storedHolders.set(id, held);

    return held;
  };
  const placeElementId = (id: string) => {
    located = true;
    const held = storedHolder(id);
    const changed = projected.map.roots;

    if (held && !changed.includes(held.root)) return held;
    for (const root of changed.toSorted((a, b) =>
      a === MAIN_ROOT_KEY ? -1 : b === MAIN_ROOT_KEY ? 1 : a < b ? -1 : 1
    )) {
      const topology = uniqueTopologyOf(
        getEditorRuntimeOwner(editor),
        frameIndexOf(editor, stored, projected, root, () => storedIndex(root)),
        valueRootNodes(projected.value, root)
      );
      const [shown] = (topology &&
        topologyHolding(topology, 'id', id)?.all()) || [null];

      if (shown?.key) return { key: shown.key, path: shown.path, root };
    }
    if (held && !refusesStruck([held.path], held.root)) {
      insideStruckText([held.path], held.root);
    }

    return null;
  };
  const placeOptions = (options: Readonly<Record<string, unknown>>) => {
    const id = elementIdOf(options.at);
    const held = id === undefined ? null : storedHolder(id);
    const inHolderRoot = <T>(fn: () => T) =>
      held ? withEditorUpdateRootScope(editor, held.root, fn) : fn();
    const placed: Record<string, unknown> = { ...options };

    for (const name of ['at', 'after', 'before', 'to'] as const) {
      const target = options[name] as NodeTarget | undefined;

      if (target === undefined || target === null) continue;

      const at = inHolderRoot(() => location(target));

      if (at === null) return null;
      placed[name] = at;
    }

    const childIndexInFrame = (position: number) =>
      inHolderRoot(() => {
        const holder = resolveNodeTargetLocation(
          editor,
          placed.at as TextTarget
        );
        const child =
          holder && PathApi.isPath(holder) ? path([...holder, position]) : null;

        return child?.at(-1) ?? null;
      });
    const { position } = options;

    if (held && typeof position === 'number') {
      const index = childIndexInFrame(position);

      if (index === null) return null;
      placed.position = index;
    }

    return placed;
  };
  const place: EditorCommandPlace = Object.freeze({ location });

  TEXT_STARTS.set(place, startsInStruckText);
  ELEMENT_ID_PLACES.set(place, placeElementId);
  OPTION_PLACES.set(place, placeOptions);
  REMOVALS.set(place, (at) => {
    removal = { at };
  });
  const placeSelection = (
    selection: Selection,
    root: string,
    onRefuse: Refuse
  ): Selection => {
    if (selection?.kind !== 'text') {
      if (selection) {
        refusesStruck(
          selection.paths,
          SelectionApi.root(selection) ?? root,
          onRefuse
        );
      }

      return map(selection, root);
    }

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
    removal: () => removal,
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

const hiddenCaretStamp = (
  editor: Editor,
  stored: EditorDocumentValue,
  projected: CommandProjection,
  target: unknown,
  fallbackRoot: string
): CompositionStamp | null => {
  if (!hasEditorContent(editor)) return null;

  const point =
    !NodeApi.isDescendant(target) && PointApi.isPoint(target)
      ? target
      : !NodeApi.isDescendant(target) &&
          RangeApi.isRange(target) &&
          PointApi.equals(target.anchor, target.focus)
        ? target.anchor
        : null;

  if (!point) return null;

  const root = point.root ?? fallbackRoot;

  if (!projected.map.roots.includes(root)) return null;

  const leaf = nodeAt(
    valueRootNodes(stored, root) as NodeList<Descendant>,
    point.path
  );

  return leaf !== undefined && !isEditorContent(editor, leaf)
    ? { place: point }
    : null;
};

/** @internal */
export const runInEditorCommandFrame = (
  editor: Editor,
  body: EditorFrameBody<boolean>,
  {
    framedOn,
    ignoresSelection = false,
    refusesStruckTargets = true,
    targetRoot,
  }: Readonly<{
    framedOn?: FramedOn;
    /**
     * The body never acts at the selection, so one the frame cannot place
     * leaves it be, even though it places its locations as it runs.
     */
    ignoresSelection?: boolean;
    /**
     * False when the body places the paths a change touched, not targets a
     * caller named, so a path inside a struck table or row maps as any other.
     */
    refusesStruckTargets?: boolean;
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
    isInCommandFrame(editor)
  ) {
    return null;
  }
  runEditorDocumentRecorder(editor);

  const explicitStamp = takeCompositionStamp(editor);
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

  const stamp =
    explicitStamp ??
    hiddenCaretStamp(
      editor,
      stored,
      projected,
      outer.snapshot.implicitTargetResolved
        ? outer.snapshot.implicitTarget
        : outer.caret.selection,
      outer.caret.root
    );
  const storedIndex = (root: string) =>
    retainTransactionSnapshotIndex(editor, outer.snapshot, root);
  const placed = createFramePlace(
    editor,
    projected,
    stored,
    storedIndex,
    outer.caret.root,
    (reason) => {
      throw refusedIn(editor, reason);
    },
    stamp,
    refusesStruckTargets
  );
  const stamped = stampFrame(stamp, placed.place, {
    explicit: explicitStamp !== null,
    resolvePlace: (at) =>
      hiddenCaretStamp(
        editor,
        stored,
        projected,
        at,
        getEditorUpdateRoot(editor)
      ),
  });
  const selection = placed.held(outer.caret.selection);
  const target = outer.snapshot.implicitTarget
    ? placed.held(outer.snapshot.implicitTarget)
    : null;
  const run = body(placed.place);

  if (!ignoresSelection) placed.refuseAtHeldSelection();

  const runFramed = () => {
    const typed = getTypedMarks(editor);
    const frame = createTransactionSpecContext(editor);
    const { snapshot } = frame;
    let typedAfter: EditorMarks | null = null;
    let carried: CarriedCarets | null = null;
    let recorded: RecordedDraft | null = null;
    let written: {
      change: DocumentChange;
      frame: EditorDocumentState;
    } | null = null;
    let storedToWritten: PositionMap | undefined;
    let letters: NewLetters | undefined;
    let steps: readonly DraftStep[] = [];
    let hadFrameSteps = false;
    let landing: Readonly<{
      root: string;
      spans: readonly DraftSpan[];
    }> | null = null;

    const frameOwner = getEditorRuntimeOwner(editor);

    COMMAND_FRAMES.add(frameOwner);
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
      setTypedMarks(editor, typed);
      if (snapshot.implicitTargetResolved) {
        snapshot.implicitTarget = target;
      } else {
        snapshot.implicitTargetFrame = {
          context: frame,
          storedSelection: outer.caret.selection,
          toFrame: (moved) => {
            setFrameStamp(
              stamped,
              hiddenCaretStamp(
                editor,
                stored,
                projected,
                moved,
                outer.caret.root
              )
            );

            return placed.selection(moved);
          },
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
      hadFrameSteps = snapshot.builder.draftSteps.length > 0;
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

      steps = snapshot.builder.draftSteps;
      // The stored range a removal names, or the held selection it removes.
      // A removal of content the frame hides writes nothing, yet the
      // recorder may still record it on the stored document.
      const removed = placed.removal();
      const removedRange =
        removed &&
        (removed.at === undefined ? outer.caret.selection : removed.at);
      const removal =
        removed &&
        RangeApi.isRange(removedRange) &&
        RangeApi.isExpanded(removedRange)
          ? {
              root:
                removed.at === undefined
                  ? outer.caret.root
                  : (removedRange.anchor.root ?? getEditorUpdateRoot(editor)),
              selection: removedRange,
            }
          : null;
      const hidden = wrote.empty && !frame.selectionWritten && removal !== null;

      if (!wrote.empty || frame.selectionWritten || hidden) {
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

        const recording = recorder({
          after: snapshot.builder.value as EditorDocumentValue,
          before: stored,
          bookmarks: recorderBookmarks(framed),
          change: wrote,
          ...(removal ? { removal } : {}),
          projection: projected,
          selection: frame.caret.selection,
          selectionBefore: outer.caret.selection,
          selectionBeforeRoot: outer.caret.root,
          selectionRoot: frame.caret.root,
          composition: stamped.used ? stamped.stamp : explicitStamp,
          steps: snapshot.builder.draftSteps,
          tags: getActiveEditorUpdateTags(editor),
          update: outer.id,
        });

        recorded = hidden && recording?.change.empty ? null : recording;
        if (!recorded && !hidden) {
          throw new Error('A command frame needs a recorder that records it.');
        }
        if (recorded) {
          carryDraftNodeKeys(
            editor,
            snapshot,
            recorded,
            { before: projected.value, change: wrote },
            keysReadIn(snapshot)
          );
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
      }
      const track = frame.lastSpecLanding;
      const spans = track && recorded && settleDraftTrack(track);

      if (track && spans?.length) landing = { root: track.root, spans };
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
      for (const [key, candidate] of snapshot.pluginReconfigurations) {
        outer.snapshot.pluginReconfigurations.set(key, candidate);
        outer.changed = true;
      }
      typedAfter = getTypedMarks(editor);
    } finally {
      COMMAND_FRAMES.delete(frameOwner);
      disposeTransactionSpecContext(editor, frame);
    }
    if (!recorded) {
      if (hadFrameSteps || steps.length > 0) {
        outer.snapshot.publishesUnknownFacts = true;
      }
      setTypedMarks(editor, typedAfter);
      return true;
    }
    commitRecordedDraft(editor, outer, recorded, frame.caret.root, {
      carried,
      writtenLanding: landing,
      letters,
      plainSteps: { steps, toStored: projected.map.toStored },
      storedToWritten,
      typed: typedAfter,
    });
    if (recorded.historyBoundary) {
      applyEditorUpdateTag(outer.snapshot.tags, HISTORY_BOUNDARY_TAG);
    }
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
