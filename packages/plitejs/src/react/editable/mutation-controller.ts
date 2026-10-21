import {
  type EditorMarks,
  type Point,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
  type TransactionSpec,
} from '../..';
import { getRootTransaction } from '../../core/plugin-dispatch';
import {
  getActiveEditorTransaction,
  withUpdateTagContext,
} from '../../core/public-state';
import { holdsCaretAt } from '../../core/view-carets';
import type { DOMPhaseScheduler } from '../../dom/internal';
import { domCommands } from '../../dom/internal';
import { getViewPresentation } from '../../editor-runtime-view';
import { getDefined } from '../../internal/get-defined';
import {
  ReactEditor,
  type ReactRuntimeEditor,
  toReactRuntimeEditor,
} from '../plugin/react-editor';
import { profilePliteReactDuration } from '../render-profiler';
import { rootPlitePoint } from '../view-boundary-graph';
import {
  createMainRootPliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  savePliteViewSelectionHistoryEntry,
  writePliteViewSelection,
} from '../view-selection';
import { applyContentRootSelectionMoveCommand } from './content-root-navigation';
import type { DOMRepairQueue } from './dom-repair-queue';
import {
  type EditableCommand,
  type EditableRepairPolicy,
  getEditableRepairPolicy,
} from './editing-kernel';
import { type NativeGroupingInput, nativeGroupingInput } from './input-history';
import {
  type EditableInputController,
  type EditableSelectionSourceTransition,
  getEditableNativeGroupingInput,
} from './input-state';
import { getLineBoundarySelection } from './line-boundary';
import {
  applyParagraphBreakAfterSelectedBlockVoid,
  createDefaultParagraph,
} from './mutation-block-editing';
import { canUseCachedCollapsedTextInsert } from './mutation-full-block-editing';
import { applyModelOwnedHistoryIntent } from './mutation-history';
import {
  type ProjectedSelectionTarget,
  resolveProjectedSelectionTarget,
} from './projected-selection-target';
import {
  applyTransactionSpec,
  dispatchCommand,
  evaluateCommandWithState,
  type Editor,
  editorCommands,
  insertText as editorInsertText,
  move as editorMove,
  failInvariant,
  getEditorRuntimeOwner,
  rebaseTransactionSpecWithoutChanges,
  type Editor as RuntimeEditor,
  toInternalRoot,
  withEditorUpdateRootScope,
} from './runtime-editor-api';
import {
  readRuntimeSelection,
  readRuntimeSelectionRange,
} from './runtime-selection-state';
import {
  armModelOwnedTextInputGuard,
  isEditableModelSelectionPreferred,
  setEditableModelSelectionPreference,
  shouldUseModelBackedSelectAllSelection,
} from './selection-controller';
import { shouldSkipSelectionFocus } from './selection-side-effect-policy';
import { withTypedTextIntent } from './typed-text';

export {
  applyModelOwnedHistoryIntent,
  applyModelOwnedNativeHistoryEvent,
  shouldForceRenderAfterModelOwnedHistory,
} from './mutation-history';

export const applyModelOwnedDeleteIntent = ({
  direction,
  editor,
  unit,
}: {
  direction: 'backward' | 'forward';
  editor: Editor;
  unit?: 'block' | 'line' | 'word';
}) => {
  dispatchCommand(editor, editorCommands.delete, {
    direction,
    unit: unit ?? 'character',
  });
};

export const applyModelOwnedExpandedDelete = ({
  direction,
  editor,
}: {
  direction: 'backward' | 'forward';
  editor: Editor;
}) => {
  dispatchCommand(editor, editorCommands.deleteFragment, {
    direction,
  });
};

export const applyModelOwnedLineBreak = ({
  editor,
  kind,
}: {
  editor: RuntimeEditor;
  kind: 'open-line' | 'paragraph' | 'soft';
}) => {
  if (kind === 'paragraph') {
    editor.update((tx) => {
      tx.command(editorCommands.insertBreak);
    });
    return;
  }
  if (kind === 'soft') {
    dispatchCommand(editor, editorCommands.insertSoftBreak);
    return;
  }

  if (
    applyParagraphBreakAfterSelectedBlockVoid(
      editor,
      readRuntimeSelectionRange(editor)
    )
  ) {
    return;
  }

  const selection = readRuntimeSelectionRange(editor);
  const blockEntry =
    selection && RangeApi.isCollapsed(selection)
      ? editor.read((state) =>
          state.nodes.block({
            at: selection.anchor,
          })
        )
      : undefined;

  if (!blockEntry) {
    editor.update((tx) => {
      tx.command(editorCommands.insertBreak);
    });
    return;
  }

  const [, blockPath] = blockEntry;
  const insertionPoint = { path: blockPath.concat(0), offset: 0 };

  editor.update((tx) => {
    tx.command(editorCommands.insertNodes, {
      nodes: createDefaultParagraph(),
      options: { at: blockPath },
    });
    tx.selection.set({
      anchor: insertionPoint,
      focus: insertionPoint,
    });
  });
};

