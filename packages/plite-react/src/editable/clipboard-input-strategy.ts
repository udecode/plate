import type { ClipboardEvent, DragEvent } from 'react';
import { NodeApi, type Range, RangeApi } from '@platejs/plite';
import {
  HAS_BEFORE_INPUT_SUPPORT,
  IS_WEBKIT,
  isDOMElement,
  isDOMNode,
  isDOMText,
  isPlainTextOnlyPaste,
} from '@platejs/plite-dom';
import { DOMCoverage } from '@platejs/plite-dom/internal';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import type { EditableCommand } from './editing-kernel';
import {
  type EditableRepairRequest,
  isInteractiveInternalTarget,
} from './input-controller';
import { applyEditableCommand } from './mutation-controller';
import { writeProjectedViewSelectionClipboardData } from './projected-clipboard';
import { resolveProjectedSelectionTarget } from './projected-selection-target';
import {
  hasPath as editorHasPath,
  void as editorVoid,
  isInline as editorIsInline,
  isBlock as editorIsBlock,
  above as editorAbove,
  isVoid as editorIsVoid,
  point as editorPoint,
  before as editorBefore,
  after as editorAfter,
  range as editorRange,
  pointRef as editorPointRef,
} from './runtime-editor-api';
import { readRuntimeNode } from './runtime-live-state';
import { readRuntimeSelection } from './runtime-selection-state';

type EditablePasteHandler = (
  event: ClipboardEvent<HTMLDivElement>
) => boolean | void;

type EditableDragHandler = (event: DragEvent<HTMLDivElement>) => boolean | void;

type EditableDragState = {
  draggedBlock: boolean;
  draggedRange: Range | null;
  isDraggingInternally: boolean;
};

export type EditableClipboardResult = {
  command: EditableCommand | null;
  explicitPartialDOMBackedSelection?: boolean;
  repair?: EditableRepairRequest | null;
};

const clipboardResult = ({
  command,
  explicitPartialDOMBackedSelection,
  repair,
}: EditableClipboardResult): EditableClipboardResult => ({
  command,
  explicitPartialDOMBackedSelection,
  repair,
});

