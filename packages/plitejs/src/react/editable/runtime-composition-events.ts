import { type CompositionEvent, useCallback, useContext, useMemo } from 'react';

import { DecorationContext } from '../decoration-context';
import { useRebuildLine } from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  grantCompositionLease,
  settleCompositionLeaseAndFlushRender,
  settleCompositionLease,
} from './composition-lease';
import {
  applyEditableCompositionEnd,
  applyEditableCompositionStart,
  applyEditableCompositionUpdate,
  type EditableCompositionLeaseBinding,
} from './composition-state';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import { prepareEditableCompositionKernel } from './editing-kernel';
import { useEditableCompositionHandler } from './input-router';
import {
  type EditableInputController,
  recordEditableInputIntent,
} from './input-state';
import type { EditableEventRuntime } from './runtime-event-engine';

type CompositionHandler = (
  event: CompositionEvent<HTMLDivElement>
) => boolean | void;

export const useEditableCompositionLease = ({
  editor,
  runtime,
}: {
  editor: ReactRuntimeEditor;
  runtime: EditableDOMRuntime;
}) => {
  const decorations = useContext(DecorationContext);
  const rebuildLine = useRebuildLine(editor);

  return useMemo<EditableCompositionLeaseBinding>(() => {
    const settleInput = () => ({
      decorations,
      editor,
      lease: runtime.compositionLease,
      rebuild: rebuildLine,
      root: runtime.rootElement,
    });

    return {
      grant: (selection) => {
        const root = runtime.rootElement;

        if (root) {
          grantCompositionLease({
            editor,
            lease: runtime.compositionLease,
            root,
            selection,
          });
        }
      },
      settleAndFlushRender: () =>
        settleCompositionLeaseAndFlushRender(settleInput()),
      settle: () => {
        runtime.runOwnedDOMMutation('composition', () => {
          settleCompositionLease(settleInput());
        });
      },
    };
  }, [decorations, editor, rebuildLine, runtime]);
};

export const useRuntimeCompositionEvents = ({
  editor,
  inputController,
  lease,
  onCompositionEnd,
  onCompositionStart,
  onCompositionUpdate,
  readOnly,
  requestModelSelectionExportAfterRender,
  runtime,
  setComposing,
  trace,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  lease: EditableCompositionLeaseBinding;
  onCompositionEnd?: CompositionHandler;
  onCompositionStart?: CompositionHandler;
  onCompositionUpdate?: CompositionHandler;
  readOnly: boolean;
  requestModelSelectionExportAfterRender: () => void;
  runtime: EditableDOMRuntime;
  setComposing: EditableEventRuntime['composition']['setComposing'];
  trace: EditableEventRuntime['trace'];
}) => {
  const handleCompositionEnd = useCallback(
    (event: CompositionEvent<HTMLDivElement>) => {
      const decision = prepareEditableCompositionKernel({
        editor,
        event,
        inputController,
      });
      recordEditableInputIntent(inputController, decision.intent);
      trace.recordKernelEventTrace({
        family: 'compositionend',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      runtime.runOwnedDOMMutation('composition', () => {
        applyEditableCompositionEnd({
          editor,
          event,
          inputController,
          lease,
          onCompositionEnd,
          readOnly,
          requestModelSelectionExportAfterRender,
          runOwnedDOMMutation: (callback) => {
            runtime.runOwnedDOMMutation('composition', callback);
          },
          scheduleTask: runtime.domPhaseScheduler.schedule,
          setComposing,
        });
      });
    },
    [
      editor,
      inputController,
      lease,
      onCompositionEnd,
      readOnly,
      requestModelSelectionExportAfterRender,
      runtime,
      setComposing,
      trace,
    ]
  );
  const onRuntimeCompositionEnd = useEditableCompositionHandler({
    handleComposition: handleCompositionEnd,
  });

  const handleCompositionStart = useCallback(
    (event: CompositionEvent<HTMLDivElement>) => {
      const decision = prepareEditableCompositionKernel({
        editor,
        event,
        inputController,
      });
      if (decision.intent !== 'composition') {
        recordEditableInputIntent(inputController, decision.intent);
      }
      trace.recordKernelEventTrace({
        family: 'compositionstart',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      runtime.runOwnedDOMMutation('composition', () => {
        applyEditableCompositionStart({
          editor,
          event,
          inputController,
          lease,
          onCompositionStart,
          readOnly,
          setComposing,
        });
      });
    },
    [
      editor,
      inputController,
      lease,
      onCompositionStart,
      readOnly,
      runtime,
      setComposing,
      trace,
    ]
  );
  const onRuntimeCompositionStart = useEditableCompositionHandler({
    handleComposition: handleCompositionStart,
  });

  const handleCompositionUpdate = useCallback(
    (event: CompositionEvent<HTMLDivElement>) => {
      const decision = prepareEditableCompositionKernel({
        editor,
        event,
        inputController,
      });
      if (decision.intent !== 'composition') {
        recordEditableInputIntent(inputController, decision.intent);
      }
      trace.recordKernelEventTrace({
        family: 'compositionupdate',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      runtime.runOwnedDOMMutation('composition', () => {
        applyEditableCompositionUpdate({
          editor,
          event,
          inputController,
          lease,
          onCompositionUpdate,
          readOnly,
          setComposing,
        });
      });
    },
    [
      editor,
      inputController,
      lease,
      onCompositionUpdate,
      readOnly,
      runtime,
      setComposing,
      trace,
    ]
  );
  const onRuntimeCompositionUpdate = useEditableCompositionHandler({
    handleComposition: handleCompositionUpdate,
  });

  return {
    onCompositionEnd: onRuntimeCompositionEnd,
    onCompositionStart: onRuntimeCompositionStart,
    onCompositionUpdate: onRuntimeCompositionUpdate,
  };
};
