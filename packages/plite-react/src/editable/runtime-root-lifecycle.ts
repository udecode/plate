import type { RefObject } from 'react';
import {
  containsShadowAware,
  getSelection,
  isDOMNode,
} from '@platejs/plite-dom';
import {
  type DOMPhaseScheduler,
  IS_FOCUSED,
} from '@platejs/plite-dom/internal';

import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  type EditableInputControllerState,
  getEditableInputTimestamp,
} from './input-controller';
import { attachEditableGlobalDragLifecycleListeners } from './input-router';
import { setEditorFocused } from './runtime-editor-api';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import { attachEditableSelectionChangeListener } from './selection-reconciler';

export const attachEditableOutsideFocusBoundaryListener = ({
  domPhaseScheduler,
  editor,
  publishFocusState,
  readOnly,
  rootRef,
  state,
  targetDocument,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  publishFocusState: () => void;
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
      readOnly && Boolean(editor.read((state) => state.selection()));

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
    setEditorFocused(editor, false);
    publishFocusState();

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
    domPhaseScheduler.schedule(
      'dom-write',
      'release-outside-focus-native-state',
      releaseRootOwnedNativeState,
      { timing: 'timeout' }
    );
  };

  targetDocument.addEventListener(eventName, handleOutsidePointerDown);

  return () => {
    targetDocument.removeEventListener(eventName, handleOutsidePointerDown);
  };
};

export const useEditableRootGlobalLifecycle = ({
  runtime,
  scheduleOnDOMSelectionChange,
}: {
  runtime: EditableDOMRuntime;
  scheduleOnDOMSelectionChange: () => void;
}) => {
  const { domPhaseScheduler, editor, readOnly, rootRef, state } = runtime;

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
        domPhaseScheduler,
        editor,
        publishFocusState: runtime.publishFocusState,
        readOnly,
        rootRef,
        state,
        targetDocument: window.document,
      });

    return runtime.installDisposable('global-listeners', () => {
      detachSelectionChangeListener();
      detachGlobalDragLifecycleListeners();
      detachOutsideFocusBoundaryListener();
    });
  }, [
    domPhaseScheduler,
    editor,
    readOnly,
    rootRef,
    runtime,
    scheduleOnDOMSelectionChange,
    state,
  ]);
};
