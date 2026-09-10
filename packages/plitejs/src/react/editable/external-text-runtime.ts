import {
  type EditorCommit,
  type NodeKey,
  PathApi,
  PointApi,
  RangeApi,
  type Range,
  SelectionApi,
} from '../..';
import { createInternalDocumentChange } from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { RootChange } from '../../core/change/root-change';
import { projectEditorTextSplices } from '../../core/change/text-splices';
import { PreparedTokenSlice } from '../../core/change/tokens';
import { reportEditorLifecycleError } from '../../core/lifecycle-error';
import { IS_FOCUSED } from '../../dom/internal';
import type { PliteDecorationStore } from '../decoration-context';
import type { PliteDecorationSlice } from '../decoration-source';
import type {
  ExternalTextActions,
  ExternalTextAdapter,
  ExternalTextChange,
  ExternalTextDispatchResult,
  ExternalTextSelection,
  ExternalTextSelectionState,
  ExternalTextState,
  ExternalTextView,
} from '../external-text';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import {
  failTextProjectionConflict,
  readExternalTextBinding,
} from './external-text-binding';
import { getNativeTextInputUpdateTags } from './input-history';
import { registerExternalTextHost } from './interaction-owner';
import {
  applyModelOwnedHistoryIntent,
  consumeModelOwnedHistoryFocusRoot,
} from './mutation-history';
import {
  getSnapshot,
  setEditorFocused,
  toInternalRoot,
} from './runtime-editor-api';
import { writeRuntimeSelection } from './runtime-mutation-state';

type Binding = NonNullable<ReturnType<typeof readExternalTextBinding>>;
type Entry = {
  active: boolean;
  adapter: ExternalTextAdapter<unknown>;
  ariaLabel: string | null;
  disposeCoverage: (() => void) | null;
  disposeHost: (() => void) | null;
  composing: boolean;
  compositionStarted: boolean;
  historyBoundary: boolean;
  config: unknown;
  elementKey: NodeKey;
  host: HTMLElement;
  invalid: boolean;
  inCallback: boolean;
  origin: {
    changes: readonly ExternalTextChange[];
    selection: ExternalTextSelection;
  } | null;
  state: ExternalTextState<unknown>;
  textKey: NodeKey;
  view: ExternalTextView<unknown> | null;
};

const EMPTY = Object.freeze([]);
const DECORATIONS = new WeakMap<
  readonly PliteDecorationSlice[],
  readonly PliteDecorationSlice[]
>();
const externalDecorations = (bucket: readonly PliteDecorationSlice[]) => {
  if (bucket.length === 0) return EMPTY;
  let result = DECORATIONS.get(bucket);
  if (!result) {
    const isSelection = (decoration: PliteDecorationSlice) =>
      'data-plite-view-selection' in decoration.attributes ||
      'data-plite-inactive-selection' in decoration.attributes;
    result = bucket.some(isSelection)
      ? Object.freeze(bucket.filter((decoration) => !isSelection(decoration)))
      : bucket;
    if (result.length === 0) result = EMPTY;
    DECORATIONS.set(bucket, result);
  }
  return result;
};
const APPLIED = Object.freeze({ status: 'applied' } as const);
const READ_ONLY = Object.freeze({ status: 'read-only' } as const);
const STALE = Object.freeze({ status: 'stale' } as const);
const IGNORED_REGISTRATION = Object.freeze({
  destroy: () => undefined,
  update: () => undefined,
});
const sameSelection = (
  a: ExternalTextSelectionState | null,
  b: ExternalTextSelectionState | null
) =>
  a === b ||
  !!(
    a &&
    b &&
    a.anchor === b.anchor &&
    a.focus === b.focus &&
    a.mode === b.mode
  );
const sameChanges = (
  a: readonly ExternalTextChange[],
  b: readonly ExternalTextChange[]
) =>
  a.length === b.length &&
  a.every((change, index) => {
    const other = b[index];
    return (
      change.from === other.from &&
      change.to === other.to &&
      change.insert === other.insert
    );
  });
const validSelection = (selection: ExternalTextSelection, length: number) =>
  selection &&
  [selection.anchor, selection.focus].every(
    (offset) => Number.isSafeInteger(offset) && offset >= 0 && offset <= length
  );

