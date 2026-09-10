import { NodeApi, RangeApi, type Range as PliteRange } from '../..';
import {
  type DOMCoverageSession,
  replaceDOMSelectionRange,
} from '../../dom/internal';
import { resolveDOMRangeInRoot } from '../../dom/plugin/dom-editor';
import type { ReactRuntimeEditor } from '../plugin/react-editor';

type DOMRangeProjection = {
  backward: boolean;
  domRange: globalThis.Range;
};

type BoundaryRangeRole = 'anchor' | 'focus' | 'interior';

const getBoundaryRangeRole = (
  coverage: DOMCoverageSession,
  boundaryId: string,
  selection: PliteRange
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
  selection: PliteRange
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
  selection: PliteRange
): PliteRange | null => {
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
  selection: PliteRange,
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

const applyDOMRangeProjection = (
  domSelection: globalThis.Selection,
  projection: DOMRangeProjection | null,
  forceDOMRangeRebuild: boolean
) => {
  domSelection.removeAllRanges();

  if (!projection) {
    return;
  }

  const { backward, domRange } = projection;

  if (forceDOMRangeRebuild) {
    replaceDOMSelectionRange(domSelection, domRange, {
      backward,
    });
  } else if (backward) {
    domSelection.setBaseAndExtent(
      domRange.endContainer,
      domRange.endOffset,
      domRange.startContainer,
      domRange.startOffset
    );
  } else {
    domSelection.setBaseAndExtent(
      domRange.startContainer,
      domRange.startOffset,
      domRange.endContainer,
      domRange.endOffset
    );
  }
};

export const applyDOMCoverageSelectionPolicy = ({
  coverage,
  domSelection,
  editor,
  editorElement,
  forceDOMRangeRebuild = false,
  onDOMSelectionWillChange,
  selection,
}: {
  coverage: DOMCoverageSession;
  domSelection: globalThis.Selection;
  editor: ReactRuntimeEditor;
  editorElement?: HTMLElement;
  forceDOMRangeRebuild?: boolean;
  onDOMSelectionWillChange?: () => void;
  selection: PliteRange;
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

  const projection = getDOMRangeProjection(editor, selection, editorElement);

  onDOMSelectionWillChange?.();
  applyDOMRangeProjection(domSelection, projection, forceDOMRangeRebuild);

  return true;
};
