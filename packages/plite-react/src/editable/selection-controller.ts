import type { RefObject } from 'react';
import {
  PathApi,
  PointApi,
  type Range,
  RangeApi,
  type Selection,
  type TargetFreshnessRequest,
} from '@platejs/plite';
import {
  containsShadowAware,
  type DOMRange,
  getSelection,
  IS_ANDROID,
  IS_WEBKIT,
  isDOMElement,
  isDOMNode,
  isDOMText,
} from '@platejs/plite-dom';
import {
  DOMCoverage,
  IS_FOCUSED,
  IS_NODE_MAP_DIRTY,
} from '@platejs/plite-dom/internal';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  createPliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  getPliteRootBoundaryPoint,
  rootPlitePoint,
} from '../view-boundary-graph';
import {
  type ContentRootOwner,
  createContentRootProjectionGraph,
  findContentRootOwners,
  isRangeAcrossContentRootOwners,
} from './content-root-owners';
import { applyDOMCoverageSelectionPolicy } from './dom-coverage-selection';
import type { EditableSelectionPolicy } from './editing-kernel';
import { createFastDOMSelectionRange } from './fast-dom-selection-range';
import type {
  EditableInputController,
  InputIntent,
  ModelSelectionPreferenceReason,
  SelectionChangeOrigin,
  SelectionSource,
} from './input-state';
import { isEditableOutsideFocusBoundarySettling } from './input-state';
import { readModelSelectionDOMPreference } from './model-selection-dom-preference';
import { Editor } from './runtime-editor-api';
import {
  readLiveSelection,
  readRuntimeSelection,
} from './runtime-selection-state';
import { resolveProjectedDOMSelection } from './selection-projected-dom';
import {
  shouldSkipDOMSelection,
  shouldSkipSelectionScroll,
} from './selection-side-effect-policy';

export type EditableSelectionController = {
  inputController: EditableInputController;
};

const MODEL_BACKED_FULL_DOCUMENT_CHILD_THRESHOLD = 1000;
const MODEL_OWNED_TEXT_INPUT_GUARD_MS = 100;

const getContentRootShellOwner = (
  owners: readonly ContentRootOwner[],
  root: string,
  point: Range['anchor']
) =>
  owners.find(
    (owner) =>
      owner.ownerRoot === root &&
      (PathApi.equals(owner.ownerPath, point.path) ||
        PathApi.isAncestor(owner.ownerPath, point.path))
  ) ?? null;

const getContentRootBoundaryPoint = (
  editor: ReactRuntimeEditor,
  owner: ContentRootOwner,
  edge: 'end' | 'start'
) =>
  editor.read((state) => {
    const point = getPliteRootBoundaryPoint(
      state.value.root(owner.childRoot),
      edge
    );

    return point ? rootPlitePoint(point, owner.childRoot) : null;
  });

const createContentRootDOMRangeViewSelection = ({
  editor,
  owners,
  range,
}: {
  editor: ReactRuntimeEditor;
  owners: readonly ContentRootOwner[];
  range: Range;
}) => {
  const projectPoint = (point: Range['anchor']) => {
    const root = point.root ?? MAIN_ROOT_KEY;
    const owner = getContentRootShellOwner(owners, root, point);

    if (!owner) {
      return {
        point: rootPlitePoint(point, root),
      };
    }

    const boundaryPoint = getContentRootBoundaryPoint(
      editor,
      owner,
      point.offset === 0 ? 'start' : 'end'
    );

    return boundaryPoint
      ? {
          owner,
          point: boundaryPoint,
        }
      : {
          point: rootPlitePoint(point, root),
        };
  };

  return createPliteViewSelection(
    createContentRootProjectionGraph(editor, owners),
    {
      anchor: projectPoint(range.anchor),
      focus: projectPoint(range.focus),
    }
  );
};

const isNestedEditableDOMTarget = (
  editorElement: HTMLElement,
  target: EventTarget | null
) => {
  const targetElement = isDOMElement(target)
    ? target
    : isDOMText(target)
      ? target.parentElement
      : null;
  const targetEditor = targetElement?.closest('[data-plite-editor="true"]');

  return Boolean(
    targetEditor &&
      targetEditor !== editorElement &&
      editorElement.contains(targetEditor)
  );
};

export const isSelectionInEditorView = (
  editor: ReactRuntimeEditor,
  selection: Range | null
) => {
  if (!selection) {
    return true;
  }

  const selectionRoot = selection.anchor.root ?? MAIN_ROOT_KEY;
  const viewRoot = editor.read((state) => state.view.root());

  return selectionRoot === viewRoot;
};

const getActiveElementInDocument = (targetDocument: Document) => {
  let activeElement = targetDocument.activeElement;

  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement;
};

