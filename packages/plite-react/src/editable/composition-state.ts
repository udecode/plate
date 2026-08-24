import {
  type EditorMarks,
  NodeApi,
  RangeApi,
  type Selection,
  type Text,
  TextApi,
} from '@platejs/plite';
import { isDOMNode } from '@platejs/plite-dom';
import {
  EDITOR_TO_PENDING_INSERTION_MARKS,
  EDITOR_TO_USER_MARKS,
  findEditorDOMRootRuntime,
  hasDOMHostQuirk,
  isAndroidDOMHost,
  isWebKitDOMHost,
} from '@platejs/plite-dom/internal';
import { type CompositionEvent, type RefObject, useEffect } from 'react';

import type { AndroidInputManager } from '../hooks/android-input-manager/android-input-manager';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  getMountedEditableDOMRuntime,
  hasMountedEditableCompositionOwner,
} from './editable-dom-runtime';
import type { EditableCompositionStateSetter } from './input-controller';
import { updateNativeTextInput } from './input-history';
import type {
  EditableInputController,
  PendingCompositionEnd,
  PendingCompositionInput,
} from './input-state';
import {
  beginEditableCompositionSession,
  captureEditableCompositionRuntimeMarks,
  clearEditableCompositionRuntimeState,
  markEditableCompositionModelCommitted,
  recordEditableCompositionText,
  restoreEditableCompositionRuntimeMarks,
  shouldMergeEditableCompositionHistory,
} from './input-state';
import type { Editor } from './runtime-editor-api';
import { readRuntimeText } from './runtime-live-state';
import { writeRuntimeMarks } from './runtime-mutation-state';
import {
  armModelOwnedTextInputGuard,
  setEditableModelSelectionPreference,
} from './selection-controller';

type EditableCompositionHandler = (
  event: CompositionEvent<HTMLDivElement>
) => boolean | void;

type CompositionFinalInputType = 'insertFromComposition' | 'insertText';

type CompositionAttempt<T> =
  | Readonly<{ ok: false }>
  | Readonly<{ ok: true; value: T }>;

const createCompositionFailureScope = () => {
  let firstError: unknown;
  let hasError = false;
  const attempt = <T>(callback: () => T): CompositionAttempt<T> => {
    try {
      return { ok: true, value: callback() };
    } catch (error) {
      if (!hasError) {
        firstError = error;
        hasError = true;
      }

      return { ok: false };
    }
  };

  return {
    attempt,
    hasError: () => hasError,
    throwIfAny: () => {
      if (hasError) throw firstError;
    },
  };
};

const getCompositionEventText = (event: CompositionEvent<HTMLDivElement>) =>
  event.data || event.nativeEvent.data;

const isCompositionEventTargetInput = ({
  event,
}: {
  event: CompositionEvent<HTMLDivElement>;
}) =>
  isDOMNode(event.target) &&
  (event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement);

const isCompositionEventHandled = ({
  event,
  handler,
}: {
  event: CompositionEvent<HTMLDivElement>;
  handler?: EditableCompositionHandler;
}) => {
  if (!handler) {
    return false;
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event);

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled;
  }

  return event.isDefaultPrevented() || event.isPropagationStopped();
};

