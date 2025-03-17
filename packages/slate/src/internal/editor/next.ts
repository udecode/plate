import type { Editor, ValueOf } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';

import {
  type DescendantOf,
  type EditorNextOptions,
  type Path,
  type Span,
  PathApi,
} from '../../interfaces';
import { combineMatch, getAt, getMatch } from '../../utils';

export const next = <N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  options: EditorNextOptions<ValueOf<E>> = {}
): NodeEntry<N> | undefined => {
  const {
    from = 'after',
    mode = from === 'child' ? 'all' : 'lowest',
    voids = false,
  } = options;
  let match = getMatch(editor, options);

  const at = getAt(editor, options.at) ?? editor.selection;

  if (!at) {
    return;
  }

  let start: Path | undefined;

  // FORK: from
  if (from === 'child' && PathApi.isPath(at)) {
    const path = PathApi.firstChild(at);
    const fromNode = editor.api.node(path);

    if (fromNode) {
      start = path;
      match = combineMatch((n, p) => {
        return !PathApi.isAncestor(p, at) && !PathApi.equals(p, at);
      }, match);
    }
  }
  if (!start) {
    const pointAfterLocation = editor.api.after(at, { voids })!;

    if (!pointAfterLocation) return;

    start = pointAfterLocation.path;
  }

  const [, to] = editor.api.last([])!;

  // FORK: from
  const span: Span = [start, to];

  if (PathApi.isPath(at) && at.length === 0) {
    // throw new Error(`Cannot get the next node from the root node!`);
    return;
  }
  if (match == null) {
    if (PathApi.isPath(at)) {
      const [parent] = editor.api.parent(at)!;
      match = (n) => parent.children.includes(n as any);
    } else {
      match = () => true;
    }
  }

  const [next] = editor.api.nodes({ at: span, match, mode, voids });

  return next as any;
};