export const executeEditableSelectionImport = ({
  importSelection,
  selectionPolicy,
}: {
  importSelection: () => void;
  selectionPolicy: EditableSelectionPolicy;
}) => {
  if (selectionPolicy.kind !== 'import-dom') {
    return false;
  }

  importSelection();
  return true;
};

export const executeEditableSelectionExport = ({
  exportSelection,
  selectionPolicy,
}: {
  exportSelection: () => void;
  selectionPolicy: EditableSelectionPolicy;
}) => {
  if (selectionPolicy.kind !== 'export-model') {
    return false;
  }

  exportSelection();
  return true;
};

const isFullDocumentSelection = (
  editor: ReactRuntimeEditor,
  selection: Range
) => {
  try {
    const [start, end] = RangeApi.edges(selection);
    const [documentStart, documentEnd] = editor.read((state) => [
      state.points.start([]),
      state.points.end([]),
    ]);

    return (
      PointApi.equals(start, documentStart) && PointApi.equals(end, documentEnd)
    );
  } catch {
    return false;
  }
};

const shouldKeepFullDocumentSelectionModelBacked = ({
  editor,
  editorElement,
  selection,
}: {
  editor: ReactRuntimeEditor;
  editorElement: HTMLElement;
  selection: Range;
}) => {
  const rootChildCount = editor.read((state) => state.nodes.children().length);

  return (
    (rootChildCount > MODEL_BACKED_FULL_DOCUMENT_CHILD_THRESHOLD ||
      editorElement.childNodes.length >
        MODEL_BACKED_FULL_DOCUMENT_CHILD_THRESHOLD) &&
    isFullDocumentSelection(editor, selection)
  );
};

export const shouldUseModelBackedSelectAllSelection = ({
  editor,
  selection,
}: {
  editor: ReactRuntimeEditor;
  selection: Range;
}) => {
  if (!isFullDocumentSelection(editor, selection)) {
    return false;
  }

  if (DOMCoverage.getBoundariesForRange(editor, selection).length > 0) {
    return true;
  }

  try {
    const editorElement = ReactEditor.assertDOMNode(editor, editor);

    return shouldKeepFullDocumentSelectionModelBacked({
      editor,
      editorElement,
      selection,
    });
  } catch {
    return false;
  }
};

export type EditableDOMSelectionSyncOptions = {
  preserveScroll?: boolean;
};

const getComposedParentElement = (element: HTMLElement) => {
  if (element.parentElement) {
    return element.parentElement;
  }

  const window = element.ownerDocument.defaultView;

  if (!window) {
    return null;
  }

  const ShadowRootConstructor = window.ShadowRoot;
  const root = element.getRootNode();

  if (ShadowRootConstructor && root instanceof ShadowRootConstructor) {
    const { host } = root;

    return host instanceof window.HTMLElement ? host : null;
  }

  return null;
};

const captureScrollOffsets = (startElement: HTMLElement) => {
  const elements: Array<{
    element: HTMLElement;
    scrollLeft: number;
    scrollTop: number;
  }> = [];

  for (
    let element: HTMLElement | null = startElement;
    element;
    element = getComposedParentElement(element)
  ) {
    elements.push({
      element,
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop,
    });
  }

  const window = startElement.ownerDocument.defaultView;
  const scrollingElement = startElement.ownerDocument.scrollingElement;

  return () => {
    for (const { element, scrollLeft, scrollTop } of elements) {
      element.scrollLeft = scrollLeft;
      element.scrollTop = scrollTop;
    }

    if (window && scrollingElement) {
      window.scrollTo(scrollingElement.scrollLeft, scrollingElement.scrollTop);
    }
  };
};

const restoreScrollOffsets = (
  restoreScroll: (() => void) | null,
  editorElement: HTMLElement
) => {
  if (!restoreScroll) {
    return;
  }

  restoreScroll();
  queueMicrotask(restoreScroll);
  editorElement.ownerDocument.defaultView?.requestAnimationFrame(() => {
    restoreScroll();
  });
};

export const isStaleModelOwnedTextInputDOMRange = ({
  activeIntent,
  modelOwnedTextInputGuard = 0,
  modelSelection,
  range,
  recentTextInputRepairEcho,
  selectionSource,
}: {
  activeIntent?: InputIntent | null;
  modelOwnedTextInputGuard?: number;
  modelSelection: Selection;
  range: Range;
  recentTextInputRepairEcho?: EditableInputController['state']['recentTextInputRepairEcho'];
  selectionSource?: SelectionSource;
}) => {
  const modelOwnsTextInput =
    activeIntent === 'composition' ||
    activeIntent === 'text-insert' ||
    selectionSource === 'model-owned';
  const recentRepairEchoOwnsSelection =
    activeIntent === 'text-insert' &&
    !!recentTextInputRepairEcho &&
    RangeApi.isRange(modelSelection) &&
    RangeApi.isCollapsed(modelSelection) &&
    recentTextInputRepairEcho.pathKey ===
      modelSelection.anchor.path.join(',') &&
    recentTextInputRepairEcho.selectionOffset === modelSelection.anchor.offset;
  const hasModelOwnedSelectionAuthority =
    modelOwnedTextInputGuard > 0 ||
    selectionSource === 'model-owned' ||
    recentRepairEchoOwnsSelection;

  return (
    modelOwnsTextInput &&
    hasModelOwnedSelectionAuthority &&
    RangeApi.isCollapsed(range) &&
    RangeApi.isRange(modelSelection) &&
    RangeApi.isCollapsed(modelSelection) &&
    PathApi.equals(range.anchor.path, modelSelection.anchor.path) &&
    range.anchor.offset < modelSelection.anchor.offset
  );
};

