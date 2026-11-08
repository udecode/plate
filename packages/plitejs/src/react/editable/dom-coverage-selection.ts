import {
  NodeApi,
  type Point,
  RangeApi,
  type Range as ModelRange,
  type Selection,
  SelectionApi,
} from '../..';
import { getEditorRuntime } from '../../core/editor-runtime';
import { getRangeBreakCount } from '../../core/view-carets';
import { getSelection } from '../../dom';
import { isSoftLineTextStale } from '../../dom/dom-soft-line-end';
import type {
  DOMCoverageBoundary,
  DOMCoverageSession,
} from '../../dom/internal';
import { resolveDOMRangeInRoot } from '../../dom/plugin/dom-editor';
import {
  type DOMSelectionPoints,
  getDOMRangeSelectionPoints,
  readDOMSelectionPoints,
  readsSelectionAsHost,
  sameDOMSelectionPoints,
} from '../../dom/utils/selection-writes';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { readPliteViewSelection } from '../view-selection';
import { getMountedEditableDOMRuntime } from './editable-dom-runtime';
import type { EditableInputController } from './input-state';

type DOMRangeProjection = {
  backward: boolean;
  domRange: globalThis.Range;
};

type BoundaryRangeRole = 'anchor' | 'focus' | 'interior';

const getBoundaryRangeRole = (
  coverage: DOMCoverageSession,
  boundaryId: string,
  selection: ModelRange
): BoundaryRangeRole => {
  const focusBoundary = coverage.getBoundaryForPoint(selection.focus);

  if (focusBoundary?.boundaryId === boundaryId) {
    return 'focus';
  }

  const anchorBoundary = coverage.getBoundaryForPoint(selection.anchor);

  if (anchorBoundary?.boundaryId === boundaryId) {
    return 'anchor';
  }

  return 'interior';
};

const hasAnchorSideVisibleText = (
  editor: ReactRuntimeEditor,
  selection: ModelRange
) => {
  if (RangeApi.isCollapsed(selection)) {
    return false;
  }

  const { anchor } = selection;
  const anchorEntry = editor.read((state) => state.nodes.get(anchor.path));

  if (!anchorEntry) {
    return false;
  }

  const [anchorNode] = anchorEntry;

  if (!NodeApi.isText(anchorNode)) {
    return false;
  }

  const anchorTextLength = NodeApi.string(anchorNode).length;

  return RangeApi.isBackward(selection)
    ? anchor.offset > 0
    : anchor.offset < anchorTextLength;
};

const getFocusSideVisibleRange = (
  editor: ReactRuntimeEditor,
  selection: ModelRange
): ModelRange | null => {
  if (RangeApi.isCollapsed(selection)) {
    return null;
  }

  const { focus } = selection;
  const focusEntry = editor.read((state) => state.nodes.get(focus.path));

  if (!focusEntry) {
    return null;
  }

  const [focusNode] = focusEntry;

  if (!NodeApi.isText(focusNode)) {
    return null;
  }

  const focusTextLength = NodeApi.string(focusNode).length;
  const focusRange = RangeApi.isBackward(selection)
    ? {
        anchor: focus,
        focus: { ...focus, offset: focusTextLength },
      }
    : {
        anchor: { ...focus, offset: 0 },
        focus,
      };

  return RangeApi.isCollapsed(focusRange) ? null : focusRange;
};

const getDOMRangeProjection = (
  editor: ReactRuntimeEditor,
  selection: ModelRange,
  editorElement?: HTMLElement
): DOMRangeProjection | null => {
  const fullDOMRange = hasAnchorSideVisibleText(editor, selection)
    ? resolveDOMRangeInRoot(editor, selection, editorElement)
    : null;

  if (fullDOMRange) {
    return {
      backward: RangeApi.isBackward(selection),
      domRange: fullDOMRange,
    };
  }

  for (const range of [
    getFocusSideVisibleRange(editor, selection),
    getFocusSideVisibleRange(editor, {
      anchor: selection.focus,
      focus: selection.anchor,
    }),
  ]) {
    const domRange = range
      ? resolveDOMRangeInRoot(editor, range, editorElement)
      : null;

    if (domRange) {
      return { backward: RangeApi.isBackward(selection), domRange };
    }
  }

  return null;
};

