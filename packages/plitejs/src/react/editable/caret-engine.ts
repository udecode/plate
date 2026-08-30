import type { KeyboardEvent } from 'react';

import {
  type EditorUpdatePolicyFor,
  type MoveUnit,
  NodeApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
} from '../..';
import { Hotkeys } from '../../dom';
import { DOMCoverage, type DOMPhaseScheduler } from '../../dom/internal';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import {
  createMainRootPliteViewSelection,
  readPliteViewSelection,
  type PliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  getPathElement,
  isPointOnVisualBoundaryLine,
} from './content-root-vertical-geometry';
import {
  getPlainVerticalDOMCoverageExtension,
  getPlainVerticalLargeDocumentExtension,
  shouldModelOwnPlainVerticalLargeDocumentExtension,
} from './dom-coverage-vertical-selection';
import { getMountedEditableDOMRuntime } from './editable-dom-runtime';
import { getDocumentBoundaryKeyboardMove } from './input-controller';
import type { EditableRepairRequest } from './mutation-controller';
import {
  before as editorBefore,
  after as editorAfter,
  dispatchCommand,
  editorCommands,
  failInvariant,
  getSelection as getEditorSelection,
  getSelectionDOMRange,
  toInternalRoot,
} from './runtime-editor-api';
import {
  getKeyboardSelectableAncestorNodeSelection,
  getKeyboardSelectableNodeSelection,
} from './selection-void-target';

export type EditableCaretMovementResult = {
  handled: boolean;
  repair?: EditableRepairRequest | null;
};

type TextDirection = 'ltr' | 'neutral' | 'rtl';

const BIDI_CONTROL_MATCHER = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
const LETTER_MATCHER = /\p{L}/u;
const RTL_SCRIPT_MATCHERS = [
  'Adlam',
  'Arabic',
  'Avestan',
  'Chorasmian',
  'Elymaic',
  'Hanifi_Rohingya',
  'Hatran',
  'Hebrew',
  'Imperial_Aramaic',
  'Inscriptional_Pahlavi',
  'Inscriptional_Parthian',
  'Lydian',
  'Mandaic',
  'Manichaean',
  'Mende_Kikakui',
  'Meroitic_Cursive',
  'Meroitic_Hieroglyphs',
  'Nabataean',
  'Nko',
  'Old_Hungarian',
  'Old_North_Arabian',
  'Old_Sogdian',
  'Old_South_Arabian',
  'Old_Uyghur',
  'Palmyrene',
  'Phoenician',
  'Psalter_Pahlavi',
  'Samaritan',
  'Sogdian',
  'Syriac',
  'Thaana',
  'Yezidi',
]
  .map((script) => {
    try {
      return new RegExp(`\\p{Script=${script}}`, 'u');
    } catch {
      return null;
    }
  })
  .filter((matcher): matcher is RegExp => matcher !== null);

const hasVisualBidiText = (value: string) =>
  BIDI_CONTROL_MATCHER.test(value) ||
  Array.from(value).some((character) =>
    RTL_SCRIPT_MATCHERS.some((matcher) => matcher.test(character))
  );

export const getTextDirection = (value: string): TextDirection => {
  for (const character of value) {
    if (
      LETTER_MATCHER.test(character) &&
      RTL_SCRIPT_MATCHERS.some((matcher) => matcher.test(character))
    ) {
      return 'rtl';
    }

    if (LETTER_MATCHER.test(character)) {
      return 'ltr';
    }
  }

  return 'neutral';
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
    editor.update(updatePolicy, () => {
      move();
    });
  } else {
    editor.update(() => {
      move();
    });
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
      getSelectionDOMRange(editor, getEditorSelection(editor)),
      viewSelectionRootElement,
      domPhaseScheduler
    );
  }
};

