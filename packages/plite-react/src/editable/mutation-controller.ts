import {
  type Anchor,
  NodeApi,
  PathApi,
  type EditorUpdateTransaction,
  type Point,
  type Range,
  RangeApi,
} from '@platejs/plite';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  createMainRootPliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  savePliteViewSelectionHistoryEntry,
  writePliteViewSelection,
} from '../view-selection';
import { applyContentRootSelectionMoveCommand } from './content-root-navigation';
import type { DOMPhaseScheduler } from '@platejs/plite-dom/internal';
import {
  dispatchDOMClipboardHandlers,
  DOM_CLIPBOARD_HANDLERS,
} from '@platejs/plite-dom/internal';
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
import { profileEditableMutationDuration } from './mutation-profiler';
import { withProjectedMutationRoot } from './mutation-root-scope';
import { decodeProjectedClipboardFragment } from './projected-clipboard';
import { resolveProjectedSelectionTarget } from './projected-selection-target';
import {
  type Editor,
  failInvariant,
  getEditorExtensionContributions,
  type Editor as RuntimeEditor,
  before as editorBefore,
  after as editorAfter,
  dispatchCommand,
  editorCommands,
  insertText as editorInsertText,
  move as editorMove,
  string as editorString,
  toInternalRoot,
} from './runtime-editor-api';
import { readRuntimeSelection } from './runtime-selection-state';
import {
  armModelOwnedTextInputGuard,
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
      readRuntimeSelection(editor)
    )
  ) {
    return;
  }

  const selection = readRuntimeSelection(editor);
  const blockEntry =
    selection && RangeApi.isCollapsed(selection)
      ? editor.read((state) =>
          state.nodes.above({
            at: selection.anchor,
            match: (node) =>
              NodeApi.isElement(node) && state.nodes.isBlock(node),
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

const getCanonicalRuntimeEditor = (editor: RuntimeEditor): RuntimeEditor =>
  ((editor as { runtime?: { editor?: RuntimeEditor } }).runtime?.editor ??
    editor) as RuntimeEditor;

const getProjectedClipboardInsertDataHandlers = (editor: RuntimeEditor) =>
  getEditorExtensionContributions(editor, DOM_CLIPBOARD_HANDLERS);

const applyProjectedClipboardInsertDataHandlers = (
  editor: RuntimeEditor,
  data: DataTransfer,
  tx: EditorUpdateTransaction
) =>
  dispatchDOMClipboardHandlers(
    getProjectedClipboardInsertDataHandlers(editor),
    data,
    tx,
    () => false
  );

const deleteProjectedRanges = (
  editor: RuntimeEditor,
  tx: EditorUpdateTransaction,
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

const deleteProjectedRangeAnchors = (
  editor: RuntimeEditor,
  tx: EditorUpdateTransaction,
  rangeAnchors: Anchor<Range>[]
) => {
  const ranges = rangeAnchors
    .map((rangeAnchor) => rangeAnchor.release())
    .filter((range): range is Range => !!range);

  deleteProjectedRanges(editor, tx, ranges);
};

const releaseProjectedRangeAnchors = (rangeAnchors: Anchor<Range>[]) => {
  for (const rangeAnchor of rangeAnchors) {
    rangeAnchor.release();
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

  const runtimeEditor = getCanonicalRuntimeEditor(editor);

  const resolution = resolveProjectedSelectionTarget(
    runtimeEditor,
    viewSelection
  );

  if (resolution.kind === 'ambiguous') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;

  runtimeEditor.update((tx) => {
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
  savePliteViewSelectionHistoryEntry(runtimeEditor, {
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

  const runtimeEditor = getCanonicalRuntimeEditor(editor);
  const resolution = resolveProjectedSelectionTarget(
    runtimeEditor,
    viewSelection
  );

  if (resolution.kind === 'ambiguous') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;
  const slice = decodeProjectedClipboardFragment(editor, data);
  const text = data.getData('text/plain');
  const hasFragmentPayload = !!slice && slice.content.length > 0;
  const hasFallbackPayload = !!text || hasFragmentPayload;
  const hasInsertDataHandlers =
    getProjectedClipboardInsertDataHandlers(runtimeEditor).length > 0;
  let handled = false;

  if (!hasFallbackPayload && !hasInsertDataHandlers) {
    return true;
  }

  if (!hasFallbackPayload) {
    const previousSelection = runtimeEditor.read((state) => state.selection());

    runtimeEditor.update({ tags: 'paste' }, (tx) => {
      const rangeAnchors = target.ranges.map((range) =>
        runtimeEditor.anchor(range, {
          association: 'inward',
          deletion: 'nearest',
        })
      );

      try {
        tx.selection.set({
          anchor: target.start,
          focus: target.start,
        });
        handled = withProjectedMutationRoot(
          runtimeEditor,
          target.start.root,
          () =>
            applyProjectedClipboardInsertDataHandlers(runtimeEditor, data, tx)
        );

        if (handled) {
          deleteProjectedRangeAnchors(runtimeEditor, tx, rangeAnchors);
        } else {
          releaseProjectedRangeAnchors(rangeAnchors);
          if (previousSelection) {
            tx.selection.set(previousSelection);
          } else {
            tx.selection.clear();
          }
        }
      } catch (error) {
        releaseProjectedRangeAnchors(rangeAnchors);
        throw error;
      }
    });

    if (handled) {
      savePliteViewSelectionHistoryEntry(runtimeEditor, {
        redo: null,
        undo: viewSelection,
      });
      writePliteViewSelection(editor, null);
    }

    return true;
  }

  runtimeEditor.update({ tags: 'paste' }, (tx) => {
    const rangeAnchors = target.ranges.map((range) =>
      runtimeEditor.anchor(range, {
        association: 'inward',
        deletion: 'nearest',
      })
    );

    try {
      tx.selection.set({
        anchor: target.start,
        focus: target.start,
      });
      handled = withProjectedMutationRoot(
        runtimeEditor,
        target.start.root,
        () => applyProjectedClipboardInsertDataHandlers(runtimeEditor, data, tx)
      );

      if (handled) {
        deleteProjectedRangeAnchors(runtimeEditor, tx, rangeAnchors);
        return;
      }

      deleteProjectedRangeAnchors(runtimeEditor, tx, rangeAnchors);
      if (hasFragmentPayload) {
        withProjectedMutationRoot(runtimeEditor, target.start.root, () => {
          tx.command(editorCommands.replaceSlice, {
            options: { at: target.start },
            slice,
          });
        });
      } else {
        withProjectedMutationRoot(runtimeEditor, target.start.root, () => {
          (
            runtimeEditor.api as unknown as {
              clipboard: { insertTextData: (data: DataTransfer) => boolean };
            }
          ).clipboard.insertTextData(data);
        });
      }
    } catch (error) {
      releaseProjectedRangeAnchors(rangeAnchors);
      throw error;
    }
  });
  savePliteViewSelectionHistoryEntry(runtimeEditor, {
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

  const runtimeEditor = getCanonicalRuntimeEditor(editor);
  const resolution = resolveProjectedSelectionTarget(
    runtimeEditor,
    viewSelection
  );

  if (resolution.kind === 'ambiguous') {
    return true;
  }
  if (resolution.kind === 'stale') {
    writePliteViewSelection(editor, null);
    return false;
  }

  const { target } = resolution;

  runtimeEditor.update((tx) => {
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

      const blockEntry = tx.nodes.above({
        at: target.start,
        match: (node) => NodeApi.isElement(node) && tx.nodes.isBlock(node),
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
  savePliteViewSelectionHistoryEntry(runtimeEditor, {
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

export const applyEditableCommand = ({
  command,
  editor,
}: {
  command: EditableCommand;
  editor: RuntimeEditor;
}) => {
  switch (command.kind) {
    case 'delete':
      if (applyProjectedViewSelectionTextCommand({ editor })) {
        return true;
      }

      applyModelOwnedDeleteIntent({
        direction: command.direction,
        editor,
        unit: command.unit,
      });
      return true;

    case 'delete-both':
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

    case 'delete-fragment':
      if (applyProjectedViewSelectionTextCommand({ editor })) {
        return true;
      }

      {
        const selection = command.selection ?? readRuntimeSelection(editor);

        if (selection && RangeApi.isCollapsed(selection)) {
          return true;
        }

        dispatchCommand(editor, editorCommands.deleteFragment, {
          ...(selection && RangeApi.isExpanded(selection)
            ? { at: selection }
            : {}),
          direction: command.direction ?? 'forward',
        });
        return true;
      }

    case 'history':
      return applyModelOwnedHistoryIntent({
        direction: command.direction,
        editor,
      });

    case 'insert-break':
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

    case 'insert-data':
      if (
        applyProjectedViewSelectionDataCommand({
          data: command.data,
          editor,
        })
      ) {
        return true;
      }

      return (
        editor.api as unknown as {
          clipboard: { insertData: (data: DataTransfer) => boolean };
        }
      ).clipboard.insertData(command.data);

    case 'insert-text':
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

    case 'transpose-character':
      return applyModelOwnedTransposeCharacterIntent({
        editor,
        selection: readRuntimeSelection(editor),
      });

    case 'select':
    case 'select-all': {
      const nextSelection =
        command.kind === 'select'
          ? command.selection
          : {
              anchor:
                editor.read((state) => state.points.start([])) ??
                failInvariant('Expected a document start point for select all'),
              focus:
                editor.read((state) => state.points.end([])) ??
                failInvariant('Expected a document end point for select all'),
            };

      dispatchCommand(editor, editorCommands.select, {
        target: nextSelection,
      });
      const appliedSelection = readRuntimeSelection(editor);
      writePliteViewSelection(
        editor,
        command.kind === 'select-all' &&
          appliedSelection &&
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

    case 'move-selection':
      if (
        applyContentRootSelectionMoveCommand({
          command,
          editor: editor as ReactRuntimeEditor,
          selection: readRuntimeSelection(editor),
        }).handled
      ) {
        return true;
      }

      return applyRootLocalSelectionMoveCommand({ command, editor });
  }
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

export const applyModelOwnedTextInput = ({
  data,
  editor,
  inputType,
  selection,
}: {
  data: string;
  editor: Editor;
  inputType: string;
  selection?: Range | null;
}): EditableRepairRequest => {
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
    profileEditableMutationDuration(
      'model-text-input-insert-at-selection',
      () =>
        dispatchCommand(editor, editorCommands.insertText, {
          options: { at: selection },
          text: data,
        })
    );
  } else if (
    selection &&
    (RangeApi.isExpanded(selection) || inputType !== 'insertText')
  ) {
    writePliteViewSelection(editor, null);
    profileEditableMutationDuration(
      'model-text-input-insert-at-target-selection',
      () =>
        dispatchCommand(editor, editorCommands.insertText, {
          options: { at: selection },
          text: data,
        })
    );
  } else {
    profileEditableMutationDuration('model-text-input-apply-command', () =>
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
};

export const applyEditableRepairRequest = ({
  domPhaseScheduler,
  domRepairQueue,
  editor,
  forceRender,
  inputController,
  request,
  syncDOMSelectionToEditor,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  domRepairQueue: DOMRepairQueue;
  editor: ReactRuntimeEditor;
  forceRender: () => void;
  inputController: EditableInputController;
  request: EditableRepairRequest;
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

        profileEditableMutationDuration(
          'repair.selection-source-transition',
          () => {
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
          }
        );
        if (
          selectionSourceTransition.preferModelSelection &&
          selectionSourceTransition.reason === 'model-command'
        ) {
          profileEditableMutationDuration(
            'repair.model-owned-text-guard',
            () => {
              armModelOwnedTextInputGuard({ inputController });
            }
          );
        }
      }

      if (
        'focus' in request &&
        request.focus &&
        !shouldSkipSelectionFocus(editor)
      ) {
        profileEditableMutationDuration('repair.focus-editor', () => {
          ReactEditor.focus(editor);
        });
      }

      if ('forceRender' in request && request.forceRender) {
        profileEditableMutationDuration('repair.force-render', forceRender);
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
          const selection = readRuntimeSelection(editor);

          if (selection) {
            editor.update((tx) => {
              tx.selection.set(selection);
            });
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
        profileEditableMutationDuration('repair.dom-repair-queue', () => {
          domRepairQueue.repair(repairPolicy);
        });
        return;
      }

      if (request.kind === 'repair-caret-after-text-insert') {
        profileEditableMutationDuration('repair.dom-repair-queue', () => {
          domRepairQueue.repair(repairPolicy);
        });
      }
    },
    repairPolicy,
  });
};