const getModelHost = (
  coverage: DOMCoverageSession,
  point: ModelRange['anchor']
) => {
  const boundary = coverage.getBoundaryForPoint(point);

  return boundary?.selectionPolicy === 'model' ? boundary : null;
};

const getPointOutsideModelHost = (
  coverage: DOMCoverageSession,
  point: Point,
  reverse: boolean
) => {
  const host = getModelHost(coverage, point);

  return host
    ? coverage.getPointOutsideBoundary(host, point, { reverse })
    : point;
};

export const getParkedRange = (
  coverage: DOMCoverageSession,
  selection: ModelRange
): ModelRange | null => {
  if (!coverage.hasModelBoundaries()) return selection;

  const [start, end] = RangeApi.edges(selection);
  const startHost = getModelHost(coverage, start);
  const endHost = getModelHost(coverage, end);

  if (!startHost && !endHost) return selection;

  const shownStart = startHost
    ? coverage.getPointOutsideBoundary(startHost, start)
    : start;
  const shownEnd = endHost
    ? coverage.getPointOutsideBoundary(endHost, end, { reverse: true })
    : end;
  const backward = RangeApi.isBackward(selection);

  if (
    shownStart &&
    shownEnd &&
    !RangeApi.isBackward({ anchor: shownStart, focus: shownEnd })
  ) {
    return backward
      ? { anchor: shownEnd, focus: shownStart }
      : { anchor: shownStart, focus: shownEnd };
  }

  const caret =
    getPointOutsideModelHost(coverage, selection.focus, backward) ??
    getPointOutsideModelHost(coverage, selection.anchor, !backward);

  return caret ? { anchor: caret, focus: caret } : null;
};

export const getHiddenAnchor = (
  editor: ReactRuntimeEditor,
  selection: Selection | null,
  editorElement: HTMLElement
): Point | null => {
  if (!RangeApi.isRange(selection) || !RangeApi.isExpanded(selection)) {
    return null;
  }

  const coverage = getMountedEditableDOMRuntime(
    editor,
    editorElement
  )?.domCoverage;

  return coverage?.hasModelBoundaries() &&
    getModelHost(coverage, selection.anchor)
    ? selection.anchor
    : null;
};

const hasHiddenEnd = (
  coverage: DOMCoverageSession,
  editor: ReactRuntimeEditor,
  selection: ModelRange,
  editorElement?: HTMLElement,
  boundaries?: readonly DOMCoverageBoundary[]
) => {
  if (
    !RangeApi.isExpanded(selection) ||
    !coverage.hasModelBoundaries() ||
    !(boundaries ?? coverage.getBoundariesForRange(selection)).some(
      (boundary) => boundary.selectionPolicy === 'model'
    )
  ) {
    return false;
  }

  const anchorHost = getModelHost(coverage, selection.anchor);
  const focusHost = getModelHost(coverage, selection.focus);

  if (anchorHost && anchorHost.boundaryId === focusHost?.boundaryId) {
    return false;
  }

  return (
    !!anchorHost ||
    !!focusHost ||
    !getDOMRangeProjection(editor, selection, editorElement)
  );
};

const getProjectedPoints = (
  editor: ReactRuntimeEditor,
  selection: ModelRange,
  editorElement?: HTMLElement
): DOMSelectionPoints | null => {
  const projection = getDOMRangeProjection(editor, selection, editorElement);

  return projection
    ? getDOMRangeSelectionPoints(projection.domRange, projection.backward)
    : null;
};

