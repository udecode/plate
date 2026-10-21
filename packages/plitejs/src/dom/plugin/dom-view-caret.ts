import {
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
  type TextSelection,
} from '../..';
import { getEditorRuntime } from '../../core/editor-runtime';
import { toInternalRoot } from '../../core/public-root';
import { holdsCaret, resolveParkedCaret } from '../../core/view-carets';
import type { AnyEditor } from '../../interfaces/editor';
import {
  type DOMCoverageSession,
  isCollapsedDOMCoverageBoundary,
} from './dom-coverage';
import { findDOMRootRuntime } from './dom-root-runtime';

export const liftCaretOutOfCollapsedSection = <T extends Range | Selection>(
  view: AnyEditor,
  coverage: DOMCoverageSession,
  composing: boolean,
  selection: T
): T | TextSelection => {
  if (!RangeApi.isRange(selection) || !RangeApi.isCollapsed(selection)) {
    return selection;
  }
  if (
    !coverage.hasCollapsedBoundaries() ||
    composing ||
    view.read.view.isReadOnly() ||
    toInternalRoot(SelectionApi.root(selection)) !==
      toInternalRoot(view.read.view.root()) ||
    !coverage.hidesPoint(selection.anchor)
  ) {
    return selection;
  }

  const boundary = coverage.getBoundaryForPoint(selection.anchor);

  if (!boundary || !isCollapsedDOMCoverageBoundary(boundary)) {
    return selection;
  }

  const point = coverage.getPointOutsideBoundary(boundary, selection.anchor, {
    reverse: true,
  });

  return point ? SelectionApi.text({ anchor: point, focus: point }) : selection;
};

export const resolveNextKeyCaret = (
  view: AnyEditor,
  editable: Node | null
): Selection => {
  const live = getEditorRuntime(view).getSelection();

  if (holdsCaret(view)) return live;

  const caret = resolveParkedCaret(view) ?? live;
  const runtime = editable && findDOMRootRuntime(editable);

  return runtime
    ? liftCaretOutOfCollapsedSection(
        view,
        runtime.domCoverage,
        runtime.isComposing(),
        caret
      )
    : caret;
};
