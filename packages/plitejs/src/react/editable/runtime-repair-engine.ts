import { useCallback, useMemo, useReducer, useRef } from 'react';

import { SelectionApi, type Selection } from '../..';
import { EDITOR_TO_FORCE_RENDER } from '../../dom/internal';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { createDOMRepairQueue } from './dom-repair-queue';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import {
  applyEditableRepairRequest,
  type EditableRepairRequest,
  focusEditableRepairTarget,
} from './mutation-controller';

type PendingModelSelectionExport = {
  selection: Selection;
  version: number;
};

export const shouldExportPendingModelSelection = (
  pending: PendingModelSelectionExport,
  current: PendingModelSelectionExport,
  focused: boolean
) =>
  focused &&
  current.version === pending.version &&
  SelectionApi.equals(current.selection, pending.selection);

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
  const { domPhaseScheduler, editor, inputController } = runtime;
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const pendingFocusEditorAfterRenderRef = useRef<ReactRuntimeEditor | null>(
    null
  );
  const pendingModelSelectionExportAfterRenderRef =
    useRef<PendingModelSelectionExport | null>(null);
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

  useIsomorphicLayoutEffect(() => {
    const focusEditor = pendingFocusEditorAfterRenderRef.current;

    if (!focusEditor) return;

    pendingFocusEditorAfterRenderRef.current = null;
    focusEditableRepairTarget(focusEditor);
  });

  useIsomorphicLayoutEffect(() => {
    const pending = pendingModelSelectionExportAfterRenderRef.current;

    if (!pending) return;

    pendingModelSelectionExportAfterRenderRef.current = null;
    const current = editor.read.runtime.snapshot();

    if (
      !shouldExportPendingModelSelection(
        pending,
        current,
        ReactEditor.isFocused(editor)
      )
    ) {
      return;
    }

    syncDOMSelectionToEditor();
  });

  runtime.publishDOMRepairQueue(domRepairQueue);

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
    (
      request: EditableRepairRequest,
      options?: { focusEditor?: ReactRuntimeEditor }
    ) => {
      applyEditableRepairRequest({
        domPhaseScheduler,
        domRepairQueue,
        editor,
        focusEditor: options?.focusEditor,
        forceRender,
        inputController,
        request,
        requestFocusAfterRender: (focusEditor) => {
          pendingFocusEditorAfterRenderRef.current = focusEditor;
        },
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

  const requestModelSelectionExportAfterRender = useCallback(() => {
    const snapshot = editor.read.runtime.snapshot();
    const pending = {
      selection: snapshot.selection,
      version: snapshot.version,
    };

    pendingModelSelectionExportAfterRenderRef.current = pending;
    try {
      requestEditableRepair({ forceRender: true, kind: 'force-render' });
    } catch (error) {
      if (pendingModelSelectionExportAfterRenderRef.current === pending) {
        pendingModelSelectionExportAfterRenderRef.current = null;
      }
      throw error;
    }
  }, [editor, requestEditableRepair]);

  return {
    domRepairQueue,
    forceRender,
    requestEditableRepair,
    requestModelSelectionExportAfterRender,
  };
};
