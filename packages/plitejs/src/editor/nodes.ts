import type {
  AnyEditor as Editor,
  EditorNodesOptions,
  NodeForTypeSelector,
} from '../interfaces/editor';
import {
  getChildren as editorGetChildren,
  getSnapshot as editorGetSnapshot,
  isElementReadOnly as editorIsElementReadOnly,
  isVoid as editorIsVoid,
  path as editorPath,
} from '../interfaces/editor';
import { LocationApi } from '../interfaces/location';
import {
  type Descendant,
  type Node,
  NodeApi,
  type NodeEntry,
  type NodeTypeSelector,
} from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { SelectionApi } from '../interfaces/selection';
import { normalizeNodeMatch } from '../utils/node-match';

export function nodes<T extends Node>(
  editor: Editor,
  options: EditorNodesOptions<Node> & {
    match: (node: Node, path: Path) => node is T;
    type?: undefined;
  }
): Generator<NodeEntry<T>, void, undefined>;
export function nodes<const TType extends NodeTypeSelector>(
  editor: Editor,
  options: EditorNodesOptions<NodeForTypeSelector<TType>, TType> & {
    type: TType;
  }
): Generator<NodeEntry<NodeForTypeSelector<TType>>, void, undefined>;
export function nodes(
  editor: Editor,
  options?: EditorNodesOptions<Node>
): Generator<NodeEntry, void, undefined>;
export function* nodes<T extends Node>(
  editor: Editor,
  options: EditorNodesOptions<T> = {}
): Generator<NodeEntry<T>, void, undefined> {
  const {
    at = editorGetSnapshot(editor).selection,
    mode = 'all',
    universal = false,
    reverse = false,
    voids = false,
    pass,
  } = options;
  const match = normalizeNodeMatch(options.type, options.match) ?? (() => true);

  if (!at) {
    return;
  }

  if (SelectionApi.isNode(at)) {
    const paths = reverse ? at.paths.toReversed() : at.paths;

    if (options.match !== undefined || options.type !== undefined) {
      for (const path of paths) {
        yield* nodes(editor, {
          ...options,
          at: path,
        } as EditorNodesOptions<Node>) as Generator<
          NodeEntry<T>,
          void,
          undefined
        >;
      }
      return;
    }
    const entries = paths.flatMap((path) => {
      const node = NodeApi.getIf(editor, path);

      return node && match(node, path)
        ? ([[node, path]] as unknown as Array<NodeEntry<T>>)
        : [];
    });

    if (universal && entries.length !== paths.length) return;
    yield* entries;
    return;
  }

  let from: Path;
  let to: Path;

  if (LocationApi.isSpan(at)) {
    const [first, last] = at;
    from = PathApi.isBefore(last, first) ? last : first;
    to = PathApi.isBefore(last, first) ? first : last;
  } else {
    const first = editorPath(editor, at, { edge: 'start' });
    const last = editorPath(editor, at, { edge: 'end' });
    from = first;
    to = last;
  }

  const descend = ([node, path]: NodeEntry) => {
    if (pass?.([node, path])) return false;
    if (!NodeApi.isElement(node)) return true;

    return (
      voids ||
      (!editorIsVoid(editor, node) && !editorIsElementReadOnly(editor, node))
    );
  };

  if (reverse && !universal) {
    yield* matchBackward<T>(
      [editor, []],
      editorGetChildren(editor),
      { from, match, mode, to },
      descend
    );
    return;
  }

  const nodeEntries = NodeApi.nodes(editor, {
    from,
    to,
    pass: (entry) => !descend(entry),
  });

  const matches: Array<NodeEntry<T>> = [];
  let hit: NodeEntry<T> | undefined;

  for (const [node, path] of nodeEntries) {
    const isLower = hit && PathApi.compare(path, hit[1]) === 0;

    // In highest mode any node lower than the last hit is not a match.
    if (mode === 'highest' && isLower) {
      continue;
    }

    if (!match(node, path)) {
      // If we've arrived at a leaf text node that is not lower than the last
      // hit, then we've found a branch that doesn't include a match, which
      // means the match is not universal.
      if (universal && !isLower && NodeApi.isText(node)) {
        return;
      }
      continue;
    }

    // If there's a match and it's lower than the last, update the hit.
    if (mode === 'lowest' && isLower) {
      hit = [node, path] as unknown as NodeEntry<T>;
      continue;
    }

    // In lowest mode we emit the last hit, once it's guaranteed lowest.
    const emit: NodeEntry<T> | undefined =
      mode === 'lowest' ? hit : ([node, path] as unknown as NodeEntry<T>);

    if (emit) {
      if (universal) {
        matches.push(emit);
      } else {
        yield emit;
      }
    }

    hit = [node, path] as unknown as NodeEntry<T>;
  }

  // Since lowest is always emitting one behind, catch up at the end.
  if (mode === 'lowest' && hit) {
    if (universal) {
      matches.push(hit);
    } else {
      yield hit;
    }
  }

  // Universal defers to ensure that the match occurs in every branch, so we
  // yield all of the matches after iterating.
  if (universal) {
    yield* reverse ? matches.reverse() : matches;
  }
}

// Yields the matches in the exact reverse of the forward walk, starting at
// `to`, so a reverse read stops at its first match instead of collecting every
// match from the document start.
function* matchBackward<T extends Node>(
  [node, path]: NodeEntry,
  children: readonly Descendant[] | null,
  search: Readonly<{
    from: Path;
    match: (node: Node, path: Path) => boolean;
    mode: 'all' | 'highest' | 'lowest';
    to: Path;
  }>,
  descend: (entry: NodeEntry) => boolean
): Generator<NodeEntry<T>, boolean, undefined> {
  const { from, match, mode, to } = search;

  if (mode === 'highest' && match(node, path)) {
    yield [node, path] as unknown as NodeEntry<T>;

    return true;
  }

  let below = false;

  if (children && children.length > 0 && descend([node, path])) {
    const first = PathApi.isAncestor(path, from) ? from[path.length] : 0;
    const last = PathApi.isAncestor(path, to)
      ? Math.min(to[path.length], children.length - 1)
      : children.length - 1;

    for (let index = last; index >= first; index--) {
      const child = children[index];
      const matched = yield* matchBackward<T>(
        [child, path.concat(index)],
        NodeApi.isText(child) ? null : child.children,
        search,
        descend
      );

      below ||= matched;
    }
  }

  if (mode === 'highest') return false;

  const matched = match(node, path);

  if (matched && (mode === 'all' || !below)) {
    yield [node, path] as unknown as NodeEntry<T>;
  }

  return matched || below;
}
