/**
 * Iterate through all of the nodes in the editor and return the first match. If
 * no match is found, return undefined.
 */
import {
  type EDescendant,
  type ENodeEntry,
  type FindNodeOptions,
  type TEditor,
  type TNodeEntry,
  type Value,
  getNodeDescendants,
  getNodeEntry,
  getPath,
  isVoid,
  match,
} from '@udecode/slate';
import { Path, Range, Span } from 'slate';

/** Get the first descendant node matching the condition. */
export const findDescendant = <
  N extends EDescendant<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  options: FindNodeOptions<V>
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
      const first = getPath(editor, at, { edge: 'start' });
      const last = getPath(editor, at, { edge: 'end' });
      from = reverse ? last : first;
      to = reverse ? first : last;
    }

    let root: ENodeEntry<V> = [editor, []];

    if (Path.isPath(at)) {
      root = getNodeEntry(editor, at) as any;
    }

    const nodeEntries = getNodeDescendants<N>(root[0], {
      from,
      pass: ([n]) => (voids ? false : isVoid(editor, n)),
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
