import { useCallback, useMemo, useReducer } from 'react';
import { EDITOR_TO_FORCE_RENDER } from '@platejs/plite-dom/internal';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { createDOMRepairQueue } from './dom-repair-queue';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import {
  applyEditableRepairRequest,
  type EditableRepairRequest,
} from './mutation-controller';

export const useRuntimeRepairEngine = ({
  runtime,
  scrollSelectionIntoView,
  syncDOMSelectionToEditor,
}: {
  runtime: EditableDOMRuntime;
  scrollSelectionIntoView: Parameters<
    typeof createDOMRepairQueue
  >[0]['scrollSelectionIntoView'];
  syncDOMSelectionToEditor: () => void;
}) => {
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const { domPhaseScheduler, editor, inputController } = runtime;
  const domRepairQueue = useMemo(
    () =>
      createDOMRepairQueue({
        domPhaseScheduler,
        editor,
        inputController,
        scrollSelectionIntoView,
        syncDOMSelectionToEditor,
      }),
    [
      domPhaseScheduler,
      editor,
      inputController,
      scrollSelectionIntoView,
      syncDOMSelectionToEditor,
    ]
  );

  useIsomorphicLayoutEffect(() => {
    EDITOR_TO_FORCE_RENDER.set(editor, forceRender);

    return runtime.installDisposable('force-render', () => {
      if (EDITOR_TO_FORCE_RENDER.get(editor) === forceRender) {
        EDITOR_TO_FORCE_RENDER.delete(editor);
      }
    });
  }, [editor, forceRender, runtime]);

  runtime.domRepairQueueRef.current = domRepairQueue;

  runtime.updateDOMIntegrityRepairHandler(() => {
    forceRender();
    domPhaseScheduler.schedule(
      'selection-repair',
      'dom-integrity-selection-export',
      syncDOMSelectionToEditor,
      {
        key: 'dom-integrity-selection-export',
        timing: 'microtask',
      }
    );
  });

  const requestEditableRepair = useCallback(
    (request: EditableRepairRequest) => {
      applyEditableRepairRequest({
        domPhaseScheduler,
        domRepairQueue,
        editor,
        forceRender,
        inputController,
        request,
        syncDOMSelectionToEditor,
      });
    },
    [
      domPhaseScheduler,
      domRepairQueue,
      editor,
      forceRender,
      inputController,
      syncDOMSelectionToEditor,
    ]
  );

  return {
    domRepairQueue,
    forceRender,
    requestEditableRepair,
  };
};
