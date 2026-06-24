import { useCallback, useMemo, useReducer } from 'react';
import { EDITOR_TO_FORCE_RENDER } from '@platejs/plite-dom/internal';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { createDOMRepairQueue } from './dom-repair-queue';
import type { EditableInputController } from './input-state';
import {
  applyEditableRepairRequest,
  type EditableRepairRequest,
} from './mutation-controller';

export const useRuntimeRepairEngine = ({
  editor,
  inputController,
  scrollSelectionIntoView,
  syncDOMSelectionToEditor,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  scrollSelectionIntoView: Parameters<
    typeof createDOMRepairQueue
  >[0]['scrollSelectionIntoView'];
  syncDOMSelectionToEditor: () => void;
}) => {
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const domRepairQueue = useMemo(
    () =>
      createDOMRepairQueue({
        editor,
        inputController,
        scrollSelectionIntoView,
        syncDOMSelectionToEditor,
      }),
    [editor, inputController, scrollSelectionIntoView, syncDOMSelectionToEditor]
  );

  useIsomorphicLayoutEffect(() => {
    EDITOR_TO_FORCE_RENDER.set(editor, forceRender);

    return () => {
      if (EDITOR_TO_FORCE_RENDER.get(editor) === forceRender) {
        EDITOR_TO_FORCE_RENDER.delete(editor);
      }
    };
  }, [editor, forceRender]);

  const requestEditableRepair = useCallback(
    (request: EditableRepairRequest) => {
      applyEditableRepairRequest({
        domRepairQueue,
        editor,
        forceRender,
        inputController,
        request,
        syncDOMSelectionToEditor,
      });
    },
    [
      domRepairQueue,
      editor,
      forceRender,
      inputController,
      syncDOMSelectionToEditor,
    ]
  );

  return { domRepairQueue, forceRender, requestEditableRepair };
};
