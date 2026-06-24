import { useCallback, useEffect, useRef, useState } from 'react';
import type { Range } from '@platejs/plite';
import type { EditableDOMStrategyRuntime } from '../components/editable';
import { isSelectionPartialDOMBacked } from '../dom-strategy/dom-strategy-commands';
import { useTrackUserInput } from '../hooks/use-track-user-input';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { isRangeAcrossContentRootOwners } from './content-root-owners';
import type { DOMRepairQueue } from './dom-repair-queue';
import { createEditableInputControllerState } from './input-controller';
import type { DeferredOperation } from './model-input-strategy';
import type { rangeRef as editorRangeRef } from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';

export const useEditableRootRuntimeState = ({
  domStrategyRuntime,
  editor,
}: {
  domStrategyRuntime: EditableDOMStrategyRuntime | null;
  editor: ReactRuntimeEditor;
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const browserHandleRangeRefs = useRef(
    new Map<string, ReturnType<typeof editorRangeRef>>()
  );
  const browserHandleNextId = useRef(0);
  const deferredOperations = useRef<DeferredOperation[]>([]);
  const handledDOMBeforeInputRef = useRef(false);
  const [preferModelSelectionForInputRef] = useState(() => ({
    current: false,
  }));
  const detachNativeInputListenersRef = useRef<(() => void) | null>(null);
  const [domRepairQueueRef] = useState<{ current: DOMRepairQueue | null }>(
    () => ({
      current: null,
    })
  );
  const processing = useRef(false);
  const { onUserInput, receivedUserInput } = useTrackUserInput();

  useEffect(
    () => () => {
      browserHandleRangeRefs.current.forEach((rangeRef) => {
        rangeRef.unref();
      });
      browserHandleRangeRefs.current.clear();
    },
    [browserHandleRangeRefs]
  );

  const [domStrategyRuntimeCell] = useState(() => ({
    current: domStrategyRuntime,
  }));
  domStrategyRuntimeCell.current = domStrategyRuntime;

  const [
    explicitPartialDOMBackedSelection,
    setExplicitPartialDOMBackedSelection,
  ] = useState(false);
  const isPartialDOMBackedSelection = useCallback(
    (selection: Range | null) => {
      const currentDOMStrategyRuntime = domStrategyRuntimeCell.current;

      const partialDOMStrategySelection =
        currentDOMStrategyRuntime?.type === 'partial-dom' ||
        currentDOMStrategyRuntime?.type === 'staged' ||
        currentDOMStrategyRuntime?.type === 'virtualized'
          ? isSelectionPartialDOMBacked(
              selection,
              currentDOMStrategyRuntime.mountedTopLevelRuntimeIds,
              currentDOMStrategyRuntime.mountedTopLevelRanges ?? null
            )
          : false;

      return (
        partialDOMStrategySelection ||
        isRangeAcrossContentRootOwners(editor, selection)
      );
    },
    [domStrategyRuntimeCell, editor]
  );
  const modelSelection = readRuntimeSelection(editor);
  const modelPartialDOMBackedSelection =
    isPartialDOMBackedSelection(modelSelection);
  const partialDOMBackedSelection =
    explicitPartialDOMBackedSelection || modelPartialDOMBackedSelection;

  useEffect(() => {
    if (explicitPartialDOMBackedSelection && !modelPartialDOMBackedSelection) {
      setExplicitPartialDOMBackedSelection(false);
    }
  }, [explicitPartialDOMBackedSelection, modelPartialDOMBackedSelection]);

  const [controllerState] = useState(createEditableInputControllerState);

  return {
    browserHandleNextId,
    browserHandleRangeRefs,
    controllerState,
    deferredOperations,
    detachNativeInputListenersRef,
    domRepairQueueRef,
    handledDOMBeforeInputRef,
    isComposing,
    isPartialDOMBackedSelection,
    onUserInput,
    partialDOMBackedSelection,
    preferModelSelectionForInputRef,
    processing,
    receivedUserInput,
    rootRef,
    setExplicitPartialDOMBackedSelection,
    setIsComposing,
  };
};
