import { type FormEvent, type RefObject, useCallback } from 'react';
import { PathApi, type Range, RangeApi, SelectionApi } from '@platejs/plite';
import { getSelection } from '@platejs/plite-dom';
import { findEditorDOMRootRuntime } from '@platejs/plite-dom/internal';
import type {
  EditableDOMBeforeInputContext,
  EditableDOMBeforeInputHandler,
} from '../components/editable';
import { focusPliteEditable } from '../hooks/focus-plite-editable';
import { useOptionalPliteRuntimeContext } from '../hooks/use-plite-runtime';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { getInputEventTargetRanges } from './dom-input-event';
import { completeDuplicateEditableEditingEpochCommand } from './editing-epoch-adapter';
import {
  type EditableCommand,
  prepareEditableBeforeInputKernel,
} from './editing-kernel';
import {
  armModelOwnedTextInputGuard,
  getNestedEditableDOMSelectionRoot,
  isEditableModelSelectionPreferredForInput,
  isNestedEditableDOMTarget,
  isSelectionInEditorView,
  setEditableModelSelectionPreference,
  shouldForceModelOwnedTextInput,
} from './input-controller';
import {
  getDOMInputRepairTarget,
  useEditableDOMBeforeInputHandler,
  useEditableReactBeforeInputHandler,
} from './input-router';
import {
  clearExpiredTextInputRepairEcho,
  type EditableInputController,
  runTrackedEditableCompositionMutation,
} from './input-state';
import {
  applyModelOwnedBeforeInputMutation,
  applyModelOwnedNativeHistoryEvent,
  type DeferredMutation,
  shouldForceRenderAfterModelOwnedHistory,
} from './model-input-strategy';
import { getNativeBeforeInputDecision } from './native-input-strategy';
import {
  editorCommands,
  hasCommandHandler,
  toInternalRoot,
} from './runtime-editor-api';
import type { EditableEventRuntime } from './runtime-event-engine';
import {
  readRuntimeSelection,
  readRuntimeSelectionRange,
} from './runtime-selection-state';
import {
  handleWebKitShadowDOMBeforeInput,
  restoreUserSelectionAfterBeforeInput,
  syncSelectionForBeforeInput,
} from './selection-reconciler';

type ReactBeforeInputHandler = (
  event: FormEvent<HTMLDivElement>
) => boolean | void;

const now = () => globalThis.performance?.now?.() ?? Date.now();

const profileBeforeInputDuration = <T>(id: string, callback: () => T): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return callback();
  }

  const start = now();

  try {
    return callback();
  } finally {
    recordPliteReactRender({
      duration: now() - start,
      id,
      kind: 'runtime-time',
    });
  }
};

const isDOMBeforeInputHandled = (
  event: InputEvent,
  handler: EditableDOMBeforeInputHandler | undefined,
  context: EditableDOMBeforeInputContext
) => {
  if (!handler) {
    return false;
  }

  const shouldTreatEventAsHandled = handler(event, context);

  if (shouldTreatEventAsHandled != null) {
    if (shouldTreatEventAsHandled) {
      event.preventDefault();
    }

    return shouldTreatEventAsHandled;
  }

  return event.defaultPrevented;
};

const getSelectionRoot = (selection: Range | null) => selection?.anchor.root;

type CompositionFinalInputType = 'insertFromComposition' | 'insertText';

const isCompositionFinalInputType = (
  inputType: string
): inputType is CompositionFinalInputType =>
  inputType === 'insertFromComposition' || inputType === 'insertText';

export type CapturedCompositionModelInput = Readonly<{
  command: Readonly<Extract<EditableCommand, { kind: 'insert-text' }>> | null;
  data: string;
  inputType: CompositionFinalInputType;
}>;

export const captureCompositionModelInput = ({
  command,
  data,
  inputType,
}: {
  command: EditableCommand | null;
  data: string;
  inputType: CapturedCompositionModelInput['inputType'];
}): CapturedCompositionModelInput =>
  Object.freeze({
    command:
      command?.kind === 'insert-text' ? Object.freeze({ ...command }) : null,
    data,
    inputType,
  });

