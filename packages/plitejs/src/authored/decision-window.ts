import { valueRootNodes } from '../core/change/document-change';
import type { JsonEditorValue, JsonNode } from '../core/change/tokens';
import type { Occurrence } from './changes';
import { isKeyedSplit, readMembers } from './tree/marks';
import type { AuthoredWindow } from './tree/resolve';

export type SpareGuard = Readonly<{
  nodeBuildsGenerated: (node: JsonNode) => boolean;
  stored: boolean;
  windowBuildsGenerated: (window: AuthoredWindow) => boolean;
}>;

const ownsRoot = (node: JsonNode): boolean =>
  Object.hasOwn(node, 'childRoots') || (node.children ?? []).some(ownsRoot);

const BOUNDARY_KINDS = new Set(['join', 'joined', 'split']);

const startsAtBoundary = (node: JsonNode | undefined): boolean =>
  !!node &&
  (readMembers(node).some(({ kind }) => BOUNDARY_KINDS.has(kind)) ||
    startsAtBoundary(node.children?.[0]));

const holdsSpares = (node: JsonNode, spares: SpareGuard): boolean =>
  readMembers(node).some(({ kind }) => kind === 'reserve' || kind === 'as') ||
  spares.nodeBuildsGenerated(node) ||
  (node.children ?? []).some((child) => holdsSpares(child, spares));

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
      // A keyed split names the line it left, which may sit in another block.
      if (isKeyedSplit(mark)) return null;

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
    const window = { from, root, to };

    if (spares?.windowBuildsGenerated(window)) {
      return null;
    }
    if (startsAtBoundary(nodes.at(from)) || startsAtBoundary(nodes.at(to))) {
      return null;
    }
    for (let at = from; at < to; at += 1) {
      const block = nodes.at(at);

      if (!block || ownsRoot(block)) return null;
      if (spares && holdsSpares(block, spares)) return null;
    }
    windows.push(window);
  }

  return windows;
};