const clonePoint = (point: Point): Point => ({
  offset: point.offset,
  path: [...point.path],
});

const projectedRootTransaction = (editor: RuntimeEditor, root: Point['root']) =>
  getRootTransaction(
    getEditorRuntimeOwner(editor),
    toInternalRoot(root),
    getViewPresentation(editor)
  );

const rootOfRange = (range: Range) => range.anchor.root ?? range.focus.root;

const deleteProjectedRanges = (
  ranges: readonly Range[],
  deleteRange: (range: Range) => void
) => {
  for (const range of [...ranges].reverse()) {
    if (!RangeApi.isCollapsed(range)) deleteRange(range);
  }
};

const applyInProjectedRoot = (
  editor: RuntimeEditor,
  root: Point['root'],
  evaluate: (
    tx: ReturnType<typeof projectedRootTransaction>
  ) => false | TransactionSpec | undefined
) => {
  const owner = getEditorRuntimeOwner(editor);

  return withEditorUpdateRootScope(owner, toInternalRoot(root), () => {
    const result = evaluate(projectedRootTransaction(editor, root));

    if (result) applyTransactionSpec(owner, result);

    return result;
  });
};

const deleteFragmentIn = (editor: RuntimeEditor) => (range: Range) => {
  projectedRootTransaction(editor, rootOfRange(range)).command(
    editorCommands.deleteFragment,
    { at: range, direction: 'forward' }
  );
};

const deleteProjectedRangesToStart = (
  editor: RuntimeEditor,
  target: ProjectedSelectionTarget,
  deleteRange: (range: Range) => void
) => {
  // A main-document start has no root, so the view's own root would claim it.
  const tx = projectedRootTransaction(editor, target.start.root);

  tx.selection.set({ anchor: target.start, focus: target.start });

  const firstDeleteOwnsCaret = !RangeApi.isCollapsed(target.ranges[0]);
  const startThroughDeletes = firstDeleteOwnsCaret
    ? null
    : tx.anchor(target.start, {
        association: 'backward',
        deletion: 'nearest',
      });

  deleteProjectedRanges(target.ranges, deleteRange);

  const caret = startThroughDeletes?.resolve();

  if (caret) tx.selection.set({ anchor: caret, focus: caret });
};

const applyProjectedViewSelectionTextCommand = ({
  editor,
  nativeInput,
  text,
}: {
  editor: RuntimeEditor;
  nativeInput?: NativeGroupingInput;
  text?: string;
}) => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return false;
  }

  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  if (resolution.kind === 'ambiguous') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;
  let applied = false;

  editor.update(() => {
    // The view wrapper would pin implicit commands to its mounted root.
    const tx = getDefined(getActiveEditorTransaction(editor));
    if (nativeInput) tx.annotations.set(nativeGroupingInput, nativeInput);
    deleteProjectedRangesToStart(editor, target, deleteFragmentIn(editor));

    if (text) {
      projectedRootTransaction(editor, target.start.root).command(
        editorCommands.insertText,
        { text }
      );
    }
    applied = true;
  });
  if (!applied) return true;
  savePliteViewSelectionHistoryEntry(editor, {
    redo: null,
    undo: viewSelection,
  });
  writePliteViewSelection(editor, null);

  return true;
};