export const getPendingCompositionInputOwnership = ({
  editor,
  inputController,
  inputType,
  native,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  inputType: string;
  native: boolean;
}): 'external' | 'none' | 'plite' | 'settled' => {
  const pending = inputController.state.pendingCompositionEnd;

  if (!pending || !isCompositionFinalInputType(inputType)) {
    return 'none';
  }

  if (pending.ownership === 'settled') return 'settled';
  if (pending.ownership === 'external') return 'external';
  if (native || findEditorDOMRootRuntime(editor)?.isWebKitHost) return 'none';
  if (!ReactEditor.isComposing(editor)) return 'none';

  return 'plite';
};

export const claimSettledCompositionInput = ({
  data,
  inputController,
  inputType,
}: {
  data: unknown;
  inputController: EditableInputController;
  inputType: string;
}) => {
  const pending = inputController.state.pendingCompositionEnd;

  if (pending?.ownership !== 'settled') return false;

  const matches =
    typeof data === 'string' &&
    isCompositionFinalInputType(inputType) &&
    pending.data === data &&
    pending.inputTypes.includes(inputType);

  pending.cancel();
  return matches;
};

export const queuePendingCompositionModelInput = ({
  command,
  data,
  editor,
  inputController,
  inputType,
  onCommitted,
  repair,
  selection,
  setComposing,
}: {
  command: EditableCommand | null;
  data: string;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  inputType: CompositionFinalInputType;
  onCommitted?: () => void;
  repair: Pick<EditableEventRuntime['repair'], 'requestEditableRepair'>;
  selection: Range | null;
  setComposing: EditableEventRuntime['composition']['setComposing'];
}) => {
  const pendingCompositionEnd = inputController.state.pendingCompositionEnd;

  if (pendingCompositionEnd?.ownership !== 'plite') return false;

  const capturedInput = captureCompositionModelInput({
    command,
    data,
    inputType,
  });
  const selectionAnchor = selection
    ? editor.anchor(selection, {
        association: 'inward',
        deletion: 'nearest',
      })
    : null;
  let selectionReleased = false;
  let request: ReturnType<typeof applyModelOwnedBeforeInputMutation> = null;

  const releaseSelection = () => {
    if (selectionReleased) return null;

    selectionReleased = true;
    return selectionAnchor?.release() ?? null;
  };

  return pendingCompositionEnd.replaceWithInput(
    Object.freeze({
      commit: (fallbackSelection, { publish }) => {
        if (inputController.state.compositionSession?.modelCommitted) {
          return false;
        }

        const liveSelection = releaseSelection() ?? fallbackSelection;

        if (!liveSelection) return false;

        const { committed } = runTrackedEditableCompositionMutation({
          callback: () => {
            request = applyModelOwnedBeforeInputMutation({
              command: capturedInput.command,
              data: capturedInput.data,
              editor,
              inputType: capturedInput.inputType,
              native: false,
              preserveComposing: true,
              selection: liveSelection,
              setComposing,
            });
          },
          editor,
          inputController,
        });
        if (publish && committed) {
          setEditableModelSelectionPreference({
            inputController,
            preferModelSelection: true,
            reason: 'composition',
            selectionSource: 'model-owned',
          });
          armModelOwnedTextInputGuard({ inputController });
          inputController.state.selectionChangeOrigin = 'programmatic-export';
        }
        return committed;
      },
      complete: () => {
        repair.requestEditableRepair(
          request && request.kind !== 'none'
            ? request
            : {
                focus: true,
                forceRender: true,
                kind: 'repair-caret',
                selectionSourceTransition: {
                  preferModelSelection: true,
                  reason: 'model-command',
                  selectionSource: 'model-owned',
                },
              }
        );
        onCommitted?.();

        if (!capturedInput.command) {
          restoreUserSelectionAfterBeforeInput({ editor });
        }
      },
      data: capturedInput.data,
      discard: () => {
        releaseSelection();
      },
      inputType: capturedInput.inputType,
    })
  );
};

