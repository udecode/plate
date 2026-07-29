import {
  type Anchor,
  DocumentChange,
  type EditorUpdatePolicyFor,
  type JsonEditorValue,
  type Path,
  type Point,
  type Range,
  RangeApi,
  type RuntimeId,
  type TextSelection,
} from '@platejs/plite';
import type { EditableDOMStrategyScrollAlign } from '../components/editable';
import {
  didSyncTextPathToDOM,
  getPliteNodeElementByPath,
} from '../hooks/use-plite-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  createPliteViewBoundaryGraph,
  type PliteViewBoundaryGraphNodeInput,
  type PliteViewBoundaryPoint,
} from '../view-boundary-graph';
import {
  createPliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  beginEditableEventFrame,
  type EditableCommand,
  type EditableKernelTraceEntry,
  getEditableKernelTrace,
  recordEditableKernelTrace,
} from './editing-kernel';
import type { DOMPhaseScheduler } from '@platejs/plite-dom/internal';
import type { EditableInputController } from './input-state';
import {
  applyEditableCommand,
  applyModelOwnedHistoryIntent,
  shouldForceRenderAfterModelOwnedHistory,
} from './mutation-controller';
import { getProjectedNativeAffordanceMatrix } from './projected-native-affordance';
import {
  deleteFragment as editorDeleteFragment,
  getLastCommit as editorGetLastCommit,
  getPathByRuntimeId as editorGetPathByRuntimeId,
  getRuntimeId as editorGetRuntimeId,
  getSelection as editorGetSelection,
  getEditorSelectionRoot,
  getInternalDocumentChangeRootKeys,
  getSnapshot as editorGetSnapshot,
  insertText as editorInsertText,
  string as editorString,
  toInternalRoot,
} from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';
import { writeRuntimeSelection } from './runtime-mutation-state';
import { readRuntimeSelection } from './runtime-selection-state';
import {
  executeEditableSelectionImport,
  setEditableModelSelectionPreference,
  syncEditableDOMSelectionToEditor,
  syncEditorSelectionFromDOM,
} from './selection-controller';

export type PliteBrowserHandle = {
  applyChange: (
    change: ReturnType<DocumentChange['toJSON']>,
    policy?: EditorUpdatePolicyFor<ReactRuntimeEditor>
  ) => void;
  applyValueChange: (
    value: JsonEditorValue,
    policy?: EditorUpdatePolicyFor<ReactRuntimeEditor>
  ) => void;
  createRangeAnchor: (
    selection: Range,
    association?: 'forward' | 'backward' | 'outward' | 'inward'
  ) => string;
  deleteBackward: () => void;
  deleteForward: () => void;
  deleteFragment: () => void;
  deleteTextAt: (
    range: Range,
    policy?: EditorUpdatePolicyFor<ReactRuntimeEditor>
  ) => void;
  clearSettledPendingNativeTextInputRepair: () => boolean;
  focus: () => void;
  getKernelTrace: () => readonly EditableKernelTraceEntry[];
  getHistory: () => unknown;
  getInputState: () => unknown;
  getLastCommit: () => unknown;
  getBlockText: (index: number) => string | null;
  getBlockTexts: () => string[];
  getDOMSelection: () => Range | null;
  getDOMPhaseSchedulerDiagnostics: () => ReturnType<
    DOMPhaseScheduler['diagnostics']
  > | null;
  getElementByPath: (path: Path) => HTMLElement | null;
  getPathByRuntimeId: (runtimeId: RuntimeId) => Path | null;
  getProjectedNativeAffordanceMatrix: () => unknown;
  getRuntimeId: (path: Path) => RuntimeId | null;
  getSelection: () => TextSelection | null;
  getText: () => string;
  getValue: () => JsonEditorValue;
  getViewSelection: () => unknown;
  importDOMSelection: () => Range | null;
  insertBreak: () => void;
  insertData: (payload: {
    html?: string | null;
    pliteFragment?: string | null;
    text?: string | null;
  }) => void;
  insertText: (text: string) => void;
  insertTextAt: (
    text: string,
    at: Point,
    policy?: EditorUpdatePolicyFor<ReactRuntimeEditor>
  ) => void;
  redo: () => void;
  resolveRangeAnchor: (id: string) => TextSelection | null;
  selectAll: () => void;
  selectRange: (selection: Range) => void;
  setNativeDOMSelection: (selection: Range) => boolean;
  scrollPathIntoView: (
    path: Path,
    align?: EditableDOMStrategyScrollAlign
  ) => boolean;
  setViewSelection: (
    selection: {
      anchor: PliteViewBoundaryPoint;
      focus: PliteViewBoundaryPoint;
      graph: readonly PliteViewBoundaryGraphNodeInput[];
    } | null
  ) => void;
  undo: () => void;
  releaseRangeAnchor: (id: string) => TextSelection | null;
};

