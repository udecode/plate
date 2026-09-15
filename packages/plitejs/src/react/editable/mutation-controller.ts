import {
  type EditorCommandDescriptor,
  type EditorCommandInput,
  type EditorUpdateTransaction,
  type EditorUpdateTag,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
  type TransactionSpec,
} from '../..';
import {
  readAuthoredViewFragmentVersion,
  updateAuthoredFragment,
} from '../../core/authored-runtime';
import {
  getActiveEditorTransaction,
  withUpdateTagContext,
} from '../../core/public-state';
import type { DOMPhaseScheduler } from '../../dom/internal';
import { domCommands } from '../../dom/internal';
import { getMountedDOMFragmentEditors } from '../../dom/plugin/dom-fragment-view';
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
  createPliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  savePliteViewSelectionHistoryEntry,
  writePliteViewSelection,
} from '../view-selection';
import { applyContentRootSelectionMoveCommand } from './content-root-navigation';
import {
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
  getContentRootViewBoundaryPoint,
} from './content-root-owners';
import type { DOMRepairQueue } from './dom-repair-queue';
import {
  type EditableCommand,
  type EditableRepairPolicy,
  getEditableRepairPolicy,
} from './editing-kernel';
import type {
  EditableInputController,
  EditableSelectionSourceTransition,
} from './input-state';
import {
  applyParagraphBreakAfterSelectedBlockVoid,
  createDefaultParagraph,
} from './mutation-block-editing';
import { canUseCachedCollapsedTextInsert } from './mutation-full-block-editing';
import { applyModelOwnedHistoryIntent } from './mutation-history';
import { withProjectedMutationRoot } from './mutation-root-scope';
import { resolveProjectedSelectionTarget } from './projected-selection-target';
import {
  applyTransactionSpec,
  dispatchCommand,
  evaluateCommandWithState,
  type Editor,
  after as editorAfter,
  before as editorBefore,
  editorCommands,
  insertText as editorInsertText,
  move as editorMove,
  string as editorString,
  failInvariant,
  getEditorRuntimeOwner,
  getEditorStateView,
  rebaseTransactionSpecWithoutChanges,
  type Editor as RuntimeEditor,
  toInternalRoot,
} from './runtime-editor-api';
import { writeRuntimeSelection } from './runtime-mutation-state';
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