export const getDeferredNativeTextInputRepairPathKey = ({
  data,
  deferNativeTextInputRepair,
  inputType,
  native,
  selection,
}: {
  data: unknown;
  deferNativeTextInputRepair: boolean;
  inputType: string;
  native: boolean;
  selection: Range | null;
}) => {
  if (
    !deferNativeTextInputRepair ||
    !native ||
    inputType !== 'insertText' ||
    typeof data !== 'string' ||
    data.length === 0 ||
    !selection ||
    !RangeApi.isCollapsed(selection)
  ) {
    return null;
  }

  return selection.anchor.path.join(',');
};

export const shouldFlushPendingNativeTextInputBeforeDOMBeforeInput = ({
  pendingNativeTextInputRepairPathKey,
}: {
  inputType: string;
  pendingNativeTextInputRepairPathKey: string | null | undefined;
}) => !!pendingNativeTextInputRepairPathKey;

export const shouldFlushSelectionChangeBeforeDOMBeforeInput = ({
  inputController,
  inputType,
}: {
  inputController: EditableInputController;
  inputType: string;
}) =>
  !isEditableModelSelectionPreferredForInput({
    inputController,
    inputType,
  });

export const shouldIgnoreDOMBeforeInputWithoutSelection = ({
  event,
  nativeRangeCount,
}: {
  event: InputEvent;
  nativeRangeCount: number | null;
}) =>
  nativeRangeCount === 0 &&
  (event.inputType.startsWith('delete') ||
    event.inputType.startsWith('insert')) &&
  getInputEventTargetRanges(event).length === 0;

export const shouldAllowBeforeInputSelectionImport = ({
  event,
  selectionPolicyAllowsDOMImport,
}: {
  event: InputEvent;
  selectionPolicyAllowsDOMImport: boolean;
}) =>
  selectionPolicyAllowsDOMImport || getInputEventTargetRanges(event).length > 0;

