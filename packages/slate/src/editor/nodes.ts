import { Editor, type EditorNodesOptions } from '../interfaces/editor';
import { LocationApi } from '../interfaces/location';
import { type Node, NodeApi, type NodeEntry } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';

export function* nodes<T extends Node>(
  editor: Editor,
  options: EditorNodesOptions<T> = {}
): Generator<NodeEntry<T>, void, undefined> {
  const {
    at = Editor.getSnapshot(editor).selection,
    mode = 'all',
    universal = false,
    reverse = false,
    voids = false,
    pass,
  } = options;
  let { match } = options;

  if (!match) {
    match = () => true;
  }

  if (!at) {
    return;
  }

  let from: Path;
  let to: Path;

  if (LocationApi.isSpan(at)) {
    const [first, last] = at;
    from = PathApi.isBefore(last, first) ? last : first;
    to = PathApi.isBefore(last, first) ? first : last;
  } else {
    const first = Editor.path(editor, at, { edge: 'start' });
    const last = Editor.path(editor, at, { edge: 'end' });
    from = first;
    to = last;
  }

  const nodeEntries = NodeApi.nodes(editor, {
    from,
    to,
    pass: ([node, path]) => {
      if (pass?.([node, path])) return true;
      if (!NodeApi.isElement(node)) return false;
      if (
        !voids &&
        (Editor.isVoid(editor, node) || Editor.isElementReadOnly(editor, node))
      )
        return true;

      return false;
    },
  });

  const matches: NodeEntry<T>[] = [];
  const shouldBuffer = reverse || universal;
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
      hit = [node, path] as NodeEntry<T>;
      continue;
    }

    // In lowest mode we emit the last hit, once it's guaranteed lowest.
    const emit: NodeEntry<T> | undefined =
      mode === 'lowest' ? hit : ([node, path] as NodeEntry<T>);

    if (emit) {
      if (shouldBuffer) {
        matches.push(emit);
      } else {
        yield emit;
      }
    }

    hit = [node, path] as NodeEntry<T>;
  }

  // Since lowest is always emitting one behind, catch up at the end.
  if (mode === 'lowest' && hit) {
    if (shouldBuffer) {
      matches.push(hit);
    } else {
      yield hit;
    }
  }

  // Universal defers to ensure that the match occurs in every branch, so we
  // yield all of the matches after iterating.
  if (shouldBuffer) {
    yield* reverse ? matches.reverse() : matches;
  }
}
