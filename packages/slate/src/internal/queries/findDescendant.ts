import { Path, Range, Span } from 'slate';

import type { FindNodeOptions } from '../../queries/findNode';

/**
 * Iterate through all of the nodes in the editor and return the first match. If
 * no match is found, return undefined.
 */
import {
  type DescendantOf,
  type NodeEntryOf,
  type TEditor,
  type TNodeEntry,
  type ValueOf,
  getNodeDescendants,
} from '../../interfaces';
import { match } from '../../utils';

/** Get the first descendant node matching the condition. */
export const findDescendant = <
  N extends DescendantOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options: FindNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined => {
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

    if (Span.isSpan(at)) {
      [from, to] = at;
    } else if (Range.isRange(at)) {
      const first = editor.api.path(at, { edge: 'start' });
      const last = editor.api.path(at, { edge: 'end' });
      from = reverse ? last : first;
      to = reverse ? first : last;
    }

    let root: NodeEntryOf<E> = [editor, []];

    if (Path.isPath(at)) {
      root = editor.api.node(at) as any;
    }

    const nodeEntries = getNodeDescendants<N>(root[0], {
      from,
      pass: ([n]) => (voids ? false : editor.isVoid(n)),
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
