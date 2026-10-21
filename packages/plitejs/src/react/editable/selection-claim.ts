import { SelectionApi } from '../..';
import {
  getCaretOwner,
  getPlacementGeneration,
  holdsCaret,
  keepBookmark,
  nextMintedGeneration,
  placedSince,
} from '../../core/view-carets';
import { getSelection } from '../../dom';
import { findDOMRootRuntime, isWebKitDOMHost } from '../../dom/internal';
import type { DOMPhaseScheduler } from '../../dom/plugin/dom-phase-scheduler';
import { watchDOMSyncTextMarks } from '../../dom/plugin/dom-sync-mutation-ownership';
import { longestCommonPrefixLength } from '../../dom/utils/diff-text';
import {
  type DOMSelectionPoints,
  type DOMSelectionRecord,
  forgetDOMSelectionRecord,
  forgetDOMSelectionRecordWithin,
  readDOMSelectionPoints,
  readDOMSelectionRecord,
  recordDOMSelection,
  sameDOMSelectionPoints,
} from '../../dom/utils/selection-writes';
import { mountViewPeer } from '../../editor-runtime-view';
import { supersedeEditableFocusRequests } from '../hooks/focus-plite-editable';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';

export type TreeSelection = DOMSelectionPoints | 'no-ranges' | 'no-selection';

type Observation = Readonly<{
  points: TreeSelection | 'unread';
  receipt: number;
  textsAtArrival: readonly [string | null, string | null] | null;
}>;

type GestureInput =
  | Readonly<{ kind: 'key' }>
  | Readonly<{ kind: 'press'; pointer: string }>;

type Gesture = {
  exportsOnClose: boolean;
  readonly input: GestureInput;
  lastKeep: number | null;
  receipt: number;
  released: boolean;
  settled: boolean;
  readonly shownAtOpen: TreeSelection;
};

export type SelectionImportSink = 'disappear' | 'place';

export type SelectionImportDecision =
  | Readonly<{
      verdict: 'claim' | 'sync';
      write: (writer: () => void) => void;
    }>
  | Readonly<{ verdict: 'clear' | 'kept' | 'veto' }>;

const LONE: SelectionImportDecision = {
  verdict: 'sync',
  write: (writer) => writer(),
};

const RELEASES = [
  'dragend',
  'keyup',
  'mouseup',
  'pointercancel',
  'pointerup',
  'touchcancel',
  'touchend',
] as const;

const isPoints = (
  selection: Observation['points']
): selection is DOMSelectionPoints => typeof selection === 'object';

const sameSelection = (
  selection: Observation['points'],
  other: Observation['points']
) =>
  isPoints(selection) && isPoints(other)
    ? sameDOMSelectionPoints(selection, other)
    : selection === other;

const sameAs = (selection: TreeSelection, record: DOMSelectionRecord | null) =>
  !!record &&
  (isPoints(selection)
    ? sameDOMSelectionPoints(selection, record.points)
    : selection === 'no-ranges' && record.points === null);

const textOf = (node: Node) =>
  node.nodeType === node.TEXT_NODE ? (node as Text).data : null;

const textsOf = (selection: TreeSelection) =>
  isPoints(selection)
    ? ([textOf(selection.anchor[0]), textOf(selection.focus[0])] as const)
    : null;

const readTreeSelection = (tree: Document | ShadowRoot): TreeSelection => {
  const selection = getSelection(tree);

  if (!selection) return 'no-selection';

  return readDOMSelectionPoints(selection) ?? 'no-ranges';
};

const NOTED_CHANGES = {
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  subtree: true,
} as const;

type TreeNote = {
  beforeWrite: TreeSelection | null;
  readonly claims: Set<SelectionClaims>;
  turnEnd: Readonly<{ cancel: () => void; owner: SelectionClaims }> | null;
  readonly written: Set<Node>;
};

const TREE_NOTES = new WeakMap<Document | ShadowRoot, TreeNote>();

const childIndex = (child: Node) => {
  let index = 0;

  for (let node = child.previousSibling; node; node = node.previousSibling) {
    index += 1;
  }

  return index;
};

