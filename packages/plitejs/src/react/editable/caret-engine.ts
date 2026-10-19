import type { KeyboardEvent } from 'react';

import {
  type EditorUpdatePolicyFor,
  type MoveUnit,
  NodeApi,
  type NodeSelection,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
} from '../..';
import { Hotkeys } from '../../dom';
import {
  type DOMCoverageSession,
  type DOMPhaseScheduler,
  getLineBoundaryKeyboardMove,
} from '../../dom/internal';
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
import { getLineBoundarySelection } from './line-boundary';
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

// Apps own their copied caption UI and may hide child text in any state, so
// whether it is drawn comes from the mounted DOM, not from its model text.
const isObjectTextDrawn = (
  editor: ReactRuntimeEditor,
  ownerPath: Path,
  textPath: Path
) => {
  const owner = getPathElement(editor, ownerPath);
  const text = getPathElement(editor, textPath);
  const view = text?.ownerDocument.defaultView;

  if (!owner || !text || !view) return false;

  const { visibility } = view.getComputedStyle(text);

  if (visibility === 'hidden' || visibility === 'collapse') return false;

  for (
    let current: HTMLElement | null = text;
    current;
    current = current.parentElement
  ) {
    const { contentVisibility, display } = view.getComputedStyle(current);

    if (display === 'none' || contentVisibility === 'hidden') return false;
    if (current === owner) return true;
  }

  return false;
};

// Child text the page does not draw has no keyboard stop, so an empty caption
// the stock UI hides is skipped in both directions (EDIT-CAPTION-NAV-003).
const getObjectReverseEntryTarget = (
  editor: ReactRuntimeEditor,
  point: Point
) => {
  const owner = getSelectableOwnerAncestorNodeSelection(editor, point);

  if (!owner || !getPathElement(editor, owner.path)) return null;

  return isObjectTextDrawn(editor, owner.path, point.path)
    ? SelectionApi.text({ anchor: point, focus: point })
    : owner.selection;
};

const getStepPastTarget = (editor: ReactRuntimeEditor, path: Path) => {
  const after = editor.read((state) => state.points.after(path));

  return after
    ? (getSelectableOwnerAncestorNodeSelection(editor, after)?.selection ??
        SelectionApi.text({ anchor: after, focus: after }))
    : null;
};

const getObjectOwnerForwardTarget = (
  editor: ReactRuntimeEditor,
  path: Path
) => {
  const start = editor.read((state) => state.points.start(path));

  return start && isObjectTextDrawn(editor, path, start.path)
    ? SelectionApi.text({ anchor: start, focus: start })
    : (getStepPastTarget(editor, path) ??
        getSelectableOwnerNodeSelection(editor, path));
};

const isObjectPath = (editor: ReactRuntimeEditor, path: Path) =>
  editor.read((state) => {
    const node = state.nodes.get(path)?.[0];

    return node ? state.schema.isObject(node) : false;
  });

