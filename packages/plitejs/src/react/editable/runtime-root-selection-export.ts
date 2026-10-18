import { useRequiredEditorSelectorContext } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ReactEditor } from '../plugin/react-editor';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import type { EditableDOMSelectionSyncOptions } from './input-controller';
import {
  getSelection as getEditorSelection,
  getSelectionDOMRange,
} from './runtime-editor-api';
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
      getModelSelection: () => getEditorSelection(editor),
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
      // Chromium focuses an unfocused editable when a DOM selection is written into it.
      shouldSkipDOMExport: (selection) =>
        !ReactEditor.isFocused(editor) ||
        runtime.isViewportBackedSelection(selection),
      syncDOMSelectionToEditor: (options) => {
        syncDOMSelectionToEditor(options);
        runtime.renderContract.nominateSelection();
      },
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
