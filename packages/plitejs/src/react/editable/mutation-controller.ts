import {
  type EditorMarks,
  type EditorUpdateTransaction,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
  type TransactionSpec,
  type Value,
} from '../..';
import { withAuthoredUpdateView } from '../../core/authored-runtime';
import { withCompositionStamp } from '../../core/composition-stamp';
import { dispatchPaste, landPaste } from '../../core/moved-anchors';
import {
  type NativeGroupingInput,
  nativeGroupingInput,
} from '../../core/native-grouping-input';
import { getRootTransaction } from '../../core/plugin-dispatch';
import {
  asSelectionMotion,
  getActiveEditorTransaction,
  syncImplicitTargetToCurrentSelection,
  withUpdateTagContext,
} from '../../core/public-state';
import {
  capturePlacement,
  getPlacementGeneration,
  holdsCaretAt,
} from '../../core/view-carets';
import type { DOMPhaseScheduler } from '../../dom/internal';
import { domCommands } from '../../dom/internal';
import { readClipboardCut } from '../../dom/utils/dom';
import type { DOMSelectionPoints } from '../../dom/utils/selection-writes';
import { getViewPresentation } from '../../editor-runtime-view';
import { getDefined } from '../../internal/get-defined';
import { dividesTextCell } from '../../transforms-node/split-nodes';
import {
  projectedHistoryRange,
  watchProjectedHistoryRanges,
} from '../history-step-views';
import { focusSelectionTarget } from '../hooks/focus-plite-editable';
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
  writePliteViewSelection,
} from '../view-selection';
import { applyContentRootSelectionMoveCommand } from './content-root-navigation';
import type { DOMRepairQueue } from './dom-repair-queue';
import { getMountedEditableDOMRuntimes } from './editable-dom-runtime';
import {
  type EditableCommand,
  type EditableRepairPolicy,
  getEditableRepairPolicy,
} from './editing-kernel';
import {
  beginEditableSelectionUpdate,
  commitUnderCompositionReceipt,
  type EditableInputController,
  type EditableSelectionSourceTransition,
  endEditableSelectionUpdate,
  getDeferredSelectionWriteStatus,
  getEditableNativeGroupingInput,
} from './input-state';
import {
  getLineBoundarySelection,
  getRenderedLineStart,
} from './line-boundary';
import {
  applyParagraphBreakAfterSelectedBlockVoid,
  createDefaultParagraph,
} from './mutation-block-editing';
import {
  readUserTextLanding,
  type UserTextLanding,
} from './mutation-full-block-editing';
import { applyModelOwnedHistoryIntent } from './mutation-history';
import {
  type ProjectedSelectionTarget,
  resolveProjectedSelectionTarget,
} from './projected-selection-target';
import {
  applyTransactionSpec,
  continueTransactionSpecOrDiscardPrefix,
  dispatchCommand,
  evaluateCommandWithState,
  type Editor,
  editorCommands,
  insertText as editorInsertText,
  move as editorMove,
  failInvariant,
  getEditorRuntimeOwner,
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
  type EditableDOMSelectionSyncOptions,
  isEditableModelSelectionPreferred,
  setEditableModelSelectionPreference,
  shouldUseModelBackedSelectAllSelection,
} from './selection-controller';
import { shouldSkipSelectionFocus } from './selection-side-effect-policy';
import { withTypedTextIntent } from './typed-text';
import { claimPageSelection } from './unread-press';

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