const getNodeSelectionExitTarget = (
  editor: ReactRuntimeEditor,
  selection: NodeSelection,
  reverse: boolean
) => {
  if (!reverse) {
    return getStepPastTarget(
      editor,
      selection.paths.at(-1) ?? selection.paths[0]
    );
  }

  const point = editor.read((state) => state.points.before(selection.paths[0]));

  return point
    ? (getObjectReverseEntryTarget(editor, point) ??
        SelectionApi.text({ anchor: point, focus: point }))
    : null;
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
    const lastPath = selection.paths.at(-1) ?? firstPath;

    if (
      event.key === 'ArrowDown' &&
      selection.mode === 'object' &&
      isObjectPath(editor, lastPath)
    ) {
      return getObjectOwnerForwardTarget(editor, lastPath);
    }

    const exit = getNodeSelectionExitTarget(
      editor,
      selection,
      event.key === 'ArrowUp'
    );

    if (exit) return exit;

    const edge = editor.read((state) =>
      event.key === 'ArrowUp'
        ? state.points.start(firstPath)
        : state.points.end(lastPath)
    );

    if (!edge) return null;

    return event.key === 'ArrowUp'
      ? (getObjectReverseEntryTarget(editor, edge) ??
          SelectionApi.text({ anchor: edge, focus: edge }))
      : SelectionApi.text({ anchor: edge, focus: edge });
  }

  if (!SelectionApi.isText(selection) || !RangeApi.isCollapsed(selection)) {
    return null;
  }

  const getAdjacentTarget = (reverse: boolean) => {
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

    const ancestorOwner = getSelectableOwnerAncestorNodeSelection(
      editor,
      adjacent.point
    );
    const owner =
      ancestorOwner && !PathApi.equals(ancestorOwner.path, adjacent.blockPath)
        ? ancestorOwner
        : null;
    // Browsers do not move a native caret into a nested editing host, so text
    // under a 'model' coverage boundary, such as an external text view, is
    // entered by setting the model selection.
    const modelSelectedText =
      !owner &&
      getMountedEditableDOMRuntime(editor)
        ?.domCoverage.getBoundariesForRange({
          anchor: adjacent.point,
          focus: adjacent.point,
        })
        .some(({ selectionPolicy }) => selectionPolicy === 'model');

    if (!owner && !modelSelectedText) return null;

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

    if (!owner) {
      return SelectionApi.text({
        anchor: adjacent.point,
        focus: adjacent.point,
      });
    }

    if (reverse) {
      const captionEnd = editor.read((state) => state.points.end(owner.path));

      if (
        captionEnd &&
        isObjectTextDrawn(editor, owner.path, captionEnd.path)
      ) {
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
    return getAdjacentTarget(false);
  }

  const owner = getSelectableOwnerAncestorNodeSelection(
    editor,
    selection.focus
  );

  if (!owner) return getAdjacentTarget(true);

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
  event: Pick<KeyboardEvent<HTMLDivElement>, 'currentTarget' | 'key'>,
  selection: Range | Selection
) => {
  const directionNode = editor.read((state) =>
    SelectionApi.isNode(selection)
      ? state.nodes.get(selection.focusPath)?.[0]
      : selection
        ? state.nodes.block({ at: selection.focus, mode: 'lowest' })?.[0]
        : undefined
  );
  const directionTarget =
    (directionNode && editor.api.dom?.resolveDOMNode(directionNode)) ??
    event.currentTarget ??
    editor.api.dom?.root();
  const isRTL = directionTarget
    ? directionTarget.ownerDocument.defaultView?.getComputedStyle(
        directionTarget
      ).direction === 'rtl'
    : false;

  return isRTL ? event.key === 'ArrowRight' : event.key === 'ArrowLeft';
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

  const reverse = getHorizontalModelReverse(editor, event, selection);

  if (SelectionApi.isNode(selection)) {
    const path = selection.paths[0];

    if (selection.mode === 'block') {
      return (
        getNodeSelectionExitTarget(editor, selection, reverse) ?? selection
      );
    }
    if (!isObjectPath(editor, path)) return null;

    if (!reverse) return getObjectOwnerForwardTarget(editor, path);

    const point = editor.read((state) => state.points.before(path));

    if (!point) return null;

    return (
      getObjectReverseEntryTarget(editor, point) ??
      SelectionApi.text({ anchor: point, focus: point })
    );
  }

  if (!SelectionApi.isText(selection)) return null;

  if (reverse) {
    if (selection.focus.offset > 0) return null;

    const owner = getSelectableOwnerAncestorNodeSelection(
      editor,
      selection.focus
    );

    if (owner) {
      return PointApi.equals(selection.focus, owner.start)
        ? owner.selection
        : null;
    }

    const previous = editor.read((state) =>
      state.points.before(selection.focus, { unit: 'character' })
    );

    return previous ? getObjectReverseEntryTarget(editor, previous) : null;
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

const getVisibleOwnerTarget = (
  coverage: DOMCoverageSession | undefined,
  target: Selection,
  reverse: boolean
) => {
  if (!SelectionApi.isText(target)) return target;

  const boundary = coverage
    ?.getBoundariesForRange(target)
    .find(({ selectionPolicy }) => selectionPolicy === 'skip');

  if (!boundary) return target;

  const outside = coverage?.getPointOutsideBoundary(boundary, target.focus, {
    reverse,
  });

  return outside
    ? SelectionApi.text({ anchor: outside, focus: outside })
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
    const target = getVisibleOwnerTarget(
      coverage,
      selectableOwnerTarget,
      nativeEvent.key === 'ArrowUp' ||
        (nativeEvent.key !== 'ArrowDown' &&
          getHorizontalModelReverse(editor, event, selection))
    );

    if (!target) return caretMovementHandled();
    const landing =
      (nativeEvent.key === 'ArrowDown' || nativeEvent.key === 'ArrowUp') &&
      preferredX !== undefined &&
      SelectionApi.isText(target) &&
      RangeApi.isCollapsed(target)
        ? runtime?.externalText.verticalEntryPoint(
            target.focus,
            nativeEvent.key === 'ArrowDown' ? 'start' : 'end',
            preferredX
          )
        : null;
    writePliteViewSelection(editor, null);
    getMountedEditableDOMRuntime(editor)?.clearModelSelectionDOMPreference();
    dispatchCommand(editor, editorCommands.select, {
      target: landing
        ? SelectionApi.text({ anchor: landing, focus: landing })
        : target,
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

  const lineBoundaryMove = getLineBoundaryKeyboardMove(nativeEvent);

  if (lineBoundaryMove) {
    event.preventDefault();
    moveSelectionAndRespectBoundaries({
      coverage,
      domPhaseScheduler,
      editor,
      move: () => {
        dispatchCommand(editor, editorCommands.select, {
          target: getLineBoundarySelection(editor, selection, lineBoundaryMove),
        });
      },
      preserveAnchorOnBoundarySkip: lineBoundaryMove.extend,
      reverse: lineBoundaryMove.reverse,
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
    const modelReverse = getHorizontalModelReverse(editor, event, selection);
    const isRTL = modelReverse !== reverse;

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
          dispatchCommand(editor, editorCommands.select, {
            target: modelReverse
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

          return isRTL || (block && hasVisualBidiText(NodeApi.string(block)));
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