const applyProjectedViewSelectionDataCommand = ({
  data,
  editor,
}: {
  data: DataTransfer;
  editor: RuntimeEditor;
}) => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return false;
  }

  const runtimeEditor = getEditorRuntimeOwner(editor);
  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  if (resolution.kind === 'ambiguous') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;

  const { combined, insertion, prefix } = editor.read((state) => {
    const deletion = state.transaction(() => {
      deleteProjectedRangesToStart(editor, target, (range) => {
        applyInProjectedRoot(
          editor,
          rootOfRange(range),
          (tx) =>
            evaluateCommandWithState(
              editor,
              editorCommands.deleteFragment,
              tx,
              {
                at: range,
                direction: 'forward',
              }
            ).result
        );
      });
    });
    const evaluation: { result?: false | TransactionSpec } = {};
    const pasted = state.transaction.extend(deletion, () => {
      evaluation.result = applyInProjectedRoot(
        editor,
        target.start.root,
        (tx) =>
          evaluateCommandWithState(editor, domCommands.insertData, tx, data)
            .result
      );
    });

    return { combined: pasted, insertion: evaluation.result, prefix: deletion };
  });
  if (!insertion) return true;

  if (insertion.changes.empty) {
    const rebased = editor.read(() =>
      rebaseTransactionSpecWithoutChanges(runtimeEditor, prefix, insertion)
    );

    return editor.update({ tags: 'paste' }, () => {
      applyTransactionSpec(runtimeEditor, rebased);

      return true;
    });
  }

  const landed = editor.update({ tags: 'paste' }, () => {
    applyTransactionSpec(runtimeEditor, combined);

    return true;
  });

  if (!landed) return landed;
  savePliteViewSelectionHistoryEntry(editor, {
    redo: null,
    undo: viewSelection,
  });
  writePliteViewSelection(editor, null);

  return true;
};

const applyProjectedViewSelectionLineBreakCommand = ({
  editor,
  kind,
}: {
  editor: RuntimeEditor;
  kind: 'open-line' | 'paragraph' | 'soft';
}) => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return false;
  }

  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  if (resolution.kind === 'ambiguous') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;
  let applied = false;

  editor.update(() => {
    const tx = getDefined(getActiveEditorTransaction(editor));
    deleteProjectedRanges(target.ranges, deleteFragmentIn(editor));

    tx.selection.set({
      anchor: target.start,
      focus: target.start,
    });
    applied = true;

    const routed = projectedRootTransaction(editor, target.start.root);

    if (kind !== 'open-line') {
      routed.command(
        kind === 'paragraph'
          ? editorCommands.insertBreak
          : editorCommands.insertSoftBreak
      );
      return;
    }

    const blockEntry = routed.nodes.block({
      at: target.start,
    });

    if (!blockEntry) {
      routed.command(editorCommands.insertBreak);
      return;
    }

    const [, blockPath] = blockEntry;
    const insertionPoint = { path: blockPath.concat(0), offset: 0 };

    routed.command(editorCommands.insertNodes, {
      nodes: createDefaultParagraph(),
      options: { at: blockPath },
    });
    routed.selection.set({
      anchor: insertionPoint,
      focus: insertionPoint,
    });
  });
  if (!applied) return true;
  savePliteViewSelectionHistoryEntry(editor, {
    redo: null,
    undo: viewSelection,
  });
  writePliteViewSelection(editor, null);

  return true;
};

const createRange = (anchor: Point, focus: Point): Range => ({
  anchor: clonePoint(anchor),
  focus: clonePoint(focus),
});

type SelectionMoveCommand = Extract<
  EditableCommand,
  { kind: 'move-selection' }
>;

const getSelectionMoveUnit = (
  command: SelectionMoveCommand
): 'line' | 'word' | undefined =>
  command.axis === 'line' || command.axis === 'word' ? command.axis : undefined;

const applyRootLocalSelectionMoveCommand = ({
  command,
  editor,
}: {
  command: SelectionMoveCommand;
  editor: RuntimeEditor;
}) => {
  const selection = readRuntimeSelection(editor);
  if (SelectionApi.isNode(selection)) {
    const path = command.reverse ? selection.paths[0] : selection.paths.at(-1);
    const point = path
      ? editor.read((state) =>
          command.reverse ? state.points.end(path) : state.points.start(path)
        )
      : null;

    if (!point) return false;

    dispatchCommand(editor, editorCommands.select, {
      target: createRange(point, point),
    });
    if (!command.extend && command.axis !== 'document') return true;

    return applyRootLocalSelectionMoveCommand({ command, editor });
  }

  if (!selection) {
    return false;
  }

  writePliteViewSelection(editor, null);

  if (command.axis === 'document') {
    const point = editor.read((state) =>
      command.reverse ? state.points.start([]) : state.points.end([])
    );

    if (!point) {
      failInvariant('Expected a document edge point for selection move');
    }

    dispatchCommand(editor, editorCommands.select, {
      target: command.extend
        ? createRange(selection.anchor, point)
        : createRange(point, point),
    });
    return true;
  }

  if (command.axis === 'line-boundary') {
    dispatchCommand(editor, editorCommands.select, {
      target: getLineBoundarySelection(editor, selection, {
        extend: Boolean(command.extend),
        reverse: Boolean(command.reverse),
      }),
    });
    return true;
  }

  if (command.extend) {
    editorMove(editor, {
      edge: 'focus',
      reverse: command.reverse,
      unit: getSelectionMoveUnit(command),
    });
    return true;
  }

  if (RangeApi.isCollapsed(selection)) {
    editorMove(editor, {
      reverse: command.reverse,
      unit: getSelectionMoveUnit(command),
    });
    return true;
  }

  dispatchCommand(editor, editorCommands.collapse, {
    options: { edge: command.reverse ? 'start' : 'end' },
  });

  return true;
};

