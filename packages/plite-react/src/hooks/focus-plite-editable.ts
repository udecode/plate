import { type Value, RangeApi } from '@platejs/plite';
import { setEditorFocused } from '@platejs/plite/internal';
import { getSelection } from '@platejs/plite-dom';
import { IS_FOCUSED } from '@platejs/plite-dom/internal';

import { readModelSelectionDOMPreference } from '../editable/model-selection-dom-preference';
import { readRuntimeSelection } from '../editable/runtime-selection-state';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { readPliteViewSelection } from '../view-selection';
import { schedulePliteReactFocus } from './focus-scheduler';

const syncPreferredModelSelectionToDOM = <
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactRuntimeEditor<V, TExtensions>,
  element: HTMLElement
) => {
  try {
    const selection = readRuntimeSelection(
      editor as Parameters<typeof readRuntimeSelection>[0]
    );

    if (!selection) {
      return false;
    }

    const domRange = readModelSelectionDOMPreference({
      editor,
      editorElement: element,
      selection,
    });

    if (!domRange) {
      return false;
    }

    const root = element.getRootNode() as Document | ShadowRoot;
    const domSelection = getSelection(root);

    if (!domSelection) {
      return false;
    }

    IS_FOCUSED.set(editor as Parameters<typeof IS_FOCUSED.set>[0], true);
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

  if (readPliteViewSelection(editor)) {
    if (element) {
      IS_FOCUSED.set(editor as Parameters<typeof IS_FOCUSED.set>[0], true);
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
  schedulePliteReactFocus(() => {
    focusPliteEditable(editor);
  });
  globalThis.setTimeout?.(() => {
    focusPliteEditable(editor);
  }, 0);
};