const endpointMovedBy = (
  record: MutationRecord,
  [node, offset]: DOMSelectionPoints['anchor'],
  note: TreeNote,
  shown: DOMSelectionPoints
) => {
  if (record.target !== node) return false;
  if (record.type === 'characterData') {
    if (note.written.has(node)) {
      return !!note.beforeWrite && !sameSelection(shown, note.beforeWrite);
    }

    const old = record.oldValue ?? '';
    const { data } = node as CharacterData;

    // An equal-length change leaves every offset past the prefix in place. A
    // whole rewrite moves every offset to 0, so 0 cannot show it stayed.
    return (
      (old.length !== data.length &&
        offset > longestCommonPrefixLength(old, data)) ||
      (offset === 0 && old !== '')
    );
  }

  const { previousSibling } = record;
  const index =
    previousSibling?.parentNode === node ? childIndex(previousSibling) + 1 : 0;

  return offset > index || (offset === index && record.removedNodes.length > 0);
};

export class SelectionClaims {
  private rangeReceipt: number | null = null;
  private cancelSettle: (() => void) | null = null;
  private detachGestureListeners: (() => void) | null = null;
  private detachNote: (() => void) | null = null;
  private noteObserver: MutationObserver | null = null;
  private gesture: Gesture | null = null;
  private lastImport: Readonly<{
    generation: number;
    points: TreeSelection;
  }> | null = null;
  private observation: Observation | null = null;
  private peers = false;
  private pointerPressed = false;
  private releasedTouch: Gesture | null = null;
  private readonly exportSelection: () => void;
  private readonly releasePeers: () => void;
  private readonly schedule: DOMPhaseScheduler['schedule'];
  readonly editable: HTMLElement;
  readonly view: ReactRuntimeEditor;

  constructor(
    view: ReactRuntimeEditor,
    editable: HTMLElement,
    schedule: DOMPhaseScheduler['schedule'],
    exportSelection: () => void
  ) {
    this.view = view;
    this.editable = editable;
    this.schedule = schedule;
    this.exportSelection = exportSelection;
    this.releasePeers = mountViewPeer(view, (hasPeers) => {
      this.setPeers(hasPeers);
    });
  }

  destroy() {
    this.releasePeers();
    this.setPeers(false);
    forgetDOMSelectionRecordWithin(this.tree, this.editable);
  }

  private get tree(): Document | ShadowRoot {
    const root = this.editable.getRootNode();

    return root.nodeType === root.DOCUMENT_NODE ||
      root.nodeType === root.DOCUMENT_FRAGMENT_NODE
      ? (root as Document | ShadowRoot)
      : this.editable.ownerDocument;
  }

  /** WebKit reports a shadow root's selection as its host. */
  private readsHost(tree: Document | ShadowRoot) {
    return (
      tree.nodeType === tree.DOCUMENT_FRAGMENT_NODE &&
      isWebKitDOMHost(this.editable)
    );
  }

  private anchoredHere(selection: TreeSelection) {
    return isPoints(selection) && this.editable.contains(selection.anchor[0]);
  }

  private get notesChanges() {
    return !!this.gesture || !this.focusedHolder;
  }

  private get focusedHolder() {
    const active = this.tree.activeElement;

    return !!active && this.editable.contains(active) && holdsCaret(this.view);
  }

  private attachNote() {
    const { editable, tree } = this;
    const Observer =
      editable.ownerDocument.defaultView?.MutationObserver ?? MutationObserver;
    const observer = new Observer((records) => {
      SelectionClaims.endNoteTurn(tree, records, this);
    });
    const note: TreeNote = TREE_NOTES.get(tree) ?? {
      beforeWrite: null,
      claims: new Set(),
      turnEnd: null,
      written: new Set(),
    };
    const unwatch = watchDOMSyncTextMarks(editable, (target) => {
      note.written.add(target);
      if (note.beforeWrite) return;

      note.beforeWrite = readTreeSelection(tree);
      note.turnEnd = {
        cancel: this.schedule(
          'dom-read',
          'selection-claim-note-turn',
          () => {
            SelectionClaims.endNoteTurn(tree);
          },
          { timing: 'microtask' }
        ),
        owner: this,
      };
    });

    observer.observe(editable, NOTED_CHANGES);
    this.noteObserver = observer;
    note.claims.add(this);
    TREE_NOTES.set(tree, note);
    this.detachNote = () => {
      if (note.turnEnd?.owner === this) SelectionClaims.endNoteTurn(tree);
      observer.disconnect();
      this.noteObserver = null;
      unwatch();
      note.claims.delete(this);
      if (note.claims.size === 0 && TREE_NOTES.get(tree) === note) {
        TREE_NOTES.delete(tree);
      }
    };
  }

