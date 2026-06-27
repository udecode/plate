import {
  before as editorBefore,
  first as editorFirst,
  getChildren as editorGetChildren,
  getSnapshot as editorGetSnapshot,
  parent as editorParent,
} from '../interfaces/editor';
import type { EditorStaticApi } from '../interfaces/editor';
import { LocationApi, type Span } from '../interfaces/location';
import { NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { node as editorNode } from './node';
import { nodes } from './nodes';

export const previous: EditorStaticApi['previous'] = (editor, options = {}) => {
  const { from = 'before', mode = 'lowest', voids = false } = options;
  let { match, at = editorGetSnapshot(editor).selection } = options;

  if (!at) {
    return;
  }

  if (LocationApi.isPath(at) && at.length === 0) {
    return;
  }

  if (options.sibling) {
    if (!LocationApi.isPath(at)) {
      return;
    }

    if (!PathApi.hasPrevious(at)) {
      return;
    }

    const previousPath = PathApi.previous(at);

    if (!NodeApi.has(editor, previousPath)) {
      return;
    }

    return editorNode(editor, previousPath) as any;
  }

  let start: Span[0] | undefined;

  if (from === 'parent' && LocationApi.isPath(at) && at.length > 1) {
    start = at;

    const baseMatch = match;
    match = (node, path) =>
      !PathApi.isAfter(path, at) &&
      !PathApi.equals(path, at) &&
      (baseMatch?.(node, path) ?? true);
  }

  const pointBeforeLocation = start
    ? undefined
    : editorBefore(editor, at, { voids });

  if (!start) {
    if (!pointBeforeLocation) {
      return;
    }

    start = pointBeforeLocation.path;
  }

  const firstEntry = editorFirst(editor, []);

  if (!firstEntry) {
    return;
  }

  const [, to] = firstEntry;

  // The search location is from the start of the document to the path of
  // the point before the location passed in.
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

  const [previous] = nodes(editor, {
    reverse: true,
    at: span,
    match,
    mode,
    voids,
  });

  return previous;
};