const normalizeChanges = (
  changes: readonly ExternalTextChange[],
  length: number
) => {
  const result: ExternalTextChange[] = [];
  let previousTo = 0;
  let afterLength = length;
  for (const change of changes) {
    if (
      !change ||
      !Number.isSafeInteger(change.from) ||
      !Number.isSafeInteger(change.to) ||
      change.from < previousTo ||
      change.to < change.from ||
      change.to > length ||
      typeof change.insert !== 'string'
    ) {
      return null;
    }
    previousTo = change.to;
    afterLength += change.insert.length - (change.to - change.from);
    if (change.from === change.to && change.insert.length === 0) continue;
    const previous = result.at(-1);
    if (previous?.to === change.from) {
      result[result.length - 1] = {
        from: previous.from,
        to: change.to,
        insert: previous.insert + change.insert,
      };
    } else {
      result.push({ from: change.from, to: change.to, insert: change.insert });
    }
  }
  return { changes: result, length: afterLength };
};

/** One registry per Editable. Its caller owns the existing commit/decorations listeners. */
export class ExternalTextRuntime {
  private readonly entries = new Map<NodeKey, Entry>();
  private readonly byText = new Map<NodeKey, Entry>();
  private projectionSnapshot: {
    root: Element;
    projections: Map<string, HTMLElement[]>;
    native: Set<string>;
  } | null = null;
  private decorations: PliteDecorationStore | null = null;
  private focused: Entry | null = null;
  private readonly counters = {
    validationVisits: 0,
    callbackFailures: 0,
    canonicalCodeUnits: 0,
    decorationUpdates: 0,
    destroyedViews: 0,
    mountedViews: 0,
    patches: 0,
    resets: 0,
    staleWrites: 0,
    updates: 0,
    visitedChangeSections: 0,
    visitedEntries: 0,
    visitedNodeKeys: 0,
    projectedInsertedCodeUnits: 0,
  };

  private readonly runtime: EditableDOMRuntime;

  constructor(runtime: EditableDOMRuntime) {
    this.runtime = runtime;
  }

  metrics() {
    return { ...this.counters, viewCount: this.entries.size };
  }

  invalidateProjections() {
    this.projectionSnapshot = null;
  }

  assertNativeProjection(nodeKey: NodeKey) {
    if (this.retains(nodeKey)) failTextProjectionConflict();
  }

