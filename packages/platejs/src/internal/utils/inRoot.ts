import {
  SelectionApi,
  type EditorCoreStateView,
  type Location,
  type NamedRootKey,
  type NodeSelection,
  type Path,
} from '../../facade';

export const inRoot = (path: Path, root?: NamedRootKey): Location =>
  root === undefined ? path : { offset: 0, path, root };

export const rootOf = (
  state: Pick<EditorCoreStateView, 'selection' | 'view'>,
  at: Location | NodeSelection | readonly [Path, Path] | undefined
) => {
  const root =
    at === undefined
      ? SelectionApi.root(state.selection())
      : 'anchor' in at || SelectionApi.isNode(at)
        ? SelectionApi.root(at)
        : 'root' in at
          ? at.root
          : undefined;

  return root ?? state.view.root();
};