export type PliteBrowserHandleElement = HTMLDivElement & {
  __pliteBrowserHandle?: PliteBrowserHandle;
};

type RefBox<T> = {
  current: T;
};

const getPublicDocumentChangeRoots = (change: DocumentChange) => [
  ...getInternalDocumentChangeRootKeys(change).map((root) =>
    root === 'main' ? null : root
  ),
  ...change.createRoots,
  ...change.deleteRoots,
];

const createBrowserHandleDataTransfer = ({
  html,
  pliteFragment,
  text,
}: {
  html?: string | null;
  pliteFragment?: string | null;
  text?: string | null;
}): DataTransfer => {
  const records = new Map<string, string>();

  if (html) {
    records.set('text/html', html);
  }
  if (text) {
    records.set('text/plain', text);
  }
  if (pliteFragment) {
    records.set('application/x-plite-fragment', pliteFragment);
  }

  return {
    clearData: (format?: string) => {
      if (format) {
        records.delete(format);
      } else {
        records.clear();
      }
    },
    dropEffect: 'none',
    effectAllowed: 'all',
    files: [] as unknown as FileList,
    getData: (format: string) => records.get(format) ?? '',
    get types() {
      return [...records.keys()];
    },
    items: [] as unknown as DataTransferItemList,
    setData: (format: string, value: string) => {
      records.set(format, value);
    },
    setDragImage: () => {},
  } as unknown as DataTransfer;
};

