import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { resolveEditableImplicitTarget } from './input-controller';
import type { EditableInputController } from './input-state';
import { writeTargetRuntime } from './runtime-mutation-state';

export const useRuntimeTargetBridge = ({
  editor,
  inputController,
  syncDOMSelectionToEditor,
}: {
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
          syncDOMSelectionToEditor,
        });
      },
    });

    return () => {
      writeTargetRuntime(editor, null);
    };
  }, [editor, inputController, syncDOMSelectionToEditor]);
};