export const syncEditorSelectionFromDOM = ({
  editor,
  ignoreModelSelectionPreference = false,
  inputController,
}: {
  editor: ReactRuntimeEditor;
  ignoreModelSelectionPreference?: boolean;
  inputController: EditableInputController;
}) => {
  if (
    isEditableModelSelectionPreferred(inputController) &&
    !ignoreModelSelectionPreference
  ) {
    return;
  }

  const root = ReactEditor.findDocumentOrShadowRoot(editor);
  const domSelection = getSelection(root);

  if (!domSelection || domSelection.rangeCount === 0) {
    return;
  }

  const { anchorNode, focusNode } = domSelection;

  const editorElement = ReactEditor.assertDOMNode(editor, editor);

  if (
    isNestedEditableDOMTarget(editorElement, anchorNode) ||
    isNestedEditableDOMTarget(editorElement, focusNode)
  ) {
    return;
  }

  const anchorNodeSelectable = ReactEditor.hasSelectableTarget(
    editor,
    anchorNode
  );
  const focusNodeSelectable = ReactEditor.hasSelectableTarget(
    editor,
    focusNode
  );

  if (!anchorNodeSelectable || !focusNodeSelectable) {
    return;
  }

  const range = ReactEditor.resolvePliteRange(editor, domSelection, {
    exactMatch: false,
  });
  const selection = readRuntimeSelection(editor);

  if (
    shouldSuppressCollapsedSelectionMoveDOMRange({
      activeIntent: inputController.state.activeIntent,
      currentSelection: selection,
      nextSelection: range,
    })
  ) {
    return;
  }

  if (range && (!selection || !RangeApi.equals(selection, range))) {
    const modelSelection = Editor.getSelection(editor);

    if (
      modelSelection &&
      isStaleModelOwnedTextInputDOMRange({
        activeIntent: inputController.state.activeIntent,
        modelSelection,
        modelOwnedTextInputGuard:
          inputController.state.modelOwnedTextInputGuard ?? 0,
        range,
        recentTextInputRepairEcho:
          inputController.state.recentTextInputRepairEcho,
        selectionSource: inputController.state.selectionSource,
      })
    ) {
      return;
    }

    writePliteViewSelection(editor, null);
    editor.update((tx) => {
      tx.selection.set(range);
    });
  }
};

export const setEditableModelSelectionPreference = ({
  inputController,
  preferModelSelection,
  reason,
  selectionSource,
}: {
  inputController: EditableInputController;
  preferModelSelection: boolean;
  reason?: ModelSelectionPreferenceReason;
  selectionSource?: SelectionSource;
}) => {
  // Keep the input guard and the controller's selection provenance in lockstep.
  const nextSelectionSource =
    selectionSource ?? (preferModelSelection ? 'model-owned' : 'dom-current');
  const nextReason =
    reason ??
    inferModelSelectionPreferenceReason({
      preferModelSelection,
      selectionSource: nextSelectionSource,
    });

  if (
    !preferModelSelection ||
    nextReason === 'browser-handle' ||
    nextReason === 'repair-induced'
  ) {
    inputController.state.modelOwnedTextInputGuard = 0;
  }
  inputController.preferModelSelectionForInputRef.current =
    preferModelSelection;
  inputController.state.selectionSource = nextSelectionSource;
  inputController.state.modelSelectionPreference = {
    preferModelSelection,
    reason: nextReason,
    selectionSource: nextSelectionSource,
  };
};

export const isEditableModelSelectionPreferred = (
  inputController: EditableInputController
) => inputController.preferModelSelectionForInputRef.current;

const inferModelSelectionPreferenceReason = ({
  preferModelSelection,
  selectionSource,
}: {
  preferModelSelection: boolean;
  selectionSource: SelectionSource;
}): ModelSelectionPreferenceReason => {
  if (!preferModelSelection) {
    return selectionSource === 'dom-current' ? 'native-selection' : 'unknown';
  }

  switch (selectionSource) {
    case 'app-owned':
    case 'internal-control':
      return 'internal-control';
    case 'composition-owned':
      return 'composition';
    case 'partial-dom-backed':
      return 'partial-dom-backed';
    default:
      return 'model-command';
  }
};

