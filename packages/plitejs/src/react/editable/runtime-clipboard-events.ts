import {
  type ClipboardEvent as ReactClipboardEvent,
  useCallback,
  useEffect,
} from 'react';

import { SelectionApi } from '../..';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  applyEditableCopy,
  applyEditableCut,
  applyEditablePaste,
} from './clipboard-input-strategy';
import { prepareEditableClipboardKernel } from './editing-kernel';
import {
  useEditableClipboardHandler,
  useEditablePasteHandler,
} from './input-router';
import {
  type EditableInputController,
  recordEditableInputIntent,
} from './input-state';
import type { EditableEventRuntime } from './runtime-event-engine';
import { readRuntimeSelection } from './runtime-selection-state';

type ClipboardHandler = (
  event: ReactClipboardEvent<HTMLDivElement>
) => boolean | void;

const routeClipboardEventToRoot = (
  event: globalThis.ClipboardEvent,
  root: HTMLDivElement
) => {
  let propagationStopped = false;

  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === 'currentTarget' || property === 'target') return root;
        if (property === 'isDefaultPrevented') {
          return () => event.defaultPrevented;
        }
        if (property === 'isPropagationStopped') {
          return () => propagationStopped;
        }
        if (property === 'nativeEvent') return event;
        if (property === 'persist') return () => {};
        if (property === 'stopPropagation') {
          return () => {
            propagationStopped = true;
            event.stopPropagation();
          };
        }

        const value = Reflect.get(event, property, event);

        return typeof value === 'function' ? value.bind(event) : value;
      },
    }
  ) as unknown as ReactClipboardEvent<HTMLDivElement>;
};

export const useRuntimeClipboardEvents = ({
  editor,
  inputController,
  flushPendingNativeTextInput,
  onCopy,
  onCut,
  onPaste,
  readOnly,
  repair,
  setExplicitPartialDOMBackedSelection,
  partialDOMBackedSelection,
  rootRef,
  trace,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  flushPendingNativeTextInput?: () => void;
  onCopy?: ClipboardHandler;
  onCut?: ClipboardHandler;
  onPaste?: ClipboardHandler;
  readOnly: boolean;
  repair: EditableEventRuntime['repair'];
  setExplicitPartialDOMBackedSelection: (nextValue: boolean) => void;
  partialDOMBackedSelection: boolean;
  rootRef: { current: HTMLDivElement | null };
  trace: EditableEventRuntime['trace'];
}) => {
  const handlePaste = useCallback(
    (event: ReactClipboardEvent<HTMLDivElement>) => {
      flushPendingNativeTextInput?.();
      const decision = prepareEditableClipboardKernel({
        editor,
        event,
        inputController,
      });
      recordEditableInputIntent(inputController, decision.intent);
      trace.beginKernelEventFrame({
        family: 'paste',
        intent: decision.intent,
        target: event.target,
      });
      const pasteResult = applyEditablePaste({
        editor,
        event,
        onPaste,
        readOnly,
        partialDOMBackedSelection,
      });
      if (pasteResult.repair) {
        repair.requestEditableRepair(pasteResult.repair);
      }
      if (pasteResult.explicitPartialDOMBackedSelection !== undefined) {
        setExplicitPartialDOMBackedSelection(
          pasteResult.explicitPartialDOMBackedSelection
        );
      }
      trace.recordKernelEventTrace({
        command: pasteResult.command,
        family: 'paste',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
    },
    [
      editor,
      flushPendingNativeTextInput,
      inputController,
      onPaste,
      readOnly,
      repair,
      setExplicitPartialDOMBackedSelection,
      partialDOMBackedSelection,
      trace,
    ]
  );
  const onRuntimePaste = useEditablePasteHandler({ handlePaste });

  const handleCopy = useCallback(
    (event: ReactClipboardEvent<HTMLDivElement>) => {
      flushPendingNativeTextInput?.();
      const decision = prepareEditableClipboardKernel({
        editor,
        event,
        inputController,
      });
      recordEditableInputIntent(inputController, decision.intent);
      trace.recordKernelEventTrace({
        family: 'copy',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
      applyEditableCopy({
        editor,
        event,
        onCopy,
      });
    },
    [editor, flushPendingNativeTextInput, inputController, onCopy, trace]
  );
  const onRuntimeCopy = useEditableClipboardHandler({
    handleClipboard: handleCopy,
  });

  const handleCut = useCallback(
    (event: ReactClipboardEvent<HTMLDivElement>) => {
      flushPendingNativeTextInput?.();
      const decision = prepareEditableClipboardKernel({
        editor,
        event,
        inputController,
      });
      recordEditableInputIntent(inputController, decision.intent);
      trace.beginKernelEventFrame({
        family: 'cut',
        intent: decision.intent,
        target: event.target,
      });
      const cutResult = applyEditableCut({
        editor,
        event,
        onCut,
        readOnly,
      });
      if (cutResult.repair) {
        repair.requestEditableRepair(cutResult.repair);
      }
      trace.recordKernelEventTrace({
        command: cutResult.command,
        family: 'cut',
        intent: decision.intent,
        ownership: decision.ownership,
        target: event.target,
      });
    },
    [
      editor,
      flushPendingNativeTextInput,
      inputController,
      onCut,
      readOnly,
      repair,
      trace,
    ]
  );
  const onRuntimeCut = useEditableClipboardHandler({
    handleClipboard: handleCut,
  });

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return undefined;

    const document = root.ownerDocument;
    const route = (event: globalThis.ClipboardEvent) => {
      if (
        event.defaultPrevented ||
        document.activeElement !== root ||
        (event.target !== null && root.contains(event.target as Node)) ||
        !SelectionApi.isNode(readRuntimeSelection(editor))
      ) {
        return;
      }

      const routedEvent = routeClipboardEventToRoot(event, root);

      if (event.type === 'copy') {
        onRuntimeCopy(routedEvent);
      } else if (event.type === 'cut') {
        onRuntimeCut(routedEvent);
      } else {
        onRuntimePaste(routedEvent);
      }
    };

    document.addEventListener('copy', route, true);
    document.addEventListener('cut', route, true);
    document.addEventListener('paste', route, true);

    return () => {
      document.removeEventListener('copy', route, true);
      document.removeEventListener('cut', route, true);
      document.removeEventListener('paste', route, true);
    };
  }, [editor, onRuntimeCopy, onRuntimeCut, onRuntimePaste, rootRef]);

  return {
    onCopy: onRuntimeCopy,
    onCut: onRuntimeCut,
    onPaste: onRuntimePaste,
  };
};