export const applyEditableCommand = ({
  command,
  editor,
}: {
  command: EditableCommand;
  editor: RuntimeEditor;
}) => {
  switch (command.kind) {
    case 'delete': {
      if (applyProjectedViewSelectionTextCommand({ editor })) {
        return true;
      }

      applyModelOwnedDeleteIntent({
        direction: command.direction,
        editor,
        unit: command.unit,
      });
      return true;
    }

    case 'delete-both': {
      if (applyProjectedViewSelectionTextCommand({ editor })) {
        return true;
      }

      applyModelOwnedDeleteIntent({
        direction: 'backward',
        editor,
        unit: command.unit,
      });
      applyModelOwnedDeleteIntent({
        direction: 'forward',
        editor,
        unit: command.unit,
      });
      return true;
    }

    case 'delete-fragment': {
      if (applyProjectedViewSelectionTextCommand({ editor })) {
        return true;
      }

      {
        const selection = command.selection ?? readRuntimeSelection(editor);

        if (
          selection &&
          RangeApi.isRange(selection) &&
          RangeApi.isCollapsed(selection)
        ) {
          return true;
        }

        if (SelectionApi.isNode(selection)) {
          editor.update((tx) => {
            tx.selection.set(selection);
            tx.command(editorCommands.deleteFragment, {
              direction: command.direction ?? 'forward',
            });
          });
          return true;
        }

        dispatchCommand(editor, editorCommands.deleteFragment, {
          ...(selection &&
          RangeApi.isRange(selection) &&
          RangeApi.isExpanded(selection)
            ? { at: selection }
            : {}),
          direction: command.direction ?? 'forward',
        });
        return true;
      }
    }

    case 'history': {
      return applyModelOwnedHistoryIntent({
        direction: command.direction,
        editor: toReactRuntimeEditor(editor),
      });
    }

    case 'insert-break': {
      if (
        applyProjectedViewSelectionLineBreakCommand({
          editor,
          kind: command.variant,
        })
      ) {
        return true;
      }

      applyModelOwnedLineBreak({
        editor,
        kind: command.variant,
      });
      return true;
    }

    case 'insert-data': {
      const projected = applyProjectedViewSelectionDataCommand({
        data: command.data,
        editor,
      });

      if (projected !== false) return projected;

      const selection = readRuntimeSelection(editor);

      return editor.update((tx) => {
        if (SelectionApi.isNode(selection)) {
          tx.selection.set(selection);
        }

        return toReactRuntimeEditor(editor).api.dom.clipboard.insertData(
          command.data
        );
      });
    }

    case 'insert-text': {
      if (
        applyProjectedViewSelectionTextCommand({
          editor,
          text: command.text,
        })
      ) {
        return true;
      }

      editorInsertText(editor, command.text);
      return true;
    }

    case 'transpose-character': {
      return dispatchCommand(editor, editorCommands.transposeCharacter);
    }

    case 'select':
    case 'select-all': {
      const root = toInternalRoot(editor.read((state) => state.view.root()));
      const selectAllPoints =
        command.kind === 'select-all'
          ? editor.read((state) => [
              state.points.start([]),
              state.points.end([]),
            ])
          : null;
      const nextSelection =
        command.kind === 'select'
          ? command.selection
          : selectAllPoints?.[0] && selectAllPoints[1]
            ? {
                anchor: rootPlitePoint(selectAllPoints[0], root),
                focus: rootPlitePoint(selectAllPoints[1], root),
              }
            : null;

      if (!nextSelection) return true;

      dispatchCommand(editor, editorCommands.select, {
        target: nextSelection,
      });
      const appliedSelection = readRuntimeSelection(editor);
      writePliteViewSelection(
        editor,
        command.kind === 'select-all' &&
          appliedSelection &&
          RangeApi.isRange(appliedSelection) &&
          shouldUseModelBackedSelectAllSelection({
            editor: editor as ReactRuntimeEditor,
            selection: appliedSelection,
          })
          ? createMainRootPliteViewSelection(
              appliedSelection,
              toInternalRoot(editor.read((state) => state.view.root()))
            )
          : null
      );
      return true;
    }

    case 'move-selection': {
      if (
        applyContentRootSelectionMoveCommand({
          command,
          editor: editor as ReactRuntimeEditor,
          selection: readRuntimeSelectionRange(editor),
        }).handled
      ) {
        return true;
      }

      return applyRootLocalSelectionMoveCommand({ command, editor });
    }
  }

  return undefined;
};

