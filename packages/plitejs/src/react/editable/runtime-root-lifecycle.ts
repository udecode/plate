import type { RefObject } from 'react';

import { containsShadowAware, getSelection, isDOMNode } from '../../dom';
import { type DOMPhaseScheduler, IS_FOCUSED } from '../../dom/internal';
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
import { writeRuntimeSelection } from './runtime-mutation-state';

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
  let outsideFocusBoundaryRevision = 0;
  const releaseRootOwnedNativeState = () => {
    const rootElement = rootRef.current;

    if (!rootElement?.isConnected) {
      return false;
    }

    let hadRootOwnedNativeState = false;
    const { activeElement } = targetDocument;
    const root = rootElement.getRootNode() as Document | ShadowRoot;
    const selection = getSelection(root);

    if (
      readOnly &&
      (isDOMTargetInAnotherSelectionView(editor, rootElement, activeElement) ||
        isDOMTargetInAnotherSelectionView(
          editor,
          rootElement,
          selection?.anchorNode ?? null
        ) ||
        isDOMTargetInAnotherSelectionView(
          editor,
          rootElement,
          selection?.focusNode ?? null
        ))
    ) {
      return undefined;
    }
    const hasReadOnlyModelSelection =
      readOnly && Boolean(editor.read((innerState) => innerState.selection()));

    if (
      targetWindow &&
      activeElement instanceof targetWindow.HTMLElement &&
      containsShadowAware(rootElement, activeElement)
    ) {
      activeElement.blur();
      hadRootOwnedNativeState = true;
    }

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
      return undefined;
    }

    IS_FOCUSED.delete(editor);
    setEditorFocused(editor, false);
    publishFocusState();

    if (hasReadOnlyModelSelection) {
      writeRuntimeSelection(editor, null);
    }

    return true;
  };

  const handleOutsidePress = (event: PointerEvent | MouseEvent) => {
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

  const handleOutsidePointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') return;

    handleOutsidePress(event);
  };
  const handleOutsideMouseDown = (event: MouseEvent) => {
    handleOutsidePress(event);
  };
  const handleFocusIn = (event: FocusEvent) => {
    const rootElement = rootRef.current;

    if (
      rootElement &&
      isDOMNode(event.target) &&
      containsShadowAware(rootElement, event.target)
    ) {
      outsideFocusBoundaryRevision += 1;
      state.outsideFocusBoundarySettleUntil = 0;
    }
  };

  if (targetWindow?.PointerEvent) {
    targetDocument.addEventListener('pointerdown', handleOutsidePointerDown);
  }
  targetDocument.addEventListener('mousedown', handleOutsideMouseDown);
  targetDocument.addEventListener('focusin', handleFocusIn);

  return () => {
    outsideFocusBoundaryRevision += 1;
    if (targetWindow?.PointerEvent) {
      targetDocument.removeEventListener(
        'pointerdown',
        handleOutsidePointerDown
      );
    }
    targetDocument.removeEventListener('mousedown', handleOutsideMouseDown);
    targetDocument.removeEventListener('focusin', handleFocusIn);
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
        targetDocument: window.document,
      });

    return runtime.installDisposable('global-listeners', () => {
      detachGlobalDragLifecycleListeners();
      detachOutsideFocusBoundaryListener();
    });
  }, [domPhaseScheduler, editor, readOnly, rootRef, runtime, state]);
};
