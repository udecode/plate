import type { Editor } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import { MAIN_ROOT_KEY } from '../internal/root-location';
import {
  DIRTY_PATH_KEYS,
  DIRTY_PATH_ROOTS,
  DIRTY_PATHS,
} from '../utils/weak-maps';

type DirtyPathSet = {
  keys: Set<string>;
  paths: Path[];
};

const getRootDirtyPathSet = (editor: Editor, root: string): DirtyPathSet => {
  if (root === MAIN_ROOT_KEY) {
    return {
      keys: DIRTY_PATH_KEYS.get(editor) || new Set(),
      paths: DIRTY_PATHS.get(editor) || [],
    };
  }

  return (
    DIRTY_PATH_ROOTS.get(editor)?.get(root) ?? {
      keys: new Set(),
      paths: [],
    }
  );
};

const setRootDirtyPathSet = (
  editor: Editor,
  root: string,
  dirtyPathSet: DirtyPathSet
) => {
  if (root === MAIN_ROOT_KEY) {
    DIRTY_PATHS.set(editor, dirtyPathSet.paths);
    DIRTY_PATH_KEYS.set(editor, dirtyPathSet.keys);
    return;
  }

  const rootSets =
    DIRTY_PATH_ROOTS.get(editor) ?? new Map<string, DirtyPathSet>();
  rootSets.set(root, dirtyPathSet);
  DIRTY_PATH_ROOTS.set(editor, rootSets);
};

export const getDirtyPathsForRoot = (
  editor: Editor,
  root = MAIN_ROOT_KEY
): Path[] => getRootDirtyPathSet(editor, root).paths;

export const setDirtyPathsForRoot = (
  editor: Editor,
  root: string,
  paths: Path[],
  keys = new Set(paths.map((path) => path.join(',')))
) => {
  setRootDirtyPathSet(editor, root, { keys, paths });
};

export const clearDirtyPathsForRoot = (editor: Editor, root: string) => {
  setDirtyPathsForRoot(editor, root, [], new Set());
};

export const getDirtyPathRoots = (editor: Editor): string[] => {
  const roots: string[] = [];

  if ((DIRTY_PATHS.get(editor)?.length ?? 0) > 0) {
    roots.push(MAIN_ROOT_KEY);
  }

  for (const [root, dirtyPathSet] of DIRTY_PATH_ROOTS.get(editor) ?? []) {
    if (dirtyPathSet.paths.length > 0) {
      roots.push(root);
    }
  }

  return roots;
};

/**
 * update editor dirty paths
 *
 * @param newDirtyPaths: Path[]; new dirty paths
 * @param transform: (p: Path) => Path | null; how to transform existing dirty paths
 */
export function updateDirtyPaths(
  editor: Editor,
  newDirtyPaths: Path[],
  transform?: (p: Path) => Path | null,
  options: { root?: string | null } = {}
) {
  const root = options.root ?? MAIN_ROOT_KEY;
  const oldDirtyPathSet = getRootDirtyPathSet(editor, root);
  const oldDirtyPaths = oldDirtyPathSet.paths;
  const oldDirtyPathKeys = oldDirtyPathSet.keys;
  let dirtyPaths: Path[];
  let dirtyPathKeys: Set<string>;

  const add = (path: Path | null) => {
    if (path) {
      const key = path.join(',');

      if (!dirtyPathKeys.has(key)) {
        dirtyPathKeys.add(key);
        dirtyPaths.push(path);
      }
    }
  };

  if (transform) {
    dirtyPaths = [];
    dirtyPathKeys = new Set();
    for (const path of oldDirtyPaths) {
      const newPath = transform(path);
      add(newPath);
    }
  } else {
    dirtyPaths = oldDirtyPaths;
    dirtyPathKeys = oldDirtyPathKeys;
  }

  for (const path of newDirtyPaths) {
    add(path);
  }

  setRootDirtyPathSet(editor, root, {
    keys: dirtyPathKeys,
    paths: dirtyPaths,
  });
}
