import type { KeyboardEvent } from 'react';
import {
  type EditorUpdatePolicyFor,
  type MoveUnit,
  type Point,
  type Range,
  RangeApi,
} from '@platejs/plite';
import { Hotkeys } from '@platejs/plite-dom';
import {
  DOMCoverage,
  type DOMPhaseScheduler,
} from '@platejs/plite-dom/internal';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import {
  createMainRootPliteViewSelection,
  readPliteViewSelection,
  type PliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  getPlainVerticalDOMCoverageExtension,
  getPlainVerticalLargeDocumentExtension,
  shouldModelOwnPlainVerticalLargeDocumentExtension,
} from './dom-coverage-vertical-selection';
import { getDocumentBoundaryKeyboardMove } from './input-controller';
import type { EditableRepairRequest } from './mutation-controller';
import {
  before as editorBefore,
  after as editorAfter,
  dispatchCommand,
  editorCommands,
  failInvariant,
  toInternalRoot,
} from './runtime-editor-api';

export type EditableCaretMovementResult = {
  handled: boolean;
  repair?: EditableRepairRequest | null;
};

const selectionSyncRepair = ({
  forceRender = true,
  syncDOMSelection = true,
}: {
  forceRender?: boolean;
  syncDOMSelection?: boolean;
} = {}): EditableRepairRequest => ({
  focus: true,
  forceRender,
  kind: 'sync-selection',
  selectionSourceTransition: {
    preferModelSelection: true,
    reason: 'model-command',
    selectionSource: 'model-owned',
  },
  syncDOMSelection,
});

const caretMovementHandled = (
  options?: Parameters<typeof selectionSyncRepair>[0]
): EditableCaretMovementResult => ({
  handled: true,
  repair: selectionSyncRepair(options),
});

const caretMovementUnhandled = (): EditableCaretMovementResult => ({
  handled: false,
});

const getBoundarySelectionIds = (
  editor: ReactRuntimeEditor,
  selection: Range | null
) =>
  new Set(
    selection
      ? DOMCoverage.getBoundariesForRange(editor, selection)
          .filter((boundary) => boundary.selectionPolicy === 'skip')
          .map((boundary) => boundary.boundaryId)
      : []
  );

const largeDocumentVerticalSelectionUpdatePolicy = {
  tags: 'skip-scroll-into-view',
} satisfies EditorUpdatePolicyFor<ReactRuntimeEditor>;

const measureCaretPhase = <T>(id: string, run: () => T): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return run();
  }

  const startedAt = performance.now();

  try {
    return run();
  } finally {
    recordPliteReactRender({
      duration: performance.now() - startedAt,
      id,
      kind: 'runtime-time',
    });
  }
};

const writeMainRootViewSelection = (
  editor: ReactRuntimeEditor,
  selection: Range | null,
  rootElement: HTMLElement | undefined,
  domPhaseScheduler: DOMPhaseScheduler
) => {
  const viewSelection = measureCaretPhase(
    'caret.main-root-view-selection.create',
    () =>
      selection && RangeApi.isExpanded(selection)
        ? createMainRootPliteViewSelection(
            selection,
            toInternalRoot(editor.read((state) => state.view.root()))
          )
        : null
  );

  measureCaretPhase('caret.main-root-view-selection.write', () => {
    writePliteViewSelection(editor, viewSelection);
  });
  measureCaretPhase('caret.main-root-view-selection.clear-native', () => {
    clearNativeSelectionForViewSelection(
      viewSelection,
      rootElement,
      domPhaseScheduler
    );
  });
};

const clearNativeSelectionForViewSelection = (
  viewSelection: PliteViewSelection | null,
  rootElement: HTMLElement | undefined,
  domPhaseScheduler: DOMPhaseScheduler
) => {
  if (!viewSelection || !rootElement) {
    return;
  }

  const clear = () => {
    rootElement.ownerDocument.getSelection()?.removeAllRanges();
  };

  clear();
  domPhaseScheduler.schedule(
    'selection-repair',
    'clear-caret-view-selection-microtask',
    clear,
    { timing: 'microtask' }
  );
  domPhaseScheduler.schedule(
    'selection-repair',
    'clear-caret-view-selection-frame',
    clear,
    { timing: 'animation-frame' }
  );
};

const getOwnerlessViewSelectionRange = (
  editor: ReactRuntimeEditor
): Range | null => {
  const viewSelection = readPliteViewSelection(editor);

  if (
    !viewSelection ||
    viewSelection.anchor.owner ||
    viewSelection.focus.owner
  ) {
    return null;
  }

  return {
    anchor: viewSelection.anchor.point,
    focus: viewSelection.focus.point,
  };
};