const applyRenderedLineDeleteBackward = (editor: RuntimeEditor) => {
  const selection = readRuntimeSelectionRange(editor);

  if (!selection || RangeApi.isExpanded(selection)) {
    applyModelOwnedDeleteIntent({
      direction: 'backward',
      editor,
      unit: 'line',
    });
    return;
  }

  const start = getRenderedLineStart(editor, selection.focus);

  if (PointApi.equals(start, selection.focus)) {
    applyModelOwnedDeleteIntent({ direction: 'backward', editor });
    return;
  }

  dispatchCommand(editor, editorCommands.deleteFragment, {
    at: { anchor: start, focus: selection.focus },
    direction: 'backward',
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

  if (!selection || !blockEntry) {
    editor.update((tx) => {
      tx.command(editorCommands.insertBreak);
    });
    return;
  }

  const [, blockPath] = blockEntry;
  const insertionPoint = { path: blockPath.concat(0), offset: 0 };

  editor.update((tx) => {
    if (dividesTextCell(editor, selection.anchor)) return;

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

const readExpandedProjectedViewSelection = (editor: RuntimeEditor) => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection) return null;
  if (isPliteViewSelectionCollapsed(viewSelection)) {
    writePliteViewSelection(editor, null);
    return null;
  }

  return viewSelection;
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
  const viewSelection = readExpandedProjectedViewSelection(editor);

  if (!viewSelection) {
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

  watchProjectedHistoryRanges(editor);
  editor.update(() => {
    // The view wrapper would pin implicit commands to its mounted root.
    const tx = getDefined(getActiveEditorTransaction(editor));
    tx.annotations.set(projectedHistoryRange, viewSelection);
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
  const viewSelection = readExpandedProjectedViewSelection(editor);

  if (!viewSelection) {
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

  // The paste's commands evaluate outside an update, so they bind the view
  // as an update does, and read its author, intent and draft setting.
  let replaced = false;
  const pasted = withAuthoredUpdateView(editor, editor, () =>
    editor.read((state) => {
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

      replaced = !deletion.changes.empty;

      return continueTransactionSpecOrDiscardPrefix(
        runtimeEditor,
        deletion,
        () => {
          const evaluation: { result?: false | TransactionSpec } = {};
          const insertion = state.transaction(() => {
            evaluation.result = applyInProjectedRoot(
              editor,
              target.start.root,
              (tx) =>
                evaluateCommandWithState(
                  editor,
                  domCommands.insertData,
                  tx,
                  data
                ).result
            );
          });

          return evaluation.result ? insertion : false;
        }
      );
    })
  );
  if (!pasted) return true;

  watchProjectedHistoryRanges(editor);
  const landed = editor.update(
    { tags: replaced ? ['paste', 'replace-range'] : 'paste' },
    () => {
      getDefined(getActiveEditorTransaction(editor)).annotations.set(
        projectedHistoryRange,
        viewSelection
      );
      landPaste(editor, () => applyTransactionSpec(runtimeEditor, pasted));

      return true;
    }
  );

  if (!landed || pasted.changes.empty) return landed;
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
  const viewSelection = readExpandedProjectedViewSelection(editor);

  if (!viewSelection) {
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

  watchProjectedHistoryRanges(editor);
  editor.update(() => {
    if (
      kind !== 'soft' &&
      dividesTextCell(
        getEditorRuntimeOwner(editor),
        target.ranges[0] ?? target.start
      )
    ) {
      return;
    }

    const tx = getDefined(getActiveEditorTransaction(editor));
    tx.annotations.set(projectedHistoryRange, viewSelection);
    deleteProjectedRanges(target.ranges, deleteFragmentIn(editor));

    const routed = projectedRootTransaction(editor, target.start.root);

    routed.selection.set({
      anchor: target.start,
      focus: target.start,
    });
    applied = true;

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
  element = null,
}: {
  command: EditableCommand;
  editor: RuntimeEditor;
  element?: HTMLElement | null;
}) => {
  switch (command.kind) {
    case 'delete': {
      if (applyProjectedViewSelectionTextCommand({ editor })) {
        return true;
      }

      if (command.direction === 'backward' && command.unit === 'line') {
        applyRenderedLineDeleteBackward(editor);
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

        const expanded =
          selection &&
          RangeApi.isRange(selection) &&
          RangeApi.isExpanded(selection)
            ? selection
            : null;

        dispatchCommand(editor, editorCommands.deleteFragment, {
          ...(expanded ? { at: expanded } : {}),
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
      return dispatchPaste(
        editor,
        () => readClipboardCut(command.data),
        () => {
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
      );
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

      const placedAt = capturePlacement(editor, () => {
        dispatchCommand(editor, editorCommands.select, {
          target: nextSelection,
        });
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
          : null,
        { placedAt }
      );
      return true;
    }

    case 'move-selection': {
      return asSelectionMotion(
        editor,
        () =>
          applyContentRootSelectionMoveCommand({
            command,
            editor: editor as ReactRuntimeEditor,
            element,
            selection: readRuntimeSelectionRange(editor),
          }).handled || applyRootLocalSelectionMoveCommand({ command, editor })
      );
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

export type EditableRepairOptions<TEditor> = Readonly<{
  focusEditor?: TEditor;
  replacing?: DOMSelectionPoints;
}>;

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
    const editorElement = ReactEditor.editable(editor);

    if (editorElement && focusSelectionTarget(editor, editorElement)) {
      return true;
    }

    const viewSelection = readPliteViewSelection(editor);

    if (
      !editorElement &&
      viewSelection &&
      !isPliteViewSelectionCollapsed(viewSelection)
    ) {
      return false;
    }

    ReactEditor.focus(editor);
    return true;
  } catch {
    return false;
  }
};

export type UserText = Readonly<{
  composed: boolean;
  landing: UserTextLanding;
  marks?: EditorMarks | null;
  target: Range;
  text: string;
}>;

export const getUserTextLanding = (
  editor: Editor,
  {
    composed,
    inputType,
    marks,
    replayed,
    target,
  }: Readonly<{
    composed: boolean;
    inputType: string;
    marks?: EditorMarks | null;
    replayed: boolean;
    target: Range;
  }>
): UserTextLanding => {
  if (
    RangeApi.isExpanded(target) ||
    (inputType !== 'insertText' && inputType !== 'insertFromComposition')
  ) {
    return 'pinned';
  }

  return replayed
    ? 'selection'
    : readUserTextLanding({ composed, editor, marks, target });
};

export const dispatchUserText = (
  editor: Editor,
  tx: EditorUpdateTransaction<Value, any>,
  { composed, landing, marks, target, text }: UserText
) => {
  if (RangeApi.isCollapsed(target)) {
    const held = holdsCaretAt(editor, target);
    const current = readRuntimeSelection(editor);
    const pending =
      marks !== undefined
        ? marks
        : !held && SelectionApi.isText(current)
          ? current.marks
          : undefined;

    if (!held) {
      tx.selection.set(target);
    } else {
      syncImplicitTargetToCurrentSelection(getEditorRuntimeOwner(editor));
    }
    if (pending !== undefined) tx.marks.set(pending);
  }

  const at =
    landing === 'stored'
      ? RangeApi.start(target)
      : landing === 'pinned'
        ? target
        : undefined;
  const insert = () =>
    tx.command(editorCommands.insertText, {
      ...(at ? { options: { at } } : {}),
      text,
    });

  if (composed) {
    withCompositionStamp(editor, { place: RangeApi.start(target) }, insert);
  } else {
    insert();
  }
};

export const applyModelOwnedTextInput = ({
  commitsComposition,
  data,
  editor,
  inputController,
  inputType,
  marks,
  mergeHistory = false,
  selection,
}: {
  commitsComposition?: boolean;
  data: string;
  editor: Editor;
  inputController?: EditableInputController;
  inputType: string;
  marks?: EditorMarks | null;
  mergeHistory?: boolean;
  selection?: Range | Selection;
}): EditableRepairRequest => {
  const composition =
    commitsComposition ?? inputType === 'insertFromComposition';
  const applyInput = (): EditableRepairRequest =>
    withTypedTextIntent(
      editor,
      inputController,
      { inputType, text: data },
      () =>
        withUpdateTagContext(
          getEditorRuntimeOwner(editor),
          ['dom-text-input'],
          () => {
            const nativeInput = inputController
              ? getEditableNativeGroupingInput(inputController, mergeHistory)
              : undefined;
            if (SelectionApi.isNode(selection)) {
              editor.update(
                mergeHistory ? { tags: ['composition'] } : {},
                (tx) => {
                  if (nativeInput) {
                    tx.annotations.set(nativeGroupingInput, nativeInput);
                  }
                  tx.selection.set(selection);
                  tx.command(editorCommands.insertText, { text: data });
                }
              );

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

            const landingOf = (target: Range) =>
              getUserTextLanding(editor, {
                composed: composition,
                inputType,
                marks,
                replayed:
                  inputType === 'insertFromComposition' &&
                  !!inputController?.state.isReplayingAndroidCommand,
                target,
              });
            const dispatch = (target: Range, landing: UserTextLanding) => {
              editor.update(
                mergeHistory ? { tags: ['composition'] } : {},
                (tx) => {
                  if (nativeInput) {
                    tx.annotations.set(nativeGroupingInput, nativeInput);
                  }
                  dispatchUserText(editor, tx, {
                    composed: composition,
                    landing,
                    marks,
                    target,
                    text: data,
                  });
                }
              );
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

            if (hasExplicitTargetSelection) {
              writePliteViewSelection(editor, null);
              const landing = landingOf(selection);

              profilePliteReactDuration(
                'model-text-input-insert-at-target-selection',
                () => dispatch(selection, landing)
              );
            } else if (selection) {
              const landing = landingOf(selection);

              profilePliteReactDuration(
                landing === 'selection'
                  ? 'model-text-input-apply-command'
                  : 'model-text-input-insert-at-selection',
                () => dispatch(selection, landing)
              );
            } else {
              profilePliteReactDuration(
                'model-text-input-apply-command',
                () => {
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
                }
              );
            }

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
        )
    );

  return composition
    ? commitUnderCompositionReceipt(inputController, applyInput)
    : applyInput();
};

const SYNC_SELECTION_REPAIR_ID = new WeakMap<object, number>();

export const applyEditableRepairRequest = ({
  domPhaseScheduler,
  domRepairQueue,
  editor,
  focusEditor,
  forceRender,
  inputController,
  replacing,
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
  replacing?: DOMSelectionPoints;
  request: EditableRepairRequest;
  requestFocusAfterRender?: (editor: ReactRuntimeEditor) => void;
  syncDOMSelectionToEditor: (options?: EditableDOMSelectionSyncOptions) => void;
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
        const repairId =
          (SYNC_SELECTION_REPAIR_ID.get(inputController.state) ?? 0) + 1;
        SYNC_SELECTION_REPAIR_ID.set(inputController.state, repairId);
        const isCurrentRepair = () =>
          SYNC_SELECTION_REPAIR_ID.get(inputController.state) === repairId;
        let selectionUpdateVersion: number | undefined;
        const markProgrammaticSelectionUpdate = () => {
          selectionUpdateVersion = beginEditableSelectionUpdate(
            inputController.state
          );
        };

        if (request.syncDOMSelection === false) {
          markProgrammaticSelectionUpdate();
          const version = selectionUpdateVersion;
          const clearProgrammaticSelectionUpdate = () => {
            if (!isCurrentRepair() || version === undefined) return;
            endEditableSelectionUpdate(inputController.state, version);
          };

          domPhaseScheduler.schedule(
            'selection-repair',
            'clear-programmatic-selection-update',
            clearProgrammaticSelectionUpdate,
            {
              delay: 160,
              key: 'clear-programmatic-selection-update',
              timing: 'timeout',
            }
          );
          return;
        }

        const syncProgrammaticDOMSelection = () => {
          if (!isCurrentRepair()) return;
          if (!isEditableModelSelectionPreferred(inputController)) {
            return;
          }
          if (!claimPageSelection()) return;

          const versionBefore =
            inputController.state.updatingSelectionVersion ?? 0;

          syncDOMSelectionToEditor({ clearDelayMs: 160 });

          if (
            (inputController.state.updatingSelectionVersion ?? 0) !==
              versionBefore &&
            inputController.state.isUpdatingSelection &&
            inputController.state.activeUpdatingSelectionToken != null
          ) {
            selectionUpdateVersion =
              inputController.state.activeUpdatingSelectionToken;
            return;
          }

          if (
            selectionUpdateVersion === undefined ||
            inputController.state.activeUpdatingSelectionToken !==
              selectionUpdateVersion
          ) {
            markProgrammaticSelectionUpdate();
          }
        };

        const focusedAtCommand = ReactEditor.isFocused(editor);
        const receipt = getPlacementGeneration(editor);
        syncProgrammaticDOMSelection();
        const resyncUnlessBlurred = () => {
          if (!isCurrentRepair()) return;
          // Chromium focuses an editable that gets a DOM selection, so a rerun
          // after the editor blurred would pull focus back into it.
          if (focusedAtCommand && !ReactEditor.isFocused(editor)) return;
          const editorElement = getMountedEditableDOMRuntimes(editor).find(
            (candidate) => candidate.inputController === inputController
          )?.rootElement;

          if (!editorElement) return;
          if (
            getDeferredSelectionWriteStatus({
              editable: editorElement,
              editor,
              inputController,
              receipt,
            }) !== 'ready'
          ) {
            return;
          }

          syncProgrammaticDOMSelection();
        };
        const clearProgrammaticSelectionUpdate = () => {
          if (!isCurrentRepair() || selectionUpdateVersion === undefined) {
            return;
          }
          endEditableSelectionUpdate(
            inputController.state,
            selectionUpdateVersion
          );
        };

        domPhaseScheduler.schedule(
          'selection-repair',
          'sync-programmatic-selection-microtask',
          resyncUnlessBlurred,
          {
            key: 'sync-programmatic-selection-microtask',
            timing: 'microtask',
          }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'sync-programmatic-selection-timeout',
          resyncUnlessBlurred,
          { key: 'sync-programmatic-selection-timeout', timing: 'timeout' }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'sync-programmatic-selection-settle',
          resyncUnlessBlurred,
          {
            delay: 80,
            key: 'sync-programmatic-selection-settle',
            timing: 'timeout',
          }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'clear-programmatic-selection-update',
          clearProgrammaticSelectionUpdate,
          {
            delay: 160,
            key: 'clear-programmatic-selection-update',
            timing: 'timeout',
          }
        );
        return;
      }

      if (request.kind === 'repair-caret') {
        profilePliteReactDuration('repair.dom-repair-queue', () => {
          domRepairQueue.repair(repairPolicy, { replacing });
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
