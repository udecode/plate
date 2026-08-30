import type {
  AnyEditor,
  EditorNextOptions,
  EditorStaticApi,
} from '../interfaces/editor';
import {
  after as editorAfter,
  getChildren as editorGetChildren,
  getSnapshot as editorGetSnapshot,
  last as editorLast,
  parent as editorParent,
} from '../interfaces/editor';
import { LocationApi, type Span } from '../interfaces/location';
import { type Descendant, NodeApi } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { normalizeNodeMatch } from '../utils/node-match';
import { nodes } from './nodes';

export const next = ((
  editor: AnyEditor,
  options: EditorNextOptions<Descendant> = {}
) => {
  const {
    from = 'after',
    mode = from === 'child' ? 'all' : 'lowest',
    voids = false,
  } = options;
  const { at = editorGetSnapshot(editor).selection } = options;
  let match = normalizeNodeMatch(options.type, options.match);

  if (!at || !LocationApi.isLocation(at)) {
    return undefined;
  }

  if (LocationApi.isPath(at) && at.length === 0) {
    return undefined;
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
    if (!pointAfterLocation) return undefined;

    start = pointAfterLocation.path;
  }

  const lastEntry = editorLast(editor, []);

  if (!lastEntry) {
    return undefined;
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

  const [innerNext] = nodes(editor, { at: span, match, mode, voids });
  return innerNext as never;
}) as EditorStaticApi['next'];