export const isEditableModelSelectionPreferredForInput = ({
  inputController,
  inputType,
}: {
  inputController: EditableInputController;
  inputType: string;
}) => {
  if (!isEditableModelSelectionPreferred(inputController)) {
    return false;
  }

  if (inputType !== 'insertText') {
    return true;
  }

  const preference = inputController.state.modelSelectionPreference;

  if (!preference?.preferModelSelection) {
    return false;
  }

  return (
    inputController.state.isComposing ||
    preference.reason === 'browser-handle' ||
    preference.reason === 'composition' ||
    preference.reason === 'internal-control' ||
    preference.reason === 'model-command' ||
    preference.reason === 'partial-dom-backed'
  );
};

export const shouldForceModelOwnedTextInput = ({
  inputController,
  inputType,
}: {
  inputController: EditableInputController;
  inputType: string;
}) => {
  if (inputType !== 'insertText') {
    return false;
  }

  return (
    isEditableModelSelectionPreferred(inputController) &&
    (inputController.state.modelOwnedTextInputGuard ?? 0) > 0
  );
};

export const armModelOwnedTextInputGuard = ({
  inputController,
}: {
  inputController: EditableInputController;
}) => {
  const nextGuard = (inputController.state.modelOwnedTextInputGuard ?? 0) + 1;

  inputController.state.modelOwnedTextInputGuard = nextGuard;

  const clearGuard = () => {
    if (inputController.state.modelOwnedTextInputGuard === nextGuard) {
      inputController.state.modelOwnedTextInputGuard = 0;
    }
  };

  setTimeout(clearGuard, MODEL_OWNED_TEXT_INPUT_GUARD_MS);
};

export const shouldImportChangedExpandedDOMSelection = ({
  currentSelection,
  nextSelection,
  selectionChangeOrigin,
}: {
  currentSelection: Selection;
  nextSelection: Range | null;
  selectionChangeOrigin: SelectionChangeOrigin;
}) => {
  if (
    selectionChangeOrigin === 'repair-induced' ||
    !nextSelection ||
    !RangeApi.isExpanded(nextSelection)
  ) {
    return false;
  }

  return !currentSelection || !RangeApi.equals(currentSelection, nextSelection);
};

export const shouldApplyDOMSelectionChange = ({
  changedExpandedDOMSelection,
  selectionChangeOrigin,
}: {
  changedExpandedDOMSelection: boolean;
  selectionChangeOrigin: SelectionChangeOrigin;
}) => selectionChangeOrigin === 'native-user' || changedExpandedDOMSelection;

export const prepareEditableSelectionChangeImport = ({
  domSelectionBelongsToEditor,
  domSelectionCanImport = domSelectionBelongsToEditor,
  inputController,
  selectionChangeOrigin,
}: {
  domSelectionCanImport?: boolean;
  domSelectionBelongsToEditor: boolean;
  inputController: EditableInputController;
  selectionChangeOrigin: SelectionChangeOrigin;
}) => {
  if (
    selectionChangeOrigin !== 'native-user' ||
    !domSelectionBelongsToEditor ||
    !domSelectionCanImport
  ) {
    return false;
  }

  setEditableModelSelectionPreference({
    inputController,
    preferModelSelection: false,
    selectionSource: 'dom-current',
  });

  return true;
};

export const completeEditableSelectionChangeImport = ({
  inputController,
  selectionChangeOrigin,
}: {
  inputController: EditableInputController;
  selectionChangeOrigin: SelectionChangeOrigin;
}) => {
  if (inputController.state.selectionChangeOrigin !== selectionChangeOrigin) {
    return;
  }

  if (
    isEditableModelSelectionPreferred(inputController) &&
    (selectionChangeOrigin === 'browser-handle' ||
      selectionChangeOrigin === 'programmatic-export')
  ) {
    return;
  }

  inputController.state.selectionChangeOrigin = null;
};

