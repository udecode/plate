import type { RefObject } from 'react';

import {
  clearCaretUnlessHeldElsewhere,
  mayClearCaret,
} from '../../core/view-carets';
import { containsShadowAware, getSelection } from '../../dom';
import {
  clearEditableDOMSelection,
  type DOMPhaseScheduler,
  focusedElementOnPage,
  IS_FOCUSED,
  isEventInsideRoot,
  observeRootBoundaryEvent,
  readEditableDOMSelectionPoints,
} from '../../dom/internal';
import { isDOMHTMLElement } from '../../dom/utils/dom';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  type EditableDOMRuntime,
  isDOMTargetInAnotherSelectionView,
} from './editable-dom-runtime';
import {
  type EditableInputControllerState,
  getEditableInputTimestamp,
} from './input-controller';
import { attachEditableGlobalDragLifecycleListeners } from './input-router';
import { setEditorFocused } from './runtime-editor-api';

export const attachEditableOutsideFocusBoundaryListener = ({
  domPhaseScheduler,
  editor,
  publishFocusState,
  readOnly,
  rootRef,
  state,
  subscribeRootChange,
  targetDocument,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  publishFocusState: () => void;
  readOnly: boolean;
  rootRef: RefObject<HTMLElement | null>;
  state: EditableInputControllerState;
  subscribeRootChange?: (
    listener: (node: HTMLElement | null) => void
  ) => () => void;
  targetDocument: Document;
}) => {
  let outsideFocusBoundaryRevision = 0;
  const releaseRootOwnedNativeState = () => {
    const rootElement = rootRef.current;

    if (!rootElement?.isConnected) {
      return false;
    }

    let hadRootOwnedNativeState = false;
    const root = rootElement.getRootNode() as Document | ShadowRoot;
    const activeElement = focusedElementOnPage(rootElement);
    const selection = getSelection(root);
    const selectionPoints = readEditableDOMSelectionPoints(
      rootElement,
      selection
    );
    const anchorNode =
      selectionPoints?.anchor[0] ?? selection?.anchorNode ?? null;
    const focusNode = selectionPoints?.focus[0] ?? selection?.focusNode ?? null;

    if (
      readOnly &&
      (isDOMTargetInAnotherSelectionView(editor, rootElement, activeElement) ||
        isDOMTargetInAnotherSelectionView(editor, rootElement, anchorNode) ||
        isDOMTargetInAnotherSelectionView(editor, rootElement, focusNode))
    ) {
      // Keep the sibling's native selection, but release this view's focus.
      if (ReactEditor.isFocused(editor)) {
        IS_FOCUSED.delete(editor);
        setEditorFocused(editor, false);
        publishFocusState();
      }
      return undefined;
    }
    const holdsReadOnlyCaret =
      readOnly &&
      mayClearCaret(editor) &&
      Boolean(editor.read((innerState) => innerState.selection()));

    if (
      isDOMHTMLElement(activeElement) &&
      containsShadowAware(rootElement, activeElement)
    ) {
      activeElement.blur();
      hadRootOwnedNativeState = true;
    }

    const selectionInRoot =
      containsShadowAware(rootElement, anchorNode) ||
      containsShadowAware(rootElement, focusNode);

    if (selectionInRoot) {
      hadRootOwnedNativeState = true;
      if (readOnly) {
        clearEditableDOMSelection(rootElement, { editor, policy: 'owned' });
      }
    }

    if (holdsReadOnlyCaret) {
      hadRootOwnedNativeState = true;
    }

    if (!hadRootOwnedNativeState) {
      return undefined;
    }

    IS_FOCUSED.delete(editor);
    setEditorFocused(editor, false);
    publishFocusState();

    if (holdsReadOnlyCaret) {
      clearCaretUnlessHeldElsewhere(editor);
    }

    return true;
  };

  // A touch or pen tap also sends a compatibility mousedown before its click,
  // so every pointer decides here, where a control keeps the editor's focus
  // by preventing mousedown.
  const handleOutsideMouseDown = (event: MouseEvent, inRoot: boolean) => {
    const rootElement = rootRef.current;

    if (!rootElement || event.defaultPrevented || inRoot) {
      return;
    }

    outsideFocusBoundaryRevision += 1;
    const releaseRevision = outsideFocusBoundaryRevision;

    state.outsideFocusBoundarySettleUntil = getEditableInputTimestamp() + 100;
    domPhaseScheduler.schedule(
      'dom-write',
      'release-outside-focus-native-state',
      () => {
        if (releaseRevision !== outsideFocusBoundaryRevision) return;

        releaseRootOwnedNativeState();
      },
      {
        key: 'release-outside-focus-native-state',
        timing: 'timeout',
      }
    );
  };

  const handleFocusIn = (inRoot: boolean) => {
    if (inRoot) {
      outsideFocusBoundaryRevision += 1;
      state.outsideFocusBoundarySettleUntil = 0;
    }
  };

  let detachCurrent: (() => void) | null = null;
  const bindForRoot = (mountedRoot: HTMLElement | null) => {
    detachCurrent?.();
    detachCurrent = null;

    if (mountedRoot) {
      const detachMouseDown = observeRootBoundaryEvent(
        mountedRoot,
        'mousedown',
        (event, { inRoot }) => handleOutsideMouseDown(event, inRoot),
        { capture: false, scope: 'document' }
      );
      // Capture, so a refocus ends the window before the editor's own focus
      // handler, which React runs at its root, reads it.
      const detachFocusIn = observeRootBoundaryEvent(
        mountedRoot,
        'focusin',
        (_event, { inRoot }) => handleFocusIn(inRoot),
        { capture: true, filter: 'inside', scope: 'document' }
      );

      detachCurrent = () => {
        detachMouseDown();
        detachFocusIn();
      };
      return;
    }

    const fallbackMouseDown = (event: MouseEvent) => {
      const rootElement = rootRef.current;

      if (!rootElement) return;
      handleOutsideMouseDown(event, isEventInsideRoot(rootElement, event));
    };
    const fallbackFocusIn = (event: FocusEvent) => {
      const rootElement = rootRef.current;

      if (!rootElement) return;
      handleFocusIn(isEventInsideRoot(rootElement, event));
    };

    targetDocument.addEventListener('mousedown', fallbackMouseDown);
    targetDocument.addEventListener('focusin', fallbackFocusIn, true);
    detachCurrent = () => {
      targetDocument.removeEventListener('mousedown', fallbackMouseDown);
      targetDocument.removeEventListener('focusin', fallbackFocusIn, true);
    };
  };

  bindForRoot(rootRef.current);
  const unsubscribeRootChange = subscribeRootChange?.((nextRoot) => {
    bindForRoot(nextRoot);
  });

  return () => {
    outsideFocusBoundaryRevision += 1;
    unsubscribeRootChange?.();
    detachCurrent?.();
    detachCurrent = null;
  };
};

export const useEditableRootGlobalLifecycle = ({
  readOnly,
  runtime,
}: {
  readOnly: boolean;
  runtime: EditableDOMRuntime;
}) => {
  const { domPhaseScheduler, editor, rootRef, state } = runtime;

  useIsomorphicLayoutEffect(() => {
    const window =
      rootRef.current?.ownerDocument.defaultView ??
      ReactEditor.getWindow(editor);
    const detachGlobalDragLifecycleListeners =
      attachEditableGlobalDragLifecycleListeners({
        editor,
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
        subscribeRootChange: (listener) =>
          runtime.subscribeRootChange(listener),
        targetDocument: window.document,
      });

    return runtime.installDisposable('global-listeners', () => {
      detachGlobalDragLifecycleListeners();
      detachOutsideFocusBoundaryListener();
    });
  }, [domPhaseScheduler, editor, readOnly, rootRef, runtime, state]);
};
