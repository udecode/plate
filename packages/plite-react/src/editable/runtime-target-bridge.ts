import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type { DOMPhaseScheduler } from '@platejs/plite-dom/internal';
import { resolveEditableImplicitTarget } from './input-controller';
import type { EditableInputController } from './input-state';
import { writeTargetRuntime } from './runtime-mutation-state';

export const useRuntimeTargetBridge = ({
  domPhaseScheduler,
  editor,
  inputController,
  syncDOMSelectionToEditor,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
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
            domPhaseScheduler.schedule(
              'selection-repair',
              'implicit-target-selection-sync',
              callback,
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
  }, [domPhaseScheduler, editor, inputController, syncDOMSelectionToEditor]);
};
