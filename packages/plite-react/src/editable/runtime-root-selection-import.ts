import { useMemo } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import {
  createRuntimeSelectionChangeHandler,
  createRuntimeSelectionChangeScheduler,
  createRuntimeSelectionImportController,
} from './runtime-selection-engine';

export const useEditableRootSelectionImport = ({
  runtime,
}: {
  runtime: EditableDOMRuntime;
}) => {
  const { editor, inputController, readOnly } = runtime;
  const onDOMSelectionChange = useMemo(
    () =>
      createRuntimeSelectionChangeHandler({
        androidInputManagerRef: runtime.androidInputManagerRef,
        domRepairQueueRef: runtime.domRepairQueueRef,
        editor,
        inputController,
        processing: runtime.processing,
        readOnly,
      }),
    [editor, inputController, readOnly, runtime]
  );
  const scheduleOnDOMSelectionChange = useMemo(
    () => createRuntimeSelectionChangeScheduler(onDOMSelectionChange),
    [onDOMSelectionChange]
  );

  useIsomorphicLayoutEffect(
    () =>
      runtime.installDisposable('selection-import', () => {
        scheduleOnDOMSelectionChange.cancel();
        onDOMSelectionChange.cancel();
      }),
    [onDOMSelectionChange, runtime, scheduleOnDOMSelectionChange]
  );

  const selectionImportController = useMemo(
    () =>
      createRuntimeSelectionImportController({
        editor,
        inputController,
        onDOMSelectionChange,
        scheduleOnDOMSelectionChange,
      }),
    [
      editor,
      inputController,
      onDOMSelectionChange,
      scheduleOnDOMSelectionChange,
    ]
  );

  return {
    onDOMSelectionChange,
    scheduleOnDOMSelectionChange,
    selectionImportController,
  };
};