const preventReadOnlyEditableComposition = ({
  editor,
  event,
  inputController,
  setComposing,
}: {
  editor: ReactRuntimeEditor;
  event: CompositionEvent<HTMLDivElement>;
  inputController?: EditableInputController;
  setComposing?: EditableCompositionStateSetter;
}) => {
  if (!ReactEditor.hasEditableTarget(editor, event.target)) {
    return false;
  }

  const failures = createCompositionFailureScope();
  const pendingCompositionEnd = inputController?.state.pendingCompositionEnd;
  const wasComposing = Boolean(
    inputController?.state.isComposing || ReactEditor.isComposing(editor)
  );
  const siblingOwnsComposition = inputController
    ? hasMountedEditableCompositionOwner(editor, inputController)
    : false;
  const runtimeMarks = captureEditableCompositionRuntimeMarks(editor);

  failures.attempt(() => {
    event.preventDefault();
  });
  failures.attempt(() => {
    event.stopPropagation();
  });
  if (pendingCompositionEnd?.ownership === 'plite') {
    failures.attempt(() => pendingCompositionEnd.flush({ publish: false }));
  } else {
    failures.attempt(() => pendingCompositionEnd?.cancel());
  }
  failures.attempt(() =>
    inputController?.state.pendingCompositionEnd?.cancel()
  );
  if (inputController) {
    inputController.state.pendingCompositionEnd = null;
    inputController.state.compositionSession = null;
  }
  if (wasComposing && setComposing) {
    failures.attempt(() => {
      setComposing(false);
    });
  }
  if (inputController) {
    inputController.state.isComposing = false;
    if (inputController.state.activeIntent === 'composition') {
      inputController.state.activeIntent = null;
    }
    if (inputController.state.selectionSource === 'composition-owned') {
      inputController.state.selectionSource = 'unknown';
    }
  }
  if (siblingOwnsComposition) {
    failures.attempt(() => {
      restoreEditableCompositionRuntimeMarks(editor, runtimeMarks);
    });
  } else {
    failures.attempt(() => {
      clearEditableCompositionRuntimeState(editor);
    });
  }
  failures.throwIfAny();

  return true;
};

export const commitInsertFromComposition = ({
  preserveComposing = false,
  setComposing,
}: {
  preserveComposing?: boolean;
  setComposing: EditableCompositionStateSetter;
}) => {
  // COMPAT: in Safari, `compositionend` is dispatched after the
  // `beforeinput` for "insertFromComposition". But if we wait for it
  // then we will abort because we're still composing and the selection
  // won't be updated properly.
  // https://www.w3.org/TR/input-events-2/
  if (!preserveComposing) {
    setComposing(false);
  }
};

