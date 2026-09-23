import type { KeyboardEvent } from 'react';

import {
  type EditorUpdatePolicyFor,
  type MoveUnit,
  NodeApi,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
} from '../..';
import { Hotkeys } from '../../dom';
import type { DOMCoverageSession, DOMPhaseScheduler } from '../../dom/internal';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { profilePliteReactDuration } from '../render-profiler';
import {
  createMainRootPliteViewSelection,
  readPliteViewSelection,
  type PliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import {
  getPointAtCoordinates,
  hasUsableRect,
  resolveUsableRangeRect,
} from './content-root-coordinate-navigation';
import {
  clamp,
  getPathElement,
  isPointOnVisualBoundaryLine,
} from './content-root-vertical-geometry';
import {
  getPlainVerticalDOMCoveragePlugin,
  getPlainVerticalLargeDocumentPlugin,
  shouldModelOwnPlainVerticalLargeDocumentPlugin,
} from './dom-coverage-vertical-selection';
import { getMountedEditableDOMRuntime } from './editable-dom-runtime';
import {
  getDocumentBoundaryKeyboardMove,
  isPlainVerticalDocumentBoundary,
} from './input-controller';
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
  getSelectableOwnerAncestorNodeSelection,
  getSelectableOwnerNodeSelection,
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
  coverage: DOMCoverageSession | undefined,
  selection: Range | null
) =>
  new Set(
    selection
      ? (coverage?.getBoundariesForRange(selection) ?? [])
          .filter((boundary) => boundary.selectionPolicy === 'skip')
          .map((boundary) => boundary.boundaryId)
      : []
  );

const largeDocumentVerticalSelectionUpdatePolicy = {
  tags: 'skip-scroll-into-view',
} satisfies EditorUpdatePolicyFor<ReactRuntimeEditor>;

const writeMainRootViewSelection = (
  editor: ReactRuntimeEditor,
  selection: Range | null,
  rootElement: HTMLElement | undefined,
  domPhaseScheduler: DOMPhaseScheduler
) => {
  const viewSelection = profilePliteReactDuration(
    'caret.main-root-view-selection.create',
    () =>
      selection && RangeApi.isExpanded(selection)
        ? createMainRootPliteViewSelection(
            selection,
            toInternalRoot(editor.read((state) => state.view.root()))
          )
        : null
  );

  profilePliteReactDuration('caret.main-root-view-selection.write', () => {
    writePliteViewSelection(editor, viewSelection);
  });
  profilePliteReactDuration(
    'caret.main-root-view-selection.clear-native',
    () => {
      clearNativeSelectionForViewSelection(
        viewSelection,
        rootElement,
        domPhaseScheduler
      );
    }
  );
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
  coverage,
  boundarySkipUnit,
  editor,
  preserveAnchorOnBoundarySkip,
  previousSelection,
  reverse,
}: {
  coverage: DOMCoverageSession | undefined;
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
    coverage,
    previousSelection
  );
  const focusedBoundary = coverage?.getBoundaryForPoint(nextSelection.focus);
  const enteredBoundary =
    focusedBoundary?.selectionPolicy === 'skip'
      ? focusedBoundary
      : (coverage?.getBoundariesForRange(nextSelection) ?? []).find(
          (boundary) =>
            boundary.selectionPolicy === 'skip' &&
            !previousBoundaryIds.has(boundary.boundaryId)
        );

  if (!enteredBoundary) {
    return;
  }

  const skipPoint = coverage?.getPointOutsideBoundary(
    enteredBoundary,
    nextSelection.focus,
    { reverse }
  );

  const focusPoint =
    skipPoint && preserveAnchorOnBoundarySkip && boundarySkipUnit
      ? getPointPastBoundarySkip({
          coverage,
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
  coverage,
  editor,
  point,
  reverse,
  unit,
}: {
  coverage: DOMCoverageSession | undefined;
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

    const boundary = coverage?.getBoundaryForPoint(next);

    if (boundary?.selectionPolicy !== 'skip') {
      return next;
    }

    const outside = coverage?.getPointOutsideBoundary(boundary, next, {
      reverse,
    });

    if (!outside) {
      return current;
    }

    current = outside;
  }

  return current;
};