  private static endNoteTurn(
    tree: Document | ShadowRoot,
    delivered: readonly MutationRecord[] = [],
    deliveredTo: SelectionClaims | null = null
  ) {
    const note = TREE_NOTES.get(tree);

    if (!note) return;

    note.turnEnd?.cancel();
    note.turnEnd = null;

    const records: MutationRecord[] = [];
    let readsHost = false;

    for (const peer of note.claims) {
      const taken = peer === deliveredTo ? delivered : [];
      const pending = peer.noteObserver?.takeRecords() ?? [];

      readsHost ||= peer.readsHost(tree);
      if (taken.length + pending.length > 0 && peer.notesChanges) {
        records.push(...taken, ...pending);
      }
    }

    if (records.length > 0 && !readsHost) {
      const shown = readTreeSelection(tree);

      if (
        isPoints(shown) &&
        records.some(
          (record) =>
            endpointMovedBy(record, shown.anchor, note, shown) ||
            endpointMovedBy(record, shown.focus, note, shown)
        )
      ) {
        recordDOMSelection(tree, shown, 'moved');
      }
    }
    note.beforeWrite = null;
    note.written.clear();
  }

  observeSelection() {
    if (!this.peers) return;

    const { tree } = this;

    SelectionClaims.endNoteTurn(tree);
    if (this.readsHost(tree)) return;

    const selection = readTreeSelection(tree);

    if (sameAs(selection, readDOMSelectionRecord(tree))) return;

    const receipt = this.gesture?.receipt ?? getPlacementGeneration(this.view);

    this.observation = {
      points: selection,
      receipt,
      textsAtArrival: textsOf(selection),
    };
    if (this.anchoredHere(selection)) this.rangeReceipt = receipt;
  }

  openKeyGesture() {
    if (this.peers) this.openGesture({ kind: 'key' }, null);
  }

  private openGesture(input: GestureInput, reopened: Gesture | null) {
    const { tree, view } = this;
    const receipt = reopened?.receipt ?? getPlacementGeneration(view);

    this.cancelSettle?.();
    this.cancelSettle = null;
    supersedeEditableFocusRequests(view);
    this.gesture = {
      exportsOnClose: false,
      input,
      lastKeep: reopened?.lastKeep ?? null,
      receipt,
      released: false,
      settled: false,
      shownAtOpen: readTreeSelection(tree),
    };
    this.releasedTouch = null;
    forgetDOMSelectionRecord(tree);
    this.observation = { points: 'unread', receipt, textsAtArrival: null };
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    if (!event.composedPath().includes(this.editable)) return;

    this.pointerPressed = true;
    this.openGesture(
      { kind: 'press', pointer: event.pointerType || 'mouse' },
      null
    );
  };

  private readonly onPress = (event: Event) => {
    if (this.pointerPressed) {
      this.pointerPressed = false;
      this.followPressPlacement();
      return;
    }

    const touch = this.releasedTouch;

    // A touch's compatibility mousedown, which no pointerdown starts, places
    // the tap's caret after the touch ended.
    if (event.type === 'mousedown' && touch) {
      this.openGesture(touch.input, touch);
      return;
    }
    this.openGesture(
      {
        kind: 'press',
        pointer: event.type === 'touchstart' ? 'touch' : 'mouse',
      },
      null
    );
  };

  private followPressPlacement() {
    const { gesture, observation } = this;

    // A caret key during a tap opens a key gesture that the tap's pointerup
    // does not release, so without a touchstart the tap's mousedown still
    // finds pointerPressed set.
    if (gesture?.input.kind !== 'press' || !holdsCaret(this.view)) return;

    const receipt = getPlacementGeneration(this.view);

    if (
      observation?.points === 'unread' &&
      observation.receipt === gesture.receipt
    ) {
      this.observation = { ...observation, receipt };
    }
    gesture.receipt = receipt;
  }

