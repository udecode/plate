import { NodeApi, RangeApi, type Range as ModelRange } from '../..';
import { isSoftLineTextStale } from '../../dom/dom-soft-line-end';
import type { DOMCoverageSession } from '../../dom/internal';
import { resolveDOMRangeInRoot } from '../../dom/plugin/dom-editor';
import {
  getDOMRangeSelectionPoints,
  writeDOMSelection,
} from '../../dom/utils/selection-writes';
import type { ReactRuntimeEditor } from '../plugin/react-editor';

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

export const applyDOMCoverageSelectionPolicy = ({
  coverage,
  editor,
  editorElement,
  onDOMSelectionWillChange,
  selection,
  tree,
}: {
  coverage: DOMCoverageSession;
  editor: ReactRuntimeEditor;
  editorElement?: HTMLElement;
  onDOMSelectionWillChange?: () => void;
  selection: ModelRange;
  tree: Document | ShadowRoot;
}) => {
  const boundaries = coverage.getBoundariesForRange(selection);

  if (boundaries.length === 0) {
    return false;
  }

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
    editorElement &&
    [selection.anchor, selection.focus].some((point) =>
      isSoftLineTextStale(editor, point, editorElement)
    )
  ) {
    return true;
  }

  const projection = getDOMRangeProjection(editor, selection, editorElement);

  onDOMSelectionWillChange?.();
  writeDOMSelection(
    tree,
    projection
      ? getDOMRangeSelectionPoints(projection.domRange, projection.backward)
      : null
  );

  return true;
};
