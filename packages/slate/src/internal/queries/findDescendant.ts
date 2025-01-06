/**
 * Iterate through all of the nodes in the editor and return the first match. If
 * no match is found, return undefined.
 */
import {
  type DescendantOf,
  type Editor,
  type EditorFindOptions,
  type NodeEntry,
  type NodeEntryOf,
  type Path,
  type ValueOf,
  NodeApi,
  PathApi,
  RangeApi,
  SpanApi,
} from '../../interfaces';
import { match } from '../../utils';

export const findDescendant = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options: EditorFindOptions<ValueOf<E>>
): NodeEntry<N> | undefined => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const {
      at = editor.selection,
      match: _match,
      reverse = false,
      voids = false,
    } = options;

    if (!at) return;

    let from;
    let to;

    if (SpanApi.isSpan(at)) {
      [from, to] = at;
    } else if (RangeApi.isRange(at)) {
      const first = editor.api.path(at, { edge: 'start' });
      const last = editor.api.path(at, { edge: 'end' });
      from = reverse ? last : first;
      to = reverse ? first : last;
    }

    let root: NodeEntryOf<E> = [editor, []];

    if (PathApi.isPath(at)) {
      root = editor.api.node(at) as any;
    }

    const nodeEntries = NodeApi.descendants<N>(root[0], {
      from,
      pass: ([n]) => (voids ? false : editor.isVoid(n as any)),
      reverse,
      to,
    });

    for (const [node, path] of nodeEntries) {
      if (match(node, path, _match as any)) {
        return [node, (at as Path).concat(path)];
      }
    }
  } catch (error) {
    return undefined;
  }
};
