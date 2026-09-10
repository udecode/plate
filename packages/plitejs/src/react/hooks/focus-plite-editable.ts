import { type Node, type Value, RangeApi } from '../..';
import { getSelection } from '../../dom';
import { IS_FOCUSED } from '../../dom/internal';
import { getMountedEditableDOMRuntime } from '../editable/editable-dom-runtime';
import { readModelSelectionDOMPreference } from '../editable/model-selection-dom-preference';
import {
  type Editor,
  getSelectionDOMRange,
  setEditorFocused,
} from '../editable/runtime-editor-api';
import { readRuntimeSelection } from '../editable/runtime-selection-state';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
} from '../view-selection';

type EditableFocusRequest = Readonly<{
  root: globalThis.Node;
  token: object;
}>;

const ROOT_TO_EDITABLE_FOCUS_REQUEST = new WeakMap<globalThis.Node, object>();

const createEditableFocusRequest = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
): EditableFocusRequest | null => {
  try {
    const element = editor.api.dom.assertDOMNode(editor as unknown as Node);
    const root = element.getRootNode();
    const token = {};

    ROOT_TO_EDITABLE_FOCUS_REQUEST.set(root, token);

    return { root, token };
  } catch {
    return null;
  }
};

const ownsEditableFocusRequest = (request: EditableFocusRequest | null) =>
  !request ||
  ROOT_TO_EDITABLE_FOCUS_REQUEST.get(request.root) === request.token;

const syncPreferredModelSelectionToDOM = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>,
  element: HTMLElement
) => {
  try {
    const selection = readRuntimeSelection(editor as unknown as Editor);

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
      getSelection(root)?.removeAllRanges();
      return true;
    }

    const domRange =
      readModelSelectionDOMPreference({
        editor,
        editorElement: element,
        selection: projectedSelection,
      }) ?? ReactEditor.resolveDOMRange(editor, projectedSelection);

    if (!domRange) {
      return false;
    }

    const root = element.getRootNode() as Document | ShadowRoot;
    const domSelection = getSelection(root);

    if (!domSelection) {
      return false;
    }

    IS_FOCUSED.set(editor as unknown as Editor, true);
    setEditorFocused(editor as unknown as Editor, true);
    element.focus({ preventScroll: true });

    if (RangeApi.isBackward(projectedSelection)) {
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

    return true;
  } catch {
    return false;
  }
};

const focusPliteEditableForRequest = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>,
  request: EditableFocusRequest | null
) => {
  if (!ownsEditableFocusRequest(request)) return;

  let element: HTMLElement | null = null;

  try {
    element = editor.api.dom.assertDOMNode(editor as unknown as Node);
  } catch {
    // The DOM editor focus path still handles unmounted or dirty node maps.
  }

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
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
) => {
  focusPliteEditableForRequest(editor, createEditableFocusRequest(editor));
};

export const focusPliteEditableAfterEventFrame = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
) => {
  const request = createEditableFocusRequest(editor);

  focusPliteEditableForRequest(editor, request);
  const domPhaseScheduler =
    getMountedEditableDOMRuntime(editor)?.domPhaseScheduler;

  if (!domPhaseScheduler) return () => {};

  const focusRoot = request?.root as Document | ShadowRoot | undefined;
  const focusOwner = focusRoot?.activeElement;
  const retryFocus = () => {
    // Native field focus supersedes retries without another editor request.
    if (focusRoot?.activeElement !== focusOwner) return;
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

  return () => {
    cancelFrame();
    cancelSettle();
  };
};
