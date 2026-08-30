import type {
  AnyEditor,
  EditorPreviousOptions,
  EditorStaticApi,
} from '../interfaces/editor';
import {
  before as editorBefore,
  first as editorFirst,
  getChildren as editorGetChildren,
  getSnapshot as editorGetSnapshot,
  parent as editorParent,
} from '../interfaces/editor';
import { LocationApi, type Span } from '../interfaces/location';
import { type Node, NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { normalizeNodeMatch } from '../utils/node-match';
import { node as editorNode } from './node';
import { nodes } from './nodes';

export const previous = ((
  editor: AnyEditor,
  options: EditorPreviousOptions<Node> = {}
) => {
  const { from = 'before', mode = 'lowest', voids = false } = options;
  const { at = editorGetSnapshot(editor).selection } = options;
  let match = normalizeNodeMatch(options.type, options.match);

  if (!at || !LocationApi.isLocation(at)) {
    return undefined;
  }

  if (LocationApi.isPath(at) && at.length === 0) {
    return undefined;
  }

  if (options.sibling) {
    if (!LocationApi.isPath(at)) {
      return undefined;
    }

    if (!PathApi.hasPrevious(at)) {
      return undefined;
    }

    const previousPath = PathApi.previous(at);

    if (!NodeApi.has(editor, previousPath)) {
      return undefined;
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
      return undefined;
    }

    start = pointBeforeLocation.path;
  }

  const firstEntry = editorFirst(editor, []);

  if (!firstEntry) {
    return undefined;
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

  const [innerPrevious] = nodes(editor, {
    reverse: true,
    at: span,
    match,
    mode,
    voids,
  });

  return innerPrevious;
}) as EditorStaticApi['previous'];
