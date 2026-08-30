import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Range } from '../..';
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
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] Editor identity owns the runtime; the adjacent committed effect updates read-only and DOM-strategy inputs without replacing it.
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
      // oxlint-disable-next-line react-doctor/no-adjust-state-on-prop-change -- [P0 behavior-boundary] The explicit partial-selection flag is external runtime state; clear it only after the editor model catches up.
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
