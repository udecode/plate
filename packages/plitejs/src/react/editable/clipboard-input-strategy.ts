import type { ClipboardEvent, DragEvent } from 'react';

import {
  type TransferOutcome,
  NodeApi,
  PathApi,
  type Range,
  RangeApi,
  SelectionApi,
  TextApi,
} from '../..';
import {
  isDOMElement,
  isDOMNode,
  isDOMText,
  isPlainTextOnlyPaste,
} from '../../dom';
import {
  type DOMCoverageSession,
  domCommands,
  getPliteStringCoordinatePlacement,
  getPliteStringDocumentOffset,
  getPliteStringEdgeOffset,
  getPliteTextHostStrings,
  isWebKitDOMHost,
  supportsDOMBeforeInput,
} from '../../dom/internal';
import {
  blockCopyIntent,
  copyIntentOf,
  indicateDOMDropTarget,
  resolveDOMDropTarget,
} from '../../dom/plugin/dom-drag';
import { readDOMFragmentTarget } from '../../dom/plugin/dom-fragment-view';
import {
  beginDragSession,
  clearDragSession,
  type DragSession,
  isDragSessionClaimed,
  readDragSession,
  settleDragSession,
  takeDragSession,
} from '../../dom/utils/drag-session';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import { getDragAutoScrollTarget } from './drag-auto-scroll-target';
import { getMountedEditableDOMRuntime } from './editable-dom-runtime';
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
  above as editorAbove,
  isVoid as editorIsVoid,
  point as editorPoint,
  before as editorBefore,
  range as editorRange,
  editorCommands,
  getSelection as getEditorSelection,
  getSelectionDOMRange,
} from './runtime-editor-api';
import { readRuntimeNode } from './runtime-live-state';
import {
  readRuntimeSelection,
  readRuntimeSelectionRange,
} from './runtime-selection-state';
import { resolveRetainedDropPoint } from './selection-projected-dom';

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
  explicitViewportBackedSelection?: boolean;
  repair?: EditableRepairRequest | null;
};