const schedulePendingCompositionEnd = ({
  commitFallback,
  discardFallback,
  finishComposing,
  inputController,
  ownership,
  resolveFallbackTarget,
  runOwnedDOMMutation,
  scheduleTask,
  settledData,
}: {
  commitFallback: (
    shouldCommit: boolean,
    target: Selection,
    options: Readonly<{ publish: boolean }>
  ) => boolean;
  discardFallback: () => void;
  finishComposing: () => void;
  inputController: EditableInputController;
  ownership: 'external' | 'plite';
  resolveFallbackTarget: () => Selection;
  runOwnedDOMMutation: (callback: () => void) => void;
  scheduleTask: NonNullable<EditableInputController['scheduleTask']>;
  settledData: string;
}) => {
  inputController.domInputRuntime.setCompositionPhase('final-input-ready');
  let active = true;
  let cancelScheduledTask = () => {};
  let claimedInput: PendingCompositionInput | null = null;
  let controller: PendingCompositionEnd;
  let publishCompletion = true;
  let runScheduledTask: (() => void) | null = null;
  let settledInput: {
    data: string;
    inputTypes: readonly CompositionFinalInputType[];
  } = {
    data: settledData,
    inputTypes: ['insertFromComposition', 'insertText'],
  };

  const clear = () => {
    if (inputController.state.pendingCompositionEnd === controller) {
      inputController.state.pendingCompositionEnd = null;
    }
  };
  const takeScheduledCancellation = () => {
    const cancel = cancelScheduledTask;

    cancelScheduledTask = () => {};
    runScheduledTask = null;
    cancel();
  };
  const cancel = () => {
    if (!active) return;

    active = false;
    const failures = createCompositionFailureScope();
    const pendingInput = claimedInput;

    claimedInput = null;
    failures.attempt(takeScheduledCancellation);
    failures.attempt(() => pendingInput?.discard());
    failures.attempt(discardFallback);
    clear();
    failures.throwIfAny();
  };
  const installSettledTombstone = () => {
    let cancelExpiry = () => {};
    const tombstone: PendingCompositionEnd = Object.freeze({
      cancel: () => {
        const failures = createCompositionFailureScope();

        if (inputController.state.pendingCompositionEnd === tombstone) {
          inputController.state.pendingCompositionEnd = null;
        }
        failures.attempt(cancelExpiry);
        failures.throwIfAny();
      },
      data: settledInput.data,
      inputTypes: settledInput.inputTypes,
      ownership: 'settled',
      phase: 'settled',
    });

    inputController.state.pendingCompositionEnd = tombstone;
    try {
      cancelExpiry = scheduleTask(
        'model',
        'clear-composition-end-tombstone',
        () => {
          tombstone.cancel();
        },
        {
          key: 'composition-end-tombstone',
          timing: 'timeout',
        }
      );
    } catch {
      // Keep the one-shot guard. A later final input, composition start, or
      // runtime teardown still clears it when expiry cannot be scheduled.
    }
  };
  const schedule = (callback: (settle: () => void) => void) => {
    const run = () => {
      if (!active) return;

      inputController.domInputRuntime.setCompositionPhase('committing');
      runScheduledTask = null;
      cancelScheduledTask = () => {};
      let settled = false;
      let enteredOwnedMutation = false;
      const failures = createCompositionFailureScope();

      failures.attempt(() => {
        runOwnedDOMMutation(() => {
          enteredOwnedMutation = true;
          failures.attempt(() =>
            callback(() => {
              settled = true;
            })
          );
        });
      });
      active = false;
      if (!enteredOwnedMutation) {
        const pendingInput = claimedInput;

        claimedInput = null;
        failures.attempt(() => pendingInput?.discard());
        failures.attempt(discardFallback);
        if (publishCompletion) failures.attempt(finishComposing);
      }
      clear();
      if (settled) failures.attempt(installSettledTombstone);
      failures.throwIfAny();
    };

    runScheduledTask = run;
    cancelScheduledTask = scheduleTask('model', 'finish-composition-end', run, {
      timing: 'timeout',
    });
  };

  if (ownership === 'external') {
    const externalController: PendingCompositionEnd = Object.freeze({
      cancel,
      ownership,
      phase: 'end-pending',
    });

    controller = externalController;
  } else {
    const replaceWithInput = (input: PendingCompositionInput) => {
      if (
        !active ||
        inputController.state.pendingCompositionEnd !== controller
      ) {
        input.discard();
        return false;
      }
      if (claimedInput) {
        input.discard();
        return true;
      }

      claimedInput = input;
      inputController.domInputRuntime.settleComposition(
        input.inputType,
        'model'
      );
      settledInput = {
        data: input.data,
        inputTypes: ['insertFromComposition', 'insertText'],
      };
      const setupFailures = createCompositionFailureScope();

      setupFailures.attempt(takeScheduledCancellation);
      setupFailures.attempt(() => {
        schedule((settle) => {
          const pendingInput = claimedInput;

          if (!pendingInput) return;

          claimedInput = null;
          let committed = false;
          const failures = createCompositionFailureScope();

          if (inputController.state.compositionSession?.modelCommitted) {
            settle();
          }
          const fallbackTarget = failures.attempt(resolveFallbackTarget);

          if (fallbackTarget.ok) {
            const commit = failures.attempt(() =>
              pendingInput.commit(fallbackTarget.value, {
                publish: publishCompletion,
              })
            );

            if (!commit.ok) {
              if (inputController.state.compositionSession?.modelCommitted) {
                settle();
              }
            } else if (commit.value) {
              committed = true;
              settle();
              failures.attempt(() =>
                commitFallback(false, null, { publish: publishCompletion })
              );
            } else {
              const fallback = failures.attempt(() =>
                commitFallback(true, fallbackTarget.value, {
                  publish: publishCompletion,
                })
              );

              if (!fallback.ok) {
                if (inputController.state.compositionSession?.modelCommitted) {
                  settle();
                }
              } else if (fallback.value) {
                committed = true;
                settle();
              }
            }
          }

          failures.attempt(discardFallback);
          if (publishCompletion) failures.attempt(finishComposing);
          failures.throwIfAny();
          if (committed && publishCompletion) pendingInput.complete();
        });
      });

      if (setupFailures.hasError()) {
        setupFailures.attempt(cancel);
        setupFailures.attempt(finishComposing);
        setupFailures.throwIfAny();
      }

      return true;
    };

    const flush = ({ publish = true } = {}) => {
      if (!active || !runScheduledTask) return false;

      publishCompletion = publish;
      const run = runScheduledTask;
      const failures = createCompositionFailureScope();

      failures.attempt(takeScheduledCancellation);
      failures.attempt(run);
      failures.throwIfAny();
      return true;
    };

    const pliteController: PendingCompositionEnd = Object.freeze({
      cancel,
      flush,
      ownership,
      get phase(): 'end-pending' | 'input-claimed' {
        return claimedInput ? 'input-claimed' : 'end-pending';
      },
      replaceWithInput,
    });

    controller = pliteController;
  }

  const setupFailures = createCompositionFailureScope();

  setupFailures.attempt(() =>
    inputController.state.pendingCompositionEnd?.cancel()
  );
  inputController.state.pendingCompositionEnd = controller;
  setupFailures.attempt(() => {
    schedule((settle) => {
      const failures = createCompositionFailureScope();

      if (
        ownership === 'plite' &&
        inputController.state.compositionSession?.modelCommitted
      ) {
        settle();
      }
      if (ownership === 'plite') {
        const fallbackTarget = failures.attempt(resolveFallbackTarget);

        if (fallbackTarget.ok) {
          const fallback = failures.attempt(() =>
            commitFallback(true, fallbackTarget.value, {
              publish: publishCompletion,
            })
          );

          if (!fallback.ok) {
            if (inputController.state.compositionSession?.modelCommitted) {
              settle();
            }
          } else if (fallback.value) {
            settle();
          }
        }
      }

      failures.attempt(discardFallback);
      if (publishCompletion) failures.attempt(finishComposing);
      failures.throwIfAny();
    });
  });
  if (setupFailures.hasError()) {
    setupFailures.attempt(cancel);
    setupFailures.attempt(finishComposing);
    setupFailures.throwIfAny();
  }
};