export {
  applyModelOwnedHistoryIntent,
  applyModelOwnedNativeHistoryEvent,
  consumeModelOwnedHistoryFocusRoot,
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
    dispatchCommand(editor, editorCommands.insertBreak);
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
    dispatchCommand(editor, editorCommands.insertBreak);
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

const advancePointByText = (point: Point, text: string): Point => ({
  ...(point.root ? { root: point.root } : {}),
  offset: point.offset + text.length,
  path: [...point.path],
});

const deleteProjectedRanges = (
  editor: RuntimeEditor,
  tx: Pick<EditorUpdateTransaction, 'command'>,
  ranges: readonly Range[]
) => {
  for (const range of [...ranges].reverse()) {
    if (RangeApi.isCollapsed(range)) continue;

    withProjectedMutationRoot(
      editor,
      range.anchor.root ?? range.focus.root,
      () => {
        tx.command(editorCommands.deleteFragment, {
          at: range,
          direction: 'forward',
        });
      }
    );
  }
};

const applyProjectedViewSelectionTextCommand = ({
  editor,
  text,
}: {
  editor: RuntimeEditor;
  text?: string;
}) => {
  const viewSelection = readPliteViewSelection(editor);

  if (!viewSelection || isPliteViewSelectionCollapsed(viewSelection)) {
    return false;
  }

  const runtimeEditor = getEditorRuntimeOwner(editor);

  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  if (resolution.kind === 'ambiguous' || resolution.kind === 'retained') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;

  editor.update(() => {
    // The view wrapper would pin implicit commands to its mounted root.
    const tx = getDefined(getActiveEditorTransaction(editor));
    deleteProjectedRanges(runtimeEditor, tx, target.ranges);

    if (text) {
      tx.command(editorCommands.insertText, {
        options: { at: target.start },
        text,
      });
    }

    const selectionPoint = text
      ? advancePointByText(target.start, text)
      : target.start;

    tx.selection.set({
      anchor: selectionPoint,
      focus: selectionPoint,
    });
  });
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

  if (resolution.kind === 'ambiguous' || resolution.kind === 'retained') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;
  const { combined, insertion, prefix } = editor.read((state) => {
    let deletion = state.transaction((tx) => {
      tx.selection.set({ anchor: target.start, focus: target.start });
    });
    for (const range of [...target.ranges].reverse()) {
      if (RangeApi.isCollapsed(range)) continue;

      deletion = state.transaction.extend(deletion, () => {
        withProjectedMutationRoot(
          runtimeEditor,
          range.anchor.root ?? range.focus.root,
          () => {
            const { result } = evaluateCommandWithState(
              editor,
              editorCommands.deleteFragment,
              getEditorStateView(runtimeEditor),
              { at: range, direction: 'forward' }
            );
            if (result) applyTransactionSpec(runtimeEditor, result);
          }
        );
      });
    }
    const evaluation: { result?: false | TransactionSpec } = {};
    const pasted = state.transaction.extend(deletion, () => {
      withProjectedMutationRoot(runtimeEditor, target.start.root, () => {
        evaluation.result = evaluateCommandWithState(
          editor,
          domCommands.insertData,
          getEditorStateView(runtimeEditor),
          data
        ).result;

        if (evaluation.result) {
          applyTransactionSpec(runtimeEditor, evaluation.result);
        }
      });
    });

    return { combined: pasted, insertion: evaluation.result, prefix: deletion };
  });
  if (!insertion) return true;

  if (insertion.changes.empty) {
    const rebased = editor.read(() =>
      rebaseTransactionSpecWithoutChanges(runtimeEditor, prefix, insertion)
    );

    editor.update({ tags: 'paste' }, () => {
      applyTransactionSpec(runtimeEditor, rebased);
    });

    return true;
  }

  editor.update({ tags: 'paste' }, () => {
    applyTransactionSpec(runtimeEditor, combined);
  });
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

  const runtimeEditor = getEditorRuntimeOwner(editor);
  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  if (resolution.kind === 'ambiguous' || resolution.kind === 'retained') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;

  editor.update(() => {
    const tx = getDefined(getActiveEditorTransaction(editor));
    deleteProjectedRanges(runtimeEditor, tx, target.ranges);

    tx.selection.set({
      anchor: target.start,
      focus: target.start,
    });

    withProjectedMutationRoot(runtimeEditor, target.start.root, () => {
      if (kind !== 'open-line') {
        if (kind === 'paragraph') {
          tx.command(editorCommands.insertBreak);
          return;
        }

        tx.command(editorCommands.insertSoftBreak);
        return;
      }

      const blockEntry = tx.nodes.block({
        at: target.start,
      });

      if (!blockEntry) {
        tx.command(editorCommands.insertBreak);
        return;
      }

      const [, blockPath] = blockEntry;
      const insertionPoint = { path: blockPath.concat(0), offset: 0 };

      tx.command(editorCommands.insertNodes, {
        nodes: createDefaultParagraph(),
        options: { at: blockPath },
      });
      tx.selection.set({
        anchor: insertionPoint,
        focus: insertionPoint,
      });
    });
  });
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

export const applyModelOwnedTransposeCharacterIntent = ({
  editor,
  selection,
}: {
  editor: RuntimeEditor;
  selection: Range | null;
}) => {
  if (!selection || !RangeApi.isCollapsed(selection)) {
    return false;
  }

  const cursor = selection.anchor;
  const before = editorBefore(editor, cursor, { unit: 'character' });

  if (!before) {
    return false;
  }

  let start = before;
  let middle = cursor;
  let end = editorAfter(editor, cursor, { unit: 'character' });

  if (!end) {
    const secondBefore = editorBefore(editor, before, { unit: 'character' });

    if (!secondBefore) {
      return false;
    }

    start = secondBefore;
    middle = before;
    end = cursor;
  }

  if (
    !PathApi.equals(start.path, middle.path) ||
    !PathApi.equals(middle.path, end.path)
  ) {
    return false;
  }

  const left = editorString(editor, createRange(start, middle));
  const right = editorString(editor, createRange(middle, end));

  if (!left || !right) {
    return false;
  }

  const swapped = `${right}${left}`;
  const nextSelection = {
    anchor: {
      offset: start.offset + swapped.length,
      path: [...start.path],
    },
    focus: {
      offset: start.offset + swapped.length,
      path: [...start.path],
    },
  };

  editor.update((tx) => {
    tx.command(editorCommands.insertText, {
      options: { at: createRange(start, end) },
      text: swapped,
    });
    tx.selection.set(nextSelection);
  });

  return true;
};

const applyRetainedViewSelectionCommand = (
  editor: RuntimeEditor,
  command: EditableCommand,
  tags?: readonly EditorUpdateTag[]
) => {
  const previous = readPliteViewSelection(editor);
  if (!previous?.segments.parts.some((part) => part.fragment)) return false;
  const { fragmentId } = previous.anchor;
  if (
    !fragmentId ||
    previous.focus.fragmentId !== fragmentId ||
    editor.read.view.isReadOnly()
  ) {
    return true;
  }
  const fragmentEditor = [
    ...getMountedDOMFragmentEditors(toReactRuntimeEditor(editor), fragmentId),
  ][0];
  if (!fragmentEditor) return true;
  const result = updateAuthoredFragment(
    fragmentEditor,
    (tx) => {
      tx.selection.set({
        anchor: previous.anchor.point,
        focus: previous.focus.point,
      });
      const owner = getEditorRuntimeOwner(fragmentEditor);
      const run = <TCommand extends EditorCommandDescriptor>(
        descriptor: TCommand,
        ...input: [EditorCommandInput<TCommand>] extends [void]
          ? [] | [input: EditorCommandInput<TCommand>]
          : [input: EditorCommandInput<TCommand>]
      ) => {
        const spec = evaluateCommandWithState(
          fragmentEditor,
          descriptor,
          getEditorStateView(owner),
          ...input
        ).result;
        if (spec) applyTransactionSpec(owner, spec);
      };
      switch (command.kind) {
        case 'insert-text': {
          run(editorCommands.insertText, { text: command.text });
          break;
        }
        case 'delete': {
          run(editorCommands.delete, {
            direction: command.direction,
            unit: command.unit ?? 'character',
          });
          break;
        }
        case 'delete-both': {
          run(editorCommands.delete, {
            direction: 'backward',
            unit: command.unit ?? 'character',
          });
          run(editorCommands.delete, {
            direction: 'forward',
            unit: command.unit ?? 'character',
          });
          break;
        }
        case 'delete-fragment': {
          run(editorCommands.deleteFragment, {
            direction: command.direction ?? 'forward',
          });
          break;
        }
        case 'insert-break': {
          if (command.variant === 'open-line') {
            const selection = tx.selection();
            const block =
              selection &&
              RangeApi.isRange(selection) &&
              RangeApi.isCollapsed(selection)
                ? tx.nodes.block({ at: selection.anchor })
                : undefined;
            if (block) {
              run(editorCommands.insertNodes, {
                nodes: createDefaultParagraph(),
                options: { at: block[1] },
              });
              const start = { path: block[1].concat(0), offset: 0 };
              tx.selection.set({ anchor: start, focus: start });
              break;
            }
          }
          run(
            command.variant === 'soft'
              ? editorCommands.insertSoftBreak
              : editorCommands.insertBreak
          );
          break;
        }
        case 'insert-data': {
          run(domCommands.insertData, command.data);
          break;
        }
        default: {
          break;
        }
      }
    },
    { tags }
  );
  if (result && RangeApi.isRange(result.selection)) {
    const next = createPliteViewSelection(
      createContentRootViewBoundaryGraph(editor, findContentRootOwners(editor)),
      {
        anchor: {
          ...previous.anchor,
          fragmentId: result.fragmentId,
          point: result.selection.anchor,
        },
        focus: {
          ...previous.focus,
          fragmentId: result.fragmentId,
          point: result.selection.focus,
        },
      }
    );
    if (result.changed) {
      savePliteViewSelectionHistoryEntry(editor, {
        undo: previous,
        redo: next,
      });
    }
    writePliteViewSelection(editor, next);
  }
  return true;
};

export const applyEditableCommand = ({
  command,
  editor,
}: {
  command: EditableCommand;
  editor: RuntimeEditor;
}) => {
  if (
    command.kind !== 'history' &&
    command.kind !== 'move-selection' &&
    command.kind !== 'select' &&
    command.kind !== 'select-all' &&
    applyRetainedViewSelectionCommand(editor, command)
  ) {
    return true;
  }
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
        editor,
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
      if (
        applyProjectedViewSelectionDataCommand({
          data: command.data,
          editor,
        })
      ) {
        return true;
      }

      return toReactRuntimeEditor(editor).api.dom.clipboard.insertData(
        command.data
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
      return applyModelOwnedTransposeCharacterIntent({
        editor,
        selection: readRuntimeSelectionRange(editor),
      });
    }

    case 'select':
    case 'select-all': {
      if (
        command.kind === 'select-all' &&
        readAuthoredViewFragmentVersion(editor)
      ) {
        const graph = createContentRootViewBoundaryGraph(
          editor,
          findContentRootOwners(editor)
        );
        const first = graph.nodes[0];
        const last = graph.nodes.at(-1);
        const anchor =
          first && getContentRootViewBoundaryPoint(editor, first, 'start');
        const focus =
          last && getContentRootViewBoundaryPoint(editor, last, 'end');
        if (anchor && focus) {
          writeRuntimeSelection(editor, null);
          writePliteViewSelection(
            editor,
            createPliteViewSelection(graph, { anchor, focus })
          );
          return true;
        }
      }
      const root = toInternalRoot(editor.read((state) => state.view.root()));
      const nextSelection =
        command.kind === 'select'
          ? command.selection
          : {
              anchor: rootPlitePoint(
                editor.read((state) => state.points.start([])) ??
                  failInvariant(
                    'Expected a document start point for select all'
                  ),
                root
              ),
              focus: rootPlitePoint(
                editor.read((state) => state.points.end([])) ??
                  failInvariant('Expected a document end point for select all'),
                root
              ),
            };

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
      ReactEditor.assertDOMNode(editor, editor).focus({ preventScroll: true });
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
  inputType,
  mergeHistory = false,
  selection,
}: {
  data: string;
  editor: Editor;
  inputType: string;
  mergeHistory?: boolean;
  selection?: Range | Selection;
}): EditableRepairRequest =>
  withUpdateTagContext(
    getEditorRuntimeOwner(editor),
    ['dom-text-input'],
    () => {
      if (
        applyRetainedViewSelectionCommand(
          editor,
          { kind: 'insert-text', text: data },
          mergeHistory ? ['composition', 'history-merge'] : undefined
        )
      ) {
        return { kind: 'sync-selection', syncDOMSelection: true };
      }
      if (SelectionApi.isNode(selection)) {
        editor.update(
          mergeHistory ? { tags: ['composition', 'history-merge'] } : {},
          (tx) => {
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

      const insertAtSelection = (target: Range) => {
        if (mergeHistory) {
          editor.update({ tags: ['composition', 'history-merge'] }, (tx) => {
            tx.command(editorCommands.insertText, {
              options: { at: target },
              text: data,
            });
          });
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
        applyProjectedViewSelectionTextCommand({ editor, text: data })
      ) {
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

      const canUseSyncedCollapsedTarget =
        inputType === 'insertText' &&
        selection &&
        RangeApi.isCollapsed(selection) &&
        canUseCachedCollapsedTextInsert({ editor, selection });

      if (canUseSyncedCollapsedTarget) {
        profilePliteReactDuration('model-text-input-insert-at-selection', () =>
          insertAtSelection(selection)
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
        profilePliteReactDuration('model-text-input-apply-command', () =>
          applyEditableCommand({
            command: { inputType, kind: 'insert-text', text: data },
            editor,
          })
        );
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

          const selection = readRuntimeSelection(editor);

          if (selection) {
            writeRuntimeSelection(editor, selection);
          }

          markProgrammaticSelectionUpdate();
          syncDOMSelectionToEditor();
        };

        syncProgrammaticDOMSelection();
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
          syncProgrammaticDOMSelection,
          { timing: 'microtask' }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'sync-programmatic-selection-timeout',
          syncProgrammaticDOMSelection,
          { timing: 'timeout' }
        );
        domPhaseScheduler.schedule(
          'selection-repair',
          'sync-programmatic-selection-settle',
          syncProgrammaticDOMSelection,
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
