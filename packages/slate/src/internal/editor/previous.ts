import type { Editor, ValueOf } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';

import {
  type DescendantOf,
  type EditorPreviousOptions,
  type Path,
  type Span,
  PathApi,
} from '../../interfaces';
import { combineMatch, getAt, getMatch, getQueryOptions } from '../../utils';

// Slate fork
const previousBase = (
  editor: Editor,
  options: EditorPreviousOptions<ValueOf<Editor>>
) => {
  const { from = 'after', mode = 'lowest', voids = false } = options;
  let match = getMatch(editor, options);

  const at = getAt(editor, options.at) ?? editor.selection;

  if (!at) {
    return;
  }

  let start: Path | undefined;

  // FORK: from
  if (from === 'parent' && PathApi.isPath(at) && at.length > 1) {
    start = at;

    match = combineMatch((n, p) => {
      // We want nodes that:
      // 1. Are not after our target path
      // 2. Are not the same as our target path
      return !PathApi.isAfter(p, at) && !PathApi.equals(p, at);
    }, match);
  }
  if (!start) {
    const pointBeforeLocation = editor.api.before(at, { voids })!;

    if (!pointBeforeLocation) return;

    start = pointBeforeLocation.path;
  }

  const [, to] = editor.api.first([])!;

  // The search location is from the start of the document to the path of
  // the point before the location passed in
  const span: Span = [start, to];

  if (PathApi.isPath(at) && at.length === 0) {
    // throw new Error(`Cannot get the previous node from the root node!`);
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

  const [previous] = editor.api.nodes({
    at: span,
    match,
    mode,
    reverse: true,
    voids,
  });

  return previous;
};

export const previous = <N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  options?: EditorPreviousOptions<ValueOf<E>>
): NodeEntry<N> | undefined => {
  const getPrevious = (o: EditorPreviousOptions<ValueOf<E>>) => {
    try {
      return previousBase(editor as any, o) as any;
    } catch {}
  };

  if (options?.sibling) {
    const path = getQueryOptions(editor, options).at;

    if (!path) return;

    const previousPath = PathApi.previous(path);

    if (!previousPath) return;

    const previousNode = editor.api.node(previousPath);

    return previousNode as NodeEntry<N>;
  }
  if (!(options?.id && options?.block)) {
    return getPrevious(options as any);
  }

  const block = editor.api.node({
    id: options.id,
    at: [],
  });

  if (!block) return;

  // both id and block are defined
  return getPrevious({ at: block[1], block: true });
};
