import { LocationApi } from '../interfaces';
import {
  getSnapshot as editorGetSnapshot,
  levels as editorLevels,
  path as editorPath,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';

export const above: EditorStaticApi['above'] = (editor, options = {}) => {
  const {
    voids = false,
    mode = 'lowest',
    at = editorGetSnapshot(editor).selection,
    match,
  } = options;

  if (!at) {
    return;
  }

  let path = editorPath(editor, at);

  // If `at` is a Range that spans mulitple nodes, `path` will be their common ancestor.
  // Otherwise `path` will be a text node and/or the same as `at`, in which cases we want to start with its parent.
  if (
    !LocationApi.isRange(at) ||
    PathApi.equals(at.focus.path, at.anchor.path)
  ) {
    if (path.length === 0) return;
    path = PathApi.parent(path);
  }

  const reverse = mode === 'lowest';

  const [firstMatch] = editorLevels(editor, {
    at: path,
    voids,
    match,
    reverse,
  });
  return firstMatch; // if nothing matches this returns undefined
};