const getParkedPoints = (
  coverage: DOMCoverageSession,
  editor: ReactRuntimeEditor,
  selection: ModelRange,
  editorElement?: HTMLElement
): DOMSelectionPoints | null => {
  const projected = getProjectedPoints(editor, selection, editorElement);

  if (projected) return projected;

  const shown = getParkedRange(coverage, selection);
  const domRange = shown
    ? resolveDOMRangeInRoot(editor, shown, editorElement)
    : null;

  return domRange
    ? getDOMRangeSelectionPoints(domRange, RangeApi.isBackward(selection))
    : null;
};

export const readParkedSelection = (
  editor: ReactRuntimeEditor,
  selection: ModelRange,
  editorElement: HTMLElement
): 'moved' | 'parked' | null => {
  if (!RangeApi.isExpanded(selection) || readPliteViewSelection(editor)) {
    return null;
  }

  const runtime = getMountedEditableDOMRuntime(editor, editorElement);
  const coverage = runtime?.domCoverage;
  const root = editorElement.getRootNode() as Document | ShadowRoot;

  if (
    !runtime ||
    !coverage?.hasModelBoundaries() ||
    !hasHiddenEnd(coverage, editor, selection, editorElement)
  ) {
    return null;
  }

  const domSelection = getSelection(root);
  const shown = domSelection && readDOMSelectionPoints(domSelection);
  const exported = runtime.inputController.state.parkedExport?.points;

  if (exported && sameDOMSelectionPoints(shown, exported)) return 'parked';

  const parked = getParkedPoints(coverage, editor, selection, editorElement);

  // With no parked caret to compare, a selection the browser invents for the
  // empty export reads the same as one page code places.
  if (!shown || !parked || readsSelectionAsHost(root)) return 'parked';

  return sameDOMSelectionPoints(shown, parked) ? 'parked' : 'moved';
};

export const readHiddenEndTarget = (
  editor: ReactRuntimeEditor,
  selection: ModelRange,
  editorElement: HTMLElement,
  inputController: EditableInputController
): 'dom' | 'model' | null => {
  const parked = readParkedSelection(editor, selection, editorElement);

  if (!parked) return null;

  return parked === 'moved' &&
    inputController.state.parkedExport?.breaks === getRangeBreakCount(editor)
    ? 'dom'
    : 'model';
};

export const applyDOMCoverageSelectionPolicy = ({
  coverage,
  editor,
  editorElement,
  exportSelection,
  inputController,
  selection,
}: {
  coverage: DOMCoverageSession;
  editor: ReactRuntimeEditor;
  editorElement?: HTMLElement;
  exportSelection: (points: DOMSelectionPoints | null, parked: boolean) => void;
  inputController: EditableInputController;
  selection: ModelRange;
}) => {
  const boundaries = coverage.getBoundariesForRange(selection);

  if (boundaries.length === 0) {
    return false;
  }

  const runtime = getEditorRuntime(editor);
  const placed = runtime.getSelection();

  for (const boundary of boundaries) {
    if (boundary.selectionPolicy === 'materialize') {
      coverage.materializeBoundary(boundary.boundaryId, 'selection', {
        range: selection,
        rangeRole: getBoundaryRangeRole(
          coverage,
          boundary.boundaryId,
          selection
        ),
      });
    }
  }

  if (
    !SelectionApi.equals(runtime.getSelection(), placed) ||
    (editorElement &&
      [selection.anchor, selection.focus].some((point) =>
        isSoftLineTextStale(editor, point, editorElement)
      ))
  ) {
    return true;
  }

  const parked = hasHiddenEnd(
    coverage,
    editor,
    selection,
    editorElement,
    boundaries
  );

  const points = parked
    ? getParkedPoints(coverage, editor, selection, editorElement)
    : getProjectedPoints(editor, selection, editorElement);

  exportSelection(points, parked);

  if (parked) {
    inputController.state.parkedExport = {
      breaks: getRangeBreakCount(editor),
      points,
    };
  }

  return true;
};