export const useRuntimeBeforeInputEvents = ({
  androidInputManagerRef,
  deferNativeTextInputRepair = false,
  deferredMutations,
  editor,
  handledDOMBeforeInputRef,
  inputController,
  flushPendingNativeTextInput,
  onBeforeInput,
  onDOMBeforeInput,
  onInput,
  onUserInput,
  processing,
  queuePendingNativeTextInput,
  readOnly,
  repair,
  selection,
  setComposing,
  trace,
}: {
  androidInputManagerRef: EditableEventRuntime['android']['managerRef'];
  deferNativeTextInputRepair?: boolean;
  deferredMutations: RefObject<DeferredMutation[]>;
  editor: ReactRuntimeEditor;
  handledDOMBeforeInputRef: RefObject<boolean>;
  inputController: EditableInputController;
  flushPendingNativeTextInput?: () => void;
  onBeforeInput?: ReactBeforeInputHandler;
  onDOMBeforeInput?: EditableDOMBeforeInputHandler;
  onInput?: unknown;
  onUserInput: () => void;
  processing: RefObject<boolean>;
  queuePendingNativeTextInput?: (input: {
    data: string;
    inputType: string;
    rootElement: HTMLElement;
    selection: Range | null;
  }) => boolean;
  readOnly: boolean;
  repair: EditableEventRuntime['repair'];
  selection: EditableEventRuntime['selection'];
  setComposing: EditableEventRuntime['composition']['setComposing'];
  trace: EditableEventRuntime['trace'];
}) => {
  const pliteRuntimeContext = useOptionalPliteRuntimeContext();
  const handleDOMBeforeInput = useCallback(
    (event: InputEvent) =>
      profileBeforeInputDuration('beforeinput-total', () => {
        const shouldFlushPendingTextInput =
          deferNativeTextInputRepair &&
          shouldFlushPendingNativeTextInputBeforeDOMBeforeInput({
            inputType: event.inputType,
            pendingNativeTextInputRepairPathKey:
              inputController.state.pendingNativeTextInputRepairPathKey,
          });

        if (shouldFlushPendingTextInput) {
          flushPendingNativeTextInput?.();
        }

        const decision = profileBeforeInputDuration('beforeinput-prepare', () =>
          prepareEditableBeforeInputKernel({
            editor,
            event,
            inputController,
          })
        );
        inputController.state.activeIntent = decision.intent;
        profileBeforeInputDuration('beforeinput-trace', () =>
          trace.recordKernelEventTrace({
            command: decision.command,
            family: 'beforeinput',
            intent: decision.intent,
            ownership: decision.ownership,
            target: event.target,
          })
        );
        if (
          profileBeforeInputDuration('beforeinput-native-history', () =>
            applyModelOwnedNativeHistoryEvent({ editor, event, readOnly })
          )
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (shouldForceRenderAfterModelOwnedHistory(editor)) {
            repair.requestEditableRepair({
              forceRender: true,
              kind: 'force-render',
            });
          }
          handledDOMBeforeInputRef.current = true;
          return;
        }

        if (
          profileBeforeInputDuration(
            'beforeinput-complete-duplicate-command',
            () =>
              completeDuplicateEditableEditingEpochCommand(
                editor,
                decision.command
              )
          )
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          handledDOMBeforeInputRef.current = true;
          return;
        }

        if (decision.internalTarget) {
          event.stopImmediatePropagation();
          return;
        }
        const el = profileBeforeInputDuration('beforeinput-root-node', () =>
          ReactEditor.assertDOMNode(editor, editor)
        );
        if (
          profileBeforeInputDuration('beforeinput-nested-editable-target', () =>
            isNestedEditableDOMTarget(el, event.target)
          )
        ) {
          return;
        }

        if (readOnly && ReactEditor.hasEditableTarget(editor, event.target)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          handledDOMBeforeInputRef.current = true;
          return;
        }

        const root = profileBeforeInputDuration(
          'beforeinput-root-owner',
          () => el.getRootNode() as Document | ShadowRoot
        );

        if (
          profileBeforeInputDuration('beforeinput-webkit-shadow', () =>
            handleWebKitShadowDOMBeforeInput({
              editor,
              event,
              processing,
              root,
              window,
            })
          )
        ) {
          return;
        }
        profileBeforeInputDuration('beforeinput-on-user-input', onUserInput);

        const editableTarget = profileBeforeInputDuration(
          'beforeinput-has-editable-target',
          () => ReactEditor.hasEditableTarget(editor, event.target)
        );

        if (!readOnly && editableTarget) {
          if (
            event.inputType.startsWith('insert') &&
            SelectionApi.isNode(readRuntimeSelection(editor))
          ) {
            event.preventDefault();
            event.stopImmediatePropagation();
            handledDOMBeforeInputRef.current = true;
            return;
          }

          if (
            profileBeforeInputDuration('beforeinput-without-selection', () =>
              shouldIgnoreDOMBeforeInputWithoutSelection({
                event,
                nativeRangeCount: getSelection(root)?.rangeCount ?? null,
              })
            )
          ) {
            return;
          }

          handledDOMBeforeInputRef.current = true;
          const shouldFlushSelectionChange = profileBeforeInputDuration(
            'beforeinput-should-flush-selection',
            () =>
              shouldFlushSelectionChangeBeforeDOMBeforeInput({
                inputController,
                inputType: event.inputType,
              })
          );

          if (shouldFlushSelectionChange) {
            profileBeforeInputDuration('beforeinput-flush-selection', () =>
              selection.flushSelectionChange()
            );
          }

          let currentSelection = profileBeforeInputDuration(
            'beforeinput-read-selection',
            () => readRuntimeSelectionRange(editor)
          );

          if (
            !profileBeforeInputDuration('beforeinput-is-editor-view', () =>
              isSelectionInEditorView(editor, currentSelection)
            )
          ) {
            return;
          }

          const hasAppInputPolicy = Boolean(
            onDOMBeforeInput ||
              onBeforeInput ||
              onInput ||
              hasCommandHandler(editor, editorCommands.insertText)
          );

          if (hasAppInputPolicy) {
            flushPendingNativeTextInput?.();
            currentSelection = profileBeforeInputDuration(
              'beforeinput-reread-selection-after-native-text-flush',
              () => readRuntimeSelectionRange(editor)
            );
          }

          const beforeInputDecision = profileBeforeInputDuration(
            'beforeinput-native-decision',
            () =>
              getNativeBeforeInputDecision({
                allowDirtyDOMText:
                  deferNativeTextInputRepair &&
                  inputController.state.selectionSource === 'dom-current',
                editor,
                event,
                hasAppInputPolicy,
                selection: currentSelection,
              })
          );
          const {
            data,
            inputType: type,
            isCompositionChange,
            native: initialNative,
            shouldAbortForCompositionChange,
          } = beforeInputDecision;
          clearExpiredTextInputRepairEcho(inputController, now());
          const selectionRoot =
            getSelectionRoot(currentSelection) ??
            getNestedEditableDOMSelectionRoot(el);
          const viewRoot = profileBeforeInputDuration(
            'beforeinput-read-view-root',
            () => toInternalRoot(editor.read((state) => state.view.root()))
          );
          const targetEditor =
            selectionRoot && selectionRoot !== viewRoot
              ? pliteRuntimeContext?.getMountedViewEditor(selectionRoot)
              : null;

          if (selectionRoot && selectionRoot !== viewRoot && !targetEditor) {
            return;
          }

          if (
            claimSettledCompositionInput({
              data,
              inputController,
              inputType: type,
            })
          ) {
            event.preventDefault();
            return;
          }

          if (targetEditor && androidInputManagerRef.current) {
            return androidInputManagerRef.current.handleDOMBeforeInput(event);
          }

          if (targetEditor && targetEditor !== editor) {
            const pendingCompositionInputOwnership =
              getPendingCompositionInputOwnership({
                editor,
                inputController,
                inputType: type,
                native: false,
              });

            if (pendingCompositionInputOwnership === 'external') return;

            event.preventDefault();
            event.stopImmediatePropagation();
            handledDOMBeforeInputRef.current = true;

            if (
              pendingCompositionInputOwnership === 'plite' &&
              typeof data === 'string' &&
              isCompositionFinalInputType(type) &&
              queuePendingCompositionModelInput({
                command: decision.command,
                data,
                editor: targetEditor,
                inputController,
                inputType: type,
                onCommitted: () => focusPliteEditable(targetEditor),
                repair,
                selection:
                  currentSelection ??
                  targetEditor.read((state) => state.selection()),
                setComposing,
              })
            ) {
              return;
            }

            const request = profileBeforeInputDuration(
              'beforeinput-redirect-root',
              () => {
                const applyMutation = () =>
                  applyModelOwnedBeforeInputMutation({
                    command: decision.command,
                    data,
                    editor: targetEditor,
                    inputType: type,
                    native: false,
                    selection:
                      currentSelection ??
                      targetEditor.read((state) => state.selection()),
                    setComposing,
                  });

                return isCompositionFinalInputType(type)
                  ? runTrackedEditableCompositionMutation({
                      callback: applyMutation,
                      editor: targetEditor,
                      inputController,
                    }).result
                  : applyMutation();
              }
            );

            if (request) {
              focusPliteEditable(targetEditor);
            }

            return;
          }

          const domBeforeInputContext: EditableDOMBeforeInputContext = {
            data,
            editor,
            event,
            inputType: type,
            intent: decision.intent,
            native: initialNative,
            selection: currentSelection,
          };

          const runDOMBeforeInputHandler = () =>
            isDOMBeforeInputHandled(
              event,
              onDOMBeforeInput,
              domBeforeInputContext
            );
          const domBeforeInputHandled = profileBeforeInputDuration(
            'beforeinput-dom-handler',
            () =>
              isCompositionFinalInputType(type)
                ? runTrackedEditableCompositionMutation({
                    callback: runDOMBeforeInputHandler,
                    editor,
                    inputController,
                  }).result
                : runDOMBeforeInputHandler()
          );

          if (domBeforeInputHandled) {
            return;
          }

          if (androidInputManagerRef.current) {
            return androidInputManagerRef.current.handleDOMBeforeInput(event);
          }

          if (shouldAbortForCompositionChange) {
            return;
          }

          profileBeforeInputDuration('beforeinput-run-deferred-intents', () =>
            runTrackedEditableCompositionMutation({
              callback: () => {
                for (const intent of deferredMutations.current) {
                  intent();
                }
                deferredMutations.current = [];
              },
              editor,
              inputController,
            })
          );

          let native = beforeInputDecision.native;
          const forceModelOwnedTextInput = profileBeforeInputDuration(
            'beforeinput-force-model-owned-text-input',
            () =>
              shouldForceModelOwnedTextInput({
                inputController,
                inputType: type,
              })
          );

          const beforeInputSelection = profileBeforeInputDuration(
            'beforeinput-sync-selection',
            () => {
              const selectionPolicyAllowsDOMImport =
                selection.allowDOMSelectionImport(decision.selectionPolicy);

              return syncSelectionForBeforeInput({
                allowDOMSelectionImport: shouldAllowBeforeInputSelectionImport({
                  event,
                  selectionPolicyAllowsDOMImport,
                }),
                data,
                editor,
                editorElement: el,
                event,
                forceModelOwnedTextInput,
                inputType: type,
                isCompositionChange,
                native,
                pendingNativeTextInputRepairPathKey:
                  inputController.state.pendingNativeTextInputRepairPathKey,
                pendingNativeTextInputRepairOffset:
                  inputController.state.pendingNativeTextInputRepairOffset,
                preferModelSelectionForInput:
                  isEditableModelSelectionPreferredForInput({
                    inputController,
                    inputType: type,
                  }) || forceModelOwnedTextInput,
                root,
                selectionChangeOrigin:
                  inputController.state.selectionChangeOrigin,
                selection: currentSelection,
              });
            }
          );
          native = beforeInputSelection.native;
          currentSelection = beforeInputSelection.selection;
          const pendingCompositionInputOwnership =
            getPendingCompositionInputOwnership({
              editor,
              inputController,
              inputType: type,
              native,
            });

          if (pendingCompositionInputOwnership === 'external') {
            return;
          }
          let didRepairNonNativeDOMTextInput = false;

          if (
            pendingCompositionInputOwnership !== 'plite' &&
            deferNativeTextInputRepair &&
            !native &&
            type === 'insertText' &&
            typeof data === 'string' &&
            data.length > 0 &&
            currentSelection &&
            RangeApi.isCollapsed(currentSelection)
          ) {
            flushPendingNativeTextInput?.();
            currentSelection = profileBeforeInputDuration(
              'beforeinput-reread-selection-for-dom-repair',
              () => readRuntimeSelectionRange(editor)
            );

            if (currentSelection && RangeApi.isCollapsed(currentSelection)) {
              const pendingTarget = profileBeforeInputDuration(
                'beforeinput-dom-repair-target',
                () =>
                  getDOMInputRepairTarget(
                    editor,
                    el,
                    {
                      data,
                      inputType: type,
                    },
                    {
                      preferRuntimeSelection: true,
                    }
                  )
              );

              if (
                pendingTarget?.insert &&
                PathApi.equals(pendingTarget.path, currentSelection.anchor.path)
              ) {
                profileBeforeInputDuration('beforeinput-repair-dom-input', () =>
                  runTrackedEditableCompositionMutation({
                    callback: () =>
                      trace.repairDOMInputWithTrace(
                        {
                          data,
                          inputType: type,
                          target: pendingTarget,
                        },
                        el
                      ),
                    editor,
                    inputController,
                  })
                );
                setEditableModelSelectionPreference({
                  inputController,
                  preferModelSelection: true,
                  reason: 'model-command',
                  selectionSource: 'model-owned',
                });
                armModelOwnedTextInputGuard({ inputController });
                didRepairNonNativeDOMTextInput = true;
                currentSelection = profileBeforeInputDuration(
                  'beforeinput-reread-selection-after-dom-repair',
                  () => readRuntimeSelectionRange(editor)
                );
              }
            }
          }

          profileBeforeInputDuration(
            'beforeinput-set-pending-repair-path',
            () => {
              inputController.state.pendingNativeTextInputRepairPathKey =
                getDeferredNativeTextInputRepairPathKey({
                  data,
                  deferNativeTextInputRepair,
                  inputType: type,
                  native,
                  selection: currentSelection,
                });
              inputController.state.pendingNativeTextInputRepairOffset = null;
            }
          );

          if (isCompositionChange) {
            return;
          }

          if (
            pendingCompositionInputOwnership === 'plite' &&
            typeof data === 'string' &&
            isCompositionFinalInputType(type)
          ) {
            event.preventDefault();

            if (
              queuePendingCompositionModelInput({
                command: decision.command,
                data,
                editor,
                inputController,
                inputType: type,
                repair,
                selection: currentSelection,
                setComposing,
              })
            ) {
              inputController.state.pendingNativeTextInputRepairPathKey = null;
              inputController.state.pendingNativeTextInputRepairOffset = null;
              return;
            }
          }

          if (!native) {
            profileBeforeInputDuration('beforeinput-prevent-default', () =>
              event.preventDefault()
            );
          }

          const queuedPendingNativeTextRepair =
            deferNativeTextInputRepair &&
            native &&
            type === 'insertText' &&
            typeof data === 'string' &&
            data.length > 0
              ? profileBeforeInputDuration(
                  'beforeinput-queue-native-text-repair',
                  () =>
                    queuePendingNativeTextInput?.({
                      data,
                      inputType: type,
                      rootElement: el,
                      selection: currentSelection,
                    }) ?? false
                )
              : false;

          const request = didRepairNonNativeDOMTextInput
            ? null
            : profileBeforeInputDuration('beforeinput-apply-model', () => {
                const applyMutation = () =>
                  applyModelOwnedBeforeInputMutation({
                    command: decision.command,
                    data,
                    editor,
                    inputType: type,
                    native,
                    selection: currentSelection,
                    setComposing,
                  });

                return isCompositionFinalInputType(type)
                  ? runTrackedEditableCompositionMutation({
                      callback: applyMutation,
                      editor,
                      inputController,
                    }).result
                  : applyMutation();
              });
          if (request) {
            const shouldDeferNativeTextRepair =
              deferNativeTextInputRepair &&
              native &&
              type === 'insertText' &&
              typeof data === 'string' &&
              data.length > 0 &&
              queuedPendingNativeTextRepair &&
              request.kind === 'repair-caret-after-text-insert';

            if (!shouldDeferNativeTextRepair) {
              profileBeforeInputDuration('beforeinput-request-repair', () =>
                repair.requestEditableRepair(request)
              );
            }
          }

          if (!decision.command) {
            profileBeforeInputDuration(
              'beforeinput-restore-user-selection',
              () => restoreUserSelectionAfterBeforeInput({ editor })
            );
          }
        }
      }),
    [
      androidInputManagerRef,
      deferNativeTextInputRepair,
      deferredMutations,
      editor,
      flushPendingNativeTextInput,
      handledDOMBeforeInputRef,
      inputController,
      onBeforeInput,
      onDOMBeforeInput,
      onInput,
      onUserInput,
      processing,
      queuePendingNativeTextInput,
      readOnly,
      repair,
      selection,
      setComposing,
      pliteRuntimeContext,
      trace,
    ]
  );
  const onRuntimeDOMBeforeInput = useEditableDOMBeforeInputHandler({
    handleDOMBeforeInput,
  });

  const handleReactBeforeInputFallback = useCallback(
    (text: string) => {
      if (SelectionApi.isNode(readRuntimeSelection(editor))) {
        return;
      }

      const request = runTrackedEditableCompositionMutation({
        callback: () =>
          applyModelOwnedBeforeInputMutation({
            command: { inputType: 'insertText', kind: 'insert-text', text },
            data: text,
            editor,
            inputType: 'insertText',
            native: false,
            selection: readRuntimeSelectionRange(editor),
            setComposing,
          }),
        editor,
        inputController,
      }).result;

      if (request) {
        repair.requestEditableRepair(request);
      }
    },
    [editor, inputController, repair, setComposing]
  );
  const handleTrackedReactBeforeInput = useCallback(
    (event: FormEvent<HTMLDivElement>) =>
      runTrackedEditableCompositionMutation({
        callback: () => onBeforeInput?.(event),
        editor,
        inputController,
      }).result,
    [editor, inputController, onBeforeInput]
  );
  const onRuntimeReactBeforeInput = useEditableReactBeforeInputHandler({
    editor,
    handleFallbackInsertText: handleReactBeforeInputFallback,
    onBeforeInput: handleTrackedReactBeforeInput,
    readOnly,
  });

  return {
    onDOMBeforeInput: onRuntimeDOMBeforeInput,
    onReactBeforeInput: onRuntimeReactBeforeInput,
  };
};
