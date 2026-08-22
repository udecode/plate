import { LocationApi } from '../interfaces';
import {
  getSnapshot as editorGetSnapshot,
  levels as editorLevels,
  path as editorPath,
} from '../interfaces/editor';
import type {
  AnyEditor,
  EditorAboveOptions,
  EditorStaticApi,
} from '../interfaces/editor';
import { type Ancestor, NodeApi, type NodeMatch } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';

const assertNumericPath = (path: Path) => {
  for (const index of path) {
    if (typeof index !== 'number') {
      throw new Error('Got non-numeric path index');
    }
  }
};

export const above = ((
  editor: AnyEditor,
  options: EditorAboveOptions<Ancestor> = {}
) => {
  const {
    voids = false,
    mode = 'lowest',
    at = editorGetSnapshot(editor).selection,
    match,
    type,
  } = options;

  if (!at) {
    return undefined;
  }

  let path: Path;

  path = editorPath(editor, at);
  assertNumericPath(path);

  // If `at` is a Range that spans mulitple nodes, `path` will be their common ancestor.
  // Otherwise `path` will be a text node and/or the same as `at`, in which cases we want to start with its parent.
  if (
    !LocationApi.isRange(at) ||
    PathApi.equals(at.focus.path, at.anchor.path)
  ) {
    if (path.length === 0) return undefined;
    path = PathApi.parent(path);
  }

  if (!NodeApi.has(editor, path)) {
    return undefined;
  }

  const reverse = mode === 'lowest';

  const [firstMatch] = editorLevels(editor, {
    at: path,
    voids,
    match: match as NodeMatch | undefined,
    reverse,
    type,
  });
  // if nothing matches this returns undefined
  return firstMatch;
}) as EditorStaticApi['above'];
