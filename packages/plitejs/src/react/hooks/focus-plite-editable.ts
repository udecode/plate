import { type Value, RangeApi } from '../..';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { hasOpenDraft } from '../../core/public-state';
import { getPlacementGeneration, placedSince } from '../../core/view-carets';
import { getSelection } from '../../dom';
import { findDOMRootRuntime, IS_FOCUSED } from '../../dom/internal';
import {
  claimFocusRequest,
  isFocusRequestedElsewhere,
  resolveWrittenDOMRange,
  supersedeFocusRequest,
  watchFocusSuperseded,
} from '../../dom/plugin/dom-editor';
import { isElementFocused } from '../../dom/plugin/dom-root-runtime';
import { resolveNextKeyCaret } from '../../dom/plugin/dom-view-caret';
import {
  getDOMRangeSelectionPoints,
  writeDOMSelection,
} from '../../dom/utils/selection-writes';
import {
  findMountedEditableDOMRuntime,
  getMountedEditableDOMRuntime,
} from '../editable/editable-dom-runtime';
import { readModelSelectionDOMPreference } from '../editable/model-selection-dom-preference';
import {
  type Editor,
  getSelectionDOMRange,
  setEditorFocused,
} from '../editable/runtime-editor-api';
import {
  reachesRoot,
  readNodeSelectionFocus,
} from '../editable/view-caret-restore';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
} from '../view-selection';

type EditableFocusRequest = Readonly<{
  root: globalThis.Node;
  token: object;
}>;

const ROOT_TO_EDITABLE_FOCUS_REQUEST = new WeakMap<globalThis.Node, object>();
const EDITOR_TO_CANCEL_FOCUS_RETRIES = new WeakMap<object, () => void>();

const createEditableFocusRequest = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TPlugins>
): EditableFocusRequest | null => {
  const element = editor.api.dom.editable();

  if (!element) return null;
  const root = element.getRootNode();
  const token = {};

  claimFocusRequest(editor as unknown as Editor, element);
  ROOT_TO_EDITABLE_FOCUS_REQUEST.set(root, token);

  return { root, token };
};

const ownsEditableFocusRequest = (request: EditableFocusRequest | null) =>
  !request ||
  ROOT_TO_EDITABLE_FOCUS_REQUEST.get(request.root) === request.token;

const syncPreferredModelSelectionToDOM = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TPlugins>,
  element: HTMLElement
) => {
  try {
    if (findDOMRootRuntime(element)?.isSelectionHeld()) {
      IS_FOCUSED.set(editor as unknown as Editor, true);
      setEditorFocused(editor as unknown as Editor, true);
      element.focus({ preventScroll: true });
      return true;
    }
    const selection = resolveNextKeyCaret(editor as unknown as Editor, element);

    if (!selection) {
      return false;
    }

    const projectedSelection = getSelectionDOMRange(
      editor as unknown as Editor,
      selection
    );

    const superseded = watchFocusSuperseded(
      editor as unknown as Editor,
      element
    );

    if (!projectedSelection) {
      const root = element.getRootNode() as Document | ShadowRoot;

      IS_FOCUSED.set(editor as unknown as Editor, true);
      setEditorFocused(editor as unknown as Editor, true);
      element.focus({ preventScroll: true });
      if (!superseded()) writeDOMSelection(root, null);
      return true;
    }

    const domRange =
      readModelSelectionDOMPreference({
        editor,
        editorElement: element,
        selection: projectedSelection,
      }) ?? resolveWrittenDOMRange(editor, projectedSelection);

    if (!domRange) {
      return false;
    }

    const root = element.getRootNode() as Document | ShadowRoot;

    if (!getSelection(root)) {
      return false;
    }

    IS_FOCUSED.set(editor as unknown as Editor, true);
    setEditorFocused(editor as unknown as Editor, true);
    element.focus({ preventScroll: true });
    if (superseded()) return true;
    writeDOMSelection(
      root,
      getDOMRangeSelectionPoints(
        domRange,
        RangeApi.isBackward(projectedSelection)
      )
    );

    return true;
  } catch {
    return false;
  }
};

