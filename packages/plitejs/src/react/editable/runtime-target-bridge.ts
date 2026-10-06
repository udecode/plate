import { setTargetRuntime } from '../../core/target-runtime';
import type { DOMPhaseScheduler } from '../../dom/internal';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { resolveEditableImplicitTarget } from './input-controller';
import type { EditableInputController } from './input-state';
import { applyRetainedViewSelectionMarkCommand } from './mutation-controller';

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
    setTargetRuntime(editor, {
      dispatchImplicitCommand(command, input) {
        return applyRetainedViewSelectionMarkCommand(editor, command, input);
      },
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
      setTargetRuntime(editor, null);
    };
  }, [domPhaseScheduler, editor, inputController, syncDOMSelectionToEditor]);
};
