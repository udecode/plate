import type { Range } from '@platejs/plite';
import { useRequiredEditorSelectorContext } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type {
  EditableDOMSelectionSyncOptions,
  EditableInputController,
} from './input-controller';
import { readRuntimeSelection } from './runtime-selection-state';
import { subscribeSelectionOnlyDOMExport } from './selection-runtime';

export const useEditableRootSelectionExport = ({
  editor,
  inputController,
  isPartialDOMBackedSelection,
  syncDOMSelectionToEditor,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  isPartialDOMBackedSelection: (selection: Range | null) => boolean;
  syncDOMSelectionToEditor: (options?: EditableDOMSelectionSyncOptions) => void;
}) => {
  const { addEventListener: addSelectorEventListener } =
    useRequiredEditorSelectorContext();

  useIsomorphicLayoutEffect(
    () =>
      subscribeSelectionOnlyDOMExport({
        addSelectorEventListener,
        getModelSelection: () => readRuntimeSelection(editor),
        inputController,
        shouldSkipDOMExport: (modelSelection) =>
          isPartialDOMBackedSelection(modelSelection),
        syncDOMSelectionToEditor,
      }),
    [
      addSelectorEventListener,
      editor,
      inputController,
      isPartialDOMBackedSelection,
      syncDOMSelectionToEditor,
    ]
  );
};
