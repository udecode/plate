import { useCallback, useRef } from 'react';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import type { DOMInputRepair, DOMRepairQueue } from './dom-repair-queue';
import {
  beginEditableEditingEpoch,
  beginOrJoinEditableEditingEpoch,
  isEditableEditingEpochCommand,
} from './editing-epoch-kernel';
import {
  beginEditableEventFrame,
  createEditableKernelResult,
  type EditableBrowserEventFamily,
  type EditableCommand,
  type EditableEventTargetOwner,
  type EditableKeyDownKernelDecision,
  type EditableOwnership,
  getCurrentEditableEventFrame,
  getEditableMovementOwnershipTrace,
  mapSelectionSourceToKernelState,
  recordEditableKernelTrace,
} from './editing-kernel';
import {
  type classifyKeyboardIntent,
  isInteractiveInternalTarget,
} from './input-controller';
import type { EditableInputController } from './input-state';
import { readLiveSelection } from './runtime-selection-state';

type RuntimeKernelIntent = ReturnType<typeof classifyKeyboardIntent>;
type RuntimeNativeInput = DOMInputRepair;

export const useRuntimeKernelTraceEngine = ({
  domRepairQueue,
  editor,
  inputController,
}: {
  domRepairQueue: DOMRepairQueue;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
}) => {
  const pendingKernelFrameIdRef = useRef<number | null>(null);

  const getKernelEventTargetOwner = useCallback(
    (target: EventTarget | null): EditableEventTargetOwner =>
      isInteractiveInternalTarget(editor, target)
        ? 'internal-control'
        : ReactEditor.hasEditableTarget(editor, target)
          ? 'editor'
          : ReactEditor.hasTarget(editor, target)
            ? 'app-owned'
            : 'unknown',
    [editor]
  );

  const getKernelEventOwnership = useCallback(
    ({
      intent,
      ownership,
    }: {
      intent: RuntimeKernelIntent;
      ownership?: EditableOwnership;
    }): EditableOwnership =>
      ownership ??
      (intent === 'internal-control'
        ? 'app-owned'
        : intent === 'native-selection-move'
          ? 'native-allowed'
          : intent
            ? 'model-owned'
            : 'no-op'),
    []
  );

  const beginKernelEventFrame = useCallback(
    ({
      family,
      intent,
      target,
    }: {
      family: EditableBrowserEventFamily;
      intent: RuntimeKernelIntent;
      target: EventTarget | null;
    }) => {
      const targetOwner = getKernelEventTargetOwner(target);
      const selection = readLiveSelection(editor);
      const frame = beginEditableEventFrame(editor, {
        eventFamily: family,
        focusOwner: targetOwner,
        inputIntent: intent,
        modelSelectionBefore: selection,
        selectionSource: inputController.state.selectionSource,
        targetOwner,
      });

      domRepairQueue.cancelBefore(frame.id);
      pendingKernelFrameIdRef.current = frame.id;

      return frame;
    },
    [domRepairQueue, editor, getKernelEventTargetOwner, inputController]
  );

  const recordKernelEventTrace = useCallback(
    ({
      command,
      family,
      intent,
      ownership,
      target,
    }: {
      command?: EditableCommand | null;
      family: EditableBrowserEventFamily;
      intent: RuntimeKernelIntent;
      ownership?: EditableOwnership;
      target: EventTarget | null;
    }) => {
      const targetOwner = getKernelEventTargetOwner(target);
      const nextOwnership = getKernelEventOwnership({ intent, ownership });
      const selection = readLiveSelection(editor);
      const currentFrame = getCurrentEditableEventFrame(editor);
      const canReusePendingFrame =
        currentFrame?.active &&
        currentFrame.id === pendingKernelFrameIdRef.current &&
        currentFrame.eventFamily === family;

      if (!canReusePendingFrame) {
        beginKernelEventFrame({ family, intent, target });
      }
      pendingKernelFrameIdRef.current = null;

      if (isEditableEditingEpochCommand(command ?? null)) {
        beginOrJoinEditableEditingEpoch(editor, {
          command: command ?? null,
          modelSelectionBefore: selection,
          ownership: nextOwnership,
          rootEventFamily: family,
          rootIntent: intent,
          selectionSource: inputController.state.selectionSource,
          targetOwner,
        });
      }

      recordEditableKernelTrace({
        editor,
        trace: {
          command: command ?? null,
          eventFamily: family,
          intent,
          nativeAllowed: nextOwnership === 'native-allowed',
          ownership: nextOwnership,
          operations: [],
          repair: null,
          selectionAfter: selection,
          selectionBefore: selection,
          selectionChangeOrigin:
            inputController.state.selectionChangeOrigin ?? 'unknown',
          selectionSource: inputController.state.selectionSource,
          stateAfter: mapSelectionSourceToKernelState(
            inputController.state.selectionSource
          ),
          stateBefore: mapSelectionSourceToKernelState(
            inputController.state.selectionSource
          ),
          targetOwner,
        },
      });
    },
    [
      beginKernelEventFrame,
      editor,
      getKernelEventOwnership,
      getKernelEventTargetOwner,
      inputController,
    ]
  );

  const repairDOMInputWithTrace = useCallback(
    (nativeInput: RuntimeNativeInput, rootElement: HTMLElement) => {
      const selectionBefore = readLiveSelection(editor);
      const selectionSourceBefore = inputController.state.selectionSource;
      const ownership: EditableOwnership = nativeInput.inputType.startsWith(
        'delete'
      )
        ? 'model-owned'
        : 'native-allowed';
      const frame = beginEditableEventFrame(editor, {
        eventFamily: 'input',
        focusOwner: 'editor',
        inputIntent: inputController.state.activeIntent,
        modelSelectionBefore: selectionBefore,
        selectionSource: selectionSourceBefore,
        targetOwner: 'editor',
      });

      domRepairQueue.cancelBefore(frame.id);
      domRepairQueue.repairDOMInput(nativeInput, rootElement, frame.id);
      recordEditableKernelTrace({
        editor,
        trace: {
          command: null,
          eventFamily: 'input',
          intent: inputController.state.activeIntent,
          nativeAllowed: ownership === 'native-allowed',
          ownership,
          operations: [],
          repair: null,
          selectionAfter: readLiveSelection(editor),
          selectionBefore,
          selectionSource: inputController.state.selectionSource,
          stateAfter: mapSelectionSourceToKernelState(
            inputController.state.selectionSource
          ),
          stateBefore: mapSelectionSourceToKernelState(selectionSourceBefore),
          targetOwner: 'editor',
        },
      });
    },
    [domRepairQueue, editor, inputController]
  );

  const getCurrentKernelFrameId = useCallback(
    () => getCurrentEditableEventFrame(editor)?.id ?? null,
    [editor]
  );

  const repairDOMInputAfterFrame = useCallback(
    (
      nativeInput: RuntimeNativeInput,
      rootElement: HTMLElement,
      frameId: number | null
    ) => {
      setTimeout(() => {
        domRepairQueue.repairDOMInput(nativeInput, rootElement, frameId);
      });
    },
    [domRepairQueue]
  );

  const beginKeyDownEventFrame = useCallback(
    (decision: EditableKeyDownKernelDecision) => {
      const frame = beginEditableEventFrame(editor, {
        eventFamily: 'keydown',
        focusOwner: decision.targetOwner,
        inputIntent: decision.intent,
        modelSelectionBefore: decision.selectionBefore,
        selectionSource: inputController.state.selectionSource,
        targetOwner: decision.targetOwner,
      });

      if (isEditableEditingEpochCommand(decision.command)) {
        beginEditableEditingEpoch(editor, {
          command: decision.command,
          modelSelectionBefore: decision.selectionBefore,
          ownership: decision.ownership,
          rootEventFamily: 'keydown',
          rootIntent: decision.intent,
          selectionSource: inputController.state.selectionSource,
          targetOwner: decision.targetOwner,
        });
      }

      domRepairQueue.cancelBefore(frame.id);

      return frame;
    },
    [domRepairQueue, editor, inputController]
  );

  const recordKeyDownTrace = useCallback(
    ({
      decision,
      eventKey,
      handled,
    }: {
      decision: EditableKeyDownKernelDecision;
      eventKey: string;
      handled: boolean;
    }) => {
      const keyDownResult = createEditableKernelResult({
        editor,
        handled,
        trace: {
          command: decision.command,
          eventFamily: 'keydown',
          intent: decision.intent,
          movement: getEditableMovementOwnershipTrace({
            command: decision.command,
            intent: decision.intent,
            key: eventKey,
            ownership: decision.ownership,
          }),
          nativeAllowed: decision.nativeAllowed,
          ownership: decision.ownership,
          operations: [],
          repair: null,
          selectionAfter: readLiveSelection(editor),
          selectionBefore: decision.selectionBefore,
          selectionPolicy: decision.selectionPolicy,
          selectionSource: inputController.state.selectionSource,
          stateAfter: mapSelectionSourceToKernelState(
            inputController.state.selectionSource
          ),
          stateBefore: decision.stateBefore,
          targetOwner: decision.targetOwner,
        },
      });

      recordEditableKernelTrace({
        editor,
        trace: keyDownResult.trace,
      });
    },
    [editor, inputController]
  );

  return {
    beginKernelEventFrame,
    beginKeyDownEventFrame,
    getCurrentKernelFrameId,
    recordKernelEventTrace,
    recordKeyDownTrace,
    repairDOMInputAfterFrame,
    repairDOMInputWithTrace,
  };
};