export const getPendingNativeTextInputRepairSelectionChangePolicy = ({
  activeIntent,
  currentSelection,
  domSelectionTextBacked = true,
  pendingNativeTextInputRepairDOMOffset,
  pendingNativeTextInputRepairOffset,
  pendingNativeTextInputRepairPathKey,
  range,
  selectionChangeOrigin,
}: {
  activeIntent?: InputIntent | null;
  currentSelection?: Range | null;
  domSelectionTextBacked?: boolean;
  pendingNativeTextInputRepairDOMOffset?: number | null;
  pendingNativeTextInputRepairOffset?: number | null;
  pendingNativeTextInputRepairPathKey: string | null;
  range: Range | null;
  selectionChangeOrigin: SelectionChangeOrigin;
}): 'allow' | 'clear-and-allow' | 'suppress' => {
  if (
    selectionChangeOrigin === 'repair-induced' &&
    activeIntent === 'text-insert' &&
    range &&
    RangeApi.isCollapsed(range) &&
    currentSelection &&
    RangeApi.isCollapsed(currentSelection) &&
    range.anchor.path.join(',') === currentSelection.anchor.path.join(',') &&
    range.anchor.offset < currentSelection.anchor.offset
  ) {
    return 'suppress';
  }

  if (
    selectionChangeOrigin === 'native-user' &&
    activeIntent === 'text-insert' &&
    range &&
    RangeApi.isCollapsed(range) &&
    pendingNativeTextInputRepairPathKey &&
    range.anchor.path.join(',') === pendingNativeTextInputRepairPathKey &&
    !domSelectionTextBacked
  ) {
    return 'suppress';
  }

  if (
    selectionChangeOrigin === 'native-user' &&
    activeIntent === 'text-insert' &&
    range &&
    RangeApi.isCollapsed(range) &&
    currentSelection &&
    RangeApi.isCollapsed(currentSelection) &&
    pendingNativeTextInputRepairPathKey &&
    range.anchor.path.join(',') === currentSelection.anchor.path.join(',') &&
    range.anchor.path.join(',') === pendingNativeTextInputRepairPathKey &&
    range.anchor.offset < currentSelection.anchor.offset
  ) {
    return 'suppress';
  }

  if (
    pendingNativeTextInputRepairPathKey &&
    range &&
    RangeApi.isCollapsed(range) &&
    range.anchor.path.join(',') === pendingNativeTextInputRepairPathKey &&
    pendingNativeTextInputRepairOffset != null &&
    pendingNativeTextInputRepairDOMOffset != null &&
    pendingNativeTextInputRepairDOMOffset === pendingNativeTextInputRepairOffset
  ) {
    return 'clear-and-allow';
  }

  if (
    selectionChangeOrigin !== 'native-user' ||
    !pendingNativeTextInputRepairPathKey
  ) {
    return 'allow';
  }

  if (!range) {
    return 'suppress';
  }

  if (
    !RangeApi.isCollapsed(range) ||
    range.anchor.path.join(',') !== pendingNativeTextInputRepairPathKey
  ) {
    return 'clear-and-allow';
  }

  if (
    pendingNativeTextInputRepairOffset != null &&
    pendingNativeTextInputRepairDOMOffset != null &&
    pendingNativeTextInputRepairDOMOffset !== pendingNativeTextInputRepairOffset
  ) {
    return 'suppress';
  }

  return 'allow';
};

export const shouldSuppressCollapsedSelectionMoveDOMRange = ({
  activeIntent,
  currentSelection,
  nextSelection,
}: {
  activeIntent?: EditableInputController['state']['activeIntent'];
  currentSelection: Range | null | undefined;
  nextSelection: Range | null;
}) => {
  if (
    (activeIntent !== 'model-selection-move' &&
      activeIntent !== 'native-selection-move') ||
    !currentSelection ||
    !RangeApi.isExpanded(currentSelection) ||
    !RangeApi.isRange(nextSelection) ||
    !RangeApi.isCollapsed(nextSelection)
  ) {
    return false;
  }

  return !RangeApi.includes(currentSelection, nextSelection.focus);
};

export const resolveEditableImplicitTarget = ({
  editor,
  inputController,
  request,
  scheduleSelectionSync = (callback) => {
    setTimeout(callback);
  },
  syncDOMSelectionToEditor,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  request: TargetFreshnessRequest;
  scheduleSelectionSync?: (callback: () => void) => void;
  syncDOMSelectionToEditor: () => void;
}): Selection => {
  const preferModelSelection =
    isEditableModelSelectionPreferred(inputController);

  const root = ReactEditor.findDocumentOrShadowRoot(editor);
  const domSelection = getSelection(root);

  if (!domSelection || domSelection.rangeCount === 0) {
    return request.fallback;
  }

  const { anchorNode, focusNode } = domSelection;
  const anchorNodeSelectable = ReactEditor.hasSelectableTarget(
    editor,
    anchorNode
  );
  const focusNodeSelectable = ReactEditor.hasSelectableTarget(
    editor,
    focusNode
  );

  if (!anchorNodeSelectable || !focusNodeSelectable) {
    return request.fallback;
  }

  const target =
    ReactEditor.resolvePliteRange(editor, domSelection, {
      exactMatch: false,
    }) ?? request.fallback;

  if (
    preferModelSelection &&
    (!RangeApi.isRange(target) || !RangeApi.isExpanded(target))
  ) {
    return request.fallback;
  }

  if (target) {
    if (preferModelSelection) {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: false,
        selectionSource: 'dom-current',
      });
    }

    scheduleSelectionSync(syncDOMSelectionToEditor);
  }

  return target;
};