  register<TConfig>({
    adapter,
    config,
    elementKey,
    host,
  }: {
    adapter: ExternalTextAdapter<TConfig>;
    config: TConfig;
    elementKey: NodeKey;
    host: HTMLElement;
  }) {
    const binding = readExternalTextBinding(this.runtime.editor, elementKey);
    if (!binding) {
      throw new Error('Plite externalText cannot mount a detached element.');
    }
    if (this.entries.has(elementKey)) {
      throw new Error(
        'Plite permits only one external text projection per element in each Editable.'
      );
    }
    const root = host.closest('[data-plite-editor="true"]');
    if (!root) failTextProjectionConflict();
    if (!this.projectionSnapshot || this.projectionSnapshot.root !== root) {
      const projections = new Map<string, HTMLElement[]>();
      const native = new Set<string>();
      for (const projection of root.querySelectorAll<HTMLElement>(
        '[data-plite-external-text-path]'
      )) {
        this.counters.validationVisits += 1;
        const path = projection.dataset.pliteExternalTextPath ?? '';
        const siblings = projections.get(path);
        if (siblings) siblings.push(projection);
        else projections.set(path, [projection]);
      }
      for (const text of root.querySelectorAll<HTMLElement>(
        '[data-plite-node="text"][data-plite-node-key]'
      )) {
        this.counters.validationVisits += 1;
        native.add(text.dataset.pliteNodeKey ?? '');
      }
      this.projectionSnapshot = { root, projections, native };
    }
    const projections =
      this.projectionSnapshot.projections.get(binding.path.join(',')) ?? [];
    const nativeText = this.projectionSnapshot.native.has(binding.textKey);

    if (projections.length > 1 && projections[0] !== host) {
      return IGNORED_REGISTRATION;
    }
    if (projections.length !== 1 || nativeText) {
      failTextProjectionConflict();
    }
    const entry: Entry = {
      active: true,
      adapter: adapter as ExternalTextAdapter<unknown>,
      ariaLabel: host.getAttribute('aria-label'),
      disposeCoverage: null,
      disposeHost: null,
      composing: false,
      compositionStarted: false,
      historyBoundary: false,
      config,
      elementKey,
      host,
      invalid: false,
      inCallback: false,
      origin: null,
      state: null as unknown as ExternalTextState<unknown>,
      textKey: binding.textKey,
      view: null,
    };
    entry.state = this.readState(entry, binding);
    this.entries.set(elementKey, entry);
    this.byText.set(entry.textKey, entry);
    this.counters.mountedViews += 1;
    this.counters.canonicalCodeUnits += entry.state.text.length;
    entry.disposeHost = registerExternalTextHost(host, {
      root: () => this.runtime.rootElement,
      focus: () => this.focusChanged(entry, true),
      blur: () => this.focusChanged(entry, false),
    });
    this.registerCoverage(entry, binding);
    this.call(entry, 'mount', () => {
      entry.view = entry.adapter.mount({
        actions: this.actions(entry),
        host,
        state: entry.state,
      });
      if (
        !entry.view ||
        !['destroy', 'focus', 'update'].every(
          (key) =>
            typeof entry.view?.[key as keyof ExternalTextView<unknown>] ===
            'function'
        )
      ) {
        throw new Error(
          'Plite external text adapter must return destroy, focus, and update.'
        );
      }
    });
    return {
      destroy: () => this.remove(entry),
      update: (nextConfig: TConfig) => {
        const ariaLabel = host.getAttribute('aria-label');
        const labelChanged = ariaLabel !== entry.ariaLabel;
        if (entry.config === nextConfig && !labelChanged) return;
        entry.ariaLabel = ariaLabel;
        entry.config = nextConfig;
        this.refresh(entry, false, labelChanged);
      },
    };
  }

  setDecorationStore(store: PliteDecorationStore | null) {
    if (this.decorations === store) return;
    this.decorations = store;
    for (const entry of this.entries.values()) {
      if (
        externalDecorations(store?.getNodeSnapshot(entry.textKey) ?? EMPTY) !==
        entry.state.decorations
      ) {
        this.refresh(entry);
      }
    }
  }

  refreshAll() {
    for (const entry of this.entries.values()) this.refresh(entry);
  }

  retains(textKey: NodeKey) {
    const entry = this.byText.get(textKey);
    return !!entry?.active && !entry.invalid && !!entry.view;
  }

  commit(commit: EditorCommit) {
    if (this.entries.size === 0) return;
    const { editor } = this.runtime;
    const root = editor.read((state) => state.view.root());
    const affected = new Set<Entry>();
    for (const kind of [
      'text',
      'node',
      'selection',
      'path',
      'presence',
    ] as const) {
      for (const key of commit.changed.nodeKeys(kind, root)) {
        this.counters.visitedNodeKeys += 1;
        const entry = this.byText.get(key) ?? this.entries.get(key);
        if (entry) affected.add(entry);
      }
    }
    if (commit.changed.hasAny('state')) {
      for (const entry of this.entries.values()) affected.add(entry);
    }
    if (affected.size === 0) return;
    const projection = projectEditorTextSplices(commit, toInternalRoot(root));
    this.counters.visitedChangeSections += projection.visitedSections;
    this.counters.projectedInsertedCodeUnits += projection.insertedCodeUnits;
    for (const entry of affected) {
      this.counters.visitedEntries += 1;
      let binding: Binding | null;
      try {
        binding = readExternalTextBinding(editor, entry.elementKey);
      } catch {
        this.remove(entry);
        continue;
      }
      if (!binding) {
        this.remove(entry);
        continue;
      }
      let changes = projection.changes.get(binding.textKey) ?? EMPTY;
      const structural =
        projection.changes.get(binding.textKey) === null ||
        binding.textKey !== entry.textKey;
      if (binding.textKey !== entry.textKey) {
        this.byText.delete(entry.textKey);
        entry.textKey = binding.textKey;
        this.byText.set(entry.textKey, entry);
        this.registerCoverage(entry, binding);
      }
      let reset = structural || entry.invalid;
      if (entry.composing && !entry.origin && (changes.length > 0 || reset)) {
        this.endComposition(entry);
        reset = true;
      }
      const state = this.readState(entry, binding);
      if (entry.origin) {
        reset ||=
          !sameChanges(changes, entry.origin.changes) ||
          !state.selection ||
          state.selection.anchor !== entry.origin.selection.anchor ||
          state.selection.focus !== entry.origin.selection.focus;
        if (!reset) changes = EMPTY;
      } else if (
        !reset &&
        changes.length === 0 &&
        state.text !== entry.state.text
      ) {
        reset = true;
      }
      this.deliver(entry, state, reset ? null : changes, !!entry.origin);
    }
  }