export const applyModelOwnedDataTransferInput = ({
  data,
  editor,
}: {
  data: DataTransfer;
  editor: ReactRuntimeEditor;
}) =>
  applyEditableCommand({
    command: { data, kind: 'insert-data' },
    editor,
  });

export type EditableRepairRequest =
  | {
      focus?: boolean;
      forceRender?: boolean;
      kind: 'force-render';
      selectionSourceTransition?: EditableSelectionSourceTransition;
    }
  | {
      focus?: boolean;
      forceRender?: boolean;
      kind: 'sync-selection';
      selectionSourceTransition?: EditableSelectionSourceTransition;
      syncDOMSelection?: boolean;
    }
  | {
      focus?: boolean;
      forceRender?: boolean;
      kind: 'repair-caret' | 'repair-caret-after-text-insert';
      selectionSourceTransition?: EditableSelectionSourceTransition;
    }
  | { kind: 'none' | 'skip-dom-sync' };

export const executeEditableRepairPolicy = ({
  repair,
  repairPolicy,
}: {
  repair: () => void;
  repairPolicy: EditableRepairPolicy;
}) => {
  if (repairPolicy.kind === 'none') {
    return false;
  }

  repair();
  return true;
};

export const focusEditableRepairTarget = (editor: ReactRuntimeEditor) => {
  try {
    const viewSelection = readPliteViewSelection(editor);

    if (viewSelection && !isPliteViewSelectionCollapsed(viewSelection)) {
      const editorElement = ReactEditor.editable(editor);

      if (!editorElement) return false;
      editorElement.focus({ preventScroll: true });
      return true;
    }

    ReactEditor.focus(editor);
    return true;
  } catch {
    return false;
  }
};

