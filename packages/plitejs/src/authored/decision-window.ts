import { valueRootNodes } from '../core/change/document-change';
import type { JsonEditorValue, JsonNode } from '../core/change/tokens';
import type { Occurrence } from './changes';
import type { AuthoredWindow } from './tree/resolve';

export type SpareGuard = Readonly<{
  builds: (type: string | null, root: string) => boolean;
  stored: boolean;
}>;

const ownsRoot = (node: JsonNode): boolean =>
  Object.hasOwn(node, 'childRoots') || (node.children ?? []).some(ownsRoot);

const BOUNDARY_KINDS = new Set(['join', 'joined', 'split']);

const startsAtBoundary = (node: JsonNode | undefined): boolean =>
  !!node &&
  ((node.authored as ReadonlyArray<{ kind: string }> | undefined)?.some(
    ({ kind }) => BOUNDARY_KINDS.has(kind)
  ) ||
    startsAtBoundary(node.children?.[0]));

const holdsSpares = (
  node: JsonNode,
  root: string,
  spares: SpareGuard
): boolean =>
  (node.authored as ReadonlyArray<{ kind: string }> | undefined)?.some(
    ({ kind }) => kind === 'reserve' || kind === 'as'
  ) ||
  (typeof node.type === 'string' && spares.builds(node.type, root)) ||
  (node.children ?? []).some((child) => holdsSpares(child, root, spares));

export const decisionWindowsOf = (
  value: JsonEditorValue,
  ids: Iterable<string>,
  occurrencesOf: (id: string) => readonly Occurrence[],
  spares: SpareGuard | null
): AuthoredWindow[] | null => {
  if (spares?.stored) return null;

  const spans = new Map<string, [number, number]>();

  for (const id of ids) {
    for (const { mark, path, root } of occurrencesOf(id)) {
      if (path.length < 2 && mark.kind !== 'format') return null;

      const span = spans.get(root);

      if (span) {
        span[0] = Math.min(span[0], path[0]);
        span[1] = Math.max(span[1], path[0] + 1);
      } else {
        spans.set(root, [path[0], path[0] + 1]);
      }
    }
  }
  if (spans.size === 0) return null;

  const windows: AuthoredWindow[] = [];

  for (const [root, [from, to]] of spans) {
    const nodes = valueRootNodes(value, root);

    if (spares?.builds(null, root)) return null;
    if (startsAtBoundary(nodes.at(from)) || startsAtBoundary(nodes.at(to))) {
      return null;
    }
    for (let at = from; at < to; at += 1) {
      const block = nodes.at(at);

      if (!block || ownsRoot(block)) return null;
      if (spares && holdsSpares(block, root, spares)) return null;
    }
    windows.push({ from, root, to });
  }

  return windows;
};
