/**
 * Iterate through all of the nodes in the editor and return the first match. If
 * no match is found, return undefined.
 */
import { Path, Range, Span } from 'slate';
import { getNode } from '../../slate/editor/getNode';
import { getPath } from '../../slate/editor/getPath';
import { isVoid } from '../../slate/editor/isVoid';
import { getNodeDescendants } from '../../slate/node/getNodeDescendants';
import { EDescendant } from '../../slate/types/TDescendant';
import { TEditor, Value } from '../../slate/types/TEditor';
import { EDescendantEntry, ENodeEntry } from '../../slate/types/TNodeEntry';
import { FindNodeOptions } from './findNode';
import { match } from './match';

/**
 * Get the first descendant node matching the condition.
 */
export const findDescendant = <V extends Value>(
  editor: TEditor<V>,
  options: FindNodeOptions<V>
): EDescendantEntry<V> | undefined => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const {
      match: _match,
      at = editor.selection,
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
      root = getNode(editor, at);
    }

    const nodeEntries = getNodeDescendants(root[0], {
      reverse,
      from,
      to,
      pass: ([n]) => (voids ? false : isVoid(editor, n)),
    });

    for (const [node, path] of nodeEntries) {
      if (match(node as EDescendant<V>, _match as any)) {
        return [node as EDescendant<V>, (at as Path).concat(path)];
      }
    }
  } catch (error) {
    return undefined;
  }
};