const isClipboardEventHandled = ({
  event,
  handler,
}: {
  event: ClipboardEvent<HTMLDivElement>;
  handler?: EditablePasteHandler;
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

const hasClipboardFiles = (data: DataTransfer | null | undefined) =>
  !!data?.files && data.files.length > 0;

const isDragEventHandled = ({
  event,
  handler,
}: {
  event: DragEvent<HTMLDivElement>;
  handler?: EditableDragHandler;
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

const shouldHandleEditorDragEvent = ({
  editor,
  event,
  handler,
}: {
  editor: ReactRuntimeEditor;
  event: DragEvent<HTMLDivElement>;
  handler?: EditableDragHandler;
}) =>
  ReactEditor.hasTarget(editor, event.target) &&
  !isDragEventHandled({ event, handler }) &&
  !isInteractiveInternalTarget(editor, event.target);

const resolveDragTarget = (editor: ReactRuntimeEditor, target: EventTarget) => {
  if (!isDOMNode(target)) {
    return null;
  }

  const targetElement = isDOMText(target)
    ? target.parentElement
    : isDOMElement(target)
      ? target
      : null;
  const pliteHost = targetElement?.closest('[data-plite-node]');
  const path =
    pliteHost instanceof Element
      ? getPliteNodePathFromDOMElement(pliteHost)
      : null;

  if (path != null) {
    const node = readRuntimeNode(editor, path);

    if (node) {
      return { node, path };
    }
  }

  const node = ReactEditor.resolvePliteNode(editor, target);
  const fallbackPath = node ? ReactEditor.resolvePath(editor, node) : null;

  if (
    !node ||
    !fallbackPath ||
    !editorHasPath(editor, fallbackPath) ||
    NodeApi.get(editor, fallbackPath) !== node
  ) {
    return null;
  }

  return { node, path: fallbackPath };
};

const isBlockVoidRange = (editor: ReactRuntimeEditor, range: Range) => {
  const voidMatch = editorVoid(editor, { at: range, voids: true });

  if (!voidMatch) {
    return false;
  }

  const [node] = voidMatch;

  return NodeApi.isElement(node) && !editorIsInline(editor, node);
};

const resolveBlockDropRangeFromEvent = (
  editor: ReactRuntimeEditor,
  event: DragEvent<HTMLDivElement>
) => {
  const target = resolveDragTarget(editor, event.target);

  if (!target) {
    return null;
  }

  const blockMatch =
    NodeApi.isElement(target.node) && editorIsBlock(editor, target.node)
      ? ([target.node, target.path] as const)
      : editorAbove(editor, {
          at: target.path,
          match: (node) =>
            NodeApi.isElement(node) && editorIsBlock(editor, node),
        });

  if (!blockMatch) {
    return null;
  }

  const [block, blockPath] = blockMatch;

  if (!NodeApi.isElement(block) || editorIsVoid(editor, block)) {
    return null;
  }

  const blockElement = editor.api.dom.resolveDOMNode(block);

  if (!blockElement) {
    return null;
  }

  const rect = blockElement.getBoundingClientRect();
  const isBefore =
    event.nativeEvent.clientY - rect.top <
    rect.bottom - event.nativeEvent.clientY;
  const edge = editorPoint(editor, blockPath, {
    edge: isBefore ? 'start' : 'end',
  });
  const point = isBefore
    ? (editorBefore(editor, edge) ?? edge)
    : (editorAfter(editor, edge) ?? edge);

  return editorRange(editor, point);
};

const isClipboardEventTargetInput = ({
  event,
}: {
  event: ClipboardEvent<HTMLDivElement>;
}) =>
  event.target instanceof HTMLInputElement ||
  event.target instanceof HTMLTextAreaElement;

const preventReadOnlyClipboardDefault = ({
  editor,
  event,
  handler,
}: {
  editor: ReactRuntimeEditor;
  event: ClipboardEvent<HTMLDivElement>;
  handler?: EditablePasteHandler;
}) => {
  if (
    ReactEditor.hasEditableTarget(editor, event.target) &&
    !isClipboardEventTargetInput({ event })
  ) {
    isClipboardEventHandled({ event, handler });
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  return false;
};

const materializePasteTargetBoundaries = (editor: ReactRuntimeEditor) => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection) {
    return;
  }

  for (const boundary of DOMCoverage.getBoundariesForRange(editor, selection)) {
    if (boundary.selectionPolicy === 'materialize') {
      DOMCoverage.materializeBoundary(editor, boundary.boundaryId, 'paste', {
        range: selection,
      });
    }
  }
};

export const applyEditableCopy = ({
  editor,
  event,
  onCopy,
}: {
  editor: ReactRuntimeEditor;
  event: ClipboardEvent<HTMLDivElement>;
  onCopy?: EditablePasteHandler;
}) => {
  const clipboardData =
    event.clipboardData ??
    (event.nativeEvent as globalThis.ClipboardEvent).clipboardData;

  if (
    clipboardData &&
    ReactEditor.hasSelectableTarget(editor, event.target) &&
    !isClipboardEventHandled({ event, handler: onCopy }) &&
    !isClipboardEventTargetInput({ event })
  ) {
    event.preventDefault();
    if (writeProjectedViewSelectionClipboardData(editor, clipboardData)) {
      return;
    }

    editor.api.clipboard.writeSelection(clipboardData);
  }
};

export const applyEditableCut = ({
  editor,
  event,
  onCut,
  readOnly,
}: {
  editor: ReactRuntimeEditor;
  event: ClipboardEvent<HTMLDivElement>;
  onCut?: EditablePasteHandler;
  readOnly: boolean;
}): EditableClipboardResult => {
  const clipboardData =
    event.clipboardData ??
    (event.nativeEvent as globalThis.ClipboardEvent).clipboardData;

  if (clipboardData && readOnly) {
    preventReadOnlyClipboardDefault({ editor, event, handler: onCut });
    return clipboardResult({ command: null });
  }

  if (
    clipboardData &&
    !readOnly &&
    ReactEditor.hasSelectableTarget(editor, event.target) &&
    !isClipboardEventHandled({ event, handler: onCut }) &&
    !isClipboardEventTargetInput({ event })
  ) {
    event.preventDefault();
    const viewSelection = readPliteViewSelection(editor);

    if (viewSelection && !isPliteViewSelectionCollapsed(viewSelection)) {
      const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

      if (resolution.kind === 'ambiguous') {
        return clipboardResult({ command: null });
      }
      if (resolution.kind === 'stale') {
        writePliteViewSelection(editor, null);
      } else if (
        writeProjectedViewSelectionClipboardData(editor, clipboardData)
      ) {
        const command: EditableCommand = { kind: 'delete-fragment' };

        applyEditableCommand({ command, editor });
        return clipboardResult({
          command,
          repair: {
            focus: true,
            kind: 'repair-caret',
            selectionSourceTransition: {
              preferModelSelection: true,
              reason: 'model-command',
              selectionSource: 'model-owned',
            },
          },
        });
      }
    }

    editor.api.clipboard.writeSelection(clipboardData);
    const selection = editor.read((state) => state.selection.get());

    if (selection) {
      if (RangeApi.isExpanded(selection)) {
        const command: EditableCommand = { kind: 'delete-fragment' };
        const inlineEntry = editorAbove(editor, {
          at: RangeApi.start(selection),
          match: (node) =>
            NodeApi.isElement(node) && editorIsInline(editor, node),
        });
        const inlinePath = inlineEntry?.[1];
        const inlineBeforePoint = inlinePath
          ? editorBefore(editor, inlinePath)
          : null;
        const collapsePointRef = editorPointRef(
          editor,
          RangeApi.start(selection)
        );
        applyEditableCommand({ command, editor });
        writePliteViewSelection(editor, null);
        const collapsePoint = collapsePointRef.unref();
        const shouldRemoveEmptyInline =
          inlinePath &&
          editorHasPath(editor, inlinePath) &&
          (() => {
            const [inlineNode] = editor.read((state) =>
              state.nodes.get(inlinePath)
            );
            return (
              NodeApi.isElement(inlineNode) &&
              editorIsInline(editor, inlineNode) &&
              NodeApi.string(inlineNode) === ''
            );
          })();

        if (shouldRemoveEmptyInline && inlinePath && inlineBeforePoint) {
          editor.update((tx) => {
            tx.nodes.remove({
              at: inlinePath,
              voids: true,
            });
          });
          applyEditableCommand({
            command: {
              kind: 'select',
              selection: {
                anchor: inlineBeforePoint,
                focus: inlineBeforePoint,
              },
            },
            editor,
          });
          return clipboardResult({
            command,
            repair: {
              focus: true,
              kind: 'repair-caret',
              selectionSourceTransition: {
                preferModelSelection: true,
                reason: 'model-command',
                selectionSource: 'model-owned',
              },
            },
          });
        }

        if (collapsePoint) {
          applyEditableCommand({
            command: {
              kind: 'select',
              selection: {
                anchor: collapsePoint,
                focus: collapsePoint,
              },
            },
            editor,
          });
          return clipboardResult({
            command,
            repair: {
              focus: true,
              kind: 'repair-caret',
              selectionSourceTransition: {
                preferModelSelection: true,
                reason: 'model-command',
                selectionSource: 'model-owned',
              },
            },
          });
        }

        return clipboardResult({ command });
      }
      const node = NodeApi.parent(editor, selection.anchor.path);
      if (NodeApi.isElement(node) && editorIsVoid(editor, node)) {
        const command: EditableCommand = { kind: 'delete-fragment' };

        editor.update((tx) => {
          tx.text.delete();
        });

        return clipboardResult({
          command,
          repair: {
            focus: true,
            kind: 'repair-caret',
            selectionSourceTransition: {
              preferModelSelection: true,
              reason: 'model-command',
              selectionSource: 'model-owned',
            },
          },
        });
      }
    }
  }

  return clipboardResult({ command: null });
};

export const applyEditableDragEnd = ({
  editor,
  event,
  onDragEnd,
  readOnly,
  state,
}: {
  editor: ReactRuntimeEditor;
  event: DragEvent<HTMLDivElement>;
  onDragEnd?: EditableDragHandler;
  readOnly: boolean;
  state: EditableDragState;
}) => {
  if (!readOnly && state.isDraggingInternally && onDragEnd) {
    shouldHandleEditorDragEvent({
      editor,
      event,
      handler: onDragEnd,
    });
  }
};

export const applyEditableDragOver = ({
  editor,
  event,
  onDragOver,
  state,
}: {
  editor: ReactRuntimeEditor;
  event: DragEvent<HTMLDivElement>;
  onDragOver?: EditableDragHandler;
  state: EditableDragState;
}) => {
  if (
    shouldHandleEditorDragEvent({
      editor,
      event,
      handler: onDragOver,
    })
  ) {
    if (state.isDraggingInternally) {
      event.dataTransfer.dropEffect = 'move';
    }

    // Only when the target is void, call `preventDefault` to signal
    // that drops are allowed. Editable content is droppable by
    // default, and calling `preventDefault` hides the cursor.
    const target = resolveDragTarget(editor, event.target);
    const node = target?.node;

    if (node && NodeApi.isElement(node) && editorIsVoid(editor, node)) {
      event.preventDefault();
    }
  }
};

export const applyEditableDragStart = ({
  editor,
  event,
  onDragStart,
  readOnly,
  state,
}: {
  editor: ReactRuntimeEditor;
  event: DragEvent<HTMLDivElement>;
  onDragStart?: EditableDragHandler;
  readOnly: boolean;
  state: EditableDragState;
}) => {
  if (
    !readOnly &&
    shouldHandleEditorDragEvent({
      editor,
      event,
      handler: onDragStart,
    })
  ) {
    const target = resolveDragTarget(editor, event.target);

    if (!target) {
      return;
    }

    const { node, path } = target;
    const voidEntry =
      NodeApi.isElement(node) && editorIsVoid(editor, node)
        ? ([node, path] as const)
        : editorVoid(editor, { at: path, voids: true });
    let draggedBlock = false;
    let draggedRange = readRuntimeSelection(editor);

    // If starting a drag on a void node, make sure it is selected
    // so that it shows up in the selection's fragment.
    if (voidEntry) {
      const [voidNode, voidPath] = voidEntry;
      const range = editorRange(editor, voidPath);
      applyEditableCommand({
        command: { kind: 'select', selection: range },
        editor,
      });
      draggedBlock =
        NodeApi.isElement(voidNode) && !editorIsInline(editor, voidNode);
      draggedRange = range;
    }

    state.draggedBlock = draggedBlock;
    state.draggedRange = draggedRange;
    state.isDraggingInternally = true;
    event.dataTransfer.effectAllowed = 'move';

    editor.api.clipboard.writeSelection(event.dataTransfer);
  }
};

export const applyEditableDrop = ({
  editor,
  event,
  onDrop,
  readOnly,
  state,
}: {
  editor: ReactRuntimeEditor;
  event: DragEvent<HTMLDivElement>;
  onDrop?: EditableDragHandler;
  readOnly: boolean;
  state: EditableDragState;
}): EditableClipboardResult => {
  if (readOnly && ReactEditor.hasEditableTarget(editor, event.target)) {
    isDragEventHandled({ event, handler: onDrop });
    event.preventDefault();
    event.stopPropagation();
    return clipboardResult({ command: null });
  }

  if (
    !readOnly &&
    shouldHandleEditorDragEvent({
      editor,
      event,
      handler: onDrop,
    })
  ) {
    event.preventDefault();

    // Keep the drag-start payload range. Native drop handling can move the
    // live selection to the text drop target before this handler runs.
    const draggedRange = state.draggedRange ?? readRuntimeSelection(editor);
    const isBlockDrag =
      state.draggedBlock ||
      (draggedRange ? isBlockVoidRange(editor, draggedRange) : false);

    // Find the range where the drop happened
    const defaultRange = ReactEditor.resolveEventRange(editor, event);
    const blockDropRange =
      state.isDraggingInternally && isBlockDrag
        ? resolveBlockDropRangeFromEvent(editor, event)
        : null;
    const range =
      state.isDraggingInternally && isBlockDrag
        ? (blockDropRange ?? defaultRange)
        : defaultRange;

    if (!range) {
      return clipboardResult({ command: null });
    }

    const data = event.dataTransfer;
    const command: EditableCommand = { data, kind: 'insert-data' };

    applyEditableCommand({
      command: { kind: 'select', selection: range },
      editor,
    });

    if (
      state.isDraggingInternally &&
      draggedRange &&
      !RangeApi.equals(draggedRange, range) &&
      !editorVoid(editor, { at: range, voids: true })
    ) {
      editor.update((tx) => {
        tx.text.delete({
          at: draggedRange,
        });
      });
    }

    applyEditableCommand({ command, editor });

    // When dragging from another source into the editor, it's possible
    // that the current editor does not have focus.
    if (!ReactEditor.isFocused(editor)) {
      return clipboardResult({
        command,
        repair: {
          focus: true,
          kind: 'repair-caret',
          selectionSourceTransition: {
            preferModelSelection: true,
            reason: 'model-command',
            selectionSource: 'model-owned',
          },
        },
      });
    }

    return clipboardResult({ command });
  }

  return clipboardResult({ command: null });
};

export const applyEditablePaste = ({
  editor,
  event,
  onPaste,
  readOnly,
  partialDOMBackedSelection,
}: {
  editor: ReactRuntimeEditor;
  event: ClipboardEvent<HTMLDivElement>;
  onPaste?: EditablePasteHandler;
  readOnly: boolean;
  partialDOMBackedSelection: boolean;
}): EditableClipboardResult => {
  if (readOnly) {
    preventReadOnlyClipboardDefault({ editor, event, handler: onPaste });
    return clipboardResult({ command: null });
  }

  const canHandlePaste =
    ReactEditor.hasEditableTarget(editor, event.target) &&
    !isClipboardEventHandled({ event, handler: onPaste });

  if (partialDOMBackedSelection && event.clipboardData && canHandlePaste) {
    event.preventDefault();
    materializePasteTargetBoundaries(editor);
    const command: EditableCommand = {
      data: event.clipboardData,
      kind: 'insert-data',
    };
    applyEditableCommand({ command, editor });
    return clipboardResult({
      command,
      explicitPartialDOMBackedSelection: false,
      repair: { kind: 'repair-caret' },
    });
  }

  if (
    canHandlePaste &&
    (!HAS_BEFORE_INPUT_SUPPORT ||
      hasClipboardFiles(event.clipboardData) ||
      isPlainTextOnlyPaste(event.nativeEvent) ||
      IS_WEBKIT)
  ) {
    // COMPAT: Certain browsers don't support the `beforeinput` event, so we
    // fall back to React's `onPaste` here instead.
    // COMPAT: Firefox, Chrome and Safari don't emit `beforeinput` events
    // when "paste without formatting" is used, so fallback. (2020/02/20)
    // COMPAT: Safari InputEvents generated by pasting won't include
    // application/x-plite-fragment items, so use the
    // ClipboardEvent here. (2023/03/15)
    event.preventDefault();
    materializePasteTargetBoundaries(editor);
    const command: EditableCommand = {
      data: event.clipboardData,
      kind: 'insert-data',
    };
    applyEditableCommand({ command, editor });

    return clipboardResult({
      command,
      repair: { kind: 'repair-caret' },
    });
  }

  return clipboardResult({ command: null });
};
