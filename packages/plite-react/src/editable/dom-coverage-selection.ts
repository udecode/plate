import { NodeApi, RangeApi, type Range as PliteRange } from '@platejs/plite';
import { DOMCoverage } from '@platejs/plite-dom/internal';

import type { ReactRuntimeEditor } from '../plugin/react-editor';

type DOMRangeProjection = {
  backward: boolean;
  domRange: globalThis.Range;
};

type BoundaryRangeRole = 'anchor' | 'focus' | 'interior';

const getBoundaryRangeRole = (
  editor: ReactRuntimeEditor,
  boundaryId: string,
  selection: PliteRange
): BoundaryRangeRole => {
  const focusBoundary = DOMCoverage.getBoundaryForPoint(
    editor,
    selection.focus
  );

  if (focusBoundary?.boundaryId === boundaryId) {
    return 'focus';
  }

  const anchorBoundary = DOMCoverage.getBoundaryForPoint(
    editor,
    selection.anchor
  );

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
  const [anchorNode] = editor.read((state) => state.nodes.get(anchor.path));

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
  const [focusNode] = editor.read((state) => state.nodes.get(focus.path));

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
  selection: PliteRange
): DOMRangeProjection | null => {
  const fullDOMRange = hasAnchorSideVisibleText(editor, selection)
    ? editor.api.dom.resolveDOMRange(selection)
    : null;

  if (fullDOMRange) {
    return {
      backward: RangeApi.isBackward(selection),
      domRange: fullDOMRange,
    };
  }

  const focusSideRange = getFocusSideVisibleRange(editor, selection);

  if (!focusSideRange) {
    return null;
  }

  const focusSideDOMRange = editor.api.dom.resolveDOMRange(focusSideRange);

  if (!focusSideDOMRange) {
    return null;
  }

  return {
    backward: RangeApi.isBackward(focusSideRange),
    domRange: focusSideDOMRange,
  };
};

const applyDOMRangeProjection = (
  domSelection: globalThis.Selection,
  projection: DOMRangeProjection | null
) => {
  domSelection.removeAllRanges();

  if (!projection) {
    return;
  }

  const { backward, domRange } = projection;

  if (backward) {
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
  domSelection,
  editor,
  onDOMSelectionWillChange,
  selection,
}: {
  domSelection: globalThis.Selection;
  editor: ReactRuntimeEditor;
  onDOMSelectionWillChange?: () => void;
  selection: PliteRange;
}) => {
  const boundaries = DOMCoverage.getBoundariesForRange(editor, selection);

  if (boundaries.length === 0) {
    return false;
  }

  for (const boundary of boundaries) {
    if (boundary.selectionPolicy === 'materialize') {
      DOMCoverage.materializeBoundary(
        editor,
        boundary.boundaryId,
        'selection',
        {
          range: selection,
          rangeRole: getBoundaryRangeRole(
            editor,
            boundary.boundaryId,
            selection
          ),
        }
      );
    }
  }

  const projection = getDOMRangeProjection(editor, selection);

  onDOMSelectionWillChange?.();
  applyDOMRangeProjection(domSelection, projection);

  return true;
};
