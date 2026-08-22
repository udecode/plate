import type { Anchor, Range } from '@platejs/plite';
import type { DOMPhaseScheduler } from '@platejs/plite-dom/internal';
import type { RefObject } from 'react';

import type { EditableDOMStrategyScrollAlign } from '../components/editable';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { attachPliteBrowserHandle } from './browser-handle';
import type { EditableInputController } from './input-state';

export const useRuntimeBrowserHandle = ({
  browserHandleNextId,
  browserHandleRangeAnchors,
  domPhaseScheduler,
  editor,
  forceRender,
  flushPendingNativeTextInput,
  inputController,
  isPartialDOMBackedSelection,
  rootRef,
  scrollPathIntoView,
  setExplicitPartialDOMBackedSelection,
}: {
  browserHandleNextId: RefObject<number>;
  browserHandleRangeAnchors: RefObject<Map<string, Anchor<Range>>>;
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  forceRender: () => void;
  flushPendingNativeTextInput?: () => void;
  inputController: EditableInputController;
  isPartialDOMBackedSelection: (selection: Range | null) => boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  scrollPathIntoView?: (
    path: Range['anchor']['path'],
    align?: EditableDOMStrategyScrollAlign
  ) => boolean;
  setExplicitPartialDOMBackedSelection: (nextValue: boolean) => void;
}) => {
  useIsomorphicLayoutEffect(() => {
    if (!rootRef.current) {
      return undefined;
    }

    return attachPliteBrowserHandle({
      browserHandleNextId,
      browserHandleRangeAnchors,
      domPhaseScheduler,
      editor,
      element: rootRef.current,
      inputController,
      forceRender,
      flushPendingNativeTextInput,
      isPartialDOMBackedSelection,
      scrollPathIntoView,
      setExplicitPartialDOMBackedSelection,
    });
  }, [
    browserHandleNextId,
    browserHandleRangeAnchors,
    domPhaseScheduler,
    editor,
    forceRender,
    flushPendingNativeTextInput,
    inputController,
    isPartialDOMBackedSelection,
    rootRef,
    scrollPathIntoView,
    setExplicitPartialDOMBackedSelection,
  ]);
};
