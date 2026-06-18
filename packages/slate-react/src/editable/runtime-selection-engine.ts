import debounce from 'lodash/debounce.js';
import throttle from 'lodash/throttle.js';
import type { RefObject } from 'react';
import { RangeApi } from '@platejs/slate';
import { getSelection } from '@platejs/slate-dom';
import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import type { DOMRepairQueue } from './dom-repair-queue';
import {
  beginEditableEventFrame,
  type EditableKeyDownKernelDecision,
  getEditableSelectionChangeOwnership,
  mapSelectionSourceToKernelState,
  recordEditableKernelTrace,
} from './editing-kernel';
import type { EditableInputController } from './input-state';
import { Editor } from './runtime-editor-api';
import { readLiveSelection } from './runtime-selection-state';
import {
  applyEditableDOMSelectionChange,
  completeEditableSelectionChangeImport,
  executeEditableSelectionImport,
  isEditableModelSelectionPreferred,
  setEditableModelSelectionPreference,
  syncEditorSelectionFromDOM,
} from './selection-controller';

export type RuntimeSelectionChangeHandler = (() => void) & {
  cancel: () => void;
  flush: () => void;
};

export const cancelRuntimeSelectionChangeFlush = ({
  inputController,
  onDOMSelectionChange,
  scheduleOnDOMSelectionChange,
}: {
  inputController: EditableInputController;
  onDOMSelectionChange: RuntimeSelectionChangeHandler;
  scheduleOnDOMSelectionChange: RuntimeSelectionChangeHandler;
}) => {
  scheduleOnDOMSelectionChange.cancel();
  onDOMSelectionChange.cancel();
  inputController.state.pendingDOMSelectionImport = false;
};

export const shouldPreserveDOMRepairQueueDuringSelectionChange = ({
  activeIntent,
  modelSelectionPreferred,
  pendingNativeTextInputRepairPathKey,
  selectionChangeOrigin,
}: {
  activeIntent: EditableInputController['state']['activeIntent'];
  modelSelectionPreferred: boolean;
  pendingNativeTextInputRepairPathKey?: string | null;
  selectionChangeOrigin: EditableInputController['state']['selectionChangeOrigin'];
}) =>
  (selectionChangeOrigin === 'native-user' &&
    activeIntent === 'history' &&
    modelSelectionPreferred) ||
  (selectionChangeOrigin === 'native-user' &&
    activeIntent === 'text-insert' &&
    (modelSelectionPreferred || !!pendingNativeTextInputRepairPathKey));

export const shouldRepairPendingNativeTextInputDuringSelectionChange = ({
  activeIntent,
  pendingNativeTextInputRepairPathKey,
}: {
  activeIntent: EditableInputController['state']['activeIntent'];
  pendingNativeTextInputRepairPathKey?: string | null;
}) => activeIntent === 'text-insert' && !!pendingNativeTextInputRepairPathKey;

export const shouldSkipModelOwnedRepairSelectionChange = ({
  activeIntent,
  modelSelectionPreferred,
  pendingNativeTextInputRepairPathKey,
  pendingNativeTextInputRepairSuppressedDOMSelection,
  selectionChangeOrigin,
  selectionSource,
}: {
  activeIntent: EditableInputController['state']['activeIntent'];
  modelSelectionPreferred: boolean;
  pendingNativeTextInputRepairPathKey?: string | null;
  pendingNativeTextInputRepairSuppressedDOMSelection?: boolean;
  selectionChangeOrigin: EditableInputController['state']['selectionChangeOrigin'];
  selectionSource: EditableInputController['state']['selectionSource'];
}) => {
  if (selectionSource !== 'model-owned' || !modelSelectionPreferred) {
    return false;
  }

  if (
    activeIntent === 'text-insert' &&
    !pendingNativeTextInputRepairPathKey &&
    !pendingNativeTextInputRepairSuppressedDOMSelection
  ) {
    return true;
  }

  if (selectionChangeOrigin !== 'repair-induced') {
    return false;
  }

  return activeIntent === 'history';
};

