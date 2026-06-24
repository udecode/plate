import type { RefObject } from 'react';
import {
  containsShadowAware,
  getSelection,
  isDOMNode,
} from '@platejs/plite-dom';
import { IS_FOCUSED } from '@platejs/plite-dom/internal';

import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  type EditableInputControllerState,
  getEditableInputTimestamp,
} from './input-controller';
import { attachEditableGlobalDragLifecycleListeners } from './input-router';
import { attachEditableSelectionChangeListener } from './selection-reconciler';

export const attachEditableOutsideFocusBoundaryListener = ({
  editor,
  readOnly,
  rootRef,
  state,
  targetDocument,
}: {
  editor: ReactRuntimeEditor;
  readOnly: boolean;
  rootRef: RefObject<HTMLElement | null>;
  state: EditableInputControllerState;
  targetDocument: Document;
}) => {
  const targetWindow = targetDocument.defaultView;
  const eventName = targetWindow?.PointerEvent ? 'pointerdown' : 'mousedown';
  const releaseRootOwnedNativeState = () => {
    const rootElement = rootRef.current;

    if (!rootElement) {
      return false;
    }

    let hadRootOwnedNativeState = false;
    const activeElement = targetDocument.activeElement;
    const hasReadOnlyModelSelection =
      readOnly && Boolean(editor.read((state) => state.selection.get()));

    if (
      targetWindow &&
      activeElement instanceof targetWindow.HTMLElement &&
      containsShadowAware(rootElement, activeElement)
    ) {
      activeElement.blur();
      hadRootOwnedNativeState = true;
    }

    const root = ReactEditor.findDocumentOrShadowRoot(editor);
    const selection = getSelection(root);
    const selectionInRoot =
      selection &&
      (containsShadowAware(rootElement, selection.anchorNode) ||
        containsShadowAware(rootElement, selection.focusNode));

    if (selectionInRoot) {
      hadRootOwnedNativeState = true;
      if (readOnly) {
        selection.removeAllRanges();
      }
    }

    if (hasReadOnlyModelSelection) {
      hadRootOwnedNativeState = true;
    }

    if (!hadRootOwnedNativeState) {
      return;
    }

    IS_FOCUSED.delete(editor);

    if (hasReadOnlyModelSelection) {
      editor.update((tx) => {
        tx.selection.clear();
      });
    }

    return true;
  };

  const handleOutsidePointerDown = (event: PointerEvent | MouseEvent) => {
    const rootElement = rootRef.current;

    if (!rootElement || event.defaultPrevented) {
      return;
    }

    if (
      isDOMNode(event.target) &&
      containsShadowAware(rootElement, event.target)
    ) {
      return;
    }

    state.outsideFocusBoundarySettleUntil = getEditableInputTimestamp() + 100;
    targetWindow?.setTimeout(() => {
      releaseRootOwnedNativeState();
    });
  };

  targetDocument.addEventListener(eventName, handleOutsidePointerDown);

  return () => {
    targetDocument.removeEventListener(eventName, handleOutsidePointerDown);
  };
};

export const useEditableRootGlobalLifecycle = ({
  editor,
  readOnly,
  rootRef,
  scheduleOnDOMSelectionChange,
  state,
}: {
  editor: ReactRuntimeEditor;
  readOnly: boolean;
  rootRef: RefObject<HTMLElement | null>;
  scheduleOnDOMSelectionChange: () => void;
  state: EditableInputControllerState;
}) => {
  useIsomorphicLayoutEffect(() => {
    const window = ReactEditor.getWindow(editor);
    const detachSelectionChangeListener = attachEditableSelectionChangeListener(
      {
        scheduleOnDOMSelectionChange,
        state,
        targetDocument: window.document,
      }
    );
    const detachGlobalDragLifecycleListeners =
      attachEditableGlobalDragLifecycleListeners({
        state,
        targetDocument: window.document,
      });
    const detachOutsideFocusBoundaryListener =
      attachEditableOutsideFocusBoundaryListener({
        editor,
        readOnly,
        rootRef,
        state,
        targetDocument: window.document,
      });

    return () => {
      detachSelectionChangeListener();
      detachGlobalDragLifecycleListeners();
      detachOutsideFocusBoundaryListener();
    };
  }, [editor, readOnly, rootRef, scheduleOnDOMSelectionChange, state]);
};
