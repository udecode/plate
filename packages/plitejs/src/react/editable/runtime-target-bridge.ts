import { getPlacementGeneration } from '../../core/view-carets';
import type { DOMPhaseScheduler } from '../../dom/internal';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { resolveEditableImplicitTarget } from './input-controller';
import {
  type EditableInputController,
  getDeferredSelectionWriteStatus,
} from './input-state';
import { writeTargetRuntime } from './runtime-mutation-state';

export const useRuntimeTargetBridge = ({
  domPhaseScheduler,
  editor,
  inputController,
  rootRef,
  syncDOMSelectionToEditor,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  rootRef: Readonly<{ current: HTMLElement | null }>;
  syncDOMSelectionToEditor: () => void;
}) => {
  useIsomorphicLayoutEffect(() => {
    writeTargetRuntime(editor, {
      resolveImplicitTarget(_editor, request) {
        return resolveEditableImplicitTarget({
          editor,
          inputController,
          request,
          scheduleSelectionSync: (callback) => {
            const receipt = getPlacementGeneration(editor);

            domPhaseScheduler.schedule(
              'selection-repair',
              'implicit-target-selection-sync',
              () => {
                if (
                  getDeferredSelectionWriteStatus({
                    editable: rootRef.current,
                    editor,
                    inputController,
                    receipt,
                  }) !== 'ready'
                ) {
                  return;
                }
                callback();
              },
              { timing: 'timeout' }
            );
          },
          syncDOMSelectionToEditor,
        });
      },
    });

    return () => {
      writeTargetRuntime(editor, null);
    };
  }, [
    domPhaseScheduler,
    editor,
    inputController,
    rootRef,
    syncDOMSelectionToEditor,
  ]);
};
