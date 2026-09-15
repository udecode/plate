import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Range } from '../..';
import type { EditableViewportRuntime } from '../components/editable';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  EditableDOMRuntime,
  isEditableDOMSelectionPartial,
} from './editable-dom-runtime';
import { readRuntimeSelectionRange } from './runtime-selection-state';

export const useEditableRootRuntimeState = ({
  viewportRuntime,
  editor,
  readOnly,
}: {
  viewportRuntime: EditableViewportRuntime | null;
  editor: ReactRuntimeEditor;
  readOnly: boolean;
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [explicitViewportBackedSelection, setExplicitViewportBackedSelection] =
    useState(false);
  const runtime = useMemo(
    () =>
      new EditableDOMRuntime({
        viewportRuntime,
        editor,
        onComposingChange: setIsComposing,
        onViewportBackedSelectionChange: setExplicitViewportBackedSelection,
        readOnly,
      }),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] Editor identity owns the runtime; the adjacent committed effect updates read-only and viewport inputs without replacing it.
    [editor]
  );

  useIsomorphicLayoutEffect(() => {
    runtime.update({
      viewportRuntime,
      onComposingChange: setIsComposing,
      onViewportBackedSelectionChange: setExplicitViewportBackedSelection,
      readOnly,
    });
  }, [viewportRuntime, readOnly, runtime]);

  useIsomorphicLayoutEffect(() => runtime.connect(), [runtime]);

  const isViewportBackedSelection = useCallback(
    (selection: Range | null) =>
      isEditableDOMSelectionPartial({
        viewportRuntime,
        editor,
        selection,
      }),
    [viewportRuntime, editor]
  );
  const modelSelection = readRuntimeSelectionRange(editor);
  const modelViewportBackedSelection =
    isViewportBackedSelection(modelSelection);
  const viewportBackedSelection =
    explicitViewportBackedSelection || modelViewportBackedSelection;

  useEffect(() => {
    if (explicitViewportBackedSelection && !modelViewportBackedSelection) {
      // oxlint-disable-next-line react-doctor/no-adjust-state-on-prop-change -- [P0 behavior-boundary] The explicit partial-selection flag is external runtime state; clear it only after the editor model catches up.
      setExplicitViewportBackedSelection(false);
    }
  }, [explicitViewportBackedSelection, modelViewportBackedSelection]);

  return {
    isComposing,
    isViewportBackedSelection,
    viewportBackedSelection,
    runtime,
  };
};