  private releases(gesture: Gesture, event: Event) {
    switch (event.type) {
      case 'blur': {
        return event.target === event.currentTarget;
      }
      // Any key's release ends a key gesture, because macOS sends no keyup
      // for an arrow pressed while Command is held.
      case 'keyup': {
        return gesture.input.kind === 'key';
      }
      case 'visibilitychange': {
        return this.editable.ownerDocument.visibilityState === 'hidden';
      }
      default: {
        return gesture.input.kind === 'press';
      }
    }
  }

  private readonly onRelease = (event: Event) => {
    const { gesture } = this;

    if (!gesture || gesture.released || !this.releases(gesture, event)) {
      return;
    }

    gesture.released = true;
    this.pointerPressed = false;
    if (gesture.input.kind === 'press' && gesture.input.pointer === 'touch') {
      this.releasedTouch = gesture;
    }
    // The browser applies a release's own change to the selection, such as a
    // plain click's collapse, after the release's handlers.
    this.cancelSettle = this.schedule(
      'selection-repair',
      'selection-claim-settle',
      () => {
        this.cancelSettle = null;
        this.settle(gesture);
      },
      { timing: 'animation-frame' }
    );
  };

  private settle(gesture: Gesture) {
    if (this.gesture !== gesture) return;

    gesture.settled = true;

    const { observation, tree } = this;
    const shown = readTreeSelection(tree);
    const nothingToJudge = observation
      ? observation.points === 'unread' &&
        sameSelection(shown, gesture.shownAtOpen)
      : sameAs(shown, readDOMSelectionRecord(tree));

    if (nothingToJudge) this.close(gesture);
  }

  private close(gesture: Gesture) {
    this.gesture = null;
    // A tree that reads as its host learns the gesture's points only from a
    // later probe import, which needs the unread observation.
    if (this.observation?.points === 'unread' && !this.readsHost(this.tree)) {
      this.observation = null;
    }
    if (gesture.exportsOnClose) this.exportSelection();
  }

  private setPeers(hasPeers: boolean) {
    if (this.peers === hasPeers) return;

    this.peers = hasPeers;
    if (hasPeers) {
      this.attachGestureListeners();
      this.attachNote();
      return;
    }
    this.detachGestureListeners?.();
    this.detachGestureListeners = null;
    this.detachNote?.();
    this.detachNote = null;
    this.cancelSettle?.();
    this.cancelSettle = null;
    this.rangeReceipt = null;
    this.gesture = null;
    this.lastImport = null;
    this.observation = null;
    this.pointerPressed = false;
    this.releasedTouch = null;
  }

  private attachGestureListeners() {
    const { editable } = this;
    const document = editable.ownerDocument;
    const window = document.defaultView;

    window?.addEventListener('pointerdown', this.onPointerDown, true);
    editable.addEventListener('mousedown', this.onPress, true);
    editable.addEventListener('touchstart', this.onPress, true);
    for (const type of RELEASES) {
      document.addEventListener(type, this.onRelease, true);
    }
    document.addEventListener('visibilitychange', this.onRelease, true);
    window?.addEventListener('blur', this.onRelease, true);
    this.detachGestureListeners = () => {
      window?.removeEventListener('pointerdown', this.onPointerDown, true);
      editable.removeEventListener('mousedown', this.onPress, true);
      editable.removeEventListener('touchstart', this.onPress, true);
      for (const type of RELEASES) {
        document.removeEventListener(type, this.onRelease, true);
      }
      document.removeEventListener('visibilitychange', this.onRelease, true);
      window?.removeEventListener('blur', this.onRelease, true);
    };
  }