export const getKeyboardSelectableVerticalNavigationTarget = ({
  editor,
  event,
  selection,
}: {
  editor: ReactRuntimeEditor;
  event: Pick<
    KeyboardEvent<HTMLDivElement>,
    'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
  >;
  selection: Range | Selection;
}) => {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')
  ) {
    return null;
  }

  if (SelectionApi.isNode(selection)) {
    const firstPath = selection.paths[0];
    const lastPath = selection.paths.at(-1);
    const entersKeyboardSelectableOwner =
      event.key === 'ArrowDown' &&
      selection.paths.length === 1 &&
      lastPath &&
      getKeyboardSelectableNodeSelection(editor, lastPath);
    const point = editor.read((state) =>
      event.key === 'ArrowUp'
        ? (state.points.before(firstPath) ?? state.points.start(firstPath))
        : lastPath
          ? entersKeyboardSelectableOwner
            ? state.points.start(lastPath)
            : (state.points.after(lastPath) ?? state.points.end(lastPath))
          : null
    );

    return point ? SelectionApi.text({ anchor: point, focus: point }) : null;
  }

  if (
    event.key !== 'ArrowUp' ||
    !SelectionApi.isText(selection) ||
    !RangeApi.isCollapsed(selection)
  ) {
    return null;
  }

  const owner = getKeyboardSelectableAncestorNodeSelection(
    editor,
    selection.focus
  );

  if (!owner) return null;

  if (PointApi.equals(selection.focus, owner.start)) {
    return owner.selection;
  }

  try {
    const container = getPathElement(editor, owner.path);
    const root =
      selection.focus.root ??
      toInternalRoot(editor.read((state) => state.view.root()));

    return container &&
      isPointOnVisualBoundaryLine({
        container,
        direction: 'backward',
        editor,
        point: selection.focus,
        root,
      })
      ? owner.selection
      : null;
  } catch {
    return null;
  }
};

