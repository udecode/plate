import type { Point, Range } from '../..';
import { readRootChildren } from '../root-key';
import {
  createPliteViewBoundarySelectionTarget,
  hasAmbiguousPliteViewBoundarySegments,
} from '../view-boundary-graph';
import type { PliteViewSelection } from '../view-selection';
import type { Editor as RuntimeEditor } from './runtime-editor-api';

export type ProjectedSelectionTargetResolution =
  | { kind: 'ambiguous' }
  | { kind: 'retained' }
  | { kind: 'stale' }
  | { kind: 'target'; target: { ranges: Range[]; start: Point } };

export const resolveProjectedSelectionTarget = (
  editor: RuntimeEditor,
  viewSelection: PliteViewSelection
): ProjectedSelectionTargetResolution => {
  if (viewSelection.segments.parts.some((segment) => segment.fragment)) {
    return { kind: 'retained' };
  }
  if (hasAmbiguousPliteViewBoundarySegments(viewSelection.segments)) {
    return { kind: 'ambiguous' };
  }

  const roots = editor.read((state) =>
    Object.fromEntries(
      [...new Set(viewSelection.segments.parts.map((part) => part.root))].map(
        (root) => [root, readRootChildren(state, root)]
      )
    )
  );
  const target = createPliteViewBoundarySelectionTarget(roots, viewSelection);

  return target ? { kind: 'target', target } : { kind: 'stale' };
};

export const createProjectedSelectionTarget = (
  editor: RuntimeEditor,
  viewSelection: PliteViewSelection
): { ranges: Range[]; start: Point } | null => {
  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  return resolution.kind === 'target' ? resolution.target : null;
};
