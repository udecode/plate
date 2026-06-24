import type { Point, Range } from '@platejs/plite';
import {
  createPliteViewBoundaryRootMap,
  createPliteViewBoundarySelectionTarget,
  hasAmbiguousPliteViewBoundarySegments,
} from '../view-boundary-graph';
import type { PliteViewSelection } from '../view-selection';
import type { Editor as RuntimeEditor } from './runtime-editor-api';

export type ProjectedSelectionTargetResolution =
  | { kind: 'ambiguous' }
  | { kind: 'stale' }
  | { kind: 'target'; target: { ranges: Range[]; start: Point } };

export const resolveProjectedSelectionTarget = (
  editor: RuntimeEditor,
  viewSelection: PliteViewSelection
): ProjectedSelectionTargetResolution => {
  if (hasAmbiguousPliteViewBoundarySegments(viewSelection.segments)) {
    return { kind: 'ambiguous' };
  }

  const roots = editor.read((state) =>
    createPliteViewBoundaryRootMap(state.value.get())
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