export const commitChromeCompositionEndFallback = ({
  editor,
  mergeHistory = false,
  rootElement,
  shouldCommit = true,
  target,
  text,
}: {
  editor: Editor;
  mergeHistory?: boolean;
  rootElement?: HTMLElement | null;
  shouldCommit?: boolean;
  target: Selection;
  text: string | null | undefined;
}): boolean => {
  // COMPAT: Some browsers do not fire a usable `insertFromComposition`
  // beforeinput. If the composed text reached the DOM but not the model,
  // commit it from compositionend and then remove unmanaged DOM text.
  const rootRuntime = findEditorDOMRootRuntime(editor);
  const suppressFallback =
    (rootElement
      ? isWebKitDOMHost(rootElement) ||
        hasDOMHostQuirk(rootElement, 'compositionend-precedes-final-input')
      : rootRuntime?.isWebKitHost ||
        rootRuntime?.hasHostQuirk('compositionend-precedes-final-input')) ??
    false;

  if (suppressFallback || !text) {
    return false;
  }

  const placeholderMarks = EDITOR_TO_PENDING_INSERTION_MARKS.get(editor);
  EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);
  const firstFailure: { error: unknown; hasError: boolean } = {
    error: undefined,
    hasError: false,
  };
  const captureFailure = (callback: () => void) => {
    try {
      callback();
    } catch (error) {
      if (!firstFailure.hasError) {
        firstFailure.error = error;
        firstFailure.hasError = true;
      }
    }
  };
  const finishCleanup = () => {
    captureFailure(() => {
      removeUnmanagedCompositionTextNodes({ editor, rootElement, text });
    });
    captureFailure(() => {
      clearEditableCompositionRuntimeState(editor);
    });
  };

  if (!shouldCommit || !target) {
    finishCleanup();
    if (firstFailure.hasError) throw firstFailure.error;

    return false;
  }

  const childrenBefore = editor.read((state) => state.children());

  captureFailure(() => {
    // Ensure we insert text with the marks the user was actually seeing.
    if (placeholderMarks !== undefined) {
      EDITOR_TO_USER_MARKS.set(
        editor,
        editor.read((state) => state.marks())
      );
      writeRuntimeMarks(editor, placeholderMarks);
    }

    const insertCompositionText: Parameters<typeof updateNativeTextInput>[1] = (
      tx
    ) => {
      if (
        target &&
        placeholderMarks &&
        Object.keys(placeholderMarks).length > 0
      ) {
        tx.nodes.insert(
          { text, ...placeholderMarks },
          { at: target, select: true }
        );
        return;
      }

      tx.text.insert(text, target ? { at: target } : undefined);
    };

    if (mergeHistory) {
      editor.update(
        { tags: ['composition', 'history-merge'] },
        insertCompositionText
      );
    } else {
      updateNativeTextInput(editor, insertCompositionText);
    }
  });
  finishCleanup();
  const committed = editor.read((state) => state.children()) !== childrenBefore;

  if (firstFailure.hasError) throw firstFailure.error;

  return committed;
};

