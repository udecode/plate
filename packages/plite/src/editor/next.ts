import {
  after as editorAfter,
  getChildren as editorGetChildren,
  getSnapshot as editorGetSnapshot,
  last as editorLast,
  parent as editorParent,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { LocationApi, type Span } from '../interfaces/location';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { normalizeNodeMatch } from '../utils/node-match';
import { nodes } from './nodes';

export const next: EditorStaticApi['next'] = (editor, options = {}) => {
  const {
    from = 'after',
    mode = from === 'child' ? 'all' : 'lowest',
    voids = false,
  } = options;
  const { at = editorGetSnapshot(editor).selection } = options;
  let match = normalizeNodeMatch(options.match);

  if (!at) {
    return;
  }

  if (LocationApi.isPath(at) && at.length === 0) {
    return;
  }

  let start: Span[0] | undefined;

  if (from === 'child' && LocationApi.isPath(at)) {
    const childPath = at.concat(0);

    if (NodeApi.has(editor, childPath)) {
      start = childPath;

      const baseMatch = match;
      match = (node, path) =>
        !PathApi.isAncestor(path, at) &&
        !PathApi.equals(path, at) &&
        (baseMatch?.(node, path) ?? true);
    }
  }

  const pointAfterLocation = start
    ? undefined
    : editorAfter(editor, at, { voids });

  if (!start) {
    if (!pointAfterLocation) return;

    start = pointAfterLocation.path;
  }

  const lastEntry = editorLast(editor, []);

  if (!lastEntry) {
    return;
  }

  const [, to] = lastEntry;

  const span: Span = [start, to];

  if (match == null) {
    if (LocationApi.isPath(at)) {
      const [parent] = editorParent(editor, at);
      const children = NodeApi.isEditor(parent)
        ? editorGetChildren(editor)
        : parent.children;
      match = (n) => !NodeApi.isEditor(n) && children.includes(n);
    } else {
      match = () => true;
    }
  }

  const [next] = nodes(editor, { at: span, match, mode, voids });
  return next;
};
