import { useMemo } from 'react';

import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import {
  createRuntimeSelectionChangeHandler,
  createRuntimeSelectionChangeScheduler,
  createRuntimeSelectionImportController,
} from './runtime-selection-engine';

export const useEditableRootSelectionImport = ({
  readOnly,
  runtime,
}: {
  readOnly: boolean;
  runtime: EditableDOMRuntime;
}) => {
  const { editor, inputController } = runtime;
  const onDOMSelectionChange = useMemo(
    () =>
      createRuntimeSelectionChangeHandler({
        androidInputManagerRef: runtime.androidInputManagerRef,
        domRepairQueueRef: runtime.domRepairQueueRef,
        editor,
        inputController,
        webKitProbeActive: runtime.webKitProbeActive,
        readOnly,
        rootRef: runtime.rootRef,
      }),
    [editor, inputController, readOnly, runtime]
  );
  const scheduleOnDOMSelectionChange = useMemo(
    () => createRuntimeSelectionChangeScheduler(onDOMSelectionChange),
    [onDOMSelectionChange]
  );

  useIsomorphicLayoutEffect(() => {
    const dispose = runtime.installDisposable('selection-import', () => {
      scheduleOnDOMSelectionChange.cancel();
      onDOMSelectionChange.cancel();
    });

    // An import the previous handlers left pending still owns the browser's
    // move, so it runs on these handlers and ends the flag and the hold itself.
    if (inputController.state.pendingDOMSelectionImport) {
      scheduleOnDOMSelectionChange();
    }
    return dispose;
  }, [
    inputController,
    onDOMSelectionChange,
    runtime,
    scheduleOnDOMSelectionChange,
  ]);

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