const removeUnmanagedCompositionTextNodes = ({
  editor,
  rootElement,
  text,
}: {
  editor: Editor;
  rootElement?: HTMLElement | null;
  text: string;
}) => {
  if (!rootElement || text.length === 0) {
    return;
  }

  rootElement
    .querySelectorAll<HTMLElement>('[data-plite-node="text"]')
    .forEach((textElement) => {
      const textNodes: globalThis.Text[] = [];
      const path = textElement
        .getAttribute('data-plite-path')
        ?.split(',')
        .map((segment) => Number.parseInt(segment, 10));
      const modelText = path?.every(Number.isInteger)
        ? (() => {
            try {
              return NodeApi.leaf(editor, path).text;
            } catch {
              return null;
            }
          })()
        : null;
      const walker = textElement.ownerDocument.createTreeWalker(
        textElement,
        NodeFilter.SHOW_TEXT
      );

      for (
        let current = walker.nextNode();
        current;
        current = walker.nextNode()
      ) {
        const textNode = current as globalThis.Text;
        const textContent = textNode.textContent ?? '';
        const pliteString = textNode.parentElement?.closest(
          '[data-plite-string="true"]'
        );

        if (pliteString && modelText != null && textContent.includes(text)) {
          if (
            textContent !== modelText &&
            textContent.endsWith(text) &&
            textContent.slice(0, -text.length) === modelText
          ) {
            textNode.textContent = modelText;
            continue;
          }

          if (
            textContent !== modelText &&
            textContent.startsWith(text) &&
            textContent.slice(text.length) === modelText
          ) {
            textNode.textContent = modelText;
            continue;
          }
        }

        if (
          textContent === text &&
          (!pliteString || (modelText != null && textContent !== modelText))
        ) {
          textNodes.push(textNode);
        }
      }

      textNodes.forEach((textNode) => {
        textNode.remove();
      });
    });
};

