import { type EditorCommit, type Range, RangeApi } from '@platejs/plite';
import type { EditableInputController } from './input-state';

type SelectorListener = (change?: EditorCommit) => void;

type SelectorSubscriptionOptions = {
  profileId?: string;
  shouldUpdate?: (change?: EditorCommit) => boolean;
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
    commit?.tags.includes('semantic-command') &&
    commit?.changed.hasAny('document') &&
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
      commit?.changed.hasAny('document') &&
      commit.selectionChanged &&
      !commit.changed.hasAny('structure') &&
      !commit.changed.hasAny('root-order')
  );

const isSyncedTextOnlySelectionCommit = (
  commit?: EditorCommit,
  inputController?: EditableInputController
) => {
  if (
    !inputController ||
    inputController.state.isComposing ||
    !commit?.changed.hasAny('text') ||
    !commit.selectionChanged ||
    commit.changed.hasAny('structure') ||
    commit.changed.hasAny('properties') ||
    commit.changed.hasAny('root-order')
  ) {
    return false;
  }

  if (commit.tags.includes('semantic-command')) {
    return false;
  }

  return true;
};

export const shouldSyncModelSelectionAfterCommit = (
  commit?: EditorCommit,
  inputController?: EditableInputController
) => {
  if (
    inputController &&
    isTextInputSelectionHandledByCaretRepair(inputController, commit)
  ) {
    return false;
  }

  if (isSyncedTextOnlySelectionCommit(commit, inputController)) {
    return false;
  }

  return Boolean(
    commit?.selectionChanged ||
      commit?.changed.hasAny('structure') ||
      commit?.changed.hasAny('root-order')
  );
};

export const subscribeSelectionOnlyDOMExport = ({
  addSelectorEventListener,
  getModelSelection = () => null,
  inputController,
  scheduleDOMExport,
  shouldSkipDOMExport,
  syncDOMSelectionToEditor,
}: {
  addSelectorEventListener: AddSelectorEventListener;
  getModelSelection?: () => Range | null;
  inputController: EditableInputController;
  scheduleDOMExport: ScheduleDOMExport;
  shouldSkipDOMExport?: (
    selection: Range | null,
    commit?: EditorCommit
  ) => boolean;
  syncDOMSelectionToEditor: () => void;
}) => {
  const pendingDOMExportCancels = new Set<CancelScheduledDOMExport>();
  let subscribed = true;

  const unsubscribeSelector = addSelectorEventListener(
    (commit) => {
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

      if (commit?.changed.hasAny('document')) {
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
      shouldUpdate: (commit) =>
        shouldSyncModelSelectionAfterCommit(commit, inputController),
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
