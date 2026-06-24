import {
  NodeApi,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type RangeRef,
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
  applyBackspaceAfterBlockVoid,
  applyBackspaceAtLeadingInlineVoidBlockBoundary,
  applyParagraphBreakAfterSelectedBlockVoid,
  createDefaultParagraph,
} from './mutation-block-editing';
import {
  applyFullBlockDeleteFragment,
  applyFullBlockTextReplacement,
  canUseCachedCollapsedTextInsert,
} from './mutation-full-block-editing';
import { applyModelOwnedHistoryIntent } from './mutation-history';
import { profileEditableMutationDuration } from './mutation-profiler';
import { withProjectedMutationRoot } from './mutation-root-scope';
import { decodeProjectedClipboardFragment } from './projected-clipboard';
import { resolveProjectedSelectionTarget } from './projected-selection-target';
import {
  type Editor,
  getEditorExtensionRegistry,
  type Editor as RuntimeEditor,
  rangeRef as editorRangeRef,
  before as editorBefore,
  after as editorAfter,
  string as editorString,
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

type ClipboardInsertDataHandler = (
  editor: RuntimeEditor,
  data: DataTransfer
) => boolean;

export const applyModelOwnedDeleteIntent = ({
  direction,
  editor,
  unit,
}: {
  direction: 'backward' | 'forward';
  editor: Editor;
  unit?: 'block' | 'line' | 'word';
}) => {
  const selection = readRuntimeSelection(editor);

  if (
    direction === 'backward' &&
    unit == null &&
    (applyBackspaceAtLeadingInlineVoidBlockBoundary(editor, selection) ||
      applyBackspaceAfterBlockVoid(editor, selection))
  ) {
    return;
  }

  editor.update((tx) => {
    if (direction === 'backward') {
      tx.text.deleteBackward({ unit: unit ?? 'character' });
      return;
    }

    tx.text.deleteForward({ unit: unit ?? 'character' });
  });
};

export const applyModelOwnedExpandedDelete = ({
  direction,
  editor,
}: {
  direction: 'backward' | 'forward';
  editor: Editor;
}) => {
  editor.update((tx) => {
    tx.fragment.delete({ direction });
  });
};

export const applyModelOwnedLineBreak = ({
  editor,
  kind,
}: {
  editor: RuntimeEditor;
  kind: 'open-line' | 'paragraph' | 'soft';
}) => {
  if (
    kind !== 'soft' &&
    applyParagraphBreakAfterSelectedBlockVoid(
      editor,
      readRuntimeSelection(editor)
    )
  ) {
    return;
  }

  editor.update((tx) => {
    if (kind === 'open-line') {
      const selection = tx.selection.get();
      const blockEntry =
        selection && RangeApi.isCollapsed(selection)
          ? tx.nodes.above({
              at: selection.anchor,
              match: (node) =>
                NodeApi.isElement(node) && tx.nodes.isBlock(node),
            })
          : undefined;

      if (!blockEntry) {
        tx.break.insert();
        return;
      }

      const [, blockPath] = blockEntry;
      const insertionPoint = { path: blockPath.concat(0), offset: 0 };

      tx.nodes.insert(createDefaultParagraph(), { at: blockPath });
      tx.selection.set({ anchor: insertionPoint, focus: insertionPoint });
      return;
    }

    if (kind === 'paragraph') {
      tx.break.insert();
      return;
    }

    tx.break.insertSoft();
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
  (getEditorExtensionRegistry(editor).capabilities.get(
    'clipboard.insertData'
  ) as ClipboardInsertDataHandler[] | undefined) ?? [];

const applyProjectedClipboardInsertDataHandlers = (
  editor: RuntimeEditor,
  data: DataTransfer
) => {
  for (const handler of getProjectedClipboardInsertDataHandlers(editor)) {
    if (handler(editor, data)) {
      return true;
    }
  }

  return false;
};

const deleteProjectedRangeRefs = (
  tx: { text: { delete: (options: { at: Range }) => void } },
  rangeRefs: RangeRef[]
) => {
  const ranges = rangeRefs
    .map((rangeRef) => rangeRef.unref())
    .filter((range): range is Range => !!range);

  for (const range of ranges.reverse()) {
    if (!RangeApi.isCollapsed(range)) {
      tx.text.delete({ at: range });
    }
  }
};

const releaseProjectedRangeRefs = (rangeRefs: RangeRef[]) => {
  for (const rangeRef of rangeRefs) {
    rangeRef.unref();
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
  const modelSelection = readRuntimeSelection(runtimeEditor);

  if (
    text &&
    applyFullBlockTextReplacement(runtimeEditor, modelSelection, text)
  ) {
    savePliteViewSelectionHistoryEntry(runtimeEditor, {
      redo: null,
      undo: viewSelection,
    });
    writePliteViewSelection(editor, null);

    return true;
  }

  if (!text && applyFullBlockDeleteFragment(runtimeEditor, modelSelection)) {
    savePliteViewSelectionHistoryEntry(runtimeEditor, {
      redo: null,
      undo: viewSelection,
    });
    writePliteViewSelection(editor, null);

    return true;
  }

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
    for (const range of [...target.ranges].reverse()) {
      if (!RangeApi.isCollapsed(range)) {
        tx.text.delete({ at: range });
      }
    }

    if (text) {
      tx.text.insert(text, { at: target.start });
    }

    const selectionPoint = text
      ? advancePointByText(target.start, text)
      : target.start;

    tx.selection.set({ anchor: selectionPoint, focus: selectionPoint });
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
  const fragment = decodeProjectedClipboardFragment(runtimeEditor, data);
  const text = data.getData('text/plain');
  const modelSelection = readRuntimeSelection(runtimeEditor);
  const hasFragmentPayload = !!fragment && fragment.length > 0;
  const hasFallbackPayload = !!text || hasFragmentPayload;
  const hasInsertDataHandlers =
    getProjectedClipboardInsertDataHandlers(runtimeEditor).length > 0;
  let handled = false;

  if (!hasFallbackPayload && !hasInsertDataHandlers) {
    return true;
  }

  if (!hasFallbackPayload) {
    const previousSelection = runtimeEditor.read((state) =>
      state.selection.get()
    );

    runtimeEditor.update((tx) => {
      const rangeRefs = target.ranges.map((range) =>
        editorRangeRef(runtimeEditor, range, { affinity: 'inward' })
      );

      try {
        tx.selection.set({ anchor: target.start, focus: target.start });
        handled = withProjectedMutationRoot(
          runtimeEditor,
          target.start.root,
          () => applyProjectedClipboardInsertDataHandlers(runtimeEditor, data)
        );

        if (handled) {
          deleteProjectedRangeRefs(tx, rangeRefs);
        } else {
          releaseProjectedRangeRefs(rangeRefs);
          tx.selection.set(previousSelection);
        }
      } catch (error) {
        releaseProjectedRangeRefs(rangeRefs);
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

  if (
    text &&
    !hasFragmentPayload &&
    !hasInsertDataHandlers &&
    applyFullBlockTextReplacement(runtimeEditor, modelSelection, text)
  ) {
    savePliteViewSelectionHistoryEntry(runtimeEditor, {
      redo: null,
      undo: viewSelection,
    });
    writePliteViewSelection(editor, null);

    return true;
  }

  runtimeEditor.update((tx) => {
    const rangeRefs = target.ranges.map((range) =>
      editorRangeRef(runtimeEditor, range, { affinity: 'inward' })
    );

    try {
      tx.selection.set({ anchor: target.start, focus: target.start });
      handled = withProjectedMutationRoot(
        runtimeEditor,
        target.start.root,
        () => applyProjectedClipboardInsertDataHandlers(runtimeEditor, data)
      );

      if (handled) {
        deleteProjectedRangeRefs(tx, rangeRefs);
        return;
      }

      deleteProjectedRangeRefs(tx, rangeRefs);
      if (hasFragmentPayload) {
        withProjectedMutationRoot(runtimeEditor, target.start.root, () => {
          tx.fragment.insert(fragment);
        });
      } else {
        withProjectedMutationRoot(runtimeEditor, target.start.root, () => {
          (
            runtimeEditor.api as {
              clipboard: { insertTextData: (data: DataTransfer) => boolean };
            }
          ).clipboard.insertTextData(data);
        });
      }
    } catch (error) {
      releaseProjectedRangeRefs(rangeRefs);
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
    for (const range of [...target.ranges].reverse()) {
      if (!RangeApi.isCollapsed(range)) {
        tx.text.delete({ at: range });
      }
    }

    tx.selection.set({ anchor: target.start, focus: target.start });

    withProjectedMutationRoot(runtimeEditor, target.start.root, () => {
      if (kind !== 'open-line') {
        if (kind === 'paragraph') {
          tx.break.insert();
          return;
        }

        tx.break.insertSoft();
        return;
      }

      const blockEntry = tx.nodes.above({
        at: target.start,
        match: (node) => NodeApi.isElement(node) && tx.nodes.isBlock(node),
      });

      if (!blockEntry) {
        tx.break.insert();
        return;
      }

      const [, blockPath] = blockEntry;
      const insertionPoint = { path: blockPath.concat(0), offset: 0 };

      tx.nodes.insert(createDefaultParagraph(), { at: blockPath });
      tx.selection.set({ anchor: insertionPoint, focus: insertionPoint });
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
  editor.update((tx) => {
    if (command.axis === 'document') {
      const point = command.reverse ? tx.points.start([]) : tx.points.end([]);

      tx.selection.set(
        command.extend
          ? createRange(selection.anchor, point)
          : createRange(point, point)
      );
      return;
    }

    if (command.extend) {
      tx.selection.move({
        edge: 'focus',
        reverse: command.reverse,
        unit: getSelectionMoveUnit(command),
      });
      return;
    }

    if (RangeApi.isCollapsed(selection)) {
      tx.selection.move({
        reverse: command.reverse,
        unit: getSelectionMoveUnit(command),
      });
      return;
    }

    tx.selection.collapse({
      edge: command.reverse ? 'start' : 'end',
    });
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
    tx.text.delete({ at: createRange(start, end) });
    tx.text.insert(swapped, { at: clonePoint(start) });
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

        if (applyFullBlockDeleteFragment(editor, selection)) {
          return true;
        }

        if (selection && RangeApi.isCollapsed(selection)) {
          return true;
        }

        editor.update((tx) => {
          if (selection && RangeApi.isExpanded(selection)) {
            tx.fragment.delete({ at: selection });
            return;
          }

          tx.fragment.delete(
            command.direction ? { direction: command.direction } : undefined
          );
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

      editor.update(() => {
        (
          editor.api as {
            clipboard: { insertData: (data: DataTransfer) => boolean };
          }
        ).clipboard.insertData(command.data);
      });
      return true;

    case 'insert-text':
      if (
        applyProjectedViewSelectionTextCommand({
          editor,
          text: command.text,
        })
      ) {
        return true;
      }

      editor.update((tx) => {
        tx.text.insert(command.text);
      });
      return true;

    case 'transpose-character':
      return applyModelOwnedTransposeCharacterIntent({
        editor,
        selection: readRuntimeSelection(editor),
      });

    case 'select':
    case 'select-all': {
      let nextSelection: Range | null = null;
      editor.update((tx) => {
        nextSelection =
          command.kind === 'select'
            ? command.selection
            : {
                anchor: tx.points.start([]),
                focus: tx.points.end([]),
              };
        tx.selection.set(nextSelection);
      });
      writePliteViewSelection(
        editor,
        command.kind === 'select-all' &&
          nextSelection &&
          shouldUseModelBackedSelectAllSelection({
            editor: editor as ReactRuntimeEditor,
            selection: nextSelection,
          })
          ? createMainRootPliteViewSelection(
              nextSelection,
              editor.read((state) => state.view.root())
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

    case 'set-block':
    case 'toggle-mark':
      return false;
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
      kind: 'force-render' | 'sync-selection';
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
        editor.update((tx) => {
          tx.text.insert(data, { at: selection });
        })
    );
  } else if (
    selection &&
    (RangeApi.isExpanded(selection) || inputType !== 'insertText')
  ) {
    writePliteViewSelection(editor, null);
    if (!applyFullBlockTextReplacement(editor, selection, data)) {
      profileEditableMutationDuration(
        'model-text-input-insert-at-target-selection',
        () =>
          editor.update((tx) => {
            tx.text.insert(data, { at: selection });
          })
      );
    }
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
  domRepairQueue,
  editor,
  forceRender,
  inputController,
  request,
  syncDOMSelectionToEditor,
}: {
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
          globalThis.setTimeout?.(() => {
            if (
              inputController.state.selectionChangeOrigin ===
              'programmatic-export'
            ) {
              inputController.state.isUpdatingSelection = false;
            }
          }, 160);
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
        globalThis.queueMicrotask?.(syncProgrammaticDOMSelection);
        globalThis.setTimeout?.(syncProgrammaticDOMSelection);
        globalThis.setTimeout?.(syncProgrammaticDOMSelection, 80);
        globalThis.setTimeout?.(() => {
          if (
            inputController.state.selectionChangeOrigin ===
            'programmatic-export'
          ) {
            inputController.state.isUpdatingSelection = false;
          }
        }, 160);
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