export const applyModelOwnedTextInput = ({
  data,
  editor,
  inputController,
  inputType,
  marks,
  mergeHistory = false,
  selection,
}: {
  data: string;
  editor: Editor;
  inputController?: EditableInputController;
  inputType: string;
  marks?: EditorMarks | null;
  mergeHistory?: boolean;
  selection?: Range | Selection;
}): EditableRepairRequest =>
  withTypedTextIntent(editor, inputController, { inputType, text: data }, () =>
    withUpdateTagContext(
      getEditorRuntimeOwner(editor),
      ['dom-text-input'],
      () => {
        const nativeInput = inputController
          ? getEditableNativeGroupingInput(inputController, mergeHistory)
          : undefined;

        if (SelectionApi.isNode(selection)) {
          editor.update(mergeHistory ? { tags: ['composition'] } : {}, (tx) => {
            if (nativeInput) {
              tx.annotations.set(nativeGroupingInput, nativeInput);
            }
            tx.selection.set(selection);
            tx.command(editorCommands.insertText, { text: data });
          });

          return inputType === 'insertText'
            ? {
                forceRender: ReactEditor.isComposing(
                  editor as ReactRuntimeEditor
                ),
                kind: 'repair-caret-after-text-insert',
                selectionSourceTransition: {
                  preferModelSelection: true,
                  reason: 'model-command',
                  selectionSource: 'model-owned',
                },
              }
            : { kind: 'none' };
        }

        const insertAtSelection = (target: Range) => {
          if (
            nativeInput ||
            marks !== undefined ||
            RangeApi.isCollapsed(target)
          ) {
            // Writing the caret the view already holds would count as a
            // placement on every keystroke.
            const held = holdsCaretAt(editor, target);

            editor.update(
              mergeHistory ? { tags: ['composition'] } : {},
              (tx) => {
                if (nativeInput) {
                  tx.annotations.set(nativeGroupingInput, nativeInput);
                }
                const collapsed = RangeApi.isCollapsed(target);
                if (collapsed) {
                  if (!held) tx.selection.set(target);
                  if (marks !== undefined) tx.marks.set(marks);
                  // A composition writes where the browser composed it. The
                  // insert-text command would move it where a typed letter
                  // goes, after struck text. An Android commit still runs
                  // the command so insert handlers see the finished word.
                  if (
                    inputType === 'insertFromComposition' &&
                    !inputController?.state.isReplayingAndroidCommand
                  ) {
                    tx.text.insert(
                      data,
                      marks !== undefined ? {} : { at: target }
                    );
                    return;
                  }
                }
                tx.command(editorCommands.insertText, {
                  ...(collapsed && marks !== undefined
                    ? {}
                    : { options: { at: target } }),
                  text: data,
                });
              }
            );
            return;
          }

          dispatchCommand(editor, editorCommands.insertText, {
            options: { at: target },
            text: data,
          });
        };
        const hasExplicitTargetSelection =
          !!selection &&
          (RangeApi.isExpanded(selection) || inputType !== 'insertText');

        if (
          !hasExplicitTargetSelection &&
          applyProjectedViewSelectionTextCommand({
            editor,
            nativeInput,
            text: data,
          })
        ) {
          if (inputType === 'insertText') {
            return {
              forceRender: ReactEditor.isComposing(
                editor as ReactRuntimeEditor
              ),
              kind: 'repair-caret-after-text-insert',
              selectionSourceTransition: {
                preferModelSelection: true,
                reason: 'model-command',
                selectionSource: 'model-owned',
              },
            };
          }

          return { kind: 'none' };
        }

        const canUseSyncedCollapsedTarget =
          inputType === 'insertText' &&
          selection &&
          RangeApi.isCollapsed(selection) &&
          canUseCachedCollapsedTextInsert({ editor, selection });

        if (canUseSyncedCollapsedTarget) {
          profilePliteReactDuration(
            'model-text-input-insert-at-selection',
            () => insertAtSelection(selection)
          );
        } else if (
          selection &&
          (RangeApi.isExpanded(selection) || inputType !== 'insertText')
        ) {
          writePliteViewSelection(editor, null);
          profilePliteReactDuration(
            'model-text-input-insert-at-target-selection',
            () => insertAtSelection(selection)
          );
        } else {
          profilePliteReactDuration('model-text-input-apply-command', () => {
            if (!nativeInput) {
              applyEditableCommand({
                command: { inputType, kind: 'insert-text', text: data },
                editor,
              });
              return;
            }

            editor.update(
              mergeHistory ? { tags: ['composition'] } : {},
              (tx) => {
                tx.annotations.set(nativeGroupingInput, nativeInput);
                tx.command(editorCommands.insertText, { text: data });
              }
            );
          });
        }

        if (inputType === 'insertText') {
          return {
            forceRender: ReactEditor.isComposing(editor as ReactRuntimeEditor),
            kind: 'repair-caret-after-text-insert',
            selectionSourceTransition: {
              preferModelSelection: true,
              reason: 'model-command',
              selectionSource: 'model-owned',
            },
          };
        }

        return { kind: 'none' };
      }
    )
  );

