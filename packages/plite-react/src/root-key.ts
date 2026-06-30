import type {
  Descendant,
  EditorStateView,
  Operation,
  Point,
  RootKey,
} from '@platejs/plite';

export const MAIN_ROOT_KEY = 'main' as RootKey;

export const getOperationRoot = (operation: Operation): RootKey =>
  ((operation as { root?: RootKey }).root ?? MAIN_ROOT_KEY) as RootKey;

export const getPointRoot = (
  point: Point,
  fallbackRoot: RootKey = MAIN_ROOT_KEY
): RootKey => (point.root ?? fallbackRoot) as RootKey;

export const toPublicRootOption = (root: RootKey): RootKey | undefined =>
  root === MAIN_ROOT_KEY ? undefined : root;

export const readRootChildren = (
  state: Pick<EditorStateView, 'children' | 'root' | 'value' | 'view'>,
  root: RootKey
): readonly Descendant[] => {
  if (state.view.root() === root) {
    return state.children();
  }

  if (root === MAIN_ROOT_KEY) {
    return state.value().children;
  }

  return state.root(root);
};