  decorationsChanged(keys: readonly NodeKey[]) {
    for (const key of keys) {
      const entry = this.byText.get(key);
      if (entry) {
        this.counters.decorationUpdates += 1;
        let binding: Binding | null;
        try {
          binding = readExternalTextBinding(
            this.runtime.editor,
            entry.elementKey
          );
        } catch {
          this.remove(entry);
          continue;
        }
        // A source can publish its mapped bucket before the commit fence delivers text.
        if (
          binding?.textKey === entry.textKey &&
          binding.text.text === entry.state.text
        ) {
          this.refresh(entry);
        }
      }
    }
  }

  focusSelection(options?: { edge?: 'end' | 'start'; x?: number }) {
    const snapshot = getSnapshot(this.runtime.editor);
    if (
      !RangeApi.isRange(snapshot.selection) ||
      toInternalRoot(SelectionApi.root(snapshot.selection)) !==
        toInternalRoot(this.runtime.editor.read.view.root())
    ) {
      return false;
    }
    const { anchor, focus } = snapshot.selection;
    if (!PathApi.equals(anchor.path, focus.path)) return false;
    const key = snapshot.index.keyAt(focus.path);
    const entry = key ? this.byText.get(key) : undefined;
    if (!entry?.view || entry.invalid) return false;
    // Focus can run from a commit listener before this view's source fence.
    if (entry.state.version !== snapshot.version) this.refresh(entry);
    if (!entry.view || entry.invalid) return false;
    const { view } = entry;
    const active = entry.host.ownerDocument.activeElement;
    if (!this.runtime.rootElement?.contains(active)) return false;
    if (
      !entry.host.contains(active) &&
      !this.call(entry, 'focus', () => view.focus(options))
    ) {
      return false;
    }
    if (!entry.host.contains(entry.host.ownerDocument.activeElement)) {
      return false;
    }
    this.focusChanged(entry, true);
    return !entry.invalid;
  }

  destroy() {
    this.invalidateProjections();
    for (const entry of [...this.entries.values()]) this.remove(entry);
  }

  private focusModelSelection(options?: {
    edge?: 'end' | 'start';
    x?: number;
  }) {
    this.runtime.rootElement?.focus({ preventScroll: true });
    if (!this.focusSelection(options)) {
      this.runtime.requestSelectionExportAfterDOMCommit();
    }
  }

  private registerCoverage(entry: Entry, binding: Binding) {
    entry.disposeCoverage?.();
    entry.disposeCoverage = this.runtime.domCoverage.registerBoundary({
      anchor: { type: 'owner' },
      boundaryId: `external-text:${entry.elementKey}`,
      copyPolicy: 'model',
      coveredPathRanges: [
        { anchor: binding.textPath, focus: binding.textPath },
      ],
      coveredRuntimeRanges: [{ anchor: entry.textKey, focus: entry.textKey }],
      findPolicy: 'custom',
      ownerNodeKey: entry.elementKey,
      ownerPath: binding.path,
      reason: 'external-text',
      selectionPolicy: 'model',
      state: 'intentionally-hidden',
      version: binding.snapshot.version,
    });
  }

