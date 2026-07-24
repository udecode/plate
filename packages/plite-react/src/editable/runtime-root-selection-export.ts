import { useRequiredEditorSelectorContext } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import type { EditableDOMSelectionSyncOptions } from './input-controller';
import { getSelectionDOMRange } from './runtime-editor-api';
import { subscribeSelectionOnlyDOMExport } from './selection-runtime';

export const useEditableRootSelectionExport = ({
  runtime,
  syncDOMSelectionToEditor,
}: {
  runtime: EditableDOMRuntime;
  syncDOMSelectionToEditor: (options?: EditableDOMSelectionSyncOptions) => void;
}) => {
  const { addEventListener: addSelectorEventListener } =
    useRequiredEditorSelectorContext();
  const { domPhaseScheduler, editor, inputController } = runtime;

  useIsomorphicLayoutEffect(() => {
    const unsubscribe = subscribeSelectionOnlyDOMExport({
      addSelectorEventListener,
      getDOMSelectionProjection: (selection) =>
        getSelectionDOMRange(editor, selection),
      getModelSelection: () => editor.read((state) => state.selection()),
      inputController,
      scheduleDOMExport: (callback) =>
        domPhaseScheduler.schedule(
          'selection-repair',
          'selection-dom-export',
          callback,
          {
            key: 'selection-dom-export',
            timing: 'animation-frame',
          }
        ),
      shouldSkipDOMExport: runtime.isPartialDOMBackedSelection,
      syncDOMSelectionToEditor,
    });

    return runtime.installDisposable('selection-export', unsubscribe);
  }, [
    addSelectorEventListener,
    domPhaseScheduler,
    editor,
    inputController,
    runtime,
    syncDOMSelectionToEditor,
  ]);
};