const restoreSelectionIfMovementEnteredBoundary = ({
  boundarySkipUnit,
  editor,
  preserveAnchorOnBoundarySkip,
  previousSelection,
  reverse,
}: {
  boundarySkipUnit?: MoveUnit;
  editor: ReactRuntimeEditor;
  preserveAnchorOnBoundarySkip: boolean;
  previousSelection: Range | null;
  reverse: boolean;
}) => {
  const nextSelection = editor.read((state) => state.selection());

  if (
    !previousSelection ||
    !nextSelection ||
    RangeApi.equals(previousSelection, nextSelection)
  ) {
    return;
  }

  const previousBoundaryIds = getBoundarySelectionIds(
    editor,
    previousSelection
  );
  const focusedBoundary = DOMCoverage.getBoundaryForPoint(
    editor,
    nextSelection.focus
  );
  const enteredBoundary =
    focusedBoundary?.selectionPolicy === 'skip'
      ? focusedBoundary
      : DOMCoverage.getBoundariesForRange(editor, nextSelection).find(
          (boundary) =>
            boundary.selectionPolicy === 'skip' &&
            !previousBoundaryIds.has(boundary.boundaryId)
        );

  if (!enteredBoundary) {
    return;
  }

  const skipPoint = DOMCoverage.getPointOutsideBoundary(
    editor,
    enteredBoundary,
    nextSelection.focus,
    { reverse }
  );

  const focusPoint =
    skipPoint && preserveAnchorOnBoundarySkip && boundarySkipUnit
      ? getPointPastBoundarySkip({
          editor,
          point: skipPoint,
          reverse,
          unit: boundarySkipUnit,
        })
      : skipPoint;

  dispatchCommand(editor, editorCommands.select, {
    target: focusPoint
      ? {
          anchor: preserveAnchorOnBoundarySkip
            ? previousSelection.anchor
            : focusPoint,
          focus: focusPoint,
        }
      : previousSelection,
  });
};

const getPointPastBoundarySkip = ({
  editor,
  point,
  reverse,
  unit,
}: {
  editor: ReactRuntimeEditor;
  point: Point;
  reverse: boolean;
  unit: MoveUnit;
}): Point => {
  let current = point;

  for (let index = 0; index < 128; index++) {
    const next = reverse
      ? editorBefore(editor, current, { unit })
      : editorAfter(editor, current, { unit });

    if (!next) {
      return current;
    }

    const boundary = DOMCoverage.getBoundaryForPoint(editor, next);

    if (boundary?.selectionPolicy !== 'skip') {
      return next;
    }

    const outside = DOMCoverage.getPointOutsideBoundary(
      editor,
      boundary,
      next,
      {
        reverse,
      }
    );

    if (!outside) {
      return current;
    }

    current = outside;
  }

  return current;
};

const moveSelectionAndRespectBoundaries = ({
  boundarySkipUnit,
  domPhaseScheduler,
  editor,
  move,
  preserveAnchorOnBoundarySkip = false,
  reverse,
  selection,
  updatePolicy,
  writeViewSelection = false,
  viewSelectionRootElement,
}: {
  boundarySkipUnit?: MoveUnit;
  domPhaseScheduler: DOMPhaseScheduler;
  editor: ReactRuntimeEditor;
  move: () => void;
  preserveAnchorOnBoundarySkip?: boolean;
  reverse: boolean;
  selection: Range | null;
  updatePolicy?: EditorUpdatePolicyFor<ReactRuntimeEditor>;
  writeViewSelection?: boolean;
  viewSelectionRootElement?: HTMLElement;
}) => {
  writePliteViewSelection(editor, null);
  if (updatePolicy) {
    editor.update(updatePolicy, () => move());
  } else {
    editor.update(() => move());
  }
  restoreSelectionIfMovementEnteredBoundary({
    boundarySkipUnit,
    editor,
    preserveAnchorOnBoundarySkip,
    previousSelection: selection,
    reverse,
  });
  if (writeViewSelection) {
    writeMainRootViewSelection(
      editor,
      editor.read((state) => state.selection()),
      viewSelectionRootElement,
      domPhaseScheduler
    );
  }
};