  private readState(
    entry: Entry,
    binding: Binding
  ): ExternalTextState<unknown> {
    const { snapshot, text, textPath } = binding;
    let selection: ExternalTextSelectionState | null = null;
    if (
      RangeApi.isRange(snapshot.selection) &&
      toInternalRoot(SelectionApi.root(snapshot.selection)) ===
        toInternalRoot(this.runtime.editor.read.view.root())
    ) {
      const range = snapshot.selection;
      const local: Range = {
        anchor: { path: textPath, offset: 0 },
        focus: { path: textPath, offset: text.text.length },
      };
      const intersection = RangeApi.intersection(range, local);
      if (intersection) {
        const [start, end] = RangeApi.edges(intersection);
        const backward = RangeApi.isBackward(range);
        const whollyInside =
          PathApi.equals(range.anchor.path, textPath) &&
          PathApi.equals(range.focus.path, textPath);
        selection = Object.freeze({
          anchor: backward ? end.offset : start.offset,
          focus: backward ? start.offset : end.offset,
          mode:
            whollyInside &&
            this.focused === entry &&
            entry.host.contains(entry.host.ownerDocument.activeElement)
              ? 'native'
              : 'model',
        });
      }
    }
    const bucket = this.decorations?.getNodeSnapshot(binding.textKey) ?? EMPTY;
    return Object.freeze({
      config: entry.config,
      decorations: externalDecorations(bucket),
      readOnly: this.runtime.readOnly || binding.readOnly,
      selection,
      text: text.text,
      version: snapshot.version,
    });
  }

  private refresh(entry: Entry, reset = false, force = false) {
    if (!entry.active) return;
    let binding: Binding | null;
    try {
      binding = readExternalTextBinding(this.runtime.editor, entry.elementKey);
    } catch {
      this.remove(entry);
      return;
    }
    if (!binding) {
      this.remove(entry);
      return;
    }
    const state = this.readState(entry, binding);
    if (state.readOnly) this.endComposition(entry);
    this.deliver(
      entry,
      state,
      reset || entry.invalid || state.text !== entry.state.text ? null : EMPTY,
      force
    );
  }

  private deliver(
    entry: Entry,
    state: ExternalTextState<unknown>,
    changes: readonly ExternalTextChange[] | null,
    force = false
  ) {
    if (!entry.active || !entry.view) return false;
    const { view } = entry;
    if (changes === null || state.readOnly) this.endComposition(entry);
    const previous = entry.state;
    if (
      !force &&
      changes?.length === 0 &&
      state.text === previous.text &&
      state.config === previous.config &&
      state.readOnly === previous.readOnly &&
      state.decorations === previous.decorations &&
      sameSelection(state.selection, previous.selection)
    ) {
      return true;
    }
    if (changes === null) this.counters.resets += 1;
    else this.counters.patches += changes.length;
    this.counters.updates += 1;
    const accepted = this.call(entry, 'update', () =>
      view.update({ changes, state })
    );
    if (accepted) {
      this.counters.canonicalCodeUnits +=
        state.text.length - previous.text.length;
      entry.state = state;
      entry.invalid = false;
    }
    return accepted;
  }

  private call(
    entry: Entry,
    phase: 'mount' | 'update' | 'focus' | 'destroy',
    fn: () => void
  ) {
    const previous = entry.inCallback;
    entry.inCallback = true;
    try {
      fn();
      return true;
    } catch (error) {
      entry.invalid = true;
      this.counters.callbackFailures += 1;
      reportEditorLifecycleError({
        cause: error,
        editor: this.runtime.editor,
        source: 'external-text',
        phase,
      });
      return false;
    } finally {
      entry.inCallback = previous;
    }
  }

  private remove(entry: Entry) {
    this.invalidateProjections();
    if (!entry.active) return;
    entry.active = false;
    this.entries.delete(entry.elementKey);
    if (this.byText.get(entry.textKey) === entry) {
      this.byText.delete(entry.textKey);
    }
    this.counters.canonicalCodeUnits -= entry.state.text.length;
    this.counters.destroyedViews += 1;
    if (this.focused === entry) this.focused = null;
    this.endComposition(entry);
    if (entry.disposeHost) this.call(entry, 'destroy', entry.disposeHost);
    if (entry.disposeCoverage) {
      this.call(entry, 'destroy', entry.disposeCoverage);
    }
    entry.disposeHost = null;
    entry.disposeCoverage = null;
    const { view } = entry;
    if (view) this.call(entry, 'destroy', () => view.destroy());
    entry.view = null;
  }

