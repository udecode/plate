import type { EditorCommit, Operation, Range } from '@platejs/plite';
import {
  createEditableInputController,
  createEditableInputControllerState,
  setEditableModelSelectionPreference,
} from '../src/editable/input-controller';
import {
  cancelRuntimeSelectionChangeFlush,
  shouldFlushSelectionChangeAfterKeyDownPolicy,
  shouldPreserveDOMRepairQueueDuringSelectionChange,
  shouldRepairPendingNativeTextInputDuringSelectionChange,
  shouldSkipModelOwnedRepairSelectionChange,
} from '../src/editable/runtime-selection-engine';
import {
  isTextInputSelectionHandledByCaretRepair,
  shouldExportModelSelectionToDOM,
  shouldSyncModelSelectionAfterCommit,
  subscribeSelectionOnlyDOMExport,
} from '../src/editable/selection-runtime';

describe('selection runtime', () => {
  const createChange = (
    change: Pick<EditorCommit, 'childrenChanged' | 'selectionChanged'> &
      Partial<
        Pick<
          EditorCommit,
          | 'command'
          | 'fullDocumentChanged'
          | 'rootRuntimeIdsChanged'
          | 'structureChanged'
          | 'topLevelOrderChanged'
        >
      >
  ) => change as EditorCommit;

  const createInputController = () =>
    createEditableInputController({
      preferModelSelectionForInputRef: { current: false },
      state: createEditableInputControllerState(),
    });
  const expandedSelection: Range = {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 1, path: [0, 0] },
  };
  const collapsedSelection: Range = {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 0, path: [0, 0] },
  };

  test('exports model-owned selection but skips DOM-owned selection', () => {
    const inputController = createInputController();

    expect(shouldExportModelSelectionToDOM(inputController)).toBe(true);

    inputController.state.selectionSource = 'dom-current';
    expect(shouldExportModelSelectionToDOM(inputController)).toBe(false);

    inputController.state.selectionSource = 'model-owned';
    inputController.state.selectionChangeOrigin = 'native-user';
    expect(shouldExportModelSelectionToDOM(inputController)).toBe(false);
  });

  test('exports expanded model selection after content-changing commits', () => {
    const inputController = createInputController();
    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';

    expect(
      shouldExportModelSelectionToDOM(inputController, {
        commit: createChange({
          childrenChanged: true,
          selectionChanged: false,
        }),
        modelSelection: expandedSelection,
      })
    ).toBe(false);
    expect(
      shouldExportModelSelectionToDOM(inputController, {
        commit: createChange({
          childrenChanged: true,
          command: { origin: 'command', type: 'toggle_mark' },
          selectionChanged: false,
        }),
        modelSelection: expandedSelection,
      })
    ).toBe(true);
    expect(
      shouldExportModelSelectionToDOM(inputController, {
        commit: createChange({
          childrenChanged: true,
          command: { origin: 'command', type: 'toggle_mark' },
          selectionChanged: false,
        }),
        modelSelection: collapsedSelection,
      })
    ).toBe(false);
  });

  test('subscribes to model selection and structural changes only', () => {
    expect(
      shouldSyncModelSelectionAfterCommit(
        undefined,
        createChange({
          childrenChanged: false,
          selectionChanged: true,
        })
      )
    ).toBe(true);
    expect(
      shouldSyncModelSelectionAfterCommit(
        undefined,
        createChange({
          childrenChanged: true,
          selectionChanged: true,
        })
      )
    ).toBe(true);
    expect(
      shouldSyncModelSelectionAfterCommit(
        undefined,
        createChange({
          childrenChanged: true,
          selectionChanged: false,
        })
      )
    ).toBe(false);
    expect(
      shouldSyncModelSelectionAfterCommit(
        undefined,
        createChange({
          childrenChanged: true,
          selectionChanged: false,
          structureChanged: true,
        })
      )
    ).toBe(true);
  });

  test('skips DOM export when text input caret repair owns collapsed selection', () => {
    const inputController = createInputController();
    inputController.state.activeIntent = 'text-insert';
    inputController.state.selectionSource = 'model-owned';

    const textCommit = createChange({
      childrenChanged: true,
      selectionChanged: true,
    });

    expect(
      isTextInputSelectionHandledByCaretRepair(inputController, textCommit)
    ).toBe(true);
    expect(
      shouldSyncModelSelectionAfterCommit(
        undefined,
        textCommit,
        inputController
      )
    ).toBe(false);

    expect(
      shouldSyncModelSelectionAfterCommit(
        undefined,
        createChange({
          childrenChanged: true,
          selectionChanged: true,
          structureChanged: true,
        }),
        inputController
      )
    ).toBe(true);
  });

  test('composition text input still exports model selection normally', () => {
    const inputController = createInputController();
    inputController.state.activeIntent = 'text-insert';
    inputController.state.isComposing = true;

    expect(
      shouldSyncModelSelectionAfterCommit(
        undefined,
        createChange({
          childrenChanged: true,
          selectionChanged: true,
        }),
        inputController
      )
    ).toBe(true);
  });

  test('cancelled selectionchange flush clears pending DOM import', () => {
    const inputController = createInputController();
    let onCancelCalls = 0;
    let onFlushCalls = 0;
    let scheduledCancelCalls = 0;
    let scheduledFlushCalls = 0;
    const onDOMSelectionChange = Object.assign(() => {}, {
      cancel: () => {
        onCancelCalls += 1;
      },
      flush: () => {
        onFlushCalls += 1;
      },
    });
    const scheduleOnDOMSelectionChange = Object.assign(() => {}, {
      cancel: () => {
        scheduledCancelCalls += 1;
      },
      flush: () => {
        scheduledFlushCalls += 1;
      },
    });

    inputController.state.pendingDOMSelectionImport = true;

    cancelRuntimeSelectionChangeFlush({
      inputController,
      onDOMSelectionChange,
      scheduleOnDOMSelectionChange,
    });

    expect(inputController.state.pendingDOMSelectionImport).toBe(false);
    expect(onCancelCalls).toBe(1);
    expect(scheduledCancelCalls).toBe(1);
    expect(onFlushCalls).toBe(0);
    expect(scheduledFlushCalls).toBe(0);
  });

  test('keydown preserves model selection without flushing stale DOM selection', () => {
    const inputController = createInputController();
    const preserveModelDecision = {
      selectionPolicy: { kind: 'preserve-model', reason: 'model-owned' },
    } as Parameters<
      typeof shouldFlushSelectionChangeAfterKeyDownPolicy
    >[0]['decision'];

    expect(
      shouldFlushSelectionChangeAfterKeyDownPolicy({
        decision: preserveModelDecision,
        inputController,
      })
    ).toBe(true);

    setEditableModelSelectionPreference({
      inputController,
      preferModelSelection: true,
      reason: 'model-command',
      selectionSource: 'model-owned',
    });

    expect(
      shouldFlushSelectionChangeAfterKeyDownPolicy({
        decision: preserveModelDecision,
        inputController,
      })
    ).toBe(false);
    expect(
      shouldFlushSelectionChangeAfterKeyDownPolicy({
        decision: {
          selectionPolicy: { kind: 'import-dom', reason: 'native-selection' },
        } as Parameters<
          typeof shouldFlushSelectionChangeAfterKeyDownPolicy
        >[0]['decision'],
        inputController,
      })
    ).toBe(true);
  });

  test('model-owned repair selectionchange skips stale DOM import work only after model-owned repair', () => {
    expect(
      shouldSkipModelOwnedRepairSelectionChange({
        activeIntent: 'history',
        modelSelectionPreferred: true,
        selectionChangeOrigin: 'repair-induced',
        selectionSource: 'model-owned',
      })
    ).toBe(true);
    expect(
      shouldSkipModelOwnedRepairSelectionChange({
        activeIntent: 'text-insert',
        modelSelectionPreferred: true,
        pendingNativeTextInputRepairPathKey: null,
        pendingNativeTextInputRepairSuppressedDOMSelection: false,
        selectionChangeOrigin: null,
        selectionSource: 'model-owned',
      })
    ).toBe(true);
    expect(
      shouldSkipModelOwnedRepairSelectionChange({
        activeIntent: 'text-insert',
        modelSelectionPreferred: true,
        pendingNativeTextInputRepairPathKey: null,
        pendingNativeTextInputRepairSuppressedDOMSelection: false,
        selectionChangeOrigin: 'repair-induced',
        selectionSource: 'model-owned',
      })
    ).toBe(true);
    expect(
      shouldSkipModelOwnedRepairSelectionChange({
        activeIntent: 'text-insert',
        modelSelectionPreferred: true,
        pendingNativeTextInputRepairPathKey: '0,0',
        pendingNativeTextInputRepairSuppressedDOMSelection: false,
        selectionChangeOrigin: 'repair-induced',
        selectionSource: 'model-owned',
      })
    ).toBe(false);
    expect(
      shouldSkipModelOwnedRepairSelectionChange({
        activeIntent: 'text-insert',
        modelSelectionPreferred: true,
        pendingNativeTextInputRepairPathKey: null,
        pendingNativeTextInputRepairSuppressedDOMSelection: true,
        selectionChangeOrigin: 'repair-induced',
        selectionSource: 'model-owned',
      })
    ).toBe(false);
    expect(
      shouldSkipModelOwnedRepairSelectionChange({
        activeIntent: 'history',
        modelSelectionPreferred: true,
        selectionChangeOrigin: 'native-user',
        selectionSource: 'model-owned',
      })
    ).toBe(false);
    expect(
      shouldSkipModelOwnedRepairSelectionChange({
        activeIntent: 'history',
        modelSelectionPreferred: false,
        selectionChangeOrigin: 'repair-induced',
        selectionSource: 'model-owned',
      })
    ).toBe(false);
  });

  test('wires selector listener to DOM export policy', () => {
    const inputController = createInputController();
    let listener: (() => void) | null = null;
    let cleanupCalls = 0;
    let syncCalls = 0;

    const unsubscribe = subscribeSelectionOnlyDOMExport({
      addSelectorEventListener(nextListener) {
        listener = nextListener;
        return () => {
          cleanupCalls += 1;
        };
      },
      inputController,
      scheduleDOMExport(callback) {
        callback();
      },
      syncDOMSelectionToEditor() {
        syncCalls += 1;
      },
    });

    listener?.();
    expect(syncCalls).toBe(1);

    inputController.state.selectionSource = 'dom-current';
    listener?.();
    expect(syncCalls).toBe(1);

    unsubscribe();
    expect(cleanupCalls).toBe(1);
  });

  test('defers DOM export for content-changing commits', () => {
    const inputController = createInputController();
    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';
    let listener:
      | ((operations?: readonly Operation[], change?: EditorCommit) => void)
      | null = null;
    let scheduled: (() => void) | null = null;
    let syncCalls = 0;

    subscribeSelectionOnlyDOMExport({
      addSelectorEventListener(nextListener) {
        listener = nextListener;
        return () => {};
      },
      getModelSelection: () => expandedSelection,
      inputController,
      scheduleDOMExport(callback) {
        scheduled = callback;
      },
      syncDOMSelectionToEditor() {
        syncCalls += 1;
      },
    });

    listener?.(
      undefined,
      createChange({
        childrenChanged: true,
        command: { origin: 'command', type: 'toggle_mark' },
        selectionChanged: false,
      })
    );
    expect(syncCalls).toBe(0);

    scheduled?.();
    expect(syncCalls).toBe(1);
  });

  test('cancels deferred DOM export on unsubscribe', () => {
    const inputController = createInputController();
    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';
    let listener:
      | ((operations?: readonly Operation[], change?: EditorCommit) => void)
      | null = null;
    let scheduled: (() => void) | null = null;
    let cleanupCalls = 0;
    let cancelCalls = 0;
    let syncCalls = 0;

    const unsubscribe = subscribeSelectionOnlyDOMExport({
      addSelectorEventListener(nextListener) {
        listener = nextListener;
        return () => {
          cleanupCalls += 1;
        };
      },
      getModelSelection: () => expandedSelection,
      inputController,
      scheduleDOMExport(callback) {
        scheduled = callback;

        return () => {
          cancelCalls += 1;
        };
      },
      syncDOMSelectionToEditor() {
        syncCalls += 1;
      },
    });

    listener?.(
      undefined,
      createChange({
        childrenChanged: true,
        command: { origin: 'command', type: 'toggle_mark' },
        selectionChanged: false,
      })
    );

    unsubscribe();
    scheduled?.();

    expect(cancelCalls).toBe(1);
    expect(cleanupCalls).toBe(1);
    expect(syncCalls).toBe(0);
  });

  test('does not notify DOM export listener for repaired text input commits', () => {
    const inputController = createInputController();
    inputController.state.activeIntent = 'text-insert';
    inputController.state.selectionSource = 'model-owned';
    let listener:
      | ((operations?: readonly Operation[], change?: EditorCommit) => void)
      | null = null;
    let syncCalls = 0;

    subscribeSelectionOnlyDOMExport({
      addSelectorEventListener(nextListener, options) {
        listener = (operations, change) => {
          if (options?.shouldUpdate?.(operations, change) ?? true) {
            nextListener(operations, change);
          }
        };

        return () => {};
      },
      inputController,
      scheduleDOMExport(callback) {
        callback();
      },
      syncDOMSelectionToEditor() {
        syncCalls += 1;
      },
    });

    listener?.(
      undefined,
      createChange({
        childrenChanged: true,
        selectionChanged: true,
      })
    );

    expect(syncCalls).toBe(0);
  });

  test('preserves pending native text insert repair through selectionchange', () => {
    expect(
      shouldPreserveDOMRepairQueueDuringSelectionChange({
        activeIntent: 'text-insert',
        modelSelectionPreferred: false,
        pendingNativeTextInputRepairPathKey: '2500,0',
        selectionChangeOrigin: 'native-user',
      })
    ).toBe(true);

    expect(
      shouldPreserveDOMRepairQueueDuringSelectionChange({
        activeIntent: 'text-insert',
        modelSelectionPreferred: false,
        pendingNativeTextInputRepairPathKey: null,
        selectionChangeOrigin: 'native-user',
      })
    ).toBe(false);

    expect(
      shouldPreserveDOMRepairQueueDuringSelectionChange({
        activeIntent: 'text-insert',
        modelSelectionPreferred: true,
        pendingNativeTextInputRepairPathKey: null,
        selectionChangeOrigin: 'native-user',
      })
    ).toBe(true);

    expect(
      shouldPreserveDOMRepairQueueDuringSelectionChange({
        activeIntent: 'text-insert',
        modelSelectionPreferred: false,
        pendingNativeTextInputRepairPathKey: '2500,0',
        selectionChangeOrigin: 'programmatic-export',
      })
    ).toBe(false);
  });

  test('repairs pending native text insert during model-owned selectionchange', () => {
    expect(
      shouldRepairPendingNativeTextInputDuringSelectionChange({
        activeIntent: 'text-insert',
        pendingNativeTextInputRepairPathKey: '2500,0',
      })
    ).toBe(true);

    expect(
      shouldRepairPendingNativeTextInputDuringSelectionChange({
        activeIntent: 'text-insert',
        pendingNativeTextInputRepairPathKey: null,
      })
    ).toBe(false);

    expect(
      shouldRepairPendingNativeTextInputDuringSelectionChange({
        activeIntent: 'history',
        pendingNativeTextInputRepairPathKey: '2500,0',
      })
    ).toBe(false);
  });

  test('does not notify DOM export listener for synced text-only selection commits', () => {
    const inputController = createInputController();
    inputController.state.selectionSource = 'model-owned';
    let listener:
      | ((operations?: readonly Operation[], change?: EditorCommit) => void)
      | null = null;
    let syncCalls = 0;

    subscribeSelectionOnlyDOMExport({
      addSelectorEventListener(nextListener, options) {
        listener = (operations, change) => {
          if (options?.shouldUpdate?.(operations, change) ?? true) {
            nextListener(operations, change);
          }
        };

        return () => {};
      },
      inputController,
      scheduleDOMExport(callback) {
        callback();
      },
      syncDOMSelectionToEditor() {
        syncCalls += 1;
      },
    });

    listener?.(
      [
        { offset: 0, path: [0, 0], text: 'x', type: 'insert_text' },
        {
          newProperties: collapsedSelection,
          properties: null,
          type: 'set_selection',
        },
      ] as readonly Operation[],
      createChange({
        childrenChanged: true,
        selectionChanged: true,
      })
    );

    expect(syncCalls).toBe(0);
  });

  test('exports command-owned text-only selection commits', () => {
    const inputController = createInputController();
    inputController.state.selectionSource = 'dom-current';
    inputController.state.selectionChangeOrigin = 'native-user';
    let listener:
      | ((operations?: readonly Operation[], change?: EditorCommit) => void)
      | null = null;
    let syncCalls = 0;

    subscribeSelectionOnlyDOMExport({
      addSelectorEventListener(nextListener, options) {
        listener = (operations, change) => {
          if (options?.shouldUpdate?.(operations, change) ?? true) {
            nextListener(operations, change);
          }
        };

        return () => {};
      },
      getModelSelection: () => expandedSelection,
      inputController,
      scheduleDOMExport(callback) {
        callback();
      },
      syncDOMSelectionToEditor() {
        syncCalls += 1;
      },
    });

    listener?.(
      [
        { offset: 0, path: [0, 0], text: 'x', type: 'remove_text' },
        {
          newProperties: expandedSelection,
          properties: collapsedSelection,
          type: 'set_selection',
        },
      ] as readonly Operation[],
      createChange({
        childrenChanged: true,
        command: { origin: 'command', type: 'history_undo' },
        selectionChanged: true,
      })
    );

    expect(syncCalls).toBe(1);
  });

  test('composition still exports synced text-only selection commits', () => {
    const inputController = createInputController();
    inputController.state.isComposing = true;

    expect(
      shouldSyncModelSelectionAfterCommit(
        [{ offset: 0, path: [0, 0], text: 'x', type: 'insert_text' }] as any,
        createChange({
          childrenChanged: true,
          selectionChanged: true,
        }),
        inputController
      )
    ).toBe(true);
  });

  test('skips DOM export for selections owned by a synthetic partial-DOM lane', () => {
    const inputController = createInputController();
    inputController.state.selectionSource = 'model-owned';
    let listener:
      | ((operations?: readonly Operation[], change?: EditorCommit) => void)
      | null = null;
    let syncCalls = 0;

    subscribeSelectionOnlyDOMExport({
      addSelectorEventListener(nextListener, options) {
        listener = (operations, change) => {
          if (options?.shouldUpdate?.(operations, change) ?? true) {
            nextListener(operations, change);
          }
        };

        return () => {};
      },
      getModelSelection: () => expandedSelection,
      inputController,
      shouldSkipDOMExport: (selection) => selection === expandedSelection,
      syncDOMSelectionToEditor() {
        syncCalls += 1;
      },
    });

    listener?.(
      undefined,
      createChange({
        childrenChanged: false,
        selectionChanged: true,
      })
    );

    expect(syncCalls).toBe(0);
  });
});