export const hasExpandedViewSelection = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TPlugins>
) => {
  const viewSelection = readPliteViewSelection(editor);

  return (
    !!viewSelection &&
    !isPliteViewSelectionCollapsed(viewSelection) &&
    reachesRoot(editor, viewSelection)
  );
};

export const focusSelectionTarget = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TPlugins>,
  element: HTMLElement
) => {
  if (findMountedEditableDOMRuntime(element)?.focusNodeSelectionElement()) {
    return true;
  }

  if (!hasExpandedViewSelection(editor)) {
    return false;
  }

  IS_FOCUSED.set(editor as unknown as Editor, true);
  setEditorFocused(editor as unknown as Editor, true);
  element.focus({ preventScroll: true });

  return true;
};

const focusPliteEditableForRequest = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TPlugins>,
  request: EditableFocusRequest | null
) => {
  if (!ownsEditableFocusRequest(request)) return;

  const element = editor.api.dom.editable();

  if (
    element &&
    (focusSelectionTarget(editor, element) ||
      syncPreferredModelSelectionToDOM(editor, element))
  ) {
    return;
  }

  editor.api.dom.focus();

  if (
    element &&
    element.ownerDocument.activeElement !== element &&
    !isFocusRequestedElsewhere(editor as unknown as Editor, element)
  ) {
    element.focus({ preventScroll: true });
    if (!syncPreferredModelSelectionToDOM(editor, element)) {
      editor.api.dom.focus();
    }
  }
};

export const focusPliteEditable = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TPlugins>
) => {
  focusPliteEditableForRequest(editor, createEditableFocusRequest(editor));
};

export const focusPliteEditableAfterEventFrame = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TPlugins>,
  { receipt }: { receipt?: number } = {}
) => {
  const called = getPlacementGeneration(editor);
  const placedOverParked = () =>
    placedSince(editor, called) &&
    !!readNodeSelectionFocus(editor as unknown as ReactRuntimeEditor & Editor)
      ?.parked;
  const placed =
    receipt === undefined
      ? placedOverParked
      : () => placedSince(editor, receipt);

  if (placed()) return () => {};

  const request = createEditableFocusRequest(editor);
  const element = editor.api.dom.editable();
  const focusElement =
    element && findDOMRootRuntime(element)?.nodeSelectionFocus();
  const picked =
    focusElement?.isConnected &&
    readNodeSelectionFocus(editor as unknown as ReactRuntimeEditor & Editor)
      ? focusElement
      : element;

  focusPliteEditableForRequest(editor, request);
  const domPhaseScheduler =
    getMountedEditableDOMRuntime(editor)?.domPhaseScheduler;
  const movedOff = () => !!picked && !isElementFocused(picked);

  if (
    !domPhaseScheduler ||
    hasOpenDraft(getEditorRuntimeOwner(editor)) ||
    movedOff() ||
    (element && isFocusRequestedElsewhere(editor as unknown as Editor, element))
  ) {
    return () => {};
  }

  let superseded = element
    ? watchFocusSuperseded(editor as unknown as Editor, element)
    : () => false;
  const retryFocus = () => {
    // Native field focus supersedes retries without another editor request.
    if (movedOff() || superseded() || placed()) return;
    focusPliteEditableForRequest(editor, request);
    if (element) {
      superseded = watchFocusSuperseded(editor as unknown as Editor, element);
    }
  };
  const cancelFrame = domPhaseScheduler.schedule(
    'dom-write',
    'focus-editable-frame',
    retryFocus,
    { timing: 'animation-frame' }
  );
  const cancelSettle = domPhaseScheduler.schedule(
    'dom-write',
    'focus-editable-settle',
    retryFocus,
    { timing: 'timeout' }
  );
  const cancel = () => {
    cancelFrame();
    cancelSettle();
    if (EDITOR_TO_CANCEL_FOCUS_RETRIES.get(editor) === cancel) {
      EDITOR_TO_CANCEL_FOCUS_RETRIES.delete(editor);
    }
  };

  EDITOR_TO_CANCEL_FOCUS_RETRIES.set(editor, cancel);

  return cancel;
};

export const supersedeEditableFocusRequests = (editor: ReactRuntimeEditor) => {
  supersedeFocusRequest(editor);
  EDITOR_TO_CANCEL_FOCUS_RETRIES.get(editor)?.();
};