  private focusChanged(entry: Entry, focused: boolean) {
    if (!entry.active) return;
    const previous = this.focused;
    this.focused = focused
      ? entry
      : this.focused === entry
        ? null
        : this.focused;
    if (previous === this.focused) {
      this.refresh(entry);
      return;
    }
    this.runtime.cancelSelectionChangeHandlers();
    if (this.focused) IS_FOCUSED.set(this.runtime.editor, true);
    else IS_FOCUSED.delete(this.runtime.editor);
    setEditorFocused(this.runtime.editor, this.focused !== null);
    if (previous && previous !== this.focused) this.refresh(previous);
    this.refresh(entry);
    this.runtime.publishFocusState();
  }

  private endComposition(entry: Entry) {
    if (!entry.composing) return;
    entry.composing = false;
    entry.compositionStarted = false;
    entry.historyBoundary = true;
    this.runtime.setComposing(false);
  }

  private stale(entry: Entry) {
    this.counters.staleWrites += 1;
    if (entry.active && !entry.inCallback) this.refresh(entry, true);
    return STALE;
  }

  private check(
    entry: Entry,
    version: number,
    write: boolean
  ): ExternalTextDispatchResult | null {
    if (
      !entry.active ||
      entry.inCallback ||
      !entry.view ||
      !entry.host.isConnected ||
      !this.runtime.rootElement?.contains(entry.host)
    ) {
      return this.stale(entry);
    }
    let binding: Binding | null;
    try {
      binding = readExternalTextBinding(this.runtime.editor, entry.elementKey);
    } catch {
      this.remove(entry);
      return this.stale(entry);
    }
    if (
      !binding ||
      binding.textKey !== entry.textKey ||
      binding.text.text !== entry.state.text ||
      entry.invalid ||
      version !== entry.state.version
    ) {
      return this.stale(entry);
    }
    if (write && (this.runtime.readOnly || binding.readOnly)) return READ_ONLY;
    return null;
  }

