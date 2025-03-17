import type { Editor, ValueOf } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';

import {
  type DescendantOf,
  type EditorNodesOptions,
  ElementApi,
  NodeApi,
  PathApi,
  SpanApi,
  TextApi,
} from '../../interfaces';
import { getAt } from '../../utils';
import { getMatch, getQueryOptions } from '../../utils/match';

export function* nodes<N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  options: EditorNodesOptions<ValueOf<E>> = {}
): Generator<NodeEntry<N>, void, undefined> {
  options = getQueryOptions(editor, options);

  // if (options?.at) {
  //   editor.api.unhangRange(options.at as any, options);
  // }

  const {
    ignoreNonSelectable = false,
    mode = 'all',
    reverse = false,
    universal = false,
    voids = false,
  } = options;
  const at = getAt(editor, options.at) ?? editor.selection;
  let match = getMatch(editor, options);

  if (!match) {
    match = () => true;
  }
  if (!at) {
    return;
  }

  let from;
  let to;

  if (SpanApi.isSpan(at)) {
    from = at[0];
    to = at[1];
  } else {
    const first = editor.api.path(at, { edge: 'start' });
    const last = editor.api.path(at, { edge: 'end' });
    from = reverse ? last : first;
    to = reverse ? first : last;

    // FORK: return early if no path is found
    if (!first || !last) {
      return;
    }
  }

  const nodeEntries = NodeApi.nodes(editor, {
    from,
    reverse,
    to,
    pass: ([node]) => {
      if (!ElementApi.isElement(node)) return false;
      if (
        !voids &&
        (editor.api.isVoid(node) || editor.api.isElementReadOnly(node))
      ) {
        return true;
      }
      if (ignoreNonSelectable && !editor.api.isSelectable(node)) {
        return true;
      }

      return false;
    },
  });

  const matches: NodeEntry<N>[] = [];
  let hit: NodeEntry<N> | undefined;

  for (const [node, path] of nodeEntries) {
    if (
      ignoreNonSelectable &&
      ElementApi.isElement(node) &&
      !editor.api.isSelectable(node)
    ) {
      continue;
    }

    const isLower = hit && PathApi.compare(path, hit[1]) === 0;

    // In highest mode any node lower than the last hit is not a match.
    if (mode === 'highest' && isLower) {
      continue;
    }
    if (!match(node, path)) {
      // If we've arrived at a leaf text node that is not lower than the last
      // hit, then we've found a branch that doesn't include a match, which
      // means the match is not universal.
      if (universal && !isLower && TextApi.isText(node)) {
        return;
      } else {
        continue;
      }
    }
    // If there's a match and it's lower than the last, update the hit.
    if (mode === 'lowest' && isLower) {
      hit = [node, path] as NodeEntry<N>;

      continue;
    }

    // In lowest mode we emit the last hit, once it's guaranteed lowest.
    const emit: NodeEntry<N> | undefined =
      mode === 'lowest' ? hit : ([node, path] as NodeEntry<N>);

    if (emit) {
      if (universal) {
        matches.push(emit);
      } else {
        yield emit;
      }
    }

    hit = [node, path] as NodeEntry<N>;
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
    yield* matches;
  }
}
