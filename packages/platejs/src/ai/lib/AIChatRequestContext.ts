import {
  type Path,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
  type Value,
} from '../../core';

export type AIToolName = 'comment' | 'edit' | 'generate' | null;

/** Request-local reference into `AIChatRequestContext.children`. */
export type AIChatRequestNodeRef = Readonly<{
  path: Path;
  ref: string;
}>;

export type AIChatRequestRefs = Readonly<{
  blocks: readonly AIChatRequestNodeRef[];
  tableCells: readonly AIChatRequestNodeRef[];
}>;

/** Exact directional membership alongside the representative request range. */
export type AIChatRequestNodeSelection = Readonly<{
  anchorPath: Path;
  focusPath: Path;
  paths: readonly [Path, ...Path[]];
}>;

/** Self-contained editor snapshot for one AI chat request. */
export type AIChatRequestContext = Readonly<{
  children: Value;
  nodeSelection: AIChatRequestNodeSelection | null;
  refs: AIChatRequestRefs;
  selection: Range | null;
  toolName?: AIToolName;
}>;

/** Restore the model selection and its semantic selected-content state. */
export const resolveAIChatRequestContext = (
  context: Pick<AIChatRequestContext, 'nodeSelection' | 'selection'>
): { isSelecting: boolean; selection: Selection } => {
  const { nodeSelection, selection } = context;

  return {
    isSelecting:
      !!nodeSelection || (!!selection && RangeApi.isExpanded(selection)),
    selection: nodeSelection
      ? SelectionApi.nodes(nodeSelection.paths, {
          anchorPath: nodeSelection.anchorPath,
          focusPath: nodeSelection.focusPath,
        })
      : selection
        ? SelectionApi.text(selection)
        : null,
  };
};
