import { type FormEvent, type RefObject, useCallback } from 'react';
import { PathApi, type Range, RangeApi } from '@platejs/plite';
import { getSelection } from '@platejs/plite-dom';
import type {
  EditableDOMBeforeInputContext,
  EditableDOMBeforeInputHandler,
} from '../components/editable';
import { focusPliteEditable } from '../hooks/focus-plite-editable';
import { useOptionalPliteRuntimeContext } from '../hooks/use-plite-runtime';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import { getInputEventTargetRanges } from './dom-input-event';
import { completeDuplicateEditableEditingEpochCommand } from './editing-epoch-kernel';
import { prepareEditableBeforeInputKernel } from './editing-kernel';
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
} from './input-state';
import {
  applyModelOwnedBeforeInputOperation,
  applyModelOwnedNativeHistoryEvent,
  type DeferredOperation,
  shouldForceRenderAfterModelOwnedHistory,
} from './model-input-strategy';
import { getNativeBeforeInputDecision } from './native-input-strategy';
import { hasEditorTransformMiddleware } from './runtime-editor-api';
import type { EditableEventRuntime } from './runtime-event-engine';
import { readLiveSelection } from './runtime-selection-state';
import {
  handleWebKitShadowDOMBeforeInput,
  restoreUserSelectionAfterBeforeInput,
  syncSelectionForBeforeInput,
} from './selection-reconciler';

type ApplyInputRules = ({
  data,
  event,
  inputType,
  selection,
}: {
  data: unknown;
  event?: InputEvent;
  inputType: string;
  selection: Range | null;
}) => boolean;

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
  applyInputRules,
  deferNativeTextInputRepair = false,
  deferredOperations,
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
  applyInputRules: ApplyInputRules;
  deferNativeTextInputRepair?: boolean;
  deferredOperations: RefObject<DeferredOperation[]>;
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
            () => readLiveSelection(editor)
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
              hasEditorTransformMiddleware(editor, 'insertText')
          );

          if (hasAppInputPolicy) {
            flushPendingNativeTextInput?.();
            currentSelection = profileBeforeInputDuration(
              'beforeinput-reread-selection-after-native-text-flush',
              () => readLiveSelection(editor)
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
            () => editor.read((state) => state.view.root())
          );
          const targetEditor =
            selectionRoot && selectionRoot !== viewRoot
              ? pliteRuntimeContext?.getMountedViewEditor(selectionRoot)
              : null;

          if (selectionRoot && selectionRoot !== viewRoot && !targetEditor) {
            return;
          }

          if (targetEditor && targetEditor !== editor) {
            event.preventDefault();
            event.stopImmediatePropagation();
            handledDOMBeforeInputRef.current = true;

            const request = profileBeforeInputDuration(
              'beforeinput-redirect-root',
              () =>
                applyModelOwnedBeforeInputOperation({
                  command: decision.command,
                  data,
                  deferredOperations,
                  editor: targetEditor,
                  inputType: type,
                  native: false,
                  selection:
                    currentSelection ??
                    targetEditor.read((state) => state.selection.get()),
                  setComposing,
                })
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

          if (
            profileBeforeInputDuration('beforeinput-dom-handler', () =>
              isDOMBeforeInputHandled(
                event,
                onDOMBeforeInput,
                domBeforeInputContext
              )
            )
          ) {
            return;
          }

          if (androidInputManagerRef.current) {
            return androidInputManagerRef.current.handleDOMBeforeInput(event);
          }

          if (shouldAbortForCompositionChange) {
            return;
          }

          profileBeforeInputDuration(
            'beforeinput-run-deferred-operations',
            () => {
              for (const operation of deferredOperations.current) {
                operation();
              }
              deferredOperations.current = [];
            }
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
          let didRepairNonNativeDOMTextInput = false;

          if (
            deferNativeTextInputRepair &&
            !native &&
            type === 'insertText' &&
            typeof data === 'string' &&
            data.length > 0 &&
            currentSelection &&
            RangeApi.isCollapsed(currentSelection)
          ) {
            flushPendingNativeTextInput?.();
            currentSelection = readLiveSelection(editor);

            if (currentSelection && RangeApi.isCollapsed(currentSelection)) {
              const pendingTarget = getDOMInputRepairTarget(
                editor,
                el,
                {
                  data,
                  inputType: type,
                },
                {
                  preferRuntimeSelection: true,
                }
              );

              if (
                pendingTarget?.insert &&
                PathApi.equals(pendingTarget.path, currentSelection.anchor.path)
              ) {
                trace.repairDOMInputWithTrace(
                  {
                    data,
                    inputType: type,
                    target: pendingTarget,
                  },
                  el
                );
                setEditableModelSelectionPreference({
                  inputController,
                  preferModelSelection: true,
                  reason: 'model-command',
                  selectionSource: 'model-owned',
                });
                armModelOwnedTextInputGuard({ inputController });
                didRepairNonNativeDOMTextInput = true;
                currentSelection = readLiveSelection(editor);
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
            profileBeforeInputDuration('beforeinput-input-rules', () =>
              applyInputRules({
                data,
                event,
                inputType: type,
                selection: currentSelection,
              })
            )
          ) {
            return;
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
            : profileBeforeInputDuration('beforeinput-apply-model', () =>
                applyModelOwnedBeforeInputOperation({
                  command: decision.command,
                  data,
                  deferredOperations,
                  editor,
                  inputType: type,
                  native,
                  selection: currentSelection,
                  setComposing,
                })
              );
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
      applyInputRules,
      deferNativeTextInputRepair,
      deferredOperations,
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
      const request = applyModelOwnedBeforeInputOperation({
        command: { inputType: 'insertText', kind: 'insert-text', text },
        data: text,
        deferredOperations,
        editor,
        inputType: 'insertText',
        native: false,
        selection: readLiveSelection(editor),
        setComposing,
      });

      if (request) {
        repair.requestEditableRepair(request);
      }
    },
    [deferredOperations, editor, repair, setComposing]
  );
  const onRuntimeReactBeforeInput = useEditableReactBeforeInputHandler({
    editor,
    handleFallbackInsertText: handleReactBeforeInputFallback,
    onBeforeInput,
    readOnly,
  });

  return {
    onDOMBeforeInput: onRuntimeDOMBeforeInput,
    onReactBeforeInput: onRuntimeReactBeforeInput,
  };
};
