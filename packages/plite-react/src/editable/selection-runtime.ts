import {
  type EditorCommit,
  type Operation,
  type Range,
  RangeApi,
} from '@platejs/plite';
import type { EditableInputController } from './input-state';

type SelectorListener = (
  operations?: readonly Operation[],
  change?: EditorCommit
) => void;

type SelectorSubscriptionOptions = {
  profileId?: string;
  shouldUpdate?: (
    operations?: readonly Operation[],
    change?: EditorCommit
  ) => boolean;
};

type AddSelectorEventListener = (
  listener: SelectorListener,
  options?: SelectorSubscriptionOptions
) => () => void;

type CancelScheduledDOMExport = () => void;

type ScheduleDOMExport = (
  callback: () => void
) => CancelScheduledDOMExport | void;

export const shouldExportModelSelectionToDOM = (
  inputController: EditableInputController,
  {
    commit,
    modelSelection,
  }: {
    commit?: EditorCommit;
    modelSelection?: Range | null;
  } = {}
) => {
  if (
    commit?.command?.origin === 'command' &&
    commit?.childrenChanged &&
    modelSelection &&
    RangeApi.isExpanded(modelSelection)
  ) {
    return true;
  }

  return (
    inputController.state.selectionChangeOrigin !== 'native-user' &&
    inputController.state.selectionSource !== 'dom-current'
  );
};

export const isTextInputSelectionHandledByCaretRepair = (
  inputController: EditableInputController,
  commit?: EditorCommit
) =>
  Boolean(
    inputController.state.activeIntent === 'text-insert' &&
      !inputController.state.isComposing &&
      commit?.childrenChanged &&
      commit.selectionChanged &&
      !commit.fullDocumentChanged &&
      !commit.rootRuntimeIdsChanged &&
      !commit.structureChanged &&
      !commit.topLevelOrderChanged
  );

const isSyncedTextOnlySelectionCommit = (
  operations?: readonly Operation[],
  commit?: EditorCommit,
  inputController?: EditableInputController
) => {
  if (
    !operations ||
    operations.length === 0 ||
    inputController?.state.isComposing ||
    !commit?.childrenChanged ||
    !commit.selectionChanged ||
    commit.fullDocumentChanged ||
    commit.rootRuntimeIdsChanged ||
    commit.structureChanged ||
    commit.topLevelOrderChanged
  ) {
    return false;
  }

  if (commit.command?.origin === 'command') {
    return false;
  }

  let hasTextOperation = false;

  for (const operation of operations) {
    if (operation.type === 'insert_text' || operation.type === 'remove_text') {
      hasTextOperation = true;
      continue;
    }

    if (operation.type === 'set_selection') {
      continue;
    }

    return false;
  }

  return hasTextOperation;
};

export const shouldSyncModelSelectionAfterCommit = (
  _operations?: readonly Operation[],
  commit?: EditorCommit,
  inputController?: EditableInputController
) => {
  if (
    inputController &&
    isTextInputSelectionHandledByCaretRepair(inputController, commit)
  ) {
    return false;
  }

  if (isSyncedTextOnlySelectionCommit(_operations, commit, inputController)) {
    return false;
  }

  return Boolean(
    commit?.selectionChanged ||
      commit?.fullDocumentChanged ||
      commit?.rootRuntimeIdsChanged ||
      commit?.structureChanged ||
      commit?.topLevelOrderChanged
  );
};

export const subscribeSelectionOnlyDOMExport = ({
  addSelectorEventListener,
  getModelSelection = () => null,
  inputController,
  scheduleDOMExport = (callback) => {
    if (typeof requestAnimationFrame === 'function') {
      const animationFrame = requestAnimationFrame(callback);

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    const timeout = setTimeout(callback);

    return () => {
      clearTimeout(timeout);
    };
  },
  shouldSkipDOMExport,
  syncDOMSelectionToEditor,
}: {
  addSelectorEventListener: AddSelectorEventListener;
  getModelSelection?: () => Range | null;
  inputController: EditableInputController;
  scheduleDOMExport?: ScheduleDOMExport;
  shouldSkipDOMExport?: (
    selection: Range | null,
    commit?: EditorCommit
  ) => boolean;
  syncDOMSelectionToEditor: () => void;
}) => {
  const pendingDOMExportCancels = new Set<CancelScheduledDOMExport>();
  let subscribed = true;

  const unsubscribeSelector = addSelectorEventListener(
    (_operations, commit) => {
      const sync = () => {
        if (!subscribed) {
          return;
        }

        const modelSelection = getModelSelection();

        if (shouldSkipDOMExport?.(modelSelection, commit)) {
          return;
        }

        if (
          !shouldExportModelSelectionToDOM(inputController, {
            commit,
            modelSelection,
          })
        ) {
          return;
        }

        syncDOMSelectionToEditor();
      };

      if (commit?.childrenChanged) {
        let cancelScheduledDOMExport: CancelScheduledDOMExport | undefined;
        let didRunScheduledDOMExport = false;
        const runScheduledDOMExport = () => {
          didRunScheduledDOMExport = true;
          if (cancelScheduledDOMExport) {
            pendingDOMExportCancels.delete(cancelScheduledDOMExport);
          }

          sync();
        };

        const nextCancelScheduledDOMExport = scheduleDOMExport(
          runScheduledDOMExport
        );

        if (nextCancelScheduledDOMExport) {
          cancelScheduledDOMExport = nextCancelScheduledDOMExport;
          if (subscribed && !didRunScheduledDOMExport) {
            pendingDOMExportCancels.add(cancelScheduledDOMExport);
          } else if (!didRunScheduledDOMExport) {
            cancelScheduledDOMExport();
          }
        }
      } else {
        sync();
      }
    },
    {
      profileId: 'selection-dom-export',
      shouldUpdate: (operations, commit) =>
        shouldSyncModelSelectionAfterCommit(
          operations,
          commit,
          inputController
        ),
    }
  );

  return () => {
    subscribed = false;
    for (const cancelPendingDOMExport of pendingDOMExportCancels) {
      cancelPendingDOMExport();
    }
    pendingDOMExportCancels.clear();
    unsubscribeSelector();
  };
};