  decide(
    sink: SelectionImportSink,
    probe?: TreeSelection
  ): SelectionImportDecision {
    if (!this.peers) return LONE;

    const { gesture, tree, view } = this;

    SelectionClaims.endNoteTurn(tree);

    const shown = probe ?? readTreeSelection(tree);
    const record = readDOMSelectionRecord(tree);
    const shownIsRecord = sameAs(shown, record);
    // The browser's change on a release can reach this decision before its
    // selectionchange, so it arrives here.
    const arrived =
      !!gesture &&
      !this.observation &&
      !shownIsRecord &&
      (!!probe || !this.readsHost(tree));

    if (arrived) {
      this.observation = {
        points: shown,
        receipt: gesture.receipt,
        textsAtArrival: textsOf(shown),
      };
    }

    const { observation } = this;
    const holder = holdsCaret(view);
    const drop = (
      verdict: 'clear' | 'kept' | 'veto',
      { rejudged = false } = {}
    ) => {
      if (this.gesture && !rejudged) {
        this.gesture.exportsOnClose = verdict !== 'clear';
      }
      this.consume(shown);

      return { verdict };
    };

    const current =
      arrived ||
      (!!observation &&
        (observation.points === 'unread'
          ? isPoints(shown) && !shownIsRecord
          : sameSelection(shown, observation.points)));
    const overtookReadObservation =
      !!observation &&
      observation.points !== 'unread' &&
      !current &&
      placedSince(view, observation.receipt);

    if (
      shownIsRecord &&
      !(holder && record?.source === 'write') &&
      !overtookReadObservation
    ) {
      return drop('veto', { rejudged: record?.source === 'judged' });
    }
    if (holder || !getCaretOwner(view)) {
      return observation && placedSince(view, observation.receipt)
        ? drop('veto')
        : this.importing('sync', shown);
    }
    if (
      sink === 'disappear' &&
      shown === 'no-selection' &&
      observation?.points === 'no-selection' &&
      this.rangeReceipt !== null &&
      !placedSince(view, this.rangeReceipt)
    ) {
      return drop('clear');
    }
    if (sink === 'place' && observation) {
      if (
        current &&
        !placedSince(view, observation.receipt) &&
        this.anchoredHere(shown)
      ) {
        return this.importing('claim', shown);
      }
      if (placedSince(view, observation.receipt)) {
        const kept = this.keepOvertakenSelection(
          current ? shown : observation.points,
          observation
        );
        const decision = drop(kept ? 'kept' : 'veto');

        if (kept && !gesture) this.exportSelection();

        return decision;
      }
    }
    this.rangeReceipt = null;

    return { verdict: 'veto' };
  }

  private importing(
    verdict: 'claim' | 'sync',
    shown: TreeSelection
  ): SelectionImportDecision {
    return {
      verdict,
      write: (writer) => {
        const minted = nextMintedGeneration(this.view);

        writer();
        if (getPlacementGeneration(this.view) < minted) return;
        this.lastImport = { generation: minted, points: shown };
        if (this.gesture) {
          this.gesture.receipt = minted;
          this.gesture.exportsOnClose = false;
        }
        this.consume(shown);
      },
    };
  }

  private consume(shown: TreeSelection) {
    this.rangeReceipt = null;
    this.observation = null;
    if (isPoints(shown) && this.anchoredHere(shown)) {
      recordDOMSelection(this.tree, shown, 'judged');
    }
    if (this.gesture?.settled) this.close(this.gesture);
  }

  mayRedraw(points: DOMSelectionPoints) {
    const { lastImport } = this;

    return (
      !this.peers ||
      (!!lastImport &&
        sameSelection(points, lastImport.points) &&
        !placedSince(this.view, lastImport.generation))
    );
  }

  private keepOvertakenSelection(
    points: Observation['points'],
    observation: Observation
  ) {
    const { view } = this;

    if (!isPoints(points)) return false;

    const [anchorText, focusText] = observation.textsAtArrival ?? [];

    if (
      observation.textsAtArrival &&
      (textOf(points.anchor[0]) !== anchorText ||
        textOf(points.focus[0]) !== focusText)
    ) {
      return false;
    }

    const inView = (node: Node) =>
      node.isConnected &&
      findDOMRootRuntime(node)?.rootRef.current === this.editable;

    if (!inView(points.anchor[0])) return false;

    const options = { exactMatch: false };
    const anchor = ReactEditor.resolvePoint(view, points.anchor, options);
    const focus = inView(points.focus[0])
      ? ReactEditor.resolvePoint(view, points.focus, options)
      : anchor;

    if (!anchor || !focus) return false;

    const stamp = keepBookmark(
      view,
      SelectionApi.text({ anchor, focus }),
      observation.receipt,
      this.gesture?.lastKeep ?? null
    );

    if (stamp === null) return false;
    if (this.gesture) this.gesture.lastKeep = stamp;

    return true;
  }
}

export const decideSelectionImport = (
  claims: SelectionClaims | null | undefined,
  sink: SelectionImportSink,
  probe?: TreeSelection
) => (claims ? claims.decide(sink, probe) : LONE);