const shouldCancelStaleCompositionSelectionChangeFlush = ({
  editor,
  inputController,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
}) => {
  if (inputController.state.activeIntent !== 'composition') {
    return false;
  }

  if ((inputController.state.modelOwnedTextInputGuard ?? 0) === 0) {
    return false;
  }

  const modelSelection = Editor.getSelection(editor);

  if (!modelSelection || !RangeApi.isCollapsed(modelSelection)) {
    return false;
  }

  const root = ReactEditor.findDocumentOrShadowRoot(editor);
  const domSelection = getSelection(root);

  if (!domSelection?.isCollapsed) {
    return false;
  }

  const range = ReactEditor.resolveSlateRange(editor, domSelection, {
    exactMatch: false,
  });

  return (
    RangeApi.isRange(range) &&
    RangeApi.isCollapsed(range) &&
    range.anchor.path.join(',') === modelSelection.anchor.path.join(',') &&
    range.anchor.offset < modelSelection.anchor.offset
  );
};

export const createRuntimeSelectionChangeHandler = ({
  androidInputManagerRef,
  domRepairQueueRef,
  editor,
  inputController,
  processing,
  readOnly,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  domRepairQueueRef: RefObject<DOMRepairQueue | null>;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  processing: RefObject<boolean>;
  readOnly: boolean;
}): RuntimeSelectionChangeHandler => {
  let onDOMSelectionChange: RuntimeSelectionChangeHandler;

  onDOMSelectionChange = throttle(() => {
    const selectionChangeOrigin =
      inputController.state.selectionChangeOrigin ?? 'native-user';
    const modelSelectionPreferred =
      isEditableModelSelectionPreferred(inputController);

    if (
      shouldSkipModelOwnedRepairSelectionChange({
        activeIntent: inputController.state.activeIntent,
        modelSelectionPreferred,
        pendingNativeTextInputRepairPathKey:
          inputController.state.pendingNativeTextInputRepairPathKey,
        pendingNativeTextInputRepairSuppressedDOMSelection:
          inputController.state
            .pendingNativeTextInputRepairSuppressedDOMSelection,
        selectionChangeOrigin,
        selectionSource: inputController.state.selectionSource,
      })
    ) {
      inputController.state.pendingDOMSelectionImport = false;
      return;
    }

    const selectionBefore = readLiveSelection(editor);

    if (selectionChangeOrigin === 'repair-induced') {
      const preference = inputController.state.modelSelectionPreference;

      if (preference?.preferModelSelection === true) {
        setEditableModelSelectionPreference({
          inputController,
          preferModelSelection: true,
          reason: preference.reason,
          selectionSource: 'model-owned',
        });
      }
    }

    const selectionSourceBefore = inputController.state.selectionSource;
    const ownership = getEditableSelectionChangeOwnership({
      selectionChangeOrigin,
      selectionSource: selectionSourceBefore,
    });
    const frame = beginEditableEventFrame(editor, {
      eventFamily: 'selectionchange',
      focusOwner: 'editor',
      inputIntent: null,
      modelSelectionBefore: selectionBefore,
      selectionSource: selectionSourceBefore,
      targetOwner: 'editor',
    });
    const preserveDOMRepairQueue =
      shouldPreserveDOMRepairQueueDuringSelectionChange({
        activeIntent: inputController.state.activeIntent,
        modelSelectionPreferred,
        pendingNativeTextInputRepairPathKey:
          inputController.state.pendingNativeTextInputRepairPathKey,
        selectionChangeOrigin,
      });

    if (!preserveDOMRepairQueue) {
      domRepairQueueRef.current?.cancelBefore(frame.id);
    }

    try {
      applyEditableDOMSelectionChange({
        androidInputManager: androidInputManagerRef.current,
        editor,
        inputController,
        processing,
        readOnly,
        rerunOnDirtyNodeMap: onDOMSelectionChange,
      });

      const shouldRepairPendingNativeTextInput =
        shouldRepairPendingNativeTextInputDuringSelectionChange({
          activeIntent: inputController.state.activeIntent,
          pendingNativeTextInputRepairPathKey:
            inputController.state.pendingNativeTextInputRepairPathKey,
        });

      if (
        inputController.state
          .pendingNativeTextInputRepairSuppressedDOMSelection ||
        shouldRepairPendingNativeTextInput
      ) {
        inputController.state.pendingNativeTextInputRepairSuppressedDOMSelection = false;
        domRepairQueueRef.current?.repairCaretAfterModelTextInsert();
      }

      const selectionSourceAfter = inputController.state.selectionSource;

      recordEditableKernelTrace({
        editor,
        trace: {
          command: null,
          eventFamily: 'selectionchange',
          intent: null,
          nativeAllowed: ownership === 'native-allowed',
          ownership,
          repair: null,
          selectionAfter: readLiveSelection(editor),
          selectionBefore,
          selectionChangeOrigin,
          selectionSource: selectionSourceAfter,
          stateAfter: mapSelectionSourceToKernelState(selectionSourceAfter),
          stateBefore: mapSelectionSourceToKernelState(selectionSourceBefore),
          targetOwner: 'editor',
        },
      });
      completeEditableSelectionChangeImport({
        inputController,
        selectionChangeOrigin,
      });
    } finally {
      inputController.state.pendingDOMSelectionImport = false;
    }
  }, 100) as RuntimeSelectionChangeHandler;

  return onDOMSelectionChange;
};

