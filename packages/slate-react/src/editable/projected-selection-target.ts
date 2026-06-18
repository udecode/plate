import type { Point, Range } from '@platejs/slate';
import {
  createSlateViewBoundaryRootMap,
  createSlateViewBoundarySelectionTarget,
  hasAmbiguousSlateViewBoundarySegments,
} from '../view-boundary-graph';
import type { SlateViewSelection } from '../view-selection';
import type { Editor as RuntimeEditor } from './runtime-editor-api';

export type ProjectedSelectionTargetResolution =
  | { kind: 'ambiguous' }
  | { kind: 'stale' }
  | { kind: 'target'; target: { ranges: Range[]; start: Point } };

export const resolveProjectedSelectionTarget = (
  editor: RuntimeEditor,
  viewSelection: SlateViewSelection
): ProjectedSelectionTargetResolution => {
  if (hasAmbiguousSlateViewBoundarySegments(viewSelection.segments)) {
    return { kind: 'ambiguous' };
  }

  const roots = editor.read((state) =>
    createSlateViewBoundaryRootMap(state.value.get())
  );
  const target = createSlateViewBoundarySelectionTarget(roots, viewSelection);

  return target ? { kind: 'target', target } : { kind: 'stale' };
};

export const createProjectedSelectionTarget = (
  editor: RuntimeEditor,
  viewSelection: SlateViewSelection
): { ranges: Range[]; start: Point } | null => {
  const resolution = resolveProjectedSelectionTarget(editor, viewSelection);

  return resolution.kind === 'target' ? resolution.target : null;
};