export const applyEditableCaretMovement = ({
  domPhaseScheduler,
  editor,
  event,
  isRTL,
  selection,
  domStrategyRuntime,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  domStrategyRuntime: unknown;
  editor: ReactRuntimeEditor;
  event: KeyboardEvent<HTMLDivElement>;
  isRTL: boolean;
  selection: Range | null;
}): EditableCaretMovementResult => {
  const { nativeEvent } = event;
  const ownerlessViewSelectionRange = measureCaretPhase(
    'caret.ownerless-view-selection-range',
    () => getOwnerlessViewSelectionRange(editor)
  );
  const largeDocumentVerticalSelection =
    ownerlessViewSelectionRange ?? selection;
  const plainVerticalLargeDocumentSelection = measureCaretPhase(
    'caret.should-model-own-plain-vertical-large-document',
    () =>
      shouldModelOwnPlainVerticalLargeDocumentExtension({
        domStrategyRuntime,
        editor,
        event: nativeEvent,
        selection: largeDocumentVerticalSelection,
      })
  );
  const plainVerticalLargeDocumentExtension = measureCaretPhase(
    'caret.get-plain-vertical-large-document-extension',
    () =>
      getPlainVerticalLargeDocumentExtension({
        domStrategyRuntime,
        editor,
        event: nativeEvent,
        forceModelMovement: ownerlessViewSelectionRange !== null,
        selection: largeDocumentVerticalSelection,
      })
  );

  if (plainVerticalLargeDocumentExtension) {
    event.preventDefault();
    const nextSelection = {
      anchor:
        largeDocumentVerticalSelection?.anchor ??
        plainVerticalLargeDocumentExtension.target,
      focus: plainVerticalLargeDocumentExtension.target,
    };
    measureCaretPhase('caret.large-document-select', () => {
      editor
        .update(largeDocumentVerticalSelectionUpdatePolicy)
        .selection.set(nextSelection);
    });
    measureCaretPhase('caret.large-document-view-selection', () => {
      writeMainRootViewSelection(
        editor,
        nextSelection,
        event.currentTarget,
        domPhaseScheduler
      );
    });

    return caretMovementHandled({
      forceRender: false,
      syncDOMSelection: false,
    });
  }

  const plainVerticalDOMCoverageExtension = measureCaretPhase(
    'caret.get-plain-vertical-dom-coverage-extension',
    () =>
      getPlainVerticalDOMCoverageExtension({
        editor,
        event: nativeEvent,
        selection,
      })
  );

  if (plainVerticalDOMCoverageExtension) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.select, {
          target: {
            anchor:
              selection?.anchor ?? plainVerticalDOMCoverageExtension.target,
            focus: plainVerticalDOMCoverageExtension.target,
          },
        });
      },
      reverse: plainVerticalDOMCoverageExtension.reverse,
      selection,
    });
    return caretMovementHandled();
  }

  const documentBoundaryMove = getDocumentBoundaryKeyboardMove(nativeEvent);

  if (documentBoundaryMove) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        const point = editor.read((state) =>
          documentBoundaryMove.reverse
            ? (state.points.start([]) ??
              failInvariant(
                'Expected a document start point for caret movement'
              ))
            : (state.points.end([]) ??
              failInvariant('Expected a document end point for caret movement'))
        );

        dispatchCommand(editor, editorCommands.select, {
          target: documentBoundaryMove.extend
            ? { anchor: selection?.anchor ?? point, focus: point }
            : { anchor: point, focus: point },
        });
      },
      preserveAnchorOnBoundarySkip: documentBoundaryMove.extend,
      reverse: documentBoundaryMove.reverse,
      selection,
    });
    return caretMovementHandled();
  }

  // COMPAT: Certain browsers don't handle the selection updates properly.
  // In Chrome, the selection isn't properly extended. In Firefox, the
  // selection isn't properly collapsed. (2017/10/17)
  if (Hotkeys.isMoveLineBackward(nativeEvent)) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.move, {
          options: { reverse: true, unit: 'line' },
        });
      },
      reverse: true,
      selection,
      updatePolicy: plainVerticalLargeDocumentSelection
        ? largeDocumentVerticalSelectionUpdatePolicy
        : undefined,
      writeViewSelection: plainVerticalLargeDocumentSelection,
      viewSelectionRootElement: event.currentTarget,
    });
    return caretMovementHandled();
  }

  if (Hotkeys.isMoveLineForward(nativeEvent)) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.move, {
          options: { unit: 'line' },
        });
      },
      reverse: false,
      selection,
      updatePolicy: plainVerticalLargeDocumentSelection
        ? largeDocumentVerticalSelectionUpdatePolicy
        : undefined,
      writeViewSelection: plainVerticalLargeDocumentSelection,
      viewSelectionRootElement: event.currentTarget,
    });
    return caretMovementHandled();
  }

  if (Hotkeys.isExtendLineBackward(nativeEvent)) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.move, {
          options: { edge: 'focus', reverse: true, unit: 'line' },
        });
      },
      boundarySkipUnit: 'line',
      preserveAnchorOnBoundarySkip: true,
      reverse: true,
      selection,
      updatePolicy: plainVerticalLargeDocumentSelection
        ? largeDocumentVerticalSelectionUpdatePolicy
        : undefined,
      writeViewSelection: plainVerticalLargeDocumentSelection,
      viewSelectionRootElement: event.currentTarget,
    });
    return caretMovementHandled();
  }

  if (Hotkeys.isExtendLineForward(nativeEvent)) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.move, {
          options: { edge: 'focus', unit: 'line' },
        });
      },
      boundarySkipUnit: 'line',
      preserveAnchorOnBoundarySkip: true,
      reverse: false,
      selection,
      updatePolicy: plainVerticalLargeDocumentSelection
        ? largeDocumentVerticalSelectionUpdatePolicy
        : undefined,
      writeViewSelection: plainVerticalLargeDocumentSelection,
      viewSelectionRootElement: event.currentTarget,
    });
    return caretMovementHandled();
  }

  if (Hotkeys.isExtendBackward(nativeEvent)) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.move, {
          options: { edge: 'focus', reverse: !isRTL },
        });
      },
      boundarySkipUnit: 'character',
      preserveAnchorOnBoundarySkip: true,
      reverse: !isRTL,
      selection,
    });
    return caretMovementHandled();
  }

  if (Hotkeys.isExtendForward(nativeEvent)) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.move, {
          options: { edge: 'focus', reverse: isRTL },
        });
      },
      boundarySkipUnit: 'character',
      preserveAnchorOnBoundarySkip: true,
      reverse: isRTL,
      selection,
    });
    return caretMovementHandled();
  }

  if (Hotkeys.isExtendWordBackward(nativeEvent)) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.move, {
          options: { edge: 'focus', reverse: !isRTL, unit: 'word' },
        });
      },
      boundarySkipUnit: 'word',
      preserveAnchorOnBoundarySkip: true,
      reverse: !isRTL,
      selection,
    });
    return caretMovementHandled();
  }

  if (Hotkeys.isExtendWordForward(nativeEvent)) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.move, {
          options: { edge: 'focus', reverse: isRTL, unit: 'word' },
        });
      },
      boundarySkipUnit: 'word',
      preserveAnchorOnBoundarySkip: true,
      reverse: isRTL,
      selection,
    });
    return caretMovementHandled();
  }

  // COMPAT: If a void node is selected, or a zero-width text node adjacent to
  // an inline is selected, browsers can't reliably skip over the void node with
  // the zero-width space not being an empty string.
  if (Hotkeys.isMoveBackward(nativeEvent)) {
    event.preventDefault();

    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        if (selection && RangeApi.isCollapsed(selection)) {
          dispatchCommand(editor, editorCommands.move, {
            options: { reverse: !isRTL },
          });
        } else if (selection) {
          dispatchCommand(editor, editorCommands.select, {
            target: isRTL ? RangeApi.end(selection) : RangeApi.start(selection),
          });
        }
      },
      reverse: !isRTL,
      selection,
    });

    return caretMovementHandled();
  }

  if (Hotkeys.isMoveForward(nativeEvent)) {
    event.preventDefault();

    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        if (selection && RangeApi.isCollapsed(selection)) {
          dispatchCommand(editor, editorCommands.move, {
            options: { reverse: isRTL },
          });
        } else if (selection) {
          dispatchCommand(editor, editorCommands.select, {
            target: isRTL ? RangeApi.start(selection) : RangeApi.end(selection),
          });
        }
      },
      reverse: isRTL,
      selection,
    });

    return caretMovementHandled();
  }

  if (Hotkeys.isMoveWordBackward(nativeEvent)) {
    event.preventDefault();

    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        if (selection && RangeApi.isExpanded(selection)) {
          dispatchCommand(editor, editorCommands.select, {
            target: selection.focus,
          });
        }

        dispatchCommand(editor, editorCommands.move, {
          options: { reverse: !isRTL, unit: 'word' },
        });
      },
      reverse: !isRTL,
      selection,
    });
    return caretMovementHandled();
  }

  if (Hotkeys.isMoveWordForward(nativeEvent)) {
    event.preventDefault();

    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        if (selection && RangeApi.isExpanded(selection)) {
          dispatchCommand(editor, editorCommands.select, {
            target: selection.focus,
          });
        }

        dispatchCommand(editor, editorCommands.move, {
          options: { reverse: isRTL, unit: 'word' },
        });
      },
      reverse: isRTL,
      selection,
    });
    return caretMovementHandled();
  }

  return caretMovementUnhandled();
};