export const createRuntimeSelectionChangeScheduler = (
  onDOMSelectionChange: RuntimeSelectionChangeHandler
): RuntimeSelectionChangeHandler =>
  debounce(onDOMSelectionChange, 0) as RuntimeSelectionChangeHandler;

export const shouldFlushSelectionChangeAfterKeyDownPolicy = ({
  decision,
  inputController,
}: {
  decision: EditableKeyDownKernelDecision;
  inputController: EditableInputController;
}) =>
  decision.selectionPolicy.kind !== 'preserve-model' ||
  !isEditableModelSelectionPreferred(inputController);

export const createRuntimeSelectionImportController = ({
  editor,
  inputController,
  onDOMSelectionChange,
  scheduleOnDOMSelectionChange,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  onDOMSelectionChange: RuntimeSelectionChangeHandler;
  scheduleOnDOMSelectionChange: RuntimeSelectionChangeHandler;
}) => ({
  applyKeyDownSelectionPolicy(decision: EditableKeyDownKernelDecision) {
    if (decision.selectionSourceTransition) {
      setEditableModelSelectionPreference({
        inputController,
        preferModelSelection:
          decision.selectionSourceTransition.preferModelSelection,
        selectionSource: decision.selectionSourceTransition.selectionSource,
      });
    }

    if (!decision.internalTarget) {
      executeEditableSelectionImport({
        importSelection: () => {
          syncEditorSelectionFromDOM({
            editor,
            ignoreModelSelectionPreference: decision.shouldForceDOMImport,
            inputController,
          });
        },
        selectionPolicy: decision.selectionPolicy,
      });
    }

    if (
      shouldCancelStaleCompositionSelectionChangeFlush({
        editor,
        inputController,
      })
    ) {
      cancelRuntimeSelectionChangeFlush({
        inputController,
        onDOMSelectionChange,
        scheduleOnDOMSelectionChange,
      });
      return;
    }

    if (
      !shouldFlushSelectionChangeAfterKeyDownPolicy({
        decision,
        inputController,
      })
    ) {
      return;
    }

    scheduleOnDOMSelectionChange.flush();
    onDOMSelectionChange.flush();
  },

  allowDOMSelectionImport(
    selectionPolicy: EditableKeyDownKernelDecision['selectionPolicy']
  ) {
    return executeEditableSelectionImport({
      importSelection: () => {},
      selectionPolicy,
    });
  },

  flushSelectionChange() {
    if (
      shouldCancelStaleCompositionSelectionChangeFlush({
        editor,
        inputController,
      })
    ) {
      cancelRuntimeSelectionChangeFlush({
        inputController,
        onDOMSelectionChange,
        scheduleOnDOMSelectionChange,
      });
      return;
    }

    scheduleOnDOMSelectionChange.flush();
    onDOMSelectionChange.flush();
  },

  syncDOMSelectionFromRuntime() {
    syncEditorSelectionFromDOM({
      editor,
      inputController,
    });
  },
});

export type RuntimeSelectionImportController = ReturnType<
  typeof createRuntimeSelectionImportController
>;