const moveSelectionAndRespectBoundaries = ({
  coverage,
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
  coverage: DOMCoverageSession | undefined;
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
    coverage,
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

export const getSelectableOwnerVerticalNavigationTarget = ({
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
    const entersObjectCaption =
      event.key === 'ArrowDown' &&
      selection.paths.length === 1 &&
      lastPath &&
      getSelectableOwnerNodeSelection(editor, lastPath) &&
      editor.read((state) => {
        const owner = state.nodes.get(lastPath)?.[0];

        return owner ? state.schema.isObject(owner) : false;
      });
    const point = editor.read((state) =>
      event.key === 'ArrowUp'
        ? (state.points.before(firstPath) ?? state.points.start(firstPath))
        : lastPath
          ? entersObjectCaption
            ? state.points.start(lastPath)
            : (state.points.after(lastPath) ?? state.points.end(lastPath))
          : null
    );

    return point ? SelectionApi.text({ anchor: point, focus: point }) : null;
  }

  if (!SelectionApi.isText(selection) || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const getAdjacentOwner = (reverse: boolean) => {
    const adjacent = editor.read((state) => {
      const block = state.nodes.block({ at: selection.focus });
      const edge =
        block &&
        (reverse ? state.points.start(block[1]) : state.points.end(block[1]));
      const point =
        edge &&
        (reverse
          ? state.points.before(edge, { unit: 'offset' })
          : state.points.after(edge, { unit: 'offset' }));

      return block && edge && point
        ? { blockPath: block[1], edge, point }
        : null;
    });

    if (!adjacent) return null;

    const owner = getSelectableOwnerAncestorNodeSelection(
      editor,
      adjacent.point
    );

    if (!owner || PathApi.equals(owner.path, adjacent.blockPath)) return null;

    if (!PointApi.equals(selection.focus, adjacent.edge)) {
      try {
        const container = getPathElement(editor, adjacent.blockPath);
        const root =
          selection.focus.root ??
          toInternalRoot(editor.read((state) => state.view.root()));

        if (
          !container ||
          !isPointOnVisualBoundaryLine({
            container,
            direction: reverse ? 'backward' : 'forward',
            editor,
            point: selection.focus,
            root,
          })
        ) {
          return null;
        }
      } catch {
        return null;
      }
    }

    if (reverse) {
      const captionEnd = editor.read((state) => {
        const node = state.nodes.get(owner.path)?.[0];

        return node && NodeApi.string(node).length > 0
          ? state.points.end(owner.path)
          : null;
      });

      if (captionEnd) {
        const captionHost = getPathElement(editor, captionEnd.path);
        const sourceRect = resolveUsableRangeRect(editor, {
          anchor: selection.focus,
          focus: selection.focus,
        });
        const captionRect = captionHost?.getBoundingClientRect();
        const point =
          hasUsableRect(sourceRect) &&
          captionHost &&
          captionRect &&
          captionRect.width > 2 &&
          captionRect.height > 2
            ? getPointAtCoordinates(
                editor,
                clamp(
                  sourceRect.left,
                  captionRect.left + 1,
                  captionRect.right - 1
                ),
                captionRect.bottom - Math.min(captionRect.height / 2, 4),
                { target: captionHost }
              )
            : null;
        const target =
          point && PathApi.isDescendant(point.path, owner.path)
            ? point
            : captionEnd;

        return SelectionApi.text({ anchor: target, focus: target });
      }
    }

    return getSelectableOwnerNodeSelection(editor, owner.path);
  };

  if (event.key === 'ArrowDown') {
    return getAdjacentOwner(false);
  }

  const owner = getSelectableOwnerAncestorNodeSelection(
    editor,
    selection.focus
  );

  if (!owner) return getAdjacentOwner(true);

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

const getHorizontalModelReverse = (
  editor: ReactRuntimeEditor,
  event: Pick<KeyboardEvent<HTMLDivElement>, 'currentTarget' | 'key'>
) => {
  const directionHost = event.currentTarget?.closest<HTMLElement>('[dir]');
  const directionTarget =
    directionHost ?? event.currentTarget ?? editor.api.dom?.root();
  const rootIsRTL =
    directionHost?.dir === 'rtl' ||
    (directionTarget
      ? directionTarget.ownerDocument.defaultView?.getComputedStyle(
          directionTarget
        ).direction === 'rtl'
      : false);

  return rootIsRTL ? event.key === 'ArrowRight' : event.key === 'ArrowLeft';
};

export const getSelectableOwnerHorizontalNavigationTarget = ({
  editor,
  event,
  selection,
}: {
  editor: ReactRuntimeEditor;
  event: Pick<
    KeyboardEvent<HTMLDivElement>,
    'altKey' | 'ctrlKey' | 'currentTarget' | 'key' | 'metaKey' | 'shiftKey'
  >;
  selection: Range | Selection;
}) => {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
  ) {
    return null;
  }

  if (SelectionApi.isText(selection)) {
    if (!RangeApi.isCollapsed(selection)) return null;

    const insideText = editor.read((state) => {
      const node = state.nodes.get(selection.focus.path)?.[0];

      return (
        NodeApi.isText(node) &&
        selection.focus.offset > 0 &&
        selection.focus.offset < node.text.length
      );
    });

    if (insideText) return null;
  }

  const reverse = getHorizontalModelReverse(editor, event);

  if (SelectionApi.isNode(selection)) {
    const path = selection.paths[0];

    if (
      selection.paths.length !== 1 ||
      !path ||
      !getSelectableOwnerNodeSelection(editor, path) ||
      !editor.read((state) => {
        const node = state.nodes.get(path)?.[0];

        return node ? state.schema.isObject(node) : false;
      })
    ) {
      return null;
    }

    const point = editor.read((state) =>
      reverse ? state.points.before(path) : state.points.start(path)
    );

    if (!point) return null;

    return SelectionApi.text({ anchor: point, focus: point });
  }

  if (!SelectionApi.isText(selection)) return null;

  if (reverse) {
    if (selection.focus.offset > 0) return null;

    const owner = getSelectableOwnerAncestorNodeSelection(
      editor,
      selection.focus
    );

    return owner && PointApi.equals(selection.focus, owner.start)
      ? owner.selection
      : null;
  }

  const next = editor.read((state) => {
    const node = state.nodes.get(selection.focus.path)?.[0];

    if (NodeApi.isText(node) && selection.focus.offset < node.text.length) {
      return null;
    }

    return state.points.after(selection.focus, { unit: 'character' });
  });

  if (!next) return null;

  const nextOwner = getSelectableOwnerAncestorNodeSelection(editor, next);

  if (!nextOwner) return null;

  const owner = getSelectableOwnerAncestorNodeSelection(
    editor,
    selection.focus
  );

  return !owner || !PathApi.equals(owner.path, nextOwner.path)
    ? nextOwner.selection
    : null;
};

export const applyEditableCaretMovement = ({
  domPhaseScheduler,
  editor,
  event,
  ownerNavigationTarget,
  preferredX,
  selection,
  viewportRuntime,
}: {
  domPhaseScheduler: DOMPhaseScheduler;
  viewportRuntime: unknown;
  editor: ReactRuntimeEditor;
  event: KeyboardEvent<HTMLDivElement>;
  ownerNavigationTarget?: Selection;
  preferredX?: number;
  selection: Range | Selection;
}): EditableCaretMovementResult => {
  const { nativeEvent } = event;
  const runtime = getMountedEditableDOMRuntime(editor, event.currentTarget);
  const coverage = runtime?.domCoverage;
  const selectableOwnerTarget =
    ownerNavigationTarget === undefined
      ? (getSelectableOwnerHorizontalNavigationTarget({
          editor,
          event,
          selection,
        }) ??
        getSelectableOwnerVerticalNavigationTarget({
          editor,
          event,
          selection,
        }))
      : ownerNavigationTarget;

  if (selectableOwnerTarget) {
    event.preventDefault();
    writePliteViewSelection(editor, null);
    getMountedEditableDOMRuntime(editor)?.clearModelSelectionDOMPreference();
    dispatchCommand(editor, editorCommands.select, {
      target: selectableOwnerTarget,
    });

    return caretMovementHandled();
  }

  if (!RangeApi.isRange(selection)) {
    return caretMovementUnhandled();
  }

  if (
    isPlainVerticalDocumentBoundary({
      editor,
      event: nativeEvent,
      selection,
    })
  ) {
    event.preventDefault();
    return caretMovementHandled();
  }

  const ownerlessViewSelectionRange = profilePliteReactDuration(
    'caret.ownerless-view-selection-range',
    () => getOwnerlessViewSelectionRange(editor)
  );
  const largeDocumentVerticalSelection =
    ownerlessViewSelectionRange ?? selection;
  const plainVerticalLargeDocumentSelection = profilePliteReactDuration(
    'caret.should-model-own-plain-vertical-large-document',
    () =>
      shouldModelOwnPlainVerticalLargeDocumentPlugin({
        viewportRuntime,
        editor,
        event: nativeEvent,
        selection: largeDocumentVerticalSelection,
      })
  );
  const plainVerticalLargeDocumentPlugin = profilePliteReactDuration(
    'caret.get-plain-vertical-large-document-plugin',
    () =>
      getPlainVerticalLargeDocumentPlugin({
        viewportRuntime,
        editor,
        event: nativeEvent,
        forceModelMovement: ownerlessViewSelectionRange !== null,
        preferredX,
        selection: largeDocumentVerticalSelection,
      })
  );

  if (plainVerticalLargeDocumentPlugin) {
    event.preventDefault();
    const nextSelection = {
      anchor:
        largeDocumentVerticalSelection?.anchor ??
        plainVerticalLargeDocumentPlugin.target,
      focus: plainVerticalLargeDocumentPlugin.target,
    };
    profilePliteReactDuration('caret.large-document-select', () => {
      editor
        .update(largeDocumentVerticalSelectionUpdatePolicy)
        .selection.set(nextSelection);
    });
    profilePliteReactDuration('caret.large-document-view-selection', () => {
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

  const plainVerticalDOMCoveragePlugin = profilePliteReactDuration(
    'caret.get-plain-vertical-dom-coverage-plugin',
    () =>
      getPlainVerticalDOMCoveragePlugin({
        coverage,
        editor,
        event: nativeEvent,
        selection,
      })
  );

  if (plainVerticalDOMCoveragePlugin) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      coverage,
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.select, {
          target: {
            anchor: selection?.anchor ?? plainVerticalDOMCoveragePlugin.target,
            focus: plainVerticalDOMCoveragePlugin.target,
          },
        });
      },
      reverse: plainVerticalDOMCoveragePlugin.reverse,
      selection,
    });
    return caretMovementHandled();
  }

  const documentBoundaryMove = getDocumentBoundaryKeyboardMove(nativeEvent);

  if (documentBoundaryMove) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      coverage,
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
      coverage,
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
      coverage,
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
      coverage,
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
      coverage,
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
    const modelReverse = getHorizontalModelReverse(editor, event);
    const rootIsRTL = modelReverse !== reverse;

    moveSelectionAndRespectBoundaries({
      coverage,
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
                  coverage?.getBoundaryForPoint(logicalNext)
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