  private actions(entry: Entry): ExternalTextActions {
    return {
      composition: (phase) => {
        if (phase === 'end') {
          this.endComposition(entry);
          return;
        }
        if (phase !== 'start' || this.check(entry, entry.state.version, true)) {
          return;
        }
        entry.composing = true;
        entry.compositionStarted = true;
        this.runtime.setComposing(true);
      },
      dispatch: (input) => {
        const rejected = this.check(entry, input.baseVersion, true);
        if (rejected) return rejected;
        if (input.intent === 'composition' && !entry.composing) {
          return this.stale(entry);
        }
        const normalized = Array.isArray(input.changes)
          ? normalizeChanges(input.changes, entry.state.text.length)
          : null;
        if (
          !normalized ||
          !validSelection(input.selection, normalized.length) ||
          !['composition', 'cut', 'drop', 'input', 'paste'].includes(
            input.intent
          )
        ) {
          return this.stale(entry);
        }
        const binding = readExternalTextBinding(
          this.runtime.editor,
          entry.elementKey
        );
        if (!binding) return this.stale(entry);
        const document = DocumentIndex.fromValue(binding.snapshot.children);
        const start = document.positionAt({
          path: binding.textPath,
          offset: 0,
        });
        const root = toInternalRoot(
          this.runtime.editor.read((state) => state.view.root())
        );
        const change = createInternalDocumentChange(
          new Map([
            [
              root,
              RootChange.create(
                document,
                normalized.changes.map((patch) => ({
                  from: start + patch.from,
                  to: start + patch.to,
                  insert: PreparedTokenSlice.text(patch.insert),
                }))
              ),
            ],
          ])
        );
        const origin = {
          changes: normalized.changes,
          selection: { ...input.selection },
        };
        const { composing } = entry;
        entry.origin = origin;
        try {
          this.runtime.editor.update(
            {
              tags: [
                input.intent,
                ...(input.intent === 'input'
                  ? getNativeTextInputUpdateTags(this.runtime.editor, {
                      path: binding.textPath,
                      root,
                    })
                  : []),
                ...(entry.compositionStarted
                  ? ['composition-start', 'history-push']
                  : []),
                ...(input.intent === 'composition' && !entry.compositionStarted
                  ? ['history-merge']
                  : []),
                ...(entry.historyBoundary ||
                ['paste', 'cut', 'drop'].includes(input.intent)
                  ? ['history-push']
                  : []),
              ],
            },
            (tx) => {
              if (normalized.changes.length > 0) tx.changes.apply(change);
              tx.selection.set({
                anchor: {
                  path: binding.textPath,
                  offset: input.selection.anchor,
                },
                focus: {
                  path: binding.textPath,
                  offset: input.selection.focus,
                },
              });
            }
          );
          entry.compositionStarted = false;
          if (!composing || entry.composing) entry.historyBoundary = false;
        } catch (error) {
          this.refresh(entry, true);
          throw error;
        } finally {
          entry.origin = null;
        }
        return APPLIED;
      },
      select: ({ baseVersion, selection }) => {
        const rejected = this.check(entry, baseVersion, false);
        if (rejected) return rejected;
        if (!validSelection(selection, entry.state.text.length)) {
          return this.stale(entry);
        }
        const binding = readExternalTextBinding(
          this.runtime.editor,
          entry.elementKey
        );
        if (!binding) return this.stale(entry);
        writeRuntimeSelection(this.runtime.editor, {
          anchor: { path: binding.textPath, offset: selection.anchor },
          focus: { path: binding.textPath, offset: selection.focus },
        });
        return APPLIED;
      },
      history: (direction) => {
        if (
          !['redo', 'undo'].includes(direction) ||
          this.check(entry, entry.state.version, true)
        ) {
          return false;
        }
        const focused = entry.host.contains(
          entry.host.ownerDocument.activeElement
        );
        this.endComposition(entry);
        const applied = applyModelOwnedHistoryIntent({
          direction,
          editor: this.runtime.editor,
        });
        if (applied && focused) this.runtime.repairHistoryFocus();
        else consumeModelOwnedHistoryFocusRoot(this.runtime.editor);
        return applied;
      },
      navigateOut: ({ baseVersion, direction, extend, x }) => {
        const rejected = this.check(entry, baseVersion, false);
        if (rejected) return rejected;
        if (
          !['backward', 'forward'].includes(direction) ||
          (x !== undefined && !Number.isFinite(x))
        ) {
          return this.stale(entry);
        }
        const binding = readExternalTextBinding(
          this.runtime.editor,
          entry.elementKey
        );
        if (!binding) return this.stale(entry);
        const point = this.runtime.editor.read((state) =>
          direction === 'backward'
            ? state.points.before(binding.path)
            : state.points.after(binding.path)
        );
        if (!point) return APPLIED;
        const previous = this.runtime.editor.read.selection();
        writeRuntimeSelection(this.runtime.editor, {
          anchor: extend && previous ? previous.anchor : point,
          focus: point,
        });
        this.endComposition(entry);
        this.focusModelSelection({
          edge: direction === 'backward' ? 'end' : 'start',
          x,
        });
        return APPLIED;
      },
      deleteOut: ({ baseVersion, direction }) => {
        const rejected = this.check(entry, baseVersion, true);
        if (rejected) return rejected;
        if (!['backward', 'forward'].includes(direction)) {
          return this.stale(entry);
        }
        const binding = readExternalTextBinding(
          this.runtime.editor,
          entry.elementKey
        );
        if (!binding) return this.stale(entry);
        const point = {
          path: binding.textPath,
          offset: direction === 'backward' ? 0 : binding.text.text.length,
        };
        const selection = this.runtime.editor.read.selection();
        if (
          !selection ||
          !RangeApi.isCollapsed(selection) ||
          !PointApi.equals(selection.focus, point)
        ) {
          return this.stale(entry);
        }
        const focused = entry.host.contains(
          entry.host.ownerDocument.activeElement
        );
        this.endComposition(entry);
        this.runtime.editor.update((tx) => {
          if (direction === 'backward') tx.text.deleteBackward();
          else tx.text.deleteForward();
        });
        if (focused) this.focusModelSelection();
        return APPLIED;
      },
    };
  }
}
