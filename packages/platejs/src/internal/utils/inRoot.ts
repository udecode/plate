import {
  SelectionApi,
  type EditorCoreStateView,
  type Location,
  type NamedRootKey,
  type NodeSelection,
  type Path,
} from '../../facade';

/**
 * A key read through this location also resolves a node an unfinished draft
 * just wrote, where `tx.key(node)` does not.
 */
export const inRoot = (path: Path, root?: NamedRootKey): Location =>
  root === undefined ? path : { offset: 0, path, root };

export const rootOf = (
  state: Pick<EditorCoreStateView, 'selection'>,
  at: Location | NodeSelection | readonly [Path, Path] | undefined
) => {
  if (at === undefined) return SelectionApi.root(state.selection());
  if ('anchor' in at || SelectionApi.isNode(at)) return SelectionApi.root(at);

  return 'root' in at ? at.root : undefined;
};
