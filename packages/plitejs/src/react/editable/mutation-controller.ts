import {
  type EditorCommandDescriptor,
  type EditorCommandInput,
  type EditorUpdateTransaction,
  type EditorUpdateTag,
  PathApi,
  NodeApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
  type TransactionSpec,
} from '../..';
import {
  readAuthoredTarget,
  readAuthoredView,
  type NativeAuthoredFragment,
  readAuthoredViewFragmentVersion,
  updateAuthoredViews,
  withAuthoredViewRead,
  readAuthoredViewFragments,
} from '../../core/authored-runtime';
import { getEditorSchema } from '../../core/editor-runtime';
import {
  getActiveEditorTransaction,
  getCurrentMarks,
  withUpdateTagContext,
} from '../../core/public-state';
import type { DOMPhaseScheduler } from '../../dom/internal';
import { domCommands } from '../../dom/internal';
import { getDefined } from '../../internal/get-defined';
import {
  ReactEditor,
  type ReactRuntimeEditor,
  toReactRuntimeEditor,
} from '../plugin/react-editor';
import { profilePliteReactDuration } from '../render-profiler';
import { readRootChildren } from '../root-key';
import {
  rootPlitePoint,
  resolvePliteViewBoundarySegmentEndpoint,
  hasAmbiguousPliteViewBoundarySegments,
  PliteViewBoundaryGraph,
} from '../view-boundary-graph';
import {
  createMainRootPliteViewSelection,
  createPliteViewSelection,
  collapsePliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  savePliteViewSelectionHistoryEntry,
  type PliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  applyContentRootSelectionMoveCommand,
  resolveMarkupSelectionMovement,
} from './content-root-navigation';
import {
  caretMayTouchRetained,
  createContentRootViewBoundaryGraph,
  findContentRootOwners,
  getContentRootViewBoundaryPoint,
  createCaretBlockGraph,
  readRetainedFragmentIdsAt,
} from './content-root-owners';
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
import { writeMarkupSelection, writeModelCaret } from './markup-selection';
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
import {
  caretTouchesRetained,
  retainedCaretBoundary,
  retainedCaretEdge,
} from './selection-projected-dom';
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
  let applied = false;

  editor.update(() => {
    // The view wrapper would pin implicit commands to its mounted root.
    const tx = getDefined(getActiveEditorTransaction(editor));
    const mutationTarget = target;
    if (nativeInput) tx.annotations.set(nativeGroupingInput, nativeInput);
    deleteProjectedRanges(runtimeEditor, tx, mutationTarget.ranges);

    if (text) {
      tx.command(editorCommands.insertText, {
        options: { at: mutationTarget.start },
        text,
      });
    }

    const selectionPoint = text
      ? advancePointByText(mutationTarget.start, text)
      : mutationTarget.start;

    tx.selection.set({
      anchor: selectionPoint,
      focus: selectionPoint,
    });
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
  let applied = false;

  editor.update(() => {
    const tx = getDefined(getActiveEditorTransaction(editor));
    const mutationTarget = target;
    deleteProjectedRanges(runtimeEditor, tx, mutationTarget.ranges);

    tx.selection.set({
      anchor: mutationTarget.start,
      focus: mutationTarget.start,
    });
    applied = true;

    withProjectedMutationRoot(runtimeEditor, mutationTarget.start.root, () => {
      if (kind !== 'open-line') {
        if (kind === 'paragraph') {
          tx.command(editorCommands.insertBreak);
          return;
        }

        tx.command(editorCommands.insertSoftBreak);
        return;
      }

      const blockEntry = tx.nodes.block({
        at: mutationTarget.start,
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

const retainedSelectionGroups = (
  editor: RuntimeEditor,
  previous: PliteViewSelection
) => {
  const groups: Array<{
    fragment: NativeAuthoredFragment | null;
    ranges: Range[];
    start: Point;
    fragmentId: string | null;
    root: string;
    owner: PliteViewSelection['anchor']['owner'];
  }> = [];
  for (const segment of previous.segments.parts) {
    let fragment: NativeAuthoredFragment | null = null;
    const fragmentId = segment.fragment?.id ?? null;
    if (segment.fragment) {
      fragment =
        readAuthoredViewFragments(editor, segment.fragment.changeId).find(
          (item) => item.id === fragmentId
        ) ?? null;
      if (!fragment || fragment.kind !== 'delete') return null;
    }
    const roots = readAuthoredTarget(editor, fragment, (state) => ({
      [segment.root]: readRootChildren(state, segment.root),
    }));
    if (!roots) return null;
    const anchor = resolvePliteViewBoundarySegmentEndpoint(
      roots,
      segment,
      segment.start
    );
    const focus = resolvePliteViewBoundarySegmentEndpoint(
      roots,
      segment,
      segment.end
    );
    if (!anchor || !focus) return null;
    const previousGroup = groups.find(
      (group) => group.fragmentId === fragmentId && group.root === segment.root
    );
    if (previousGroup) {
      const lastRange = previousGroup.ranges.at(-1);
      if (lastRange && PointApi.equals(lastRange.focus, anchor)) {
        previousGroup.ranges[previousGroup.ranges.length - 1] = {
          anchor: lastRange.anchor,
          focus,
        };
      } else {
        previousGroup.ranges.push({ anchor, focus });
      }
    } else {
      groups.push({
        fragment,
        ranges: [{ anchor, focus }],
        start: anchor,
        fragmentId,
        root: segment.root,
        owner: segment.owner ?? undefined,
      });
    }
  }
  return groups;
};

export const applyRetainedViewSelectionMarkCommand = (
  editor: RuntimeEditor,
  command: EditorCommandDescriptor,
  input: unknown
): boolean | undefined => {
  if (
    command !== editorCommands.addMark &&
    command !== editorCommands.removeMark &&
    command !== editorCommands.toggleMark
  ) {
    return undefined;
  }
  const previous = readPliteViewSelection(editor);
  if (!previous?.segments.parts.some((part) => part.fragment)) return undefined;
  if (
    !input ||
    typeof input !== 'object' ||
    !('key' in input) ||
    typeof input.key !== 'string'
  ) {
    return undefined;
  }
  if (
    editor.read.view.isReadOnly() ||
    hasAmbiguousPliteViewBoundarySegments(previous.segments)
  ) {
    return false;
  }
  const groups = retainedSelectionGroups(editor, previous);
  if (!groups) return false;
  const { key } = input;
  const value = 'value' in input ? input.value : true;
  const pendingMarks = withAuthoredViewRead(editor, editor, () =>
    getCurrentMarks(editor)
  );
  let toggleActive: boolean | undefined;
  if (command === editorCommands.toggleMark) {
    toggleActive = groups.every((group) =>
      group.ranges.every((range) =>
        readAuthoredTarget(editor, group.fragment, (state) => {
          if (RangeApi.isCollapsed(range) && pendingMarks !== null) {
            return getEditorSchema(editor).isTextPropertyEqualAt(
              key,
              pendingMarks[key],
              value,
              range.anchor.path,
              range.anchor.root ?? 'main'
            );
          }
          const entries = state.nodes.toArray({
            at: range,
            match: NodeApi.isText,
            voids: true,
          });
          return (
            entries.length > 0 &&
            entries.every(([node, path]) =>
              getEditorSchema(editor).isTextPropertyEqualAt(
                key,
                node[key],
                value,
                path,
                range.anchor.root ?? 'main'
              )
            )
          );
        })
      )
    );
  }
  let applied = false;
  const results = updateAuthoredViews(
    editor,
    groups.map((group) => ({
      target: group.fragment,
      update: (tx) => {
        for (const range of [...group.ranges].reverse()) {
          tx.selection.set(range);
          if (RangeApi.isCollapsed(range) && pendingMarks !== null) {
            tx.marks.set(pendingMarks);
          }
          const owner = getEditorRuntimeOwner(editor);
          const state = getEditorStateView(owner);
          const evaluation = evaluateCommandWithState(
            editor,
            command,
            state,
            input
          );
          const result =
            toggleActive !== undefined && evaluation.nativeEquivalent
              ? state.transaction((draft) => {
                  if (toggleActive) draft.marks.remove(key);
                  else draft.marks.add(key, value);
                  const collapse = (
                    input as EditorCommandInput<
                      typeof editorCommands.toggleMark
                    >
                  ).options?.collapse;
                  if (collapse) {
                    draft.selection.collapse(
                      collapse === true ? undefined : collapse
                    );
                  }
                })
              : evaluation.result;
          if (result) {
            applied = true;
            applyTransactionSpec(owner, result);
          }
        }
      },
    }))
  );
  const collapse = (
    input as EditorCommandInput<typeof editorCommands.toggleMark>
  ).options?.collapse;
  const mapped = readPliteViewSelection(editor);
  if (results && applied && collapse && mapped) {
    const point = collapsePliteViewSelection(
      mapped,
      collapse === true ? 'anchor' : (collapse.edge ?? 'anchor')
    );
    const next = createPliteViewSelection(
      createContentRootViewBoundaryGraph(editor, findContentRootOwners(editor)),
      { anchor: point, focus: point }
    );
    savePliteViewSelectionHistoryEntry(editor, { undo: previous, redo: next });
    writePliteViewSelection(editor, next);
  }
  return results !== null && applied;
};

export const applyMarkupInput = (
  editor: RuntimeEditor,
  command: EditableCommand,
  tags?: readonly EditorUpdateTag[],
  nativeInput?: NativeGroupingInput,
  selectionBefore = readPliteViewSelection(editor),
  caretBefore: PliteViewSelection | null = selectionBefore
): boolean => {
  let previous = selectionBefore;
  let undoSelection = caretBefore;
  let deleteSide: 'backward' | 'forward' | undefined;
  let strike: { side: 'backward' | 'forward'; slots: string } | undefined;
  if (command.kind === 'transpose-character' && !previous) {
    const selection = readRuntimeSelectionRange(editor);
    if (
      selection &&
      RangeApi.isCollapsed(selection) &&
      caretMayTouchRetained(editor, selection.anchor)
    ) {
      const graph = createContentRootViewBoundaryGraph(
        editor,
        findContentRootOwners(editor)
      );
      // Swapping the characters around struck text would move live text
      // across a pending deletion, so the key does nothing there.
      if (caretTouchesRetained(graph, selection.anchor)) return true;
    }
  }
  if (
    command.kind === 'delete' &&
    command.unit !== 'block' &&
    readAuthoredViewFragmentVersion(editor)
  ) {
    const selection = readRuntimeSelectionRange(editor);
    if (
      previous
        ? isPliteViewSelectionCollapsed(previous)
        : selection &&
          RangeApi.isCollapsed(selection) &&
          caretMayTouchRetained(editor, selection.anchor)
    ) {
      const owners = findContentRootOwners(editor);
      const graph =
        createCaretBlockGraph(editor, owners, {
          collapsed: previous ? isPliteViewSelectionCollapsed(previous) : true,
          direction: command.direction,
          fragment: previous?.segments.parts[0]?.fragment,
          point: previous ? previous.anchor.point : selection?.anchor,
        }) ?? createContentRootViewBoundaryGraph(editor, owners);
      let touching = true;
      if (!previous && selection) {
        // Beside struck text the model affinity names the caret's side and
        // the caret stays there; elsewhere the caret belongs to the text the
        // key deletes and ends on the side that text occupied.
        const model = readRuntimeSelection(editor);
        touching = caretTouchesRetained(graph, selection.anchor);
        const side =
          SelectionApi.isText(model) && touching ? model.affinity : undefined;
        deleteSide =
          side ?? (command.direction === 'backward' ? 'forward' : 'backward');
        if (!side && readAuthoredView(editor)?.intent === 'propose') {
          strike = {
            side: command.direction,
            slots: readRetainedFragmentIdsAt(editor, selection.anchor),
          };
        }
        const caret = {
          affinity: side ?? command.direction,
          point: selection.anchor,
        } as const;
        previous = createPliteViewSelection(graph, {
          anchor: caret,
          focus: caret,
        });
        undoSelection ??= previous;
      }
      const deletesLiveTextOnly = !touching && !command.unit;
      const moved = deletesLiveTextOnly
        ? null
        : resolveMarkupSelectionMovement({
            action: {
              kind: 'move',
              axis:
                command.unit === 'word'
                  ? 'word'
                  : command.unit === 'line'
                    ? 'line'
                    : 'horizontal',
              direction: command.direction,
            },
            boundaryAffinity: command.direction,
            editor: toReactRuntimeEditor(editor),
            extend: true,
            graph,
            owners,
            selection,
            viewSelection: previous,
          });
      if (moved) {
        const range = createPliteViewSelection(graph, {
          anchor: moved.initial.focus,
          focus: moved.target,
        });
        const caretNode = PliteViewBoundaryGraph.resolvePointNode(
          graph,
          moved.initial.focus
        );
        const neighbour =
          caretNode &&
          (command.direction === 'backward'
            ? PliteViewBoundaryGraph.previousNode(graph, caretNode)
            : PliteViewBoundaryGraph.nextNode(graph, caretNode));
        // Across a block boundary the key deletes that boundary, so the
        // ordinary delete handles it.
        const neighbourInCaretBlock =
          !!caretNode?.blockKey && neighbour?.blockKey === caretNode.blockKey;
        // Joining across a whole retained block would rewrite the block that
        // its pending deletion still owns, so Editing leaves it in place.
        if (
          !neighbourInCaretBlock &&
          neighbour?.fragment &&
          readAuthoredView(editor)?.intent !== 'propose'
        ) {
          return true;
        }
        if (
          neighbourInCaretBlock &&
          range.segments.parts.some((part) => part.fragment)
        ) {
          if (readAuthoredView(editor)?.intent === 'propose') {
            // Struck text is already deleted, so a Suggesting delete steps
            // the caret over it without changing content.
            const target = moved.target.fragmentId
              ? (retainedCaretBoundary(graph, moved.target) ?? moved.target)
              : moved.target;
            writeMarkupSelection(
              editor,
              createPliteViewSelection(graph, { anchor: target, focus: target })
            );
            return true;
          }
          previous = range;
        }
      }
    }
  }
  if (!previous || readAuthoredView(editor)?.projection !== 'markup') {
    return false;
  }
  if (
    command.kind === 'transpose-character' &&
    previous.segments.parts.some((part) => part.fragment)
  ) {
    return true;
  }
  if (
    editor.read.view.isReadOnly() ||
    hasAmbiguousPliteViewBoundarySegments(previous.segments)
  ) {
    return true;
  }
  const groups = retainedSelectionGroups(editor, previous);
  if (!groups) return true;
  const first = groups[0];
  if (!first) return true;
  const pendingMarks = withAuthoredViewRead(editor, editor, () =>
    getCurrentMarks(editor)
  );
  // Re-resolving a caret bound inside struck text on commit rebuilds the
  // whole-document boundary graph; the result below writes the caret anew.
  const released =
    isPliteViewSelectionCollapsed(previous) &&
    !!previous.anchor.fragmentId &&
    !!readPliteViewSelection(editor);
  if (released) writePliteViewSelection(editor, null);
  const update = () =>
    updateAuthoredViews(
      editor,
      [...groups].reverse().map((group) => ({
        target: group.fragment,
        update: (tx) => {
          if (nativeInput) tx.annotations.set(nativeGroupingInput, nativeInput);
          const run = <TCommand extends EditorCommandDescriptor>(
            descriptor: TCommand,
            ...input: [EditorCommandInput<TCommand>] extends [void]
              ? [] | [input: EditorCommandInput<TCommand>]
              : [input: EditorCommandInput<TCommand>]
          ) =>
            withProjectedMutationRoot(
              getEditorRuntimeOwner(editor),
              group.start.root,
              () => {
                if (!group.fragment && groups.length === 1) {
                  dispatchCommand(editor, descriptor, ...input);
                  return;
                }
                const owner = getEditorRuntimeOwner(editor);
                const spec = evaluateCommandWithState(
                  editor,
                  descriptor,
                  getEditorStateView(owner),
                  ...input
                ).result;
                if (spec) applyTransactionSpec(owner, spec);
              }
            );
          tx.selection.set({ anchor: group.start, focus: group.start });
          if (groups.length > 1 || group.ranges.length > 1) {
            for (const range of [...group.ranges].reverse()) {
              if (RangeApi.isCollapsed(range)) continue;
              const { fragment } = group;
              if (
                fragment?.kind === 'delete' &&
                (fragment.slice.openStart > 0 || fragment.slice.openEnd > 0)
              ) {
                tx.selection.set(range);
                run(editorCommands.deleteFragment, { direction: 'forward' });
              } else {
                run(editorCommands.deleteFragment, {
                  at: range,
                  direction: 'forward',
                });
              }
            }
            if (
              group !== first ||
              command.kind === 'delete' ||
              command.kind === 'delete-both' ||
              command.kind === 'delete-fragment'
            ) {
              return;
            }
          } else tx.selection.set(group.ranges[0]);
          if (pendingMarks !== null && RangeApi.isCollapsed(group.ranges[0])) {
            tx.marks.set(pendingMarks);
          }
          if (
            !RangeApi.isCollapsed(group.ranges[0]) &&
            (command.kind === 'delete' || command.kind === 'delete-both')
          ) {
            const direction =
              command.kind === 'delete' ? command.direction : 'backward';
            run(editorCommands.deleteFragment, { direction });
            const selection = tx.selection();
            if (
              selection &&
              RangeApi.isRange(selection) &&
              RangeApi.isCollapsed(selection)
            ) {
              tx.selection.set(
                SelectionApi.text(selection, { affinity: direction })
              );
            }
            return;
          }
          switch (command.kind) {
            case 'transpose-character': {
              applyModelOwnedTransposeCharacterIntent({
                editor,
                selection: group.ranges[0],
              });
              break;
            }
            case 'insert-text': {
              run(editorCommands.insertText, { text: command.text });
              break;
            }
            case 'delete': {
              run(editorCommands.delete, {
                direction: command.direction,
                unit: command.unit ?? 'character',
              });
              const selection = tx.selection();
              if (selection && RangeApi.isRange(selection)) {
                tx.selection.set(
                  SelectionApi.text(selection, { affinity: command.direction })
                );
              }
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
      })),
      { tags }
    );
  let results: ReturnType<typeof update>;
  try {
    results = update();
  } catch (error) {
    if (released) writePliteViewSelection(editor, previous);
    throw error;
  }
  const changed = results?.some((result) => result.changed);
  const result = results?.at(-1);
  if (result && RangeApi.isRange(result.selection)) {
    if (
      RangeApi.isCollapsed(result.selection) &&
      !result.fragmentId &&
      !first.owner
    ) {
      // A delete can leave the caret on struck text, so it keeps its side;
      // text a Suggesting delete strikes stays on the side the caret came
      // from, so the caret takes the key's direction.
      const struck =
        strike &&
        readRetainedFragmentIdsAt(editor, result.selection.anchor) !==
          strike.slots;
      const affinity =
        (struck ? strike?.side : undefined) ??
        deleteSide ??
        result.selection.affinity ??
        (command.kind === 'delete' ? previous.anchor.affinity : undefined);
      if (changed) {
        savePliteViewSelectionHistoryEntry(editor, {
          undo: undoSelection,
          redo: null,
        });
      }
      writeModelCaret(editor, result.selection.anchor, affinity);
      return true;
    }
    const graph = createContentRootViewBoundaryGraph(
      editor,
      findContentRootOwners(editor)
    );
    const mapped = createPliteViewSelection(graph, {
      anchor: {
        ...previous.anchor,
        owner: first.owner,
        affinity: result.selection.affinity ?? previous.anchor.affinity,
        fragmentId: result.fragmentId ?? undefined,
        point: result.selection.anchor,
      },
      focus: {
        ...previous.focus,
        owner: first.owner,
        affinity: result.selection.affinity ?? previous.focus.affinity,
        fragmentId: result.fragmentId ?? undefined,
        point: result.selection.focus,
      },
    });
    // Deleting struck text in Editing leaves the caret at the edge the
    // deleted text occupied, since struck text takes no input.
    const edge =
      deleteSide &&
      isPliteViewSelectionCollapsed(mapped) &&
      mapped.anchor.fragmentId
        ? retainedCaretEdge(
            graph,
            mapped.anchor,
            deleteSide === 'forward'
              ? 'after'
              : deleteSide === 'backward'
                ? 'before'
                : undefined
          )
        : null;
    const next = edge
      ? createPliteViewSelection(graph, { anchor: edge, focus: edge })
      : mapped;
    if (changed) {
      savePliteViewSelectionHistoryEntry(editor, {
        undo: undoSelection,
        redo: next,
      });
    }
    writeMarkupSelection(editor, next);
  } else if (released) {
    writePliteViewSelection(editor, previous);
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
    applyMarkupInput(
      editor,
      command,
      command.kind === 'delete' ? ['dom-text-input'] : undefined
    )
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
      if (
        applyProjectedViewSelectionDataCommand({
          data: command.data,
          editor,
        })
      ) {
        return true;
      }

      const selection = readRuntimeSelection(editor);
      let handled = false;

      editor.update((tx) => {
        if (SelectionApi.isNode(selection)) {
          tx.selection.set(selection);
        }

        handled = toReactRuntimeEditor(editor).api.dom.clipboard.insertData(
          command.data
        );
      });

      return handled;
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
          if (nextSelection) {
            dispatchCommand(editor, editorCommands.select, {
              target: nextSelection,
            });
          } else {
            writeRuntimeSelection(editor, null);
          }
          writePliteViewSelection(
            editor,
            createPliteViewSelection(graph, { anchor, focus })
          );
          return true;
        }
      }

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

    if (viewSelection) {
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
  inputController,
  inputType,
  mergeHistory = false,
  selection,
}: {
  data: string;
  editor: Editor;
  inputController?: EditableInputController;
  inputType: string;
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

        if (
          applyMarkupInput(
            editor,
            { kind: 'insert-text', text: data },
            mergeHistory ? ['composition'] : undefined,
            nativeInput
          )
        ) {
          return { kind: 'sync-selection', syncDOMSelection: true };
        }
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
          if (RangeApi.isCollapsed(target)) {
            editor.update(
              mergeHistory ? { tags: ['composition'] } : {},
              (tx) => {
                if (nativeInput) {
                  tx.annotations.set(nativeGroupingInput, nativeInput);
                }
                tx.selection.set(target);
                tx.command(editorCommands.insertText, {
                  options: { at: target },
                  text: data,
                });
              }
            );
            return;
          }

          if (nativeInput) {
            editor.update(
              mergeHistory ? { tags: ['composition'] } : {},
              (tx) => {
                tx.annotations.set(nativeGroupingInput, nativeInput);
                tx.command(editorCommands.insertText, {
                  options: { at: target },
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