export const applyEditableCompositionEnd = ({
  androidInputManagerRef,
  editor,
  event,
  inputController,
  onCompositionEnd,
  readOnly = false,
  requestModelSelectionExportAfterRender,
  runOwnedDOMMutation,
  scheduleTask,
  setComposing,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  editor: ReactRuntimeEditor;
  event: CompositionEvent<HTMLDivElement>;
  inputController: EditableInputController;
  onCompositionEnd?: EditableCompositionHandler;
  readOnly?: boolean;
  requestModelSelectionExportAfterRender: () => void;
  runOwnedDOMMutation: (callback: () => void) => void;
  scheduleTask: NonNullable<EditableInputController['scheduleTask']>;
  setComposing: EditableCompositionStateSetter;
}) => {
  const clearCompositionIntent = () => {
    if (inputController.state.activeIntent === 'composition') {
      inputController.state.activeIntent = null;
    }
  };

  if (isCompositionEventTargetInput({ event })) {
    clearCompositionIntent();
    return;
  }
  if (
    readOnly &&
    preventReadOnlyEditableComposition({
      editor,
      event,
      inputController,
      setComposing,
    })
  ) {
    clearCompositionIntent();
    return;
  }
  if (ReactEditor.hasSelectableTarget(editor, event.target)) {
    const wasComposing = ReactEditor.isComposing(editor);
    const runtimeOwnsComposing = inputController.state.isComposing;

    androidInputManagerRef.current?.handleCompositionEnd(event);

    const compositionEndIsExternallyOwned =
      isCompositionEventHandled({ event, handler: onCompositionEnd }) ||
      isAndroidDOMHost(event);
    const finishComposing = () => {
      try {
        if (runtimeOwnsComposing && ReactEditor.isComposing(editor)) {
          setComposing(false);
        }
      } finally {
        inputController.state.compositionSession = null;
        clearCompositionIntent();
      }
    };

    if (isAndroidDOMHost(event) || !wasComposing) {
      clearEditableCompositionRuntimeState(editor);
      inputController.state.compositionSession = null;
      clearCompositionIntent();
      return;
    }
    if (inputController.state.pendingCompositionEnd) {
      if (inputController.state.pendingCompositionEnd.ownership === 'settled') {
        clearCompositionIntent();
      }
      return;
    }

    if (compositionEndIsExternallyOwned) {
      schedulePendingCompositionEnd({
        commitFallback: () => false,
        discardFallback: () => {
          clearEditableCompositionRuntimeState(editor);
        },
        finishComposing,
        inputController,
        ownership: 'external',
        resolveFallbackTarget: () => null,
        runOwnedDOMMutation,
        scheduleTask,
        settledData: '',
      });
      return;
    }

    const rootElement = event.currentTarget;
    const compositionText =
      getCompositionEventText(event) ??
      inputController.state.compositionSession?.text;
    const mergeHistory = shouldMergeEditableCompositionHistory(inputController);
    const target = editor.read((state) => state.selection());
    const targetAnchor =
      target &&
      editor.anchor(target, {
        association: 'inward',
        deletion: 'nearest',
      });
    let targetReleased = false;
    const releaseTarget = () => {
      if (targetReleased) return null;

      targetReleased = true;
      return targetAnchor?.release() ?? null;
    };
    const commitCompositionEndFallback = (
      shouldCommit: boolean,
      liveTarget: Selection,
      { publish }: Readonly<{ publish: boolean }>
    ) => {
      if (shouldCommit && !liveTarget) return false;
      const childrenBefore = editor.read((state) => state.children());
      const failures = createCompositionFailureScope();
      const fallback = failures.attempt(() =>
        commitChromeCompositionEndFallback({
          editor,
          mergeHistory,
          rootElement,
          shouldCommit:
            shouldCommit &&
            wasComposing &&
            !inputController.state.compositionSession?.modelCommitted,
          target: liveTarget,
          text: compositionText,
        })
      );
      const childrenAfter = failures.attempt(() =>
        editor.read((state) => state.children())
      );

      if (childrenAfter.ok && childrenAfter.value !== childrenBefore) {
        failures.attempt(() => {
          markEditableCompositionModelCommitted(inputController);
        });
      }

      if (fallback.ok && fallback.value && publish) {
        failures.attempt(() => {
          setEditableModelSelectionPreference({
            inputController,
            preferModelSelection: true,
            reason: 'composition',
            selectionSource: 'model-owned',
          });
        });
        failures.attempt(() => {
          armModelOwnedTextInputGuard({ inputController });
        });
        failures.attempt(() => {
          inputController.state.selectionChangeOrigin = 'programmatic-export';
        });
        failures.attempt(requestModelSelectionExportAfterRender);
      }

      failures.throwIfAny();

      return fallback.ok && fallback.value;
    };

    schedulePendingCompositionEnd({
      commitFallback: commitCompositionEndFallback,
      discardFallback: () => {
        const failures = createCompositionFailureScope();

        failures.attempt(releaseTarget);
        failures.attempt(() => {
          clearEditableCompositionRuntimeState(editor);
        });
        failures.throwIfAny();
      },
      finishComposing,
      inputController,
      ownership: 'plite',
      resolveFallbackTarget: releaseTarget,
      runOwnedDOMMutation,
      scheduleTask,
      settledData: compositionText ?? '',
    });

    return;
  }

  clearCompositionIntent();
};