export const applyEditableCaretMovement = ({
  domPhaseScheduler,
  editor,
  event,
  preferredX,
  selection,
  domStrategyRuntime,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  domStrategyRuntime: unknown;
  editor: ReactRuntimeEditor;
  event: KeyboardEvent<HTMLDivElement>;
  preferredX?: number;
  selection: Range | Selection;
}): EditableCaretMovementResult => {
  const { nativeEvent } = event;
  const keyboardSelectableTarget =
    getKeyboardSelectableVerticalNavigationTarget({
      editor,
      event,
      selection,
    });

  if (keyboardSelectableTarget) {
    event.preventDefault();
    writePliteViewSelection(editor, null);
    getMountedEditableDOMRuntime(editor)?.clearModelSelectionDOMPreference();
    dispatchCommand(editor, editorCommands.select, {
      target: keyboardSelectableTarget,
    });

    return caretMovementHandled();
  }

  if (!RangeApi.isRange(selection)) {
    return caretMovementUnhandled();
  }

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
        preferredX,
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

  const horizontal = Hotkeys.isExtendBackward(nativeEvent)
    ? { direction: 'left' as const, extend: true, unit: 'character' as const }
    : Hotkeys.isExtendForward(nativeEvent)
      ? {
          direction: 'right' as const,
          extend: true,
          unit: 'character' as const,
        }
      : Hotkeys.isExtendWordBackward(nativeEvent)
        ? { direction: 'left' as const, extend: true, unit: 'word' as const }
        : Hotkeys.isExtendWordForward(nativeEvent)
          ? { direction: 'right' as const, extend: true, unit: 'word' as const }
          : Hotkeys.isMoveBackward(nativeEvent)
            ? {
                direction: 'left' as const,
                extend: false,
                unit: 'character' as const,
              }
            : Hotkeys.isMoveForward(nativeEvent)
              ? {
                  direction: 'right' as const,
                  extend: false,
                  unit: 'character' as const,
                }
              : Hotkeys.isMoveWordBackward(nativeEvent)
                ? {
                    direction: 'left' as const,
                    extend: false,
                    unit: 'word' as const,
                  }
                : Hotkeys.isMoveWordForward(nativeEvent)
                  ? {
                      direction: 'right' as const,
                      extend: false,
                      unit: 'word' as const,
                    }
                  : null;

  if (horizontal) {
    event.preventDefault();
    const reverse = horizontal.direction === 'left';
    const { currentTarget } = event;
    const directionHost = currentTarget?.closest<HTMLElement>('[dir]');
    const directionTarget =
      directionHost ?? currentTarget ?? editor.api.dom?.root();
    const rootIsRTL =
      directionHost?.dir === 'rtl' ||
      (directionTarget
        ? directionTarget.ownerDocument.defaultView?.getComputedStyle(
            directionTarget
          ).direction === 'rtl'
        : false);
    const modelReverse = rootIsRTL ? !reverse : reverse;

    moveSelectionAndRespectBoundaries({
      domPhaseScheduler,
      editor,
      move: () => {
        if (!selection) return;
        if (
          !horizontal.extend &&
          horizontal.unit === 'character' &&
          RangeApi.isExpanded(selection)
        ) {
          const root = editor.api.dom?.root();
          const isRTL =
            root?.ownerDocument.defaultView?.getComputedStyle(root)
              .direction === 'rtl';
          const useStart =
            horizontal.direction === 'left' ? !isRTL : Boolean(isRTL);

          dispatchCommand(editor, editorCommands.select, {
            target: useStart
              ? RangeApi.start(selection)
              : RangeApi.end(selection),
          });
          return;
        }

        const usesVisualBidiOrder = editor.read((state) => {
          const block = state.nodes.block({
            at: selection.focus,
            mode: 'lowest',
          })?.[0];

          return (
            rootIsRTL || (block && hasVisualBidiText(NodeApi.string(block)))
          );
        });

        if (!usesVisualBidiOrder) {
          dispatchCommand(editor, editorCommands.move, {
            options: {
              edge: horizontal.extend ? 'focus' : undefined,
              reverse: modelReverse,
              unit: horizontal.unit,
            },
          });
          return;
        }

        const visualNext = editor.api.dom?.resolveVisualPoint(selection.focus, {
          affinity: SelectionApi.isText(selection)
            ? selection.affinity
            : undefined,
          direction: horizontal.direction,
          unit: horizontal.unit,
        });
        const next =
          visualNext && horizontal.unit === 'character'
            ? editor.read((state) => {
                const logicalNext = PointApi.isBefore(
                  selection.focus,
                  visualNext.point
                )
                  ? state.points.after(selection.focus, { unit: 'character' })
                  : PointApi.isAfter(selection.focus, visualNext.point)
                    ? state.points.before(selection.focus, {
                        unit: 'character',
                      })
                    : undefined;

                if (!logicalNext) {
                  return visualNext;
                }

                const enteredNonSelectable = state.nodes.above({
                  at: visualNext.point,
                  match: (node) =>
                    NodeApi.isElement(node) && !state.nodes.isSelectable(node),
                  mode: 'highest',
                  voids: true,
                });

                if (PointApi.equals(logicalNext, visualNext.point)) {
                  return visualNext;
                }

                const crossedInlineVoid = state.nodes.above({
                  at: logicalNext,
                  match: (node) =>
                    NodeApi.isElement(node) &&
                    state.schema.isInline(node) &&
                    state.schema.isVoid(node),
                  mode: 'lowest',
                  voids: true,
                });

                return enteredNonSelectable ||
                  crossedInlineVoid ||
                  DOMCoverage.getBoundaryForPoint(editor, logicalNext)
                  ? { ...visualNext, point: logicalNext }
                  : visualNext;
              })
            : visualNext;

        if (next) {
          dispatchCommand(editor, editorCommands.select, {
            target: SelectionApi.isText(selection)
              ? {
                  ...selection,
                  affinity: next.affinity,
                  anchor: horizontal.extend ? selection.anchor : next.point,
                  focus: next.point,
                }
              : {
                  anchor: horizontal.extend ? selection.anchor : next.point,
                  focus: next.point,
                },
          });
          return;
        }

        dispatchCommand(editor, editorCommands.move, {
          options: {
            edge: horizontal.extend ? 'focus' : undefined,
            reverse: modelReverse,
            unit: horizontal.unit,
          },
        });
      },
      boundarySkipUnit: horizontal.unit,
      preserveAnchorOnBoundarySkip: horizontal.extend,
      reverse: modelReverse,
      selection,
    });
    return caretMovementHandled();
  }

  return caretMovementUnhandled();
};
