import {
  type EditorUpdateOptions,
  type Operation,
  type Path,
  type Range,
  RangeApi,
  type RuntimeId,
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
  getEditableKernelTrace,
  recordEditableKernelTrace,
} from './editing-kernel';
import type { EditableInputController } from './input-state';
import {
  applyEditableCommand,
  applyModelOwnedHistoryIntent,
} from './mutation-controller';
import { getProjectedNativeAffordanceMatrix } from './projected-native-affordance';
import { Editor } from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';
import { readRuntimeSelection } from './runtime-selection-state';
import {
  executeEditableSelectionImport,
  setEditableModelSelectionPreference,
  syncEditableDOMSelectionToEditor,
  syncEditorSelectionFromDOM,
} from './selection-controller';

export type PliteBrowserHandle = {
  applyOperations: (
    operations: readonly Operation[],
    options?: EditorUpdateOptions
  ) => void;
  createRangeRef: (
    selection: Range,
    affinity?: 'forward' | 'backward' | 'outward' | 'inward'
  ) => string;
  deleteBackward: () => void;
  deleteForward: () => void;
  deleteFragment: () => void;
  clearSettledPendingNativeTextInputRepair: () => boolean;
  focus: () => void;
  getKernelTrace: () => unknown[];
  getHistory: () => unknown;
  getInputState: () => unknown;
  getLastCommit: () => unknown;
  getBlockText: (index: number) => string | null;
  getBlockTexts: () => string[];
  getDOMSelection: () => Range | null;
  getElementByPath: (path: Path) => HTMLElement | null;
  getPathByRuntimeId: (runtimeId: RuntimeId) => Path | null;
  getProjectedNativeAffordanceMatrix: () => unknown;
  getRuntimeId: (path: Path) => RuntimeId | null;
  getSelection: () => Range | null;
  getText: () => string;
  getViewSelection: () => unknown;
  importDOMSelection: () => Range | null;
  insertBreak: () => void;
  insertData: (payload: {
    html?: string | null;
    pliteFragment?: string | null;
    text?: string | null;
  }) => void;
  insertText: (text: string) => void;
  redo: () => void;
  resolveRangeRef: (id: string) => Range | null;
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
  unrefRangeRef: (id: string) => Range | null;
};

export type PliteBrowserHandleElement = HTMLDivElement & {
  __pliteBrowserHandle?: PliteBrowserHandle;
};

type RefBox<T> = {
  current: T;
};

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
  browserHandleRangeRefs,
  editor,
  element,
  inputController,
  applyInputRules,
  forceRender,
  flushPendingNativeTextInput,
  isPartialDOMBackedSelection,
  scrollPathIntoView,
  setExplicitPartialDOMBackedSelection,
}: {
  applyInputRules?: (input: {
    data: unknown;
    inputType: string;
    selection: Range | null;
  }) => boolean;
  browserHandleNextId: RefBox<number>;
  browserHandleRangeRefs: RefBox<
    Map<string, ReturnType<typeof Editor.rangeRef>>
  >;
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
  const getCurrentHandleElement = () =>
    (editor.api.dom.resolveDOMNode(
      editor
    ) as PliteBrowserHandleElement | null) ?? element;

  const refocusHandleElement = () => {
    const focusHandleElement = () => {
      getCurrentHandleElement().focus({ preventScroll: true });
    };

    focusHandleElement();
    queueMicrotask(focusHandleElement);
    setTimeout(focusHandleElement);
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

    setTimeout(() => {
      if (inputController.state.selectionChangeOrigin === 'browser-handle') {
        inputController.state.isUpdatingSelection = previousIsUpdatingSelection;
      }
    });
  };

  const handle: PliteBrowserHandle = {
    applyOperations: (operations, options) => {
      editor.update((tx) => {
        tx.operations.replay(operations, options);
      });
      forceRender();
    },
    createRangeRef: (selection, affinity) => {
      const id = String(browserHandleNextId.current++);
      const rangeRef = Editor.rangeRef(editor, selection, {
        affinity,
      });

      browserHandleRangeRefs.current.set(id, rangeRef);

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
      editor.api.dom.focus();
      forceRender();
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
            operations?: readonly Record<string, unknown>[];
            statePatches?: readonly unknown[];
          };

          return {
            operations:
              record.operations?.map((operation) => ({
                offset: operation.offset,
                path: operation.path,
                root: operation.root,
                text: operation.text,
                type: operation.type,
              })) ?? [],
            statePatchCount: record.statePatches?.length ?? 0,
          };
        };

        return {
          redos: history?.redos?.().map(summarizeBatch) ?? [],
          undos: history?.undos?.().map(summarizeBatch) ?? [],
        };
      }),
    getLastCommit: () => Editor.getLastCommit(editor),
    getElementByPath: (path) => getPliteNodeElementByPath(editor, path),
    getPathByRuntimeId: (runtimeId) =>
      Editor.getPathByRuntimeId(editor, runtimeId),
    getProjectedNativeAffordanceMatrix,
    getRuntimeId: (path) => Editor.getRuntimeId(editor, path),
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
      const snapshot = Editor.getSnapshot(editor);

      if (index < 0 || index >= snapshot.children.length) {
        return null;
      }

      return Editor.string(editor, [index]);
    },
    getBlockTexts: () =>
      Editor.getSnapshot(editor).children.map((_child, index) =>
        Editor.string(editor, [index])
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
    getText: () => Editor.string(editor, []),
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
      if (
        applyInputRules?.({
          data: text,
          inputType: 'insertText',
          selection,
        })
      ) {
        return;
      }

      const path = selection ? RangeApi.start(selection).path : null;
      runCommand({ kind: 'insert-text', text });
      if (!path || !didSyncTextPathToDOM(editor, path)) {
        forceRender();
      }
    },
    redo: () => {
      if (!applyModelOwnedHistoryIntent({ direction: 'redo', editor })) {
        return;
      }

      forceRender();
      refocusHandleElement();
    },
    resolveRangeRef: (id) => {
      const rangeRef = browserHandleRangeRefs.current.get(id);
      const selection = rangeRef?.current ?? null;

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
      editor.update((tx) => {
        tx.selection.set(selection);
      });
      setExplicitPartialDOMBackedSelection(partialDOMBackedSelection);
      if (partialDOMBackedSelection) {
        scrollPathIntoView?.(RangeApi.start(selection).path, 'center');
      }
      editor.api.dom.focus();
      const syncDOMSelection = () => {
        syncEditableDOMSelectionToEditor({
          editor,
          scrollSelectionIntoView: () => {},
          partialDOMBackedSelection,
          state: inputController.state,
        });
      };

      syncDOMSelection();
      queueMicrotask(syncDOMSelection);
      setTimeout(syncDOMSelection);
      setTimeout(() => {
        if (inputController.state.selectionChangeOrigin === 'browser-handle') {
          inputController.state.isUpdatingSelection =
            previousIsUpdatingSelection;
        }
      });
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

      forceRender();
      refocusHandleElement();
    },
    unrefRangeRef: (id) => {
      const rangeRef = browserHandleRangeRefs.current.get(id);

      if (!rangeRef) {
        return null;
      }

      browserHandleRangeRefs.current.delete(id);

      const selection = rangeRef.unref();

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