export const applyEditableCompositionStart = ({
  androidInputManagerRef,
  editor,
  event,
  inputController,
  onCompositionStart,
  readOnly = false,
  setComposing,
}: {
  androidInputManagerRef: RefObject<AndroidInputManager | null | undefined>;
  editor: ReactRuntimeEditor;
  event: CompositionEvent<HTMLDivElement>;
  inputController?: EditableInputController;
  onCompositionStart?: EditableCompositionHandler;
  readOnly?: boolean;
  setComposing: EditableCompositionStateSetter;
}) => {
  if (isCompositionEventTargetInput({ event })) {
    return;
  }
  if (
    readOnly &&
    preventReadOnlyEditableComposition({
      editor,
      event,
      inputController,
      setComposing,
    })
  ) {
    return;
  }
  if (ReactEditor.hasSelectableTarget(editor, event.target)) {
    const pendingCompositionEnd = inputController?.state.pendingCompositionEnd;

    if (pendingCompositionEnd?.ownership === 'plite') {
      pendingCompositionEnd.flush();
    } else {
      pendingCompositionEnd?.cancel();
    }
    inputController?.state.pendingCompositionEnd?.cancel();
    if (inputController) inputController.state.pendingCompositionEnd = null;
    clearEditableCompositionRuntimeState(editor);
    androidInputManagerRef.current?.handleCompositionStart(event);

    if (
      isCompositionEventHandled({ event, handler: onCompositionStart }) ||
      isAndroidDOMHost(event)
    ) {
      return;
    }

    const marks = editor.read((state) => state.marks());
    const selection = editor.read((state) => state.selection());

    if (inputController) {
      beginEditableCompositionSession(inputController, {
        historyMergePending: !!selection && RangeApi.isExpanded(selection),
      });
      inputController.state.activeIntent = 'composition';
    }

    setComposing(true);

    if (selection && RangeApi.isExpanded(selection)) {
      updateNativeTextInput(editor, (tx) => {
        tx.text.delete({ at: selection });
      });
    }

    if (marks && Object.keys(marks).length > 0) {
      EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, marks);
      writeRuntimeMarks(editor, marks);
    }
  }
};

export const applyEditableCompositionUpdate = ({
  editor,
  event,
  inputController,
  onCompositionUpdate,
  readOnly = false,
  setComposing,
}: {
  editor: ReactRuntimeEditor;
  event: CompositionEvent<HTMLDivElement>;
  inputController?: EditableInputController;
  onCompositionUpdate?: EditableCompositionHandler;
  readOnly?: boolean;
  setComposing: EditableCompositionStateSetter;
}) => {
  if (isCompositionEventTargetInput({ event })) {
    return;
  }
  if (
    readOnly &&
    preventReadOnlyEditableComposition({
      editor,
      event,
      inputController,
      setComposing,
    })
  ) {
    return;
  }

  if (ReactEditor.hasSelectableTarget(editor, event.target)) {
    const compositionUpdateIsExternallyOwned = isCompositionEventHandled({
      event,
      handler: onCompositionUpdate,
    });

    if (!compositionUpdateIsExternallyOwned) {
      if (inputController) {
        inputController.state.activeIntent = 'composition';
      }
      if (!ReactEditor.isComposing(editor)) {
        if (inputController) beginEditableCompositionSession(inputController);
        setComposing(true);
      }
    }
  }

  const compositionText = getCompositionEventText(event);
  if (compositionText && inputController) {
    recordEditableCompositionText(inputController, compositionText);
  }
};

export const usePendingInsertionMarksEffect = ({
  editor,
  marks,
}: {
  editor: Editor;
  marks: EditorMarks | null;
}) => {
  useEffect(() => {
    const domPhaseScheduler = getMountedEditableDOMRuntime(
      editor as ReactRuntimeEditor
    )?.domPhaseScheduler;

    return domPhaseScheduler?.schedule(
      'model',
      'pending-insertion-marks',
      () => {
        if (ReactEditor.isComposing(editor as ReactRuntimeEditor)) return;

        const selection = editor.read((state) => state.selection());
        if (selection) {
          const { anchor } = selection;
          const text = readRuntimeText(editor, anchor.path);

          // While marks isn't a 'complete' text, we can still use loose TextApi.equals
          // here which only compares marks anyway.
          if (
            text &&
            marks &&
            !TextApi.equals(text, marks as Text, { loose: true })
          ) {
            EDITOR_TO_PENDING_INSERTION_MARKS.set(editor, marks);
            return;
          }
        }

        EDITOR_TO_PENDING_INSERTION_MARKS.delete(editor);
      },
      { timing: 'timeout' }
    );
  });
};