export const applyEditableDOMSelectionChange = ({
  androidInputManager,
  editor,
  inputController,
  processing,
  readOnly,
  rerunOnDirtyNodeMap,
}: {
  androidInputManager: AndroidInputManager | null | undefined;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  processing: RefObject<boolean>;
  readOnly: boolean;
  rerunOnDirtyNodeMap: () => void;
}) => {
  if (IS_NODE_MAP_DIRTY.get(editor)) {
    rerunOnDirtyNodeMap();
    return;
  }

  const editorElement = ReactEditor.assertDOMNode(editor, editor);
  const editorDocument = editorElement.ownerDocument;
  const ShadowRootConstructor = editorDocument.defaultView?.ShadowRoot;
  const editorRoot = editorElement.getRootNode();

  if (
    !processing.current &&
    IS_WEBKIT &&
    ShadowRootConstructor &&
    editorRoot instanceof ShadowRootConstructor
  ) {
    processing.current = true;

    const active = getActiveElementInDocument(editorDocument);

    if (active) {
      editorDocument.execCommand('indent');
    } else {
      writePliteViewSelection(editor, null);
      editor.update((tx) => {
        tx.selection.clear();
      });
    }

    processing.current = false;
    return;
  }

  const state = inputController.state;
  state.pendingNativeTextInputRepairSuppressedDOMSelection = false;

  if (
    (!IS_ANDROID && ReactEditor.isComposing(editor)) ||
    state.isDraggingInternally ||
    isEditableOutsideFocusBoundarySettling(state)
  ) {
    return;
  }

  const root = ReactEditor.findDocumentOrShadowRoot(editor);
  const { activeElement } = root;
  const domSelection = getSelection(root);

  if (activeElement === editorElement) {
    state.latestElement = activeElement;
    IS_FOCUSED.set(editor, true);
  } else {
    IS_FOCUSED.delete(editor);
  }

  if (!domSelection) {
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: false,
      selectionSource: 'unknown',
    });
    writePliteViewSelection(editor, null);
    editor.update((tx) => {
      tx.selection.clear();
    });
    return;
  }

  const { anchorNode, focusNode } = domSelection;

  const projectedSelection = resolveProjectedDOMSelection({
    domSelection,
    editor,
    editorElement,
  });

  if (projectedSelection) {
    editor.update((tx) => {
      tx.selection.set({
        anchor: projectedSelection.anchor.point,
        focus: projectedSelection.anchor.point,
      });
    });
    writePliteViewSelection(editor, projectedSelection);
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      reason: 'partial-dom-backed',
      selectionSource: 'model-owned',
    });
    domSelection.removeAllRanges();
    return;
  }

  const selectionChangeOrigin = state.selectionChangeOrigin ?? 'native-user';

  if (
    readPliteViewSelection(editor) &&
    selectionChangeOrigin !== 'native-user'
  ) {
    return;
  }

  if (
    selectionChangeOrigin !== 'native-user' &&
    domSelection.isCollapsed &&
    isEditableModelSelectionPreferred(inputController)
  ) {
    return;
  }

  if (selectionChangeOrigin === 'repair-induced' && domSelection.isCollapsed) {
    if (
      state.activeIntent === 'text-insert' ||
      state.recentTextInputRepairEcho
    ) {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      });
      armModelOwnedTextInputGuard({ inputController });
    }
    return;
  }

  if (
    activeElement !== editorElement &&
    isDOMNode(activeElement) &&
    (ReactEditor.hasDOMNode(editor, activeElement) ||
      isNestedEditableDOMTarget(editorElement, activeElement))
  ) {
    return;
  }

  if (
    isNestedEditableDOMTarget(editorElement, anchorNode) ||
    isNestedEditableDOMTarget(editorElement, focusNode)
  ) {
    return;
  }

  const anchorNodeSelectable = ReactEditor.hasSelectableTarget(
    editor,
    anchorNode
  );

  const focusNodeSelectable = ReactEditor.hasSelectableTarget(
    editor,
    focusNode
  );
  const domSelectionBelongsToEditor =
    anchorNodeSelectable && focusNodeSelectable;
  const range = domSelectionBelongsToEditor
    ? ReactEditor.resolvePliteRange(editor, domSelection, {
        exactMatch: false,
      })
    : null;
  const anchorElement = isDOMText(anchorNode)
    ? anchorNode.parentElement
    : isDOMElement(anchorNode)
      ? anchorNode
      : null;
  const projectedTextSelection =
    anchorElement
      ?.closest('[data-plite-node="text"]')
      ?.getAttribute('data-plite-dom-sync-reason') === 'projection';
  const pendingNativeTextInputRepairPathKey =
    state.pendingNativeTextInputRepairPathKey ?? null;

  if (
    selectionChangeOrigin === 'native-user' &&
    state.activeIntent === 'history' &&
    isEditableModelSelectionPreferred(inputController)
  ) {
    return;
  }

  if (
    state.selectionSource === 'partial-dom-backed' &&
    isEditableModelSelectionPreferred(inputController)
  ) {
    return;
  }

  if (
    selectionChangeOrigin === 'native-user' &&
    projectedTextSelection &&
    RangeApi.isRange(range) &&
    RangeApi.isCollapsed(range) &&
    (state.modelOwnedTextInputGuard ?? 0) > 0
  ) {
    return;
  }

  const currentSelection = readLiveSelection(editor);

  if (selectionChangeOrigin === 'native-user' && RangeApi.isRange(range)) {
    const modelSelection = Editor.getSelection(editor);

    if (
      modelSelection &&
      isStaleModelOwnedTextInputDOMRange({
        activeIntent: state.activeIntent,
        modelSelection,
        modelOwnedTextInputGuard: state.modelOwnedTextInputGuard ?? 0,
        range,
        recentTextInputRepairEcho: state.recentTextInputRepairEcho,
        selectionSource: state.selectionSource,
      })
    ) {
      return;
    }
  }

  const pendingRepairSelectionChangePolicy =
    getPendingNativeTextInputRepairSelectionChangePolicy({
      activeIntent: state.activeIntent,
      currentSelection,
      domSelectionTextBacked: isDOMText(anchorNode) && isDOMText(focusNode),
      pendingNativeTextInputRepairDOMOffset:
        domSelection.isCollapsed && isDOMText(anchorNode)
          ? domSelection.anchorOffset
          : null,
      pendingNativeTextInputRepairOffset:
        state.pendingNativeTextInputRepairOffset ?? null,
      pendingNativeTextInputRepairPathKey,
      range,
      selectionChangeOrigin,
    });

  if (pendingRepairSelectionChangePolicy === 'suppress') {
    if (
      selectionChangeOrigin === 'repair-induced' &&
      state.activeIntent === 'text-insert'
    ) {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      });
      armModelOwnedTextInputGuard({ inputController });
    }
    if (pendingNativeTextInputRepairPathKey) {
      state.pendingNativeTextInputRepairSuppressedDOMSelection = true;
    }
    return;
  }

  if (pendingRepairSelectionChangePolicy === 'clear-and-allow') {
    state.pendingNativeTextInputRepairOffset = null;
    state.pendingNativeTextInputRepairPathKey = null;
  }

  if (
    selectionChangeOrigin === 'native-user' &&
    shouldSuppressCollapsedSelectionMoveDOMRange({
      activeIntent: state.activeIntent,
      currentSelection,
      nextSelection: range,
    })
  ) {
    return;
  }

  const modelSelectionHasDOMCoverage =
    selectionChangeOrigin === 'programmatic-export' &&
    currentSelection &&
    DOMCoverage.getBoundariesForRange(editor, currentSelection).length > 0;
  const modelSelectionIsFullDocument =
    selectionChangeOrigin === 'programmatic-export' &&
    currentSelection &&
    isFullDocumentSelection(editor, currentSelection);
  const shouldImportChangedExpandedSelection =
    domSelectionBelongsToEditor &&
    !modelSelectionHasDOMCoverage &&
    !modelSelectionIsFullDocument &&
    !(
      state.isUpdatingSelection &&
      selectionChangeOrigin === 'programmatic-export'
    ) &&
    shouldImportChangedExpandedDOMSelection({
      currentSelection,
      nextSelection: range,
      selectionChangeOrigin,
    });

  if (
    !shouldApplyDOMSelectionChange({
      changedExpandedDOMSelection: shouldImportChangedExpandedSelection,
      selectionChangeOrigin,
    })
  ) {
    return;
  }

  if (
    state.isUpdatingSelection &&
    !androidInputManager?.isFlushing() &&
    !shouldImportChangedExpandedSelection
  ) {
    return;
  }

  prepareEditableSelectionChangeImport({
    domSelectionCanImport: !!range,
    domSelectionBelongsToEditor,
    inputController,
    selectionChangeOrigin: shouldImportChangedExpandedSelection
      ? 'native-user'
      : selectionChangeOrigin,
  });

  if (isEditableModelSelectionPreferred(inputController)) {
    return;
  }

  if (domSelectionBelongsToEditor && range) {
    const acrossContentRootOwners = isRangeAcrossContentRootOwners(
      editor,
      range
    );
    const contentRootOwners = acrossContentRootOwners
      ? findContentRootOwners(editor)
      : [];

    writePliteViewSelection(
      editor,
      acrossContentRootOwners
        ? createContentRootDOMRangeViewSelection({
            editor,
            owners: contentRootOwners,
            range,
          })
        : null
    );
    if (
      !ReactEditor.isComposing(editor) &&
      !androidInputManager?.hasPendingChanges() &&
      !androidInputManager?.isFlushing()
    ) {
      editor.update((tx) => {
        tx.selection.set(range);
      });
    } else {
      androidInputManager?.handleUserSelect(range);
    }
  }

  // Deselect the editor if the DOM selection is not selectable in read-only mode.
  if (readOnly && (!anchorNodeSelectable || !focusNodeSelectable)) {
    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: false,
      selectionSource: 'unknown',
    });
    writePliteViewSelection(editor, null);
    editor.update((tx) => {
      tx.selection.clear();
    });
  }
};

