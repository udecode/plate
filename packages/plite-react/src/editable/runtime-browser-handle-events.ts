import type { RefObject } from 'react';
import type { Range } from '@platejs/plite';
import type { EditableDOMStrategyScrollAlign } from '../components/editable';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  attachPliteBrowserHandle,
  type PliteBrowserHandleElement,
} from './browser-handle';
import type { EditableInputController } from './input-state';
import type { rangeRef as editorRangeRef } from './runtime-editor-api';

type DeferredInputRule = ({
  data,
  event,
  inputType,
  selection,
}: {
  data: unknown;
  event?: InputEvent;
  inputType: string;
  selection: Range | null;
}) => boolean;

export const useRuntimeBrowserHandle = ({
  applyInputRules,
  browserHandleNextId,
  browserHandleRangeRefs,
  editor,
  forceRender,
  flushPendingNativeTextInput,
  inputController,
  isPartialDOMBackedSelection,
  rootRef,
  scrollPathIntoView,
  setExplicitPartialDOMBackedSelection,
}: {
  applyInputRules: DeferredInputRule;
  browserHandleNextId: RefObject<number>;
  browserHandleRangeRefs: RefObject<
    Map<string, ReturnType<typeof editorRangeRef>>
  >;
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
      return;
    }

    return attachPliteBrowserHandle({
      browserHandleNextId,
      browserHandleRangeRefs,
      editor,
      element: rootRef.current as PliteBrowserHandleElement,
      inputController,
      applyInputRules,
      forceRender,
      flushPendingNativeTextInput,
      isPartialDOMBackedSelection,
      scrollPathIntoView,
      setExplicitPartialDOMBackedSelection,
    });
  }, [
    applyInputRules,
    browserHandleNextId,
    browserHandleRangeRefs,
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
