import type { RefObject } from 'react';

import type { Anchor, Range } from '../..';
import type { DOMPhaseScheduler } from '../../dom/internal';
import type { EditableViewportScrollAlign } from '../components/editable';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type { attachPliteBrowserHandle } from './browser-handle';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import type { EditableInputController } from './input-state';

// A static import would keep the handle in every production bundle.
let attachBrowserHandle: typeof attachPliteBrowserHandle | null = null;

export const registerBrowserHandle = (
  attach: typeof attachPliteBrowserHandle
) => {
  attachBrowserHandle = attach;
};

export const useRuntimeBrowserHandle = ({
  browserHandleNextId,
  browserHandleRangeAnchors,
  domPhaseScheduler,
  editor,
  forceRender,
  flushPendingNativeTextInput,
  inputController,
  isViewportBackedSelection,
  rootRef,
  runtime,
  scrollPathIntoView,
  setExplicitViewportBackedSelection,
}: {
  browserHandleNextId: RefObject<number>;
  browserHandleRangeAnchors: RefObject<Map<string, Anchor<Range>>>;
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  forceRender: () => void;
  flushPendingNativeTextInput?: () => void;
  inputController: EditableInputController;
  isViewportBackedSelection: (selection: Range | null) => boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  runtime: EditableDOMRuntime;
  scrollPathIntoView?: (
    path: Range['anchor']['path'],
    align?: EditableViewportScrollAlign
  ) => boolean;
  setExplicitViewportBackedSelection: (nextValue: boolean) => void;
}) => {
  useIsomorphicLayoutEffect(() => {
    if (!rootRef.current || !attachBrowserHandle) {
      return undefined;
    }

    return attachBrowserHandle({
      browserHandleNextId,
      browserHandleRangeAnchors,
      domPhaseScheduler,
      editor,
      element: rootRef.current,
      inputController,
      forceRender,
      flushPendingNativeTextInput,
      isViewportBackedSelection,
      dispatchHistory: runtime.dispatchHistory.bind(runtime),
      scrollPathIntoView,
      setExplicitViewportBackedSelection,
    });
  }, [
    browserHandleNextId,
    browserHandleRangeAnchors,
    domPhaseScheduler,
    editor,
    forceRender,
    flushPendingNativeTextInput,
    inputController,
    isViewportBackedSelection,
    rootRef,
    runtime,
    scrollPathIntoView,
    setExplicitViewportBackedSelection,
  ]);
};