const clipboardResult = ({
  command,
  explicitViewportBackedSelection,
  repair,
}: EditableClipboardResult): EditableClipboardResult => ({
  command,
  explicitViewportBackedSelection,
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

const dropInputOf = (event: DragEvent<HTMLDivElement>) => ({
  altKey: event.altKey,
  clientX: event.clientX,
  clientY: event.clientY,
  ctrlKey: event.ctrlKey,
  dataTransfer: event.dataTransfer,
  target: event.target,
});

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

// Retained deleted text is not editable, so a drop over it lands at its edge.
const resolveRetainedDropRange = (
  editor: ReactRuntimeEditor,
  event: DragEvent<HTMLDivElement>
) => {
  const point = resolveRetainedDropPoint({
    editor,
    root: event.currentTarget,
    target: event.target,
    x: event.clientX,
    y: event.clientY,
  });
  return point ? { anchor: point, focus: point } : null;
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
  (ReactEditor.hasTarget(editor, event.target) ||
    (isDOMNode(event.target) &&
      !!readDOMFragmentTarget(event.target) &&
      event.currentTarget.contains(event.target))) &&
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
  const pliteHost = targetElement?.closest('[data-editor-node]');
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

  const node = ReactEditor.resolveNode(editor, target);
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

const resolveTextDropRangeFromEvent = (
  editor: ReactRuntimeEditor,
  event: DragEvent<HTMLDivElement>
) => {
  const target = resolveDragTarget(editor, event.target);

  if (!target || !TextApi.isText(target.node)) {
    return null;
  }

  const targetElement = isDOMText(event.nativeEvent.target)
    ? event.nativeEvent.target.parentElement
    : isDOMElement(event.nativeEvent.target)
      ? event.nativeEvent.target
      : null;
  const textHost = targetElement?.closest<HTMLElement>(
    '[data-editor-node="text"]'
  );

  if (!textHost) {
    return null;
  }

  const strings = getPliteTextHostStrings(textHost);
  const placement = getPliteStringCoordinatePlacement({
    event: {
      clientX: event.nativeEvent.clientX,
      clientY: event.nativeEvent.clientY,
    },
    includeInsideString: true,
    strings,
  });

  if (!placement) {
    return null;
  }

  const offset =
    placement.offset == null
      ? getPliteStringEdgeOffset({
          edge: placement.edge,
          rect: placement.rect,
          string: placement.string,
          textHost,
        })
      : getPliteStringDocumentOffset({
          offset: placement.offset,
          string: placement.string,
          textHost,
        });

  return offset == null
    ? null
    : editorRange(editor, {
        offset: Math.max(0, Math.min(target.node.text.length, offset)),
        path: target.path,
      });
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

const materializePasteTargetBoundaries = (
  editor: ReactRuntimeEditor,
  coverage: DOMCoverageSession | undefined
) => {
  const selection = getSelectionDOMRange(editor, getEditorSelection(editor));

  if (!selection) {
    return;
  }

  for (const boundary of coverage?.getBoundariesForRange(selection) ?? []) {
    if (boundary.selectionPolicy === 'materialize') {
      coverage?.materializeBoundary(boundary.boundaryId, 'paste', {
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
  const clipboardData = event.clipboardData ?? event.nativeEvent.clipboardData;

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

    editor.api.dom.clipboard.writeSelection(clipboardData);
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
  const clipboardData = event.clipboardData ?? event.nativeEvent.clipboardData;

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

    editor.api.dom.clipboard.writeSelection(clipboardData);
    const selection = readRuntimeSelection(editor);

    if (selection) {
      if (SelectionApi.isNode(selection)) {
        const command: EditableCommand = {
          direction: 'backward',
          kind: 'delete',
        };

        applyEditableCommand({ command, editor });

        return clipboardResult({
          command,
          repair: {
            focus: true,
            kind: 'sync-selection',
            selectionSourceTransition: {
              preferModelSelection: true,
              reason: 'model-command',
              selectionSource: 'model-owned',
            },
          },
        });
      }

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
        const collapsePointAnchor = editor.anchor(RangeApi.start(selection), {
          association: 'forward',
          deletion: 'nearest',
        });
        applyEditableCommand({ command, editor });
        writePliteViewSelection(editor, null);
        const collapsePoint = collapsePointAnchor.release();
        const shouldRemoveEmptyInline =
          inlinePath &&
          (() => {
            const inlineNode = editor.read(
              (state) => state.nodes.get(inlinePath)?.[0]
            );

            return (
              inlineNode &&
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
        const voidPath = PathApi.parent(selection.anchor.path);
        const previousPoint =
          voidPath.at(-1) === 0
            ? null
            : editorPoint(editor, PathApi.previous(voidPath), { edge: 'end' });

        editor.update((tx) => {
          tx.command(editorCommands.removeNodes, {
            options: { at: voidPath, voids: true },
          });
          if (previousPoint) {
            tx.command(editorCommands.select, {
              target: {
                anchor: previousPoint,
                focus: previousPoint,
              },
            });
          }
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

  clearDragSession(ReactEditor.getWindow(editor).document, editor);
  indicateDOMDropTarget(editor, null);
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
}): 'block' | boolean => {
  const session = readDragSession(
    ReactEditor.getWindow(editor).document,
    event.dataTransfer
  );
  // The editor's own drag is never external data for a handler to claim.
  const shouldHandleDragOver = shouldHandleEditorDragEvent({
    editor,
    event,
    handler: session ? undefined : onDragOver,
  });

  if (!shouldHandleDragOver) return false;

  if (session?.draggedBlock) {
    const target = resolveDOMDropTarget(editor, dropInputOf(event));
    const root = editor.api.dom.root();

    indicateDOMDropTarget(editor, target);
    // Always preventDefault for block drags to suppress the native text cursor,
    // even when no valid drop target is found.
    event.preventDefault();
    if (target) {
      event.dataTransfer.dropEffect = blockCopyIntent(
        session,
        dropInputOf(event)
      )
        ? 'copy'
        : 'move';
    } else {
      event.dataTransfer.dropEffect = 'none';
    }
    if (root) {
      getDragAutoScrollTarget({
        clientX: event.clientX,
        clientY: event.clientY,
        rootElement: root,
      })?.scroll();
    }

    return 'block';
  }

  if (state.isDraggingInternally) {
    event.dataTransfer.dropEffect = copyIntentOf(dropInputOf(event))
      ? 'copy'
      : 'move';
  }

  // Only when the target is void or retained, call `preventDefault` to
  // signal that drops are allowed. Editable content is droppable by
  // default, and calling `preventDefault` hides the cursor.
  const target = resolveDragTarget(editor, event.target);
  const node = target?.node;

  if (
    (node && NodeApi.isElement(node) && editorIsVoid(editor, node)) ||
    (isDOMNode(event.target) && readDOMFragmentTarget(event.target))
  ) {
    event.preventDefault();
  }

  return true;
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
    if (
      isDragSessionClaimed(
        ReactEditor.getWindow(editor).document,
        event.dataTransfer
      )
    ) {
      state.draggedBlock = true;
      state.draggedRange = null;
      state.isDraggingInternally = true;

      return;
    }

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
    let draggedRange = readRuntimeSelectionRange(editor);

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
    event.dataTransfer.effectAllowed = 'copyMove';

    editor.api.dom.clipboard.writeSelection(event.dataTransfer);

    const blockKey =
      voidEntry && draggedBlock ? editor.key(voidEntry[1]) : null;

    if (blockKey || (draggedRange && RangeApi.isExpanded(draggedRange))) {
      const voidHost =
        blockKey && voidEntry
          ? editor.api.dom.resolveDOMNode(voidEntry[0])
          : null;

      beginDragSession({
        copyOnly: false,
        dataTransfer: event.dataTransfer,
        document: ReactEditor.getWindow(editor).document,
        draggedBlock,
        hosts: voidHost ? [voidHost] : [],
        source: blockKey
          ? { keys: [blockKey], kind: 'nodes' }
          : {
              anchor: editor.anchor(draggedRange as Range, {
                association: 'inward',
                deletion: 'drop',
              }),
              kind: 'text',
            },
        sourceEditor: editor,
      });
    }
  }
};

const applySessionDrop = ({
  editor,
  event,
  reportDrop,
  session,
}: {
  editor: ReactRuntimeEditor;
  event: DragEvent<HTMLDivElement>;
  reportDrop: (outcome: TransferOutcome) => void;
  session: DragSession;
}): EditableClipboardResult => {
  const copy = session.draggedBlock
    ? blockCopyIntent(session, dropInputOf(event))
    : session.copyOnly || copyIntentOf(dropInputOf(event));
  const { transfer } = editor.api;
  const from = session.sourceEditor;
  const range =
    session.source.kind === 'text' ? session.source.anchor.resolve() : null;

  if (
    session.source.kind === 'text' &&
    (!range || RangeApi.isCollapsed(range))
  ) {
    reportDrop({ reason: 'source-missing', status: 'refused' });

    return clipboardResult({ command: null });
  }

  const payload =
    session.source.kind === 'nodes'
      ? { nodes: session.source.keys }
      : { range: range as Range };
  const dropPoint = (
    resolveRetainedDropRange(editor, event) ??
    resolveTextDropRangeFromEvent(editor, event) ??
    ReactEditor.resolveEventRange(editor, event)
  )?.anchor;
  const resolved = session.draggedBlock
    ? resolveDOMDropTarget(editor, dropInputOf(event), {
        copy,
        from,
        ...payload,
      })
    : null;
  const to = session.draggedBlock
    ? resolved && 'key' in resolved
      ? { edge: resolved.edge, key: resolved.key }
      : null
    : dropPoint
      ? { point: dropPoint }
      : null;

  if (!to) {
    reportDrop({ reason: 'policy', status: 'refused' });

    return clipboardResult({ command: null });
  }

  const outcome = (copy ? transfer.copy : transfer.move)({
    ...payload,
    from,
    to,
  });

  reportDrop(outcome);
  if (outcome.status === 'refused') return clipboardResult({ command: null });

  return clipboardResult({
    command: null,
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
};

export const applyEditableDrop = ({
  editor,
  event,
  onDrop,
  readOnly,
  reportDrop = () => {},
  runDrop = (drop) => drop(),
  state,
}: {
  editor: ReactRuntimeEditor;
  event: DragEvent<HTMLDivElement>;
  onDrop?: EditableDragHandler;
  readOnly: boolean;
  reportDrop?: (outcome: TransferOutcome) => void;
  runDrop?: <T>(drop: () => T) => T;
  state: EditableDragState;
}): EditableClipboardResult => {
  indicateDOMDropTarget(editor, null);

  if (readOnly && ReactEditor.hasEditableTarget(editor, event.target)) {
    isDragEventHandled({ event, handler: onDrop });
    event.preventDefault();
    event.stopPropagation();
    return clipboardResult({ command: null });
  }

  const { document } = ReactEditor.getWindow(editor);

  if (
    !readOnly &&
    shouldHandleEditorDragEvent({
      editor,
      event,
      handler: readDragSession(document, event.dataTransfer)
        ? undefined
        : onDrop,
    })
  ) {
    event.preventDefault();
    const session = takeDragSession({
      dataTransfer: event.dataTransfer,
      document,
      internal: state.isDraggingInternally,
      targetEditor: editor,
    });

    if (session === 'consumed') return clipboardResult({ command: null });
    if (session) {
      try {
        return applySessionDrop({ editor, event, reportDrop, session });
      } finally {
        settleDragSession(session);
      }
    }

    const range =
      resolveRetainedDropRange(editor, event) ??
      ReactEditor.resolveEventRange(editor, event);

    if (!range) return clipboardResult({ command: null });

    const data = event.dataTransfer;
    const command: EditableCommand = { data, kind: 'insert-data' };

    runDrop(() => {
      editor.update((tx) => {
        tx.selection.set(range);
        tx.command(domCommands.insertData, data);
      });
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

  return clipboardResult({ command: null });
};

export const applyEditablePaste = ({
  editor,
  event,
  onPaste,
  readOnly,
  viewportBackedSelection,
}: {
  editor: ReactRuntimeEditor;
  event: ClipboardEvent<HTMLDivElement>;
  onPaste?: EditablePasteHandler;
  readOnly: boolean;
  viewportBackedSelection: boolean;
}): EditableClipboardResult => {
  if (readOnly) {
    preventReadOnlyClipboardDefault({ editor, event, handler: onPaste });
    return clipboardResult({ command: null });
  }

  const canHandlePaste =
    ReactEditor.hasEditableTarget(editor, event.target) &&
    !isClipboardEventHandled({ event, handler: onPaste });

  if (
    canHandlePaste &&
    event.clipboardData &&
    SelectionApi.isNode(readRuntimeSelection(editor))
  ) {
    event.preventDefault();
    const command: EditableCommand = {
      data: event.clipboardData,
      kind: 'insert-data',
    };

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

  if (viewportBackedSelection && event.clipboardData && canHandlePaste) {
    event.preventDefault();
    materializePasteTargetBoundaries(
      editor,
      getMountedEditableDOMRuntime(editor, event.currentTarget)?.domCoverage
    );
    const command: EditableCommand = {
      data: event.clipboardData,
      kind: 'insert-data',
    };
    applyEditableCommand({ command, editor });
    return clipboardResult({
      command,
      explicitViewportBackedSelection: false,
      repair: { kind: 'repair-caret' },
    });
  }

  if (
    canHandlePaste &&
    (!supportsDOMBeforeInput(event) ||
      hasClipboardFiles(event.clipboardData) ||
      isPlainTextOnlyPaste(event.nativeEvent) ||
      isWebKitDOMHost(event))
  ) {
    // COMPAT: Certain browsers don't support the `beforeinput` event, so we
    // fall back to React's `onPaste` here instead.
    // COMPAT: Firefox, Chrome and Safari don't emit `beforeinput` events
    // when "paste without formatting" is used, so fallback. (2020/02/20)
    // COMPAT: Safari InputEvents generated by pasting won't include
    // application/x-editor-fragment items, so use the
    // ClipboardEvent here. (2023/03/15)
    event.preventDefault();
    materializePasteTargetBoundaries(
      editor,
      getMountedEditableDOMRuntime(editor, event.currentTarget)?.domCoverage
    );
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