export const applyEditableRepairRequest = ({
  domPhaseScheduler,
  domRepairQueue,
  editor,
  focusEditor,
  forceRender,
  inputController,
  request,
  requestFocusAfterRender,
  syncDOMSelectionToEditor,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  domRepairQueue: DOMRepairQueue;
  editor: ReactRuntimeEditor;
  focusEditor?: ReactRuntimeEditor;
  forceRender: () => void;
  inputController: EditableInputController;
  request: EditableRepairRequest;
  requestFocusAfterRender?: (editor: ReactRuntimeEditor) => void;
  syncDOMSelectionToEditor: () => void;
}) => {
  if (request.kind === 'none' || request.kind === 'skip-dom-sync') {
    return;
  }

  const repairPolicy = getEditableRepairPolicy({ repair: request });

  executeEditableRepairPolicy({
    repair: () => {
      if (
        'selectionSourceTransition' in request &&
        request.selectionSourceTransition
      ) {
        const { selectionSourceTransition } = request;

        profilePliteReactDuration('repair.selection-source-transition', () => {
          setEditableModelSelectionPreference({
            inputController,
            preferModelSelection:
              selectionSourceTransition.preferModelSelection,
            reason:
              selectionSourceTransition.reason === 'native-selection-move'
                ? 'native-selection'
                : selectionSourceTransition.reason === 'unknown-selection'
                  ? 'unknown'
                  : selectionSourceTransition.reason,
            selectionSource: selectionSourceTransition.selectionSource,
          });
        });
        if (
          selectionSourceTransition.preferModelSelection &&
          selectionSourceTransition.reason === 'model-command'
        ) {
          profilePliteReactDuration('repair.model-owned-text-guard', () => {
            armModelOwnedTextInputGuard({ inputController });
          });
        }
      }

      const focusTarget =
        focusEditor ??
        ('focus' in request &&
        request.focus &&
        !shouldSkipSelectionFocus(editor)
          ? editor
          : undefined);

      if (focusTarget) {
        profilePliteReactDuration('repair.focus-editor', () => {
          focusEditableRepairTarget(focusTarget);
        });
      }

      if ('forceRender' in request && request.forceRender) {
        if (focusTarget) {
          requestFocusAfterRender?.(focusTarget);
        }

        profilePliteReactDuration('repair.force-render', forceRender);

        if (focusTarget && !requestFocusAfterRender) {
          domPhaseScheduler.schedule(
            'dom-write',
            'focus-editor-after-render',
            () => {
              profilePliteReactDuration(
                'repair.focus-editor-after-render',
                () => {
                  focusEditableRepairTarget(focusTarget);
                }
              );
            },
            {
              key: 'focus-editor-after-render',
              timing: 'animation-frame',
            }
          );
        }
      }

      if (request.kind === 'sync-selection') {
        const markProgrammaticSelectionUpdate = () => {
          inputController.state.isUpdatingSelection = true;
          inputController.state.selectionChangeOrigin = 'programmatic-export';
        };

        if (request.syncDOMSelection === false) {
          markProgrammaticSelectionUpdate();
          const clearProgrammaticSelectionUpdate = () => {
            if (
              inputController.state.selectionChangeOrigin ===
              'programmatic-export'
            ) {
              inputController.state.isUpdatingSelection = false;
            }
          };

          domPhaseScheduler.schedule(
            'selection-repair',
            'clear-programmatic-selection-update',
            clearProgrammaticSelectionUpdate,
            { delay: 160, timing: 'timeout' }
          );
          return;
        }

        const syncProgrammaticDOMSelection = () => {
          if (!isEditableModelSelectionPreferred(inputController)) {
            return;
          }

          markProgrammaticSelectionUpdate();
          syncDOMSelectionToEditor();
        };

        const focusedAtCommand = ReactEditor.isFocused(editor);
        syncProgrammaticDOMSelection();
        const resyncUnlessBlurred = () => {
          // Chromium focuses an editable that gets a DOM selection, so a rerun
          // after the editor blurred would pull focus back into it.
          if (focusedAtCommand && !ReactEditor.isFocused(editor)) return;

          syncProgrammaticDOMSelection();
        };
        const clearProgrammaticSelectionUpdate = () => {
          if (
            inputController.state.selectionChangeOrigin ===
            'programmatic-export'
          ) {
            inputController.state.isUpdatingSelection = false;
          }
        };

        domPhaseScheduler.schedule(
          'selection-repair',
          'sync-programmatic-selection-microtask',
          resyncUnlessBlurred,
          { timing: 'microtask' }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'sync-programmatic-selection-timeout',
          resyncUnlessBlurred,
          { timing: 'timeout' }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'sync-programmatic-selection-settle',
          resyncUnlessBlurred,
          { delay: 80, timing: 'timeout' }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'clear-programmatic-selection-update',
          clearProgrammaticSelectionUpdate,
          { delay: 160, timing: 'timeout' }
        );
        return;
      }

      if (request.kind === 'repair-caret') {
        profilePliteReactDuration('repair.dom-repair-queue', () => {
          domRepairQueue.repair(repairPolicy);
        });
        return;
      }

      if (request.kind === 'repair-caret-after-text-insert') {
        profilePliteReactDuration('repair.dom-repair-queue', () => {
          domRepairQueue.repair(repairPolicy);
        });
      }
    },
    repairPolicy,
  });
};
