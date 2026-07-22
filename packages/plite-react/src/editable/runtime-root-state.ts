import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Range } from '@platejs/plite';
import type { EditableDOMStrategyRuntime } from '../components/editable';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  EditableDOMRuntime,
  isEditableDOMSelectionPartial,
} from './editable-dom-runtime';
import { readRuntimeSelectionRange } from './runtime-selection-state';

export const useEditableRootRuntimeState = ({
  domStrategyRuntime,
  editor,
  readOnly,
}: {
  domStrategyRuntime: EditableDOMStrategyRuntime | null;
  editor: ReactRuntimeEditor;
  readOnly: boolean;
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [
    explicitPartialDOMBackedSelection,
    setExplicitPartialDOMBackedSelection,
  ] = useState(false);
  const runtime = useMemo(
    () =>
      new EditableDOMRuntime({
        domStrategyRuntime,
        editor,
        onComposingChange: setIsComposing,
        onPartialDOMBackedSelectionChange: setExplicitPartialDOMBackedSelection,
        readOnly,
      }),
    [editor]
  );

  useIsomorphicLayoutEffect(() => {
    runtime.update({
      domStrategyRuntime,
      onComposingChange: setIsComposing,
      onPartialDOMBackedSelectionChange: setExplicitPartialDOMBackedSelection,
      readOnly,
    });
  }, [domStrategyRuntime, readOnly, runtime]);

  useIsomorphicLayoutEffect(() => runtime.connect(), [runtime]);

  const isPartialDOMBackedSelection = useCallback(
    (selection: Range | null) =>
      isEditableDOMSelectionPartial({
        domStrategyRuntime,
        editor,
        selection,
      }),
    [domStrategyRuntime, editor]
  );
  const modelSelection = readRuntimeSelectionRange(editor);
  const modelPartialDOMBackedSelection =
    isPartialDOMBackedSelection(modelSelection);
  const partialDOMBackedSelection =
    explicitPartialDOMBackedSelection || modelPartialDOMBackedSelection;

  useEffect(() => {
    if (explicitPartialDOMBackedSelection && !modelPartialDOMBackedSelection) {
      setExplicitPartialDOMBackedSelection(false);
    }
  }, [explicitPartialDOMBackedSelection, modelPartialDOMBackedSelection]);

  return {
    isComposing,
    isPartialDOMBackedSelection,
    partialDOMBackedSelection,
    runtime,
  };
};
