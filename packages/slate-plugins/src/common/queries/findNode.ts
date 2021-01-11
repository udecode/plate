/**
 * Iterate through all of the nodes in the editor and return the first match. If
 * no match is found, return undefined.
 */
import { Editor, Location, Node, NodeEntry, Path, Range, Span } from 'slate';
import { NodeMatch } from '../types/Editor.types';

export type FindNodeOptions<T extends Node = Node> = {
  match: NodeMatch<T>;
  at?: Location | Span;
  reverse?: boolean;
  voids?: boolean;
  /**
   * Look for descendants, ancestors or nodes of a location.
   */
  mode?: 'descendants' | 'nodes';
};

/**
 * Find descendant node matching the condition.
 */
export const findNode = <T extends Node = Node>(
  editor: Editor,
  options: FindNodeOptions<T>
): NodeEntry<T> | undefined => {
  // Slate throws when things aren't found so we wrap in a try catch and return undefined on throw.
  try {
    const {
      match,
      at = editor.selection,
      reverse = false,
      voids = false,
      mode = 'descendants',
    } = options;

    if (!at) return;

    let from;
    let to;
    if (Span.isSpan(at)) {
      [from, to] = at;
    } else if (Range.isRange(at)) {
      const first = Editor.path(editor, at, { edge: 'start' });
      const last = Editor.path(editor, at, { edge: 'end' });
      from = reverse ? last : first;
      to = reverse ? first : last;
    }

    let root: NodeEntry = [editor, []];
    if (Path.isPath(at)) {
      root = Editor.node(editor, at);
    }

    if (mode === 'descendants') {
      const nodeEntries = Node.descendants(root[0], {
        reverse,
        from,
        to,
        pass: ([n]) => (voids ? false : Editor.isVoid(editor, n)),
      });

      for (const [node, path] of nodeEntries) {
        if (match(node as any)) {
          return [node as any, (at as Path).concat(path)];
        }
      }
    } else if (mode === 'nodes') {
      const nodeEntries = Node.nodes(root[0], {
        reverse,
        from,
        to,
        pass: ([n]) => (voids ? false : Editor.isVoid(editor, n)),
      });

      for (const [node, path] of nodeEntries) {
        if (match(node as any)) {
          return [node as any, path];
        }
      }
    }
  } catch (error) {
    return undefined;
  }
};
