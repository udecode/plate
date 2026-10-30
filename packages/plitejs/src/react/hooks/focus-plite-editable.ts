import { type Value, RangeApi } from '../..';
import { placedSince } from '../../core/view-carets';
import { getSelection } from '../../dom';
import { IS_FOCUSED } from '../../dom/internal';
import {
  resolveWrittenDOMRange,
  supersedeFocusRequest,
} from '../../dom/plugin/dom-editor';
import { resolveNextKeyCaret } from '../../dom/plugin/dom-view-caret';
import {
  getDOMRangeSelectionPoints,
  writeDOMSelection,
} from '../../dom/utils/selection-writes';
import { getMountedEditableDOMRuntime } from '../editable/editable-dom-runtime';
import { readModelSelectionDOMPreference } from '../editable/model-selection-dom-preference';
import {
  type Editor,
  getSelectionDOMRange,
  setEditorFocused,
} from '../editable/runtime-editor-api';
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
    const selection = resolveNextKeyCaret(editor as unknown as Editor, element);

    if (!selection) {
      return false;
    }

    const projectedSelection = getSelectionDOMRange(
      editor as unknown as Editor,
      selection
    );

    if (!projectedSelection) {
      const root = element.getRootNode() as Document | ShadowRoot;

      IS_FOCUSED.set(editor as unknown as Editor, true);
      setEditorFocused(editor as unknown as Editor, true);
      element.focus({ preventScroll: true });
      writeDOMSelection(root, null);
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

const focusPliteEditableForRequest = <
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TPlugins>,
  request: EditableFocusRequest | null
) => {
  if (!ownsEditableFocusRequest(request)) return;

  const element = editor.api.dom.editable();

  const viewSelection = readPliteViewSelection(editor);

  if (viewSelection && !isPliteViewSelectionCollapsed(viewSelection)) {
    if (element) {
      IS_FOCUSED.set(editor as unknown as Editor, true);
      setEditorFocused(editor as unknown as Editor, true);
      element.focus({ preventScroll: true });
    }

    return;
  }

  if (element && syncPreferredModelSelectionToDOM(editor, element)) {
    return;
  }

  editor.api.dom.focus();

  if (element && element.ownerDocument.activeElement !== element) {
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
  const superseded = () =>
    receipt !== undefined && placedSince(editor, receipt);

  if (superseded()) return () => {};

  const request = createEditableFocusRequest(editor);

  focusPliteEditableForRequest(editor, request);
  const domPhaseScheduler =
    getMountedEditableDOMRuntime(editor)?.domPhaseScheduler;

  if (!domPhaseScheduler) return () => {};

  const focusRoot = request?.root as Document | ShadowRoot | undefined;
  const focusOwner = focusRoot?.activeElement;
  const retryFocus = () => {
    // Native field focus supersedes retries without another editor request.
    if (focusRoot?.activeElement !== focusOwner || superseded()) return;
    focusPliteEditableForRequest(editor, request);
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
