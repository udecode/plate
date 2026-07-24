import { type Value, RangeApi, SelectionApi } from '@platejs/plite';
import { getSelection } from '@platejs/plite-dom';
import { IS_FOCUSED } from '@platejs/plite-dom/internal';

import { readModelSelectionDOMPreference } from '../editable/model-selection-dom-preference';
import { getMountedEditableDOMRuntime } from '../editable/editable-dom-runtime';
import { setEditorFocused } from '../editable/runtime-editor-api';
import { readRuntimeSelection } from '../editable/runtime-selection-state';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
} from '../view-selection';

const syncPreferredModelSelectionToDOM = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>,
  element: HTMLElement
) => {
  try {
    const selection = readRuntimeSelection(editor);

    if (!selection) {
      return false;
    }

    if (SelectionApi.isNode(selection)) {
      const root = element.getRootNode() as Document | ShadowRoot;

      IS_FOCUSED.set(editor, true);
      setEditorFocused(editor, true);
      element.focus({ preventScroll: true });
      getSelection(root)?.removeAllRanges();
      return true;
    }

    const domRange =
      readModelSelectionDOMPreference({
        editor,
        editorElement: element,
        selection,
      }) ?? ReactEditor.resolveDOMRange(editor, selection);

    if (!domRange) {
      return false;
    }

    const root = element.getRootNode() as Document | ShadowRoot;
    const domSelection = getSelection(root);

    if (!domSelection) {
      return false;
    }

    IS_FOCUSED.set(editor, true);
    setEditorFocused(editor, true);
    element.focus({ preventScroll: true });

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

    return true;
  } catch {
    return false;
  }
};

export const focusPliteEditable = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
) => {
  let element: HTMLElement | null = null;

  try {
    element = editor.api.dom.assertDOMNode(editor);
  } catch {
    // The DOM editor focus path still handles unmounted or dirty node maps.
  }

  const viewSelection = readPliteViewSelection(editor);

  if (viewSelection && !isPliteViewSelectionCollapsed(viewSelection)) {
    if (element) {
      IS_FOCUSED.set(editor, true);
      setEditorFocused(editor, true);
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

export const focusPliteEditableAfterEventFrame = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>
) => {
  focusPliteEditable(editor);
  const domPhaseScheduler =
    getMountedEditableDOMRuntime(editor)?.domPhaseScheduler;

  domPhaseScheduler?.schedule(
    'dom-write',
    'focus-editable-frame',
    () => focusPliteEditable(editor),
    { timing: 'animation-frame' }
  );
  domPhaseScheduler?.schedule(
    'dom-write',
    'focus-editable-settle',
    () => focusPliteEditable(editor),
    { timing: 'timeout' }
  );
};