export const attachPliteBrowserHandle = ({
  browserHandleNextId,
  browserHandleRangeAnchors,
  domPhaseScheduler,
  editor,
  element,
  inputController,
  forceRender,
  flushPendingNativeTextInput,
  isPartialDOMBackedSelection,
  scrollPathIntoView,
  setExplicitPartialDOMBackedSelection,
}: {
  browserHandleNextId: RefBox<number>;
  browserHandleRangeAnchors: RefBox<Map<string, Anchor<Range>>>;
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  element: PliteBrowserHandleElement;
  inputController: EditableInputController;
  forceRender: () => void;
  flushPendingNativeTextInput?: () => void;
  isPartialDOMBackedSelection: (selection: Range | null) => boolean;
  scrollPathIntoView?: (
    path: Path,
    align?: EditableDOMStrategyScrollAlign
  ) => boolean;
  setExplicitPartialDOMBackedSelection: (nextValue: boolean) => void;
}) => {
  const getCurrentHandleElement = () => {
    if (element.isConnected) return element;

    return (
      (editor.api.dom.resolveDOMNode(
        editor
      ) as PliteBrowserHandleElement | null) ?? element
    );
  };

  const refocusHandleElement = () => {
    const focusHandleElement = () => {
      getCurrentHandleElement().focus({ preventScroll: true });
    };

    focusHandleElement();
    domPhaseScheduler.schedule(
      'dom-write',
      'focus-browser-handle-microtask',
      focusHandleElement,
      { timing: 'microtask' }
    );
    domPhaseScheduler.schedule(
      'dom-write',
      'focus-browser-handle-timeout',
      focusHandleElement,
      { timing: 'timeout' }
    );
  };
  const runCommand = (
    command: EditableCommand,
    { forceRenderAfter = true }: { forceRenderAfter?: boolean } = {}
  ) => {
    const previousIsUpdatingSelection =
      inputController.state.isUpdatingSelection;

    flushPendingNativeTextInput?.();
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      reason: 'browser-handle',
      selectionSource: 'model-owned',
    });
    inputController.state.isUpdatingSelection = true;
    inputController.state.selectionChangeOrigin = 'browser-handle';

    const selectionBefore = readRuntimeSelection(editor);
    beginEditableEventFrame(editor, {
      eventFamily: 'repair',
      focusOwner: 'editor',
      inputIntent: null,
      modelSelectionBefore: selectionBefore,
      selectionSource: 'model-owned',
      targetOwner: 'editor',
    });

    applyEditableCommand({ command, editor });
    const selectionAfter = readRuntimeSelection(editor);
    const partialDOMBackedSelection =
      isPartialDOMBackedSelection(selectionAfter);

    if (partialDOMBackedSelection) {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        reason: 'partial-dom-backed',
        selectionSource: 'partial-dom-backed',
      });
    }
    setExplicitPartialDOMBackedSelection(partialDOMBackedSelection);
    syncEditableDOMSelectionToEditor({
      editor,
      editorElement: getCurrentHandleElement(),
      options: { forceModelExport: true },
      scrollSelectionIntoView: () => {},
      partialDOMBackedSelection,
      state: inputController.state,
    });
    refocusHandleElement();
    recordEditableKernelTrace({
      editor,
      trace: {
        command,
        eventFamily: 'repair',
        intent: null,
        nativeAllowed: false,
        ownership: 'model-owned',
        repair: null,
        selectionChangeOrigin: 'browser-handle',
        selectionAfter,
        selectionBefore,
        selectionSource: partialDOMBackedSelection
          ? 'partial-dom-backed'
          : 'model-owned',
        stateAfter: 'model-owned',
        stateBefore: 'model-owned',
        targetOwner: 'editor',
      },
    });

    if (forceRenderAfter) {
      forceRender();
    }

    const clearBrowserHandleSelectionUpdate = () => {
      if (inputController.state.selectionChangeOrigin === 'browser-handle') {
        inputController.state.isUpdatingSelection = previousIsUpdatingSelection;
      }
    };

    domPhaseScheduler.schedule(
      'selection-repair',
      'clear-browser-handle-selection-update',
      clearBrowserHandleSelectionUpdate,
      { timing: 'timeout' }
    );
  };

  const handle: PliteBrowserHandle = {
    applyChange: (change, policy) => {
      const documentChange = DocumentChange.fromJSON(change);

      if (policy) {
        editor.update(policy, (tx) => {
          tx.changes.apply(documentChange);
        });
      } else {
        editor.update((tx) => {
          tx.changes.apply(documentChange);
        });
      }
      forceRender();
    },
    applyValueChange: (value, policy) => {
      const documentChange = DocumentChange.between(editor.read.value(), value);

      if (policy) {
        editor.update(policy, (tx) => {
          tx.changes.apply(documentChange);
        });
      } else {
        editor.update((tx) => {
          tx.changes.apply(documentChange);
        });
      }
      forceRender();
    },
    createRangeAnchor: (selection, association) => {
      const id = String(browserHandleNextId.current++);
      const rangeAnchor = editor.anchor(selection, {
        association,
        deletion: 'nearest',
      });

      browserHandleRangeAnchors.current.set(id, rangeAnchor);

      return id;
    },
    deleteBackward: () => {
      runCommand({ direction: 'backward', kind: 'delete' });
    },
    deleteForward: () => {
      runCommand({ direction: 'forward', kind: 'delete' });
    },
    deleteFragment: () => {
      runCommand({ kind: 'delete-fragment' });
    },
    deleteTextAt: (range, policy) => {
      if (policy) {
        editor.update(policy, () =>
          editorDeleteFragment(editor, { at: range })
        );
      } else {
        editorDeleteFragment(editor, { at: range });
      }
      forceRender();
    },
    clearSettledPendingNativeTextInputRepair: () => {
      const pathKey = inputController.state.pendingNativeTextInputRepairPathKey;
      const offset = inputController.state.pendingNativeTextInputRepairOffset;

      if (!pathKey || offset == null) {
        return true;
      }

      const modelSelection = readRuntimeSelection(editor);

      if (
        !modelSelection ||
        !RangeApi.isCollapsed(modelSelection) ||
        modelSelection.anchor.path.join(',') !== pathKey ||
        modelSelection.anchor.offset !== offset
      ) {
        return false;
      }

      const root = ReactEditor.findDocumentOrShadowRoot(editor);
      const selection = 'getSelection' in root ? root.getSelection() : null;

      if (!selection || selection.rangeCount === 0) {
        return false;
      }

      const domRange = ReactEditor.resolvePliteRange(editor, selection, {
        exactMatch: false,
      });

      if (
        !domRange ||
        !RangeApi.isCollapsed(domRange) ||
        domRange.anchor.path.join(',') !== pathKey ||
        domRange.anchor.offset !== offset
      ) {
        return false;
      }

      const anchorNode = selection.anchorNode;
      const anchorElement =
        anchorNode && anchorNode.nodeType === Node.TEXT_NODE
          ? anchorNode.parentElement
          : anchorNode instanceof Element
            ? anchorNode
            : null;
      const textHost = anchorElement?.closest('[data-plite-node="text"]');
      const pliteText = readRuntimeText(editor, domRange.anchor.path)?.text;
      const domText = textHost?.textContent?.replace(/\uFEFF/g, '') ?? null;

      if (
        !textHost ||
        textHost.getAttribute('data-plite-path') !== pathKey ||
        pliteText == null ||
        domText !== pliteText
      ) {
        return false;
      }

      inputController.state.pendingNativeTextInputRepairOffset = null;
      inputController.state.pendingNativeTextInputRepairPathKey = null;

      return true;
    },
    focus: () => {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        reason: 'browser-handle',
        selectionSource: 'model-owned',
      });
      inputController.state.selectionChangeOrigin = 'browser-handle';
      const viewRoot = toInternalRoot(
        editor.read((state) => state.view.root())
      );

      if (
        !editorGetSelection(editor) ||
        getEditorSelectionRoot(editor) !== viewRoot
      ) {
        const point = editor.read((state) => state.points.start([]));

        if (point) writeRuntimeSelection(editor, point);
      }
      const editorElement = getCurrentHandleElement();

      editorElement.focus({ preventScroll: true });
      forceRender();
      const selection = readRuntimeSelection(editor);
      const partialDOMBackedSelection = isPartialDOMBackedSelection(selection);

      setExplicitPartialDOMBackedSelection(partialDOMBackedSelection);
      syncEditableDOMSelectionToEditor({
        editor,
        editorElement,
        options: { forceModelExport: true },
        scrollSelectionIntoView: () => {},
        partialDOMBackedSelection,
        state: inputController.state,
      });
    },
    getKernelTrace: () => [...getEditableKernelTrace(editor)],
    getHistory: () =>
      editor.read((state) => {
        const history = (
          state as {
            history?: {
              redos?: () => readonly unknown[];
              undos?: () => readonly unknown[];
            };
          }
        ).history;
        const summarizeBatch = (batch: unknown) => {
          const record = batch as {
            change?: DocumentChange;
            effects?: readonly unknown[];
          };

          return {
            change: record.change?.toJSON() ?? null,
            effectCount: record.effects?.length ?? 0,
            roots: record.change
              ? [...new Set(getPublicDocumentChangeRoots(record.change))]
              : [],
          };
        };

        return {
          redos: history?.redos?.().map(summarizeBatch) ?? [],
          undos: history?.undos?.().map(summarizeBatch) ?? [],
        };
      }),
    getLastCommit: () => {
      const commit = editorGetLastCommit(editor);

      if (!commit) return null;
      const changedRoots = [
        ...new Set(getPublicDocumentChangeRoots(commit.changes)),
      ];

      return {
        change: commit.changes.toJSON(),
        changedRoots,
        classifications: changedRoots.map((root) => ({
          document: commit.changed.has('document', root ?? undefined),
          properties: commit.changed.has('properties', root ?? undefined),
          root,
          structure: commit.changed.has('structure', root ?? undefined),
          text: commit.changed.has('text', root ?? undefined),
        })),
        effectCount: commit.effects.length,
        selectionAfter: commit.selectionAfter,
        selectionBefore: commit.selectionBefore,
        selectionChanged: commit.selectionChanged,
        tags: commit.tags,
        version: commit.version,
      };
    },
    getElementByPath: (path) => getPliteNodeElementByPath(editor, path),
    getPathByRuntimeId: (runtimeId) =>
      editorGetPathByRuntimeId(editor, runtimeId),
    getProjectedNativeAffordanceMatrix,
    getRuntimeId: (path) => editorGetRuntimeId(editor, path),
    getSelection: () => {
      const selection = readRuntimeSelection(editor);

      return selection
        ? {
            anchor: {
              offset: selection.anchor.offset,
              path: [...selection.anchor.path],
            },
            focus: {
              offset: selection.focus.offset,
              path: [...selection.focus.path],
            },
            kind: 'text',
          }
        : null;
    },
    getInputState: () => ({
      activeIntent: inputController.state.activeIntent,
      modelOwnedTextInputGuard:
        inputController.state.modelOwnedTextInputGuard ?? 0,
      modelSelectionPreference: inputController.state.modelSelectionPreference,
      pendingNativeTextInputRepairOffset:
        inputController.state.pendingNativeTextInputRepairOffset ?? null,
      pendingNativeTextInputRepairPathKey:
        inputController.state.pendingNativeTextInputRepairPathKey ?? null,
      preferModelSelection:
        inputController.preferModelSelectionForInputRef.current,
      recentTextInputRepairEcho:
        inputController.state.recentTextInputRepairEcho ?? null,
      selectionChangeOrigin: inputController.state.selectionChangeOrigin,
      selectionSource: inputController.state.selectionSource,
    }),
    getBlockText: (index) => {
      const snapshot = editorGetSnapshot(editor);

      if (index < 0 || index >= snapshot.children.length) {
        return null;
      }

      return editorString(editor, [index]);
    },
    getBlockTexts: () =>
      editorGetSnapshot(editor).children.map((_child, index) =>
        editorString(editor, [index])
      ),
    getDOMSelection: () => {
      const root = ReactEditor.findDocumentOrShadowRoot(editor);
      const selection = 'getSelection' in root ? root.getSelection() : null;

      if (!selection || selection.rangeCount === 0) {
        return null;
      }

      try {
        return ReactEditor.resolvePliteRange(editor, selection, {
          exactMatch: false,
        });
      } catch {
        return null;
      }
    },
    getDOMPhaseSchedulerDiagnostics: () =>
      domPhaseScheduler?.diagnostics() ?? null,
    getText: () => editorString(editor, []),
    getValue: () => editor.read((state) => state.value()) as JsonEditorValue,
    getViewSelection: () => readPliteViewSelection(editor),
    importDOMSelection: () => {
      flushPendingNativeTextInput?.();
      const selectionBefore = readRuntimeSelection(editor);

      executeEditableSelectionImport({
        importSelection: () => {
          setEditableModelSelectionPreference({
            inputController,
            preferModelSelection: false,
            selectionSource: 'dom-current',
          });
          writePliteViewSelection(editor, null);
          inputController.state.isUpdatingSelection = false;
          inputController.state.selectionChangeOrigin = 'native-user';
          syncEditorSelectionFromDOM({
            editor,
            ignoreModelSelectionPreference: true,
            inputController,
          });
        },
        selectionPolicy: { kind: 'import-dom', reason: 'unknown-selection' },
      });

      const selectionAfter = readRuntimeSelection(editor);

      recordEditableKernelTrace({
        editor,
        trace: {
          command: null,
          eventFamily: 'selectionchange',
          intent: null,
          nativeAllowed: true,
          ownership: 'native-allowed',
          repair: null,
          selectionChangeOrigin: 'browser-handle',
          selectionAfter,
          selectionBefore,
          selectionPolicy: { kind: 'import-dom', reason: 'unknown-selection' },
          selectionSource: inputController.state.selectionSource,
          stateAfter: 'dom-selection',
          stateBefore: 'idle',
          targetOwner: 'editor',
        },
      });

      return selectionAfter;
    },
    insertBreak: () => {
      runCommand({ kind: 'insert-break', variant: 'paragraph' });
    },
    insertData: ({ html, pliteFragment, text }) => {
      const data = createBrowserHandleDataTransfer({
        html,
        pliteFragment,
        text,
      });
      runCommand({ data, kind: 'insert-data' });
    },
    insertText: (text) => {
      const selection = readRuntimeSelection(editor);
      const path = selection ? RangeApi.start(selection).path : null;
      runCommand({ kind: 'insert-text', text });
      if (!path || !didSyncTextPathToDOM(editor, path)) {
        forceRender();
      }
    },
    insertTextAt: (text, at, policy) => {
      if (policy) {
        editor.update(policy, () => editorInsertText(editor, text, { at }));
      } else {
        editorInsertText(editor, text, { at });
      }
      forceRender();
    },
    redo: () => {
      if (!applyModelOwnedHistoryIntent({ direction: 'redo', editor })) {
        return;
      }

      if (shouldForceRenderAfterModelOwnedHistory(editor)) {
        forceRender();
      }
      refocusHandleElement();
    },
    resolveRangeAnchor: (id) => {
      const rangeAnchor = browserHandleRangeAnchors.current.get(id);
      const selection = rangeAnchor?.resolve() ?? null;

      return selection
        ? {
            anchor: {
              offset: selection.anchor.offset,
              path: [...selection.anchor.path],
            },
            focus: {
              offset: selection.focus.offset,
              path: [...selection.focus.path],
            },
            kind: 'text',
          }
        : null;
    },
    selectAll: () => {
      runCommand({ kind: 'select-all' });
    },
    selectRange: (selection) => {
      flushPendingNativeTextInput?.();
      const previousIsUpdatingSelection =
        inputController.state.isUpdatingSelection;
      const partialDOMBackedSelection = isPartialDOMBackedSelection(selection);
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        reason: 'browser-handle',
        selectionSource: 'model-owned',
      });
      inputController.state.isUpdatingSelection = true;
      inputController.state.selectionChangeOrigin = 'browser-handle';
      writePliteViewSelection(editor, null);
      writeRuntimeSelection(editor, selection);
      setExplicitPartialDOMBackedSelection(partialDOMBackedSelection);
      if (partialDOMBackedSelection) {
        scrollPathIntoView?.(RangeApi.start(selection).path, 'center');
      }
      getCurrentHandleElement().focus({ preventScroll: true });
      const syncDOMSelection = () => {
        syncEditableDOMSelectionToEditor({
          editor,
          editorElement: getCurrentHandleElement(),
          options: { forceModelExport: true },
          scrollSelectionIntoView: () => {},
          partialDOMBackedSelection,
          state: inputController.state,
        });
      };

      syncDOMSelection();
      const clearBrowserHandleSelectionUpdate = () => {
        if (inputController.state.selectionChangeOrigin === 'browser-handle') {
          inputController.state.isUpdatingSelection =
            previousIsUpdatingSelection;
        }
      };

      domPhaseScheduler.schedule(
        'selection-repair',
        'sync-browser-handle-selection-microtask',
        syncDOMSelection,
        { timing: 'microtask' }
      );
      domPhaseScheduler.schedule(
        'selection-repair',
        'sync-browser-handle-selection-timeout',
        syncDOMSelection,
        { timing: 'timeout' }
      );
      domPhaseScheduler.schedule(
        'selection-repair',
        'clear-browser-handle-selection-update',
        clearBrowserHandleSelectionUpdate,
        { timing: 'timeout' }
      );
    },
    setNativeDOMSelection: (selection) => {
      const domRange = editor.api.dom.resolveDOMRange(selection);

      if (!domRange) {
        return false;
      }

      const currentElement = getCurrentHandleElement();
      const rootNode = currentElement.getRootNode() as Document | ShadowRoot;
      const ShadowRootConstructor =
        currentElement.ownerDocument.defaultView?.ShadowRoot;
      const nativeSelection =
        'getSelection' in rootNode
          ? rootNode.getSelection()
          : currentElement.ownerDocument.getSelection();

      if (!nativeSelection) {
        return false;
      }

      currentElement.focus({ preventScroll: true });
      const documentSelection = currentElement.ownerDocument.getSelection();
      const selectionCandidates = [
        nativeSelection,
        documentSelection === nativeSelection ? null : documentSelection,
      ].filter((candidate): candidate is Selection => !!candidate);
      const applyNativeSelection = (candidate: Selection) => {
        candidate.removeAllRanges();

        if (
          RangeApi.isBackward(selection) &&
          !RangeApi.isCollapsed(selection)
        ) {
          const range = currentElement.ownerDocument.createRange();

          range.setStart(domRange.endContainer, domRange.endOffset);
          range.collapse(true);
          candidate.addRange(range);
          candidate.extend(domRange.startContainer, domRange.startOffset);
        } else {
          candidate.addRange(domRange);
        }

        return candidate.rangeCount > 0;
      };

      if (!selectionCandidates.some(applyNativeSelection)) {
        return false;
      }

      currentElement.ownerDocument.dispatchEvent(
        new Event('selectionchange', { bubbles: true })
      );

      if (ShadowRootConstructor && rootNode instanceof ShadowRootConstructor) {
        rootNode.dispatchEvent(new Event('selectionchange', { bubbles: true }));
      }

      return true;
    },
    scrollPathIntoView: (path, align = 'center') =>
      scrollPathIntoView?.(path, align) ?? false,
    setViewSelection: (selection) => {
      writePliteViewSelection(
        editor,
        selection
          ? createPliteViewSelection(
              createPliteViewBoundaryGraph(selection.graph),
              {
                anchor: selection.anchor,
                focus: selection.focus,
              }
            )
          : null
      );
    },
    undo: () => {
      if (!applyModelOwnedHistoryIntent({ direction: 'undo', editor })) {
        return;
      }

      if (shouldForceRenderAfterModelOwnedHistory(editor)) {
        forceRender();
      }
      refocusHandleElement();
    },
    releaseRangeAnchor: (id) => {
      const rangeAnchor = browserHandleRangeAnchors.current.get(id);

      if (!rangeAnchor) {
        return null;
      }

      browserHandleRangeAnchors.current.delete(id);

      const selection = rangeAnchor.release();

      return selection
        ? {
            anchor: {
              offset: selection.anchor.offset,
              path: [...selection.anchor.path],
            },
            focus: {
              offset: selection.focus.offset,
              path: [...selection.focus.path],
            },
            kind: 'text',
          }
        : null;
    },
  };

  element.__pliteBrowserHandle = handle;

  return () => {
    if (element.__pliteBrowserHandle === handle) {
      element.__pliteBrowserHandle = undefined;
    }
  };
};