export const syncEditableDOMSelectionToEditor = ({
  editor,
  options,
  scrollSelectionIntoView,
  partialDOMBackedSelection,
  state,
}: {
  editor: ReactRuntimeEditor;
  options?: EditableDOMSelectionSyncOptions;
  scrollSelectionIntoView: (
    editor: ReactRuntimeEditor,
    domRange: DOMRange
  ) => void;
  partialDOMBackedSelection: boolean;
  state: {
    isUpdatingSelection: boolean;
    outsideFocusBoundarySettleUntil: number;
    selectionChangeOrigin?: SelectionChangeOrigin | null;
  };
}) => {
  const selection = readRuntimeSelection(editor);
  const selectionHasDOMCoverage =
    !!selection &&
    DOMCoverage.getBoundariesForRange(editor, selection).length > 0;

  if (
    (partialDOMBackedSelection && selectionHasDOMCoverage) ||
    !selection ||
    !isSelectionInEditorView(editor, selection) ||
    shouldSkipDOMSelection(editor)
  ) {
    return;
  }

  if (isEditableOutsideFocusBoundarySettling(state)) {
    return;
  }

  try {
    const root = ReactEditor.findDocumentOrShadowRoot(editor);
    const domSelection = getSelection(root);

    if (!domSelection) {
      return;
    }

    const editorElement = ReactEditor.assertDOMNode(editor, editor);
    const activeElement = root.activeElement;
    const editorHasDOMFocus =
      activeElement != null &&
      containsShadowAware(editorElement, activeElement);

    if (
      activeElement &&
      activeElement !== editorElement.ownerDocument.body &&
      activeElement !== editorElement.ownerDocument.documentElement &&
      !editorHasDOMFocus
    ) {
      return;
    }

    const preserveScroll =
      options?.preserveScroll || shouldSkipSelectionScroll(editor);
    const viewSelection = readPliteViewSelection(editor);

    if (viewSelection) {
      state.isUpdatingSelection = true;
      state.selectionChangeOrigin = 'programmatic-export';
      domSelection.removeAllRanges();
      const rootWindow =
        'defaultView' in root
          ? root.defaultView
          : root.ownerDocument.defaultView;

      rootWindow?.queueMicrotask(() => domSelection.removeAllRanges());
      rootWindow?.requestAnimationFrame(() => domSelection.removeAllRanges());
      setTimeout(() => {
        state.isUpdatingSelection = false;
      });
      return;
    }

    if (
      shouldKeepFullDocumentSelectionModelBacked({
        editor,
        editorElement,
        selection,
      })
    ) {
      return;
    }

    if (
      selectionHasDOMCoverage &&
      applyDOMCoverageSelectionPolicy({
        domSelection,
        editor,
        onDOMSelectionWillChange: () => {
          state.isUpdatingSelection = true;
          state.selectionChangeOrigin = 'programmatic-export';
          setTimeout(() => {
            state.isUpdatingSelection = false;
          });
        },
        selection,
      })
    ) {
      return;
    }

    const domRange =
      readModelSelectionDOMPreference({
        editor,
        editorElement,
        selection,
      }) ??
      createFastDOMSelectionRange({
        editor,
        editorElement,
        selection,
      }) ??
      ReactEditor.resolveDOMRange(editor, selection);

    if (!domRange) {
      return;
    }

    if (viewSelection) {
      writePliteViewSelection(editor, null);
    }

    state.isUpdatingSelection = true;
    state.selectionChangeOrigin = 'programmatic-export';

    try {
      const restoreScroll = preserveScroll
        ? captureScrollOffsets(editorElement)
        : null;

      if (RangeApi.isBackward(selection)) {
        domSelection.setBaseAndExtent(
          domRange.endContainer,
          domRange.endOffset,
          domRange.startContainer,
          domRange.startOffset
        );
      } else {
        domSelection.setBaseAndExtent(
          domRange.startContainer,
          domRange.startOffset,
          domRange.endContainer,
          domRange.endOffset
        );
      }

      restoreScrollOffsets(restoreScroll, editorElement);

      if (!preserveScroll) {
        scrollSelectionIntoView(editor, domRange);
      }
    } finally {
      setTimeout(() => {
        state.isUpdatingSelection = false;
      }, 80);
    }
  } catch {
    // Leave browser selection unchanged if the DOM bridge is between commits.
  }
};
